// sw.js — 极简 Service Worker：缓存静态资源，支持离线打开
// v15：① 缓存名升级（清掉旧版冻结的 app.js/cloudbase.js 缓存）② fetch 改为「代码类网络优先 + 图片类缓存优先」
//       —— 保证以后每次发版用户自动拿到最新代码，不再被旧 SW 缓存卡死首屏
var CACHE = 'keto-pwa-v15';

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

// 判断请求类型：代码/HTML 走网络优先，图片/视频走缓存优先（离线可用）
function isCodeAsset(url) {
  var u = url.split('?')[0];
  return /\.(js|css|html?|webmanifest|json)$/i.test(u);
}

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = e.request.url;

  // 跨域 / 非本域请求：直接放行，不拦截
  if (url.indexOf(self.location.origin) !== 0) {
    e.respondWith(fetch(e.request).catch(function () { return caches.match(e.request); }));
    return;
  }

  if (isCodeAsset(url)) {
    // 网络优先：永远先拿最新代码，失败再退回缓存（保证发版即时生效）
    e.respondWith(
      fetch(e.request).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(e.request).then(function (hit) { return hit || fetch(e.request); });
      })
    );
  } else {
    // 图片/视频：缓存优先 + 运行时回填（离线可用、首屏快）
    e.respondWith(caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return res;
      }).catch(function () { return hit; });
    }));
  }
});
