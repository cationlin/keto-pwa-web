// b-records.js — 模块B 记录页（体重/体脂录入 + 历史 + 餐食历史）
(function (global) {
  'use strict';

  var FIELDS = [
    { k: 'weight', n: '体重(kg)', d: '' },
    { k: 'bodyFat', n: '体脂率(%)', d: '' },
    { k: 'muscle', n: '肌肉量(kg)', d: '' },
    { k: 'visceral', n: '内脏脂肪', d: '' },
    { k: 'bone', n: '骨量(kg)', d: '' },
    { k: 'water', n: '水分率(%)', d: '' },
    { k: 'ketone', n: '血酮(mmol/L)', d: '' },
    { k: 'glucose', n: '血糖(mmol/L)', d: '' }
  ];

  function weightRow(w, prev) {
    var arrow = '', diff = '';
    if (prev && prev.weight != null && w.weight != null) {
      var d = Math.round((w.weight - prev.weight) * 10) / 10;
      if (d < 0) { arrow = '↓'; diff = d; }
      else if (d > 0) { arrow = '↑'; diff = '+' + d; }
      else { arrow = '→'; diff = '0'; }
    }
    return '<div class="item"><div><span class="name">' + w.date + '</span>' +
      '<div class="meta">体重 ' + (w.weight != null ? w.weight + 'kg ' + arrow + ' ' + diff : '—') +
      (w.bodyFat != null ? ' · 体脂 ' + w.bodyFat + '%' : '') +
      (w.ketone != null ? ' · 血酮 ' + w.ketone : '') +
      (w.glucose != null ? ' · 血糖 ' + w.glucose : '') + '</div></div>' +
      '<button class="del" data-act="delw" data-d="' + w.date + '" aria-label="删除">' + ICONS.svg('trash', 14) + '</button></div>';
  }

  function mealHistoryHtml(date) {
    var m = Store.getMeals(date);
    if (!m) return '<div class="empty">该日无餐食记录</div>';
    var slots = [['breakfast', '早餐'], ['lunch', '午餐'], ['dinner', '晚餐']];
    var h = '';
    slots.forEach(function (s) {
      var items = m[s[0]] || [];
      h += '<div style="font-weight:600;margin:8px 0 2px">' + s[1] + '</div>';
      if (!items.length) { h += '<div class="meta">—</div>'; return; }
      h += items.map(function (it) {
        return '<div class="item"><div><span class="name">' + it.name + '</span><div class="meta">' + it.amount + it.unit + ' · ' + it.calories + 'kcal</div></div></div>';
      }).join('');
    });
    return h;
  }

  var lastWDate = null; // 保存/删除后保留所选日期，避免连续补录多天反复重选
  function render(el) {
    var ws = Store.getWeights();
    var last = ws.length ? ws[ws.length - 1] : {};
    var form = FIELDS.map(function (f) {
      return '<div class="row"><label style="flex:1">' + f.n + '</label>' +
        '<input id="wf-' + f.k + '" type="number" step="0.1" value="' + (last[f.k] != null ? last[f.k] : '') + '" style="flex:1"></div>';
    }).join('');

    var hist = ws.length ? ws.slice().reverse().map(function (w, i) {
      return weightRow(w, ws[ws.length - 1 - i - 1]);
    }).join('') : '<div class="empty">还没有体重记录</div>';

    el.innerHTML =
      '<div class="card"><h3>记录体重 / 体成分</h3>' +
      '<label>日期</label><input id="wf-date" type="date" value="' + (lastWDate || Store.dateStr()) + '">' +
      form +
      '<div class="row" style="gap:8px;margin-top:4px;flex-wrap:wrap"><button class="btn" data-act="savew">保存记录</button>' +
      (window.AfuScale && window.AfuScale.available()
        ? '<button class="btn" data-act="afu-ble">📶 体脂秤直连</button>' : '') +
      '<button class="btn ghost" data-act="afu-import">📟 从阿福导入</button></div></div>' +
      '<div class="card"><h3>体重历史</h3>' + hist + '</div>' +
      '<div class="card"><h3>餐食历史</h3><label>选择日期</label>' +
      '<input id="mealDate" type="date" value="' + Store.dateStr() + '">' +
      '<div id="mealHist" style="margin-top:8px">' + mealHistoryHtml(Store.dateStr()) + '</div></div>';
  }

  function bind(el) {
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      if (b.getAttribute('data-act') === 'savew') {
        var w = { date: el.querySelector('#wf-date').value || Store.dateStr() };
        FIELDS.forEach(function (f) {
          var v = parseFloat(el.querySelector('#wf-' + f.k).value);
          if (!isNaN(v)) w[f.k] = v;
        });
        var prevW = Store.getWeights().filter(function (x) { return x.date === w.date; })[0];
        Store.addWeight(w);
        lastWDate = w.date;
        if (prevW) App.toast('已更新 ' + w.date + '（' + (prevW.weight != null ? prevW.weight : '-') + 'kg → ' + (w.weight != null ? w.weight : '-') + 'kg）');
        else App.toast('已保存 ' + w.date + ' 记录');
        App.go('records');
      } else if (b.getAttribute('data-act') === 'afu-import') {
        if (App.mine && App.mine.openAfuImport) App.mine.openAfuImport('records');
      } else if (b.getAttribute('data-act') === 'afu-ble') {
        if (App.mine && App.mine.openAfuBle) App.mine.openAfuBle('records');
      } else if (b.getAttribute('data-act') === 'delw') {
        var dd = b.getAttribute('data-d');
        if (window.confirm('确定删除 ' + dd + ' 的体重记录吗？此操作不可撤销。')) {
          Store.deleteWeight(dd); lastWDate = dd; App.toast('已删除 ' + dd + ' 记录'); App.go('records');
        }
      }
    });
    el.addEventListener('change', function (e) {
      if (e.target && e.target.id === 'mealDate') {
        el.querySelector('#mealHist').innerHTML = mealHistoryHtml(e.target.value);
      }
    });
  }

  App.records = {
    onShow: function (el) { render(el); if (!el._bBound) { bind(el); el._bBound = true; } }
  };
})(window);
