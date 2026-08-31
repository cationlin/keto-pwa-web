// cloud-sync.js — 家人互通云同步（Supabase，走原生 JSBridge 绕开 CORS）
//
// 为什么走原生而不是 JS 直连：
//   网页打包进 APK 后是 file:// 协议，JS 发跨域请求会被同源策略拦截。
//   原生层（Kotlin HttpURLConnection）发 HTTPS 不受 CORS 限制。
//
// 原生接口：KetoNative.configSupabase / isCloudConfigured / cloudPull /
//           cloudPushWeight / cloudPushMeal / cloudPushSteps / cloudUpsertMember
// 原生回调：window.onCloudPull(data) / window.onCloudPush(ok)
(function (global) {
  'use strict';

  var CloudSync = {
    _pullCb: null,
    _pushCb: null,
    _bound: false,

    // 是否在原生 APK 中
    available: function () {
      return !!(global.KetoNative && global.KetoNative.cloudPull);
    },

    // 是否已配置 Supabase
    configured: function () {
      return this.available() && global.KetoNative.isCloudConfigured();
    },

    // 配置（首次使用时调用一次，配置存 SharedPreferences 持久化）
    configure: function (url, anonKey, groupCode) {
      if (!this.available()) return false;
      global.KetoNative.configSupabase(url, anonKey, groupCode || 'default');
      return true;
    },

    // 首次引导配置：未配置时逐项询问，配完存原生，之后不再问
    // cb(ok)  ok=true 表示已可用
    ensureConfig: function (cb) {
      var self = this;
      if (!this.available()) { cb && cb(false, 'not_native'); return; }
      if (this.configured()) { cb && cb(true); return; }

      var url = global.prompt(
        '开启家人互通\n\n第 1/3 步：粘贴 Supabase Project URL\n（形如 https://abcdefgh.supabase.co）'
      );
      if (!url) { cb && cb(false, 'cancelled'); return; }

      var key = global.prompt('第 2/3 步：粘贴 anon public key（很长的一串）');
      if (!key) { cb && cb(false, 'cancelled'); return; }

      var group = global.prompt(
        '第 3/3 步：家庭组代号\n\n家人之间必须用同一个代号才能互通，\n建议用自己的姓拼音，例如 lin',
        'lin'
      ) || 'lin';

      url = url.trim().replace(/\/+$/, '');
      key = key.trim();
      group = group.trim();

      this.configure(url, key, group);
      cb && cb(this.configured());
    },

    // 拉取全量家庭数据
    // cb(err, data)  data = {members:[], weights:[], meals:[], steps:[]}
    pull: function (cb) {
      if (!this.configured()) { cb && cb('not_configured', null); return; }
      this._bind();
      this._pullCb = cb;
      global.KetoNative.cloudPull();
    },

    // 上传体重/体脂（阿福秤结果直接落这里）
    pushWeight: function (rec, cb) {
      if (!this.configured()) { cb && cb('not_configured', false); return; }
      this._bind();
      this._pushCb = cb;
      global.KetoNative.cloudPushWeight(JSON.stringify(rec));
    },

    // 上传饮食
    pushMeal: function (rec, cb) {
      if (!this.configured()) { cb && cb('not_configured', false); return; }
      this._bind();
      this._pushCb = cb;
      global.KetoNative.cloudPushMeal(JSON.stringify(rec));
    },

    // 上传步数（按 member+date 覆盖）
    pushSteps: function (memberId, date, steps, cb) {
      if (!this.configured()) { cb && cb('not_configured', false); return; }
      this._bind();
      this._pushCb = cb;
      global.KetoNative.cloudPushSteps(memberId, date, steps);
    },

    // 注册/更新成员
    upsertMember: function (member, cb) {
      if (!this.configured()) { cb && cb('not_configured', false); return; }
      this._bind();
      this._pushCb = cb;
      global.KetoNative.cloudUpsertMember(JSON.stringify(member));
    },

    _bind: function () {
      if (this._bound) return;
      this._bound = true;
      var self = this;

      global.onCloudPull = function (data) {
        var cb = self._pullCb;
        self._pullCb = null;
        if (!cb) return;
        if (data === null || data === undefined) cb('network_error', null);
        else cb(null, data);
      };

      global.onCloudPush = function (ok) {
        var cb = self._pushCb;
        self._pushCb = null;
        if (!cb) return;
        if (ok) cb(null, true);
        else cb('push_failed', false);
      };
    }
  };

  global.CloudSync = CloudSync;
})(window);
