// cloudbase.js — 云同步集成层（家人端基础）
// 设计原则：默认零影响。未配置 ENV_ID 或未显式 init() 时，全部方法降级为 localStorage，
// 现有 APP 行为完全不变。只有启用家人端（init 被调用）才会懒加载本地 SDK。
(function (global) {
  'use strict';

  // ============ 配置区（你创建 CloudBase 环境后改这里） ============
  // 在腾讯云 CloudBase 控制台创建免费体验环境后，把环境 ID 填进来即可启用家人端。
  var ENV_ID = 'ketoapp20206-d2gxkja9h6324aa47'; // 2026-07-30 创建的免费体验版环境（上海，包年包月，到期 2027-01-30）
  // 本地 SDK 路径（已随项目打包，纯本地、无 CDN 依赖）
  var SDK_PATH = 'js/lib/cloudbase.full.js';
  var COLL = 'keto_family'; // 家人数据共享集合
  // ===============================================================

  var _app = null, _db = null, _uid = null, _ready = null;
  var available = false; // 是否已成功连接云端

  // v1.9：APK 本地打包（file://）时直接禁用云同步，全部走 localStorage。
  // 避免无谓的 SDK 加载与跨域请求失败，启动更快、日志更干净。
  var IS_LOCAL_PKG = (typeof location !== 'undefined') &&
    (location.protocol === 'file:' || location.protocol === 'content:');

  function lsKey(code) { return 'keto_cloud_' + code; }

  // 懒加载本地 SDK（仅首次 init 时触发，且 ENV_ID 非空才触发）
  function loadSdk() {
    return new Promise(function (resolve, reject) {
      if (global.cloudbase) return resolve(global.cloudbase);
      var s = document.createElement('script');
      s.src = SDK_PATH;
      s.onload = function () { global.cloudbase ? resolve(global.cloudbase) : reject(new Error('SDK 加载后未暴露 cloudbase')); };
      s.onerror = function () { reject(new Error('本地 SDK 加载失败: ' + SDK_PATH)); };
      document.head.appendChild(s);
    });
  }

  // 初始化（异步）。无 ENV_ID 时直接标记不可用并 resolve(false)。
  function init() {
    if (_ready) return _ready;
    _ready = new Promise(function (resolve) {
      if (IS_LOCAL_PKG) {
        available = false;
        console.log('[CloudSync] 本地离线包（file://），云同步已禁用，数据存本机');
        return resolve(false);
      }
      if (!ENV_ID) { available = false; return resolve(false); }
      loadSdk().then(function (cloudbase) {
        return cloudbase.init({ env: ENV_ID }).then(function (app) {
          _app = app;
          _db = app.database();
          return app.auth({ persistence: 'local' }).signInAnonymously();
        }).then(function (user) {
          _uid = user && user.uid ? user.uid : null;
          available = true;
          console.log('[CloudSync] 已连接云端，uid=' + _uid);
          resolve(true);
        });
      }).catch(function (e) {
        available = false;
        console.warn('[CloudSync] 初始化失败，降级为本地存储：', e.message);
        resolve(false);
      });
    });
    return _ready;
  }

  function doc(code) {
    if (!_db) throw new Error('CloudSync 未初始化');
    return _db.collection(COLL).doc(code);
  }

  // 推送家人共享快照（覆盖写）
  function pushSnapshot(code, data) {
    var payload = Object.assign({}, data, { updatedAt: Date.now(), _uid: _uid });
    if (!available) {
      try { localStorage.setItem(lsKey(code), JSON.stringify(payload)); } catch (e) {}
      return Promise.resolve({ local: true });
    }
    return doc(code).set(payload).then(function () { return { cloud: true }; })
      .catch(function (e) { console.warn('[CloudSync] push 失败', e); return { cloud: false, err: e.message }; });
  }

  // 拉取家人共享快照
  function pullSnapshot(code) {
    if (!available) {
      try { var raw = localStorage.getItem(lsKey(code)); return Promise.resolve(raw ? JSON.parse(raw) : null); }
      catch (e) { return Promise.resolve(null); }
    }
    return doc(code).get().then(function (res) {
      return (res && res.data && res.data[0]) || null;
    }).catch(function (e) { console.warn('[CloudSync] pull 失败', e); return null; });
  }

  // 本地设备标识（降级模式/未登录时区分成员，持久）
  function deviceId() {
    var k = 'keto_device_id';
    var id = global.localStorage.getItem(k);
    if (!id) { id = 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); global.localStorage.setItem(k, id); }
    return id;
  }

  // 统一读写家庭组文档（云优先，降级 localStorage 同结构）
  function readFamilyDoc(code) {
    if (!available) {
      try { var raw = global.localStorage.getItem(lsKey(code)); return Promise.resolve(raw ? JSON.parse(raw) : null); }
      catch (e) { return Promise.resolve(null); }
    }
    return doc(code).get().then(function (res) { return (res && res.data && res.data[0]) || null; })
      .catch(function () { return null; });
  }
  function writeFamilyDoc(code, data) {
    var payload = Object.assign({}, data, { updatedAt: Date.now() });
    if (!available) {
      try { global.localStorage.setItem(lsKey(code), JSON.stringify(payload)); } catch (e) {}
      return Promise.resolve({ local: true });
    }
    return doc(code).set(payload).then(function () { return { cloud: true }; })
      .catch(function (e) { console.warn('[CloudSync] 写入家庭组失败', e); return { cloud: false }; });
  }

  // 创建家庭组（以 code 为文档 ID，多成员结构 members{ uid: {name,joinedAt,lastSync,snapshot} }）
  function createFamily(code, myName) {
    return init().then(function () {
      var uid = _uid || deviceId();
      var data = { code: code, owner: myName || '我', ownerUid: uid, createdAt: Date.now(), members: {} };
      data.members[uid] = { name: myName || '我', joinedAt: Date.now(), lastSync: Date.now(), snapshot: null };
      return writeFamilyDoc(code, data).then(function () { return { ok: true, code: code, uid: uid }; });
    });
  }

  // 加入已有家庭组（码不存在则 reject）
  function joinFamily(code, myName) {
    return init().then(function () {
      return readFamilyDoc(code).then(function (docData) {
        if (!docData || !docData.code) return Promise.reject(new Error('家庭码不存在，请确认后重试'));
        var uid = _uid || deviceId();
        docData.members = docData.members || {};
        if (!docData.members[uid]) docData.members[uid] = {};
        docData.members[uid].name = myName || '我';
        docData.members[uid].joinedAt = docData.members[uid].joinedAt || Date.now();
        docData.members[uid].lastSync = Date.now();
        return writeFamilyDoc(code, docData).then(function () { return { ok: true, code: code, uid: uid, isOwner: docData.ownerUid === uid }; });
      });
    });
  }

  // 同步我的快照到家庭组
  function syncMyData(code, uid, myName, snapshot) {
    return init().then(function () {
      return readFamilyDoc(code).then(function (docData) {
        if (!docData || !docData.code) return Promise.reject(new Error('家庭组不存在'));
        docData.members = docData.members || {};
        var me = docData.members[uid] || {};
        me.name = myName || me.name || '我';
        me.joinedAt = me.joinedAt || Date.now();
        me.lastSync = Date.now();
        me.snapshot = snapshot || null;
        docData.members[uid] = me;
        return writeFamilyDoc(code, docData).then(function () { return { ok: true }; });
      });
    });
  }

  // 拉取全家（含各成员最新快照）
  function getFamily(code) {
    return init().then(function () { return readFamilyDoc(code); });
  }

  // 退出家庭组（移除自己）
  function leaveFamily(code, uid) {
    return init().then(function () {
      return readFamilyDoc(code).then(function (docData) {
        if (docData && docData.members && docData.members[uid]) delete docData.members[uid];
        return writeFamilyDoc(code, docData).then(function () { return { ok: true }; });
      });
    });
  }

  global.CloudSync = {
    init: init,
    pushSnapshot: pushSnapshot,
    pullSnapshot: pullSnapshot,
    createFamily: createFamily,
    joinFamily: joinFamily,
    syncMyData: syncMyData,
    getFamily: getFamily,
    leaveFamily: leaveFamily,
    get available() { return available; },
    get uid() { return _uid || deviceId(); },
    get envId() { return ENV_ID; },
    isConfigured: function () { return !!ENV_ID; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
