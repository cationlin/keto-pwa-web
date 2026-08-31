// d-mine.js — 模块D 我的页（健康计算卡 + 设置 + CSV导出）
(function (global) {
  'use strict';

  var ACT_MAP = { sedentary: '久坐', light: '轻度', moderate: '中度', very_active: '高强度' };
  var ACT_FACTOR = { sedentary: 1.2, light: 1.375, moderate: 1.55, very_active: 1.725 };

  function healthCard() {
    var s = Store.getSettings();
    var ws = Store.getWeights();
    var w = ws.length ? ws[ws.length - 1].weight : s.startWeight;
    var h = Bridge.health(s, w);
    var rows = [
      ['BMI', h.bmi + ' (' + h.bmiHint + ')'],
      ['健康体重区间', h.healthyWeightRange + ' kg'],
      ['体脂率', h.bodyFatRate + ' %'],
      ['基础代谢 BMR', h.bmr + ' kcal'],
      ['每日消耗 TDEE', h.tdee + ' kcal'],
      ['晚餐目标', h.dinnerTarget + ' kcal'],
      ['季节系数', h.seasonHint]
    ];
    return '<div class="card"><h3>健康档案 <span class="sub">当前体重 ' + w + 'kg</span></h3>' +
      '<div class="stats" style="gap:6px">' + rows.map(function (r) {
        return '<div class="stat" style="flex:1 1 45%"><div class="num" style="font-size:16px">' + r[1] + '</div><div class="lbl">' + r[0] + '</div></div>';
      }).join('') + '</div></div>';
  }

  // 基础资料：默认只读摘要，点「编辑资料」才进入可编辑表单，保存/取消后回到只读。
  // 避免「保存后仍是可编辑表单、容易误触改值」的痛点（P1 交互优化）。
  var _editProfile = false;

  function settingsSummary(s) {
    var mem = Store.getActiveMember();
    var who = mem ? mem.name : '我';
    var momNote = (mem && mem.role === 'mom')
      ? '<div style="background:#fff8f0;border:1px solid #ffe0c2;border-radius:10px;padding:8px 10px;margin-bottom:10px;font-size:12px;color:#9a5a1a;line-height:1.7">温和减重（建议 0.25–0.5 kg/周）更稳更安全。请结合医嘱定期复查，本 App 仅作记录参考，<b>不替代医疗建议</b>。</div>'
      : '';
    var modeLabel = { keto: '生酮', lowcarb: '低碳', normal: '正常' }[s.dietMode] || s.dietMode;
    var rows = [
      ['性别', s.gender],
      ['身高', s.height + ' cm'],
      ['出生年', s.birthYear],
      ['活动水平', ACT_MAP[s.activityLevel]],
      ['起始体重', s.startWeight + ' kg'],
      ['目标体重', s.targetWeight + ' kg'],
      ['饮食模式', modeLabel]
    ];
    var kv = rows.map(function (r) {
      return '<div class="kv"><span class="kv-k">' + r[0] + '</span><span class="kv-v">' + r[1] + '</span></div>';
    }).join('');
    var avoid = (s.avoid && s.avoid.length) ? s.avoid.join('、') : '无';
    kv += '<div class="kv"><span class="kv-k">忌口</span><span class="kv-v">' + avoid + '</span></div>';
    return '<div class="card"><h3>' + who + ' 的设置</h3>' + momNote +
      '<div class="kv-list">' + kv + '</div>' +
      '<button class="btn ghost" data-act="edit-set" style="margin-top:12px">✏️ 编辑资料</button></div>';
  }

  function settingsForm() {
    // 非编辑态 → 只读摘要（无输入框，杜绝误触）
    if (!_editProfile) return settingsSummary(Store.getSettings());
    var s = Store.getSettings();
    var mem = Store.getActiveMember();
    var who = mem ? mem.name : '我';
    var momNote = (mem && mem.role === 'mom')
      ? '<div style="background:#fff8f0;border:1px solid #ffe0c2;border-radius:10px;padding:8px 10px;margin-bottom:10px;font-size:12px;color:#9a5a1a;line-height:1.7">温和减重（建议 0.25–0.5 kg/周）更稳更安全。请结合医嘱定期复查，本 App 仅作记录参考，<b>不替代医疗建议</b>。</div>'
      : '';
    return '<div class="card"><h3>' + who + ' 的设置（编辑中）</h3>' + momNote +
      '<label>性别</label>' +
      '<input type="hidden" id="set-gender" value="' + (s.gender || '男') + '">' +
      '<button type="button" class="trigger picker-trigger" data-act="pick-gender" style="text-align:left"><span id="set-gender-txt">' + (s.gender || '男') + '</span><span class="trig-caret">▾</span></button>' +
      '<div class="row"><div><label>身高(cm)</label><input id="set-height" type="number" value="' + s.height + '"></div>' +
      '<div><label>出生年</label><input id="set-birth" type="number" value="' + s.birthYear + '"></div></div>' +
      '<label>活动水平</label>' +
      '<input type="hidden" id="set-act" value="' + (s.activityLevel || 'light') + '">' +
      '<button type="button" class="trigger picker-trigger" data-act="pick-act" style="text-align:left"><span id="set-act-txt">' + (ACT_MAP[s.activityLevel] || ACT_MAP.light) + '</span><span class="trig-caret">▾</span></button>' +
      '<div class="row"><div><label>起始体重(kg)</label><input id="set-start" type="number" step="0.1" value="' + s.startWeight + '"></div>' +
      '<div><label>目标体重(kg)</label><input id="set-target" type="number" step="0.1" value="' + s.targetWeight + '"></div></div>' +
      '<label>基础代谢(可选，留空自动算)</label><input id="set-bmr" type="number" value="' + (s.baseMetabolism != null ? s.baseMetabolism : '') + '" placeholder="如 1663">' +
      '<label>饮食模式</label>' +
      '<input type="hidden" id="set-mode" value="' + (s.dietMode || 'keto') + '">' +
      '<button type="button" class="trigger picker-trigger" data-act="pick-mode" style="text-align:left"><span id="set-mode-txt">' + ({keto:'生酮',lowcarb:'低碳',normal:'正常'}[s.dietMode] || '生酮') + '</span><span class="trig-caret">▾</span></button>' +
      avoidChips(s) +
      '<div class="row" style="gap:8px;margin-top:6px"><button class="btn" data-act="saveset">保存设置</button>' +
      '<button class="btn ghost" data-act="cancel-set">取消</button></div></div>';
  }

  // 「我的忌口」多选（过敏原）。点选后食谱/计划会自动避开并高亮警示
  function avoidChips(s) {
    var types = (global.KetoCore && global.KetoCore.ALLERGEN_TYPES) || ['蛋', '海鲜', '奶', '大豆', '花生', '坚果', '麸质'];
    var cur = (s.avoid && s.avoid.length) ? s.avoid : [];
    var chips = types.map(function (t) {
      var on = cur.indexOf(t) >= 0;
      return '<button type="button" class="chip ' + (on ? 'on' : '') + '" data-avoid="' + t + '" style="margin:0 6px 6px 0;padding:6px 12px;border-radius:999px;border:1px solid ' + (on ? 'var(--accent)' : '#ddd') + ';background:' + (on ? 'var(--accent)' : '#fff') + ';color:' + (on ? '#fff' : '#333') + ';font-size:13px">' + t + '</button>';
    }).join('');
    return '<label style="margin-top:10px">我的忌口（点选过敏原，食谱会自动避开并警示）</label>' +
      '<div id="avoidBox" style="display:flex;flex-wrap:wrap;margin-top:6px">' + chips + '</div>' +
      '<input type="hidden" id="set-avoid" value="' + cur.join(',') + '">';
  }

  function exportCsv() {
    var meals = Store.getAllMeals();
    var lines = ['日期,餐次,食物,数量,单位,热量,碳水,蛋白,脂肪'];
    Object.keys(meals).forEach(function (date) {
      var m = meals[date];
      ['breakfast', 'lunch', 'dinner'].forEach(function (slot) {
        (m[slot] || []).forEach(function (it) {
          lines.push([date, slot, it.name, it.amount, it.unit, it.calories, it.carb, it.protein, it.fat].join(','));
        });
      });
    });
    var ws = Store.getWeights();
    var wlines = ['日期,体重,体脂率,肌肉量,内脏脂肪,骨量,水分率,血酮,血糖'];
    ws.forEach(function (w) { wlines.push([w.date, w.weight, w.bodyFat, w.muscle, w.visceral, w.bone, w.water, w.ketone, w.glucose].join(',')); });

    var blob = new Blob(['﻿' + lines.join('\n') + '\n\n体重数据\n' + wlines.join('\n')], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '生酮打卡数据_' + Store.dateStr() + '.csv';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  // 导入 CSV（配对 exportCsv 的两段式格式：打卡段 + 体重段）。合并写入，不覆盖未导入的日期
  function importCsv(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var text = reader.result;
      var lines = text.split(/\r?\n/);
      var mode = 'meals';
      var seenMealHeader = false, seenWeightHeader = false;
      var allMeals = Store.getAllMeals();
      var mealsCount = 0, weightCount = 0, skipCount = 0;
      for (var i = 0; i < lines.length; i++) {
        var line = (lines[i] || '').trim();
        if (!line) continue;
        if (line === '体重数据') { mode = 'weights'; continue; }
        var cols = line.split(',');
        if (mode === 'meals') {
          if (!seenMealHeader) { seenMealHeader = true; continue; }
          if (cols.length < 9) continue;
          var date = cols[0], slot = cols[1];
          if (!allMeals[date]) allMeals[date] = { dietMode: Store.getSettings().dietMode, breakfast: [], lunch: [], dinner: [], exercises: [], steps: 0 };
          if (allMeals[date][slot] && Array.isArray(allMeals[date][slot])) {
            var item = {
              name: cols[2], amount: parseFloat(cols[3]) || 0, unit: cols[4],
              calories: parseFloat(cols[5]) || 0, carb: parseFloat(cols[6]) || 0,
              protein: parseFloat(cols[7]) || 0, fat: parseFloat(cols[8]) || 0
            };
            // P1-3：同日期+餐次+名称+份量+单位+热量 已存在则跳过，修复重复导入翻倍
            var existed = allMeals[date][slot].some(function (x) {
              return x.name === item.name && (x.amount || 0) === item.amount &&
                (x.unit || '') === item.unit && (x.calories || 0) === item.calories;
            });
            if (existed) skipCount++;
            else { allMeals[date][slot].push(item); mealsCount++; }
          }
        } else {
          if (!seenWeightHeader) { seenWeightHeader = true; continue; }
          if (cols.length < 2) continue;
          var w = { date: cols[0] };
          if (cols[1] !== '' && !isNaN(parseFloat(cols[1]))) w.weight = parseFloat(cols[1]);
          if (cols[2] !== '' && !isNaN(parseFloat(cols[2]))) w.bodyFat = parseFloat(cols[2]);
          if (cols[3] !== '' && !isNaN(parseFloat(cols[3]))) w.muscle = parseFloat(cols[3]);
          if (cols[4] !== '' && !isNaN(parseFloat(cols[4]))) w.visceral = parseFloat(cols[4]);
          if (cols[5] !== '' && !isNaN(parseFloat(cols[5]))) w.bone = parseFloat(cols[5]);
          if (cols[6] !== '' && !isNaN(parseFloat(cols[6]))) w.water = parseFloat(cols[6]);
          if (cols[7] !== '' && !isNaN(parseFloat(cols[7]))) w.ketone = parseFloat(cols[7]);
          if (cols[8] !== '' && !isNaN(parseFloat(cols[8]))) w.glucose = parseFloat(cols[8]);
          Store.addWeight(w);
          weightCount++;
        }
      }
      Store.saveAllMeals(allMeals);
      App.toast('已导入 ' + mealsCount + ' 条打卡' + (skipCount ? '（跳过重复 ' + skipCount + ' 条）' : '') + ' + ' + weightCount + ' 条体重');
      App.go('mine');
    };
    reader.onerror = function () { App.toast('读取文件失败'); };
    reader.readAsText(file, 'utf-8');
  }

  // M19-L1：阿福体脂秤半自动接入（阿福无第三方API，复制健康档案文本粘贴解析）
  function parseNum(txt, re) { var m = txt.match(re); return m ? parseFloat(m[1]) : null; }
  // 解析阿福健康档案文本 → 体重记录对象（不写 store，便于测试与复用）
  // dateOverride：补传历史数据时传入具体日期，否则默认当天
  function parseAfuText(txt, dateOverride) {
    txt = (txt || '').trim();
    if (!txt) return null;
    var w = parseNum(txt, /体重[^\d]*(\d+\.?\d*)\s*kg/);
    if (w == null) return null;
    var rec = { date: dateOverride || Store.dateStr(), weight: w };
    var bodyFat = parseNum(txt, /体脂[^\d]*(\d+\.?\d*)\s*%/);
    var muscle = parseNum(txt, /肌肉[^\d]*(\d+\.?\d*)\s*kg/);
    var visceral = parseNum(txt, /内脏[^\d]*(\d+\.?\d*)/);
    var bone = parseNum(txt, /骨量[^\d]*(\d+\.?\d*)\s*kg/);
    var water = parseNum(txt, /水分[^\d]*(\d+\.?\d*)\s*%/);
    var bmr = parseNum(txt, /基础代谢[^\d]*(\d+)/);
    if (bodyFat != null) rec.bodyFat = bodyFat;
    if (muscle != null) rec.muscle = muscle;
    if (visceral != null) rec.visceral = visceral;
    if (bone != null) rec.bone = bone;
    if (water != null) rec.water = water;
    if (bmr != null) rec.bmr = bmr;
    return rec;
  }
  // M19-L2（2026-08-16 改）：原 Tesseract.js 30MB 太大放弃，现改本地精简 tesseract.js v5（Apache 2.0 / 永久免费 / 无密钥），
  // 仅识别英文+数字（eng.traineddata 4MB）足够识别阿福秤数字。
  function readClipboardText() {
    if (!navigator.clipboard || !navigator.clipboard.readText) return Promise.resolve('');
    return navigator.clipboard.readText().catch(function () { return ''; });
  }

  // === OCR 引擎（本地 tesseract.js v5，资源在 02-app/vendor/ocr/） ===========================
  var _ocrWorker = null;
  var _ocrLoading = null;
  function ensureOcrWorker() {
    if (_ocrWorker) return Promise.resolve(_ocrWorker);
    if (_ocrLoading) return _ocrLoading;
    _ocrLoading = new Promise(function (resolve, reject) {
      function loadScript(src, ok) {
        var s = document.createElement('script');
        s.src = src; s.onload = ok; s.onerror = function () { reject(new Error('load fail: ' + src)); };
        document.head.appendChild(s);
      }
      loadScript('vendor/ocr/tesseract.min.js', function () {
        if (typeof Tesseract === 'undefined') { reject(new Error('Tesseract 未加载')); return; }
        Tesseract.createWorker('eng', 1, {
          workerPath: 'vendor/ocr/worker.min.js',
          corePath:   'vendor/ocr/tesseract-core-simd.wasm.js',
          langPath:   'vendor/ocr/'
        }).then(function (w) { _ocrWorker = w; resolve(w); }).catch(reject);
      });
    });
    return _ocrLoading;
  }
  // 把 OCR 原始文本（含数字+单位）规范化成 parseAfuText 期望的中文标签格式
  function normalizeOcrText(raw) {
    var norm = (raw || '').replace(/[oO]/g, '0').replace(/[lI|]/g, '1').replace(/\s+/g, ' ').trim();
    var fixed = norm
      .replace(/(\d+\.?\d*)\s*kg(?=\s|\d|$)/gi, '体重 $1kg ')
      .replace(/(\d+\.?\d*)\s*%/g, '体脂率 $1% ')
      .replace(/(\d+)\s*kcal/gi, '基础代谢 $1 ')
      .replace(/(\d+\.?\d*)\s*kg(?=\s|\d|$)/gi, '肌肉 $1kg ');
    // 没匹配到 "体重" 关键字时，按数字位置猜体重（第一个两位以上数字）
    if (!/体重/.test(fixed)) {
      var first = norm.match(/(\d{2,3}\.?\d*)/);
      if (first) fixed = '体重 ' + first[1] + 'kg ' + fixed;
    }
    return fixed;
  }
  function runOcrOnImage(dataUrl) {
    return ensureOcrWorker().then(function (worker) {
      return worker.recognize(dataUrl, {}, { text: true });
    }).then(function (ret) {
      return ret && ret.data ? ret.data.text : '';
    });
  }
  function afuImport(returnView) {
    returnView = returnView || 'mine';
    var today = Store.dateStr();
    var html = '<h3 style="margin-top:0">📟 导入阿福体脂数据</h3>' +
      '<p style="font-size:12px;color:var(--muted);margin:0 0 8px">阿福（蚂蚁）体脂秤称完数据后，三种导入方式任选：</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">' +
        '<button class="btn" id="afuClipboard" type="button">📋 读剪贴板</button>' +
        '<button class="btn ghost" id="afuPickBtn" type="button">📷 上传图片</button>' +
        '<input type="file" id="afuImg" accept="image/*" style="display:none">' +
      '</div>' +
      '<div id="afuOcr" style="font-size:12px;color:var(--muted);min-height:18px;margin:4px 0 8px"></div>' +
      '<p style="font-size:12px;color:var(--muted);margin:0 0 8px;line-height:1.7">① <strong>读剪贴板</strong>：在阿福里截图后，回到本 App，点「读剪贴板」自动识别数字。<br>' +
        '② <strong>上传图片</strong>：拍阿福秤屏幕 / 从相册选 → <strong>OCR 自动识别数字并填入下方文本框</strong>（在 App 内走手机端离线中文识别，无需联网、永久免费、秒级；浏览器内走本地 OCR 引擎）。<br>' +
        '③ <strong>手动</strong>：照着秤上数字敲进下面文本框（至少填体重）。</p>' +
      '<label>记录日期（补传历史数据请改成当天以外的日期）</label>' +
      '<input type="hidden" id="afuDate" value="' + today + '">' +
      '<button type="button" class="trigger picker-trigger" data-act="pick-afudate" id="afuDateBtn" style="margin-bottom:8px;text-align:left"><span>' + today + '</span><span class="trig-caret">📅</span></button>' +
      '<label>解析结果（可手动修改后保存）</label>' +
      '<textarea id="afuText" rows="5" placeholder="体重75.2kg 体脂率22.3% 肌肉38.1kg 水分率58.2% 基础代谢1650kcal" style="width:100%;border:1px solid #ddd;border-radius:10px;padding:8px;font-size:13px"></textarea>' +
      '<div id="afuPreview" style="margin-top:8px"></div>' +
      '<div style="display:flex;gap:8px;margin-top:10px">' +
        '<button class="btn" id="afuParse" type="button">保存记录</button>' +
        '<button class="btn ghost" id="afuCancel" type="button">取消</button>' +
      '</div>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    if (!modal) return;
    var ocr = modal.querySelector('#afuOcr');
    var ta = modal.querySelector('#afuText');
    var preview = modal.querySelector('#afuPreview');
    var dateInput = modal.querySelector('#afuDate');
    var pickBtn = modal.querySelector('#afuPickBtn');
    var imgInput = modal.querySelector('#afuImg');

    // 实时预览：把文本框解析成「将保存到 X：体重/体脂/肌肉…」的结构化确认卡
    function previewAfu() {
      var rec = parseAfuText(ta.value || '', dateInput.value || today);
      if (!rec) { preview.innerHTML = '<span style="color:#999;font-size:12px">在上方填入体重数字后，这里会实时显示将保存的内容</span>'; return; }
      var parts = ['体重 ' + rec.weight + ' kg'];
      if (rec.bodyFat != null) parts.push('体脂 ' + rec.bodyFat + ' %');
      if (rec.muscle != null) parts.push('肌肉 ' + rec.muscle + ' kg');
      if (rec.visceral != null) parts.push('内脏脂肪 ' + rec.visceral);
      if (rec.bone != null) parts.push('骨量 ' + rec.bone + ' kg');
      if (rec.water != null) parts.push('水分率 ' + rec.water + ' %');
      if (rec.bmr != null) parts.push('基础代谢 ' + rec.bmr);
      preview.innerHTML = '<div style="background:#eafaf1;border:1px solid #cdeadd;border-radius:10px;padding:10px;font-size:13px;line-height:1.85"><b>将保存到 ' + rec.date + '：</b><br>' + parts.map(function (p) { return '· ' + p; }).join('<br>') + '</div>';
    }
    ta.addEventListener('input', previewAfu);
    dateInput.addEventListener('change', previewAfu);
    previewAfu();

    function showOcr(text, note) {
      if (!text) { ocr.innerHTML = note || '<span style="color:#999">剪贴板为空。请用「上传图片」或手动输入。</span>'; return; }
      ta.value = text;
      var rec = parseAfuText(text, dateInput.value || today);
      previewAfu();
      if (rec) {
        ocr.innerHTML = '<span style="color:#0e9f6e">✓ 已识别：体重 ' + rec.weight + 'kg' + (rec.bodyFat != null ? ' · 体脂' + rec.bodyFat + '%' : '') + (note ? '（' + note + '）' : '') + '</span>';
      } else {
        ocr.innerHTML = '<span style="color:#d97706">⚠ 没识别到体重数字（格式：体重75.2kg 体脂率22.3% …）。可手动编辑下面文本框。</span>';
      }
    }
    modal.querySelector('#afuClipboard').addEventListener('click', function () {
      ocr.textContent = '正在读取剪贴板...';
      readClipboardText().then(function (txt) {
        if (txt) { showOcr(txt); App.toast(parseAfuText(txt, dateInput.value || today) ? '✓ 已从剪贴板识别' : '已读取文本，无体重数字'); }
        else { ocr.innerHTML = '<span style="color:#999">剪贴板无可用内容或浏览器拒绝读取。请用「上传图片」或手动输入。</span>'; }
      });
    });
    pickBtn.addEventListener('click', function () { imgInput.click(); });
    imgInput.addEventListener('change', function () {
      var f = imgInput.files && imgInput.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function (e) {
        var url = e.target.result;
        // 1. 显示缩略图 + 状态
        ocr.innerHTML =
          '<div style="display:flex;gap:10px;align-items:flex-start;margin:6px 0;padding:8px;background:#f6fdf9;border:1px solid #d0ead8;border-radius:8px">' +
            '<img id="afuThumb" src="' + url + '" style="width:120px;height:120px;object-fit:cover;border:1px solid #ddd;border-radius:6px;background:#fff">' +
            '<div style="font-size:12px;line-height:1.65;flex:1">' +
              '<div style="color:#0e9f6e;font-weight:600">已上传：' + f.name + '&#12288;' + Math.round(f.size/1024) + ' KB</div>' +
              '<div id="afuOcrStatus" style="color:#0e9f6e;margin-top:6px">识别中...</div>' +
              '<div style="color:#666;margin-top:6px;font-size:11px">正在用本机 AI 识别（无需联网、永久免费）。</div>' +
            '</div>' +
          '</div>';
        ta.value = ''; ta.placeholder = '识别中...';
        // 2. 优先走原生 ML Kit（APK 内，离线中文识别）；否则回退浏览器本地 OCR
        if (window.KetoNative && typeof window.KetoNative.recognizeImage === 'function') {
          window.__afuOcrCallback = function (payload) {
            var rawText = payload && payload.text ? payload.text : '';
            var st = modal.querySelector('#afuOcrStatus');
            if (st) st.innerHTML = '识别完成';
            if (rawText && rawText.trim()) {
              var fixed = normalizeOcrText(rawText);
              showOcr(fixed, 'OCR 自动识别（可手动校正）');
              App.toast(parseAfuText(fixed, dateInput.value || today) ? 'OCR 已自动填入数字' : 'OCR 完成，请手动校正');
            } else {
              ocr.innerHTML = '<span style="color:#d97706">OCR 没识别到任何文字。可手动输入下方文本框。</span>';
            }
          };
          try { window.KetoNative.recognizeImage(url, '__afuOcrCallback'); }
          catch (err) { ocr.innerHTML = '<span style="color:#d97706">本机识别调用失败，请手动输入。</span>'; }
        } else {
          runOcrOnImage(url).then(function (rawText) {
            var st = modal.querySelector('#afuOcrStatus');
            if (st) st.innerHTML = '识别完成';
            if (rawText && rawText.trim()) {
              var fixed = normalizeOcrText(rawText);
              showOcr(fixed, 'OCR 自动识别（可手动校正）');
              App.toast(parseAfuText(fixed, dateInput.value || today) ? 'OCR 已自动填入数字' : 'OCR 完成，请手动校正');
            } else {
              ocr.innerHTML = '<span style="color:#d97706">OCR 没识别到文字，请手动输入。</span>';
            }
          }).catch(function (err) {
            ocr.innerHTML = '<span style="color:#d97706">OCR 引擎加载失败，请手动输入。</span>';
          });
        }
      };
      r.readAsDataURL(f);
    });
    modal.querySelector('#afuParse').addEventListener('click', function () {
      var date = dateInput.value || today;
      var rec = parseAfuText(ta.value || '', date);
      if (!rec) { App.toast('没解析到体重，请检查格式'); return; }
      Store.addWeight(rec);
      App.closeModal();
      App.toast('已导入体脂 ' + date + (rec.bodyFat != null ? ' · 体脂' + rec.bodyFat + '%' : ''));
      App.go(returnView);
    });
    modal.querySelector('#afuCancel').addEventListener('click', function () { App.closeModal(); });
  }

  // === v2.0：阿福体脂秤 BLE 蓝牙直连（仅原生 APK 可用）==============================
  // 流程：读成员档案(性别/年龄/身高) → 写秤 → 扫描 → 选设备 → 连接 → 实时重量 → 锁定保存
  function afuBleProfile() {
    var m = Store.getActiveMember() || {};
    var sex = (m.sex === '女') ? 2 : 1;
    var year = new Date().getFullYear();
    var age = (m.birthYear && m.birthYear > 1900) ? (year - m.birthYear) : 40;
    var height = m.height || 170;
    return { sex: sex, age: age, height: height, name: m.name || '我' };
  }

  function afuBleImport(returnView) {
    returnView = returnView || 'mine';

    if (!window.AfuScale || !window.AfuScale.available()) {
      App.toast('蓝牙直连需安装手机版 App，网页版请用上方导入方式');
      return;
    }

    var p = afuBleProfile();
    var html = '<h3 style="margin-top:0">📶 体脂秤蓝牙直连</h3>' +
      '<p style="font-size:12px;color:var(--muted);margin:0 0 6px">' +
        '当前身份：<b>' + p.name + '</b> · ' + (p.sex === 1 ? '男' : '女') + ' · ' + p.age + '岁 · ' + p.height + 'cm' +
        '（用于计算体脂率，不对请到「基础资料」修改）</p>' +
      '<div id="bleStep" style="background:#f6fdf9;border:1px solid #d0ead8;border-radius:10px;padding:12px;text-align:center;margin:10px 0">' +
        '<div style="font-size:13px;color:#0e9f6e;font-weight:600">准备扫描</div>' +
        '<div style="font-size:11px;color:#666;margin-top:4px">请<b>先光脚轻踩一下体脂秤</b>唤醒它（秤平时不广播）</div>' +
      '</div>' +
      '<div id="bleWeight" style="text-align:center;font-size:38px;font-weight:800;color:var(--accent);margin:14px 0;letter-spacing:-1px">--.-</div>' +
      '<div id="bleTip" style="text-align:center;font-size:12px;color:var(--muted);min-height:18px">等待连接</div>' +
      '<div id="bleList" style="margin:10px 0"></div>' +
      '<div id="bleResult" style="margin:10px 0"></div>' +
      '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">' +
        '<button class="btn" id="bleScan" type="button">🔍 扫描体脂秤</button>' +
        '<button class="btn ghost" id="bleSave" type="button" style="display:none">保存记录</button>' +
        '<button class="btn ghost" id="bleCancel" type="button">取消</button>' +
      '</div>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    if (!modal) return;

    var stepEl = modal.querySelector('#bleStep');
    var wEl = modal.querySelector('#bleWeight');
    var tipEl = modal.querySelector('#bleTip');
    var listEl = modal.querySelector('#bleList');
    var resEl = modal.querySelector('#bleResult');
    var saveBtn = modal.querySelector('#bleSave');
    var lastResult = null;
    var autoSaved = false;

    function setStep(title, desc, color) {
      stepEl.innerHTML = '<div style="font-size:13px;font-weight:600;color:' + (color || '#0e9f6e') + '">' + title + '</div>' +
        (desc ? '<div style="font-size:11px;color:#666;margin-top:4px">' + desc + '</div>' : '');
    }

    // 写入用户档案（BIA 计算必需）
    window.AfuScale.setProfile(p.sex, p.age, p.height);

    modal.querySelector('#bleScan').addEventListener('click', function () {
      setStep('正在扫描…', '保持体脂秤处于唤醒状态');
      tipEl.textContent = '扫描中（约 10 秒）…';
      window.AfuScale.scan(function (err, devices) {
        if (err) {
          setStep('扫描失败', String(err), '#d97706');
          tipEl.textContent = '请确认蓝牙已开启且已授权';
          return;
        }
        if (!devices || !devices.length) {
          setStep('没找到体脂秤', '请光脚轻踩秤面唤醒后重试', '#d97706');
          tipEl.textContent = '没扫到设备';
          return;
        }
        setStep('找到 ' + devices.length + ' 台设备', '点击连接');
        tipEl.textContent = '选择你的体脂秤';
        listEl.innerHTML = devices.map(function (d, i) {
          return '<div class="ble-dev" data-i="' + i + '" role="button" tabindex="0" ' +
            'style="padding:10px;border:1px solid #d0ead8;border-radius:8px;margin:6px 0;cursor:pointer;background:#f6fdf9">' +
            '<b>' + d.name + '</b><br><span style="font-size:11px;color:#888">' + d.address + '</span></div>';
        }).join('');
        Array.prototype.forEach.call(listEl.querySelectorAll('.ble-dev'), function (el) {
          el.addEventListener('click', function () {
            var d = devices[parseInt(el.getAttribute('data-i'), 10)];
            connectTo(d);
          });
        });
      });
    });

    function connectTo(d) {
      setStep('正在连接…', d.name);
      tipEl.textContent = '连接中…';
      window.AfuScale.connect(d.address, {
        onWeight: function (kg, locked) {
          wEl.textContent = kg.toFixed(1);
          tipEl.textContent = locked ? '✓ 数据已锁定' : '测量中，请站稳…';
        },
        onResult: function (e, r) {
          if (e || !r) { tipEl.textContent = '读取失败：' + String(e); return; }
          lastResult = r;
          wEl.textContent = r.weightKg.toFixed(1);
          tipEl.textContent = '✓ 测量完成';
          setStep('测量完成', d.name);
          resEl.innerHTML =
            '<div style="background:#eafaf1;border:1px solid #cdeadd;border-radius:10px;padding:10px;font-size:13px;line-height:1.9">' +
              '<b>体成分分析结果</b><br>' +
              '· 体重 <b>' + r.weightKg.toFixed(1) + '</b> kg<br>' +
              '· 体脂率 <b>' + r.bodyFatPct.toFixed(1) + '</b> %<br>' +
              '· BMI <b>' + r.bmi.toFixed(1) + '</b><br>' +
              '· 肌肉量 <b>' + r.muscleKg.toFixed(1) + '</b> kg<br>' +
              '· 水分率 <b>' + r.waterPct.toFixed(1) + '</b> %<br>' +
              '· 骨量 <b>' + r.boneKg.toFixed(2) + '</b> kg<br>' +
              '· 基础代谢 <b>' + r.bmr + '</b> kcal' +
            '</div>';
          saveBtn.style.display = '';
          // 自用追求效率：结果出来 1.5 秒后自动保存并关闭，期间点「取消」可中断
          tipEl.textContent = '✓ 测量完成，1.5 秒后自动保存…';
          window.setTimeout(function () {
            if (autoSaved) return;
            if (!document.body.contains(saveBtn)) return; // 弹窗已关
            saveBtn.click();
          }, 1500);
        },
        onError: function (msg) {
          tipEl.textContent = '错误：' + msg;
          setStep('连接异常', String(msg), '#d97706');
        }
      });
    }

    saveBtn.addEventListener('click', function () {
      if (autoSaved) return;
      if (!lastResult) { App.toast('还没有测量结果'); return; }
      autoSaved = true;
      var rec = {
        date: Store.dateStr(),
        weight: lastResult.weightKg,
        bodyFat: lastResult.bodyFatPct,
        muscle: lastResult.muscleKg,
        bone: lastResult.boneKg,
        water: lastResult.waterPct,
        bmr: lastResult.bmr
      };
      Store.addWeight(rec);
      // 同步更新成员档案里的当前体重（趋势页/首页进度环会用到）
      Store.saveActiveMemberProfile({ weight: lastResult.weightKg });
      App.closeModal();
      App.toast('已保存 ' + rec.date + ' · 体重 ' + rec.weight.toFixed(1) + 'kg · 体脂 ' + rec.bodyFat.toFixed(1) + '%');
      App.go(returnView);
    });

    modal.querySelector('#bleCancel').addEventListener('click', function () {
      autoSaved = true; // 中断自动保存
      try { window.AfuScale.disconnect(); } catch (e) {}
      App.closeModal();
    });
  }

  // 当前身份卡（点击切换爸爸/妈妈/逸凡，入口从顶栏移到这里，符合"一次性行为"）
  function memberCard() {
    var mem = Store.getActiveMember();
    var name = mem ? mem.name : '我';
    return '<div class="card" data-act="switch-member" role="button" tabindex="0" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between">' +
      '<div><h3 style="margin:0 0 4px">👤 当前身份</h3><p class="meta" style="font-size:12px;color:var(--muted);margin:0">点击切换为 爸爸 / 妈妈 / 逸凡</p></div>' +
      '<div style="font-size:16px;font-weight:700;color:var(--accent)">' + name + ' ›</div></div>';
  }

  function render(el) {
    el.innerHTML = memberCard() + healthCard() + App.kids.renderCard() + settingsForm() + '<div id="familyCard"></div>' +
      '<div class="card afu-card">' +
      '<h3>📟 阿福体脂秤</h3>' +
      '<p class="meta" style="font-size:12px;color:var(--muted);margin:0 0 10px">蓝牙直连自动读全部体成分；也可手动录入或拍照 OCR 识别。</p>' +
      '<div class="row" style="gap:8px;flex-wrap:wrap">' +
      (window.AfuScale && window.AfuScale.available()
        ? '<button class="btn" data-act="afu-ble">📶 蓝牙直连</button>'
        : '') +
      '<button class="btn ' + (window.AfuScale && window.AfuScale.available() ? 'ghost' : '') + '" data-act="afu-import">✍️ 手动 / OCR 导入</button>' +
      '</div></div>' +
      '<div class="card"><h3>知识</h3><button class="btn ghost" data-act="kbhub">' + ICONS.svg('book', 16) + ' 知识中心（查询·计划·工具）</button>' +
      '<p class="meta" style="font-size:12px;color:var(--muted);margin-top:6px">含食材查询、每日饮食计划、外食指南、净碳水计算、适应期自测，基于《Atkins 新阿特金斯》《控糖革命》蒸馏，仅供参考。</p></div>' +
      '<div class="card"><h3>数据</h3><div class="row" style="gap:8px">' +
      '<button class="btn ghost" data-act="export">' + ICONS.svg('download', 16) + ' 导出 CSV</button>' +
      '<button class="btn ghost" data-act="import">' + ICONS.svg('upload', 16) + ' 导入 CSV</button></div>' +
      '<input type="file" id="csvFile" accept=".csv" style="display:none">' +
      '<p class="meta" style="font-size:12px;color:var(--muted);margin-top:6px">数据仅存于本机浏览器。换设备 / 清缓存前先「导出」，重装或换机后在此「导入」即可恢复全部打卡与体重。</p></div>' +
      '<div class="card"><h3>📲 安装到主屏幕</h3><p class="meta" style="font-size:12px;color:var(--muted);margin:0 0 8px">加到主屏幕后可全屏离线使用，像原生 App。Android 会自动弹安装提示；iOS 请点下方按钮看步骤。</p>' +
      '<button class="btn ghost" data-act="install">' + ICONS.svg('downloadBox', 16) + ' 查看安装方法</button></div>';
  }

  function bind(el) {
    el.addEventListener('click', function (e) {
      // 「我的忌口」多选 chips：先于 data-act 处理
      var c = e.target.closest('[data-avoid]');
      if (c) {
        c.classList.toggle('on');
        var on = c.classList.contains('on');
        c.style.background = on ? 'var(--accent)' : '#fff';
        c.style.color = on ? '#fff' : '#333';
        c.style.borderColor = on ? 'var(--accent)' : '#ddd';
        var sel = Array.prototype.slice.call(el.querySelectorAll('[data-avoid].on')).map(function (x) { return x.getAttribute('data-avoid'); });
        var hid = el.querySelector('#set-avoid'); if (hid) hid.value = sel.join(',');
        return;
      }
      var b = e.target.closest('[data-act]'); if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'saveset') {
        var s = Store.getSettings();
        s.gender = el.querySelector('#set-gender').value;
        s.height = parseInt(el.querySelector('#set-height').value, 10) || 170;
        s.birthYear = parseInt(el.querySelector('#set-birth').value, 10) || 1985;
        s.activityLevel = el.querySelector('#set-act').value;
        s.activityFactor = ACT_FACTOR[s.activityLevel];
        s.startWeight = parseFloat(el.querySelector('#set-start').value) || 70;
        s.targetWeight = parseFloat(el.querySelector('#set-target').value) || 65;
        var bm = el.querySelector('#set-bmr').value;
        s.baseMetabolism = bm ? (parseInt(bm, 10)) : null;
        s.dietMode = el.querySelector('#set-mode').value;
        var av = el.querySelector('#set-avoid');
        s.avoid = av && av.value ? av.value.split(',').filter(Boolean) : [];
        Store.saveSettings(s);
        _editProfile = false; // 保存后回到只读，避免误触
        App.toast('设置已保存'); App.go('mine');
      } else if (act === 'edit-set') {
        _editProfile = true; App.go('mine');
      } else if (act === 'cancel-set') {
        _editProfile = false; App.go('mine');
      } else if (act === 'export') {
        exportCsv(); App.toast('已导出 CSV');
      } else if (act === 'import') {
        var fi = el.querySelector('#csvFile'); if (fi) fi.click();
      } else if (act === 'kids-add') {
        App.kids.editProfile();
      } else if (act === 'kids-open') {
        App.kids.showDashboard();
      } else if (act === 'switch-member') {
        App.openMemberSwitch();
      } else if (act === 'afu-import') {
        afuImport();
      } else if (act === 'afu-ble') {
        afuBleImport();
      } else if (act === 'kbhub') {
        KnowledgeTools.openHub();
      } else if (act === 'install') {
        if (App.installApp) App.installApp();
      } else if (act === 'pick-gender') {
        App.openPicker({
          title: '性别', value: el.querySelector('#set-gender').value,
          items: [{ value: '男', label: '男' }, { value: '女', label: '女' }],
          onPick: function (v) { var h = el.querySelector('#set-gender'); h.value = v; var t = el.querySelector('#set-gender-txt'); if (t) t.textContent = v; }
        });
      } else if (act === 'pick-act') {
        var actItems = Object.keys(ACT_MAP).map(function (k) { return { value: k, label: ACT_MAP[k] }; });
        App.openPicker({
          title: '活动水平', value: el.querySelector('#set-act').value, items: actItems,
          onPick: function (v) {
            var h = el.querySelector('#set-act'); h.value = v;
            var t = el.querySelector('#set-act-txt'); if (t) t.textContent = ACT_MAP[v] || v;
          }
        });
      } else if (act === 'pick-mode') {
        App.openPicker({
          title: '饮食模式', value: el.querySelector('#set-mode').value,
          items: [{ value: 'keto', label: '生酮' }, { value: 'lowcarb', label: '低碳' }, { value: 'normal', label: '正常' }],
          onPick: function (v) {
            var h = el.querySelector('#set-mode'); h.value = v;
            var t = el.querySelector('#set-mode-txt'); if (t) t.textContent = ({keto:'生酮',lowcarb:'低碳',normal:'正常'}[v] || v);
          }
        });
      } else if (act === 'pick-afudate') {
        var h = el.querySelector('#afuDate');
        App.openDatePicker({
          title: '记录日期', value: h.value, max: Store.dateStr(),
          onPick: function (iso) {
            h.value = iso;
            var btn = el.querySelector('#afuDateBtn'); if (btn) { var sp = btn.querySelector('span'); if (sp) sp.textContent = iso; }
          }
        });
      }
    });
    el.addEventListener('change', function (e) {
      if (e.target && e.target.id === 'csvFile') importCsv(e.target.files[0]);
    });
  }

  App.mine = {
    onShow: function (el) { render(el); App.family.render(el); if (!el._dBound) { bind(el); App.family.bind(el); el._dBound = true; } },
    parseAfuText: parseAfuText,
    openAfuImport: afuImport,
    openAfuBle: afuBleImport
  };
})(window);
