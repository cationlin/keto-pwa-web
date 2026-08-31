// g-kids.js — 青少年(被监护)运动营养板块「成长的他」
// 设计硬约束：严禁对未成年人套用成人生酮/严格低碳；改用"均衡增肌减脂 + 生长发育友好"模式。
// 数据：Store.kidsProfile / Store.kidsGrowth（独立于成人 keto 引擎）
// 儿童 BMI 百分位：采用《中国学龄儿童青少年超重与肥胖筛查》(WS/T 586) 年龄别 BMI 界值(P85超重/P95肥胖)，
//   P3/P15/P50 及百分位数值为基于官方界值的合理近似展示，分级判定严格以真实 P85/P95 为准。
(function (global) {
  'use strict';

  // 每岁 [P50中位, P85超重界, P95肥胖界]（kg/m²），中国标准（男/女）
  var BMI_CN = {
    '男': { 6:[15.3,16.4,17.7], 7:[15.8,17.0,18.7], 8:[16.4,17.8,19.7], 9:[17.0,18.5,20.8],
            10:[17.6,19.2,21.9], 11:[18.2,19.9,22.9], 12:[18.8,20.7,23.8], 13:[19.4,21.4,24.8],
            14:[20.0,22.2,25.7], 15:[20.6,22.9,26.5], 16:[21.1,23.5,27.2], 17:[21.6,24.1,27.8], 18:[22.0,24.7,28.4] },
    '女': { 6:[15.0,16.2,17.5], 7:[15.4,16.8,18.5], 8:[16.0,17.6,19.4], 9:[16.6,18.5,20.4],
            10:[17.2,19.3,21.5], 11:[17.8,20.1,22.5], 12:[18.4,20.8,23.3], 13:[18.9,21.4,24.1],
            14:[19.4,22.0,24.8], 15:[19.8,22.5,25.4], 16:[20.2,22.9,25.9], 17:[20.5,23.3,26.4], 18:[20.8,23.6,26.8] }
  };

  function ageOf(birthYear) {
    if (!birthYear) return 12;
    var a = new Date().getFullYear() - birthYear;
    if (isNaN(a)) return 12;
    if (a < 6) a = 6; if (a > 18) a = 18;
    return a;
  }

  // 返回 { pctl, level, hint } —— level: under/normal/overweight/obese
  function childBmiPctl(age, sex, bmi) {
    var t = BMI_CN[sex] || BMI_CN['男'];
    var a = Math.floor(age); if (a < 6) a = 6; if (a > 18) a = 18;
    var row = t[a] || t[12];
    var p50 = row[0], p85 = row[1], p95 = row[2];
    var p3 = +(p50 * 0.88).toFixed(1), p15 = +(p50 * 0.93).toFixed(1);
    var pctl, level, hint;
    if (bmi < p3) { level = 'under'; hint = '偏瘦'; pctl = Math.max(1, Math.round(bmi / p3 * 3)); }
    else if (bmi < p50) { level = 'normal'; hint = '正常'; pctl = Math.round(3 + (bmi - p3) / (p50 - p3) * 47); }
    else if (bmi < p85) { level = 'normal'; hint = '正常'; pctl = Math.round(50 + (bmi - p50) / (p85 - p50) * 35); }
    else if (bmi < p95) { level = 'overweight'; hint = '超重'; pctl = Math.round(85 + (bmi - p85) / (p95 - p85) * 10); }
    else { level = 'obese'; hint = '肥胖'; pctl = Math.round(95 + Math.min(4, (bmi - p95) / (p95 * 0.18) * 4)); }
    if (pctl > 99) pctl = 99;
    return { pctl: pctl, level: level, hint: hint };
  }

  // 专属营养引擎（覆盖成人 keto 引擎）：均衡增肌减脂 + 生长发育友好
  function teenEngine(p) {
    var sex = p.sex || '男';
    var age = ageOf(p.birthYear);
    var h = (p.height || 169) / 100;
    var w = p.weight || 75;
    var bmi = +(w / (h * h)).toFixed(1);
    var bp = childBmiPctl(age, sex, bmi);

    // 目标体重：锚定该年龄 P50 中位（温和减脂目标，不激进）
    var t = BMI_CN[sex] || BMI_CN['男'];
    var a = Math.floor(age); if (a < 6) a = 6; if (a > 18) a = 18;
    var p50 = (t[a] || t[12])[0];
    var targetWeight = +(p50 * h * h).toFixed(1);

    // TDEE：Mifflin-StJeor（青少年同公式）+ 活动系数（篮球训练频率越高越强）
    var tw = p.trainPerWeek || 3;
    var actFactor = tw >= 4 ? 1.725 : (tw >= 2 ? 1.55 : 1.375);
    var bmr = (sex === '男')
      ? Math.round(10 * w + 6.25 * (h * 100) - 5 * age + 5)
      : Math.round(10 * w + 6.25 * (h * 100) - 5 * age - 161);
    var tdee = Math.round(bmr * actFactor);

    // 热量：偏瘦则维持/微增(+200)，否则轻微缺口(≤300)靠运动造缺口，绝不激进节食
    var deficit = bp.level === 'under' ? -200 : 300;
    var target = Math.round(tdee - deficit);

    // 宏量：高蛋白 1.8 g/kg；碳水充足（训练日 50%）；脂肪补足剩余并 ≥20% 热量
    var proteinG = Math.round(1.8 * w);
    var carbG = Math.round(target * 0.5 / 4);
    var fatFromCarbPro = proteinG * 4 + carbG * 4;
    var fatG = Math.round((target - fatFromCarbPro) / 9);
    if (fatG < Math.round(target * 0.2 / 9)) {
      fatG = Math.round(target * 0.25 / 9);
      // 重算碳水填补
      carbG = Math.round((target - proteinG * 4 - fatG * 9) / 4);
    }

    // 生长发育重点微量（非热量，仅提示）
    var micro = [
      { k: '钙', v: '1300 mg/天', why: '骨骼生长峰值，牛奶/酸奶/豆制品/绿叶菜' },
      { k: '维生素D', v: '600 IU/天', why: '促钙吸收，晒太阳+深海鱼+强化奶' },
      { k: '铁', v: '男 11–15 mg/天', why: '青春期血容量扩张，红肉/动物肝/菠菜' },
      { k: '锌', v: '男 11 mg/天', why: '生长发育与免疫，牡蛎/瘦肉/坚果' }
    ];

    return {
      age: age, bmi: bmi, bp: bp, pctl: bp.pctl, level: bp.level, hint: bp.hint,
      targetWeight: targetWeight, bmr: bmr, tdee: tdee, target: target,
      proteinG: proteinG, carbG: carbG, fatG: fatG, micro: micro
    };
  }

  // 周菜单：复用 DISH_DB（normal 池=碳水充足）按青少年规则筛选；加餐用健康高蛋白+碳水选项
  function buildMenuPool() {
    var pool = [];
    try {
      var db = (global.KetoCore && global.KetoCore.DISH_DB) || {};
      var normal = db.normal || [];
      // 优质正餐：蛋白≥6 且 脂肪≤18（高蛋白·控油）
      normal.forEach(function (d) {
        if ((d.protein || 0) >= 6 && (d.fat || 0) <= 18) pool.push(d);
      });
    } catch (e) {}
    if (!pool.length) pool = [{ name: '清蒸鱼', cal: 180, carb: 0, protein: 30, fat: 6 },
      { name: '番茄炒蛋', cal: 160, carb: 6, protein: 12, fat: 10 },
      { name: '白灼虾', cal: 120, carb: 1, protein: 22, fat: 3 }];
    return pool;
  }
  var SNACKS = ['牛奶(250ml)', '煮鸡蛋', '香蕉', '无糖酸奶', '全麦面包', '燕麦'];

  function teenTrainingSnack() {
    return {
      pre: ['训练前 1 小时：1 根香蕉 + 1 个煮鸡蛋（轻碳 + 蛋白，供能不负担）',
            '或：1 片全麦面包 + 少量花生酱'],
      post: ['训练后 30–60 分钟窗口：250ml 牛奶 + 1 根香蕉（蛋白 + 碳水，助恢复）',
             '或：无糖酸奶 + 燕麦 + 蓝莓']
    };
  }

  function teenWeeklyMenu(p, eng) {
    var pool = buildMenuPool();
    var days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    var tw = p.trainPerWeek || 3;
    var trainDays = {}; // 模拟训练日分布
    for (var i = 0; i < tw && i < 7; i++) trainDays[(i * 7 / Math.max(tw, 1)) | 0] = true;
    var out = [];
    days.forEach(function (dn, idx) {
      var pick = function (n) {
        var r = [];
        for (var k = 0; k < n; k++) r.push(pool[(idx * 3 + k) % pool.length]);
        return r;
      };
      var isTrain = !!trainDays[idx];
      out.push({
        day: dn, train: isTrain,
        breakfast: pick(2),
        lunch: pick(2),
        dinner: pick(2),
        snack: isTrain ? ['牛奶(250ml)', '香蕉'] : ['无糖酸奶']
      });
    });
    return out;
  }

  // 成长曲线 SVG（身高 / 儿童BMI百分位）
  function growthChart(growth) {
    if (!growth || !growth.length) {
      return '<div class="empty-illu"><div class="illu">📈</div><div class="t">还没有生长记录</div><div class="s">在仪表盘点「记录今日身高体重」开始监测</div></div>';
    }
    var W = 320, H = 160, pad = 22;
    var n = growth.length;
    var maxH = 0, maxP = 0;
    growth.forEach(function (g) { if (g.height > maxH) maxH = g.height; if ((g.pctl || 0) > maxP) maxP = g.pctl; });
    maxH = Math.ceil((maxH + 5) / 5) * 5; maxP = 100;
    var x = function (i) { return pad + i * (W - pad * 2) / Math.max(1, n - 1); };
    var yH = function (v) { return H - pad - (v / maxH) * (H - pad * 2); };
    var yP = function (v) { return H - pad - (v / maxP) * (H - pad * 2); };
    var lineH = '', lineP = '';
    growth.forEach(function (g, i) {
      var cmd = (i === 0 ? 'M' : 'L') + x(i).toFixed(1) + ' ' + yH(g.height).toFixed(1) + ' ';
      lineH += cmd;
      var cmd2 = (i === 0 ? 'M' : 'L') + x(i).toFixed(1) + ' ' + yP(g.pctl || 0).toFixed(1) + ' ';
      lineP += cmd2;
    });
    var dots = growth.map(function (g, i) {
      return '<circle cx="' + x(i).toFixed(1) + '" cy="' + yH(g.height).toFixed(1) + '" r="3" fill="#0e9f6e"/>';
    }).join('');
    var dotsP = growth.map(function (g, i) {
      return '<circle cx="' + x(i).toFixed(1) + '" cy="' + yP(g.pctl || 0).toFixed(1) + '" r="3" fill="#f59e0b"/>';
    }).join('');
    var labels = growth.map(function (g, i) {
      return '<text x="' + x(i).toFixed(1) + '" y="' + (H - 6) + '" font-size="9" fill="#888" text-anchor="middle">' + g.date.slice(5) + '</text>';
    }).join('');
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;height:auto">' +
      '<line x1="' + pad + '" y1="' + (H - pad) + '" x2="' + (W - pad) + '" y2="' + (H - pad) + '" stroke="#eee"/>' +
      '<path d="' + lineH + '" fill="none" stroke="#0e9f6e" stroke-width="2"/>' +
      '<path d="' + lineP + '" fill="none" stroke="#f59e0b" stroke-width="2"/>' +
      dots + dotsP + labels +
      '<text x="' + (W - pad) + '" y="14" font-size="9" fill="#0e9f6e" text-anchor="end">身高(cm)</text>' +
      '<text x="' + pad + '" y="14" font-size="9" fill="#f59e0b">BMI百分位</text></svg>';
  }

  // ---- UI ----
  function renderCard() {
    var p = Store.getKidsProfile();
    if (!p) {
      return '<div class="card" style="border:1.5px solid var(--primary);border-radius:14px">' +
        '<h3>🏀 成长的他 <span class="sub">青少年运动营养</span></h3>' +
        '<p class="meta" style="font-size:12px;color:var(--muted);margin:4px 0 10px">专属定制：减重增肌又不误生长发育。先添加娃的档案。</p>' +
        '<button class="btn" data-act="kids-add">＋ 添加成员档案</button></div>';
    }
    var eng = teenEngine(p);
    var lvColor = eng.level === 'obese' ? '#dc2626' : (eng.level === 'overweight' ? '#f59e0b' : '#0e9f6e');
    return '<div class="card" style="border:1.5px solid var(--primary);border-radius:14px">' +
      '<h3>🏀 成长的他 <span class="sub">' + (p.name || '娃') + ' · ' + (p.sport || '篮球') + '</span></h3>' +
      '<p class="meta" style="font-size:12px;color:var(--muted);margin:4px 0 8px">儿童BMI百分位 <b style="color:' + lvColor + '">' + eng.pctl + 'th（' + eng.hint + '）</b> · 目标热量 <b>' + eng.target + '</b> kcal · 蛋白 ' + eng.proteinG + 'g</p>' +
      '<div class="row" style="gap:8px"><button class="btn sm" data-act="kids-open">查看仪表盘</button>' +
      '<button class="btn ghost sm" data-act="kids-add">编辑档案</button></div></div>';
  }

  function editProfile() {
    var p = Store.getKidsProfile() || { name: '娃', sex: '男', birthYear: new Date().getFullYear() - 12, height: 169, weight: 75, sport: '篮球', trainPerWeek: 3, goal: '增肌减脂不误发育' };
    var html = '<h3 style="margin-top:0">🏀 青少年档案</h3>' +
      '<label>昵称</label><input id="kpName" value="' + (p.name || '') + '">' +
      '<div class="row"><div><label>性别</label>' +
        '<input type="hidden" id="kpSex" value="' + (p.sex || '男') + '">' +
        '<button type="button" class="trigger picker-trigger" data-act="pick-kpsex" style="text-align:left"><span id="kpSex-txt">' + (p.sex || '男') + '</span><span class="trig-caret">▾</span></button>' +
      '</div>' +
      '<div><label>出生年</label><input id="kpYear" type="number" value="' + (p.birthYear || '') + '"></div></div>' +
      '<div class="row"><div><label>身高(cm)</label><input id="kpHeight" type="number" value="' + (p.height || '') + '"></div>' +
      '<div><label>当前体重(kg)</label><input id="kpWeight" type="number" step="0.1" value="' + (p.weight || '') + '"></div></div>' +
      '<div class="row"><div><label>运动项目</label><input id="kpSport" value="' + (p.sport || '篮球') + '"></div>' +
      '<div><label>每周训练(次)</label><input id="kpTrain" type="number" value="' + (p.trainPerWeek || 3) + '"></div></div>' +
      '<label>目标</label><input id="kpGoal" value="' + (p.goal || '增肌减脂不误发育') + '">' +
      '<button class="btn" id="kpSave" style="margin-top:12px">保存</button>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    if (modal) {
      // 性别 picker（替换原 select）
      var sexBtn = modal.querySelector('[data-act="pick-kpsex"]');
      if (sexBtn) sexBtn.addEventListener('click', function () {
        App.openPicker({
          title: '性别', value: modal.querySelector('#kpSex').value,
          items: [{ value: '男', label: '男' }, { value: '女', label: '女' }],
          onPick: function (v) {
            modal.querySelector('#kpSex').value = v;
            var t = modal.querySelector('#kpSex-txt'); if (t) t.textContent = v;
          }
        });
      });
      modal.querySelector('#kpSave').addEventListener('click', function () {
        var np = {
          name: (modal.querySelector('#kpName').value || '').trim() || '娃',
          sex: modal.querySelector('#kpSex').value,
          birthYear: parseInt(modal.querySelector('#kpYear').value, 10) || (new Date().getFullYear() - 12),
          height: parseFloat(modal.querySelector('#kpHeight').value) || 169,
          weight: parseFloat(modal.querySelector('#kpWeight').value) || 75,
          sport: (modal.querySelector('#kpSport').value || '').trim() || '篮球',
          trainPerWeek: parseInt(modal.querySelector('#kpTrain').value, 10) || 3,
          goal: (modal.querySelector('#kpGoal').value || '').trim() || '增肌减脂不误发育'
        };
        Store.saveKidsProfile(np);
        recordGrowthToday(np);
        App.closeModal();
        App.toast('已保存' + np.name + '的档案');
        App.go('mine');
      });
    }
  }

  function recordGrowthToday(p) {
    if (!p || !p.height || !p.weight) return;
    var h = p.height / 100;
    var bmi = +(p.weight / (h * h)).toFixed(1);
    var bp = childBmiPctl(ageOf(p.birthYear), p.sex, bmi);
    Store.addKidsGrowth({ date: Store.dateStr(), height: p.height, weight: p.weight, bmi: bmi, pctl: bp.pctl });
  }

  function recordGrowth() {
    var p = Store.getKidsProfile();
    if (!p) { App.toast('请先添加档案'); editProfile(); return; }
    var html = '<h3 style="margin-top:0">记录今日身高体重</h3>' +
      '<div class="row"><div><label>身高(cm)</label><input id="kgH" type="number" value="' + (p.height || '') + '"></div>' +
      '<div><label>体重(kg)</label><input id="kgW" type="number" step="0.1" value="' + (p.weight || '') + '"></div></div>' +
      '<button class="btn" id="kgSave" style="margin-top:12px">保存今日记录</button>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    if (modal) modal.querySelector('#kgSave').addEventListener('click', function () {
      var h = parseFloat(modal.querySelector('#kgH').value) || p.height;
      var w = parseFloat(modal.querySelector('#kgW').value) || p.weight;
      var bmi = +(w / ((h / 100) * (h / 100))).toFixed(1);
      var bp = childBmiPctl(ageOf(p.birthYear), p.sex, bmi);
      Store.addKidsGrowth({ date: Store.dateStr(), height: h, weight: w, bmi: bmi, pctl: bp.pctl });
      p.height = h; p.weight = w; Store.saveKidsProfile(p);
      App.closeModal();
      App.toast('已记录 · BMI百分位 ' + bp.pctl + 'th（' + bp.hint + '）');
      showDashboard();
    });
  }

  function showDashboard() {
    var p = Store.getKidsProfile();
    if (!p) { editProfile(); return; }
    var eng = teenEngine(p);
    var growth = Store.getKidsGrowth();
    var snack = teenTrainingSnack();
    var lvColor = eng.level === 'obese' ? '#dc2626' : (eng.level === 'overweight' ? '#f59e0b' : '#0e9f6e');

    var microHtml = eng.micro.map(function (m) {
      return '<div style="border:1px solid #eee;border-radius:10px;padding:8px;margin-bottom:8px"><div style="font-weight:600;font-size:13px">' + m.k + ' <span style="color:var(--primary-d)">' + m.v + '</span></div>' +
        '<div style="font-size:11px;color:var(--muted)">' + m.why + '</div></div>';
    }).join('');

    var html = '<div style="max-height:82vh;overflow:auto">' +
      '<div style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">🏀 成长的他 · ' + p.name + '</h3>' +
      '<span style="font-size:12px;color:var(--muted)">' + p.sport + ' · 每周' + (p.trainPerWeek || 3) + '练</span></div>' +

      '<div class="card" style="margin-top:10px;border-left:4px solid ' + lvColor + '">' +
      '<h3 style="margin:0 0 6px">营养评估</h3>' +
      '<div class="stats" style="gap:6px">' +
      '<div class="stat" style="flex:1 1 30%"><div class="num" style="font-size:20px">' + eng.bmi + '</div><div class="lbl">BMI</div></div>' +
      '<div class="stat" style="flex:1 1 30%"><div class="num" style="font-size:20px;color:' + lvColor + '">' + eng.pctl + 'th</div><div class="lbl">BMI百分位（' + eng.hint + '）</div></div>' +
      '<div class="stat" style="flex:1 1 30%"><div class="num" style="font-size:20px">' + eng.targetWeight + '</div><div class="lbl">温和目标体重kg</div></div>' +
      '</div>' +
      '<p style="font-size:12px;color:var(--muted);margin:8px 0 0">TDEE ' + eng.tdee + ' · 目标热量 <b>' + eng.target + '</b> kcal（轻微缺口' + (eng.level === 'under' ? '反为+200维持' : '≤300，靠运动造缺口，不节食') + '）</p>' +
      '<div class="stats" style="gap:6px;margin-top:8px">' +
      '<div class="stat" style="flex:1 1 30%"><div class="num" style="font-size:18px;color:var(--primary-d)">' + eng.proteinG + 'g</div><div class="lbl">蛋白(1.8/kg)</div></div>' +
      '<div class="stat" style="flex:1 1 30%"><div class="num" style="font-size:18px">' + eng.carbG + 'g</div><div class="lbl">碳水(充足)</div></div>' +
      '<div class="stat" style="flex:1 1 30%"><div class="num" style="font-size:18px">' + eng.fatG + 'g</div><div class="lbl">脂肪</div></div>' +
      '</div></div>' +

      '<div class="card"><h3>生长发育重点</h3>' + microHtml +
      '<p style="font-size:11px;color:var(--muted);margin:6px 0 0">⚠️ 本板块为均衡增肌减脂 + 生长发育友好模式，<b>不采用成人生酮/严格低碳</b>。</p></div>' +

      '<div class="card"><h3>训练加餐联动</h3>' +
      '<div style="font-size:13px;line-height:1.7"><b style="color:var(--primary-d)">训前</b>：' + snack.pre.join('；') + '<br>' +
      '<b style="color:var(--primary-d)">训后</b>：' + snack.post.join('；') + '</div></div>' +

      '<div class="card"><h3>成长监测曲线</h3>' + growthChart(growth) + '</div>' +

      '<div class="row" style="gap:8px;margin-top:4px">' +
      '<button class="btn sm" id="kRecord">记录今日身高体重</button>' +
      '<button class="btn ghost sm" id="kMenu">生成本周菜单</button>' +
      '<button class="btn ghost sm" id="kEdit">编辑档案</button></div>' +
      '<div id="kMenuBox"></div>' +
      '</div>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    if (modal) {
      modal.querySelector('#kRecord').addEventListener('click', recordGrowth);
      modal.querySelector('#kEdit').addEventListener('click', editProfile);
      modal.querySelector('#kMenu').addEventListener('click', function () {
        var menu = teenWeeklyMenu(p, eng);
        var box = modal.querySelector('#kMenuBox');
        if (box) box.innerHTML = menuHtml(menu);
        bindMenu(box);
      });
    }
  }

  function menuHtml(menu) {
    var rows = menu.map(function (d) {
      var cell = function (slot, items) {
        return items.map(function (it) {
          var nm = it.name || it;
          return '<span style="display:inline-block;background:#eef6f1;border-radius:8px;padding:2px 7px;margin:2px;font-size:11px">' + nm +
            ' <a data-addish="' + nm + '" data-slot="lunch" style="color:var(--primary-d);cursor:pointer">＋打卡</a></span>';
        }).join('');
      };
      return '<div style="border:1px solid #eee;border-radius:10px;padding:8px;margin-bottom:8px">' +
        '<div style="font-weight:600;font-size:13px">' + d.day + (d.train ? ' 🏀训练日' : '') + '</div>' +
        '<div style="font-size:12px;color:var(--muted);margin:4px 0">早：' + cell('breakfast', d.breakfast) + '</div>' +
        '<div style="font-size:12px;color:var(--muted);margin:4px 0">午：' + cell('lunch', d.lunch) + '</div>' +
        '<div style="font-size:12px;color:var(--muted);margin:4px 0">晚：' + cell('dinner', d.dinner) + '</div>' +
        '<div style="font-size:12px;color:var(--muted);margin:4px 0">加餐：' + cell('snack', d.snack) + '</div>' +
        '</div>';
    }).join('');
    return '<div class="card" style="margin-top:8px"><h3>本周专属菜单（增肌减脂不误发育）</h3>' + rows +
      '<p style="font-size:11px;color:var(--muted)">「＋打卡」把该菜加入家长今日午餐（代娃记录）。菜单为示例，可据口味替换同类食材。</p></div>';
  }

  // 菜单项加入打卡（家长代娃记录，明确标注）
  function bindMenu(box) {
    if (!box) return;
    box.querySelectorAll('[data-addish]').forEach(function (a) {
      a.addEventListener('click', function () {
        var nm = a.getAttribute('data-addish');
        var slot = a.getAttribute('data-slot') || 'lunch';
        if (Bridge && Bridge.dishToMealItem) {
          var item = Bridge.dishToMealItem(nm);
          if (item) {
            var m = App.checkin ? null : null; // 用 store 直接写
            var meals = Store.getMeals(Store.dateStr()) || { dietMode: Store.getSettings().dietMode, breakfast: [], lunch: [], dinner: [], exercises: [], steps: 0 };
            if (!meals[slot]) meals[slot] = [];
            item.name = item.name + '（娃）';
            meals[slot].push(item);
            Store.saveMeals(Store.dateStr(), meals);
            App.toast('已加入家长' + ({ breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }[slot]) + '：' + nm + '（娃）');
            return;
          }
        }
        App.toast('（娃）' + nm + ' 已记录到菜单');
      });
    });
  }

  global.App.kids = {
    renderCard: renderCard,
    editProfile: editProfile,
    showDashboard: showDashboard,
    // 供测试/复用
    childBmiPctl: childBmiPctl,
    teenEngine: teenEngine,
    teenWeeklyMenu: teenWeeklyMenu
  };
})(window);
