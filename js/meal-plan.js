// meal-plan.js — 一周膳食计划生成器（基于 TDEE/缺口/忌口/季节，按早午晚分配热量）
// 入口：食谱页「📅 一周膳食计划」按钮 → App.mealPlan.open()
(function (global) {
  'use strict';

  function dateAdd(d, n) {
    var x = new Date(d.getTime());
    x.setDate(x.getDate() + n);
    var m = (x.getMonth() + 1) < 10 ? '0' + (x.getMonth() + 1) : '' + (x.getMonth() + 1);
    var day = x.getDate() < 10 ? '0' + x.getDate() : '' + x.getDate();
    var wk = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][x.getDay()];
    return { ymd: x.getFullYear() + '-' + m + '-' + day, label: wk };
  }

  // 生成 7 天计划
  function genPlan() {
    var s = Store.getSettings();
    var t = Bridge.getTargets(s);
    var budget = t.budget; // TDEE - 缺口
    var mode = s.dietMode;
    var all = (Bridge.KetoCore.DISH_DB[mode] || []).slice();
    // 过滤：热量合理 + 避开忌口
    var pool = all.filter(function (d) {
      if (d.cal < 60 || d.cal > 330) return false;
      var al = Bridge.KetoCore.dishAllergens(d.name);
      if (s.avoid && s.avoid.length) {
        for (var i = 0; i < al.length; i++) if (s.avoid.indexOf(al[i]) >= 0) return false;
      }
      return true;
    });
    if (pool.length < 9) pool = all.slice(); // 兜底：过滤太狠就放开

    var slots = [
      { name: '早餐', ratio: 0.25 },
      { name: '午餐', ratio: 0.40 },
      { name: '晚餐', ratio: 0.35 }
    ];
    var recent = {}; // name -> 上次出现的天序号
    var days = [];
    var today = new Date();
    for (var day = 0; day < 7; day++) {
      var dObj = { idx: day, date: dateAdd(today, day), slots: [] };
      var used = {};
      slots.forEach(function (slot) {
        var target = Math.round(budget * slot.ratio);
        var best = null, bestDiff = 1e9;
        pool.forEach(function (d) {
          if (used[d.name]) return;
          if (recent[d.name] != null && day - recent[d.name] < 2) return; // 2 天内不重复
          var diff = Math.abs(d.cal - target);
          if (diff < bestDiff) { bestDiff = diff; best = d; }
        });
        if (!best) { // 放宽：仅去重
          pool.forEach(function (d) {
            if (used[d.name]) return;
            var diff = Math.abs(d.cal - target);
            if (diff < bestDiff) { bestDiff = diff; best = d; }
          });
        }
        if (best) { used[best.name] = 1; recent[best.name] = day; dObj.slots.push({ slot: slot.name, dish: best }); }
      });
      days.push(dObj);
    }
    return { days: days, budget: budget, tdee: t.tdee, mode: mode };
  }

  function open() {
    var plan = genPlan();
    var slotKey = { '早餐': 'breakfast', '午餐': 'lunch', '晚餐': 'dinner' };
    var dayCards = plan.days.map(function (d) {
      var rows = d.slots.map(function (sl) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px dashed #eee">' +
          '<span style="font-size:12px;color:var(--muted);width:42px">' + sl.slot + '</span>' +
          '<span style="flex:1;font-size:14px;margin:0 8px">' + sl.dish.name + '</span>' +
          '<span style="font-size:12px;color:var(--green-d)">' + sl.dish.cal + 'kcal</span>' +
          '<button class="btn sm ghost" data-mp="' + sl.dish.name + '" data-slot="' + slotKey[sl.slot] + '" style="margin:0 0 0 8px;padding:4px 8px">加入</button></div>';
      }).join('');
      return '<div style="border:1px solid #eee;border-radius:12px;padding:10px;margin-bottom:10px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center"><strong>' + d.date.label + ' · ' + d.date.ymd.slice(5) + '</strong></div>' +
        rows + '</div>';
    }).join('');

    var avoidNote = (Store.getSettings().avoid && Store.getSettings().avoid.length)
      ? '已按您的忌口（' + Store.getSettings().avoid.join('/') + '）自动避开相关菜品。'
      : '未设置忌口，可在「我的 → 个人设置 → 我的忌口」中开启过敏原规避。';

    var html = '<h3 style="margin-top:0">📅 一周膳食计划</h3>' +
      '<p class="meta" style="font-size:12px;color:var(--muted)">基于您的 TDEE ' + plan.tdee + 'kcal、每日预算 ' + plan.budget + 'kcal（' + ({ keto: '生酮', lowcarb: '低碳', normal: '正常' }[plan.mode]) + '模式）自动生成。' + avoidNote + '</p>' +
      dayCards +
      '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">' +
      '<button class="btn ghost sm" id="mpRefresh">重新生成</button>' +
      '<button class="btn sm" id="mpShop">🛒 生成采购清单</button></div>';
    App.openModal(html);

    var modal = document.getElementById('app-modal');
    if (!modal) return;
    function bindBtns() {
      modal.querySelectorAll('[data-mp]').forEach(function (b) {
        b.addEventListener('click', function () {
          var name = b.getAttribute('data-mp');
          var slot = b.getAttribute('data-slot');
          var item = Bridge.dishToMealItem(name);
          if (!item) { App.toast('暂无该菜营养数据'); return; }
          var m = Store.getMeals(Store.dateStr()) || { dietMode: Store.getSettings().dietMode, breakfast: [], lunch: [], dinner: [], exercises: [], steps: 0 };
          if (!m[slot]) m[slot] = [];
          m[slot].push(item);
          Store.saveMeals(Store.dateStr(), m);
          if (global.App && App.family) App.family.syncIfJoined();
          App.toast('已加入今日：' + name);
        });
      });
    }
    bindBtns();
    var rf = modal.querySelector('#mpRefresh');
    if (rf) rf.addEventListener('click', function () { App.closeModal(); open(); });
    var shop = modal.querySelector('#mpShop');
    if (shop) shop.addEventListener('click', function () { openShopping(plan); });
  }

  // 采购清单：聚合本周计划所有菜的食材（按原方 2 人份基准汇总），可打钩
  function openShopping(plan) {
    var map = {};
    plan.days.forEach(function (d) {
      d.slots.forEach(function (sl) {
        var det = Bridge.getDishDetail(sl.dish.name);
        if (!det || !det.ingredients) return;
        det.ingredients.forEach(function (i) {
          var key = i.name + '|' + i.unit;
          if (!map[key]) map[key] = { name: i.name, unit: i.unit, weight: 0 };
          map[key].weight += i.weight;
        });
      });
    });
    var keys = Object.keys(map);
    if (!keys.length) { App.toast('暂无可汇总食材'); return; }
    var rows = keys.map(function (k, i) {
      var it = map[k];
      var w = (it.unit === 'g' || it.unit === 'ml') ? Math.round(it.weight / 100) * 100 : it.weight;
      return '<label style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px dashed #eee;font-size:14px">' +
        '<input type="checkbox" class="shopchk" data-i="' + i + '" style="width:18px;height:18px">' +
        '<span style="flex:1">' + it.name + '</span>' +
        '<b style="color:var(--accent)">约 ' + w + it.unit + '</b></label>';
    }).join('');
    var html = '<h3 style="margin-top:0">🛒 本周采购清单</h3>' +
      '<p class="meta" style="font-size:12px;color:var(--muted);margin:0 0 8px">按本周计划汇总（原方 2 人份基准）。实际按家庭人数换算：总量 ÷ 2 × 人数。</p>' +
      '<div style="max-height:60vh;overflow:auto">' + rows + '</div>' +
      '<button class="btn sm" id="shopAll" style="margin-top:10px">全选已买</button>';
    App.openModal(html);
    var m2 = document.getElementById('app-modal');
    if (!m2) return;
    m2.querySelectorAll('.shopchk').forEach(function (c) {
      c.addEventListener('change', function () {
        c.parentNode.style.opacity = c.checked ? .45 : 1;
        c.parentNode.style.textDecoration = c.checked ? 'line-through' : 'none';
      });
    });
    var sa = m2.querySelector('#shopAll');
    if (sa) sa.addEventListener('click', function () {
      m2.querySelectorAll('.shopchk').forEach(function (c) { c.checked = true; c.parentNode.style.opacity = .45; c.parentNode.style.textDecoration = 'line-through'; });
    });
  }

  global.App.mealPlan = { open: open, genPlan: genPlan };
})(typeof window !== 'undefined' ? window : globalThis);
