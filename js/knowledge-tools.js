// knowledge-tools.js — 生酮知识中心（6 大实用工具）
// 蒸馏自《Atkins 新阿特金斯》《控糖革命》，纯前端、离线可用，非医疗建议
(function (global) {
  'use strict';

  var K = global.KNOWLEDGE || { principles: [], myths: [], faq: [], foods: { green: [], amber: [], red: [] } };
  var KetoCore = global.KetoCore;
  var Store = global.Store;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function round1(n) { return Math.round(n * 10) / 10; }

  /* =========================================================
     0. 知识库增强（增补条目，与原 knowledge.js 合并）
     ========================================================= */
  var KNOWLEDGE_EXTRA = {
    principles: [
      { q: '生酮适应期（ fat-adaptation）要多久？', a: '一般 2–4 周身体才学会高效燃脂。前 1–2 周最难受（生酮流感），坚持过去后饥饿感、精力会明显改善，不要在第 10 天放弃。' },
      { q: '为什么体重前两天下得快？', a: '初期掉的主要是「水分 + 糖原」。每克糖原绑定约 3g 水，碳水一低，糖原排空带走几斤水，不是纯脂肪。真正减脂看周趋势，别被首日数字骗。' },
      { q: '抽筋 / 心悸多半是缺电解质', a: '低碳利尿会带走钠、钾、镁。腿抽筋、心慌、乏力时先补：喝淡盐水、吃牛油果/坚果/深绿菜，必要时补镁剂。' },
      { q: '膳食纤维要从蔬菜里吃够', a: '生酮容易便秘。每天 300g+ 非淀粉蔬菜（西兰花、菠菜、油麦菜）补足纤维与镁，比买补剂更稳。' }
    ],
    myths: [
      { q: '生酮会掉肌肉？', a: '在蛋白吃够（按身高区间）+ 保留力量训练的前提下，生酮减的几乎都是脂肪。长期极低蛋白 + 不运动才会掉肌。' },
      { q: '胆固醇会爆表？', a: '对多数人，饱和脂肪升的是大颗粒 LDL，但同时升 HDL、降小而密 LDL 与甘油三酯。体检看血脂全套与炎症指标，别只盯总胆固醇。' },
      { q: '生酮必须喝防弹咖啡？', a: '不是。防弹咖啡只是「把早餐换成脂肪」的一种方式，热量不低。不想喝、喝了反胃，直接跳过，吃蛋/牛油果一样生酮。' }
    ],
    faq: [
      { q: '喝酒会影响生酮吗？', a: '酒精优先代谢、暂时暂停燃脂；烈酒（纯饮）+ 无糖苏打几乎无碳水，红酒/干型起泡少量；啤酒、鸡尾酒、利口酒碳水高，尽量避开。' },
      { q: '大姨妈变乱？', a: '部分女性低碳初期月经推迟，常与热量/碳水过低、压力有关。可把净碳水提到 50g 左右、保证脂肪与总热量，多观察 2–3 个周期。' },
      { q: '旅行 / 应酬怎么不断酮？', a: '提前吃份肥肉或坚果垫底；餐厅点清蒸/烧烤肉类 + 双份蔬菜，蘸料要生抽醋别要糖醋；酒选纯饮。偶尔破功一顿不崩盘，下一顿回正轨即可。' },
      { q: '能喝茶 / 咖啡 / 代糖吗？', a: '黑咖啡、茶零碳水随便喝（别加糖）。代糖优先赤藓糖醇、甜菊、罗汉果；麦芽糖醇少量（部分人会涨肚、微升糖），避免阿斯巴甜长期大量。' }
    ],
    foods: {
      green: ['亚麻籽', '奇亚籽', '泡菜（无糖）', '海带', '紫菜', '羽衣甘蓝', '芦笋', '西葫芦', '彩椒'],
      amber: ['毛豆', '鹰嘴豆', '燕麦（维持期）', '藜麦', '南瓜籽', '腰果', '牛奶', '味噌'],
      red: ['珍珠奶茶', '蛋糕', '饼干', '冰淇淋', '即食麦片', '果酱', '炼乳', '含糖酸奶', '运动饮料']
    }
  };

  function mergedFoods() {
    function uniq(a, b) { var s = {}; (a || []).concat(b || []).forEach(function (x) { if (x) s[x] = 1; }); return Object.keys(s); }
    return {
      green: uniq(K.foods.green, KNOWLEDGE_EXTRA.foods.green),
      amber: uniq(K.foods.amber, KNOWLEDGE_EXTRA.foods.amber),
      red: uniq(K.foods.red, KNOWLEDGE_EXTRA.foods.red)
    };
  }

  // 列表可能含合并写法（如「蓝莓/草莓（莓果）」），按 / 与（ 拆分后逐一匹配
  function inList(arr, name) {
    if (!arr || !name) return false;
    for (var i = 0; i < arr.length; i++) {
      var t = arr[i];
      if (t === name) return true;
      var parts = t.split('/');
      for (var j = 0; j < parts.length; j++) {
        var p = parts[j].split('（')[0].split('(')[0].trim();
        if (p === name) return true;
      }
    }
    return false;
  }

  function flatKnowledge() {
    var foods = mergedFoods();
    var list = [];
    (K.principles || []).concat(KNOWLEDGE_EXTRA.principles).forEach(function (it) { list.push({ cat: '核心原理', q: it.q, a: it.a }); });
    (K.myths || []).concat(KNOWLEDGE_EXTRA.myths).forEach(function (it) { list.push({ cat: '常见误区', q: it.q, a: it.a }); });
    (K.faq || []).concat(KNOWLEDGE_EXTRA.faq).forEach(function (it) { list.push({ cat: '问答 FAQ', q: it.q, a: it.a }); });
    ['🟢 放心吃', '🟡 适量', '🔴 尽量避免'].forEach(function (label, i) {
      var key = ['green', 'amber', 'red'][i];
      (foods[key] || []).forEach(function (name) { list.push({ cat: '食材红黑榜', q: label + ' ' + name, a: '归类于「' + label + '」清单。' }); });
    });
    // 外食点餐指南（可搜索）
    EATOUT.forEach(function (e) {
      list.push({ cat: '外食点餐指南', q: e.title, a: '✅ 可以点：' + e.good.join('、') + '  ⛔ 避开：' + e.bad.join('、') + '  💡 ' + e.tip });
    });
    // 实用工具入口（可搜索）
    [['食材能不能吃', '输入食物立刻判定 🟢🟡🔴'], ['每日饮食计划', '按你的数据生成一天生酮食谱'], ['外食点餐指南', '火锅/烧烤/日料/快餐怎么点'], ['净碳水计算器', '算真实净碳水与热量'], ['生酮适应期自测', '测你是不是燃脂体质'], ['原理误区FAQ', '原知识引擎全文（原理/误区/问答）']].forEach(function (t) {
      list.push({ cat: '实用工具', q: t[0], a: t[1] });
    });
    return list;
  }

  function searchKnowledge(q) {
    q = (q || '').trim();
    var all = flatKnowledge();
    if (!q) return all;
    var low = q.toLowerCase();
    return all.filter(function (it) {
      return (it.q && it.q.toLowerCase().indexOf(low) > -1) || (it.a && it.a.toLowerCase().indexOf(low) > -1) || (it.cat && it.cat.indexOf(q) > -1);
    });
  }

  /* =========================================================
     1. 食材能不能吃查询器
     ========================================================= */
  function lookupFood(name) {
    if (!KetoCore || !KetoCore.fuzzyMatchFood) return null;
    try { return KetoCore.fuzzyMatchFood(name); } catch (e) { return null; }
  }
  function classifyFood(name) {
    var m = lookupFood(name);
    if (!m) return { found: false, name: name };
    var d = m.data || {};
    var carb = d.carb || 0;
    var foods = mergedFoods();
    var inGreen = inList(foods.green, m.name) || inList(foods.green, name);
    var inAmber = inList(foods.amber, m.name) || inList(foods.amber, name);
    var inRed = inList(foods.red, m.name) || inList(foods.red, name);
    var verdict;
    if (inRed) verdict = 'red';
    else if (inAmber) verdict = 'amber';
    else if (inGreen) verdict = 'green';
    else if (carb <= 5) verdict = 'green';
    else if (carb <= 12) verdict = 'amber';
    else verdict = 'red';
    var verdictText = { green: '🟢 放心吃', amber: '🟡 适量吃', red: '🔴 尽量避免' }[verdict];
    return { found: true, name: m.name, input: name, data: d, carb: carb, verdict: verdict, verdictText: verdictText, inList: inGreen || inAmber || inRed };
  }

  /* =========================================================
     2. 每日饮食计划生成器
     ========================================================= */
  var MACRO = {
    keto: { label: '生酮', carbP: 5, proP: 20, fatP: 75, factor: 0.78 },
    lowcarb: { label: '低碳', carbP: 15, proP: 25, fatP: 60, factor: 0.85 },
    normal: { label: '正常', carbP: 40, proP: 30, fatP: 30, factor: 1.0 }
  };
  var BREAKFAST = {
    keto: [['防弹咖啡', 240], ['牛油果', 100], ['水煮蛋', 100]],
    lowcarb: [['希腊酸奶(无糖)', 200], ['蓝莓', 50], ['杏仁', 20]],
    normal: [['全麦面包', 60], ['水煮蛋', 100], ['牛油果', 80]]
  };
  var SNACK = {
    keto: [['夏威夷果', 30], ['黑巧克力(85%)', 20]],
    lowcarb: [['杏仁', 25], ['芝士', 30]],
    normal: [['核桃', 30]]
  };
  function dishPool(mode) {
    var pool = (KetoCore && KetoCore.DISH_DB && KetoCore.DISH_DB[mode]) || [];
    var meat = pool.filter(function (d) { return (d.tags || []).indexOf('荤菜') > -1; });
    var veg = pool.filter(function (d) { return (d.tags || []).indexOf('素菜') > -1; });
    var soup = pool.filter(function (d) { return (d.tags || []).indexOf('汤品') > -1; });
    return { meat: meat, veg: veg, soup: soup };
  }
  function foodNutri(name, gram) {
    var m = lookupFood(name);
    if (!m) return { cal: 0, carb: 0, protein: 0, fat: 0 };
    var d = m.data;
    var f = gram / 100;
    return { cal: (d.cal || 0) * f, carb: (d.carb || 0) * f, protein: (d.protein || 0) * f, fat: (d.fat || 0) * f };
  }
  function dishNutri(d, gram) {
    var f = gram / 100;
    return { cal: (d.cal || 0) * f, carb: (d.carb || 0) * f, protein: (d.protein || 0) * f, fat: (d.fat || 0) * f };
  }
  function buildMealPlan() {
    var s = Store ? Store.getSettings() : { gender: '男', height: 170, birthYear: 1985, activityLevel: 'light', startWeight: 70, dietMode: 'keto' };
    var mode = s.dietMode || 'keto';
    var m = MACRO[mode] || MACRO.keto;
    var wsAll = (Store && Store.getWeights) ? Store.getWeights() : [];
    var curW = s.startWeight;
    if (wsAll.length) {
      var latest = wsAll.reduce(function (a, b) { return (b.date || '') > (a.date || '') ? b : a; });
      if (latest.weight != null) curW = latest.weight;
    }
    var health = KetoCore && KetoCore.calcHealth ? KetoCore.calcHealth({
      gender: s.gender, height: s.height, birthYear: s.birthYear, activityLevel: s.activityLevel, weight: curW
    }) : { tdee: 1800 };
    var target = Math.round(health.tdee * m.factor);
    var carbCal = target * m.carbP / 100, proCal = target * m.proP / 100, fatCal = target * m.fatP / 100;
    var targetG = { carb: round1(carbCal / 4), protein: round1(proCal / 4), fat: round1(fatCal / 9) };

    var meals = [];
    function add(title, share, items) {
      var sub = { title: title, share: share, items: [], cal: 0, carb: 0, protein: 0, fat: 0 };
      items.forEach(function (it) {
        var n = it[0], g = it[1];
        var nu = foodNutri(n, g);
        sub.items.push({ name: n, gram: g, cal: Math.round(nu.cal), carb: round1(nu.carb), protein: round1(nu.protein), fat: round1(nu.fat) });
        sub.cal += nu.cal; sub.carb += nu.carb; sub.protein += nu.protein; sub.fat += nu.fat;
      });
      sub.cal = Math.round(sub.cal); sub.carb = round1(sub.carb); sub.protein = round1(sub.protein); sub.fat = round1(sub.fat);
      meals.push(sub);
    }
    // 午/晚餐：荤 + 素 + 汤
    var dp = dishPool(mode);
    function plate(title, share, meatIdx, vegIdx, soupIdx, mGram, vGram, sGram) {
      var items = [];
      if (dp.meat[meatIdx]) items.push({ d: dp.meat[meatIdx], g: mGram });
      if (dp.veg[vegIdx]) items.push({ d: dp.veg[vegIdx], g: vGram });
      if (dp.soup[soupIdx]) items.push({ d: dp.soup[soupIdx], g: sGram });
      var sub = { title: title, share: share, items: [], cal: 0, carb: 0, protein: 0, fat: 0 };
      items.forEach(function (o) {
        var nu = dishNutri(o.d, o.g);
        sub.items.push({ name: o.d.name, gram: o.g, cal: Math.round(nu.cal), carb: round1(nu.carb), protein: round1(nu.protein), fat: round1(nu.fat) });
        sub.cal += nu.cal; sub.carb += nu.carb; sub.protein += nu.protein; sub.fat += nu.fat;
      });
      sub.cal = Math.round(sub.cal); sub.carb = round1(sub.carb); sub.protein = round1(sub.protein); sub.fat = round1(sub.fat);
      meals.push(sub);
    }
    add('早餐（约' + Math.round(target * 0.20) + ' kcal）', 0.20, BREAKFAST[mode]);
    plate('午餐（约' + Math.round(target * 0.35) + ' kcal）', 0.35, 0, 0, 0, 200, 220, 0);
    plate('晚餐（约' + Math.round(target * 0.35) + ' kcal）', 0.35, 1, 1, 0, 200, 200, 250);
    add('加餐（约' + Math.round(target * 0.10) + ' kcal）', 0.10, SNACK[mode]);

    var tot = { cal: 0, carb: 0, protein: 0, fat: 0 };
    meals.forEach(function (x) { tot.cal += x.cal; tot.carb += x.carb; tot.protein += x.protein; tot.fat += x.fat; });
    tot.cal = Math.round(tot.cal); tot.carb = round1(tot.carb); tot.protein = round1(tot.protein); tot.fat = round1(tot.fat);
    var sum = tot.carb + tot.protein + tot.fat;
    tot.carbP = sum ? Math.round(tot.carb / sum * 100) : 0;
    tot.proP = sum ? Math.round(tot.protein / sum * 100) : 0;
    tot.fatP = sum ? Math.round(tot.fat / sum * 100) : 0;
    return { mode: m, target: target, targetG: targetG, meals: meals, tot: tot };
  }

  /* =========================================================
     3. 外食点餐指南
     ========================================================= */
  var EATOUT = [
    { key: '火锅', title: '火锅 / 麻辣烫', good: ['清汤 / 菌汤 / 番茄锅底', '肥牛、羊肉卷、毛肚、黄喉', '虾滑、海鲜、蛋饺（少淀粉）', '绿叶菜、菌菇、冻豆腐'], bad: ['麻酱 / 沙茶蘸料（高糖高碳水）', '宽粉、年糕、土豆片', '各种丸子（淀粉居多）', '含糖饮料、酸梅汤'], tip: '蘸料用「生抽 + 醋 + 蒜泥 + 少量香油 / 辣椒油」，避开麻酱和沙茶酱；先吃肉菜再涮菜。' },
    { key: '烧烤', title: '烧烤 / 烤肉', good: ['牛羊肉串、五花肉、鸡翅', '烤海鲜、烤香菇、烤青椒', '生菜包肉'], bad: ['烤红薯、烤玉米、烤馒头', '蜜汁 / 甜酱腌制的肉', '含糖饮料'], tip: '用盐和孜然辣椒调味，避开蜂蜜 / 甜酱；配生菜解腻，别就着啤酒（碳水 + 酒精双重打击）。' },
    { key: '日料', title: '日料 / 寿司', good: ['刺身、寿司（少米饭）', '烤鱼、盐烤牛舌', '味噌汤（无勾芡）'], bad: ['寿司饭、天妇罗', '照烧酱（含糖高）', '茶碗蒸里的勾芡、甜点'], tip: '刺身随便吃；寿司把米饭拨掉大半；照烧 / 蒲烧酱含糖，改成盐烤。' },
    { key: '快餐', title: '快餐 / 汉堡', good: ['汉堡去面包、只吃肉饼 + 芝士 + 蔬菜', '沙拉（油醋汁，别千岛）', '无糖可乐 / 气泡水'], bad: ['面包胚、薯条、洋葱圈', '含糖酸奶、奶昔', '早餐麦片'], tip: '「蛋白 Style」把面包换成生菜；酱料要油醋别要甜酱；薯条是纯碳水炸弹。' },
    { key: '食堂', title: '食堂 / 自助', good: ['两个荤菜（红烧肉 / 炒肉）', '一份绿叶菜', '蒸蛋 / 豆腐'], bad: ['主食窗口（米饭面食）', '糖醋 / 红烧汁重的菜', '免费汤里的勾芡'], tip: '打菜原则「两荤一素」，主食能省则省；汤汁别拌饭；用菜里的油补脂肪。' },
    { key: '聚餐', title: '聚餐 / 宴席', good: ['清蒸鱼、白灼虾、炖汤', '凉拌菜、炒青菜', '提前吃点坚果垫底'], bad: ['红烧汁 / 糖醋汁的菜', '精致主食、点心', '敬酒的甜酒、啤酒'], tip: '赴宴前先吃半块牛油果或一把坚果，降低饥饿；优先清蒸白灼，蘸姜醋别蘸糖醋。' },
    { key: '咖啡', title: '咖啡店 / 奶茶店', good: ['美式、拿铁（无糖）', '防弹咖啡', '气泡水'], bad: ['奶茶、焦糖玛奇朵', '星冰乐、果茶', '加糖糖浆'], tip: '咖啡不加糖；奶茶换成无糖纯茶或美式；想喝「有味道」就气泡水 + 一片柠檬。' },
    { key: '便利店', title: '便利店 / 超市', good: ['水煮蛋、芝士片', '无糖希腊酸奶', '坚果、牛油果', '黑巧克力 85%+'], bad: ['饭团、三明治、面包', '含糖酸奶、果汁', '薯片、饼干'], tip: '便利店也能生酮：冷藏柜拿蛋和酸奶，货架拿坚果黑巧；避开一切「主食 + 含糖」组合。' }
  ];
  function eatoutFor(key) {
    for (var i = 0; i < EATOUT.length; i++) if (EATOUT[i].key === key) return EATOUT[i];
    return null;
  }

  /* =========================================================
     4. 净碳水 / 热量计算器
     ========================================================= */
  var FIBER_DEFAULT = {
    '牛油果': 6.7, '西兰花': 2.6, '菠菜': 2.2, '芦笋': 2.1, '杏仁': 12.5, '核桃': 6.7,
    '奇亚籽': 34.4, '亚麻籽': 27, '夏威夷果': 5.3, '黑巧克力(85%)': 11, '黑豆': 15,
    '菜花': 2, '油麦菜': 1.2, '生菜': 1.3, '黄瓜': 0.5, '西红柿': 1.2
  };
  function netCarb(input) {
    var m = lookupFood(input.name);
    var per100 = m ? m.data : null;
    var gram = Math.max(0, parseFloat(input.gram) || 0);
    var carb100 = per100 ? (per100.carb || 0) : (parseFloat(input.carb100) || 0);
    var cal100 = per100 ? (per100.cal || 0) : (parseFloat(input.cal100) || 0);
    var factor = gram / 100;
    var totalCarb = round1(carb100 * factor);
    var fiber = Math.max(0, parseFloat(input.fiber) || 0);
    var sugarAlcohol = Math.max(0, parseFloat(input.sugarAlcohol) || 0);
    var net = round1(Math.max(0, totalCarb - fiber - sugarAlcohol));
    var calories = Math.round(cal100 * factor);
    // 生酮预算提示（以单餐净碳水 10–15g 为参考）
    var budget = 'ok';
    if (net > 15) budget = 'high';
    else if (net > 8) budget = 'mid';
    return { found: !!per100, name: per100 ? m.name : (input.name || '自定义'), gram: gram, totalCarb: totalCarb, fiber: fiber, sugarAlcohol: sugarAlcohol, net: net, calories: calories, budget: budget };
  }

  /* =========================================================
     5. 生酮适应期自测
     ========================================================= */
  var ADAPT_Q = [
    { q: '餐后还容易饿、馋甜食吗？', good: '几乎不饿、不馋' },
    { q: '上午的精力与专注力？', good: '稳定充沛，不犯困' },
    { q: '中低强度运动耐力？', good: '明显提升、更持久' },
    { q: '对米面糖的渴望？', good: '几乎消失' },
    { q: '生酮流感症状（头痛/乏力/便秘）？', good: '已完全消失' },
    { q: '吃肥肉 / 黄油等油腻是否自然？', good: '很喜欢、吃得下' },
    { q: '体重 / 围度趋势（坚持前提下）？', good: '持续下降' },
    { q: '情绪与睡眠稳定度？', good: '更平稳' }
  ];
  function scoreAdaptation(answers) {
    var sum = 0;
    answers.forEach(function (v) { sum += (parseInt(v, 10) || 0); });
    var max = ADAPT_Q.length * 5;
    var pct = Math.round(sum / max * 100);
    var level, tip;
    if (pct >= 80) { level = '高度脂肪适应'; tip = '身体已习惯燃脂，保持当前饮食与电解质补给，可加入间歇性空腹进一步获益。'; }
    else if (pct >= 50) { level = '适应中'; tip = '已在路上。继续保证蛋白够、钠钾镁补足，避免隐形碳水（酱料、加工肉），再过 1–2 周会明显变好。'; }
    else { level = '仍在适应期'; tip = '属正常前 2–4 周。别放弃：每天补钠（咸汤/半勺盐）、喝够水、睡好，多数人在第 10–21 天迎来拐点。'; }
    return { pct: pct, level: level, tip: tip };
  }

  /* =========================================================
     UI — 知识中心弹窗
     ========================================================= */
  function macroBar(c, p, f) {
    var sum = c + p + f; if (sum <= 0) sum = 1;
    var cw = Math.round(c / sum * 100), pw = Math.round(p / sum * 100), fw = 100 - cw - pw;
    return '<div class="keto-ring"><div class="bar">' +
      '<span class="seg-carb" style="width:' + cw + '%"></span>' +
      '<span class="seg-pro" style="width:' + pw + '%"></span>' +
      '<span class="seg-fat" style="width:' + fw + '%"></span></div></div>' +
      '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:4px">' +
      '<span>碳水 ' + cw + '%</span><span>蛋白 ' + pw + '%</span><span>脂肪 ' + fw + '%</span></div>';
  }

  function toolCard(key, icon, title, desc) {
    return '<div class="dish" data-tool="' + key + '" style="margin-bottom:10px">' +
      '<div class="thumb" style="font-size:26px">' + icon + '</div>' +
      '<div class="info"><div class="n">' + title + '</div><div class="c">' + desc + '</div></div></div>';
  }

  function renderHub() {
    var html =
      '<h3 style="margin:0 0 10px">📚 生酮知识中心</h3>' +
      '<input id="kbSearch" type="search" placeholder="搜索：防弹咖啡 / 平台期 / 火锅…" style="margin-bottom:10px">' +
      '<div id="kbTabs" style="display:flex;gap:8px;margin-bottom:10px">' +
      '<button class="btn sm" data-kb="tools" style="flex:1">🛠 工具</button>' +
      '<button class="btn sm ghost" data-kb="kb" style="flex:1">📖 知识库</button>' +
      '</div>' +
      '<div id="kbContent"></div>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    var content = modal.querySelector('#kbContent');

    function showTools() {
      modal.querySelectorAll('#kbTabs [data-kb]').forEach(function (b) {
        b.classList.toggle('ghost', b.getAttribute('data-kb') !== 'tools');
      });
      content.innerHTML =
        toolCard('food', '🔍', '食材能不能吃', '输入食物，立刻判定 🟢🟡🔴') +
        toolCard('plan', '🍱', '每日饮食计划', '按你的数据生成一天食谱') +
        toolCard('eatout', '🍽️', '外食点餐指南', '火锅/烧烤/日料怎么点') +
        toolCard('netcarb', '🧮', '净碳水计算器', '算真实净碳水与热量') +
        toolCard('adapt', '🩺', '适应期自测', '测你是不是燃脂体质') +
        toolCard('knowledge', '📚', '原理/误区/FAQ', '原知识引擎全文');
      content.querySelectorAll('[data-tool]').forEach(function (el) {
        el.addEventListener('click', function () { openTool(el.getAttribute('data-tool')); });
      });
    }
    function showKB(filter) {
      modal.querySelectorAll('#kbTabs [data-kb]').forEach(function (b) {
        b.classList.toggle('ghost', b.getAttribute('data-kb') !== 'kb');
      });
      var items = searchKnowledge(filter);
      if (!items.length) { content.innerHTML = '<div class="empty">没有匹配内容，换个词试试</div>'; return; }
      content.innerHTML = '<div style="font-size:13px;line-height:1.75">' + items.map(function (it) {
        return '<div style="border-bottom:1px solid #eee;padding:8px 0"><div style="font-weight:600;font-size:13.5px">' +
          esc(it.q) + ' <span class="tag">' + esc(it.cat) + '</span></div>' +
          (it.a && it.a.indexOf('归类于') === -1 ? '<div style="font-size:12.5px;color:var(--muted);margin-top:3px">' + esc(it.a) + '</div>' : '') + '</div>';
      }).join('') + '</div>';
    }

    function doSearch(q) {
      var active = modal.querySelector('#kbTabs [data-kb]:not(.ghost)');
      if (!q) { (active && active.getAttribute('data-kb') === 'kb') ? showKB('') : showTools(); return; }
      // 搜索时统一展示结果
      modal.querySelectorAll('#kbTabs [data-kb]').forEach(function (b) { b.classList.add('ghost'); });
      var items = searchKnowledge(q);
      var html = '<div style="font-size:12px;color:var(--muted);margin-bottom:6px">找到 ' + items.length + ' 条知识</div>';
      if (items.length) {
        html += '<div style="font-size:13px;line-height:1.7">' + items.slice(0, 40).map(function (it) {
          return '<div style="border-bottom:1px solid #eee;padding:7px 0"><div style="font-weight:600;font-size:13px">' + esc(it.q) +
            ' <span class="tag">' + esc(it.cat) + '</span></div>' + (it.a && it.a.indexOf('归类于') === -1 ? '<div style="font-size:12.5px;color:var(--muted);margin-top:2px">' + esc(it.a) + '</div>' : '') + '</div>';
        }).join('') + '</div>';
      } else {
        html += '<div class="empty">没找到，试试「平台期」「火锅」「坚果」等</div>';
      }
      content.innerHTML = html;
    }

    modal.querySelectorAll('#kbTabs [data-kb]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var k = btn.getAttribute('data-kb');
        modal.querySelector('#kbSearch').value = '';
        if (k === 'tools') showTools(); else showKB('');
      });
    });
    var searchInput = modal.querySelector('#kbSearch');
    searchInput.addEventListener('input', function () { doSearch(searchInput.value); });

    showTools();
  }

  function openTool(key) {
    if (key === 'food') return toolFood();
    if (key === 'plan') return toolPlan();
    if (key === 'eatout') return toolEatout();
    if (key === 'netcarb') return toolNetCarb();
    if (key === 'adapt') return toolAdapt();
    if (key === 'knowledge') return renderKnowledgeOnly();
    renderHub();
  }

  function backBtn() { return '<button class="btn ghost sm" id="kbBack" style="width:auto;margin:0 0 10px">' + ICONS.svg('chevronLeft', 14) + ' 返回知识中心</button>'; }

  function toolFood() {
    var names = (KetoCore && KetoCore.FOOD_DB) ? Object.keys(KetoCore.FOOD_DB) : [];
    var html = '<h3 style="margin:0 0 10px">🔍 食材能不能吃</h3>' + backBtn() +
      '<input id="foodInput" list="foodList" placeholder="输入食物，如 牛油果 / 白米饭 / 奶茶" style="margin-bottom:10px">' +
      '<datalist id="foodList">' + names.map(function (n) { return '<option value="' + esc(n) + '">'; }).join('') + '</datalist>' +
      '<button class="btn" id="foodGo">查询</button>' +
      '<div id="foodResult" style="margin-top:12px"></div>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    modal.querySelector('#kbBack').addEventListener('click', renderHub);
    function run() {
      var v = modal.querySelector('#foodInput').value;
      var res = classifyFood(v);
      var box = modal.querySelector('#foodResult');
      if (!res.found) {
        box.innerHTML = '<div class="empty">没找到「' + esc(v) + '」，试试更通用的叫法（如「米饭」而非「白米饭」）</div>';
        return;
      }
      var color = { green: '#2E7D32', amber: '#E6A700', red: '#C62828' }[res.verdict];
      var d = res.data;
      box.innerHTML = '<div class="card" style="border-left:5px solid ' + color + ';margin-bottom:0">' +
        '<div style="font-size:18px;font-weight:700;color:' + color + '">' + res.verdictText + '</div>' +
        '<div style="font-size:13px;color:var(--muted);margin:2px 0 10px">匹配：' + esc(res.name) + (res.inList ? '（红黑榜收录）' : '（按碳水密度自动判定，每100g）') + '</div>' +
        '<div class="stats">' +
        '<div class="stat"><div class="num" style="font-size:18px">' + Math.round(d.cal || 0) + '</div><div class="lbl">热量 kcal</div></div>' +
        '<div class="stat"><div class="num" style="font-size:18px">' + round1(d.carb || 0) + 'g</div><div class="lbl">碳水/100g</div></div>' +
        '<div class="stat"><div class="num" style="font-size:18px">' + round1(d.protein || 0) + 'g</div><div class="lbl">蛋白</div></div>' +
        '<div class="stat"><div class="num" style="font-size:18px">' + round1(d.fat || 0) + 'g</div><div class="lbl">脂肪</div></div>' +
        '</div>' +
        '<p style="font-size:12px;color:var(--muted);margin:10px 0 0">注：未含膳食纤维数据，净碳水≈总碳水；高纤维食物（牛油果/坚果）实际净碳水更低。</p>' +
        '</div>';
    }
    modal.querySelector('#foodGo').addEventListener('click', run);
    modal.querySelector('#foodInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });
  }

  function toolPlan() {
    var p = buildMealPlan();
    var rows = p.meals.map(function (m) {
      var its = m.items.map(function (it) {
        return '<div style="display:flex;justify-content:space-between;font-size:12.5px;padding:3px 0;border-bottom:1px dashed #eee">' +
          '<span>' + esc(it.name) + ' <span style="color:var(--muted)">' + it.gram + 'g</span></span>' +
          '<span style="color:var(--muted)">' + it.cal + ' kcal · 碳' + it.carb + ' 蛋' + it.protein + ' 脂' + it.fat + '</span></div>';
      }).join('');
      return '<div class="card" style="margin-bottom:10px"><h3 style="font-size:14px">' + esc(m.title) + ' <span class="sub">' + m.cal + ' kcal</span></h3>' + its + '</div>';
    }).join('');
    var html = '<h3 style="margin:0 0 10px">🍱 每日饮食计划</h3>' + backBtn() +
      '<div style="font-size:12.5px;color:var(--muted);margin-bottom:10px">当前模式：<b>' + p.mode.label + '</b> · 建议总热量 <b>' + p.target + ' kcal</b> · 目标宏量（碳/蛋/脂）：' + p.targetG.carb + ' / ' + p.targetG.protein + ' / ' + p.targetG.fat + ' g</div>' +
      rows +
      '<div class="card" style="border-left:5px solid var(--primary)"><h3 style="font-size:14px">全天合计 <span class="sub">' + p.tot.cal + ' kcal</span></h3>' +
      macroBar(p.tot.carb, p.tot.protein, p.tot.fat) +
      '<div style="font-size:12px;color:var(--muted);margin-top:8px">实际比例 碳水' + p.tot.carbP + '% / 蛋白' + p.tot.proP + '% / 脂肪' + p.tot.fatP + '%（目标 ' + p.mode.carbP + '/' + p.mode.proP + '/' + p.mode.fatP + '%）</div>' +
      '<p style="font-size:12px;color:var(--muted);margin:8px 0 0">仅供参考，分量可按饥饿感微调；蛋白别长期低于目标，脂肪适量而非越多越好。</p></div>';
    App.openModal(html);
    document.getElementById('app-modal').querySelector('#kbBack').addEventListener('click', renderHub);
  }

  function toolEatout() {
    var html = '<h3 style="margin:0 0 10px">🍽️ 外食点餐指南</h3>' + backBtn() +
      '<div id="eatTabs" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">' +
      EATOUT.map(function (e, i) { return '<button class="btn sm ' + (i === 0 ? '' : 'ghost') + '" data-eat="' + e.key + '">' + esc(e.title) + '</button>'; }).join('') + '</div>' +
      '<div id="eatBody"></div>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    modal.querySelector('#kbBack').addEventListener('click', renderHub);
    function fill(key) {
      var e = eatoutFor(key); if (!e) return;
      modal.querySelector('#eatBody').innerHTML =
        '<div class="card" style="border-left:5px solid var(--primary)"><h3 style="font-size:14px;color:var(--primary-d)">✅ 可以点</h3>' +
        e.good.map(function (x) { return '<div style="font-size:13px;padding:3px 0">· ' + esc(x) + '</div>'; }).join('') + '</div>' +
        '<div class="card" style="border-left:5px solid var(--danger)"><h3 style="font-size:14px;color:var(--danger)">⛔ 避开</h3>' +
        e.bad.map(function (x) { return '<div style="font-size:13px;padding:3px 0">· ' + esc(x) + '</div>'; }).join('') + '</div>' +
        '<div class="card"><h3 style="font-size:14px">💡 关键技巧</h3><div style="font-size:13px;line-height:1.7;color:var(--text)">' + esc(e.tip) + '</div></div>';
    }
    modal.querySelectorAll('#eatTabs [data-eat]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        modal.querySelectorAll('#eatTabs [data-eat]').forEach(function (x) { x.classList.add('ghost'); });
        btn.classList.remove('ghost');
        fill(btn.getAttribute('data-eat'));
      });
    });
    fill(EATOUT[0].key);
  }

  function toolNetCarb() {
    var names = (KetoCore && KetoCore.FOOD_DB) ? Object.keys(KetoCore.FOOD_DB) : [];
    var html = '<h3 style="margin:0 0 10px">🧮 净碳水 / 热量计算器</h3>' + backBtn() +
      '<label>食物（可选，自动带出每100g营养）</label>' +
      '<input id="ncName" list="ncList" placeholder="如 牛油果 / 西兰花（留空则手填）">' +
      '<datalist id="ncList">' + names.map(function (n) { return '<option value="' + esc(n) + '">'; }).join('') + '</datalist>' +
      '<div class="row" style="margin-top:8px"><div><label>重量 (g)</label><input id="ncGram" type="number" value="100"></div>' +
      '<div><label>膳食纤维 (g)</label><input id="ncFiber" type="number" value="0" step="0.1"></div></div>' +
      '<div class="row" style="margin-top:8px"><div><label>糖醇 (g，可选)</label><input id="ncSa" type="number" value="0" step="0.1"></div>' +
      '<div><label>碳水/100g(留空自动)</label><input id="ncCarb" type="number" step="0.1" placeholder="自动"></div></div>' +
      '<button class="btn" id="ncGo">计算</button>' +
      '<div id="ncResult" style="margin-top:12px"></div>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    modal.querySelector('#kbBack').addEventListener('click', renderHub);
    function run() {
      var name = modal.querySelector('#ncName').value;
      var m = lookupFood(name);
      var carbInput = modal.querySelector('#ncCarb').value;
      var r = netCarb({
        name: name, gram: modal.querySelector('#ncGram').value,
        fiber: modal.querySelector('#ncFiber').value, sugarAlcohol: modal.querySelector('#ncSa').value,
        carb100: carbInput
      });
      // 自动带出纤维默认值与碳水
      if (m && !carbInput) { modal.querySelector('#ncCarb').value = round1(m.data.carb || 0); }
      if (m && FIBER_DEFAULT[m.name] != null && modal.querySelector('#ncFiber').value === '0') {
        modal.querySelector('#ncFiber').value = FIBER_DEFAULT[m.name];
      }
      var color = { ok: '#2E7D32', mid: '#E6A700', high: '#C62828' }[r.budget];
      var budgetText = { ok: '净碳水友好，放心', mid: '接近单餐上限，注意', high: '净碳水偏高，悠着点' }[r.budget];
      modal.querySelector('#ncResult').innerHTML = '<div class="card" style="border-left:5px solid ' + color + ';margin-bottom:0">' +
        '<div style="font-size:16px;font-weight:700;color:' + color + '">' + esc(r.name) + ' · ' + r.gram + 'g</div>' +
        '<div class="stats" style="margin-top:8px">' +
        '<div class="stat"><div class="num" style="font-size:18px">' + r.calories + '</div><div class="lbl">热量 kcal</div></div>' +
        '<div class="stat"><div class="num" style="font-size:18px">' + r.totalCarb + 'g</div><div class="lbl">总碳水</div></div>' +
        '<div class="stat"><div class="num" style="font-size:18px">' + r.fiber + 'g</div><div class="lbl">纤维</div></div>' +
        '<div class="stat"><div class="num" style="font-size:18px">' + r.net + 'g</div><div class="lbl">净碳水</div></div>' +
        '</div>' +
        '<p style="font-size:12.5px;color:' + color + ';margin:10px 0 0;font-weight:600">' + budgetText + '（参考单餐净碳水 ≤10g 为佳）</p>' +
        '</div>';
    }
    modal.querySelector('#ncGo').addEventListener('click', run);
    modal.querySelector('#ncName').addEventListener('change', function () {
      var m = lookupFood(modal.querySelector('#ncName').value);
      if (m) { modal.querySelector('#ncCarb').value = round1(m.data.carb || 0); if (FIBER_DEFAULT[m.name] != null) modal.querySelector('#ncFiber').value = FIBER_DEFAULT[m.name]; }
    });
  }

  function toolAdapt() {
    var html = '<h3 style="margin:0 0 10px">🩺 生酮适应期自测</h3>' + backBtn() +
      '<p style="font-size:12.5px;color:var(--muted);margin:0 0 10px">为每项选「最符合你现在的状态」（5=最好，1=最差），结果实时计算。</p>' +
      '<div id="adaptQs"></div><div id="adaptResult" style="margin-top:10px"></div>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    modal.querySelector('#kbBack').addEventListener('click', renderHub);
    var qs = modal.querySelector('#adaptQs');
    qs.innerHTML = ADAPT_Q.map(function (q, i) {
      return '<div style="border-bottom:1px solid #eee;padding:10px 0"><div style="font-size:13.5px;font-weight:600;margin-bottom:6px">' + (i + 1) + '. ' + esc(q.q) + '</div>' +
        '<div style="display:flex;gap:6px" data-qi="' + i + '">' +
        [1, 2, 3, 4, 5].map(function (v) { return '<button class="btn sm ghost" data-v="' + v + '" style="flex:1;padding:6px 0">' + v + '</button>'; }).join('') +
        '</div><div style="font-size:11px;color:var(--muted);margin-top:3px">1=最差 · 5=' + esc(q.good) + '</div></div>';
    }).join('');
    var answers = {};
    qs.querySelectorAll('[data-qi]').forEach(function (row) {
      var qi = row.getAttribute('data-qi');
      row.querySelectorAll('[data-v]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          answers[qi] = btn.getAttribute('data-v');
          row.querySelectorAll('[data-v]').forEach(function (x) { x.classList.add('ghost'); });
          btn.classList.remove('ghost');
          render();
        });
      });
    });
    function render() {
      var vals = [];
      for (var i = 0; i < ADAPT_Q.length; i++) if (answers[i]) vals.push(answers[i]);
      var box = modal.querySelector('#adaptResult');
      if (vals.length < ADAPT_Q.length) {
        box.innerHTML = '<div style="font-size:12.5px;color:var(--muted)">已完成 ' + vals.length + '/' + ADAPT_Q.length + ' 题</div>';
        return;
      }
      var r = scoreAdaptation(vals);
      var color = r.pct >= 80 ? '#2E7D32' : r.pct >= 50 ? '#E6A700' : '#C62828';
      box.innerHTML = '<div class="card" style="border-left:5px solid ' + color + ';margin-bottom:0">' +
        '<div style="font-size:15px;font-weight:700;color:' + color + '">' + r.level + ' · ' + r.pct + ' 分</div>' +
        '<div class="stat" style="margin:10px 0"><div class="num" style="font-size:34px">' + r.pct + '<span style="font-size:16px">/100</span></div><div class="lbl">脂肪适应能力</div></div>' +
        '<div style="font-size:13px;line-height:1.7">' + esc(r.tip) + '</div></div>';
    }
    render();
  }

  function renderKnowledgeOnly() {
    var foods = mergedFoods();
    var tabs = [['principles', '核心原理'], ['myths', '常见误区'], ['faq', '问答 FAQ'], ['foods', '食材红黑榜']];
    var tabBar = tabs.map(function (t, i) { return '<button class="btn sm ' + (i === 0 ? '' : 'ghost') + '" data-k="' + t[0] + '" style="margin:0 4px 8px 0">' + t[1] + '</button>'; }).join('');
    var html = '<h3 style="margin:0 0 10px">📚 原理 / 误区 / FAQ</h3>' + backBtn() + '<div id="kTabs2">' + tabBar + '</div><div id="kBody2"></div>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    modal.querySelector('#kbBack').addEventListener('click', renderHub);
    function fill(key) {
      var body = modal.querySelector('#kBody2');
      if (key === 'foods') {
        body.innerHTML = '<div style="font-size:13px;line-height:1.9">' +
          '<div style="color:#2E7D32;font-weight:600">🟢 放心吃</div>' + foods.green.join('、') + '<br><br>' +
          '<div style="color:#E6A700;font-weight:600">🟡 适量</div>' + foods.amber.join('、') + '<br><br>' +
          '<div style="color:#C62828;font-weight:600">🔴 尽量避免</div>' + foods.red.join('、') + '</div>';
        return;
      }
      var src = key === 'principles' ? K.principles.concat(KNOWLEDGE_EXTRA.principles) : key === 'myths' ? K.myths.concat(KNOWLEDGE_EXTRA.myths) : K.faq.concat(KNOWLEDGE_EXTRA.faq);
      body.innerHTML = src.map(function (it) {
        return '<div style="border-bottom:1px solid #eee;padding:8px 0"><div style="font-weight:600;font-size:14px">Q：' + esc(it.q) + '</div>' +
          '<div style="font-size:13px;color:var(--muted);margin-top:4px;line-height:1.7">A：' + esc(it.a) + '</div></div>';
      }).join('');
    }
    fill('principles');
    modal.querySelectorAll('#kTabs2 [data-k]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        modal.querySelectorAll('#kTabs2 [data-k]').forEach(function (x) { x.classList.add('ghost'); });
        btn.classList.remove('ghost');
        fill(btn.getAttribute('data-k'));
      });
    });
  }

  global.KnowledgeTools = {
    openHub: renderHub,
    classifyFood: classifyFood,
    buildMealPlan: buildMealPlan,
    eatoutFor: eatoutFor,
    netCarb: netCarb,
    scoreAdaptation: scoreAdaptation,
    searchKnowledge: searchKnowledge,
    EATOUT: EATOUT,
    ADAPT_Q: ADAPT_Q
  };
})(window);
