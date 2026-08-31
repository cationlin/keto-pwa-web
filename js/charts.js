// charts.js — 手写 canvas 图表库（零依赖，国内稳）
// 支持：折线(line)、进度条(progress)、双轴折线(dualAxis)、饼图(pie)
(function (global) {
  'use strict';

  var COLORS = {
    green: '#2e9e5b', blue: '#2f6fed', orange: '#f5901e',
    red: '#e0524d', gray: '#c9d2cc', line: '#3a4a42', grid: '#e6ebe8'
  };

  function setup(canvas) {
    var dpr = global.devicePixelRatio || 1;
    var cssW = canvas.clientWidth || canvas.parentNode.clientWidth || 320;
    var cssH = canvas.getAttribute('height') ? parseInt(canvas.getAttribute('height'), 10) : 180;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.height = cssH + 'px';
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: cssW, h: cssH };
  }

  function niceMax(v) {
    if (v <= 0) return 10;
    var pow = Math.pow(10, Math.floor(Math.log10(v)));
    var n = v / pow;
    var step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return step * pow;
  }

  // 折线图：opts={labels,series:[{name,color,data}],target,height}
  function line(canvas, opts) {
    var s = setup(canvas), ctx = s.ctx, w = s.w, h = s.h;
    ctx.clearRect(0, 0, w, h);
    var padL = 36, padR = 12, padT = 14, padB = 22;
    var plotW = w - padL - padR, plotH = h - padT - padB;
    var all = [];
    (opts.series || []).forEach(function (se) { all = all.concat(se.data); });
    if (opts.target != null) all.push(opts.target);
    var maxV = niceMax(Math.max.apply(null, all.concat([1])));
    var minV = Math.min.apply(null, all.concat([0]));
    if (minV > 0) minV = 0;
    var range = (maxV - minV) || 1;
    function X(i) { return padL + (opts.labels.length <= 1 ? plotW / 2 : plotW * i / (opts.labels.length - 1)); }
    function Y(v) { return padT + plotH - (v - minV) / range * plotH; }

    // 网格 + Y 轴刻度
    ctx.strokeStyle = COLORS.grid; ctx.fillStyle = '#8a958f'; ctx.font = '10px sans-serif';
    ctx.lineWidth = 1;
    for (var g = 0; g <= 4; g++) {
      var gv = minV + range * g / 4, gy = Y(gv);
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(w - padR, gy); ctx.stroke();
      ctx.fillText(Math.round(gv), 4, gy + 3);
    }
    // X 轴标签（抽稀）
    var stepLbl = Math.ceil(opts.labels.length / 6);
    ctx.textAlign = 'center';
    opts.labels.forEach(function (lb, i) {
      if (i % stepLbl === 0) ctx.fillText(lb.replace(/^\d{4}-/, ''), X(i), h - 6);
    });
    ctx.textAlign = 'left';

    // 目标线
    if (opts.target != null) {
      ctx.strokeStyle = COLORS.orange; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.5;
      var ty = Y(opts.target);
      ctx.beginPath(); ctx.moveTo(padL, ty); ctx.lineTo(w - padR, ty); ctx.stroke();
      ctx.setLineDash([]);
    }
    // 折线
    (opts.series || []).forEach(function (se) {
      ctx.strokeStyle = se.color || COLORS.blue; ctx.lineWidth = 2; ctx.beginPath();
      se.data.forEach(function (v, i) {
        var x = X(i), y = Y(v);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.fillStyle = se.color || COLORS.blue;
      se.data.forEach(function (v, i) { ctx.beginPath(); ctx.arc(X(i), Y(v), 2.5, 0, Math.PI * 2); ctx.fill(); });
    });
    // 折线数值标签（P2 趋势图数值）：点过多时跳过以免拥挤
    if (opts.showValues && opts.labels.length <= 40) {
      ctx.fillStyle = '#3a4a42'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
      (opts.series || []).forEach(function (se) {
        se.data.forEach(function (v, i) {
          var x = X(i), y = Y(v);
          var ty = y - 7; if (ty < 6) ty = y + 11;
          ctx.fillText(Math.round(v), x, ty);
        });
      });
      ctx.textAlign = 'left';
    }
  }

  // 进度条：opts={start,current,target,unit}
  function progress(canvas, opts) {
    var s = setup(canvas), ctx = s.ctx, w = s.w, h = s.h;
    ctx.clearRect(0, 0, w, h);
    var padL = 10, padR = 10, padT = 10, barY = 26, barH = 16;
    var lo = Math.min(opts.start, opts.current, opts.target);
    var hi = Math.max(opts.start, opts.current, opts.target);
    var span = (hi - lo) || 1;
    function X(v) { return padL + (v - lo) / span * (w - padL - padR); }
    // 轨道
    ctx.fillStyle = COLORS.grid;
    roundRect(ctx, padL, barY, w - padL - padR, barH, 8); ctx.fill();
    // 已完成段
    var from = Math.min(opts.start, opts.current), to = Math.max(opts.start, opts.current);
    ctx.fillStyle = opts.current <= opts.target ? COLORS.green : COLORS.orange;
    roundRect(ctx, X(from), barY, Math.max(2, X(to) - X(from)), barH, 8); ctx.fill();
    // 起点/目标/当前标记
    marker(ctx, X(opts.start), barY, barH, COLORS.gray, '起 ' + opts.start + (opts.unit || ''));
    marker(ctx, X(opts.target), barY, barH, COLORS.blue, '标 ' + opts.target + (opts.unit || ''));
    marker(ctx, X(opts.current), barY, barH, COLORS.red, '现 ' + opts.current + (opts.unit || ''));
    ctx.fillStyle = '#3a4a42'; ctx.font = '11px sans-serif';
    ctx.fillText('进度 ' + Math.round((opts.current - opts.start) / ((opts.target - opts.start) || 1) * 100) + '%', padL, barY - 2 < 10 ? barY + barH + 14 : barY - 2);
  }
  function marker(ctx, x, y, h, color, label) {
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y + h / 2, 4, 0, Math.PI * 2); ctx.fill();
  }

  // 双轴折线：opts={labels,left:{name,color,data},right:{name,color,data},height}
  function dualAxis(canvas, opts) {
    var s = setup(canvas), ctx = s.ctx, w = s.w, h = s.h;
    ctx.clearRect(0, 0, w, h);
    var padL = 34, padR = 34, padT = 14, padB = 22;
    var plotW = w - padL - padR, plotH = h - padT - padB;
    var lMax = niceMax(Math.max.apply(null, (opts.left.data || [1]).concat([1])));
    var rMax = niceMax(Math.max.apply(null, (opts.right.data || [1]).concat([1])));
    function X(i) { return padL + (opts.labels.length <= 1 ? plotW / 2 : plotW * i / (opts.labels.length - 1)); }
    function YL(v) { return padT + plotH - v / lMax * plotH; }
    function YR(v) { return padT + plotH - v / rMax * plotH; }
    // 网格
    ctx.strokeStyle = COLORS.grid; ctx.lineWidth = 1; ctx.font = '9px sans-serif';
    for (var g = 0; g <= 4; g++) {
      var gy = padT + plotH - plotH * g / 4;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(w - padR, gy); ctx.stroke();
      ctx.fillStyle = opts.left.color || COLORS.blue;
      ctx.textAlign = 'left'; ctx.fillText(Math.round(lMax * g / 4), 4, gy + 3);
      ctx.fillStyle = opts.right.color || COLORS.orange;
      ctx.textAlign = 'right'; ctx.fillText(Math.round(rMax * g / 4), w - 4, gy + 3);
    }
    ctx.textAlign = 'center'; ctx.fillStyle = '#8a958f';
    var stepLbl = Math.ceil(opts.labels.length / 6);
    opts.labels.forEach(function (lb, i) { if (i % stepLbl === 0) ctx.fillText(lb.replace(/^\d{4}-/, ''), X(i), h - 6); });
    ctx.textAlign = 'left';
    drawSeries(ctx, opts.left, X, YL);
    drawSeries(ctx, opts.right, X, YR);
  }
  function drawSeries(ctx, se, X, Y) {
    if (!se || !se.data) return;
    ctx.strokeStyle = se.color; ctx.lineWidth = 2; ctx.beginPath();
    se.data.forEach(function (v, i) { var x = X(i), y = Y(v); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.stroke();
    ctx.fillStyle = se.color;
    se.data.forEach(function (v, i) { ctx.beginPath(); ctx.arc(X(i), Y(v), 2.5, 0, Math.PI * 2); ctx.fill(); });
  }

  // 饼图：opts={labels,values,colors}
  function pie(canvas, opts) {
    var s = setup(canvas), ctx = s.ctx, w = s.w, h = s.h;
    ctx.clearRect(0, 0, w, h);
    var total = opts.values.reduce(function (a, b) { return a + b; }, 0) || 1;
    var cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 8;
    var ang = -Math.PI / 2;
    opts.values.forEach(function (v, i) {
      var slice = v / total * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, ang, ang + slice);
      ctx.closePath();
      ctx.fillStyle = (opts.colors && opts.colors[i]) || COLORS.blue;
      ctx.fill();
      ang += slice;
    });
    // 中心留白 + 图例
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3a4a42'; ctx.font = '11px sans-serif'; ctx.textAlign = 'left';
    var lx = 8, ly = 12;
    opts.labels.forEach(function (lb, i) {
      ctx.fillStyle = (opts.colors && opts.colors[i]) || COLORS.blue;
      ctx.fillRect(lx, ly, 9, 9);
      ctx.fillStyle = '#3a4a42'; ctx.fillText(lb + ' ' + Math.round(opts.values[i] / total * 100) + '%', lx + 13, ly + 8);
      ly += 16;
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2; if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  global.Charts = { line: line, progress: progress, dualAxis: dualAxis, pie: pie, colors: COLORS };
})(typeof window !== 'undefined' ? window : globalThis);
