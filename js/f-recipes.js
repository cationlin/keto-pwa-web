// f-recipes.js — 模块F 食谱页（分类/搜索/详情/收藏 + 动作示范图位）
(function (global) {
  'use strict';

  function dishesForMode() {
    var s = Store.getSettings();
    return (Bridge.KetoCore.DISH_DB[s.dietMode] || Bridge.KetoCore.DISH_DB.normal) || [];
  }

  function emojiFor(name) {
    if (/鸡|鸭|鸽/.test(name)) return '🍗';
    if (/鱼|虾|蟹|海鲜|鱿|贝/.test(name)) return '🐟';
    if (/牛|羊|猪|肉/.test(name)) return '🥩';
    if (/蛋/.test(name)) return '🥚';
    if (/豆腐|豆/.test(name)) return '🫘';
    if (/西兰花|菠|芹|瓜|萝卜|笋|菌|菇|葱|蒜|椒|菜/.test(name)) return '🥦';
    if (/汤/.test(name)) return '🍲';
    if (/粥|饭|面|粉/.test(name)) return '🍚';
    return '🍽️';
  }
  function imgTag(name, cls) {
    var map = global.RECIPE_IMGS || {};
    if (map[name]) return '<img class="' + (cls || 'thumb') + '" src="' + map[name] + '" alt="' + name + '">';
    return '<div class="' + (cls || 'img-slot') + '" style="font-size:30px">' + emojiFor(name) + '</div>';
  }

  function categories(list) {
    var set = {};
    list.forEach(function (d) { (d.tags || []).forEach(function (t) { set[t] = 1; }); });
    return ['全部'].concat(Object.keys(set));
  }

  // 家庭适配：含主食/淀粉的菜仅妈妈+逸凡能吃；其余全家都能吃（爸爸生酮也能吃肉菜）
  function dishFit(d) {
    var starchy = /粥|饭|面|粉|主食|土豆|红薯|南瓜|米饭|面条|馒头|年糕/.test((d.tags || []).join(','));
    return starchy ? ['妈妈', '逸凡'] : ['爸爸', '妈妈', '逸凡'];
  }

  function filtered(list, cat, kw) {
    return list.filter(function (d) {
      if (cat !== '全部' && (d.tags || []).indexOf(cat) < 0) return false;
      if (currentFamilyAll) {
        var f = dishFit(d);
        if (f.indexOf('爸爸') < 0 || f.indexOf('妈妈') < 0 || f.indexOf('逸凡') < 0) return false;
      }
      if (kw) {
        var detail = Bridge.dishDetail(d.name);
        var hay = d.name + (detail ? detail.ingredients.map(function (i) { return i.name; }).join('') : '');
        if (hay.indexOf(kw) < 0) return false;
      }
      return true;
    });
  }

  function render(el, cat, kw) {
    var list = dishesForMode();
    var cats = categories(list);
    var chips = cats.map(function (c) {
      return '<button class="btn sm ' + (cat === c ? '' : 'ghost') + '" data-act="cat" data-c="' + c + '" style="margin-top:0;margin-right:6px">' + c + '</button>';
    }).join('');
    var famChip = '<button class="btn sm ' + (currentFamilyAll ? '' : 'ghost') + '" data-act="famall" style="margin-top:0;margin-right:6px">👨‍👩‍👦 全家都能吃</button>';
    el.innerHTML =
      '<div class="card" style="display:flex;align-items:center;justify-content:space-between;gap:10px"><div><b>🍽️ 菜谱库</b><div class="meta" style="font-size:12px;color:var(--muted)">已收录 ' + list.length + ' 道 · 含西餐/东南亚/早餐</div></div>' +
      '<button class="btn sm" data-act="plan" style="margin:0;white-space:nowrap">' + ICONS.svg('calendar', 14) + ' 一周膳食计划</button></div>' +
      '<div class="card"><input id="rkw" placeholder="搜索菜名或食材，如 鲈鱼 / 西兰花" value="' + (kw || '') + '">' +
      '<div style="margin-top:10px;overflow-x:auto;white-space:nowrap">' + famChip + chips + '</div></div>' +
      '<div id="dishList">' + cardsHtml(cat, kw) + '</div>';
  }

  // 用户忌口冲突警示（return HTML 片段，无冲突返回空）
  function conflictHtml(name) {
    var s = Store.getSettings();
    if (!s.avoid || !s.avoid.length) return '';
    var al = (Bridge.KetoCore && Bridge.KetoCore.dishAllergens) ? Bridge.KetoCore.dishAllergens(name) : [];
    var hit = al.filter(function (a) { return s.avoid.indexOf(a) >= 0; });
    if (!hit.length) return '';
    return '<span class="tag" style="background:#fde8e8;color:#c0392b;border:1px solid #f5c6c6">⚠ 含' + hit.join('/') + '</span>';
  }

  function cardsHtml(cat, kw) {
    var list = dishesForMode();
    var show = filtered(list, cat, kw);
    var cards = show.map(function (d) {
      var fav = Store.isFav(d.name) ? '★' : '☆';
      var fit = dishFit(d);
      var fitTag = '<span class="tag" style="background:#eafaf1;color:#0e9f6e;border:1px solid #bfe9d2">' + fit.join('/') + '能吃</span>';
      return '<div class="dish" data-act="dish" data-name="' + d.name + '">' +
        imgTag(d.name, 'thumb') +
        '<div class="info"><div class="n">' + d.name + ' <span class="tag">' + (d.tags || []).join('/') + '</span> ' + conflictHtml(d.name) + '</div>' +
        '<div class="c">' + d.cal + 'kcal/100g · 碳' + d.carb + ' 蛋' + d.protein + ' 脂' + d.fat + '</div>' +
        '<div class="c" style="margin-top:2px">' + fitTag + '</div></div>' +
        '<button class="del" data-act="fav" data-name="' + d.name + '" style="color:var(--orange);font-size:18px">' + fav + '</button></div>';
    }).join('');
    return cards || '<div class="empty">没有匹配的菜</div>';
  }

  // 厨房模式：大字体分步、上一步/下一步、屏幕常亮（灶台边免操作手机）
  function openKitchen(name, steps) {
    if (!steps || !steps.length) { App.toast('暂无分步做法'); return; }
    var idx = 0;
    function paint() {
      var html = '<div style="padding:6px 4px">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">' +
        '<b style="font-size:16px">🍳 ' + name + '</b>' +
        '<span style="font-size:13px;color:var(--muted)">' + (idx + 1) + ' / ' + steps.length + '</span></div>' +
        '<div style="font-size:22px;line-height:1.7;font-weight:600;min-height:120px;display:flex;align-items:center">' + (idx + 1) + '. ' + steps[idx] + '</div>' +
        '<div style="display:flex;gap:10px;margin-top:14px">' +
        '<button class="btn ' + (idx === 0 ? 'ghost' : '') + '" id="kPrev" style="flex:1">上一步</button>' +
        (idx < steps.length - 1 ? '<button class="btn" id="kNext" style="flex:1">下一步</button>' : '<button class="btn" id="kDone" style="flex:1">完成 ✓</button>') +
        '</div></div>';
      App.openModal(html);
      var m = document.getElementById('app-modal');
      if (!m) return;
      var prev = m.querySelector('#kPrev'), next = m.querySelector('#kNext'), done = m.querySelector('#kDone');
      if (prev) prev.onclick = function () { if (idx > 0) { idx--; paint(); } };
      if (next) next.onclick = function () { if (idx < steps.length - 1) { idx++; paint(); } };
      if (done) done.onclick = function () { App.closeModal(); App.toast('做菜完成 🎉'); };
      // 屏幕常亮（支持的设备）
      try { if (navigator.wakeLock) { navigator.wakeLock.request('screen').catch(function () {}); } } catch (e) {}
    }
    paint();
  }

  function showDish(name, el) {
    var d = Bridge.dishDetail(name);
    var fav = Store.isFav(name);
    var head = imgTag(name, 'dish-detail');
    // 过敏原 + 忌口冲突
    var al = (Bridge.KetoCore && Bridge.KetoCore.dishAllergens) ? Bridge.KetoCore.dishAllergens(name) : [];
    var s = Store.getSettings();
    var hit = (s.avoid && s.avoid.length) ? al.filter(function (a) { return s.avoid.indexOf(a) >= 0; }) : [];
    var allergenLine = al.length
      ? '<p style="font-size:12px;color:var(--muted)">过敏原：' + al.map(function (a) { return '<span class="tag">' + a + '</span>'; }).join(' ') +
        (hit.length ? ' <span class="tag" style="background:#fde8e8;color:#c0392b;border:1px solid #f5c6c6">⚠ 与您的忌口冲突（' + hit.join('/') + '）</span>' : '') + '</p>'
      : '';
    // 份量缩放（原方默认 2 人份）
    var base = 2, servings = 2;
    function ingHtml() {
      if (!d) return '';
      return d.ingredients.map(function (i) {
        var w = Math.round(i.weight * servings / base);
        var pick = (Bridge.KetoCore && Bridge.KetoCore.getIngredientPick) ? Bridge.KetoCore.getIngredientPick(i.name) : null;
        var pickHtml = pick ? '<div style="font-size:11px;color:#7a5b2e;line-height:1.5;margin:3px 0 7px;padding-left:8px;border-left:2px solid #ffe0c2">🔍 挑：' + pick + '</div>' : '';
        return '<div style="margin-bottom:4px"><b>' + i.name + '</b> <span style="color:var(--accent);font-weight:600">' + w + i.unit + '</span>' + pickHtml + '</div>';
      }).join('');
    }
    var body;
    if (d) {
      body = head + '<h3 style="margin:10px 0 0">' + name + '</h3>' +
        allergenLine +
        '<div style="display:flex;align-items:center;gap:10px;margin:10px 0;background:#f4fbf7;border:1px solid #d6ecdf;border-radius:10px;padding:8px 12px">' +
        '<span style="font-size:13px;color:var(--muted)">份量</span>' +
        '<button class="btn sm" id="svMinus" style="margin:0">−</button>' +
        '<b id="svNum" style="min-width:54px;text-align:center;font-size:15px">' + servings + ' 人份</b>' +
        '<button class="btn sm" id="svPlus" style="margin:0">＋</button>' +
        '<span style="font-size:11px;color:var(--muted)">原方 ' + base + ' 人份</span></div>' +
        '<div id="ingBox" style="font-size:14px;line-height:1.6">' + ingHtml() + '</div>' +
        '<button class="btn ghost sm" id="kitchenBtn" style="margin-top:8px">🍳 厨房模式（大字分步）</button>' +
        (d.tips ? '<p style="font-size:12px;color:var(--green-d);margin-top:10px">💡 ' + d.tips + '</p>' : '');
    } else {
      body = head + '<h3 style="margin:10px 0 0">' + name + '</h3>' + allergenLine + '<p style="color:var(--muted)">暂无详细做法，按营养自行烹饪即可。</p>';
    }
    body += '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">' +
      '<button class="btn sm" data-act="addish" data-slot="breakfast">' + ICONS.svg('plus', 12) + ' 加入早餐</button>' +
      '<button class="btn sm" data-act="addish" data-slot="lunch">' + ICONS.svg('plus', 12) + ' 加入午餐</button>' +
      '<button class="btn sm" data-act="addish" data-slot="dinner">' + ICONS.svg('plus', 12) + ' 加入晚餐</button>' +
      '</div>' +
      '<button class="btn ' + (fav ? 'ghost' : '') + '" data-act="fav2" data-name="' + name + '" style="margin-top:14px;width:100%">' + (fav ? '取消收藏' : ICONS.svg('star', 14) + ' 收藏') + '</button>';
    App.openModal(body);
    var modal = document.getElementById('app-modal');
    if (modal) {
      var favBtn = modal.querySelector('[data-act="fav2"]');
      if (favBtn) favBtn.addEventListener('click', function () {
        Store.toggleFav(name); App.toast('已' + (Store.isFav(name) ? '收藏' : '取消')); App.closeModal(); render(el, currentCat, currentKw);
      });
      var svMinus = modal.querySelector('#svMinus'), svPlus = modal.querySelector('#svPlus'), svNum = modal.querySelector('#svNum'), ingBox = modal.querySelector('#ingBox');
      function updateServings() {
        if (svNum) svNum.textContent = servings + ' 人份';
        if (ingBox) ingBox.innerHTML = ingHtml();
      }
      if (svMinus) svMinus.onclick = function () { if (servings > 1) { servings--; updateServings(); } };
      if (svPlus) svPlus.onclick = function () { if (servings < 10) { servings++; updateServings(); } };
      var kb = modal.querySelector('#kitchenBtn');
      if (kb) kb.onclick = function () { if (d && d.steps) openKitchen(name, d.steps); };
      modal.querySelectorAll('[data-act="addish"]').forEach(function (b) {
        b.addEventListener('click', function () {
          var slot = b.getAttribute('data-slot');
          var item = Bridge.dishToMealItem(name);
          if (!item) { App.toast('暂无该菜营养数据'); return; }
          var s = Store.getSettings();
          var al = (Bridge.KetoCore && Bridge.KetoCore.dishAllergens) ? Bridge.KetoCore.dishAllergens(name) : [];
          var hit = (s.avoid && s.avoid.length) ? al.filter(function (a) { return s.avoid.indexOf(a) >= 0; }) : [];
          if (hit.length) {
            if (!global.confirm('⚠ 该菜含「' + hit.join('/') + '」，与您的忌口冲突。仍要加入' + ({ breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }[slot]) + '吗？')) return;
          }
          var m = Store.getMeals(Store.dateStr()) || { dietMode: Store.getSettings().dietMode, breakfast: [], lunch: [], dinner: [], exercises: [], steps: 0 };
          if (!m[slot]) m[slot] = [];
          m[slot].push(item);
          Store.saveMeals(Store.dateStr(), m);
          if (global.App && App.family) App.family.syncIfJoined();
          App.closeModal();
          // P1-4：不再跳转打卡页，留在食谱页；若打卡页正开着则就地刷新列表
          var ce = document.getElementById('view-checkin');
          if (ce && ce.classList.contains('active') && App.checkin && App.checkin.softRefresh) App.checkin.softRefresh(ce);
          App.toast('已加入' + ({ breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }[slot]) + '：' + name);
        });
      });
    }
  }

  var currentCat = '全部', currentKw = '', currentFamilyAll = false;

  function bind(el) {
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'cat') { currentCat = b.getAttribute('data-c'); render(el, currentCat, currentKw); }
      else if (act === 'famall') { currentFamilyAll = !currentFamilyAll; render(el, currentCat, currentKw); }
      else if (act === 'fav') { Store.toggleFav(b.getAttribute('data-name')); App.toast('已' + (Store.isFav(b.getAttribute('data-name')) ? '收藏' : '取消')); render(el, currentCat, currentKw); }
      else if (act === 'plan') { if (App.mealPlan) App.mealPlan.open(); }
      else if (act === 'dish') { showDish(b.getAttribute('data-name'), el); }
    });
    // 搜索仅局部刷新列表，保留输入框焦点
    el.addEventListener('input', function (e) {
      if (e.target && e.target.id === 'rkw') {
        currentKw = e.target.value.trim();
        var dl = el.querySelector('#dishList');
        if (dl) dl.innerHTML = cardsHtml(currentCat, currentKw);
      }
    });
  }

  App.recipes = {
    onShow: function (el) { render(el, currentCat, currentKw); if (!el._fBound) { bind(el); el._fBound = true; } }
  };
})(window);
