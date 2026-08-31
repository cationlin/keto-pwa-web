// core-bridge.js — 封装 KetoCore 计算，UI 只调这里
(function (global) {
  'use strict';

  var KetoCore = (typeof window !== 'undefined' && window.KetoCore)
    ? window.KetoCore
    : (global.KetoCore || null);

  // 食物项 → core 所需字段（注意 core 要的是 calories 不是 cal）
  // FOOD_DB 值为每100g；有 unit(杯/个) 时按"份"计，无 unit 时按 100g 折算
  function calcItemMacros(name, amount) {
    if (!KetoCore) return null;
    var db = KetoCore.FOOD_DB;
    var entry = db[name];
    if (!entry) return null;
    var unit = entry.unit || 'g';
    var ratio = entry.unit ? amount : amount / 100;
    return {
      name: name,
      amount: amount,
      unit: unit,
      calories: Math.round(entry.cal * ratio * 10) / 10,
      carb: Math.round(entry.carb * ratio * 10) / 10,
      protein: Math.round(entry.protein * ratio * 10) / 10,
      fat: Math.round(entry.fat * ratio * 10) / 10
    };
  }

  function allDayFoods(mealsDate) {
    if (!mealsDate) return [];
    var arr = [];
    ['breakfast', 'lunch', 'dinner'].forEach(function (k) {
      if (mealsDate[k]) arr = arr.concat(mealsDate[k]);
    });
    return arr;
  }

  function dailyTotals(mealsDate, baseMetabolism) {
    var foods = allDayFoods(mealsDate).map(function (it) {
      return { calories: it.calories, carb: it.carb, protein: it.protein, fat: it.fat };
    });
    return KetoCore.calculateDailyTotal(foods, baseMetabolism || 0);
  }

  // 统一热量口径（P1 口径统一）：所有"缺口/预算"都基于 TDEE（含活动消耗），不再 BMR/TDEE 混用
  var DEFICIT = 300; // 温和热量缺口（kcal/天），成人/青少年共用基准
  function getTargets(settings) {
    var h = health(settings, settings.startWeight);
    var bmr = h.bmr;
    var af = settings.activityFactor || 1.55;
    var tdee = Math.round(bmr * af);
    var budget = Math.round(tdee - DEFICIT);
    return { bmr: bmr, tdee: tdee, deficit: DEFICIT, budget: budget };
  }
  function dayBalance(meals, settings) {
    var t = getTargets(settings);
    var tot = dailyTotals(meals, t.bmr);
    return {
      totalCal: tot.totalCal,
      carbG: tot.carbG, proteinG: tot.proteinG, fatG: tot.fatG,
      carbPercent: tot.carbPercent, proteinPercent: tot.proteinPercent, fatPercent: tot.fatPercent,
      bmr: t.bmr, tdee: t.tdee, budget: t.budget, deficit: t.deficit,
      balanceTdee: t.tdee - tot.totalCal,     // 盈余为正
      balanceBudget: t.budget - tot.totalCal  // 剩余为正（缺口为负）
    };
  }

  function health(settings, weight) {
    return KetoCore.calcHealth({
      gender: settings.gender,
      height: settings.height,
      birthYear: settings.birthYear,
      activityLevel: settings.activityLevel,
      weight: (weight != null) ? weight : (settings.startWeight || 70)
    });
  }

  function dinnerRec(opts) {
    return KetoCore.calcDinnerRecommendation(opts);
  }

  function dishDetail(name) { return KetoCore.getDishDetail(name); }
  function fuzzy(name) { return KetoCore.fuzzyMatchFood(name); }

  // 菜品 → 打卡食材条目：优先从 DISH_DETAIL.ingredients 累加整份营养，
  // 累加为 0（无食材数据）时回退 DISH_DB per100g × 默认 250g（一份近似）
  function dishToMealItem(name) {
    if (!KetoCore) return null;
    var detail = KetoCore.getDishDetail(name);
    var entry = null;
    var modes = ['keto', 'lowcarb', 'normal'];
    for (var mi = 0; mi < modes.length && !entry; mi++) {
      var list = KetoCore.DISH_DB[modes[mi]] || [];
      for (var di = 0; di < list.length; di++) { if (list[di].name === name) { entry = list[di]; break; } }
    }
    var cal = 0, carb = 0, protein = 0, fat = 0;
    if (detail && detail.ingredients) {
      detail.ingredients.forEach(function (ing) {
        var it = calcItemMacros(ing.name, ing.weight);
        if (it) { cal += it.calories; carb += it.carb; protein += it.protein; fat += it.fat; }
      });
    }
    if (cal === 0 && entry) {
      cal = entry.cal * 2.5; carb = entry.carb * 2.5; protein = entry.protein * 2.5; fat = entry.fat * 2.5;
    }
    return {
      name: name,
      amount: 1,
      unit: '份',
      calories: Math.round(cal),
      carb: Math.round(carb * 10) / 10,
      protein: Math.round(protein * 10) / 10,
      fat: Math.round(fat * 10) / 10
    };
  }

  var Bridge = {
    KetoCore: KetoCore,
    calcItemMacros: calcItemMacros,
    allDayFoods: allDayFoods,
    dailyTotals: dailyTotals,
    health: health,
    dinnerRec: dinnerRec,
    dishDetail: dishDetail,
    fuzzy: fuzzy,
    dishToMealItem: dishToMealItem,
    getTargets: getTargets,
    dayBalance: dayBalance,
    DEFICIT: DEFICIT
  };

  global.Bridge = Bridge;
  if (typeof module !== 'undefined' && module.exports) module.exports = Bridge;
})(typeof window !== 'undefined' ? window : globalThis);
