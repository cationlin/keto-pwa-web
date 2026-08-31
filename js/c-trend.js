// c-trend.js — 模块C 趋势页（体重折线 + 进度条 + 统计 + 周月年切换）
(function (global) {
  'use strict';

  var RANGE = { week: 7, month: 30, year: 365 };

  function filterWeights(range) {
    var ws = Store.getWeights();
    if (range === 'all') return ws;
    var cut = Date.now() - RANGE[range] * 86400000;
    return ws.filter(function (w) { return new Date(w.date).getTime() >= cut; });
  }

  function stats(ws) {
    if (!ws.length) return null;
    var days = new Set(ws.map(function (w) { return w.date; })).size;
    var first = ws[0], last = ws[ws.length - 1];
    var streak = 1;
    for (var i = ws.length - 1; i > 0; i--) {
      var d1 = new Date(ws[i].date), d0 = new Date(ws[i - 1].date);
      var diff = Math.round((d1 - d0) / 86400000);
      if (diff === 1) streak++; else break;
    }
    var avg = ws.reduce(function (a, w) { return a + (w.weight || 0); }, 0) / ws.length;
    var lost = (first.weight != null && last.weight != null) ? Math.round((first.weight - last.weight) * 10) / 10 : 0;
    return { days: days, streak: streak, avg: Math.round(avg * 10) / 10, lost: lost };
  }

  function render(el, range) {
    var ws = filterWeights(range);
    var s = Store.getSettings();
    var mem = Store.getActiveMember();
    var stat = stats(ws);
    var statHtml = stat ? '<div class="stats">' +
      '<div class="stat"><div class="num">' + stat.days + '</div><div class="lbl">记录天数</div></div>' +
      '<div class="stat"><div class="num">' + stat.streak + '</div><div class="lbl">连续打卡</div></div>' +
      '<div class="stat"><div class="num">' + stat.avg + '</div><div class="lbl">平均体重</div></div>' +
      '<div class="stat"><div class="num">' + stat.lost + '</div><div class="lbl">累计减重</div></div>' +
      '</div>' : '<div class="empty">暂无体重数据，去「记录」页录入</div>';

    // 妈妈（温和减重）专属提示：安全降速 + 医学免责 + 降速过快告警
    var note = '';
    if (mem && mem.role === 'mom') {
      var pace = (stat && stat.days >= 14) ? (stat.lost / (stat.days / 7)) : 0;
      var paceWarn = pace > 0.7 ? '<div style="color:#c0392b;margin-top:6px">⚠ 近期减重偏快（约 ' + Math.round(pace * 10) / 10 + ' kg/周）。建议先复查甲功与营养，勿再节食，保证蛋白与总热量。</div>' : '';
      note = '<div class="card" style="background:#fff8f0;border:1px solid #ffe0c2">' +
        '<h3 style="margin-top:0">温和减重提示</h3>' +
        '<p class="meta" style="font-size:12px;line-height:1.8;margin:0">' +
        '当前为温和节奏（建议 0.25–0.5 kg/周）。目标 ' + s.targetWeight + 'kg 为阶段里程碑，最终以健康体重区间为准。<br>' +
        '请结合医嘱与定期复查（如甲功），本 App 仅作记录与参考，<b>不替代医疗建议</b>。' + paceWarn + '</p></div>';
    }

    var labels = ws.map(function (w) { return w.date; });
    var data = ws.map(function (w) { return w.weight; });

    el.innerHTML =
      '<div class="card"><h3>体重趋势 <span class="sub">目标 ' + s.targetWeight + 'kg</span></h3>' +
      '<div class="row" style="margin-bottom:8px">' +
      ['week', 'month', 'year', 'all'].map(function (r) {
        return '<button class="btn sm ' + (range === r ? '' : 'ghost') + '" data-act="range" data-r="' + r + '" style="margin-top:0">' + ({ week: '周', month: '月', year: '年', all: '全部' }[r]) + '</button>';
      }).join('') + '</div>' +
      '<canvas id="weightChart" height="200"></canvas>' +
      statHtml + '</div>' +
      '<div class="card"><h3>目标进展</h3><canvas id="progChart" height="70"></canvas></div>' +
      note;
  }

  function draw(el, range) {
    var ws = filterWeights(range);
    if (ws.length) {
      Charts.line(el.querySelector('#weightChart'), {
        labels: ws.map(function (w) { return w.date; }),
        series: [{ name: '体重', color: Charts.colors.green, data: ws.map(function (w) { return w.weight; }) }],
        target: Store.getSettings().targetWeight,
        showValues: true
      });
    }
    var s = Store.getSettings();
    var wsAll = Store.getWeights();
    var cur = wsAll.length ? wsAll[wsAll.length - 1].weight : s.startWeight;
    Charts.progress(el.querySelector('#progChart'), { start: s.startWeight, current: cur, target: s.targetWeight, unit: 'kg' });
  }

  function bind(el) {
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      if (b.getAttribute('data-act') === 'range') {
        var r = b.getAttribute('data-r');
        render(el, r); draw(el, r);
      }
    });
  }

  App.trend = {
    onShow: function (el) {
      render(el, 'month'); draw(el, 'month');
      if (!el._cBound) { bind(el); el._cBound = true; }
    }
  };
})(window);
