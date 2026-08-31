// e-analysis.js — 模块E 分析页（营养饼图 + 体重/热量双轴 + 规则建议）
(function (global) {
  'use strict';

  function weekMeals() {
    var all = Store.getAllMeals();
    var cut = Date.now() - 7 * 86400000;
    var res = [];
    Object.keys(all).forEach(function (date) {
      if (new Date(date).getTime() >= cut) res.push({ date: date, m: all[date] });
    });
    return res;
  }

  function dayTotal(date, m) {
    var s = Store.getSettings();
    var bm = s.baseMetabolism || Bridge.health(s, (Store.getWeights().length ? Store.getWeights()[Store.getWeights().length - 1].weight : s.startWeight)).bmr;
    return Bridge.dailyTotals(m, bm);
  }

  function pieHtml() {
    var wm = weekMeals();
    var carb = 0, pro = 0, fat = 0;
    wm.forEach(function (d) {
      var t = dayTotal(d.date, d.m);
      carb += t.carbG; pro += t.proteinG; fat += t.fatG;
    });
    if (!carb && !pro && !fat) return '<div class="empty">本周还没有饮食记录</div><canvas id="pieChart" height="160" style="display:none"></canvas>';
    return '<canvas id="pieChart" height="170"></canvas>';
  }

  function dualHtml() {
    var ws = Store.getWeights().slice(-14);
    if (ws.length < 2) return '<div class="empty">需至少2条体重记录才能看双轴趋势</div><canvas id="dualChart" height="200" style="display:none"></canvas>';
    var all = Store.getAllMeals();
    var labels = ws.map(function (w) { return w.date; });
    var weightData = ws.map(function (w) { return w.weight; });
    var calData = ws.map(function (w) {
      var m = all[w.date];
      return m ? dayTotal(w.date, m).totalCal : null;
    });
    return '<canvas id="dualChart" height="210"></canvas>';
  }

  function overviewHtml() {
    var s = Store.getSettings();
    var wm = weekMeals();
    if (!wm.length) return '<div class="empty">本周还没有饮食记录</div>';
    // 口径统一：用 Bridge.dayBalance 的(budget)口径，与打卡页总览一致
    var ok = 0, calGapSum = 0;
    wm.forEach(function (d) {
      var bal = Bridge.dayBalance(d.m, s);
      var gap = bal.balanceBudget; // 剩余=正
      calGapSum += gap;
      if (gap >= 0) ok++;
    });
    var rate = Math.round(ok / wm.length * 100);
    var ws = Store.getWeights();
    var wtrend = '';
    if (ws.length >= 2) {
      var diff = ws[ws.length - 1].weight - ws[0].weight;
      wtrend = '体重 ' + (diff <= 0 ? '↓' : '↑') + Math.abs(diff).toFixed(1) + 'kg（近 ' + ws.length + ' 条记录）';
    }
    return '<div class="stats">' +
      '<div class="stat"><div class="num">' + rate + '%</div><div class="lbl">达标率(不超预算)</div></div>' +
      '<div class="stat"><div class="num">' + (calGapSum >= 0 ? '+' : '') + Math.round(calGapSum) + '</div><div class="lbl">周热量余量 kcal</div></div>' +
      '</div>' + (wtrend ? '<div style="margin-top:8px;font-size:12px;color:var(--muted)">' + wtrend + '</div>' : '');
  }

  function suggestions() {
    var s = Store.getSettings();
    var wm = weekMeals();
    var tips = [];
    // 1. 连续3天摄入>消耗
    var over = 0;
    wm.forEach(function (d) {
      var bal = Bridge.dayBalance(d.m, s);
      if (bal.balanceBudget < 0) over++; else over = 0; // 超预算计为"超量"
    });
    if (over >= 3) tips.push('⚠️ 连续 ' + over + ' 天摄入高于消耗，建议每日减少约 200 kcal。');
    // 2. 碳水比例>20%
    var carb = 0, pro = 0, fat = 0;
    wm.forEach(function (d) { var t = dayTotal(d.date, d.m); carb += t.carbG; pro += t.proteinG; fat += t.fatG; });
    var total = carb + pro + fat;
    if (total > 0 && Math.round(carb / total * 100) > 20) tips.push('🍚 本周碳水占比 ' + Math.round(carb / total * 100) + '%，超过 20%，警惕隐形碳水（酱料、根茎类）。');
    // 3. 肌肉量下降
    var ws = Store.getWeights();
    if (ws.length >= 2 && ws[ws.length - 1].muscle != null && ws[ws.length - 2].muscle != null &&
      ws[ws.length - 1].muscle < ws[ws.length - 2].muscle) {
      tips.push('💪 近期肌肉量下降，建议增加蛋白质摄入与抗阻运动。');
    }
    if (!tips.length) tips.push('✅ 近期数据良好，继续保持当前饮食节奏。');
    return tips.map(function (t) { return '<div class="item" style="border:none;padding:6px 0">' + t + '</div>'; }).join('');
  }

  function render(el) {
    el.innerHTML =
      '<div class="card"><h3>本周概览</h3>' + overviewHtml() + '</div>' +
      '<div class="card"><h3>本周营养素比例</h3>' + pieHtml() + '</div>' +
      '<div class="card"><h3>体重 / 热量 双轴趋势</h3>' + dualHtml() + '</div>' +
      '<div class="card"><h3>智能建议</h3>' + suggestions() + '</div>';
  }

  function draw(el) {
    var pie = el.querySelector('#pieChart');
    if (pie && pie.style.display !== 'none') {
      var wm = weekMeals();
      var carb = 0, pro = 0, fat = 0;
      wm.forEach(function (d) { var t = dayTotal(d.date, d.m); carb += t.carbG; pro += t.proteinG; fat += t.fatG; });
      Charts.pie(pie, { labels: ['碳水', '蛋白质', '脂肪'], values: [carb, pro, fat], colors: [Charts.colors.orange, Charts.colors.blue, Charts.colors.green] });
    }
    var dual = el.querySelector('#dualChart');
    if (dual && dual.style.display !== 'none') {
      var ws = Store.getWeights().slice(-14);
      var all = Store.getAllMeals();
      Charts.dualAxis(dual, {
        labels: ws.map(function (w) { return w.date; }),
        left: { name: '体重', color: Charts.colors.green, data: ws.map(function (w) { return w.weight; }) },
        right: { name: '热量', color: Charts.colors.orange, data: ws.map(function (w) { var m = all[w.date]; return m ? dayTotal(w.date, m).totalCal : 0; }) }
      });
    }
  }

  App.analysis = {
    onShow: function (el) { render(el); draw(el); }
  };
})(window);
