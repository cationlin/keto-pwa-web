// a-checkin.js — 模块A 打卡页（三餐/运动/实时生酮比例/晚餐推荐）
(function (global) {
  'use strict';

  var MODE_LABEL = { keto: '生酮', lowcarb: '低碳', normal: '正常' };
  // 运动类型 + Compendium of Physical Activities 标准 MET（走路必带，作为步数自动转化项）
  var EX_MET = {
    '走路': 3.5, '快走': 5.0, '跑步': 9.8, '游泳': 8.0, '动感单车': 8.0,
    '椭圆机': 5.0, '划船机': 7.0, '登山': 6.5, '跳绳': 12.3, '瑜伽': 2.5,
    '普拉提': 3.0, '羽毛球': 5.5, '网球': 7.3, '篮球': 6.5, '足球': 7.0,
    '舞蹈': 5.0, 'HIIT': 8.0, '搏击': 10.0, '太极': 3.0, '哑铃': 5.0, '其他': 4.0
  };
  // 21 种运动的图标映射（走路/快走/跳绳/瑜伽/登山/太极/广场舞 → walk；椭圆机/划船机/球类 → bike；HIIT/普拉提/哑铃 → dumbbell；其余按名称专配）
  var EX_ICON = {
    '走路': 'img/walk.svg', '快走': 'img/walk.svg',
    '跑步': 'img/run.svg', '游泳': 'img/swim.svg',
    '动感单车': 'img/bike.svg', '椭圆机': 'img/bike.svg', '划船机': 'img/bike.svg',
    '篮球': 'img/bike.svg', '足球': 'img/bike.svg', '羽毛球': 'img/bike.svg', '网球': 'img/bike.svg', '乒乓球': 'img/bike.svg',
    '跳绳': 'img/walk.svg', '瑜伽': 'img/walk.svg', '登山': 'img/walk.svg', '太极': 'img/walk.svg', '广场舞': 'img/walk.svg',
    '哑铃': 'img/dumbbell.svg', 'HIIT': 'img/dumbbell.svg', '普拉提': 'img/dumbbell.svg',
    '舞蹈': 'img/walk.svg', '搏击': 'img/dumbbell.svg',
    '其他': 'img/fitness.svg'
  };
  var EX_TIPS = {
    '动感单车': ['座椅调至膝盖微屈的高度', '核心收紧、腰背挺直，避免弓背', '建议 20-40 分钟，心率控在 (220-年龄)×60~80%'],
    '哑铃': ['选能标准完成 12-15 次的重量', '慢起慢落，不要用惯性甩', '发力呼气、还原吸气'],
    '跑步': ['跑前动态热身 5 分钟', '中前脚掌落地、身体微前倾', '新手每周 3 次、每次 20-30 分钟循序渐进'],
    '游泳': ['下水前活动肩颈与关节', '保持规律换气节奏', '每次 30 分钟以上更利于燃脂'],
    '走路': ['每天 6000-8000 步有益心肺', '挺胸收腹、自然摆臂', '步频 100-120 步/分钟更接近快走强度'],
    '快走': ['速度 6km/h 左右、微喘能说话', '收紧核心、加大摆臂', '每次 30 分钟以上更利于燃脂'],
    '跳绳': ['前脚掌着地、膝盖微屈缓冲', '手腕摇绳而非整臂', '新手分组 100-200 个，组间休息'],
    '瑜伽': ['配合呼吸、不憋气', '量力停留在舒适拉伸位', '经期避免倒立类体式'],
    '登山': ['穿防滑鞋、带登山杖减负', '上坡小步高频、下坡控速', '备足水与能量补给'],
    '其他': ['运动前充分热身', '动作标准优于追求强度', '量力而行，避免受伤']
  };

  // 复用 05-legacy-source 注释保留；图已升级到 iconpark 统一 SVG
  // 菜品图回退占位（与 f-recipes.js imgTag 同款；优先 RECIPE_IMGS，缺图回退 emoji）
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
    return '<div class="' + (cls || 'img-slot') + '" style="font-size:24px;display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#eef6f1,#e3f0ea)">' + emojiFor(name) + '</div>';
  }

  var EX_LIB = [
    { file: 'img/exercise/bench-press.png', name: '哑铃卧推', tip: '仰卧于凳，挺胸沉肩，垂直推起哑铃至胸廓上方，慢起慢落。' },
    { file: 'img/exercise/bicep-curl.png', name: '二头弯举', tip: '大臂贴紧躯干不动，小臂慢起慢落，避免借力甩动。' },
    { file: 'img/exercise/calf-raise.png', name: '站姿提踵', tip: '踮脚至最高点停顿 1 秒，感受小腿后侧收缩，下落到底再起。' },
    { file: 'img/exercise/deadlift.png', name: '硬拉', tip: '背部始终挺直，髋膝协同发力，杠铃贴腿上移，严禁弓背。' },
    { file: 'img/exercise/flyes.png', name: '哑铃飞鸟', tip: '肘部微屈固定，胸肌主导向两侧夹合，意念集中胸肌。' },
    { file: 'img/exercise/front-raise.png', name: '前平举', tip: '双臂前平举至与肩同高，练肩前束，身体不晃。' },
    { file: 'img/exercise/hammer-curl.png', name: '锤式弯举', tip: '拳眼朝上握哑铃，大臂贴身，练肱桡肌与肱二头。' },
    { file: 'img/exercise/incline-press.png', name: '上斜卧推', tip: '上斜约 30°，推举至胸上方，重点刺激上胸。' },
    { file: 'img/exercise/lateral-raise.png', name: '侧平举', tip: '双臂体侧平举至肩高，肘微屈，练肩中束，勿耸肩。' },
    { file: 'img/exercise/lunge.png', name: '箭步蹲', tip: '前后弓步下蹲，前膝不超脚尖，后膝轻触地，交替进行。' },
    { file: 'img/exercise/one-arm-row.png', name: '单臂划船', tip: '单臂支撑俯身，背部发力将哑铃拉向腰侧，练背阔肌。' },
    { file: 'img/exercise/romanian-deadlift.png', name: '罗马尼亚硬拉', tip: '微屈膝髋铰链前倾，臀部后推，练臀腿后链，背挺直。' },
    { file: 'img/exercise/rowing.png', name: '坐姿划船', tip: '挺胸沉肩，向后拉肩后缩，练背，回放缓慢。' },
    { file: 'img/exercise/russian-twist.png', name: '俄罗斯转体', tip: '坐姿微后仰，双手持重左右转体，练腹斜肌。' },
    { file: 'img/exercise/shoulder-press.png', name: '肩上推举', tip: '垂直推举哑铃过头顶至双臂伸直，练肩，核心收紧。' },
    { file: 'img/exercise/side-plank.png', name: '侧平板支撑', tip: '侧身单肘支撑，身体成直线，练腹斜肌与腰侧稳定。' },
    { file: 'img/exercise/squat.png', name: '深蹲', tip: '下蹲至大腿平行地面，膝盖朝脚尖方向，挺胸直背。' },
    { file: 'img/exercise/tricep-extension.png', name: '仰卧臂屈伸', tip: '仰卧举臂垂直，屈肘下放至额前再伸直，练肱三头。' },
    { file: 'img/exercise/tricep-kickback.png', name: '俯身臂屈伸', tip: '俯身单臂向后伸直，肘为轴，练肱三头，身体稳定。' },
    { file: 'img/exercise/weighted-sit-up.png', name: '负重卷腹', tip: '抱重物于胸前卷腹起身，下背贴地，练腹直肌。' }
  ];

  // 5 类运动 → 代表动作（EX_LIB 索引）；无对应即 null（打开库）
  var EX_REPR = { '哑铃': 0 };

  var SLOTS = [
    { key: 'breakfast', name: '早餐' },
    { key: 'lunch', name: '午餐' },
    { key: 'dinner', name: '晚餐' }
  ];

  // P1-2：打卡页当前记录日期（补录历史用）；null=今天
  var _activeDate = null;
  function curDate() { return _activeDate || Store.dateStr(); }
  function todayMeals() {
    var d = curDate();
    var m = Store.getMeals(d);
    if (!m) m = { dietMode: Store.getSettings().dietMode, breakfast: [], lunch: [], dinner: [], exercises: [], steps: 0 };
    return m;
  }
  function save(m) { Store.saveMeals(curDate(), m); if (global.App && App.family) App.family.syncIfJoined(); }

  function latestWeight() {
    var ws = Store.getWeights();
    return (ws.length ? ws[ws.length - 1].weight : Store.getSettings().startWeight) || 70;
  }

  function foodOptions() {
    var db = Bridge.KetoCore.FOOD_DB, html = '';
    for (var k in db) if (db.hasOwnProperty(k)) html += '<option value="' + k + '">';
    return html;
  }

  function slotListHtml(slot, items) {
    if (!items || !items.length) return '<div class="meal-empty"><span class="meal-empty-ico">🥗</span><span class="meal-empty-t">还没有记录</span><span class="meal-empty-s">选/输入食物后点「添加」</span></div>';
    return items.map(function (it, i) {
      return '<div class="item"><div class="item-main"><span class="name">' + it.name + '</span>' +
        '<span class="meta">' + it.amount + it.unit + ' · ' + it.calories + 'kcal · 碳' + it.carb + ' 蛋' + it.protein + ' 脂' + it.fat + '</span></div>' +
        '<button class="del" data-act="delfood" data-slot="' + slot + '" data-i="' + i + '" aria-label="删除">' + ICONS.svg('trash', 14) + '</button></div>';
    }).join('');
  }

  function exListHtml(exs) {
    if (!exs || !exs.length) return '<div class="meal-empty"><span class="meal-empty-ico">🏃</span><span class="meal-empty-t">还没有运动记录</span><span class="meal-empty-s">选类型 + 时长，点 + 运动</span></div>';
    return exs.map(function (e, i) {
      var ic = EX_ICON[e.type] || 'img/fitness.svg';
      return '<div class="item"><img class="ex-ico" src="' + ic + '" data-act="extips" data-t="' + e.type + '" alt="' + e.type + '">' +
        '<div class="item-main"><span class="name">' + e.type + '</span><span class="meta">' + e.duration + '分钟 · 约' + e.cal + 'kcal</span></div>' +
        '<button class="del" data-act="delex" data-i="' + i + '" aria-label="删除">' + ICONS.svg('trash', 14) + '</button></div>';
    }).join('');
  }

  function showExTips(type) {
    var ic = EX_ICON[type] || 'img/fitness.svg';
    var tips = (EX_TIPS[type] || []).map(function (t) { return '<li>' + t + '</li>'; }).join('');
    var html = '<div style="text-align:center">' +
      '<img src="' + ic + '" style="width:72px;height:72px;margin:2px auto 8px">' +
      '<h3 style="margin:0 0 8px">' + type + ' · 动作要点</h3>' +
      '<ul style="text-align:left;font-size:14px;line-height:1.9;padding-left:20px;margin:0 0 10px">' + tips + '</ul>' +
      '<button class="btn ghost sm" data-exlib="1" style="margin-top:0">' + ICONS.svg('play', 14) + ' 打开动作示范库（20 个动态）</button>' +
      '</div>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    var btn = modal && modal.querySelector('[data-exlib]');
    if (btn) btn.addEventListener('click', showExLibrary);
  }

  function showExLibrary() {
    var cells = EX_LIB.map(function (e, i) {
      return '<div class="ex-cell" data-i="' + i + '" style="text-align:center;cursor:pointer;padding:6px">' +
        '<div style="position:relative;display:inline-block">' +
          '<img src="' + e.file + '" style="width:64px;height:64px;object-fit:cover;border-radius:12px;display:block;margin:0 auto 4px;background:#eef6f1">' +
          '<span style="position:absolute;left:4px;bottom:8px;background:rgba(14,159,110,.92);color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:6px;letter-spacing:.3px">▶ 动态</span>' +
        '</div>' +
        '<div style="font-size:12px">' + e.name + '</div></div>';
    }).join('');
    var html = '<h3 style="margin-top:0">动作示范库</h3>' +
      '<p style="font-size:12px;color:var(--muted);margin:0 0 10px">点击任一动作查看<strong style="color:var(--primary-d)">连贯动态示范</strong>（mp4 循环播放）</p>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">' + cells + '</div>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    if (modal) modal.querySelectorAll('.ex-cell').forEach(function (c) {
      c.addEventListener('click', function () { showExDetail(+c.getAttribute('data-i')); });
    });
  }

  // 沉浸式动作播放器：▶ 动态徽标 + 视频 + 播放/暂停浮层 + 上一/下一
  function showExDetail(i) {
    var e = EX_LIB[i]; if (!e) return;
    var mp4 = e.file.replace(/\.png$/, '.mp4');
    var player =
      '<div class="ex-demo">' +
        '<span class="ex-demo-badge">▶ 动态示范</span>' +
        '<video id="exVid" src="' + mp4 + '" poster="' + e.file + '" autoplay loop muted playsinline preload="auto" class="ex-demo-video"></video>' +
        '<div class="ex-demo-play" id="exPlay" aria-hidden="true">▶</div>' +
      '</div>';
    var html = '<div style="text-align:center">' +
      player +
      '<h3 style="margin:6px 0 6px">' + e.name + '</h3>' +
      '<p style="font-size:14px;line-height:1.8;text-align:left;color:var(--muted);margin:0 6px">' + e.tip + '</p>' +
      '<div style="display:flex;gap:8px;justify-content:center;margin-top:10px;flex-wrap:wrap">' +
        (i > 0 ? '<button id="exPrev" class="btn ghost sm" style="margin:0">' + ICONS.svg('chevronLeft', 14) + ' 上一个</button>' : '') +
        '<button id="exBack" class="btn ghost sm" style="margin:0">' + ICONS.svg('chevronUp', 14) + ' 返回示范库</button>' +
        (i < EX_LIB.length - 1 ? '<button id="exNext" class="btn sm" style="margin:0">下一个 ' + ICONS.svg('chevronRight', 14) + '</button>' : '') +
      '</div></div>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    var v = modal && modal.querySelector('#exVid');
    var play = modal && modal.querySelector('#exPlay');
    if (v) {
      // 浮层显隐确定性控制：播放即隐藏、暂停即显示，不依赖 playing 事件时序（部分浏览器程序化续播时 playing 事件不触发）
      function showOverlay() { if (play) play.style.display = 'flex'; }
      function hideOverlay() { if (play) play.style.display = 'none'; }
      v.addEventListener('playing', hideOverlay);
      v.addEventListener('play', hideOverlay);
      v.addEventListener('pause', showOverlay);
      v.addEventListener('click', function () { if (v.paused) { v.play(); hideOverlay(); } else { v.pause(); showOverlay(); } });
      v.addEventListener('error', function () { showOverlay(); if (play) play.textContent = '⚠'; App.toast('视频加载失败，已显示静态图'); });
      // 浮层点击 = 续播（暂停态浮层覆盖整块视频，必须由浮层自己接收点击，否则点中央无效）
      if (play) play.addEventListener('click', function (ev) {
        ev.stopPropagation();
        if (v.paused) { try { var pp = v.play(); if (pp && pp.catch) pp.catch(function () {}); } catch (err) {} hideOverlay(); }
      });
      // 显式播放，处理自动播放策略
      try { var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (err) {}
    }
    var back = modal && modal.querySelector('#exBack');
    if (back) back.addEventListener('click', showExLibrary);
    var next = modal && modal.querySelector('#exNext');
    if (next) next.addEventListener('click', function () { showExDetail(i + 1); });
    var prev = modal && modal.querySelector('#exPrev');
    if (prev) prev.addEventListener('click', function () { showExDetail(i - 1); });
  }

  // 主入口「看动作示范」：有代表动作 → 直接放视频；无 → 要点 + 库入口
  function showExDemo(type) {
    var idx = EX_REPR[type];
    if (typeof idx === 'number') {
      showExDetail(idx);
      var modal = document.getElementById('app-modal');
      if (modal && !modal.querySelector('#exAll')) {
        var back = modal.querySelector('#exBack');
        var bar = document.createElement('div');
        bar.style.cssText = 'margin-top:8px';
        bar.innerHTML = '<button id="exAll" class="btn ghost sm" style="margin:0">' + ICONS.svg('book', 14) + ' 看全部 20 个动作</button>';
        if (back && back.parentNode) back.parentNode.appendChild(bar);
        var b = bar.querySelector('#exAll');
        if (b) b.addEventListener('click', showExLibrary);
      }
    } else {
      var ic = EX_ICON[type] || 'img/fitness.svg';
      var tips = (EX_TIPS[type] || []).map(function (t) { return '<li>' + t + '</li>'; }).join('');
      var html = '<div style="text-align:center">' +
        '<img src="' + ic + '" style="width:72px;height:72px;margin:2px auto 8px">' +
        '<h3 style="margin:0 0 8px">' + type + ' · 动作要点</h3>' +
        '<ul style="text-align:left;font-size:14px;line-height:1.9;padding-left:20px;margin:0 0 12px">' + tips + '</ul>' +
        '<button id="exAll" class="btn" style="margin:0">▶ 打开动作示范库（20 个连贯动态）</button>' +
        '</div>';
      App.openModal(html);
      var m2 = document.getElementById('app-modal');
      var b2 = m2 && m2.querySelector('#exAll');
      if (b2) b2.addEventListener('click', showExLibrary);
    }
  }

  // 今日热量环形进度（首页 hero 大进度环 + 蓝绿渐变）
  function calRingSvg(pct, consumed, budget) {
    pct = Math.max(0, Math.min(100, pct));
    var r = 34, c = 2 * Math.PI * r;
    return '<div class="hero-ring" role="img" aria-label="今日热量进度">' +
      '<svg viewBox="0 0 80 80" width="104" height="104" aria-hidden="true">' +
      '<circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg-2)" stroke-width="8"></circle>' +
      '<circle id="ringFg" cx="40" cy="40" r="34" fill="none" stroke="url(#ringGrad)" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + c + '" stroke-dashoffset="' + c + '" transform="rotate(-90 40 40)"></circle>' +
      '<defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0e9f6e"/><stop offset="1" stop-color="#2563eb"/></linearGradient></defs>' +
      '</svg>' +
      '<div class="rn"><b>' + consumed + '</b><span>/' + budget + ' kcal</span></div>' +
      '</div>';
  }
  function animateRing(el, pct) {
    var fg = el.querySelector('#ringFg'); if (!fg) return;
    var r = 34, c = 2 * Math.PI * r;
    var off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
    fg.style.transition = 'stroke-dashoffset .7s cubic-bezier(.2,.8,.2,1)';
    requestAnimationFrame(function () { fg.style.strokeDashoffset = off; });
  }

  function waterHtml(m) {
    var w = m.water || 0;
    var cups = Math.round(w / 250);
    return '<div class="water-box"><span class="water-ico">💧</span>' +
      '<span class="water-val">饮水 <b>' + w + '</b> ml · ' + cups + ' 杯</span>' +
      '<button class="btn ghost sm" data-act="water-add" data-ml="250" style="margin:0 0 0 8px">' + ICONS.svg('plus', 12) + ' 250</button>' +
      (w > 0 ? ' <button class="btn ghost sm" data-act="water-add" data-ml="-250" style="margin:0">' + ICONS.svg('minus', 12) + ' 250</button>' : '') +
      '</div>';
  }

  function summaryHtml(m) {
    var s = Store.getSettings();
    var bal = Bridge.dayBalance(m, s);
    var pct = bal.budget > 0 ? Math.round(bal.totalCal / bal.budget * 100) : 0;
    var remain = bal.balanceBudget; // 剩余=正，缺口=负
    var sum = (bal.carbG || 0) + (bal.proteinG || 0) + (bal.fatG || 0) || 1;
    var segC = Math.round((bal.carbG || 0) / sum * 100);
    var segP = Math.round((bal.proteinG || 0) / sum * 100);
    var segF = Math.max(0, 100 - segC - segP);
    var remainLabel = remain >= 0 ? ('还可吃 ' + remain + ' kcal') : ('已超 ' + (-remain) + ' kcal');
    return '<div class="card hero"><div class="hero-row">' +
      calRingSvg(pct, bal.totalCal, bal.budget) +
      '<div class="hero-meta">' +
        '<div class="hm"><span>今日摄入</span><b>' + bal.totalCal + ' kcal</b></div>' +
        '<div class="hm"><span>' + remainLabel + '</span><b>' + Math.abs(remain) + ' kcal</b></div>' +
        '<div class="hm"><span>目标预算</span><b>' + bal.budget + ' kcal</b></div>' +
      '</div></div>' +
      '<div class="macro-bar"><span class="seg" style="width:' + segP + '%;background:var(--info)"></span>' +
        '<span class="seg" style="width:' + segF + '%;background:var(--primary)"></span>' +
        '<span class="seg" style="width:' + segC + '%;background:var(--bg-2)"></span></div>' +
      '<div class="macro-legend">蛋白 ' + bal.proteinG + 'g · 脂肪 ' + bal.fatG + 'g · 碳水 ' + bal.carbG + 'g</div>' +
      '<div class="keto-ratio">生酮比例（碳/蛋/脂）：' + bal.carbPercent + '% / ' + bal.proteinPercent + '% / ' + bal.fatPercent + '%</div>' +
      '<div id="waterBox" style="margin-top:10px">' + waterHtml(m) + '</div></div>';
  }

  function dinnerHtml(m) {
    var s = Store.getSettings();
    var exCal = (m.exercises || []).reduce(function (a, e) { return a + (e.cal || 0); }, 0);
    // 步数消耗已通过「走路」运动条（upsertWalking + EX_MET 公式）计算，不再额外算
    var stepCal = 0;
    var bCal = (m.breakfast || []).reduce(function (a, f) { return a + f.calories; }, 0);
    var lCal = (m.lunch || []).reduce(function (a, f) { return a + f.calories; }, 0);
    var rec = Bridge.dinnerRec({
      gender: s.gender, height: s.height, birthYear: s.birthYear,
      activityLevel: s.activityFactor, weight: latestWeight(), dietMode: s.dietMode,
      breakfastCal: bCal, lunchCal: lCal, exerciseCal: exCal, stepCal: stepCal
    });
    var dishes = rec.recommended.map(function (d) {
      return '<div class="dish" data-act="dish" data-name="' + d.name + '">' +
        imgTag(d.name, 'thumb') +
        '<div class="info"><div class="n">' + d.name + '<span class="tag">' + d.portionLabel + '</span></div>' +
        '<div class="c">' + d.cal + 'kcal · 碳' + d.carb + ' 蛋' + d.protein + ' 脂' + d.fat + '</div></div></div>';
    }).join('');
    return '<div class="card"><h3>晚餐推荐 <span class="sub">目标 ' + rec.dinnerTarget + ' kcal</span></h3>' +
      '<div style="font-size:12px;color:var(--muted);margin-bottom:8px">已摄入早' + Math.round(bCal) + '+午' + Math.round(lCal) + '，运动含步数 ' + Math.round(exCal) + ' kcal</div>' +
      dishes + '</div>';
  }

  // 新手引导 tip：首次进入打卡页展示一次，可关闭
  function onboardTipHtml() {
    try { if (localStorage.getItem('keto_onboarded')) return ''; } catch (e) { return ''; }
    return '<div class="tip-card" role="note">' +
      '<span class="tip-ico">👋</span>' +
      '<div class="tip-body">' +
        '<b>欢迎来到生酮打卡</b> · 先试这三步：' +
        '<br>① 点 <b>☕ 一键添加防弹咖啡</b> 完成早餐；' +
        '<br>② <b>我的 → 📚 知识中心</b> 查食材 / 算热量 / 外食指南；' +
        '<br>③ <b>我的 → 👨‍👩‍👧 家庭共享码</b> 和家人互看数据。' +
      '</div>' +
      '<button class="tip-close" data-act="tip-close" aria-label="关闭">×</button>' +
    '</div>';
  }

  function modeCardHtml(s) {
    var modeBtns = Object.keys(MODE_LABEL).map(function (k) {
      return '<button class="btn sm ' + (s.dietMode === k ? '' : 'ghost') + '" data-act="mode" data-mode="' + k + '" style="margin-top:0">' + MODE_LABEL[k] + '</button>';
    }).join(' ');
    return '<div class="card"><h3>饮食模式</h3><div class="row">' + modeBtns + '</div>' +
      '<button class="btn ghost" data-act="bulletproof" style="margin-top:8px">' + ICONS.svg('coffee', 16) + ' 一键添加防弹咖啡</button></div>';
  }

  // 局部刷新：仅重建受数据变化影响的区块，避免整页重建导致的闪屏/失焦/滚动归顶（P0-1）
  function softRefresh(el) {
    var m = todayMeals();
    var s = Store.getSettings();
    var mc = el.querySelector('#modeCard');
    if (mc) mc.innerHTML = modeCardHtml(s);
    SLOTS.forEach(function (sl) {
      var listEl = el.querySelector('#list-' + sl.key);
      if (listEl) listEl.innerHTML = slotListHtml(sl.key, m[sl.key]);
      var cntEl = el.querySelector('#cnt-' + sl.key);
      if (cntEl) cntEl.textContent = (m[sl.key] || []).length + ' 项';
    });
    var exList = el.querySelector('#exList');
    if (exList) exList.innerHTML = exListHtml(m.exercises);
    var sc = el.querySelector('#summaryCard'); if (sc) { sc.innerHTML = summaryHtml(m); animateRing(sc, Math.round((Bridge.dayBalance(m, Store.getSettings()).totalCal) / (Bridge.dayBalance(m, Store.getSettings()).budget || 1) * 100)); }
    var dc = el.querySelector('#dinnerCard'); if (dc) dc.innerHTML = dinnerHtml(m);
  }

  function clearFoodInput(el, slot) {
    var fi = el.querySelector('#food-' + slot); if (fi) fi.value = '';
    var amt = el.querySelector('#amt-' + slot); if (amt) amt.value = 1;
    var unit = el.querySelector('#unit-' + slot); if (unit) unit.textContent = '个';
  }

  function render(el, m) {
    var s = Store.getSettings();
    // P1-审计：单行输入区（食物 + 单位 + ±数量 + 添加），不再三行割裂；空态压缩
    var slotsHtml = SLOTS.map(function (sl) {
      return '<div class="card meal-card" data-slot-card="' + sl.key + '">' +
        '<div class="meal-head">' +
          '<span class="meal-ico meal-ico-' + sl.key + '" aria-hidden="true"></span>' +
          '<h3>' + sl.name + '</h3>' +
          '<span class="sub cnt" id="cnt-' + sl.key + '">' + (m[sl.key] || []).length + ' 项</span>' +
        '</div>' +
        '<div class="meal-row">' +
          '<input list="foodList" id="food-' + sl.key + '" class="food-in" placeholder="选/输入食物（如 牛肉、防弹咖啡）" autocomplete="off">' +
          '<button type="button" class="unit-trigger" data-act="pick-unit" data-slot="' + sl.key + '" aria-label="切换单位"><span id="unit-' + sl.key + '">个</span><span class="trig-caret">▾</span></button>' +
          '<div class="qty">' +
            '<button type="button" class="qty-step" data-slot="' + sl.key + '" data-q="-1" aria-label="减少">−</button>' +
            '<input id="amt-' + sl.key + '" type="number" value="1" min="1" max="99" inputmode="numeric" aria-label="数量">' +
            '<button type="button" class="qty-step qty-step-plus" data-slot="' + sl.key + '" data-q="1" aria-label="增加">+</button>' +
          '</div>' +
          '<button class="btn-add" data-act="addfood" data-slot="' + sl.key + '">添加</button>' +
        '</div>' +
        '<div id="list-' + sl.key + '">' + slotListHtml(sl.key, m[sl.key]) + '</div>' +
      '</div>';
    }).join('');

    // 单位下拉候选项
    var unitItems = [
      { value: 'g', label: '克 (g)' },
      { value: '个', label: '个' },
      { value: '杯', label: '杯' },
      { value: '片', label: '片' },
      { value: '块', label: '块' },
      { value: '份', label: '份' },
      { value: '勺', label: '勺' }
    ];
    var unitDataJson = JSON.stringify(unitItems).replace(/'/g, '&#39;');

    el.innerHTML =
      onboardTipHtml() +
      // P1-2：记录日期选择器（默认今天，可改成历史日期补录三餐/运动/步数）
      '<div class="card date-card">' +
        '<label class="date-card-lbl">📅 记录日期</label>' +
        '<input type="hidden" id="checkinDate" value="' + curDate() + '">' +
        '<button type="button" class="trigger picker-trigger" data-act="pick-date" style="flex:1;min-width:140px;text-align:left"><span id="checkinDateTxt">' + curDate() + '</span><span class="trig-caret">📅</span></button>' +
        (curDate() !== Store.dateStr() ? '<button class="btn ghost sm" data-act="date-today" style="margin:0">回到今天</button>' : '') +
      '</div>' +
      // v2.0：首页一步称重（体脂秤直连 / 手动记录），不用再跑到记录页
      '<div class="card weight-card">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap">' +
          '<div><h3 style="margin:0 0 2px">⚖️ 当前体重</h3>' +
          '<div style="font-size:24px;font-weight:800;color:var(--accent);line-height:1.1">' + latestWeight() + ' <span style="font-size:13px;font-weight:600">kg</span></div></div>' +
          '<div class="row" style="gap:8px;margin:0;flex-wrap:wrap">' +
            (window.AfuScale && window.AfuScale.available()
              ? '<button class="btn sm" data-act="afu-ble" style="margin:0">📶 直连秤</button>' : '') +
            '<button class="btn sm ghost" data-act="goto-weight" style="margin:0">✍️ 手动记录</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<datalist id="foodList">' + foodOptions() + '</datalist>' +
      '<div id="summaryCard">' + summaryHtml(m) + '</div>' +
      '<div id="modeCard">' + modeCardHtml(s) + '</div>' +
      slotsHtml +
      // 单位候选项缓存到 body data 上，供 pick-unit 查
      '<script class="unit-data" type="application/json">' + unitDataJson + '<\/script>' +
      '<div class="card"><div class="ex-head"><h3>运动 <span style="font-size:12px;color:var(--muted);font-weight:normal">点图标/按钮看动作示范</span></h3></div>' +
      '<div class="ex-pick-row">' +
        '<img id="exIcoPrev" src="img/bike.svg" alt="">' +
        '<input type="hidden" id="exType" value="走路">' +
        '<button type="button" class="trigger picker-trigger ex-trigger" data-act="pick-ex"><span id="exTypeTxt">走路</span><span class="trig-caret">▾</span></button>' +
        '<input id="exDur" type="number" value="30" placeholder="分" inputmode="numeric" class="ex-dur">' +
        '<button class="btn-add" data-act="addex">+ 运动</button>' +
      '</div>' +
      '<button class="btn ghost sm" data-act="extips-prev" style="margin-top:8px">' + ICONS.svg('play', 14) + ' 看动作示范（20 个连贯动态）</button>' +
      '<div id="exList" style="margin-top:8px">' + exListHtml(m.exercises) + '</div>' +
      '<div class="steps-block">' +
        '<div class="ex-head"><h3 style="margin:0">🚶 今日步数</h3><span style="font-size:11px;color:var(--muted)">同步后自动计入走路</span></div>' +
        '<div class="steps-row">' +
          '<input id="steps" type="number" value="' + (m.steps || 0) + '" placeholder="如 8000" inputmode="numeric">' +
          '<button class="btn ghost sm steps-paste" data-act="paste-steps">📋 粘贴</button>' +
          '<button class="btn-add steps-sync" data-act="sync-steps">🏃 同步</button>' +
        '</div>' +
        (window.KetoNative
          ? '<div class="meta" style="font-size:11px;color:var(--muted);margin-top:6px">点「🏃 同步步数」读取手机硬件计步（与微信同来源，自动计入走路）；华为手表步数请「📋 粘贴」手动填。</div>'
          : '<div class="meta" style="font-size:11px;color:var(--muted);margin-top:6px">从「华为运动健康」步数卡片长按复制，回这里点「📋 粘贴」自动识别。</div>') +
      '</div>' +
      '</div>' +
      '<div id="dinnerCard">' + dinnerHtml(m) + '</div>';

    // 数量按钮联动
    SLOTS.forEach(function (sl) {
      var qtyBtns = el.querySelectorAll('.qty-step[data-slot="' + sl.key + '"]');
      qtyBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var delta = parseInt(btn.getAttribute('data-q'), 10) || 0;
          var amt = el.querySelector('#amt-' + sl.key);
          var v = parseInt(amt.value, 10) || 1;
          amt.value = Math.max(1, Math.min(99, v + delta));
        });
      });
    });
    // 单位联动
    SLOTS.forEach(function (sl) {
      var fi = el.querySelector('#food-' + sl.key);
      if (fi) fi.addEventListener('change', function () { updateUnit(el, sl.key, fi.value); });
    });
    // 进度环入场动画（P2 微交互）
    requestAnimationFrame(function () { onShowAnimateRing(el); });
  }

  function updateUnit(el, slot, name) {
    var db = Bridge.KetoCore.FOOD_DB;
    var u = db[name] ? (db[name].unit || 'g') : 'g';
    var amt = el.querySelector('#amt-' + slot);
    if (db[name] && db[name].unit) amt.value = 1; else if (!amt.value) amt.value = 100;
    el.querySelector('#unit-' + slot).textContent = u;
  }

  function addFood(el, slot) {
    var m = todayMeals();
    var name = el.querySelector('#food-' + slot).value.trim();
    if (!name) { App.toast('请输入食物'); return; }
    // M1：先查预设库，再查自定义库，都没有才弹自定义录入（不再硬拒）
    var match = Store.matchFoodAny(name);
    if (!match) { showCustomFoodForm(el, slot, name); return; }
    var amount = parseFloat(el.querySelector('#amt-' + slot).value) || 0;
    if (amount <= 0) { App.toast('数量要大于0'); return; }
    var item;
    if (match.kind === 'custom') {
      var cf = match.food; // { name, amount, unit:'g', calories, carb, protein, fat }
      item = { name: cf.name, unit: 'g', amount: cf.amount, calories: cf.calories, carb: cf.carb, protein: cf.protein, fat: cf.fat };
    } else {
      item = Bridge.calcItemMacros(match.name, amount);
    }
    if (!m[slot]) m[slot] = [];
    m[slot].push(item);
    save(m); clearFoodInput(el, slot); softRefresh(el);
    App.toast('已添加 ' + match.name + (match.kind === 'custom' ? '（自定义）' : ''));
  }

  // M1：库外食物自定义录入（手填份量+热量+宏量），保存进自定义库并加入当日餐
  function showCustomFoodForm(el, slot, name) {
    var slotName = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }[slot] || '餐';
    var html = '<h3 style="margin-top:0">自定义食物录入</h3>' +
      '<p style="font-size:12px;color:var(--muted);margin:0 0 10px">库里没有「' + name + '」的精确数据，手填一份营养即可（按下方「份量」折算，后续同名自动复用）。</p>' +
      '<label>食物名称</label><input id="cfName" value="' + name + '">' +
      '<div class="row"><div><label>份量(g)</label><input id="cfAmt" type="number" value="100"></div>' +
      '<div><label>热量(kcal)</label><input id="cfCal" type="number" placeholder="如 150"></div></div>' +
      '<div class="row"><div><label>碳水(g)</label><input id="cfCarb" type="number" placeholder="0"></div>' +
      '<div><label>蛋白(g)</label><input id="cfPro" type="number" placeholder="0"></div>' +
      '<div><label>脂肪(g)</label><input id="cfFat" type="number" placeholder="0"></div></div>' +
      '<button class="btn" id="cfSave" style="margin-top:12px">保存并加入' + slotName + '</button>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    if (modal) modal.querySelector('#cfSave').addEventListener('click', function () {
      var fn = (modal.querySelector('#cfName').value || '').trim();
      var amt = parseFloat(modal.querySelector('#cfAmt').value) || 100;
      var cal = parseFloat(modal.querySelector('#cfCal').value) || 0;
      var carb = parseFloat(modal.querySelector('#cfCarb').value) || 0;
      var pro = parseFloat(modal.querySelector('#cfPro').value) || 0;
      var fat = parseFloat(modal.querySelector('#cfFat').value) || 0;
      if (!fn) { App.toast('请填食物名称'); return; }
      if (cal <= 0) { App.toast('请填热量（大于0）'); return; }
      var food = { name: fn, amount: amt, unit: 'g', calories: cal, carb: carb, protein: pro, fat: fat };
      Store.addCustomFood(food);
      var m = todayMeals();
      if (!m[slot]) m[slot] = [];
      m[slot].push({ name: fn, unit: 'g', amount: amt, calories: cal, carb: carb, protein: pro, fat: fat });
      save(m); App.closeModal();
      var ce = document.getElementById('view-checkin');
      if (ce && ce.classList.contains('active')) softRefresh(ce);
      App.toast('已添加自定义食物 ' + fn);
    });
  }

  function onShowAnimateRing(el) {
    var m = todayMeals();
    var bal = Bridge.dayBalance(m, Store.getSettings());
    var pct = bal.budget > 0 ? Math.round(bal.totalCal / bal.budget * 100) : 0;
    animateRing(el, pct);
  }

  // P1-5：从剪贴板读步数并填入（任何手机/健康App通用兜底；sync-steps 在本机无原生时也走这里）
  function readStepsClipboard(el) {
    var pickFirstInt = function (txt) {
      if (!txt) return 0;
      var m = txt.match(/步[数量数]?\s*[:：]?\s*([\d,]+)\s*步?/);
      var n = m ? parseInt(m[1].replace(/,/g, ''), 10) : NaN;
      if (!isNaN(n)) return n;
      var any = txt.replace(/,/g, '').match(/\d{2,6}/);
      return any ? parseInt(any[0], 10) || 0 : 0;
    };
    var read = (navigator.clipboard && navigator.clipboard.readText)
      ? navigator.clipboard.readText().catch(function () { return ''; })
      : Promise.resolve('');
    read.then(function (txt) {
      if (!txt) { App.toast('剪贴板为空，先去华为运动健康复制步数'); return; }
      var n = pickFirstInt(txt);
      if (n <= 0) { App.toast('没识别到步数数字：' + txt.slice(0, 30)); return; }
      var inp = el.querySelector('#steps');
      if (inp) {
        inp.value = n;
        inp.dispatchEvent(new Event('change'));
      }
      App.toast('✓ 已填入步数 ' + n + '（来源：' + txt.slice(0, 24).replace(/\n/g, ' ') + (txt.length > 24 ? '…' : '') + '）');
    });
  }

  // C1：白名单引导（首次点同步步数时弹一次）+ 同步执行
  function doSyncSteps(el) {
    if (window.KetoNative && window.KetoNative.requestSteps) {
      try { window.KetoNative.requestSteps(); App.toast('正在读取步数...'); } catch (e) { App.toast('步数同步暂不可用'); }
    } else {
      // P1-5：本机无原生步数通道（iOS/桌面/老安卓）→ 直接走剪贴板粘贴，给出反馈而非死路
      readStepsClipboard(el);
    }
  }
  function showStepBgGuide(el) {
    var steps = [
      '① 设置 → 电池 → 后台耗电管理 → 找到「生酮」→ 允许后台运行',
      '② 设置 → 应用 → 自启动管理 → 打开「生酮」',
      '③ 多任务卡片把生酮「加锁」（下拉锁定），避免被划掉'
    ].join('<br>');
    var html = '<h3 style="margin-top:0">🏃 让步数自动累计</h3>' +
      '<p style="font-size:13px;color:var(--muted);line-height:1.7">生酮读的是手机硬件计步。若不加白名单，App 被杀后只统计「启动后」步数；加好后即使关掉 App，下次打开也能补回期间步数（和微信一致）。</p>' +
      '<div style="font-size:13px;line-height:1.9;background:var(--bg-2);border-radius:10px;padding:10px 12px;margin:8px 0">' + steps + '</div>' +
      '<button class="btn" id="bgOk" style="margin-top:6px">我已设置，立即同步</button>' +
      '<button class="btn ghost sm" id="bgSkip" style="margin-top:8px">暂不设置，直接同步</button>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    function done() { try { localStorage.setItem('keto_step_bg_tip', '1'); } catch (e) {} App.closeModal(); doSyncSteps(el); }
    if (modal) {
      var ok = modal.querySelector('#bgOk'); if (ok) ok.addEventListener('click', done);
      var sk = modal.querySelector('#bgSkip'); if (sk) sk.addEventListener('click', done);
    }
  }

  function bind(el) {
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      var act = b.getAttribute('data-act');
      var m = todayMeals();
      if (act === 'mode') {
        var s = Store.getSettings(); s.dietMode = b.getAttribute('data-mode');
        Store.saveSettings(s); save({ dietMode: s.dietMode, breakfast: m.breakfast, lunch: m.lunch, dinner: m.dinner, exercises: m.exercises, steps: m.steps, water: m.water });
        softRefresh(el);
      } else if (act === 'addfood') {
        addFood(el, b.getAttribute('data-slot'));
      } else if (act === 'bulletproof') {
        // 防弹咖啡：固定 250ml黑咖 + 15ml MCT油 + 10g黄油（均按每100g折算，ml≈g）
        var kb = Bridge.calcItemMacros('黑咖啡', 250);
        var km = Bridge.calcItemMacros('MCT油', 15);
        var kbu = Bridge.calcItemMacros('黄油', 10);
        var combo = {
          name: '防弹咖啡', unit: '杯', amount: 1,
          calories: Math.round((kb.calories + km.calories + kbu.calories) * 10) / 10,
          carb: Math.round((kb.carb + km.carb + kbu.carb) * 10) / 10,
          protein: Math.round((kb.protein + km.protein + kbu.protein) * 10) / 10,
          fat: Math.round((kb.fat + km.fat + kbu.fat) * 10) / 10
        };
        if (!m.breakfast) m.breakfast = [];
        m.breakfast.push(combo); save(m); softRefresh(el); App.toast('已添加防弹咖啡');
      } else if (act === 'addex') {
        var t = el.querySelector('#exType').value;
        var dur = parseFloat(el.querySelector('#exDur').value) || 0;
        if (dur <= 0) { App.toast('时长要大于0'); return; }
        var cal = Math.round(EX_MET[t] * latestWeight() * (dur / 60));
        if (!m.exercises) m.exercises = [];
        m.exercises.push({ type: t, duration: dur, cal: cal }); save(m); softRefresh(el); App.toast('已添加运动 ' + t);
      } else if (act === 'delfood') {
        var slot = b.getAttribute('data-slot'), i = +b.getAttribute('data-i');
        var removed = m[slot][i];
        m[slot].splice(i, 1); save(m); softRefresh(el);
        App.toast('已删除「' + removed.name + '」', { label: '撤销', fn: function () {
          if (!m[slot]) m[slot] = [];
          m[slot].splice(Math.min(i, m[slot].length), 0, removed);
          save(m); softRefresh(el); App.toast('已恢复');
        }});
      } else if (act === 'delex') {
        var ei = +b.getAttribute('data-i');
        var removedE = m.exercises[ei];
        m.exercises.splice(ei, 1); save(m); softRefresh(el);
        App.toast('已删除运动', { label: '撤销', fn: function () {
          m.exercises.splice(Math.min(ei, m.exercises.length), 0, removedE);
          save(m); softRefresh(el); App.toast('已恢复');
        }});
      } else if (act === 'extips') {
        showExTips(b.getAttribute('data-t'));
      } else if (act === 'extips-prev') {
        var prevType = el.querySelector('#exType');
        showExDemo(prevType ? prevType.value : '跑步');
      } else if (act === 'dish') {
        showDish(b.getAttribute('data-name'));
      } else if (act === 'tip-close') {
        try { localStorage.setItem('keto_onboarded', '1'); } catch (e) {}
        App.checkin.onShow(el);
      } else if (act === 'date-today') {
        _activeDate = null; App.checkin.onShow(el);
      } else if (act === 'afu-ble') {
        if (App.mine && App.mine.openAfuBle) App.mine.openAfuBle('checkin');
      } else if (act === 'goto-weight') {
        App.go('records');
      } else if (act === 'water-add') {
        var ml = parseInt(b.getAttribute('data-ml'), 10) || 0;
        m.water = Math.max(0, (m.water || 0) + ml);
        save(m); softRefresh(el);
        App.toast(ml > 0 ? '已记录饮水 +' + ml + 'ml' : '已减 ' + (-ml) + 'ml');
      } else if (act === 'sync-steps') {
        if (!localStorage.getItem('keto_step_bg_tip')) { showStepBgGuide(el); }
        else { doSyncSteps(el); }
      } else if (act === 'paste-steps') {
        readStepsClipboard(el);
      } else if (act === 'pick-ex') {
        var cur = el.querySelector('#exType').value;
        var items = Object.keys(EX_MET).map(function (t) {
          return { label: t, sub: EX_TIPS[t] ? EX_TIPS[t][0] : '', value: t };
        });
        App.openPicker({
          title: '选择运动类型',
          items: items,
          value: cur,
          searchable: true,
          searchPlaceholder: '搜索运动…',
          onPick: function (v) {
            var hid = el.querySelector('#exType');
            hid.value = v;
            hid.dispatchEvent(new Event('change', { bubbles: true }));
            var txt = el.querySelector('#exTypeTxt'); if (txt) txt.textContent = v;
          }
        });
      } else if (act === 'pick-date') {
        var hid2 = el.querySelector('#checkinDate');
        App.openDatePicker({
          title: '记录日期（补录历史）',
          value: hid2.value,
          max: Store.dateStr(),
          onPick: function (iso) {
            hid2.value = iso;
            hid2.dispatchEvent(new Event('change', { bubbles: true }));
            var txt = el.querySelector('#checkinDateTxt'); if (txt) txt.textContent = iso;
          }
        });
      } else if (act === 'pick-unit') {
        // 从 <script.unit-data> JSON 读候选项，简单可靠无需每次重新构造
        var ud = el.querySelector('script.unit-data');
        var items;
        try { items = ud ? JSON.parse(ud.textContent || ud.innerText || '[]') : []; } catch (e) { items = []; }
        var curU = (el.querySelector('#unit-' + b.getAttribute('data-slot')) || {}).textContent || '个';
        App.openPicker({
          title: '选择单位',
          items: items,
          value: curU,
          onPick: function (v) {
            var slotK = b.getAttribute('data-slot');
            var u = el.querySelector('#unit-' + slotK); if (u) u.textContent = v;
            var amt = el.querySelector('#amt-' + slotK);
            // 切到 g 类按重量时给个合理的默认；切到个/杯等份类时默认 1
            if (amt && (!amt.value || +amt.value === 1)) amt.value = (v === 'g') ? 100 : 1;
          }
        });
      }
    });
    el.addEventListener('change', function (e) {
      if (e.target && e.target.id === 'steps') {
        var m2 = todayMeals(); m2.steps = parseInt(e.target.value, 10) || 0; save(m2); softRefresh(el);
      } else if (e.target && e.target.id === 'checkinDate') {
        // P1-2：切换记录日期 → 整页重渲染为该日期数据
        _activeDate = e.target.value || Store.dateStr();
        App.checkin.onShow(el);
      } else if (e.target && e.target.id === 'exType') {
        var prev = el.querySelector('#exIcoPrev');
        if (prev) prev.src = EX_ICON[e.target.value] || 'img/fitness.svg';
      }
    });
  }

  // 把一道菜作为一份食材加入今日某餐（P0-5：打通 A↔F 数据割裂）
  function addDishToSlot(slot, name) {
    var item = Bridge.dishToMealItem(name);
    if (!item) { App.toast('暂无该菜营养数据'); return; }
    var m = todayMeals();
    if (!m[slot]) m[slot] = [];
    m[slot].push(item);
    save(m);
    App.toast('已加入' + ({ breakfast: '早餐', lunch: '午餐', dinner: '晚餐' }[slot]) + '：' + name);
    App.closeModal();
    var ce = document.getElementById('view-checkin');
    if (ce && ce.classList.contains('active')) softRefresh(ce);
  }

  function showDish(name) {
    var d = Bridge.dishDetail(name);
    var html;
    if (d) {
      var ing;
      if (d.ingredients && d.ingredients.length && typeof d.ingredients[0] === 'string') {
        ing = d.ingredients.join('、');
      } else if (d.ingredients) {
        ing = d.ingredients.map(function (i) { return i.name + ' ' + i.weight + i.unit; }).join('、');
      } else {
        ing = '';
      }
      var steps = d.steps.map(function (s, i) { return (i + 1) + '. ' + s; }).join('<br>');
      html = '<h3 style="margin-top:0">' + name + '</h3>' +
        '<p style="font-size:13px;color:var(--muted)">食材：' + ing + '</p>' +
        '<p style="font-size:14px;line-height:1.7">' + steps + '</p>' +
        (d.tips ? '<p style="font-size:12px;color:var(--green-d)">💡 ' + d.tips + '</p>' : '');
    } else {
      html = '<h3 style="margin-top:0">' + name + '</h3><p style="color:var(--muted)">暂无详细做法，建议在食谱页查看营养，或自行按份量烹饪。</p>';
    }
    html += '<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">' +
      '<button class="btn sm" data-act="addish" data-slot="breakfast">＋ 加入早餐</button>' +
      '<button class="btn sm" data-act="addish" data-slot="lunch">＋ 加入午餐</button>' +
      '<button class="btn sm" data-act="addish" data-slot="dinner">＋ 加入晚餐</button>' +
      '</div>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    if (modal) modal.querySelectorAll('[data-act="addish"]').forEach(function (btn) {
      btn.addEventListener('click', function () { addDishToSlot(btn.getAttribute('data-slot'), name); });
    });
  }

  // A类：步数自动转走路运动（基于当日累计步数算公里/时长/消耗；重复同步覆盖不堆条）
  function upsertWalking(steps) {
    steps = parseInt(steps, 10) || 0;
    if (steps <= 0) return;
    var s = Store.getSettings();
    var h = (s.height && s.height > 80) ? s.height : 170; // 身高 cm
    var stride = h * 0.0043;            // 步幅(m)：身高 × 0.43 系数
    var km = steps * stride / 1000;     // 公里
    var min = km / 4.5 * 60;            // 走路约 4.5km/h → 分钟
    var cal = Math.round(EX_MET['走路'] * latestWeight() * (min / 60));
    var m = todayMeals();
    if (!m.exercises) m.exercises = [];
    var w = null;
    for (var i = 0; i < m.exercises.length; i++) {
      if (m.exercises[i].src === 'steps') { w = m.exercises[i]; break; }
    }
    if (!w) { w = { type: '走路', duration: 0, cal: 0, src: 'steps', steps: 0 }; m.exercises.push(w); }
    w.steps = steps;
    w.duration = Math.max(1, Math.round(min));
    w.cal = cal;
    save(m);
    var ce = document.getElementById('view-checkin');
    if (ce && ce.classList.contains('active')) softRefresh(ce);
  }

    App.checkin = {
    onShow: function (el) {
      var m = todayMeals();
      render(el, m);
      // 若本机已同步步数（原生可能在页面加载时注入 window.__steps__），自动填入并计入走路
      if (window.__steps__ && window.__steps__ > 0) {
        var sinp = el.querySelector('#steps');
        if (sinp && (parseInt(sinp.value, 10) || 0) === 0) {
          sinp.value = window.__steps__;
          sinp.dispatchEvent(new Event('change', { bubbles: true }));
          if (App.checkin && typeof App.checkin.upsertWalking === 'function') App.checkin.upsertWalking(window.__steps__);
        }
      }
      if (!el._aBound) { bind(el); el._aBound = true; }
      // v2.2.2：顶栏日期箭头已移除（用户反馈"无美感可言"），改由页内「记录日期」触发补录
      try { window.__activeDate = curDate(); } catch (e) {}
    },
    // v2.2.2：日期切换入口仍保留（页内「记录日期」按钮触发），顶栏箭头移除
    shiftDate: function (delta) {
      function pad(n) { return n < 10 ? '0' + n : '' + n; }
      function todayStr() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
      function deltaStr(iso, n) {
        var p = iso.split('-');
        var d = new Date(+p[0], +p[1] - 1, +p[2]);
        d.setDate(d.getDate() + n);
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
      }
      var cur = _activeDate || Store.dateStr();
      var next = deltaStr(cur, delta);
      if (delta > 0 && next > Store.dateStr()) return; // 严禁未来日
      _activeDate = next;
      window.__activeDate = next;
      var el = document.getElementById('view-checkin');
      if (el) {
        if (!el.classList.contains('active')) App.go('checkin');
        App.checkin.onShow(el);
      }
    },
    softRefresh: softRefresh,
    upsertWalking: upsertWalking
  };
})(window);
