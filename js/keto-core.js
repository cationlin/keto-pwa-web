(function(global){
'use strict';
var FOOD_DB = {
  // ==== 生酮饮品 ====
  '防弹咖啡': { cal: 190, carb: 0, protein: 0.3, fat: 21.6, unit: '杯' },
  '黑咖啡': { cal: 2, carb: 0, protein: 0.3, fat: 0, unit: '杯' },
  '美式咖啡': { cal: 5, carb: 0.9, protein: 0.3, fat: 0, unit: '杯' },
  '拿铁(无糖)': { cal: 45, carb: 3.5, protein: 3, fat: 2, unit: '杯' },
  '绿茶': { cal: 1, carb: 0, protein: 0, fat: 0 },
  '红茶': { cal: 1, carb: 0, protein: 0, fat: 0 },
  '豆浆(无糖)': { cal: 31, carb: 1.2, protein: 3, fat: 1.6, unit: '杯' },
  '全脂牛奶': { cal: 65, carb: 4.8, protein: 3.3, fat: 3.5, unit: '杯' },

  // ==== 油脂 ====
  '黄油': { cal: 717, carb: 0, protein: 0.8, fat: 81, unit: '块' },
  '草饲黄油': { cal: 717, carb: 0, protein: 0.8, fat: 81, unit: '块' },
  'MCT油': { cal: 862, carb: 0, protein: 0, fat: 100, unit: '勺' },
  '橄榄油': { cal: 884, carb: 0, protein: 0, fat: 100, unit: '勺' },
  '椰子油': { cal: 862, carb: 0, protein: 0, fat: 100, unit: '勺' },
  '猪油': { cal: 902, carb: 0, protein: 0, fat: 100, unit: '勺' },
  '花生油': { cal: 899, carb: 0, protein: 0, fat: 100, unit: '勺' },

  // ==== 蛋奶 ====
  '水煮蛋': { cal: 75, carb: 0.5, protein: 6.5, fat: 5, unit: '个' },
  '煎蛋': { cal: 180, carb: 1.1, protein: 13, fat: 14, unit: '个' },
  '炒蛋': { cal: 200, carb: 1.5, protein: 13, fat: 16, unit: '份' },
  '茶叶蛋': { cal: 140, carb: 1, protein: 12, fat: 10, unit: '个' },
  '咸鸭蛋': { cal: 190, carb: 1.5, protein: 12, fat: 14, unit: '个' },
  '芝士': { cal: 350, carb: 1.3, protein: 25, fat: 27, unit: '片' },
  '奶油': { cal: 340, carb: 2.8, protein: 2.1, fat: 36, unit: '勺' },
  '希腊酸奶(无糖)': { cal: 59, carb: 3.6, protein: 10, fat: 0.4, unit: '杯' },
  '全脂牛奶': { cal: 65, carb: 4.8, protein: 3.3, fat: 3.5, unit: '杯' },

  // ==== 肉类 ====
  '培根': { cal: 541, carb: 1.4, protein: 12, fat: 53, unit: '片' },
  '五花肉': { cal: 508, carb: 0, protein: 9.3, fat: 50, unit: '块' },
  '排骨': { cal: 264, carb: 0, protein: 18, fat: 21, unit: '块' },
  '红烧肉': { cal: 450, carb: 5, protein: 15, fat: 40, unit: '块' },
  '糖醋排骨': { cal: 380, carb: 20, protein: 15, fat: 25, unit: '块' },
  '牛肉': { cal: 250, carb: 0, protein: 26, fat: 15, unit: '块' },
  '牛排': { cal: 271, carb: 0, protein: 26, fat: 19, unit: '块' },
  '牛腩': { cal: 330, carb: 0, protein: 20, fat: 28, unit: '块' },
  '牛肉卷': { cal: 250, carb: 0, protein: 26, fat: 15, unit: '份' },
  '猪肉': { cal: 242, carb: 0, protein: 17, fat: 19, unit: '块' },
  '里脊肉': { cal: 150, carb: 0, protein: 20, fat: 7, unit: '块' },
  '猪蹄': { cal: 260, carb: 0, protein: 23, fat: 18, unit: '个' },
  '猪肝': { cal: 135, carb: 2.8, protein: 19, fat: 4, unit: '块' },
  '鸡胸肉': { cal: 165, carb: 0, protein: 31, fat: 3.6, unit: '块' },
  '鸡腿肉': { cal: 200, carb: 0, protein: 25, fat: 11, unit: '块' },
  '鸡翅': { cal: 290, carb: 0, protein: 17, fat: 24, unit: '个' },
  '鸡肉': { cal: 167, carb: 0, protein: 20, fat: 9, unit: '块' },
  '火腿': { cal: 240, carb: 2, protein: 16, fat: 18, unit: '片' },
  '香肠': { cal: 320, carb: 3, protein: 12, fat: 28, unit: '根' },
  '午餐肉': { cal: 300, carb: 5, protein: 12, fat: 25, unit: '片' },
  '腊肉': { cal: 400, carb: 1, protein: 15, fat: 35, unit: '块' },

  // ==== 海鲜 ====
  '三文鱼': { cal: 208, carb: 0, protein: 20, fat: 13 },
  '金枪鱼': { cal: 132, carb: 0, protein: 28, fat: 1 },
  '鲈鱼': { cal: 105, carb: 0, protein: 18, fat: 3.4 },
  '鳕鱼': { cal: 82, carb: 0, protein: 18, fat: 0.7 },
  '带鱼': { cal: 127, carb: 0, protein: 17, fat: 5 },
  '黄花鱼': { cal: 105, carb: 0, protein: 18, fat: 3 },
  '虾仁': { cal: 85, carb: 0.2, protein: 18, fat: 1.2 },
  '螃蟹': { cal: 97, carb: 1.5, protein: 19, fat: 1.5 },
  '花蛤': { cal: 62, carb: 2.6, protein: 10.8, fat: 1.1 },
  '鱿鱼': { cal: 92, carb: 2, protein: 15, fat: 2 },
  '海参': { cal: 71, carb: 1, protein: 14, fat: 1 },

  // ==== 蔬菜 ====
  '西兰花': { cal: 34, carb: 7, protein: 2.8, fat: 0.4 },
  '花菜': { cal: 25, carb: 5, protein: 1.9, fat: 0.3 },
  '花菜米': { cal: 25, carb: 5, protein: 1.9, fat: 0.3 },
  '菠菜': { cal: 23, carb: 3.6, protein: 2.9, fat: 0.4 },
  '生菜': { cal: 13, carb: 2.1, protein: 1.3, fat: 0.3 },
  '油麦菜': { cal: 15, carb: 2.8, protein: 1.4, fat: 0.4 },
  '芹菜': { cal: 14, carb: 3, protein: 0.7, fat: 0.2 },
  '黄瓜': { cal: 15, carb: 3.6, protein: 0.7, fat: 0.1 },
  '西红柿': { cal: 18, carb: 3.9, protein: 0.9, fat: 0.2 },
  '番茄': { cal: 18, carb: 3.9, protein: 0.9, fat: 0.2 },
  '蘑菇': { cal: 22, carb: 3.3, protein: 3.1, fat: 0.3 },
  '金针菇': { cal: 32, carb: 6, protein: 2.7, fat: 0.4 },
  '木耳': { cal: 27, carb: 6, protein: 1.5, fat: 0.2 },
  '海带': { cal: 13, carb: 2.1, protein: 1.2, fat: 0.1 },
  '豆芽': { cal: 18, carb: 2.9, protein: 2.1, fat: 0.3 },
  '韭菜': { cal: 30, carb: 4.6, protein: 2.4, fat: 0.4 },
  '青椒': { cal: 22, carb: 4.6, protein: 1, fat: 0.2 },
  '茄子': { cal: 25, carb: 5.9, protein: 1, fat: 0.2 },
  '南瓜': { cal: 26, carb: 6.5, protein: 1, fat: 0.1 },
  '冬瓜': { cal: 12, carb: 2.6, protein: 0.4, fat: 0.2 },
  '白萝卜': { cal: 20, carb: 4.1, protein: 0.9, fat: 0.1 },
  '胡萝卜': { cal: 41, carb: 9.6, protein: 0.9, fat: 0.2 },
  '洋葱': { cal: 40, carb: 9.3, protein: 1.1, fat: 0.1 },
  '大蒜': { cal: 149, carb: 33, protein: 6.4, fat: 0.5 },
  '生姜': { cal: 80, carb: 17.8, protein: 1.8, fat: 0.8 },
  '葱': { cal: 33, carb: 6.5, protein: 1.9, fat: 0.3 },
  '香菜': { cal: 23, carb: 4, protein: 2.1, fat: 0.5 },

  // ==== 豆制品 ====
  '豆腐': { cal: 76, carb: 1.9, protein: 8, fat: 4.8 },
  '嫩豆腐': { cal: 56, carb: 2.5, protein: 5.5, fat: 2.7 },
  '老豆腐': { cal: 98, carb: 1.5, protein: 11, fat: 5 },
  '豆腐干': { cal: 140, carb: 3, protein: 13, fat: 7 },
  '腐竹': { cal: 461, carb: 22, protein: 44, fat: 21 },
  '豆浆(无糖)': { cal: 31, carb: 1.2, protein: 3, fat: 1.6 },

  // ==== 主食（非生酮高碳水，但需记录）====
  '白米饭': { cal: 116, carb: 25.9, protein: 2.6, fat: 0.3 },
  '糙米饭': { cal: 111, carb: 23, protein: 2.6, fat: 0.9 },
  '糯米饭': { cal: 165, carb: 34, protein: 3, fat: 1.2 },
  '小米粥': { cal: 46, carb: 9.2, protein: 1.4, fat: 0.5 },
  '燕麦': { cal: 389, carb: 66, protein: 16.9, fat: 6.9 },
  '全麦面包': { cal: 247, carb: 41, protein: 13, fat: 3.4 },
  '馒头': { cal: 221, carb: 47, protein: 7, fat: 1.1 },
  '面条': { cal: 137, carb: 28, protein: 4.5, fat: 0.5 },
  '挂面': { cal: 348, carb: 75, protein: 10, fat: 0.5 },
  '饺子': { cal: 220, carb: 28, protein: 8, fat: 9 },
  '红薯': { cal: 86, carb: 20.1, protein: 1.6, fat: 0.1 },
  '紫薯': { cal: 82, carb: 18, protein: 1.3, fat: 0.2 },
  '玉米': { cal: 86, carb: 19, protein: 3.2, fat: 1.2 },
  '糯玉米': { cal: 144, carb: 31, protein: 3.8, fat: 1.2 },
  '甜玉米': { cal: 86, carb: 19, protein: 3.2, fat: 1.2 },
  '土豆': { cal: 77, carb: 17.5, protein: 2, fat: 0.1 },
  '芋头': { cal: 56, carb: 12.7, protein: 1.3, fat: 0.2 },
  '山药': { cal: 57, carb: 12.4, protein: 1.9, fat: 0.2 },
  '莲藕': { cal: 47, carb: 11.5, protein: 1.2, fat: 0.2 },

  // ==== 低碳水替代主食 ====
  '魔芋面': { cal: 20, carb: 4, protein: 0, fat: 0 },
  '魔芋米': { cal: 15, carb: 3, protein: 0, fat: 0 },

  // ==== 水果（生酮需限量）====
  '牛油果': { cal: 160, carb: 8.5, protein: 2, fat: 15 },
  '蓝莓': { cal: 57, carb: 14, protein: 0.7, fat: 0.3 },
  '草莓': { cal: 32, carb: 7.7, protein: 0.7, fat: 0.3 },
  '柠檬': { cal: 29, carb: 9.3, protein: 1.1, fat: 0.3 },
  '柚子': { cal: 42, carb: 9.6, protein: 0.8, fat: 0.2 },
  '覆盆子': { cal: 52, carb: 12, protein: 1.2, fat: 0.7 },

  // ==== 坚果（生酮友好但需控量）====
  '坚果混合': { cal: 607, carb: 20, protein: 20, fat: 54 },
  '杏仁': { cal: 579, carb: 21.6, protein: 21.2, fat: 49.9 },
  '核桃': { cal: 654, carb: 14, protein: 15, fat: 65 },
  '腰果': { cal: 553, carb: 30, protein: 18, fat: 44 },
  '夏威夷果': { cal: 718, carb: 14, protein: 7.9, fat: 76 },
  '南瓜子': { cal: 574, carb: 14, protein: 30, fat: 47 },
  '葵花籽': { cal: 584, carb: 20, protein: 21, fat: 51 },
  '奇亚籽': { cal: 486, carb: 42, protein: 17, fat: 31 },
  '亚麻籽': { cal: 534, carb: 29, protein: 18, fat: 42 },
  '花生酱(无糖)': { cal: 588, carb: 17, protein: 25, fat: 50 },
  '芝麻酱': { cal: 630, carb: 22, protein: 19, fat: 54 },

  // ==== 零食/其他 ====
  '黑巧克力(85%)': { cal: 598, carb: 45, protein: 7.8, fat: 43 },
  '黑巧克力(90%)': { cal: 600, carb: 30, protein: 8, fat: 55 },
  '蛋白棒': { cal: 380, carb: 20, protein: 30, fat: 18 },
  '海苔': { cal: 270, carb: 30, protein: 30, fat: 8 },
  '牛肉干': { cal: 410, carb: 10, protein: 40, fat: 22 },
  '猪肉脯': { cal: 380, carb: 25, protein: 28, fat: 20 },

  // ==== 调味料 ====
  '盐': { cal: 0, carb: 0, protein: 0, fat: 0 },
  '酱油': { cal: 63, carb: 5, protein: 5.6, fat: 0 },
  '生抽': { cal: 63, carb: 5, protein: 5.6, fat: 0 },
  '老抽': { cal: 63, carb: 5, protein: 5.6, fat: 0 },
  '醋': { cal: 31, carb: 4.9, protein: 2.1, fat: 0 },
  '蚝油': { cal: 114, carb: 24, protein: 2.2, fat: 0.3 },
  '沙拉酱': { cal: 680, carb: 3, protein: 1, fat: 75 },
  '蛋黄酱': { cal: 680, carb: 0.6, protein: 1, fat: 75 },
  '番茄酱': { cal: 97, carb: 22, protein: 1.3, fat: 0.3 },
  '辣椒酱': { cal: 50, carb: 8, protein: 2, fat: 1 },
  '豆瓣酱': { cal: 170, carb: 20, protein: 10, fat: 5 },
  '甜面酱': { cal: 170, carb: 30, protein: 5, fat: 1 },

  // ==== 中餐菜品（每100g估算）====
  '番茄炒蛋': { cal: 120, carb: 5, protein: 6, fat: 9 },
  '麻婆豆腐': { cal: 130, carb: 5, protein: 8, fat: 9 },
  '宫保鸡丁': { cal: 180, carb: 8, protein: 12, fat: 12 },
  '酸菜鱼': { cal: 120, carb: 3, protein: 15, fat: 5 },
  '清蒸鱼': { cal: 100, carb: 0, protein: 18, fat: 3 },
  '炒青菜': { cal: 60, carb: 4, protein: 2, fat: 4 },
  '凉拌黄瓜': { cal: 40, carb: 3, protein: 1, fat: 3 },
  '白切鸡': { cal: 150, carb: 0, protein: 25, fat: 5 },
  '白灼虾': { cal: 85, carb: 0.2, protein: 18, fat: 1.2 },
  '蒸蛋': { cal: 80, carb: 1, protein: 6, fat: 6 },
  '蛋花汤': { cal: 35, carb: 1, protein: 2, fat: 2.5 },
  '紫菜蛋汤': { cal: 25, carb: 1.5, protein: 1.5, fat: 1.5 },
  '鸡汤': { cal: 40, carb: 0.5, protein: 5, fat: 2 },
  '骨头汤': { cal: 50, carb: 0.5, protein: 4, fat: 3.5 },

  // ==== 饮品类 ====
  '绿茶': { cal: 1, carb: 0.2, protein: 0.1, fat: 0 },
  '红茶': { cal: 1, carb: 0.2, protein: 0.1, fat: 0 },
  '乌龙茶': { cal: 1, carb: 0.2, protein: 0.1, fat: 0 },
  '普洱茶': { cal: 1, carb: 0.2, protein: 0.1, fat: 0 },
  '气泡水': { cal: 0, carb: 0, protein: 0, fat: 0 },
  '零度可乐': { cal: 0, carb: 0, protein: 0, fat: 0 },
  '矿泉水': { cal: 0, carb: 0, protein: 0, fat: 0 },
  '柠檬水': { cal: 5, carb: 1, protein: 0, fat: 0 },

  // ===== 家常菜（晚餐重点）=====
  // 荤菜
  '番茄炒蛋': { cal: 142, carb: 4.2, protein: 9.8, fat: 8.5 },
  '西红柿炒蛋': { cal: 142, carb: 4.2, protein: 9.8, fat: 8.5 },
  '青椒炒肉': { cal: 165, carb: 3.1, protein: 14, fat: 10 },
  '红烧肉': { cal: 450, carb: 5, protein: 15, fat: 40 },
  '回锅肉': { cal: 380, carb: 2, protein: 18, fat: 32 },
  '宫保鸡丁': { cal: 195, carb: 8, protein: 20, fat: 10 },
  '辣子鸡': { cal: 220, carb: 3, protein: 22, fat: 13 },
  '清蒸鲈鱼': { cal: 98, carb: 0, protein: 18, fat: 3 },
  '清蒸鱼': { cal: 95, carb: 0, protein: 17, fat: 3 },
  '水煮鱼': { cal: 135, carb: 2, protein: 18, fat: 6 },
  '炒牛肉': { cal: 195, carb: 1, protein: 22, fat: 11 },
  '葱爆牛肉': { cal: 210, carb: 1.5, protein: 20, fat: 13 },
  '红烧排骨': { cal: 280, carb: 3, protein: 16, fat: 22 },
  '糖醋里脊': { cal: 250, carb: 15, protein: 14, fat: 12 },
  '鱼香肉丝': { cal: 185, carb: 6, protein: 12, fat: 12 },
  '虾仁炒蛋': { cal: 155, carb: 2, protein: 16, fat: 9 },
  '清炒虾仁': { cal: 105, carb: 1, protein: 18, fat: 3 },
  '减脂沙拉': { cal: 85, carb: 3, protein: 8, fat: 5 },
  '鸡胸沙拉': { cal: 105, carb: 3.5, protein: 14, fat: 4 },

  // 豆制品
  '麻婆豆腐': { cal: 126, carb: 3.5, protein: 8, fat: 8 },
  '红烧豆腐': { cal: 115, carb: 4, protein: 7, fat: 7 },
  '炒香干': { cal: 175, carb: 3, protein: 12, fat: 12 },
  '凉拌豆腐丝': { cal: 95, carb: 2, protein: 8, fat: 6 },

  // 素菜
  '蒜蓉西兰花': { cal: 52, carb: 6, protein: 3.5, fat: 1.8 },
  '炒西兰花': { cal: 52, carb: 6, protein: 3.5, fat: 1.8 },
  '蒜蓉空心菜': { cal: 48, carb: 5, protein: 2.5, fat: 2 },
  '炒空心菜': { cal: 48, carb: 5, protein: 2.5, fat: 2 },
  '炒青菜': { cal: 45, carb: 3, protein: 2.5, fat: 2 },
  '凉拌黄瓜': { cal: 35, carb: 4, protein: 1.5, fat: 1.5 },
  '拍黄瓜': { cal: 32, carb: 3.5, protein: 1.2, fat: 1.2 },
  '炒四季豆': { cal: 88, carb: 8, protein: 4, fat: 4 },
  '干煸豆角': { cal: 120, carb: 10, protein: 4, fat: 7 },
  '炒芦笋': { cal: 58, carb: 4, protein: 3, fat: 3 },
  '清炒荷兰豆': { cal: 75, carb: 8, protein: 4, fat: 3 },
  '炒菠菜': { cal: 55, carb: 4, protein: 3.5, fat: 2.5 },
  '凉拌海带丝': { cal: 42, carb: 5, protein: 1.5, fat: 1.5 },
  '红烧茄子': { cal: 85, carb: 8, protein: 2, fat: 5 },
  '炒蘑菇': { cal: 65, carb: 4, protein: 3, fat: 4 },
  '炒金针菇': { cal: 70, carb: 5, protein: 3.5, fat: 4 },

  // 含淀粉（生酮不友好，录入供参考）
  '酸辣土豆丝': { cal: 108, carb: 18, protein: 2.5, fat: 3.5 },
  '炒饭': { cal: 180, carb: 25, protein: 6, fat: 6 },
  '蛋炒饭': { cal: 210, carb: 22, protein: 7, fat: 9 },
  '土豆烧肉': { cal: 195, carb: 12, protein: 10, fat: 12 },

  // 汤类
  '紫菜蛋花汤': { cal: 45, carb: 1.5, protein: 4, fat: 2.5 },
  '西红柿鸡蛋汤': { cal: 55, carb: 3, protein: 5, fat: 3 },
  '豆腐汤': { cal: 65, carb: 2, protein: 5, fat: 4 },
  '冬瓜排骨汤': { cal: 95, carb: 1.5, protein: 8, fat: 6 }
}

// 别名映射：输入的别名 -> 数据库中的正式名称
var FOOD_ALIASES = {
  '咖啡': '黑咖啡',
  '白饭': '白米饭',
  '米饭': '白米饭',
  '大米': '白米饭',
  '糙米': '糙米饭',
  '糯米': '糯米饭',
  '糯玉米': '糯玉米',
  '甜玉米': '甜玉米',
  '地瓜': '红薯',
  '番薯': '红薯',
  '马铃薯': '土豆',
  '洋芋': '土豆',
  '番茄': '西红柿',
  '花椰菜': '花菜',
  '高丽菜': '花菜',
  '包菜': '花菜',
  '生菜叶': '生菜',
  '青江菜': '油麦菜',
  '酸奶': '希腊酸奶(无糖)',
  '优格': '希腊酸奶(无糖)',
  '豆浆': '豆浆(无糖)',
  '豆奶': '豆浆(无糖)',
  '豆皮': '腐竹',
  '花生': '坚果混合',
  '花生仁': '坚果混合',
  '巧克力': '黑巧克力(85%)',
  '黑巧': '黑巧克力(85%)',
  '橄榄油': '橄榄油',
  '茶': '绿茶',
  '蛋': '水煮蛋',
  '鸡蛋': '水煮蛋',
  '鸡腿': '鸡腿肉',
  '鸡胸': '鸡胸肉',
  '牛排肉': '牛排',
  '牛腩肉': '牛腩',
  '牛肉片': '牛肉卷',
  '猪肉片': '猪肉',
  '猪肉丝': '猪肉',
  '猪排': '排骨',
  '猪手': '猪蹄',
  '猪脚': '猪蹄',
  '香肠片': '香肠',
  '午餐肉片': '午餐肉',
  '三文鱼片': '三文鱼',
  '金枪鱼罐': '金枪鱼',
  '虾仁肉': '虾仁',
  '虾': '虾仁',
  '花蛤肉': '花蛤',
  '蚬子': '花蛤',
  '木耳菜': '木耳',
  '金针菇菜': '金针菇',
  '蘑菇类': '蘑菇',
  '菇': '蘑菇',
  '菌菇': '蘑菇',
  '蒜': '大蒜',
  '姜': '生姜',
  '葱花': '葱',
  '香葱': '葱',
  '芫荽': '香菜',
  '豆腐块': '豆腐',
  '豆干': '豆腐干',
  '老豆腐块': '老豆腐',
  '嫩豆腐块': '嫩豆腐',
  '面包': '全麦面包',
  '土司': '全麦面包',
  '面条汤': '面条',
  '红薯块': '红薯',
  '紫薯块': '紫薯',
  '玉米粒': '玉米',
  '土豆泥': '土豆',
  '土豆块': '土豆',
  '芋头块': '芋头',
  '山药段': '山药',
  '莲藕片': '莲藕',
  '蓝莓果': '蓝莓',
  '草莓果': '草莓',
  '柠檬片': '柠檬',
  '柚子肉': '柚子',
  '杏仁果': '杏仁',
  '核桃仁': '核桃',
  '腰果仁': '腰果',
  '南瓜子仁': '南瓜子',
  '葵花籽仁': '葵花籽',
  '奇亚籽粉': '奇亚籽',
  '亚麻籽粉': '亚麻籽',
  '花生酱': '花生酱(无糖)',
  '芝麻酱': '芝麻酱',
  '海苔片': '海苔',
  '牛肉干条': '牛肉干',
  '猪肉脯片': '猪肉脯',
  '盐巴': '盐',
  '酱油汁': '酱油',
  '生抽汁': '生抽',
  '老抽汁': '老抽',
  '醋汁': '醋',
  '蚝油汁': '蚝油',
  '沙拉酱': '沙拉酱',
  '蛋黄酱': '蛋黄酱',
  '番茄酱': '番茄酱',
  '辣椒酱': '辣椒酱',
  '豆瓣酱': '豆瓣酱',
  '甜面酱': '甜面酱',
  '番茄蛋': '番茄炒蛋',
  '西红柿炒蛋': '番茄炒蛋',
  '豆腐脑': '麻婆豆腐',
  '宫保鸡': '宫保鸡丁',
  '酸菜鱼块': '酸菜鱼',
  '清蒸鲈鱼': '清蒸鱼',
  '清蒸黄花鱼': '清蒸鱼',
  '炒蔬菜': '炒青菜',
  '拌黄瓜': '凉拌黄瓜',
  '白斩鸡': '白切鸡',
  '白灼基围虾': '白灼虾',
  '水蒸蛋': '蒸蛋',
  '蛋汤': '蛋花汤',
  '紫菜汤': '紫菜蛋汤',
  '鸡汤面': '鸡汤',
  '骨头汤底': '骨头汤',
  // 新增菜品别名（v1.0.4）
  '西红柿炒蛋': '番茄炒蛋',
  '青椒肉丝': '青椒炒肉',
  '青椒肉片': '青椒炒肉',
  '回锅肉片': '回锅肉',
  '宫保鸡丁': '宫保鸡丁',
  '辣子鸡丁': '辣子鸡',
  '清蒸鱼': '清蒸鲈鱼',
  '蒸鲈鱼': '清蒸鲈鱼',
  '水煮鱼片': '水煮鱼',
  '炒牛柳': '炒牛肉',
  '葱爆牛柳': '葱爆牛肉',
  '红烧排骨': '红烧排骨',
  '糖醋里脊': '糖醋里脊',
  '鱼香肉丝': '鱼香肉丝',
  '虾仁滑蛋': '虾仁炒蛋',
  '清炒虾仁': '清炒虾仁',
  '减脂沙拉': '减脂沙拉',
  '鸡胸沙拉': '鸡胸沙拉',
  '蔬菜沙拉': '减脂沙拉',
  '麻婆豆腐': '麻婆豆腐',
  '红烧豆腐': '红烧豆腐',
  '炒香干': '炒香干',
  '凉拌豆腐丝': '凉拌豆腐丝',
  '蒜蓉西兰花': '蒜蓉西兰花',
  '炒西兰花': '炒西兰花',
  '蒜蓉空心菜': '蒜蓉空心菜',
  '炒空心菜': '炒空心菜',
  '炒青菜': '炒青菜',
  '凉拌黄瓜': '凉拌黄瓜',
  '拍黄瓜': '拍黄瓜',
  '炒四季豆': '炒四季豆',
  '干煸豆角': '干煸豆角',
  '炒芦笋': '炒芦笋',
  '清炒荷兰豆': '清炒荷兰豆',
  '炒菠菜': '炒菠菜',
  '凉拌海带丝': '凉拌海带丝',
  '红烧茄子': '红烧茄子',
  '炒蘑菇': '炒蘑菇',
  '炒金针菇': '炒金针菇',
  '酸辣土豆丝': '酸辣土豆丝',
  '炒饭': '炒饭',
  '蛋炒饭': '蛋炒饭',
  '土豆烧肉': '土豆烧肉',
  '紫菜蛋花汤': '紫菜蛋花汤',
  '西红柿鸡蛋汤': '西红柿鸡蛋汤',
  '豆腐汤': '豆腐汤',
  '冬瓜排骨': '冬瓜排骨汤'
}

// ===== 菜谱数据库（按饮食模式分类，专用于晚餐推荐）=====
// 每条数据为一盘菜（非食材），每100g的营养值
var DISH_DB = {
  // 生酮推荐（碳水 < 10g/100g，高脂肪）
  keto: [
    { name: '红烧肉', cal: 450, carb: 5, protein: 15, fat: 40, tags: ['荤菜'] },
    { name: '回锅肉', cal: 380, carb: 2, protein: 18, fat: 32, tags: ['荤菜'] },
    { name: '东坡肉', cal: 480, carb: 3, protein: 14, fat: 45, tags: ['荤菜'] },
    { name: '梅菜扣肉', cal: 420, carb: 6, protein: 16, fat: 35, tags: ['荤菜'] },
    { name: '蒜香排骨', cal: 350, carb: 4, protein: 18, fat: 28, tags: ['荤菜'] },
    { name: '糖醋小排', cal: 320, carb: 8, protein: 16, fat: 24, tags: ['荤菜'] },
    { name: '辣子鸡', cal: 220, carb: 3, protein: 22, fat: 13, tags: ['荤菜'] },
    { name: '椒盐鸡翅', cal: 280, carb: 2, protein: 20, fat: 20, tags: ['荤菜'] },
    { name: '干锅花菜', cal: 95, carb: 6, protein: 4, fat: 7, tags: ['素菜'] },
    { name: '干煸四季豆', cal: 110, carb: 8, protein: 4, fat: 7, tags: ['素菜'] },
    { name: '蒜蓉西兰花', cal: 52, carb: 6, protein: 3.5, fat: 1.8, tags: ['素菜'] },
    { name: '白灼菜心', cal: 42, carb: 4, protein: 2.5, fat: 1.5, tags: ['素菜'] },
    { name: '清蒸鲈鱼', cal: 98, carb: 0, protein: 18, fat: 3, tags: ['海鲜'] },
    { name: '清蒸鳕鱼', cal: 82, carb: 0, protein: 18, fat: 1, tags: ['海鲜'] },
    { name: '香煎三文鱼', cal: 250, carb: 0, protein: 20, fat: 18, tags: ['海鲜'] },
    { name: '蒜蓉粉丝蒸虾', cal: 120, carb: 8, protein: 16, fat: 3, tags: ['海鲜'] },
    { name: '虾仁炒蛋', cal: 155, carb: 2, protein: 16, fat: 9, tags: ['海鲜'] },
    { name: '麻婆豆腐', cal: 126, carb: 3.5, protein: 8, fat: 8, tags: ['豆制品'] },
    { name: '红烧豆腐', cal: 115, carb: 4, protein: 7, fat: 7, tags: ['豆制品'] },
    { name: '蛋花汤', cal: 55, carb: 1, protein: 5, fat: 3.5, tags: ['汤品'] },
    { name: '紫菜蛋花汤', cal: 45, carb: 1.5, protein: 4, fat: 2.5, tags: ['汤品'] },
    { name: '蘑菇蛋汤', cal: 62, carb: 2, protein: 5, fat: 4, tags: ['汤品'] }
  ],

  // 低碳推荐（碳水 < 20g/100g）
  lowcarb: [
    { name: '番茄炒蛋', cal: 142, carb: 4.2, protein: 9.8, fat: 8.5, tags: ['荤菜'] },
    { name: '青椒炒肉', cal: 165, carb: 3.1, protein: 14, fat: 10, tags: ['荤菜'] },
    { name: '宫保鸡丁', cal: 195, carb: 8, protein: 20, fat: 10, tags: ['荤菜'] },
    { name: '鱼香肉丝', cal: 185, carb: 6, protein: 12, fat: 12, tags: ['荤菜'] },
    { name: '木须肉', cal: 175, carb: 5, protein: 14, fat: 11, tags: ['荤菜'] },
    { name: '青椒肉丝', cal: 160, carb: 4, protein: 15, fat: 9, tags: ['荤菜'] },
    { name: '炒牛肉', cal: 195, carb: 1, protein: 22, fat: 11, tags: ['荤菜'] },
    { name: '葱爆牛肉', cal: 210, carb: 1.5, protein: 20, fat: 13, tags: ['荤菜'] },
    { name: '红烧排骨', cal: 280, carb: 3, protein: 16, fat: 22, tags: ['荤菜'] },
    { name: '清炒虾仁', cal: 105, carb: 1, protein: 18, fat: 3, tags: ['海鲜'] },
    { name: '白灼虾', cal: 85, carb: 0.5, protein: 18, fat: 1, tags: ['海鲜'] },
    { name: '口水鸡', cal: 190, carb: 2, protein: 24, fat: 9, tags: ['荤菜'] },
    { name: '拍黄瓜', cal: 32, carb: 3.5, protein: 1.2, fat: 1.2, tags: ['凉菜'] },
    { name: '凉拌木耳', cal: 45, carb: 8, protein: 1.5, fat: 1.5, tags: ['凉菜'] },
    { name: '凉拌海带丝', cal: 42, carb: 5, protein: 1.5, fat: 1.5, tags: ['凉菜'] },
    { name: '炒空心菜', cal: 48, carb: 5, protein: 2.5, fat: 2, tags: ['素菜'] },
    { name: '炒青菜', cal: 45, carb: 3, protein: 2.5, fat: 2, tags: ['素菜'] },
    { name: '炒菠菜', cal: 55, carb: 4, protein: 3.5, fat: 2.5, tags: ['素菜'] },
    { name: '炒芦笋', cal: 58, carb: 4, protein: 3, fat: 3, tags: ['素菜'] },
    { name: '炒蘑菇', cal: 65, carb: 4, protein: 3, fat: 4, tags: ['素菜'] },
    { name: '红烧茄子', cal: 85, carb: 8, protein: 2, fat: 5, tags: ['素菜'] },
    { name: '炒香干', cal: 175, carb: 3, protein: 12, fat: 12, tags: ['豆制品'] },
    { name: '凉拌豆腐丝', cal: 95, carb: 2, protein: 8, fat: 6, tags: ['豆制品'] },
    { name: '西红柿鸡蛋汤', cal: 55, carb: 3, protein: 5, fat: 3, tags: ['汤品'] },
    { name: '冬瓜排骨汤', cal: 95, carb: 1.5, protein: 8, fat: 6, tags: ['汤品'] }
  ],

  // 正常模式（无限制，含适量主食）
  normal: [
    { name: '糖醋里脊', cal: 250, carb: 15, protein: 14, fat: 12, tags: ['荤菜'] },
    { name: '土豆烧肉', cal: 195, carb: 12, protein: 10, fat: 12, tags: ['荤菜'] },
    { name: '酸辣土豆丝', cal: 108, carb: 18, protein: 2.5, fat: 3.5, tags: ['素菜'] },
    { name: '蛋炒饭', cal: 210, carb: 22, protein: 7, fat: 9, tags: ['主食'] },
    { name: '扬州炒饭', cal: 230, carb: 28, protein: 8, fat: 8, tags: ['主食'] },
    { name: '番茄炒蛋', cal: 142, carb: 4.2, protein: 9.8, fat: 8.5, tags: ['荤菜'] },
    { name: '宫保鸡丁', cal: 195, carb: 8, protein: 20, fat: 10, tags: ['荤菜'] },
    { name: '鱼香肉丝', cal: 185, carb: 6, protein: 12, fat: 12, tags: ['荤菜'] },
    { name: '红烧肉', cal: 450, carb: 5, protein: 15, fat: 40, tags: ['荤菜'] },
    { name: '回锅肉', cal: 380, carb: 2, protein: 18, fat: 32, tags: ['荤菜'] },
    { name: '辣子鸡', cal: 220, carb: 3, protein: 22, fat: 13, tags: ['荤菜'] },
    { name: '红烧排骨', cal: 280, carb: 3, protein: 16, fat: 22, tags: ['荤菜'] },
    { name: '炒牛肉', cal: 195, carb: 1, protein: 22, fat: 11, tags: ['荤菜'] },
    { name: '清蒸鲈鱼', cal: 98, carb: 0, protein: 18, fat: 3, tags: ['海鲜'] },
    { name: '蒜蓉粉丝蒸虾', cal: 120, carb: 8, protein: 16, fat: 3, tags: ['海鲜'] },
    { name: '虾仁炒蛋', cal: 155, carb: 2, protein: 16, fat: 9, tags: ['海鲜'] },
    { name: '干煸四季豆', cal: 110, carb: 8, protein: 4, fat: 7, tags: ['素菜'] },
    { name: '蒜蓉西兰花', cal: 52, carb: 6, protein: 3.5, fat: 1.8, tags: ['素菜'] },
    { name: '炒空心菜', cal: 48, carb: 5, protein: 2.5, fat: 2, tags: ['素菜'] },
    { name: '红烧茄子', cal: 85, carb: 8, protein: 2, fat: 5, tags: ['素菜'] },
    { name: '麻婆豆腐', cal: 126, carb: 3.5, protein: 8, fat: 8, tags: ['豆制品'] },
    { name: '西红柿鸡蛋汤', cal: 55, carb: 3, protein: 5, fat: 3, tags: ['汤品'] },
    { name: '紫菜蛋花汤', cal: 45, carb: 1.5, protein: 4, fat: 2.5, tags: ['汤品'] }
  ]
}

// 菜谱详情数据库（食材清单 + 做法步骤）
// 注意：生酮类菜谱严禁使用糖、淀粉、面粉等影响生酮的食材
var DISH_DETAIL = {
  '红烧肉': {
    ingredients: [
      { name: '五花肉', weight: 400, unit: 'g' },
      { name: '赤藓糖醇', weight: 10, unit: 'g' },
      { name: '生抽', weight: 25, unit: 'ml' },
      { name: '老抽', weight: 8, unit: 'ml' },
      { name: '料酒', weight: 20, unit: 'ml' },
      { name: '生姜', weight: 15, unit: 'g' },
      { name: '葱', weight: 15, unit: 'g' },
      { name: '八角', weight: 2, unit: '个' },
      { name: '桂皮', weight: 1, unit: '小块' }
    ],
    steps: [
      '五花肉切2cm见方块，冷水下锅，加料酒、姜片焯水去血沫，捞出沥干',
      '锅中放少许油，下赤藓糖醇小火慢炒至琥珀色糖色（代糖版本）',
      '放入五花肉快速翻炒，使每块肉均匀裹上糖色',
      '加入生抽、老抽、料酒翻炒均匀，倒入开水没过肉面',
      '放入姜片、葱段、八角、桂皮，大火烧开后转小火炖煮50分钟',
      '待肉质软烂后，捡出香料，大火收汁至浓稠即可'
    ],
    tips: '生酮版必须用赤藓糖醇等代糖，严禁用冰糖/白糖。收汁时注意不要糊锅'
  },
  '回锅肉': {
    ingredients: [
      { name: '五花肉', weight: 300, unit: 'g' },
      { name: '青椒', weight: 150, unit: 'g' },
      { name: '蒜苗', weight: 100, unit: 'g' },
      { name: '豆瓣酱', weight: 10, unit: 'g' },
      { name: '生抽', weight: 10, unit: 'ml' },
      { name: '料酒', weight: 10, unit: 'ml' },
      { name: '生姜', weight: 10, unit: 'g' },
      { name: '大蒜', weight: 3, unit: '瓣' },
      { name: '食用油', weight: 10, unit: 'ml' }
    ],
    steps: [
      '整块五花肉冷水下锅，加姜片、料酒煮约20分钟至七分熟，捞出晾凉切薄片',
      '青椒去籽切块，蒜苗切段，姜蒜切末备用',
      '锅中不放油，下肉片小火煸炒至出油、边缘微卷呈灯盏状',
      '将肉片推至一边，下豆瓣酱炒出红油，再下姜蒜末炒香',
      '下青椒翻炒至断生，加生抽调味',
      '最后下蒜苗段快速翻炒几下即可出锅'
    ],
    tips: '豆瓣酱碳水较低但需注意用量。肉片要切薄，慢慢煸出油脂更香'
  },
  '清蒸鲈鱼': {
    ingredients: [
      { name: '鲈鱼', weight: 500, unit: 'g' },
      { name: '生姜', weight: 20, unit: 'g' },
      { name: '葱', weight: 20, unit: 'g' },
      { name: '生抽', weight: 20, unit: 'ml' },
      { name: '食用油', weight: 15, unit: 'ml' },
      { name: '料酒', weight: 10, unit: 'ml' }
    ],
    steps: [
      '鲈鱼处理干净，两面划几刀，用料酒和姜片腌制10分钟去腥',
      '盘底铺姜片和葱段，鱼身下垫两根筷子架空',
      '水烧开后放入鱼盘，大火蒸8-10分钟（视鱼大小调整）',
      '蒸好后倒掉盘中汤汁，去掉旧葱姜',
      '鱼身铺上新鲜葱丝、姜丝，淋热油激发出香味',
      '沿盘边淋入生抽即可'
    ],
    tips: '纯生酮友好菜，无糖无淀粉。蒸鱼时间不宜过长，倒掉蒸出的腥水是去腥关键'
  },
  '蒜蓉西兰花': {
    ingredients: [
      { name: '西兰花', weight: 300, unit: 'g' },
      { name: '大蒜', weight: 20, unit: 'g' },
      { name: '生抽', weight: 10, unit: 'ml' },
      { name: '橄榄油', weight: 10, unit: 'ml' },
      { name: '盐', weight: 2, unit: 'g' }
    ],
    steps: [
      '西兰花切小朵，淡盐水浸泡10分钟后洗净',
      '烧一锅水，加少许盐和油，下西兰花焯烫1分钟捞出过凉水',
      '大蒜切末，锅中热橄榄油下蒜末小火煸至微黄出香味',
      '转大火，下西兰花快速翻炒',
      '淋少许生抽，加盐调味，翻炒均匀即可出锅'
    ],
    tips: '纯生酮友好菜。焯水时加盐和油能保持西兰花翠绿。蒜末不要炸焦，微黄即可'
  },
  '青椒炒肉': {
    ingredients: [
      { name: '里脊肉', weight: 200, unit: 'g' },
      { name: '青椒', weight: 200, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '料酒', weight: 10, unit: 'ml' },
      { name: '食用油', weight: 15, unit: 'ml' },
      { name: '大蒜', weight: 2, unit: '瓣' }
    ],
    steps: [
      '里脊肉切薄片，加生抽、料酒抓匀腌制15分钟（生酮版不加淀粉）',
      '青椒去籽切块，大蒜切末',
      '锅中油热后下肉片快速滑炒至变色，盛出备用',
      '锅中留底油，下蒜末爆香，下青椒翻炒至断生',
      '倒入肉片一起翻炒，加少许盐调味即可出锅'
    ],
    tips: '生酮版严禁用淀粉上浆！直接腌制翻炒即可，肉质一样嫩滑。炒肉片油温要高，快速滑炒'
  },
  '东坡肉': {
    ingredients: [
      { name: '五花肉', weight: 400, unit: 'g' },
      { name: '赤藓糖醇', weight: 12, unit: 'g' },
      { name: '生抽', weight: 30, unit: 'ml' },
      { name: '老抽', weight: 8, unit: 'ml' },
      { name: '料酒', weight: 20, unit: 'ml' },
      { name: '生姜', weight: 15, unit: 'g' },
      { name: '葱', weight: 20, unit: 'g' },
      { name: '八角', weight: 2, unit: '个' }
    ],
    steps: [
      '五花肉切大块冷水下锅焯水去血沫，捞出沥干',
      '锅中少油下赤藓糖醇小火炒出琥珀糖色',
      '下五花肉翻匀裹糖色，加生抽老抽料酒炒香',
      '倒开水没过肉，放姜葱八角，大火烧开转小火焖九十分钟',
      '肉质酥烂后捡出香料，大火收汁浓稠即可'
    ],
    tips: '生酮版严禁冰糖白糖，用赤藓糖醇代糖。东坡肉肥而不腻，收汁别糊锅'
  },
  '梅菜扣肉': {
    ingredients: [
      { name: '五花肉', weight: 400, unit: 'g' },
      { name: '梅干菜', weight: 80, unit: 'g' },
      { name: '生抽', weight: 25, unit: 'ml' },
      { name: '老抽', weight: 8, unit: 'ml' },
      { name: '料酒', weight: 15, unit: 'ml' },
      { name: '生姜', weight: 10, unit: 'g' },
      { name: '蒜', weight: 10, unit: 'g' },
      { name: '赤藓糖醇', weight: 6, unit: 'g' }
    ],
    steps: [
      '梅干菜泡发洗净挤干切碎；五花肉冷水煮七分熟捞出',
      '肉皮抹老抽，下油锅将皮炸至起泡捞出切片',
      '肉片加生抽老抽料酒姜蒜拌匀腌制十分钟',
      '肉皮朝下码碗，铺梅干菜，淋腌料汁',
      '上锅大火蒸六十分钟，倒扣盘中即可'
    ],
    tips: '梅干菜含少量碳水，控量食用。蒸制时间要足，肉才软糯'
  },
  '蒜香排骨': {
    ingredients: [
      { name: '肋排', weight: 400, unit: 'g' },
      { name: '大蒜', weight: 40, unit: 'g' },
      { name: '生抽', weight: 20, unit: 'ml' },
      { name: '料酒', weight: 15, unit: 'ml' },
      { name: '橄榄油', weight: 15, unit: 'ml' },
      { name: '盐', weight: 3, unit: 'g' },
      { name: '黑胡椒', weight: 2, unit: 'g' }
    ],
    steps: [
      '排骨斩小段冷水泡去血水，沥干用厨房纸吸干',
      '蒜剁蓉，加生抽料酒盐黑胡椒与排骨抓匀腌三十分钟',
      '空气炸锅一百八十度烤十八分钟，或烤箱二百度烤二十五分钟',
      '中途翻面一次，出炉撒蒜末增香'
    ],
    tips: '生酮友好主菜。空气炸锅少油也能做出蒜香焦脆'
  },
  '糖醋小排': {
    ingredients: [
      { name: '肋排', weight: 400, unit: 'g' },
      { name: '赤藓糖醇', weight: 20, unit: 'g' },
      { name: '米醋', weight: 25, unit: 'ml' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '料酒', weight: 10, unit: 'ml' },
      { name: '生姜', weight: 10, unit: 'g' },
      { name: '蒜', weight: 10, unit: 'g' },
      { name: '橄榄油', weight: 10, unit: 'ml' }
    ],
    steps: [
      '排骨斩段焯水沥干；姜蒜切末',
      '锅热油下排骨煸炒至表面微黄，下姜蒜炒香',
      '加生抽料酒与赤藓糖醇炒出糖色，倒米醋与少量水',
      '中小火焖二十分钟，大火收汁至浓稠裹匀'
    ],
    tips: '糖醋味用赤藓糖醇加米醋替代糖醋汁，碳水大幅降低'
  },
  '椒盐鸡翅': {
    ingredients: [
      { name: '鸡中翅', weight: 400, unit: 'g' },
      { name: '椒盐粉', weight: 5, unit: 'g' },
      { name: '料酒', weight: 15, unit: 'ml' },
      { name: '生抽', weight: 10, unit: 'ml' },
      { name: '蒜', weight: 15, unit: 'g' },
      { name: '橄榄油', weight: 10, unit: 'ml' }
    ],
    steps: [
      '鸡翅划两刀，用料酒生抽蒜末腌二十分钟',
      '空气炸锅一百八十度烤十五分钟，或平底锅少油煎至两面金黄',
      '出炉撒椒盐粉翻匀即可'
    ],
    tips: '椒盐粉含少量淀粉，少量使用不影响生酮。去皮可进一步降脂'
  },
  '辣子鸡': {
    ingredients: [
      { name: '鸡腿肉', weight: 400, unit: 'g' },
      { name: '干辣椒', weight: 20, unit: 'g' },
      { name: '花椒', weight: 5, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '料酒', weight: 15, unit: 'ml' },
      { name: '蒜', weight: 15, unit: 'g' },
      { name: '生姜', weight: 10, unit: 'g' },
      { name: '橄榄油', weight: 20, unit: 'ml' }
    ],
    steps: [
      '鸡腿肉切丁，用生抽料酒腌十五分钟',
      '热油下鸡丁滑炒至变色盛出',
      '底油下干辣椒花椒蒜姜小火炒香，倒鸡丁回锅',
      '大火快炒均匀出锅'
    ],
    tips: '经典川菜，纯肉类零碳水。辣椒花椒提味不升糖'
  },
  '土豆烧肉': {
    ingredients: [
      { name: '五花肉', weight: 300, unit: 'g' },
      { name: '土豆', weight: 150, unit: 'g' },
      { name: '生抽', weight: 20, unit: 'ml' },
      { name: '料酒', weight: 15, unit: 'ml' },
      { name: '八角', weight: 1, unit: '个' },
      { name: '生姜', weight: 10, unit: 'g' },
      { name: '葱', weight: 10, unit: 'g' },
      { name: '橄榄油', weight: 10, unit: 'ml' }
    ],
    steps: [
      '五花肉切块焯水；土豆去皮切滚刀块',
      '锅热油下肉煸出油，加生抽料酒姜葱八角炒香',
      '倒开水炖三十分钟，下土豆再炖十五分钟',
      '大火收汁即可'
    ],
    tips: '土豆含碳水较高，生酮期少量食用或换成花菜块'
  },
  '宫保鸡丁': {
    ingredients: [
      { name: '鸡胸肉', weight: 300, unit: 'g' },
      { name: '花生', weight: 30, unit: 'g' },
      { name: '干辣椒', weight: 15, unit: 'g' },
      { name: '花椒', weight: 3, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '料酒', weight: 10, unit: 'ml' },
      { name: '醋', weight: 5, unit: 'ml' },
      { name: '蒜', weight: 10, unit: 'g' },
      { name: '橄榄油', weight: 15, unit: 'ml' }
    ],
    steps: [
      '鸡胸切丁用生抽料酒腌十分钟；花生焙香',
      '热油下干辣椒花椒蒜爆香，下鸡丁滑炒变色',
      '加生抽醋快速翻炒，撒花生翻匀出锅'
    ],
    tips: '生酮版去掉裹粉与糖，花生提供健康脂肪'
  },
  '木须肉': {
    ingredients: [
      { name: '猪里脊', weight: 250, unit: 'g' },
      { name: '黑木耳', weight: 30, unit: 'g' },
      { name: '鸡蛋', weight: 2, unit: '个' },
      { name: '黄瓜', weight: 100, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '料酒', weight: 10, unit: 'ml' },
      { name: '蒜', weight: 10, unit: 'g' },
      { name: '橄榄油', weight: 15, unit: 'ml' }
    ],
    steps: [
      '木耳泡发撕小朵；黄瓜切片；鸡蛋打散炒熟盛出',
      '里脊切片腌十分钟，热油滑炒变色',
      '下木耳黄瓜蒜片翻炒，加生抽调味',
      '倒回鸡蛋翻匀出锅'
    ],
    tips: '家常炒菜，鸡蛋与瘦肉提供优质蛋白与脂肪'
  },
  '青椒肉丝': {
    ingredients: [
      { name: '猪里脊', weight: 250, unit: 'g' },
      { name: '青椒', weight: 150, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '料酒', weight: 10, unit: 'ml' },
      { name: '蒜', weight: 10, unit: 'g' },
      { name: '橄榄油', weight: 15, unit: 'ml' }
    ],
    steps: [
      '里脊切丝腌十分钟；青椒切丝',
      '热油下肉丝滑炒变色盛出',
      '底油下蒜青椒炒断生，倒肉丝回锅',
      '加生抽快速翻炒出锅'
    ],
    tips: '青椒碳水低，生酮友好。肉丝不裹粉直接炒'
  },
  '鱼香肉丝': {
    ingredients: [
      { name: '猪里脊', weight: 250, unit: 'g' },
      { name: '黑木耳', weight: 30, unit: 'g' },
      { name: '胡萝卜', weight: 80, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '醋', weight: 8, unit: 'ml' },
      { name: '赤藓糖醇', weight: 5, unit: 'g' },
      { name: '蒜', weight: 10, unit: 'g' },
      { name: '橄榄油', weight: 15, unit: 'ml' }
    ],
    steps: [
      '里脊切丝腌十分钟；木耳胡萝卜切丝',
      '热油下肉丝滑炒变色盛出',
      '底油下蒜与配菜炒断生，调鱼香汁（生抽醋代糖）',
      '倒肉丝回锅翻匀收汁'
    ],
    tips: '鱼香汁用赤藓糖醇替代白糖，保留风味降碳水'
  },
  '葱爆牛肉': {
    ingredients: [
      { name: '牛里脊', weight: 300, unit: 'g' },
      { name: '大葱', weight: 150, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '料酒', weight: 10, unit: 'ml' },
      { name: '黑胡椒', weight: 2, unit: 'g' },
      { name: '橄榄油', weight: 15, unit: 'ml' }
    ],
    steps: [
      '牛里脊逆纹切片腌十分钟；大葱斜切段',
      '热油大火下牛肉快速滑炒至变色盛出',
      '底油下葱段炒香，倒牛肉回锅',
      '加生抽黑胡椒大火快炒出锅'
    ],
    tips: '大葱提香，牛肉富含铁与蛋白，生酮佳选'
  },
  '炒牛肉': {
    ingredients: [
      { name: '牛里脊', weight: 300, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '料酒', weight: 10, unit: 'ml' },
      { name: '黑胡椒', weight: 2, unit: 'g' },
      { name: '蒜', weight: 10, unit: 'g' },
      { name: '橄榄油', weight: 15, unit: 'ml' }
    ],
    steps: [
      '牛肉切片用生抽料酒腌十分钟',
      '热油大火快炒至变色，下蒜末炒香',
      '撒黑胡椒翻炒均匀出锅'
    ],
    tips: '简约版小炒牛肉，纯肉零碳水'
  },
  '清炒虾仁': {
    ingredients: [
      { name: '虾仁', weight: 300, unit: 'g' },
      { name: '西兰花', weight: 100, unit: 'g' },
      { name: '蒜', weight: 10, unit: 'g' },
      { name: '生抽', weight: 10, unit: 'ml' },
      { name: '橄榄油', weight: 15, unit: 'ml' },
      { name: '盐', weight: 2, unit: 'g' }
    ],
    steps: [
      '虾仁开背去虾线；西兰花切小朵焯水',
      '热油下蒜爆香，下虾仁炒至变色',
      '倒西兰花加生抽盐快速翻炒出锅'
    ],
    tips: '海鲜低脂高蛋白，生酮友好'
  },
  '白灼虾': {
    ingredients: [
      { name: '基围虾', weight: 400, unit: 'g' },
      { name: '生姜', weight: 15, unit: 'g' },
      { name: '葱', weight: 10, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '料酒', weight: 10, unit: 'ml' }
    ],
    steps: [
      '姜葱拍碎铺锅底，加水料酒煮开',
      '下鲜虾煮两三分钟至变红卷曲捞出',
      '蘸生抽或姜醋汁食用'
    ],
    tips: '最纯正的零碳水海鲜做法，原汁原味'
  },
  '清蒸鳕鱼': {
    ingredients: [
      { name: '鳕鱼', weight: 400, unit: 'g' },
      { name: '生姜', weight: 15, unit: 'g' },
      { name: '葱', weight: 15, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '橄榄油', weight: 10, unit: 'ml' },
      { name: '料酒', weight: 10, unit: 'ml' }
    ],
    steps: [
      '鳕鱼解冻擦干，用料酒姜丝腌十分钟',
      '水开上锅大火蒸八分钟，倒掉蒸鱼水',
      '铺新鲜葱姜丝，淋热油激香，浇生抽即可'
    ],
    tips: '深海鱼富含奥米伽三，纯生酮友好'
  },
  '香煎三文鱼': {
    ingredients: [
      { name: '三文鱼', weight: 350, unit: 'g' },
      { name: '黑胡椒', weight: 3, unit: 'g' },
      { name: '盐', weight: 3, unit: 'g' },
      { name: '橄榄油', weight: 15, unit: 'ml' },
      { name: '柠檬', weight: 20, unit: 'g' }
    ],
    steps: [
      '三文鱼擦干，两面撒盐黑胡椒',
      '平底锅热橄榄油，皮朝下煎三分钟翻面再煎两分钟',
      '出炉挤柠檬汁即可'
    ],
    tips: '三文鱼高脂高蛋白，生酮明星食材。皮脆肉嫩'
  },
  '蒜蓉粉丝蒸虾': {
    ingredients: [
      { name: '基围虾', weight: 400, unit: 'g' },
      { name: '龙口粉丝', weight: 30, unit: 'g' },
      { name: '大蒜', weight: 40, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '橄榄油', weight: 10, unit: 'ml' }
    ],
    steps: [
      '粉丝温水泡软垫盘底；虾开背去线摆上',
      '蒜剁蓉炒香加生抽调汁淋虾上',
      '水开蒸六分钟，出锅淋热油'
    ],
    tips: '粉丝含碳水，少量铺底提味即可，主吃虾'
  },
  '虾仁炒蛋': {
    ingredients: [
      { name: '虾仁', weight: 200, unit: 'g' },
      { name: '鸡蛋', weight: 3, unit: '个' },
      { name: '盐', weight: 3, unit: 'g' },
      { name: '橄榄油', weight: 15, unit: 'ml' },
      { name: '葱', weight: 10, unit: 'g' }
    ],
    steps: [
      '虾仁开背去线；鸡蛋打散加盐',
      '热油先炒蛋至凝固盛出',
      '底油下虾仁炒变色，倒回鸡蛋加葱翻匀'
    ],
    tips: '虾仁蛋双蛋白，快手低脂菜'
  },
  '麻婆豆腐': {
    ingredients: [
      { name: '嫩豆腐', weight: 400, unit: 'g' },
      { name: '牛肉末', weight: 80, unit: 'g' },
      { name: '豆瓣酱', weight: 15, unit: 'g' },
      { name: '花椒粉', weight: 3, unit: 'g' },
      { name: '生抽', weight: 10, unit: 'ml' },
      { name: '蒜', weight: 10, unit: 'g' },
      { name: '橄榄油', weight: 15, unit: 'ml' }
    ],
    steps: [
      '豆腐切丁焯水去豆腥；牛肉末备用',
      '热油下肉末炒散，加豆瓣酱蒜末炒红油',
      '加水烧开下豆腐轻推煮三分钟',
      '撒花椒粉出锅'
    ],
    tips: '豆腐植物蛋白，豆瓣酱控量。麻辣开胃'
  },
  '红烧豆腐': {
    ingredients: [
      { name: '老豆腐', weight: 400, unit: 'g' },
      { name: '生抽', weight: 20, unit: 'ml' },
      { name: '老抽', weight: 5, unit: 'ml' },
      { name: '料酒', weight: 10, unit: 'ml' },
      { name: '蒜', weight: 10, unit: 'g' },
      { name: '葱', weight: 10, unit: 'g' },
      { name: '橄榄油', weight: 15, unit: 'ml' }
    ],
    steps: [
      '豆腐切厚片，平底锅少油煎至两面金黄',
      '下蒜葱炒香，加生抽老抽料酒与少量水',
      '焖煮三分钟收汁撒葱'
    ],
    tips: '煎过的豆腐更入味，植物蛋白补充'
  },
  '红烧茄子': {
    ingredients: [
      { name: '长茄子', weight: 400, unit: 'g' },
      { name: '生抽', weight: 20, unit: 'ml' },
      { name: '蒜', weight: 15, unit: 'g' },
      { name: '葱', weight: 10, unit: 'g' },
      { name: '橄榄油', weight: 20, unit: 'ml' }
    ],
    steps: [
      '茄子切条撒少许盐腌十分钟挤去水分',
      '热油下茄子煸软盛出',
      '底油下蒜葱炒香，倒茄子回锅加生抽焖两分钟'
    ],
    tips: '茄子吸油，用少油煸炒替代油炸更健康'
  },
  '炒香干': {
    ingredients: [
      { name: '香干', weight: 300, unit: 'g' },
      { name: '青椒', weight: 100, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '蒜', weight: 10, unit: 'g' },
      { name: '橄榄油', weight: 15, unit: 'ml' }
    ],
    steps: [
      '香干切条；青椒切丝',
      '热油下香干煸炒，下蒜青椒翻炒',
      '加生抽炒匀出锅'
    ],
    tips: '豆制品提供植物蛋白，青椒低卡'
  },
  '炒空心菜': {
    ingredients: [
      { name: '空心菜', weight: 300, unit: 'g' },
      { name: '蒜', weight: 15, unit: 'g' },
      { name: '生抽', weight: 8, unit: 'ml' },
      { name: '橄榄油', weight: 12, unit: 'ml' },
      { name: '盐', weight: 2, unit: 'g' }
    ],
    steps: [
      '空心菜摘段洗净沥干；蒜剁末',
      '热油大火下蒜爆香，下空心菜快炒',
      '加生抽盐翻炒一分钟出锅'
    ],
    tips: '绿叶菜低碳水，大火快炒保翠绿'
  },
  '炒芦笋': {
    ingredients: [
      { name: '芦笋', weight: 300, unit: 'g' },
      { name: '蒜', weight: 10, unit: 'g' },
      { name: '生抽', weight: 8, unit: 'ml' },
      { name: '橄榄油', weight: 12, unit: 'ml' },
      { name: '盐', weight: 2, unit: 'g' }
    ],
    steps: [
      '芦笋去老根切段；蒜切末',
      '热油下蒜爆香，下芦笋大火翻炒',
      '加生抽盐炒两分钟出锅'
    ],
    tips: '芦笋膳食纤维丰富，低卡高营养'
  },
  '炒菠菜': {
    ingredients: [
      { name: '菠菜', weight: 300, unit: 'g' },
      { name: '蒜', weight: 15, unit: 'g' },
      { name: '橄榄油', weight: 12, unit: 'ml' },
      { name: '盐', weight: 2, unit: 'g' }
    ],
    steps: [
      '菠菜洗净焯水去草酸沥干；蒜剁末',
      '热油下蒜爆香，下菠菜快炒',
      '加盐炒匀出锅'
    ],
    tips: '菠菜先焯水去草酸，补铁好蔬菜'
  },
  '炒蘑菇': {
    ingredients: [
      { name: '口蘑', weight: 300, unit: 'g' },
      { name: '蒜', weight: 10, unit: 'g' },
      { name: '生抽', weight: 8, unit: 'ml' },
      { name: '橄榄油', weight: 12, unit: 'ml' },
      { name: '黑胡椒', weight: 2, unit: 'g' }
    ],
    steps: [
      '口蘑切片；蒜切末',
      '热油下蒜爆香，下蘑菇煸炒出汤汁',
      '加生抽黑胡椒收汁'
    ],
    tips: '菌菇低卡高纤维，天然鲜味'
  },
  '炒青菜': {
    ingredients: [
      { name: '小青菜', weight: 300, unit: 'g' },
      { name: '蒜', weight: 15, unit: 'g' },
      { name: '生抽', weight: 8, unit: 'ml' },
      { name: '橄榄油', weight: 12, unit: 'ml' },
      { name: '盐', weight: 2, unit: 'g' }
    ],
    steps: [
      '青菜洗净沥干；蒜剁末',
      '热油大火下蒜爆香，下青菜快炒',
      '加生抽盐炒一分钟出锅'
    ],
    tips: '最家常绿叶菜，碳水极低'
  },
  '干煸四季豆': {
    ingredients: [
      { name: '四季豆', weight: 300, unit: 'g' },
      { name: '肉末', weight: 80, unit: 'g' },
      { name: '生抽', weight: 12, unit: 'ml' },
      { name: '蒜', weight: 10, unit: 'g' },
      { name: '干辣椒', weight: 8, unit: 'g' },
      { name: '橄榄油', weight: 15, unit: 'ml' }
    ],
    steps: [
      '四季豆撕筋切段，少油煸至起皱盛出',
      '底油下肉末蒜干辣椒炒香',
      '倒四季豆回锅加生抽煸炒均匀'
    ],
    tips: '四季豆必须煸熟透防中毒，少油版更健康'
  },
  '干锅花菜': {
    ingredients: [
      { name: '花菜', weight: 400, unit: 'g' },
      { name: '五花肉', weight: 100, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '蒜', weight: 10, unit: 'g' },
      { name: '干辣椒', weight: 8, unit: 'g' },
      { name: '橄榄油', weight: 12, unit: 'ml' }
    ],
    steps: [
      '花菜掰小朵焯水；五花肉切片',
      '热油下五花肉煸出油，下蒜干辣椒炒香',
      '倒花菜加生抽大火翻炒均匀'
    ],
    tips: '花菜低碳水，五花肉增香，干锅风味'
  },
  '拍黄瓜': {
    ingredients: [
      { name: '黄瓜', weight: 300, unit: 'g' },
      { name: '蒜', weight: 15, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '醋', weight: 10, unit: 'ml' },
      { name: '香油', weight: 5, unit: 'ml' },
      { name: '盐', weight: 2, unit: 'g' }
    ],
    steps: [
      '黄瓜拍裂切段加盐腌五分钟沥干',
      '蒜剁蓉加生抽醋香油调汁',
      '淋汁拌匀冷藏更爽脆'
    ],
    tips: '零碳水凉拌菜，生酮期解腻首选'
  },
  '凉拌木耳': {
    ingredients: [
      { name: '黑木耳', weight: 150, unit: 'g' },
      { name: '蒜', weight: 15, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '醋', weight: 10, unit: 'ml' },
      { name: '香油', weight: 5, unit: 'ml' },
      { name: '香菜', weight: 10, unit: 'g' }
    ],
    steps: [
      '木耳泡发焯水过凉沥干；蒜剁蓉',
      '加生抽醋香油香菜拌匀',
      '冷藏入味更佳'
    ],
    tips: '木耳富含胶质膳食纤维，低卡凉拌'
  },
  '凉拌海带丝': {
    ingredients: [
      { name: '海带丝', weight: 200, unit: 'g' },
      { name: '蒜', weight: 15, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '醋', weight: 10, unit: 'ml' },
      { name: '香油', weight: 5, unit: 'ml' },
      { name: '辣椒油', weight: 5, unit: 'ml' }
    ],
    steps: [
      '海带丝焯水过凉沥干；蒜剁蓉',
      '加生抽醋香油辣椒油拌匀'
    ],
    tips: '海带富含碘与膳食纤维，低卡'
  },
  '凉拌豆腐丝': {
    ingredients: [
      { name: '豆腐皮', weight: 200, unit: 'g' },
      { name: '黄瓜', weight: 100, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '醋', weight: 8, unit: 'ml' },
      { name: '香油', weight: 5, unit: 'ml' },
      { name: '蒜', weight: 10, unit: 'g' }
    ],
    steps: [
      '豆腐皮切丝焯水过凉；黄瓜切丝',
      '加生抽醋香油蒜拌匀'
    ],
    tips: '豆制品植物蛋白，清爽凉拌'
  },
  '扬州炒饭': {
    ingredients: [
      { name: '米饭', weight: 200, unit: 'g' },
      { name: '鸡蛋', weight: 2, unit: '个' },
      { name: '虾仁', weight: 80, unit: 'g' },
      { name: '火腿', weight: 50, unit: 'g' },
      { name: '青豆', weight: 30, unit: 'g' },
      { name: '橄榄油', weight: 15, unit: 'ml' },
      { name: '盐', weight: 2, unit: 'g' }
    ],
    steps: [
      '鸡蛋炒散盛出；虾仁火腿青豆炒熟',
      '下米饭炒散，加蛋与配料',
      '加盐翻炒均匀出锅'
    ],
    tips: '米饭碳水偏高，生酮期少量或换花菜米'
  },
  '蛋炒饭': {
    ingredients: [
      { name: '米饭', weight: 200, unit: 'g' },
      { name: '鸡蛋', weight: 2, unit: '个' },
      { name: '葱', weight: 10, unit: 'g' },
      { name: '橄榄油', weight: 15, unit: 'ml' },
      { name: '盐', weight: 2, unit: 'g' }
    ],
    steps: [
      '鸡蛋炒散盛出',
      '下米饭炒散，倒回鸡蛋加葱盐',
      '翻炒均匀出锅'
    ],
    tips: '经典炒饭，碳水偏高适量食用'
  },
  '番茄炒蛋': {
    ingredients: [
      { name: '番茄', weight: 300, unit: 'g' },
      { name: '鸡蛋', weight: 3, unit: '个' },
      { name: '盐', weight: 3, unit: 'g' },
      { name: '橄榄油', weight: 15, unit: 'ml' },
      { name: '葱', weight: 10, unit: 'g' }
    ],
    steps: [
      '鸡蛋打散炒熟盛出；番茄切块',
      '热油下番茄炒出汁，倒回鸡蛋',
      '加盐葱翻匀'
    ],
    tips: '番茄含天然糖，适量食用不影响生酮'
  },
  '西红柿鸡蛋汤': {
    ingredients: [
      { name: '番茄', weight: 200, unit: 'g' },
      { name: '鸡蛋', weight: 2, unit: '个' },
      { name: '葱', weight: 10, unit: 'g' },
      { name: '盐', weight: 3, unit: 'g' },
      { name: '橄榄油', weight: 8, unit: 'ml' }
    ],
    steps: [
      '番茄切块炒出汁加开水煮开',
      '淋入蛋液成蛋花，加盐葱调味'
    ],
    tips: '清爽暖胃汤，低卡'
  },
  '蛋花汤': {
    ingredients: [
      { name: '鸡蛋', weight: 2, unit: '个' },
      { name: '紫菜', weight: 5, unit: 'g' },
      { name: '葱', weight: 10, unit: 'g' },
      { name: '盐', weight: 3, unit: 'g' },
      { name: '香油', weight: 3, unit: 'ml' }
    ],
    steps: [
      '水开下紫菜煮一分钟',
      '淋蛋液成蛋花，加盐香油葱'
    ],
    tips: '最简快手汤，零碳水'
  },
  '紫菜蛋花汤': {
    ingredients: [
      { name: '紫菜', weight: 5, unit: 'g' },
      { name: '鸡蛋', weight: 2, unit: '个' },
      { name: '虾皮', weight: 5, unit: 'g' },
      { name: '葱', weight: 10, unit: 'g' },
      { name: '盐', weight: 3, unit: 'g' },
      { name: '香油', weight: 3, unit: 'ml' }
    ],
    steps: [
      '水开下紫菜虾皮煮一分钟',
      '淋蛋液成蛋花，加盐香油葱'
    ],
    tips: '补碘补钙快手汤'
  },
  '蘑菇蛋汤': {
    ingredients: [
      { name: '口蘑', weight: 150, unit: 'g' },
      { name: '鸡蛋', weight: 2, unit: '个' },
      { name: '葱', weight: 10, unit: 'g' },
      { name: '盐', weight: 3, unit: 'g' },
      { name: '橄榄油', weight: 8, unit: 'ml' }
    ],
    steps: [
      '口蘑切片炒香加水煮开',
      '淋蛋液成蛋花，加盐葱'
    ],
    tips: '菌菇鲜汤，低卡暖胃'
  },
  '冬瓜排骨汤': {
    ingredients: [
      { name: '排骨', weight: 300, unit: 'g' },
      { name: '冬瓜', weight: 300, unit: 'g' },
      { name: '生姜', weight: 15, unit: 'g' },
      { name: '料酒', weight: 10, unit: 'ml' },
      { name: '盐', weight: 3, unit: 'g' }
    ],
    steps: [
      '排骨焯水；冬瓜去皮切块',
      '排骨姜料酒加水炖四十分钟',
      '下冬瓜再炖十五分钟加盐'
    ],
    tips: '冬瓜利尿消肿，排骨补蛋白，清润汤品'
  },
  '口水鸡': {
    ingredients: [
      { name: '鸡腿', weight: 400, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '醋', weight: 8, unit: 'ml' },
      { name: '辣椒油', weight: 10, unit: 'ml' },
      { name: '蒜', weight: 15, unit: 'g' },
      { name: '姜', weight: 10, unit: 'g' },
      { name: '芝麻', weight: 3, unit: 'g' }
    ],
    steps: [
      '鸡腿冷水加姜煮十五分钟，关火焖十分钟过冰水',
      '鸡肉切条摆盘',
      '调红油汁（生抽醋辣椒油蒜）淋鸡上撒芝麻'
    ],
    tips: '川味凉菜，纯肉零碳水，红油控量'
  },
  '酸辣土豆丝': {
    ingredients: [
      { name: '土豆', weight: 300, unit: 'g' },
      { name: '干辣椒', weight: 10, unit: 'g' },
      { name: '醋', weight: 15, unit: 'ml' },
      { name: '生抽', weight: 10, unit: 'ml' },
      { name: '蒜', weight: 10, unit: 'g' },
      { name: '橄榄油', weight: 12, unit: 'ml' }
    ],
    steps: [
      '土豆切丝泡水去淀粉沥干；蒜干辣椒切段',
      '热油下蒜辣椒爆香，下土豆丝大火快炒',
      '烹醋加生抽炒匀出锅'
    ],
    tips: '土豆碳水较高，生酮期少量或换藕带丝'
  },
  '糖醋里脊': {
    ingredients: [
      { name: '猪里脊', weight: 300, unit: 'g' },
      { name: '赤藓糖醇', weight: 20, unit: 'g' },
      { name: '米醋', weight: 20, unit: 'ml' },
      { name: '生抽', weight: 10, unit: 'ml' },
      { name: '番茄酱', weight: 10, unit: 'g' },
      { name: '橄榄油', weight: 15, unit: 'ml' },
      { name: '鸡蛋', weight: 1, unit: '个' }
    ],
    steps: [
      '里脊切条用蛋液生抽腌十分钟',
      '少油煎至金黄盛出',
      '调糖醋汁（赤藓糖醇米醋番茄酱）下锅熬稠',
      '倒里脊翻匀裹汁'
    ],
    tips: '生酮版用赤藓糖醇代糖，番茄酱少量提色'
  },
  '白灼菜心': {
    ingredients: [
      { name: '菜心', weight: 300, unit: 'g' },
      { name: '生抽', weight: 15, unit: 'ml' },
      { name: '蒜', weight: 10, unit: 'g' },
      { name: '橄榄油', weight: 8, unit: 'ml' },
      { name: '盐', weight: 2, unit: 'g' }
    ],
    steps: [
      '菜心洗净理顺，根部切齐',
      '水开加少许盐和油，下菜心焯烫约一分钟捞出沥干摆盘',
      '蒜末加生抽调汁淋上，或烧热橄榄油泼香'
    ],
    tips: '白灼保留蔬菜清甜原味，焯水时间勿长以保翠绿，零碳水生酮友好'
  },
  '红烧排骨': {
    ingredients: [
      { name: '肋排', weight: 400, unit: 'g' },
      { name: '生抽', weight: 20, unit: 'ml' },
      { name: '老抽', weight: 8, unit: 'ml' },
      { name: '料酒', weight: 15, unit: 'ml' },
      { name: '生姜', weight: 10, unit: 'g' },
      { name: '蒜', weight: 10, unit: 'g' },
      { name: '八角', weight: 1, unit: '个' },
      { name: '赤藓糖醇', weight: 6, unit: 'g' }
    ],
    steps: [
      '排骨斩段冷水下锅焯水去血沫捞出沥干',
      '锅热少油下排骨煸炒，加生抽老抽料酒姜蒜八角炒香',
      '倒开水没过排骨，大火烧开转小火炖四十分钟',
      '加赤藓糖醇提鲜，大火收汁浓稠即可'
    ],
    tips: '生酮版不加冰糖，用赤藓糖醇微调色泽与鲜甜，排骨提供优质蛋白与脂肪'
  },
}

// 获取菜谱详情（如果没有详细数据返回基础信息）
function getDishDetail(dishName) {
  return DISH_DETAIL[dishName] || null
}

// 食材挑选教学：每类食材给出"什么样的算优质 + 怎么挑"，做菜人在采购时直接用
var INGREDIENT_PICK = {
  '五花肉': '挑肥瘦相间、层数分明（三层以上）的新鲜肉，色泽粉红有光泽、按下去能回弹；避免发暗、出水或有异味。带皮更适合红烧/东坡。',
  '里脊肉': '选色泽鲜红、纹理细腻、少筋膜的部位，摸起来微干不粘手；做青椒炒肉更嫩。',
  '肋排': '选肋骨细、肉层均匀的小排，骨肉比适中，肉色鲜红；空气炸/烤更香。',
  '鸡中翅': '挑冰鲜或冷鲜、表皮完整无破、按之有弹性的；个头均匀易熟。去皮可减脂。',
  '鸡腿肉': '选冷鲜鸡腿肉，去骨切丁方便；肉色正常、无血水渗出为佳。',
  '鲈鱼': '活杀或冰鲜最佳，眼珠清亮凸起、鳃鲜红、肉质有弹性；清蒸最能保营养。',
  '虾仁': '鲜虾现剥优于冻虾仁；冻品选冰衣薄、虾体完整不散、无氨味。',
  '牛肉': '选色泽鲜红、脂肪乳白分布均匀的部位；涮煮选嫩肩/里脊，炖煮选牛腩。',
  '鸡蛋': '新鲜蛋晃之不响、气室小；土鸡蛋风味更浓但营养差异不大，按喜好选。',
  '豆腐': '嫩豆腐适合汤、老豆腐适合煎炒；闻起来有豆香无酸味，盒装看保质期。',
  '西兰花': '花球紧实、颜色深绿、茎脆嫩；花黄或开花说明不新鲜。',
  '西红柿': '选果蒂青绿、皮薄籽少、手感稍软有分量；自然熟更甜，催熟硬且无香。',
  '青椒': '皮亮肉厚、椒身直挺有重量；褶皱或软塌不新鲜。',
  '冬瓜': '皮上白霜厚、瓜肉紧实沉重者嫩；切开后籽小肉白为好。',
  '生姜': '选表皮粗糙土黄、肉质结实多汁；发软干瘪的香味差。',
  '大蒜': '瓣大饱满、外皮干燥不霉；捏起来硬实为佳。',
  '葱': '葱白长、叶挺绿不萎；根部干净无泥。',
  '生抽': '选酿造酱油（配料表有大豆/小麦、无焦糖色以外的添加剂），咸鲜适口。',
  '老抽': '用于上色，选酿造、色泽红亮不发黑。',
  '米醋': '选粮食酿造（非配制），酸香柔和；凉拌/糖醋菜更自然。',
  '橄榄油': '凉拌选特级初榨（酸度≤0.8%），烹饪选精炼橄榄油烟点高；看原产地与保质期。',
  '食用油': '轮换使用更均衡（橄榄油/菜籽油/茶油）；选小包装避免氧化。',
  '赤藓糖醇': '生酮代糖首选，选纯度高、无异味；注意配料仅赤藓糖醇，无添加糖醇超标。',
  '米饭': '优选糙米/杂粮饭升糖更缓；白米选新米、米粒完整有光泽。',
  '面条': '控碳可选荞麦面/魔芋面；普通面条看配料简单、无过多添加剂。',
  '土豆': '选皮光滑无芽、无青绿（发青含龙葵素）；储存避光。',
  '紫菜': '选干燥完整、色泽紫黑有光泽、无沙；汤品提鲜。',
  '海带': '选厚实、无霉斑、泡发率高；含碘丰富，适量即可。',
  '小米': '选色泽金黄、颗粒均匀、无虫蛀；熬粥养胃。',
  '南瓜': '选皮硬、梗干、敲击声音沉闷的粉糯品种；高糖品种控量。'
};
function getIngredientPick(name) {
  if (!name) return null;
  // 精确匹配
  if (INGREDIENT_PICK[name]) return INGREDIENT_PICK[name];
  // 包含匹配（如"五花肉"匹配"五花肉（带皮）"）
  var keys = Object.keys(INGREDIENT_PICK);
  for (var i = 0; i < keys.length; i++) {
    if (name.indexOf(keys[i]) >= 0 || keys[i].indexOf(name) >= 0) return INGREDIENT_PICK[keys[i]];
  }
  return null;
}

var PRESET_NAMES = [];
(function() {
  var keys = []
  for (var k in FOOD_DB) {
    if (FOOD_DB.hasOwnProperty(k)) {
      keys.push(k)
    }
  }
  PRESET_NAMES = keys
})()

// 模糊匹配食物名称
function fuzzyMatchFood(input) {
  if (!input) return null
  var key = input.trim()
  if (!key) return null

  // 1. 精确匹配
  if (FOOD_DB[key]) {
    return { name: key, data: FOOD_DB[key] }
  }

  // 2. 别名匹配
  if (FOOD_ALIASES[key]) {
    var realName = FOOD_ALIASES[key]
    return { name: realName, data: FOOD_DB[realName] }
  }

  // 3. 包含匹配（输入"糯玉米"匹配"糯玉米"，或"玉米"匹配所有含玉米的）
  var i
  for (i = 0; i < PRESET_NAMES.length; i++) {
    var name = PRESET_NAMES[i]
    if (name.indexOf(key) > -1 || key.indexOf(name) > -1) {
      return { name: name, data: FOOD_DB[name] }
    }
  }

  return null
}

function getToday() {
  var now = new Date()
  var year = now.getFullYear()
  var month = now.getMonth() + 1
  var day = now.getDate()
  month = month < 10 ? '0' + month : '' + month
  day = day < 10 ? '0' + day : '' + day
  return year + '-' + month + '-' + day
}


// ============ 移植自小程序的纯计算逻辑 ============

// 当日宏量营养素 + 生酮比例 + 热量差
function calculateDailyTotal(foods, baseMetabolism) {
  var totalCal = 0, carbG = 0, proteinG = 0, fatG = 0;
  for (var i = 0; i < foods.length; i++) {
    var f = foods[i];
    totalCal += (f.calories || 0);
    carbG += (f.carb || 0);
    proteinG += (f.protein || 0);
    fatG += (f.fat || 0);
  }
  var totalNutrient = carbG + proteinG + fatG;
  var carbPercent = totalNutrient > 0 ? Math.round(carbG / totalNutrient * 100) : 0;
  var proteinPercent = totalNutrient > 0 ? Math.round(proteinG / totalNutrient * 100) : 0;
  var fatPercent = totalNutrient > 0 ? Math.round(fatG / totalNutrient * 100) : 0;
  var calBalance = Math.round(totalCal - (baseMetabolism || 0));
  return {
    totalCal: Math.round(totalCal),
    carbG: Math.round(carbG * 10) / 10,
    proteinG: Math.round(proteinG * 10) / 10,
    fatG: Math.round(fatG * 10) / 10,
    carbPercent: carbPercent,
    proteinPercent: proteinPercent,
    fatPercent: fatPercent,
    calBalance: calBalance
  };
}

// 健康指标：BMI / 体脂率(Deurenberg) / BMR(Mifflin-St Jeor) / 季节系数 / TDEE / 晚餐目标
function calcHealth(opts) {
  var gender = opts.gender || '男';
  var height = opts.height || 170;
  var birthYear = opts.birthYear || 1985;
  var activityLevel = opts.activityLevel || 'sedentary';
  var weight = opts.weight || 70;

  var now = new Date().getFullYear();
  var age = now - birthYear;
  var heightM = height / 100;
  if (heightM <= 0) heightM = 1.7;

  var bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
  var bmiLevel = '', bmiHint = '';
  if (bmi < 18.5) { bmiLevel = 'underweight'; bmiHint = '偏瘦'; }
  else if (bmi < 24) { bmiLevel = 'normal'; bmiHint = '正常'; }
  else if (bmi < 28) { bmiLevel = 'overweight'; bmiHint = '偏胖'; }
  else { bmiLevel = 'obese'; bmiHint = '肥胖'; }

  var minHealthy = (18.5 * heightM * heightM).toFixed(1);
  var maxHealthy = (24 * heightM * heightM).toFixed(1);
  var healthyWeightRange = minHealthy + ' - ' + maxHealthy;

  var genderCode = gender === '男' ? 1 : 0;
  var bodyFatRate = parseFloat((1.2 * bmi + 0.23 * age - 10.8 * genderCode - 5.4).toFixed(1));

  var bmr = 0;
  if (gender === '男') bmr = Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  else bmr = Math.round(10 * weight + 6.25 * height - 5 * age - 161);

  var month = new Date().getMonth() + 1;
  var isSummer = month >= 5 && month <= 10;
  var seasonFactor = isSummer ? 0.97 : 1.03;
  var seasonHint = isSummer ? '夏季（5-10月）代谢略低' : '冬季（11-4月）代谢略高';

  var activityFactors = { 'sedentary': 1.2, 'light': 1.375, 'moderate': 1.55, 'very_active': 1.725 };
  var activityFactor = activityFactors[activityLevel] || 1.2;
  var tdee = Math.round(bmr * seasonFactor * activityFactor);

  var dinnerTarget = Math.round(tdee * 0.25);

  return {
    bmi: bmi, bmiLevel: bmiLevel, bmiHint: bmiHint,
    healthyWeightRange: healthyWeightRange,
    bodyFatRate: bodyFatRate,
    bmr: bmr, seasonFactor: seasonFactor, seasonHint: seasonHint,
    tdee: tdee, dinnerTarget: dinnerTarget
  };
}

// 晚餐推荐菜（从 DISH_DB 按模式取热量接近的菜）
function recommendDishes(targetCal, dietMode) {
  var pool = DISH_DB[dietMode] || DISH_DB.normal;
  var shuffled = pool.slice();
  shuffled.sort(function () { return Math.random() - 0.5; });
  shuffled.sort(function (a, b) {
    return Math.abs(a.cal - targetCal) - Math.abs(b.cal - targetCal);
  });
  return shuffled.slice(0, 8).map(function (d) {
    var portion = Math.round((targetCal / d.cal) * 100);
    return {
      name: d.name, cal: d.cal, carb: d.carb, protein: d.protein, fat: d.fat,
      tags: d.tags || ['菜品'],
      portion: portion > 100 ? 100 : portion,
      portionLabel: portion > 100 ? '100%' : (portion + '%')
    };
  });
}

// 晚餐目标热量（基于个人信息 + 已摄入 + 运动 + 步数）
function calcDinnerRecommendation(opts) {
  var gender = opts.gender === '女' ? 'female' : 'male';
  var age = new Date().getFullYear() - (opts.birthYear || 1985);
  var height = opts.height || 170;
  var weight = opts.weight || 70;
  var activityLevel = opts.activityLevel || 1.375;

  var bmr = 0;
  if (gender === 'male') bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  else bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  var tdee = Math.round(bmr * activityLevel);

  var dietMode = opts.dietMode || 'keto';
  var modeFactor = dietMode === 'keto' ? 0.78 : dietMode === 'lowcarb' ? 0.85 : 1.0;

  var targetIntake = Math.round(tdee * modeFactor);
  var consumed = (opts.breakfastCal || 0) + (opts.lunchCal || 0);
  var totalBurn = (opts.exerciseCal || 0) + (opts.stepCal || 0);
  var dinnerTarget = targetIntake - consumed + totalBurn;
  if (dinnerTarget < 0) dinnerTarget = 0;

  var recommended = recommendDishes(dinnerTarget, dietMode);
  return {
    bmr: Math.round(bmr),
    tdee: tdee,
    targetIntake: targetIntake,
    dinnerTarget: Math.round(dinnerTarget),
    recommended: recommended
  };
}

var api = { FOOD_DB: FOOD_DB, FOOD_ALIASES: FOOD_ALIASES, DISH_DB: DISH_DB, DISH_DETAIL: DISH_DETAIL, INGREDIENT_PICK: INGREDIENT_PICK, fuzzyMatchFood: fuzzyMatchFood, getDishDetail: getDishDetail, getIngredientPick: getIngredientPick, getToday: getToday, calculateDailyTotal: calculateDailyTotal, calcHealth: calcHealth, calcDinnerRecommendation: calcDinnerRecommendation };
if (typeof module !== 'undefined' && module.exports) { module.exports = api; } else { global.KetoCore = api; }
})(typeof window !== 'undefined' ? window : globalThis);
