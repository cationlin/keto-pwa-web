// family.js — 家人端 UI（创建/加入/看板/退出 + 打卡自动同步）
// 依赖：Store（本机数据）、CloudSync（云同步层）、App（弹窗/toast/路由）
// 数据模型：每个家庭码一个文档 keto_family/<code>，members{ uid:{name,joinedAt,lastSync,snapshot} }
// 未接入云端时自动降级为 localStorage（单机可跑完整流程），联网后无感切换云。
(function (global) {
  'use strict';

  var SELF_KEY = 'keto_family_self';

  function getSelf() {
    try { return JSON.parse(global.localStorage.getItem(SELF_KEY) || 'null'); } catch (e) { return null; }
  }
  function setSelf(s) {
    try { if (s) global.localStorage.setItem(SELF_KEY, JSON.stringify(s)); else global.localStorage.removeItem(SELF_KEY); } catch (e) {}
  }
  function hasJoined() { var s = getSelf(); return !!(s && s.code); }
  function genCode() {
    var cs = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var r = ''; for (var i = 0; i < 6; i++) r += cs[Math.floor(Math.random() * cs.length)];
    return r;
  }

  // 从本机数据构建"我的今日快照"，供家人看板展示
  function buildSnapshot() {
    var m = Store.getMeals(Store.dateStr()) || {};
    var ws = Store.getWeights();
    var w = ws.length ? ws[ws.length - 1].weight : null;
    var foods = (m.breakfast || []).concat(m.lunch || []).concat(m.dinner || []);
    var exCal = (m.exercises || []).reduce(function (a, e) { return a + (e.cal || 0); }, 0);
    var totCal = foods.reduce(function (a, f) { return a + (f.calories || 0); }, 0);
    return {
      date: Store.dateStr(),
      mealsDone: {
        breakfast: (m.breakfast || []).length > 0,
        lunch: (m.lunch || []).length > 0,
        dinner: (m.dinner || []).length > 0
      },
      totalCal: Math.round(totCal),
      exCount: (m.exercises || []).length,
      steps: m.steps || 0,
      exCal: Math.round(exCal),
      weight: (w != null ? w : null)
    };
  }

  function cardHtml() {
    var s = getSelf();
    if (!s || !s.code) {
      return '<div class="card"><h3>👨‍👩‍👧 家人共享</h3>' +
        '<p class="meta" style="font-size:12px;color:var(--muted)">创建一个家庭共享码，邀请家人一起打卡，互相查看每日饮食与体重趋势。</p>' +
        '<div class="row" style="margin-top:8px"><button class="btn" data-fam="create">' + ICONS.svg('plus', 14) + ' 创建家庭组</button>' +
        '<button class="btn ghost" data-fam="join">' + ICONS.svg('home', 14) + ' 加入家庭组</button></div></div>';
    }
    return '<div class="card"><h3>👨‍👩‍👧 家人共享 <span class="sub">' + s.code + '</span></h3>' +
      '<p class="meta" style="font-size:12px;color:var(--muted)">我的昵称：' + (s.name || '我') + ' · 已加入家庭组</p>' +
      '<div class="row" style="margin-top:8px"><button class="btn" data-fam="board">' + ICONS.svg('barChart', 14) + ' 查看家庭看板</button>' +
      '<button class="btn ghost" data-fam="rename">' + ICONS.svg('edit', 14) + ' 改昵称</button>' +
      '<button class="btn ghost" data-fam="leave">' + ICONS.svg('close', 14) + ' 退出</button></div></div>';
  }

  // 由 d-mine 在「我的」页渲染家人卡
  function render(el) {
    var slot = el.querySelector('#familyCard');
    if (slot) slot.innerHTML = cardHtml();
  }

  var _syncing = null;
  function syncIfJoined() {
    var s = getSelf();
    if (!s || !s.code) return Promise.resolve(null);
    if (_syncing) return _syncing;
    var snap = buildSnapshot();
    _syncing = CloudSync.syncMyData(s.code, s.uid, s.name, snap).then(function () {
      _syncing = null; return true;
    }).catch(function (e) { _syncing = null; console.warn('[Family] 同步失败', e); return false; });
    return _syncing;
  }

  // ---- 弹窗流程 ----
  function showCreate() {
    var html = '<h3 style="margin-top:0">创建家庭组</h3>' +
      '<label>我的昵称</label><input id="famName" placeholder="如 爸爸 / 妈妈 / 我" value="我">' +
      '<p class="meta" style="font-size:12px;color:var(--muted);margin:8px 0 0">创建后生成一个 6 位家庭码，发给家人即可加入。家庭码可在此页「👨‍👩‍👧 家人共享」卡片处随时查看。</p>' +
      '<button class="btn" id="famCreateGo" style="margin-top:12px">生成家庭码</button>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    modal.querySelector('#famCreateGo').addEventListener('click', function () {
      var name = (modal.querySelector('#famName').value || '').trim() || '我';
      var code = genCode();
      App.closeModal();
      App.toast('正在创建…');
      CloudSync.createFamily(code, name).then(function (r) {
        setSelf({ code: code, name: name, uid: r.uid });
        syncIfJoined();
        App.toast('家庭组已创建，家庭码：' + code);
        App.go('mine');
      }).catch(function (e) { App.toast('创建失败：' + e.message); });
    });
  }

  function showJoin() {
    var html = '<h3 style="margin-top:0">加入家庭组</h3>' +
      '<label>家庭码（6 位）</label><input id="famCode" placeholder="请输入家人分享的 6 位码" style="text-transform:uppercase" maxlength="6">' +
      '<label style="margin-top:8px">我的昵称</label><input id="famName" placeholder="如 儿子 / 女儿" value="我">' +
      '<button class="btn" id="famJoinGo" style="margin-top:12px">加入</button>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    modal.querySelector('#famJoinGo').addEventListener('click', function () {
      var code = (modal.querySelector('#famCode').value || '').trim().toUpperCase();
      var name = (modal.querySelector('#famName').value || '').trim() || '我';
      if (!/^[A-Z0-9]{6}$/.test(code)) { App.toast('家庭码格式不对（6 位字母或数字）'); return; }
      App.closeModal();
      App.toast('正在加入…');
      CloudSync.joinFamily(code, name).then(function (r) {
        setSelf({ code: code, name: name, uid: r.uid });
        syncIfJoined();
        App.toast('已加入家庭组 ' + code);
        App.go('mine');
      }).catch(function (e) { App.toast('加入失败：' + e.message); });
    });
  }

  function showRename() {
    var s = getSelf();
    var html = '<h3 style="margin-top:0">修改昵称</h3>' +
      '<label>新昵称</label><input id="famName" value="' + (s ? s.name : '我') + '">' +
      '<button class="btn" id="famRenameGo" style="margin-top:12px">保存</button>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    modal.querySelector('#famRenameGo').addEventListener('click', function () {
      var name = (modal.querySelector('#famName').value || '').trim() || '我';
      if (s) { s.name = name; setSelf(s); }
      App.closeModal();
      syncIfJoined();
      App.toast('昵称已更新');
      App.go('mine');
    });
  }

  function showLeave() {
    var s = getSelf();
    if (!s) return;
    if (!global.confirm('确定退出家庭组「' + s.code + '」？你的数据将从家庭看板移除。')) return;
    App.toast('正在退出…');
    CloudSync.leaveFamily(s.code, s.uid).then(function () {
      setSelf(null);
      App.toast('已退出家庭组');
      App.go('mine');
    }).catch(function (e) { App.toast('退出失败：' + e.message); });
  }

  function showBoard() {
    var s = getSelf();
    if (!s) return;
    App.toast('正在加载家庭看板…');
    CloudSync.getFamily(s.code).then(function (docData) {
      if (!docData || !docData.members) { App.toast('暂无家庭成员数据'); return; }
      var members = docData.members;
      var keys = Object.keys(members);
      var cards = keys.map(function (uid) {
        var mem = members[uid];
        var sn = mem.snapshot || {};
        var md = sn.mealsDone || {};
        var tick = function (b) { return b ? '✅' : '⬜'; };
        var lastSync = mem.lastSync
          ? new Date(mem.lastSync).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          : '—';
        var isMe = (uid === s.uid);
        return '<div style="border:1px solid #eee;border-radius:12px;padding:10px;margin-bottom:10px">' +
          '<div style="display:flex;justify-content:space-between;align-items:center"><strong>' + mem.name + (isMe ? '（我）' : '') + '</strong>' +
          '<span class="meta" style="font-size:11px;color:var(--muted)">同步 ' + lastSync + '</span></div>' +
          '<div style="font-size:13px;margin-top:6px;line-height:1.8">' +
          tick(md.breakfast) + ' 早 ' + tick(md.lunch) + ' 午 ' + tick(md.dinner) + ' 晚<br>' +
          '今日热量 <b>' + (sn.totalCal != null ? sn.totalCal : '—') + '</b> kcal · 运动 ' + (sn.exCount != null ? sn.exCount : '—') + ' 项 · 步数 ' + (sn.steps != null ? sn.steps : '—') + '<br>' +
          '体重 <b>' + (sn.weight != null ? sn.weight + ' kg' : '—') + '</b></div></div>';
      }).join('');
      var html = '<h3 style="margin-top:0">家庭看板 · ' + s.code + '</h3>' +
        '<p class="meta" style="font-size:12px;color:var(--muted)">共 ' + keys.length + ' 位家庭成员</p>' +
        cards +
        '<button class="btn ghost sm" id="famBoardRefresh" style="margin-top:4px">刷新</button>';
      App.openModal(html);
      var modal = document.getElementById('app-modal');
      var rf = modal && modal.querySelector('#famBoardRefresh');
      if (rf) rf.addEventListener('click', showBoard);
    }).catch(function (e) { App.toast('加载失败：' + e.message); });
  }

  function bind(el) {
    if (el._fBound) return; el._fBound = true;
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fam]'); if (!b) return;
      var act = b.getAttribute('data-fam');
      if (act === 'create') showCreate();
      else if (act === 'join') showJoin();
      else if (act === 'board') showBoard();
      else if (act === 'rename') showRename();
      else if (act === 'leave') showLeave();
    });
  }

  global.App.family = {
    render: render,
    bind: bind,
    syncIfJoined: syncIfJoined,
    hasJoined: hasJoined
  };
})(window);
