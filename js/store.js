// store.js — localStorage 数据层（本机持久化，无后端）
(function (global) {
  'use strict';

  var KEYS = {
    settings: 'keto_web_settings',
    meals: 'keto_web_meals',
    weights: 'keto_web_weights',
    fav: 'keto_web_fav',
    customFoods: 'keto_web_custom_foods',      // M1 自定义/手填食物库
    kidsProfile: 'keto_web_kids_profile',       // P1-0 青少年(被监护)档案
    kidsGrowth: 'keto_web_kids_growth',         // P1-0 青少年身高/体重/儿童BMI百分位历史
    members: 'keto_web_members',                // 家庭成员档案（爸爸/妈妈/逸凡），界面不展示医学标记
    active: 'keto_web_active_member'            // 当前激活成员 id
  };

  // 成员数据按人隔离：同一份 key 加 _<id> 后缀，避免一家人互相覆盖
  function memberKey(base, id) { return base + '_' + (id || 'dad'); }

  function read(key, def) {
    try {
      var raw = global.localStorage.getItem(key);
      if (raw == null) return def;
      return JSON.parse(raw);
    } catch (e) { return def; }
  }
  function write(key, val) {
    try { global.localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { console.error('save fail', key, e); return false; }
  }

  function dateStr(d) {
    d = d || new Date();
    var m = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : '' + (d.getMonth() + 1);
    var day = d.getDate() < 10 ? '0' + d.getDate() : '' + d.getDate();
    return d.getFullYear() + '-' + m + '-' + day;
  }

  // 家庭成员体系：爸爸(主身份)/妈妈/逸凡。界面只显示称呼，内部 medical 标记不外露。
  // 首启动把现有单用户设置/餐食/体重迁移为「爸爸」成员，确保老用户数据不丢。
  function defaultMembers() {
    var leg = read(KEYS.settings, {}) || {};
    var ws = read(KEYS.weights, null);
    var lastW = (ws && ws.length) ? ws[ws.length - 1].weight : (leg.startWeight || 80);
    var dad = {
      id: 'dad', name: '爸爸', role: 'dad', sex: leg.gender || '男', birthYear: leg.birthYear || 1985,
      height: leg.height || 170, weight: lastW, startWeight: leg.startWeight || 80, targetWeight: leg.targetWeight || 65,
      dietMode: leg.dietMode || 'keto', activityLevel: leg.activityLevel || 'moderate', activityFactor: leg.activityFactor || 1.55,
      baseMetabolism: (leg.baseMetabolism != null) ? leg.baseMetabolism : null, avoid: leg.avoid || [], medical: {}, owner: true
    };
    var mom = {
      id: 'mom', name: '妈妈', role: 'mom', sex: '女', birthYear: 1990,
      height: 166, weight: 100, startWeight: 100, targetWeight: 75,
      dietMode: 'lowcarb', activityLevel: 'light', activityFactor: 1.375,
      baseMetabolism: null, avoid: [], medical: { hypo: true }, owner: false
    };
    var kid = {
      id: 'kid', name: '逸凡', role: 'kid', sex: '男', birthYear: 2014,
      height: 150, weight: 48, startWeight: 48, targetWeight: 45,
      dietMode: 'normal', activityLevel: 'moderate', activityFactor: 1.55,
      baseMetabolism: null, avoid: [], medical: {}, owner: false
    };
    return [dad, mom, kid];
  }
  function ensureMembers() {
    var ms = read(KEYS.members, null);
    if (ms && ms.length) return;
    ms = defaultMembers();
    write(KEYS.members, ms);
    if (!read(KEYS.active, null)) write(KEYS.active, 'dad');
    // 老用户数据迁移进「爸爸」命名空间（幂等）
    var leg = read(KEYS.settings, null);
    if (leg && Object.keys(leg).length) {
      var dadSettings = {};
      for (var k in leg) dadSettings[k] = leg[k];
      write(memberKey(KEYS.settings, 'dad'), dadSettings);
    }
    var legMeals = read(KEYS.meals, null);
    if (legMeals && Object.keys(legMeals).length) write(memberKey(KEYS.meals, 'dad'), legMeals);
    var legW = read(KEYS.weights, null);
    if (legW && legW.length) write(memberKey(KEYS.weights, 'dad'), legW);
  }

  var DEFAULT_SETTINGS = {
    gender: '男',
    height: 170,
    birthYear: 1985,
    activityLevel: 'moderate',   // 字符串，给 calcHealth
    activityFactor: 1.55,        // 数字系数，给 calcDinnerRecommendation
    startWeight: 80,
    targetWeight: 65,
    baseMetabolism: null,        // null 时由 calcHealth 推算
    dietMode: 'keto',           // keto | lowcarb | normal
    avoid: []                    // 我的忌口（过敏原）：['蛋','海鲜','奶','大豆','花生','坚果','麸质']
  };

  var Store = {
    KEYS: KEYS,
    dateStr: dateStr,

    // ---- 家庭成员（爸爸/妈妈/逸凡）----
    initMembers: function () { ensureMembers(); },
    getMembers: function () { ensureMembers(); return read(KEYS.members, []); },
    getActiveMemberId: function () { ensureMembers(); return read(KEYS.active, 'dad'); },
    setActiveMemberId: function (id) { write(KEYS.active, id); },
    getActiveMember: function () {
      var id = Store.getActiveMemberId(), ms = Store.getMembers();
      for (var i = 0; i < ms.length; i++) if (ms[i].id === id) return ms[i];
      return ms[0] || null;
    },
    updateMember: function (m) {
      var ms = Store.getMembers();
      for (var i = 0; i < ms.length; i++) { if (ms[i].id === m.id) { ms[i] = m; break; } }
      write(KEYS.members, ms);
    },
    // 保存当前激活成员的非餐食类档案字段（身高/体重/目标等）
    saveActiveMemberProfile: function (patch) {
      var m = Store.getActiveMember(); if (!m) return;
      for (var k in patch) m[k] = patch[k];
      Store.updateMember(m);
    },

    getSettings: function () {
      var id = Store.getActiveMemberId();
      var s = read(memberKey(KEYS.settings, id), null) || {};
      var merged = {};
      for (var k in DEFAULT_SETTINGS) merged[k] = DEFAULT_SETTINGS[k];
      for (var k2 in s) merged[k2] = s[k2];
      return merged;
    },
    saveSettings: function (s) { return write(memberKey(KEYS.settings, Store.getActiveMemberId()), s); },

    getMeals: function (date) {
      var all = read(memberKey(KEYS.meals, Store.getActiveMemberId()), {}) || {};
      return all[date] || null;
    },
    saveMeals: function (date, data) {
      var all = read(memberKey(KEYS.meals, Store.getActiveMemberId()), {}) || {};
      all[date] = data;
      return write(memberKey(KEYS.meals, Store.getActiveMemberId()), all);
    },
    getAllMeals: function () { return read(memberKey(KEYS.meals, Store.getActiveMemberId()), {}) || {}; },
    saveAllMeals: function (all) { return write(memberKey(KEYS.meals, Store.getActiveMemberId()), all); },
    deleteMealItem: function (date, slot, idx) {
      var m = Store.getMeals(date);
      if (!m || !m[slot] || !m[slot][idx]) return false;
      m[slot].splice(idx, 1);
      return Store.saveMeals(date, m);
    },

    getWeights: function () { return read(memberKey(KEYS.weights, Store.getActiveMemberId()), []); },
    addWeight: function (w) {
      var arr = Store.getWeights();
      // 同日 upsert：不重复存，覆盖即更新（避免 P0 痛点「同日重复体重」）
      var idx = -1;
      for (var i = 0; i < arr.length; i++) { if (arr[i].date === w.date) { idx = i; break; } }
      if (idx >= 0) arr[idx] = w;
      else {
        arr.push(w);
        arr.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
      }
      return write(memberKey(KEYS.weights, Store.getActiveMemberId()), arr);
    },
    deleteWeight: function (d) {
      var arr = Store.getWeights().filter(function (w) { return w.date !== d; });
      return write(memberKey(KEYS.weights, Store.getActiveMemberId()), arr);
    },

    getFav: function () { return read(KEYS.fav, []); },
    isFav: function (name) { return Store.getFav().indexOf(name) >= 0; },
    toggleFav: function (name) {
      var arr = Store.getFav();
      var i = arr.indexOf(name);
      if (i >= 0) arr.splice(i, 1); else arr.push(name);
      return write(KEYS.fav, arr);
    },

    // ---- M1 自定义/手填食物库（库外食物不再硬拒）----
    getCustomFoods: function () { return read(KEYS.customFoods, {}) || {}; },
    getCustomFood: function (name) {
      var db = Store.getCustomFoods();
      return db[name] || null;
    },
    addCustomFood: function (food) {
      if (!food || !food.name) return false;
      var db = Store.getCustomFoods();
      db[food.name] = food;
      return write(KEYS.customFoods, db);
    },
    // 自定义食物匹配（仅在未命中 FOOD_DB/别名时调用）
    matchFoodAny: function (name) {
      if (Bridge && Bridge.KetoCore && Bridge.KetoCore.FOOD_DB[name]) return { kind: 'preset', name: name };
      var cf = Store.getCustomFood(name);
      if (cf) return { kind: 'custom', name: name, food: cf };
      // 别名
      var fa = (Bridge && Bridge.KetoCore && Bridge.KetoCore.FOOD_ALIASES && Bridge.KetoCore.FOOD_ALIASES[name]) || null;
      if (fa && Bridge.KetoCore.FOOD_DB[fa]) return { kind: 'preset', name: fa };
      return null;
    },

    // ---- P1-0 青少年(被监护)成员档案与生长数据 ----
    // profile: { name, sex('男'/'女'), birthYear, height, weight, sport('篮球'...), trainPerWeek, goal }
    getKidsProfile: function () { return read(KEYS.kidsProfile, null); },
    saveKidsProfile: function (p) { return write(KEYS.kidsProfile, p); },
    // growth: { date, height, weight } —— 同日 upsert（覆盖不新增）
    getKidsGrowth: function () { return read(KEYS.kidsGrowth, []) || []; },
    addKidsGrowth: function (rec) {
      var arr = Store.getKidsGrowth();
      var idx = -1;
      for (var i = 0; i < arr.length; i++) { if (arr[i].date === rec.date) { idx = i; break; } }
      if (idx >= 0) arr[idx] = rec; else { arr.push(rec); arr.sort(function (a, b) { return a.date < b.date ? -1 : 1; }); }
      return write(KEYS.kidsGrowth, arr);
    },
    deleteKidsGrowth: function (d) {
      var arr = Store.getKidsGrowth().filter(function (r) { return r.date !== d; });
      return write(KEYS.kidsGrowth, arr);
    },

    // ---- 数据模型统一：从 task4 轻量版旧 key 迁移到 keto_web_*（幂等，仅首次）----
    // task4 模型：keto_records{date:{foods:[{name,calories,carb,protein,fat}]}} / keto_profile{gender,height,weight,birthYear,activityLevel,bmr}
    // 02-app 模型：keto_web_meals{date:{dietMode,breakfast[],lunch[],dinner[],exercises[],steps}} / keto_web_settings{...}
    migrateFromLegacy: function () {
      var LEGACY_REC = 'keto_records';
      var LEGACY_PROF = 'keto_profile';
      var FLAG = '_keto_migrated_v1';
      if (read(FLAG, false)) return { migrated: false, reason: 'already-done' };
      var legacyRec = read(LEGACY_REC, null);
      var legacyProf = read(LEGACY_PROF, null);
      if (!legacyRec && !legacyProf) { write(FLAG, true); return { migrated: false, reason: 'no-legacy-data' }; }

      // 1) 设置：profile → settings
      var s = Store.getSettings();
      if (legacyProf) {
        if (legacyProf.gender) s.gender = legacyProf.gender;
        if (legacyProf.height) s.height = legacyProf.height;
        if (legacyProf.birthYear) s.birthYear = legacyProf.birthYear;
        if (legacyProf.activityLevel) s.activityLevel = legacyProf.activityLevel;
        if (legacyProf.weight) s.startWeight = legacyProf.weight;
        if (legacyProf.bmr) s.baseMetabolism = legacyProf.bmr;
        Store.saveSettings(s);
      }

      // 2) 餐食：records[date].foods → meals[date].breakfast（task4 不分早午晚，统一入早餐槽，宏量保留）
      if (legacyRec) {
        var all = Store.getAllMeals();
        for (var date in legacyRec) {
          if (!legacyRec.hasOwnProperty(date)) continue;
          if (all[date]) continue; // 目标日已有数据则不覆盖
          var rec = legacyRec[date] || {};
          var foods = rec.foods || [];
          var items = foods.map(function (f) {
            return {
              name: f.name,
              amount: (f.amount != null) ? f.amount : 0,
              unit: f.unit || 'g',
              calories: f.calories, carb: f.carb, protein: f.protein, fat: f.fat
            };
          });
          all[date] = { dietMode: s.dietMode, breakfast: items, lunch: [], dinner: [], exercises: [], steps: 0 };
        }
        write(KEYS.meals, all);
      }

      write(FLAG, true);
      return { migrated: true, days: legacyRec ? Object.keys(legacyRec).length : 0 };
    }
  };

  global.Store = Store;
  if (typeof module !== 'undefined' && module.exports) module.exports = Store;
})(typeof window !== 'undefined' ? window : globalThis);
