// dish-ext.js — 菜谱扩充 v1.2（新增约 50 道，含西餐/东南亚/早餐/更多家常）
// 在不改动 keto-core.js 主体的前提下，向 DISH_DB / DISH_DETAIL / FOOD_ALIASES 追加数据，
// 并新增「过敏原推导」dishAllergens 供「我的忌口」功能使用。必须在 keto-core.js 之后加载。
(function (global) {
  'use strict';
  var KetoCore = global.KetoCore;
  if (!KetoCore) { return; }
  var DISH_DB = KetoCore.DISH_DB;
  var DISH_DETAIL = KetoCore.DISH_DETAIL;
  var FOOD_ALIASES = KetoCore.FOOD_ALIASES;

  // ===== 过敏原类型（供「我的忌口」设置多选）=====
  var ALLERGEN_TYPES = ['蛋', '海鲜', '奶', '大豆', '花生', '坚果', '麸质'];

  // 食材关键词 → 过敏原（仅在菜有 DISH_DETAIL 时扫食材；无详情时扫菜名）
  var ALLERGEN_RULES = [
    { re: /鸡蛋|蛋黄|蛋白|咸鸭蛋|蛋花|蛋羹|蒸蛋|炒蛋/, label: '蛋' },
    { re: /虾|蟹|三文鱼|鲈鱼|鳕鱼|带鱼|黄花鱼|蛤蜊|鱿鱼|海参|秋刀鱼|虾仁|海鲜/, label: '海鲜' },
    { re: /牛奶|芝士|奶油|黄油|酸奶|希腊酸奶/, label: '奶' },
    { re: /豆腐|香干|腐竹|豆浆|豆皮|黄豆|毛豆|豆干|豆苗/, label: '大豆' },
    { re: /花生/, label: '花生' },
    { re: /杏仁|核桃|腰果|夏威夷果|坚果|南瓜子|葵花籽|芝麻|奇亚籽|亚麻籽/, label: '坚果' },
    { re: /面粉|面包|馒头|面条|挂面|小麦|面筋|河粉|粉丝/, label: '麸质' }
  ];

  function dishAllergens(name) {
    var found = {};
    function scan(t) {
      if (!t) return;
      ALLERGEN_RULES.forEach(function (m) { if (m.re.test(t)) found[m.label] = 1; });
    }
    var d = DISH_DETAIL[name];
    if (d && d.ingredients && d.ingredients.length) {
      d.ingredients.forEach(function (i) { scan(i.name); });
    } else {
      scan(name || '');
    }
    return Object.keys(found);
  }

  // ===== 新增菜品（每100g 营养，按模式分类）=====
  var KETO_NEW = [
    { name: '牛油果鸡蛋沙拉', cal: 210, carb: 6, protein: 6, fat: 18, tags: ['沙拉', '早餐'] },
    { name: '凯撒沙拉', cal: 230, carb: 5, protein: 8, fat: 20, tags: ['沙拉'] },
    { name: '烟熏三文鱼', cal: 180, carb: 0, protein: 20, fat: 11, tags: ['海鲜'] },
    { name: '芝士焗西兰花', cal: 160, carb: 6, protein: 8, fat: 12, tags: ['素菜'] },
    { name: '奶油蘑菇汤', cal: 180, carb: 5, protein: 4, fat: 17, tags: ['汤品'] },
    { name: '烤秋刀鱼', cal: 200, carb: 0, protein: 22, fat: 12, tags: ['海鲜'] },
    { name: '白切鸡', cal: 150, carb: 0, protein: 25, fat: 5, tags: ['荤菜'] },
    { name: '酱牛肉', cal: 220, carb: 0, protein: 26, fat: 12, tags: ['荤菜'] },
    { name: '凉拌鸡丝', cal: 160, carb: 2, protein: 24, fat: 6, tags: ['凉菜'] },
    { name: '蛤蜊蒸蛋', cal: 90, carb: 3, protein: 9, fat: 4, tags: ['海鲜'] },
    { name: '清蒸黄花鱼', cal: 95, carb: 0, protein: 18, fat: 3, tags: ['海鲜'] },
    { name: '椒盐虾', cal: 120, carb: 2, protein: 18, fat: 5, tags: ['海鲜'] },
    { name: '韭菜炒蛋', cal: 130, carb: 4, protein: 8, fat: 9, tags: ['素菜'] },
    { name: '西葫芦炒肉', cal: 170, carb: 5, protein: 14, fat: 11, tags: ['荤菜'] },
    { name: '芹菜炒香干', cal: 140, carb: 6, protein: 9, fat: 9, tags: ['素菜'] },
    { name: '凉拌苦瓜', cal: 40, carb: 4, protein: 2, fat: 1, tags: ['凉菜'] },
    { name: '凉拌番茄', cal: 35, carb: 6, protein: 1, fat: 0, tags: ['凉菜'] },
    { name: '洋葱炒蛋', cal: 140, carb: 6, protein: 7, fat: 9, tags: ['素菜'] },
    { name: '蒜苔炒肉', cal: 180, carb: 7, protein: 15, fat: 11, tags: ['荤菜'] },
    { name: '烤芦笋培根', cal: 210, carb: 3, protein: 10, fat: 18, tags: ['荤菜'] },
    { name: '牛油果沙拉', cal: 200, carb: 8, protein: 3, fat: 19, tags: ['沙拉'] },
    { name: '芝士蛋卷', cal: 250, carb: 3, protein: 16, fat: 20, tags: ['早餐'] },
    { name: '防弹咖啡', cal: 190, carb: 0, protein: 0.3, fat: 21.6, tags: ['早餐', '饮品'] },
    { name: '希腊酸奶杯', cal: 120, carb: 6, protein: 12, fat: 4, tags: ['早餐'] },
    { name: '椰奶咖喱鸡', cal: 230, carb: 6, protein: 20, fat: 15, tags: ['荤菜'] }
  ];

  var LOWCARB_NEW = [
    { name: '红烧带鱼', cal: 200, carb: 3, protein: 18, fat: 12, tags: ['海鲜'] },
    { name: '宫保虾球', cal: 170, carb: 6, protein: 18, fat: 9, tags: ['海鲜'] },
    { name: '番茄牛腩', cal: 210, carb: 7, protein: 18, fat: 13, tags: ['荤菜'] },
    { name: '凉拌秋葵', cal: 50, carb: 7, protein: 2, fat: 0.5, tags: ['凉菜'] },
    { name: '蒜蓉金针菇', cal: 70, carb: 6, protein: 3.5, fat: 4, tags: ['素菜'] },
    { name: '蚝油生菜', cal: 55, carb: 4, protein: 1.5, fat: 4, tags: ['素菜'] },
    { name: '西兰花炒虾仁', cal: 110, carb: 4, protein: 17, fat: 3, tags: ['海鲜'] },
    { name: '泰式青木瓜沙拉', cal: 60, carb: 10, protein: 2, fat: 2, tags: ['沙拉'] },
    { name: '冬阴功汤', cal: 80, carb: 6, protein: 10, fat: 3, tags: ['汤品'] }
  ];

  var NORMAL_NEW = [
    { name: '杂粮饭', cal: 130, carb: 26, protein: 4, fat: 1, tags: ['主食'] },
    { name: '蒸蛋羹', cal: 90, carb: 2, protein: 8, fat: 5, tags: ['素菜'] },
    { name: '牛肉粉丝', cal: 200, carb: 20, protein: 14, fat: 6, tags: ['荤菜'] },
    { name: '罗宋汤', cal: 90, carb: 9, protein: 6, fat: 4, tags: ['汤品'] },
    { name: '牛肉河粉', cal: 220, carb: 30, protein: 12, fat: 5, tags: ['主食'] },
    { name: '香菇滑鸡', cal: 180, carb: 4, protein: 20, fat: 9, tags: ['荤菜'] },
    { name: '海带豆腐汤', cal: 70, carb: 4, protein: 5, fat: 3, tags: ['汤品'] },
    { name: '照烧鸡腿', cal: 230, carb: 10, protein: 18, fat: 12, tags: ['荤菜'] }
  ];

  // 追加到各模式（keto 菜同样兼容 lowcarb / normal）
  if (DISH_DB.keto) DISH_DB.keto = DISH_DB.keto.concat(KETO_NEW);
  if (DISH_DB.lowcarb) DISH_DB.lowcarb = DISH_DB.lowcarb.concat(KETO_NEW, LOWCARB_NEW);
  if (DISH_DB.normal) DISH_DB.normal = DISH_DB.normal.concat(KETO_NEW, LOWCARB_NEW, NORMAL_NEW);

  // ===== 新增菜品详情（食材 + 步骤 + 提示）=====
  var NEW_DETAIL = {
    '牛油果鸡蛋沙拉': {
      ingredients: [{ name: '牛油果', weight: 120, unit: 'g' }, { name: '鸡蛋', weight: 2, unit: '个' }, { name: '橄榄油', weight: 10, unit: 'ml' }, { name: '柠檬', weight: 10, unit: 'g' }, { name: '盐', weight: 2, unit: 'g' }],
      steps: ['鸡蛋煮熟切瓣；牛油果去核取肉切丁', '加橄榄油、柠檬汁、盐拌匀', '撒黑胡椒即可'],
      tips: '牛油果高脂低糖，生酮明星早餐。柠檬汁防氧化变黑'
    },
    '凯撒沙拉': {
      ingredients: [{ name: '生菜', weight: 200, unit: 'g' }, { name: '芝士', weight: 20, unit: 'g' }, { name: '橄榄油', weight: 12, unit: 'ml' }, { name: '柠檬', weight: 8, unit: 'g' }, { name: '黑胡椒', weight: 1, unit: 'g' }],
      steps: ['生菜撕小片洗净沥干', '调橄榄油柠檬汁黑胡椒汁', '淋汁撒芝士碎拌匀'],
      tips: '传统凯撒含面包丁，生酮版去掉。芝士提供脂肪与咸香'
    },
    '烟熏三文鱼': {
      ingredients: [{ name: '三文鱼', weight: 150, unit: 'g' }, { name: '柠檬', weight: 15, unit: 'g' }, { name: '黑胡椒', weight: 1, unit: 'g' }, { name: '盐', weight: 2, unit: 'g' }],
      steps: ['三文鱼用盐黑胡椒腌十分钟', '冷熏或平底少油煎至两面微焦', '挤柠檬汁即可'],
      tips: '烟熏三文鱼富含奥米伽三，纯生酮友好'
    },
    '芝士焗西兰花': {
      ingredients: [{ name: '西兰花', weight: 300, unit: 'g' }, { name: '芝士', weight: 40, unit: 'g' }, { name: '奶油', weight: 15, unit: 'ml' }, { name: '盐', weight: 2, unit: 'g' }],
      steps: ['西兰花焯水铺盘', '淋奶油撒芝士碎', '烤箱二百度烤十分钟至金黄'],
      tips: '芝士+奶油补优质脂肪，孩子也爱吃'
    },
    '奶油蘑菇汤': {
      ingredients: [{ name: '口蘑', weight: 250, unit: 'g' }, { name: '奶油', weight: 30, unit: 'ml' }, { name: '黄油', weight: 10, unit: 'g' }, { name: '蒜', weight: 8, unit: 'g' }, { name: '盐', weight: 2, unit: 'g' }],
      steps: ['蘑菇切片炒香加水煮软打碎', '回锅加奶油黄油煮至浓稠', '加盐调味'],
      tips: '无面粉勾芡的低碳版本，奶香浓郁'
    },
    '烤秋刀鱼': {
      ingredients: [{ name: '秋刀鱼', weight: 300, unit: 'g' }, { name: '柠檬', weight: 15, unit: 'g' }, { name: '盐', weight: 3, unit: 'g' }, { name: '橄榄油', weight: 8, unit: 'ml' }],
      steps: ['秋刀鱼去内脏擦干抹盐', '烤箱二百二十度烤十二分钟', '挤柠檬汁去腥'],
      tips: '深海小鱼骨软可食，补钙又补脂肪'
    },
    '白切鸡': {
      ingredients: [{ name: '鸡肉', weight: 500, unit: 'g' }, { name: '生姜', weight: 15, unit: 'g' }, { name: '葱', weight: 15, unit: 'g' }, { name: '生抽', weight: 20, unit: 'ml' }],
      steps: ['整鸡冷水下锅加姜葱煮十五分钟焖十分钟', '捞出过冰水斩件', '蘸姜葱生抽汁'],
      tips: '纯肉零碳水，皮可去以减少脂肪'
    },
    '酱牛肉': {
      ingredients: [{ name: '牛腩', weight: 400, unit: 'g' }, { name: '生抽', weight: 30, unit: 'ml' }, { name: '八角', weight: 2, unit: '个' }, { name: '桂皮', weight: 1, unit: '小块' }, { name: '生姜', weight: 10, unit: 'g' }],
      steps: ['牛肉冷水焯水', '加生抽香料姜加水卤四十分钟', '晾凉切片'],
      tips: '一次卤多做几餐，优质蛋白加脂肪'
    },
    '凉拌鸡丝': {
      ingredients: [{ name: '鸡胸肉', weight: 250, unit: 'g' }, { name: '黄瓜', weight: 100, unit: 'g' }, { name: '醋', weight: 10, unit: 'ml' }, { name: '生抽', weight: 12, unit: 'ml' }, { name: '香油', weight: 5, unit: 'ml' }],
      steps: ['鸡胸煮熟撕丝；黄瓜切丝', '加生抽醋香油拌匀', '冷藏更爽口'],
      tips: '高蛋白低脂凉菜，夏季开胃'
    },
    '蛤蜊蒸蛋': {
      ingredients: [{ name: '蛤蜊', weight: 200, unit: 'g' }, { name: '鸡蛋', weight: 3, unit: '个' }, { name: '盐', weight: 2, unit: 'g' }, { name: '葱', weight: 8, unit: 'g' }],
      steps: ['蛤蜊吐沙焯开口；鸡蛋打散加温水', '蛋液入碗放蛤蜊蒸八分钟', '撒葱花'],
      tips: '海鲜+蛋双蛋白，嫩滑鲜甜'
    },
    '清蒸黄花鱼': {
      ingredients: [{ name: '黄花鱼', weight: 400, unit: 'g' }, { name: '生姜', weight: 15, unit: 'g' }, { name: '葱', weight: 15, unit: 'g' }, { name: '生抽', weight: 18, unit: 'ml' }, { name: '料酒', weight: 8, unit: 'ml' }],
      steps: ['黄花鱼处理干净划刀腌十分钟', '水开蒸八分钟倒掉蒸鱼水', '铺葱姜淋热油与生抽'],
      tips: '刺少肉嫩，纯生酮友好海鱼'
    },
    '椒盐虾': {
      ingredients: [{ name: '基围虾', weight: 400, unit: 'g' }, { name: '椒盐粉', weight: 5, unit: 'g' }, { name: '蒜', weight: 12, unit: 'g' }, { name: '橄榄油', weight: 12, unit: 'ml' }],
      steps: ['虾开背去线；蒜剁末', '热油煎虾至红，下蒜末', '撒椒盐粉翻匀'],
      tips: '椒盐粉少量不影响生酮，虾高蛋白低脂'
    },
    '韭菜炒蛋': {
      ingredients: [{ name: '韭菜', weight: 150, unit: 'g' }, { name: '鸡蛋', weight: 3, unit: '个' }, { name: '盐', weight: 2, unit: 'g' }, { name: '橄榄油', weight: 12, unit: 'ml' }],
      steps: ['韭菜切段；鸡蛋打散炒熟盛出', '底油下韭菜快炒', '倒回鸡蛋加盐翻匀'],
      tips: '韭菜含天然硫化物，配蛋香嫩'
    },
    '西葫芦炒肉': {
      ingredients: [{ name: '西葫芦', weight: 250, unit: 'g' }, { name: '猪里脊', weight: 200, unit: 'g' }, { name: '生抽', weight: 12, unit: 'ml' }, { name: '蒜', weight: 8, unit: 'g' }, { name: '橄榄油', weight: 12, unit: 'ml' }],
      steps: ['西葫芦切丝；肉切丝腌十分钟', '热油下肉丝滑炒变色', '下西葫芦蒜翻炒加生抽'],
      tips: '西葫芦碳水极低，替代土豆丝的好选择'
    },
    '芹菜炒香干': {
      ingredients: [{ name: '芹菜', weight: 200, unit: 'g' }, { name: '香干', weight: 150, unit: 'g' }, { name: '生抽', weight: 10, unit: 'ml' }, { name: '蒜', weight: 8, unit: 'g' }, { name: '橄榄油', weight: 12, unit: 'ml' }],
      steps: ['芹菜切段焯水；香干切条', '热油下蒜与香干煸炒', '下芹菜加生抽翻炒'],
      tips: '芹菜膳食纤维丰富，香干补植物蛋白'
    },
    '凉拌苦瓜': {
      ingredients: [{ name: '苦瓜', weight: 250, unit: 'g' }, { name: '蒜', weight: 12, unit: 'g' }, { name: '生抽', weight: 12, unit: 'ml' }, { name: '醋', weight: 8, unit: 'ml' }, { name: '香油', weight: 5, unit: 'ml' }],
      steps: ['苦瓜切薄片盐腌十分钟挤水', '加蒜末生抽醋香油拌匀', '冷藏更爽脆'],
      tips: '苦瓜清热，零碳水凉菜'
    },
    '凉拌番茄': {
      ingredients: [{ name: '番茄', weight: 300, unit: 'g' }, { name: '橄榄油', weight: 8, unit: 'ml' }, { name: '盐', weight: 1, unit: 'g' }],
      steps: ['番茄切片', '淋少许橄榄油与盐', '拌匀即可'],
      tips: '番茄天然糖少量，配橄榄油助吸收番茄红素'
    },
    '洋葱炒蛋': {
      ingredients: [{ name: '洋葱', weight: 150, unit: 'g' }, { name: '鸡蛋', weight: 3, unit: '个' }, { name: '盐', weight: 2, unit: 'g' }, { name: '橄榄油', weight: 12, unit: 'ml' }],
      steps: ['洋葱切丝；鸡蛋打散炒熟盛出', '底油下洋葱炒软', '倒回鸡蛋加盐'],
      tips: '洋葱炒软后清甜，低碳水配菜'
    },
    '蒜苔炒肉': {
      ingredients: [{ name: '蒜苔', weight: 200, unit: 'g' }, { name: '猪里脊', weight: 200, unit: 'g' }, { name: '生抽', weight: 12, unit: 'ml' }, { name: '蒜', weight: 8, unit: 'g' }, { name: '橄榄油', weight: 12, unit: 'ml' }],
      steps: ['蒜苔切段焯水；肉切丝腌十分钟', '热油下肉丝滑炒变色', '下蒜苔蒜翻炒加生抽'],
      tips: '蒜苔爽脆，肉丝不裹粉直接炒'
    },
    '烤芦笋培根': {
      ingredients: [{ name: '芦笋', weight: 250, unit: 'g' }, { name: '培根', weight: 100, unit: 'g' }, { name: '黑胡椒', weight: 1, unit: 'g' }, { name: '橄榄油', weight: 8, unit: 'ml' }],
      steps: ['芦笋去老根；培根片卷芦笋', '刷橄榄油撒黑胡椒', '烤箱二百度烤十五分钟'],
      tips: '培根脂肪包裹芦笋，咸香生酮小食'
    },
    '牛油果沙拉': {
      ingredients: [{ name: '牛油果', weight: 150, unit: 'g' }, { name: '生菜', weight: 100, unit: 'g' }, { name: '橄榄油', weight: 10, unit: 'ml' }, { name: '柠檬', weight: 10, unit: 'g' }, { name: '盐', weight: 2, unit: 'g' }],
      steps: ['牛油果切块；生菜撕片', '调橄榄油柠檬汁盐', '拌匀'],
      tips: '纯脂肪沙拉，生酮经典'
    },
    '芝士蛋卷': {
      ingredients: [{ name: '鸡蛋', weight: 3, unit: '个' }, { name: '芝士', weight: 30, unit: 'g' }, { name: '黄油', weight: 8, unit: 'g' }, { name: '盐', weight: 1, unit: 'g' }],
      steps: ['鸡蛋打散加芝士碎', '黄油小火摊成蛋饼', '对折出锅撒盐'],
      tips: '高蛋白高脂早餐，五分钟搞定'
    },
    '防弹咖啡': {
      ingredients: [{ name: '黑咖啡', weight: 240, unit: 'ml' }, { name: '黄油', weight: 14, unit: 'g' }, { name: 'MCT油', weight: 14, unit: 'ml' }],
      steps: ['冲一杯黑咖啡', '加黄油与 MCT 油', '用打蛋器或搅拌打成奶泡状'],
      tips: '生酮断食期代餐饮品，提供持久饱腹脂肪'
    },
    '希腊酸奶杯': {
      ingredients: [{ name: '希腊酸奶(无糖)', weight: 200, unit: 'g' }, { name: '蓝莓', weight: 30, unit: 'g' }, { name: '奇亚籽', weight: 8, unit: 'g' }, { name: '核桃', weight: 15, unit: 'g' }],
      steps: ['酸奶打底', '撒蓝莓、奇亚籽、核桃碎', '冷藏十分钟更入味'],
      tips: '无糖原味酸奶+坚果，控量食用'
    },
    '椰奶咖喱鸡': {
      ingredients: [{ name: '鸡腿肉', weight: 300, unit: 'g' }, { name: '椰奶', weight: 100, unit: 'ml' }, { name: '咖喱粉', weight: 8, unit: 'g' }, { name: '橄榄油', weight: 12, unit: 'ml' }],
      steps: ['鸡腿肉切块煎香', '加咖喱粉炒出香味', '倒椰奶小火焖十分钟'],
      tips: '用椰奶替代奶油，东南亚风味零糖版'
    },
    '红烧带鱼': {
      ingredients: [{ name: '带鱼', weight: 400, unit: 'g' }, { name: '生抽', weight: 20, unit: 'ml' }, { name: '醋', weight: 10, unit: 'ml' }, { name: '生姜', weight: 10, unit: 'g' }, { name: '橄榄油', weight: 12, unit: 'ml' }],
      steps: ['带鱼切段擦干煎至两面金黄', '加生抽醋姜与少量水', '中小火焖八分钟收汁'],
      tips: '带鱼富含不饱和脂肪，生酮友好海鱼'
    },
    '宫保虾球': {
      ingredients: [{ name: '虾仁', weight: 300, unit: 'g' }, { name: '干辣椒', weight: 10, unit: 'g' }, { name: '花椒', weight: 2, unit: 'g' }, { name: '醋', weight: 5, unit: 'ml' }, { name: '橄榄油', weight: 12, unit: 'ml' }],
      steps: ['虾仁开背去线', '热油下干辣椒花椒爆香', '下虾仁快炒烹醋出锅'],
      tips: '虾球高蛋白低脂，辣香开胃'
    },
    '番茄牛腩': {
      ingredients: [{ name: '牛腩', weight: 350, unit: 'g' }, { name: '番茄', weight: 250, unit: 'g' }, { name: '生抽', weight: 15, unit: 'ml' }, { name: '生姜', weight: 10, unit: 'g' }, { name: '橄榄油', weight: 12, unit: 'ml' }],
      steps: ['牛腩焯水切块炖四十分钟', '番茄炒出汁加牛腩同炖二十分钟', '加盐收汁'],
      tips: '番茄天然酸甜替代糖，牛腩补铁'
    },
    '凉拌秋葵': {
      ingredients: [{ name: '秋葵', weight: 250, unit: 'g' }, { name: '生抽', weight: 12, unit: 'ml' }, { name: '醋', weight: 6, unit: 'ml' }, { name: '蒜', weight: 10, unit: 'g' }],
      steps: ['秋葵整根焯水一分钟捞出过凉', '切段摆盘', '淋生抽醋蒜汁'],
      tips: '秋葵黏液护胃，零碳水凉菜'
    },
    '蒜蓉金针菇': {
      ingredients: [{ name: '金针菇', weight: 300, unit: 'g' }, { name: '大蒜', weight: 20, unit: 'g' }, { name: '生抽', weight: 10, unit: 'ml' }, { name: '橄榄油', weight: 10, unit: 'ml' }],
      steps: ['金针菇去根洗净铺盘', '蒜末炒香加生抽淋上', '蒸六分钟'],
      tips: '菌菇低卡高纤维，蒜香入味'
    },
    '蚝油生菜': {
      ingredients: [{ name: '生菜', weight: 300, unit: 'g' }, { name: '蚝油', weight: 12, unit: 'ml' }, { name: '蒜', weight: 10, unit: 'g' }, { name: '橄榄油', weight: 10, unit: 'ml' }],
      steps: ['生菜焯水十秒捞出沥干', '蒜末炒香加蚝油调汁', '淋生菜上'],
      tips: '焯水保翠绿，蚝油控量'
    },
    '西兰花炒虾仁': {
      ingredients: [{ name: '西兰花', weight: 200, unit: 'g' }, { name: '虾仁', weight: 200, unit: 'g' }, { name: '蒜', weight: 10, unit: 'g' }, { name: '橄榄油', weight: 12, unit: 'ml' }, { name: '盐', weight: 2, unit: 'g' }],
      steps: ['西兰花焯水；虾仁开背', '热油下蒜与虾仁炒变色', '下西兰花加盐快炒'],
      tips: '双白高蛋白，生酮友好'
    },
    '泰式青木瓜沙拉': {
      ingredients: [{ name: '青木瓜', weight: 250, unit: 'g' }, { name: '柠檬', weight: 15, unit: 'g' }, { name: '鱼露', weight: 8, unit: 'ml' }, { name: '花生', weight: 10, unit: 'g' }, { name: '辣椒', weight: 3, unit: 'g' }],
      steps: ['青木瓜切丝；花生碾碎', '调柠檬汁鱼露辣椒', '拌匀撒花生'],
      tips: '东南亚经典，花生过敏请去掉'
    },
    '冬阴功汤': {
      ingredients: [{ name: '虾仁', weight: 200, unit: 'g' }, { name: '香菇', weight: 100, unit: 'g' }, { name: '椰奶', weight: 80, unit: 'ml' }, { name: '柠檬', weight: 12, unit: 'g' }, { name: '辣椒', weight: 3, unit: 'g' }],
      steps: ['香菇虾仁加水煮开', '加椰奶柠檬辣椒', '煮三分钟出锅'],
      tips: '酸辣开胃，椰奶替代高糖酱料'
    },
    '杂粮饭': {
      ingredients: [{ name: '糙米饭', weight: 150, unit: 'g' }, { name: '藜麦', weight: 50, unit: 'g' }],
      steps: ['糙米藜麦按比例同煮', '正常模式适量食用', '作主食搭配蛋白菜'],
      tips: '正常模式主食，生酮/低碳模式建议换花菜米'
    },
    '蒸蛋羹': {
      ingredients: [{ name: '鸡蛋', weight: 3, unit: '个' }, { name: '盐', weight: 2, unit: 'g' }, { name: '葱', weight: 8, unit: 'g' }],
      steps: ['鸡蛋打散加温水一倍', '过滤去泡蒸八分钟', '撒葱花'],
      tips: '嫩滑高蛋白，老少皆宜'
    },
    '牛肉粉丝': {
      ingredients: [{ name: '牛肉', weight: 200, unit: 'g' }, { name: '粉丝', weight: 50, unit: 'g' }, { name: '生抽', weight: 12, unit: 'ml' }, { name: '葱', weight: 10, unit: 'g' }, { name: '橄榄油', weight: 10, unit: 'ml' }],
      steps: ['牛肉切片炒香；粉丝泡软', '加水煮开下粉丝', '加生抽葱调味'],
      tips: '粉丝碳水偏高，正常模式适量'
    },
    '罗宋汤': {
      ingredients: [{ name: '牛肉', weight: 200, unit: 'g' }, { name: '番茄', weight: 200, unit: 'g' }, { name: '洋葱', weight: 100, unit: 'g' }, { name: '圆白菜', weight: 100, unit: 'g' }, { name: '橄榄油', weight: 10, unit: 'ml' }],
      steps: ['牛肉炖烂；番茄洋葱炒出汁', '加圆白菜与牛肉汤同煮', '加盐调味'],
      tips: '蔬菜丰富暖身汤，正常模式友好'
    },
    '牛肉河粉': {
      ingredients: [{ name: '牛肉', weight: 200, unit: 'g' }, { name: '河粉', weight: 150, unit: 'g' }, { name: '豆芽', weight: 80, unit: 'g' }, { name: '生抽', weight: 12, unit: 'ml' }],
      steps: ['河粉煮熟；牛肉快炒', '加豆芽与河粉同炒', '淋生抽出锅'],
      tips: '河粉碳水高，正常模式主食'
    },
    '香菇滑鸡': {
      ingredients: [{ name: '鸡腿肉', weight: 300, unit: 'g' }, { name: '香菇', weight: 100, unit: 'g' }, { name: '生抽', weight: 12, unit: 'ml' }, { name: '姜', weight: 8, unit: 'g' }, { name: '橄榄油', weight: 12, unit: 'ml' }],
      steps: ['鸡肉切块腌十分钟；香菇泡发', '热油下鸡肉煎香', '加香菇姜片生抽焖八分钟'],
      tips: '菌香入肉，低脂高蛋白'
    },
    '海带豆腐汤': {
      ingredients: [{ name: '海带丝', weight: 150, unit: 'g' }, { name: '嫩豆腐', weight: 200, unit: 'g' }, { name: '生姜', weight: 8, unit: 'g' }, { name: '盐', weight: 2, unit: 'g' }],
      steps: ['海带丝与姜煮开', '下豆腐块煮五分钟', '加盐调味'],
      tips: '补碘补钙暖胃汤，低卡'
    },
    '照烧鸡腿': {
      ingredients: [{ name: '鸡腿肉', weight: 300, unit: 'g' }, { name: '生抽', weight: 15, unit: 'ml' }, { name: '赤藓糖醇', weight: 8, unit: 'g' }, { name: '料酒', weight: 8, unit: 'ml' }, { name: '橄榄油', weight: 10, unit: 'ml' }],
      steps: ['鸡腿去皮煎至两面金黄', '调生抽赤藓糖醇料酒汁', '下锅收汁裹匀'],
      tips: '生酮版用赤藓糖醇代糖，去皮减脂'
    }
  };

  for (var dk in NEW_DETAIL) { if (NEW_DETAIL.hasOwnProperty(dk)) DISH_DETAIL[dk] = NEW_DETAIL[dk]; }

  // ===== 新增菜品别名（输入别名也能命中）=====
  var NEW_ALIASES = {
    '牛油果沙拉': '牛油果沙拉', '凯撒沙拉': '凯撒沙拉', '烟熏三文鱼': '烟熏三文鱼',
    '芝士焗西兰花': '芝士焗西兰花', '奶油蘑菇汤': '奶油蘑菇汤', '烤秋刀鱼': '烤秋刀鱼',
    '白切鸡肉': '白切鸡', '酱牛肉片': '酱牛肉', '凉拌鸡丝': '凉拌鸡丝',
    '蛤蜊蒸蛋': '蛤蜊蒸蛋', '清蒸黄花鱼': '清蒸黄花鱼', '椒盐虾': '椒盐虾',
    '韭菜炒鸡蛋': '韭菜炒蛋', '西葫芦炒肉': '西葫芦炒肉', '芹菜炒香干': '芹菜炒香干',
    '凉拌苦瓜': '凉拌苦瓜', '凉拌番茄': '凉拌番茄', '洋葱炒鸡蛋': '洋葱炒蛋',
    '蒜苔炒肉': '蒜苔炒肉', '烤芦笋培根': '烤芦笋培根', '牛油果鸡蛋沙拉': '牛油果鸡蛋沙拉',
    '芝士蛋卷': '芝士蛋卷', '防弹咖啡': '防弹咖啡', '希腊酸奶杯': '希腊酸奶杯',
    '椰奶咖喱鸡': '椰奶咖喱鸡', '红烧带鱼': '红烧带鱼', '宫保虾球': '宫保虾球',
    '番茄牛腩': '番茄牛腩', '凉拌秋葵': '凉拌秋葵', '蒜蓉金针菇': '蒜蓉金针菇',
    '蚝油生菜': '蚝油生菜', '西兰花炒虾仁': '西兰花炒虾仁', '泰式青木瓜沙拉': '泰式青木瓜沙拉',
    '冬阴功汤': '冬阴功汤', '杂粮饭': '杂粮饭', '蒸蛋羹': '蒸蛋羹',
    '牛肉粉丝': '牛肉粉丝', '罗宋汤': '罗宋汤', '牛肉河粉': '牛肉河粉',
    '香菇滑鸡': '香菇滑鸡', '海带豆腐汤': '海带豆腐汤', '照烧鸡腿': '照烧鸡腿'
  };
  for (var ak in NEW_ALIASES) { if (NEW_ALIASES.hasOwnProperty(ak)) FOOD_ALIASES[ak] = NEW_ALIASES[ak]; }

  // 暴露给 UI
  KetoCore.dishAllergens = dishAllergens;
  KetoCore.ALLERGEN_TYPES = ALLERGEN_TYPES;

  if (typeof module !== 'undefined' && module.exports) { module.exports = { dishAllergens: dishAllergens, ALLERGEN_TYPES: ALLERGEN_TYPES }; }
})(typeof window !== 'undefined' ? window : globalThis);
