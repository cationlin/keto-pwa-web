// sw.js — 极简 Service Worker：缓存静态资源，支持离线打开
// v12：成员身份体系（爸爸/妈妈/逸凡 顶栏切换+数据隔离）+ 食谱份量缩放/厨房模式/全家适配/食材挑选教学 + 周菜单采购清单(meal-plan.js)
var CACHE = 'keto-pwa-v14';

// 基础资源（必须）
var ASSETS = [
  '.', 'index.html', 'manifest.webmanifest',
  'css/styles.css',
  'js/icons.js',
  'js/keto-core.js', 'js/store.js', 'js/cloudbase.js', 'js/core-bridge.js',
  'js/knowledge.js', 'js/knowledge-tools.js', 'js/charts.js', 'js/recipe-imgs.js',
  'js/a-checkin.js', 'js/b-records.js', 'js/c-trend.js',
  'js/family.js', 'js/d-mine.js', 'js/e-analysis.js', 'js/f-recipes.js', 'js/meal-plan.js', 'js/g-kids.js', 'js/app.js',
  'img/icon-192.png', 'img/icon-512.png'
];

// 52 张菜品 webp（菜单图，关键小资源，首装预缓存以保离线与首屏稳定）
var DISH_IMGS = [];
for (var i = 1; i <= 52; i++) {
  var n = i < 10 ? ('00' + i) : ('0' + i);
  DISH_IMGS.push('img/dish/dish_' + n + '.webp');
}

self.addEventListener('install', function (e) {
  var all = ASSETS.concat(DISH_IMGS);
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(all).catch(function () {}); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(function (hit) {
    return hit || fetch(e.request).then(function (res) {
      // 运行时缓存：webp/png/mp4/svg 等按需缓存（含 20 段动作视频首次播放后离线可用）
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    }).catch(function () { return hit; });
  }));
});