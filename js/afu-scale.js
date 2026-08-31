// afu-scale.js — 阿福体脂秤 BLE 直连（走原生 JSBridge）
// 设备：蚂蚁阿福 × 沃莱 AFU-WL-TZ-A1 / FG2508WB
// 原生桥接：KetoNative.scanAfuScale / connectAfuScale / setAfuProfile
// 原生回调：window.onAfuScan / onAfuConnecting / onAfuConnected /
//           onAfuWeight / onAfuResult / onAfuError / onAfuDisconnected
(function (global) {
  'use strict';

  var AfuScale = {
    _cb: {},          // 一次性回调集合
    _listening: false,

    // 是否运行在原生 APK 中
    available: function () {
      return !!(global.KetoNative && global.KetoNative.scanAfuScale);
    },

    // 设置用户档案（BIA 计算体成分必需）
    // sex: 1=男 2=女
    setProfile: function (sex, age, heightCm) {
      if (!this.available()) return false;
      global.KetoNative.setAfuProfile(sex, age, heightCm);
      return true;
    },

    // 扫描附近的阿福体脂秤
    // cb(err, devices)  devices = [{name, address}]
    scan: function (cb) {
      if (!this.available()) { cb && cb('not_native', []); return; }
      this._ensureListening();

      var self = this;
      this._cb.scan = cb;
      // 原生扫描 10 秒，期间每发现一台就回调一次
      global.KetoNative.scanAfuScale('window.__afuScanCb');

      // 10.5 秒后若没结果，报超时
      setTimeout(function () {
        if (self._cb.scan) {
          var f = self._cb.scan;
          self._cb.scan = null;
          f(null, self._lastDevices || []);
        }
      }, 10500);
    },

    // 连接指定设备
    connect: function (address, opts) {
      if (!this.available()) { return false; }
      this._ensureListening();
      this._cb.weight = opts && opts.onWeight;
      this._cb.result = opts && opts.onResult;
      this._cb.error = opts && opts.onError;
      global.KetoNative.connectAfuScale(address);
      return true;
    },

    disconnect: function () {
      if (this.available()) global.KetoNative.disconnectAfuScale();
    },

    // 绑定 window.onAfu* 回调（原生通过 evaluateJavascript 触发）
    _ensureListening: function () {
      if (this._listening) return;
      this._listening = true;
      var self = this;

      global.__afuScanCb = function (devices, err) {
        self._lastDevices = devices || [];
        if (err) { if (self._cb.scan) { self._cb.scan(err, []); self._cb.scan = null; } return; }
      };

      global.onAfuConnecting = function () { self._fire('connecting'); };
      global.onAfuConnected = function () { self._fire('connected'); };

      global.onAfuWeight = function (kg, locked) {
        if (self._cb.weight) self._cb.weight(kg, locked);
      };

      global.onAfuResult = function (r) {
        if (self._cb.result) self._cb.result(null, r);
      };

      global.onAfuError = function (msg) {
        if (self._cb.error) self._cb.error(msg);
      };

      global.onAfuDisconnected = function () { self._fire('disconnected'); };
    },

    _fire: function (evt) {
      var f = this._cb[evt];
      if (f) f();
    }
  };

  global.AfuScale = AfuScale;
})(window);
