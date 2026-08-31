// app.js — tab 路由 + 全局工具（扩展已存在的 window.App，不覆盖模块挂载）
(function (global) {
  'use strict';
  var App = global.App = global.App || {};
  App.currentView = 'checkin';
  App._toastTimer = null;
  App.toast = function (msg, action) {
    var t = document.getElementById('toast');
    var ob = t.querySelector('.toast-act'); if (ob) ob.remove();
    t.textContent = msg;
    if (action && action.label) {
      var a = document.createElement('button');
      a.className = 'toast-act';
      a.textContent = action.label;
      a.style.cssText = 'margin-left:10px;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.55);color:#fff;border-radius:9px;padding:3px 12px;font-size:13px;font-weight:600;cursor:pointer';
      a.onclick = function () {
        clearTimeout(App._toastTimer);
        if (action.fn) action.fn();
        App.hideToast();
      };
      t.appendChild(a);
    }
    t.classList.add('show');
    clearTimeout(App._toastTimer);
    App._toastTimer = setTimeout(function () { App.hideToast(); }, action && action.label ? 4200 : 1600);
  };
  App.hideToast = function () {
    var t = document.getElementById('toast'); if (t) t.classList.remove('show');
  };
  App.refreshModeBadge = function () {
    var s = Store.getSettings();
    var map = { keto: '生酮', lowcarb: '低碳', normal: '正常' };
    var el = document.getElementById('modeBadge');
    if (el) el.textContent = map[s.dietMode] || '生酮';
  };
  // 顶栏日期副标（UI 打磨：让首屏有"今天"感）
  App.injectTopbarDate = function () {
    var h1 = document.querySelector('.topbar h1');
    if (!h1 || h1.querySelector('.topbar-date')) return;
    var d = new Date();
    var weekdays = ['日','一','二','三','四','五','六'];
    var dateStr = (d.getMonth() + 1) + '月' + d.getDate() + '日 · 星期' + weekdays[d.getDay()];
    // 今日有打卡 → 脉冲点；否则无
    var m = Store.getMeals(Store.dateStr());
    var hasData = m && ((m.breakfast && m.breakfast.length) || (m.lunch && m.lunch.length) || (m.dinner && m.dinner.length) || (m.exercises && m.exercises.length));
    var dot = hasData ? '<span class="dot-pulse" aria-hidden="true"></span>' : '';
    var sub = document.createElement('span');
    sub.className = 'topbar-date';
    sub.innerHTML = dot + dateStr;
    h1.appendChild(sub);
  };
  // 路由 + 物理返回栈（P3：Android 系统返回键在 App 内逐级后退，不直接退出）
  App._stack = [];
  // 顶栏身份徽标（爸爸/妈妈/逸凡）——静态展示，不再每次切 tab 重复插入
  // 修复 P0：旧逻辑把 <select> 插到 h1 的 afterend（兄弟节点），但 guard 却查 h1 内部，
  // 导致每次切 tab 都重复插入、越积越多。新逻辑：固定唯一 #memberBadge，永不重复。
  App.injectMemberBadge = function () {
    var top = document.querySelector('.topbar-right') || document.querySelector('.topbar');
    if (!top) return;
    var badge = document.getElementById('memberBadge');
    if (!badge) {
      badge = document.createElement('span');
      badge.id = 'memberBadge';
      badge.className = 'member-badge';
      badge.setAttribute('role', 'button');
      badge.setAttribute('tabindex', '0');
      badge.setAttribute('aria-label', '点击切换身份');
      badge.style.cursor = 'pointer';
      badge.onclick = function () { if (App.openMemberSwitch) App.openMemberSwitch(); };
      // 加在 mode-badge 之后
      var mode = document.getElementById('modeBadge');
      if (mode && mode.parentNode) mode.parentNode.insertBefore(badge, mode.nextSibling);
      else top.appendChild(badge);
    }
    var mem = Store.getActiveMember();
    badge.textContent = mem ? mem.name : '我';
  };
  // 「我的」页 → 切换身份弹窗（一次性行为，正常不切换）
  App.openMemberSwitch = function () {
    var ms = Store.getMembers();
    var active = Store.getActiveMemberId();
    var html = '<h3 style="margin-top:0">👥 切换身份</h3>' +
      '<p style="font-size:12px;color:var(--muted);margin:0 0 10px">选择当前使用者，家庭成员数据各自独立保存。</p>' +
      '<div id="msList" style="display:flex;flex-direction:column;gap:8px">' +
      ms.map(function (m) {
        var on = m.id === active;
        return '<button type="button" class="member-opt ' + (on ? 'on' : '') + '" data-mid="' + m.id + '" style="text-align:left;padding:12px 14px;border-radius:12px;border:1px solid ' + (on ? 'var(--accent)' : '#ddd') + ';background:' + (on ? '#eafaf1' : '#fff') + ';font-size:15px;font-weight:' + (on ? '700' : '500') + ';cursor:pointer">' + m.name + (on ? ' ✓' : '') + '</button>';
      }).join('') + '</div>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    if (!modal) return;
    modal.querySelectorAll('.member-opt').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-mid');
        Store.setActiveMemberId(id);
        App.refreshModeBadge();
        App.injectMemberBadge();
        var v = App.currentView || 'checkin';
        var ce = document.getElementById('view-' + v);
        if (ce && App[v] && typeof App[v].onShow === 'function') App[v].onShow(ce);
        App.closeModal();
        var mem = Store.getActiveMember();
        App.toast('已切换到 ' + (mem ? mem.name : ''));
      });
    });
  };
  // 本机步数同步回调（Android 原生硬件计步 / Health Connect 读取后注入）
  window.__onSteps = function (steps) {
    try {
      steps = parseInt(steps, 10);
      if (!steps || steps <= 0) {
        var cur = (document.getElementById('steps') || {}).value;
        if (cur && parseInt(cur, 10) > 0) App.toast('未获取到手机步数，保留你填写的 ' + parseInt(cur, 10) + ' 步');
        else App.toast('未能读取手机步数，可点「📋 粘贴」手动填');
        return;
      }
      var inp = document.getElementById('steps');
      if (inp) {
        inp.value = steps;
        inp.dispatchEvent(new Event('change', { bubbles: true }));
      }
      // A类：步数自动转走路运动（与微信同口径，重复同步覆盖不堆条）
      if (App.checkin && typeof App.checkin.upsertWalking === 'function') App.checkin.upsertWalking(steps);
      App.toast('✓ 已同步 ' + steps + ' 步（已计入走路）');
      // 在步数输入框下方显示一次性的"来源"小 chip —— 看完一眼就够，不弹整 toast
      try {
        var chipId = 'steps-source-chip';
        if (!document.getElementById(chipId)) {
          var input = document.getElementById('steps');
          if (input && input.parentNode) {
            var chip = document.createElement('div');
            chip.id = chipId;
            chip.className = 'meta';
            chip.style.cssText = 'font-size:11px;color:var(--muted);margin-top:4px;display:inline-block;padding:2px 8px;background:#f5f5f7;border-radius:10px';
            chip.textContent = '📱 来源：手机传感器（非手表数据）';
            input.parentNode.appendChild(chip);
          }
        }
      } catch (e) {}
    } catch (e) {}
  };
  // 青少年（逸凡）激活时，成人页重定向到「成长的他」专属模块
  function kidGuard(view, el) {
    var m = Store.getActiveMember();
    if (m && m.role === 'kid' && ['checkin', 'records', 'trend', 'mine'].indexOf(view) >= 0) {
      el.innerHTML = '<div class="card" style="text-align:center;padding:22px">' +
        '<div style="font-size:34px;margin-bottom:8px">🏀</div>' +
        '<h3 style="margin:0 0 6px">逸凡的专属数据在这里</h3>' +
        '<p class="meta" style="font-size:13px;color:var(--muted);margin:0 0 14px">青少年模块含生长曲线、BMI百分位、运动营养计划，针对发育期定制。</p>' +
        '<button class="btn" id="goKids">查看「成长的他」</button>' +
        '<button class="btn ghost" id="switchFromKid" style="margin-top:8px">切换身份 / 回到大人</button></div>';
      var b = el.querySelector('#goKids');
      if (b) b.addEventListener('click', function () { if (App.kids) App.kids.showDashboard(); });
      // P0 修复：青少年卡片内也提供切换入口，避免四个主页被顶替后无回路切回成人
      var sb = el.querySelector('#switchFromKid');
      if (sb) sb.addEventListener('click', function () { if (App.openMemberSwitch) App.openMemberSwitch(); });
      return true;
    }
    return false;
  }

  function navigate(view) {
    // P0-审计：先把激活态切到位（即使后续步骤抛错，画面至少切到目标页）
    try {
      document.querySelectorAll('#tabbar button').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-view') === view);
      });
      document.querySelectorAll('.view').forEach(function (v) { v.classList.remove('active'); });
      var el0 = document.getElementById('view-' + view);
      if (el0) el0.classList.add('active');
    } catch (e) { console.warn('navigate: active class fail', e); }
    var el = document.getElementById('view-' + view);
    // 每一步独立 try，单步失败不影响后续；空容器最后兜底渲染一次
    try { App.refreshModeBadge(); } catch (e) { console.warn('refreshModeBadge', e); }
    try { App.injectTopbarDate(); } catch (e) { console.warn('injectTopbarDate', e); }
    try { App.injectMemberBadge(); } catch (e) { console.warn('injectMemberBadge', e); }
    var guarded = false;
    try { guarded = !!kidGuard(view, el); } catch (e) { console.warn('kidGuard', e); }
    if (guarded) { App.currentView = view; return; }
    var m = App[view];
    if (m && typeof m.onShow === 'function') {
      try {
        m.onShow(el);
      } catch (e) {
        // v2.2.2 根治：错误显式回显到视图（不再静默），用户肉眼可见 + 提供重试入口
        console.error(view + '.onShow failed:', e);
        try { showBootError(view, el, e); } catch (_) {}
        // 1.5s 后再试一次（给依赖项 async 初始化留时间）
        try {
          setTimeout(function () {
            try { m.onShow(el); console.log('retry onShow ok for ' + view); }
            catch (e2) { try { showBootError(view, el, e2, true); } catch (_) {} }
          }, 1500);
        } catch (_) {}
      }
    }
    App.currentView = view;
  }
  // v2.2.2：onShow 失败时在视图内显示错误详情 + 重试按钮
  function showBootError(view, el, err, isRetry) {
    if (!el) return;
    var retryBtn = '<button type="button" class="btn sm boot-retry" data-retry-view="' + view + '" style="margin-top:14px">重试</button>';
    var html = '<div class="boot-error">' +
      '<div class="boot-err-ico">⚠️</div>' +
      '<div class="boot-err-t">打卡页加载失败' + (isRetry ? '（已重试）' : '') + '</div>' +
      '<div class="boot-err-s">' + (err && err.message ? err.message : String(err || '未知错误')) + '</div>' +
      '<div class="boot-err-hint" style="font-size:12px;color:var(--muted);margin-top:6px">通常是依赖项（如 Bridge/Store）异步未就绪。直接点「重试」可恢复。</div>' +
      retryBtn + '</div>';
    // 只在视图仍空/是骨架时覆盖，避免覆盖已有内容
    el.innerHTML = html;
  }
  App.go = function (view, opts) {
    opts = opts || {};
    if (App.currentView && App.currentView !== view && !opts.silent) App._stack.push(App.currentView);
    if (App._stack.length > 20) App._stack.shift();
    if (opts.silent !== true && location.hash !== '#' + view) {
      try { history.pushState({ view: view }, '', '#' + view); } catch (e) {}
    }
    navigate(view);
  };
  window.addEventListener('popstate', function () {
    if (document.getElementById('app-modal')) { App.closeModal(); try { history.pushState({}, '', location.href); } catch (e) {} return; }
    var prev = App._stack.pop();
    if (prev) App.go(prev, { silent: true });
    else { try { history.pushState({}, '', location.href); } catch (e) {} }
  });

  // PWA 安装引导（P3 问题1：添加到主屏幕）
  function isIOS() { return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream; }
  var _deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); _deferredPrompt = e; App.showInstallBar();
  });
  window.addEventListener('appinstalled', function () {
    var bar = document.getElementById('installBar'); if (bar) bar.classList.remove('show');
  });
  App.showInstallBar = function () {
    var bar = document.getElementById('installBar'); if (!bar) return;
    var ios = bar.querySelector('.install-ios'), and = bar.querySelector('.install-android');
    if (isIOS()) { if (ios) ios.style.display = ''; if (and) and.style.display = 'none'; }
    else { if (ios) ios.style.display = 'none'; if (and) and.style.display = ''; }
    bar.classList.add('show');
  };
  App.installApp = function () {
    var bar = document.getElementById('installBar');
    if (_deferredPrompt) {
      _deferredPrompt.prompt();
      var p = _deferredPrompt.userChoice;
      if (p && p.then) p.then(function () { _deferredPrompt = null; if (bar) bar.classList.remove('show'); });
      else if (bar) bar.classList.remove('show');
    } else {
      if (bar) bar.classList.remove('show');
      App.openModal('<h3 style="margin-top:0">📲 安装到主屏幕</h3>' +
        '<p style="font-size:14px;line-height:1.9">iOS Safari 不支持自动安装，请：<br>① 点底部 <b>分享</b> 按钮（方框↑）<br>② 选 <b>“添加到主屏幕”</b><br>③ 点右上角 <b>添加</b><br>即可全屏离线使用。' +
        (isWeChat() ? '<br><br>⚠️ 当前在微信内打开，请先点右上角 <b>···</b> → <b>在浏览器打开</b>，再按上面步骤安装。' : '') + '</p>');
    }
  };
  App.dismissInstall = function () { var bar = document.getElementById('installBar'); if (bar) bar.classList.remove('show'); };
  function isWeChat() { return /micromessenger/i.test(navigator.userAgent); }

  // tab 切换
  var tabbar = document.getElementById('tabbar');
  if (tabbar) tabbar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    App.go(b.getAttribute('data-view'));
  });

  // SW 注册（防御式：非 https 或失败不影响使用）
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  // 键盘弹出时隐藏底部 tabbar（P0：input 焦点 / Android 系统键盘不挤压 UI）
  function _isFormFocus(t) {
    if (!t || !t.tagName) return false;
    var tag = t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (t.isContentEditable) return true;
    return false;
  }
  document.addEventListener('focusin', function (e) {
    if (_isFormFocus(e.target)) document.body.classList.add('kb-on');
  });
  document.addEventListener('focusout', function () {
    setTimeout(function () {
      var ae = document.activeElement;
      if (!_isFormFocus(ae)) document.body.classList.remove('kb-on');
    }, 80);
  });
  // visualViewport 兜底：某些系统 select 不触发 focus，但键盘被强制弹出
  if (window.visualViewport) {
    var _vvH = window.innerHeight;
    window.visualViewport.addEventListener('resize', function () {
      var kbShown = window.innerHeight - window.visualViewport.height > 100;
      if (kbShown) document.body.classList.add('kb-on');
      else if (!_isFormFocus(document.activeElement)) document.body.classList.remove('kb-on');
    });
  }

  // 通用弹窗：App.openModal(html) / 内容内调用 App.closeModal()
  // P2 升级：底部 sheet + 手柄条 + 安全区 + Esc 关闭 + 点遮罩关闭
  App.openModal = function (html) {
    var old = document.getElementById('app-modal');
    if (old) old.remove();
    var mask = document.createElement('div');
    mask.id = 'app-modal';
    mask.className = 'modal-mask';
    mask.innerHTML = '<div class="modal-sheet"><div class="sheet-grip" aria-hidden="true"></div>' +
      '<div style="text-align:right;margin-bottom:6px;"><button class="btn ghost sm" onclick="App.closeModal()">关闭</button></div>' + html + '</div>';
    mask.addEventListener('click', function (e) { if (e.target === mask) App.closeModal(); });
    document.getElementById('app').appendChild(mask);
    document.addEventListener('keydown', App._escClose);
  };
  App._escClose = function (e) { if (e.key === 'Escape') App.closeModal(); };
  App.closeModal = function () {
    var m = document.getElementById('app-modal'); if (m) m.remove();
    document.removeEventListener('keydown', App._escClose);
  };

  // 通用底部 sheet 单选 picker（替换所有原生态 <select>）
  // opts: { title, items:[{value,label,sub?,icon?}], value, searchable?, onPick(value,item) }
  App.openPicker = function (opts) {
    opts = opts || {};
    var items = (opts.items || []).map(function (it, i) {
      return { value: it.value !== undefined ? it.value : it.label, label: it.label, sub: it.sub || '', icon: it.icon || '', _i: i };
    });
    var cur = opts.value;
    var html = '<div class="picker">' +
      '<h3 class="picker-title">' + (opts.title || '请选择') + '</h3>' +
      (opts.searchable
        ? '<div class="picker-search"><span class="picker-search-ico">🔍</span><input id="pickerSearch" type="search" placeholder="' + (opts.searchPlaceholder || '搜索…') + '" autocomplete="off"></div>'
        : '') +
      '<div class="picker-list" id="pickerList">' +
      items.map(function (it) {
        var on = it.value === cur;
        return '<button type="button" class="picker-row' + (on ? ' on' : '') + '" data-i="' + it._i + '" data-v="' + String(it.value).replace(/"/g,'&quot;') + '">' +
          (it.icon ? '<span class="picker-row-ico">' + it.icon + '</span>' : '') +
          '<span class="picker-row-main"><b>' + it.label + '</b>' + (it.sub ? '<span class="picker-row-sub">' + it.sub + '</span>' : '') + '</span>' +
          '<span class="picker-row-mark" aria-hidden="true">' + (on ? '✓' : '') + '</span>' +
        '</button>';
      }).join('') +
      '</div>' +
      '<button type="button" class="btn ghost sm picker-cancel" id="pickerCancel" style="margin-top:10px">取消</button>' +
      '</div>';
    App.openModal(html);
    var modal = document.getElementById('app-modal');
    if (!modal) return;
    // 关闭
    var cancel = modal.querySelector('#pickerCancel');
    if (cancel) cancel.addEventListener('click', function () { App.closeModal(); });
    // 选择
    modal.querySelectorAll('.picker-row').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = +btn.getAttribute('data-i'); var v = btn.getAttribute('data-v');
        try { if (opts.onPick) opts.onPick(v, items[i]); } catch (e) { console.warn('picker onPick', e); }
        App.closeModal();
      });
    });
    // 搜索过滤
    var search = modal.querySelector('#pickerSearch');
    if (search) {
      search.addEventListener('input', function () {
        var q = (search.value || '').trim().toLowerCase();
        modal.querySelectorAll('.picker-row').forEach(function (b) {
          var i = +b.getAttribute('data-i'); var t = (items[i].label + ' ' + items[i].sub).toLowerCase();
          b.style.display = (!q || t.indexOf(q) >= 0) ? '' : 'none';
        });
      });
      setTimeout(function () { try { search.focus(); } catch (e) {} }, 60);
    }
  };

  // 通用底部 sheet 日期 picker（替换 <input type="date">）
  // opts: { title?, value(YYYY-MM-DD)?, min?, max?, onPick(dateStr) }
  App.openDatePicker = function (opts) {
    opts = opts || {};
    var today = Store.dateStr ? Store.dateStr() : (function () {
      var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    })();
    var parts = (opts.value || today).split('-');
    var selY = parseInt(parts[0], 10) || new Date().getFullYear();
    var selM = parseInt(parts[1], 10) || (new Date().getMonth() + 1);
    var selD = parseInt(parts[2], 10) || new Date().getDate();
    var curVal = opts.value || today;

    function pad(n) { return String(n).padStart(2, '0'); }
    function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }
    function isDisabled(y, m, d) {
      var iso = y + '-' + pad(m) + '-' + pad(d);
      if (opts.min && iso < opts.min) return true;
      if (opts.max && iso > opts.max) return true;
      return false;
    }

    function buildHtml(y, m) {
      var first = new Date(y, m - 1, 1);
      var firstDow = first.getDay(); // 0=周日
      var total = daysInMonth(y, m);
      var prevTotal = daysInMonth(y, m - 1);
      // 上月尾部占位
      var cells = '';
      for (var i = 0; i < firstDow; i++) {
        var d = prevTotal - firstDow + 1 + i;
        cells += '<button type="button" class="dp-cell muted" disabled data-d="' + d + '">' + d + '</button>';
      }
      for (var d = 1; d <= total; d++) {
        var iso = y + '-' + pad(m) + '-' + pad(d);
        var on = iso === curVal;
        var isToday = iso === today;
        var dis = isDisabled(y, m, d);
        cells += '<button type="button" class="dp-cell' + (on ? ' on' : '') + (isToday ? ' today' : '') + (dis ? ' disabled' : '') + '" data-iso="' + iso + '"' + (dis ? ' disabled' : '') + '>' + d + '</button>';
      }
      // 下月头部补齐 7 的倍数
      var used = firstDow + total;
      var tail = (7 - (used % 7)) % 7;
      for (var j = 1; j <= tail; j++) cells += '<button type="button" class="dp-cell muted" disabled>' + j + '</button>';

      return '<div class="picker">' +
        '<h3 class="picker-title">' + (opts.title || '选择日期') + '</h3>' +
        '<div class="dp-head">' +
          '<button type="button" class="dp-nav" id="dpPrev" aria-label="上个月">‹</button>' +
          '<div class="dp-ym">' + y + ' 年 ' + pad(m) + ' 月</div>' +
          '<button type="button" class="dp-nav" id="dpNext" aria-label="下个月">›</button>' +
        '</div>' +
        '<div class="dp-week"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div>' +
        '<div class="dp-grid" id="dpGrid">' + cells + '</div>' +
        '<div class="dp-foot">' +
          '<button type="button" class="btn ghost sm" id="dpToday" style="margin:0">今天</button>' +
          '<button type="button" class="btn ghost sm picker-cancel" id="pickerCancel" style="margin:0">取消</button>' +
        '</div>' +
      '</div>';
    }

    function show(y, m) {
      var html = buildHtml(y, m);
      App.openModal(html);
      var modal = document.getElementById('app-modal'); if (!modal) return;
      var prev = modal.querySelector('#dpPrev');
      var next = modal.querySelector('#dpNext');
      var today = modal.querySelector('#dpToday');
      var cancel = modal.querySelector('#pickerCancel');
      prev.addEventListener('click', function () { var ny = (m === 1 ? y - 1 : y); var nm = (m === 1 ? 12 : m - 1); selY = ny; selM = nm; show(ny, nm); });
      next.addEventListener('click', function () { var ny = (m === 12 ? y + 1 : y); var nm = (m === 12 ? 1 : m + 1); selY = ny; selM = nm; show(ny, nm); });
      today.addEventListener('click', function () {
        try { if (opts.onPick) opts.onPick(Store.dateStr ? Store.dateStr() : today); } catch (e) {}
        App.closeModal();
      });
      cancel.addEventListener('click', function () { App.closeModal(); });
      modal.querySelectorAll('.dp-cell:not(.muted):not(.disabled)').forEach(function (c) {
        c.addEventListener('click', function () {
          var iso = c.getAttribute('data-iso'); if (!iso) return;
          try { if (opts.onPick) opts.onPick(iso); } catch (e) { console.warn('datepicker onPick', e); }
          App.closeModal();
        });
      });
    }
    show(selY, selM);
  };

  function start() {
    // 家庭成员体系初始化（首启动把老用户数据迁移为「爸爸」）
    try { Store.initMembers(); } catch (e) { console.warn('成员初始化失败', e); }
    // 数据模型统一：从 task4 旧 key 一次性迁移（已迁移/无旧数据则跳过）
    try { var mr = Store.migrateFromLegacy(); if (mr && mr.migrated) App.toast('已导入历史数据 ' + mr.days + ' 天'); }
    catch (e) { console.warn('迁移旧数据失败（不影响使用）', e); }
    // 家人端云同步：配置了 env 才尝试初始化（失败自动降级本地，不影响主流程）
    if (global.CloudSync && CloudSync.isConfigured()) {
      CloudSync.init().catch(function (e) { console.warn('云同步初始化失败（降级本地）', e); });
    }
    // 安装横幅按钮（在 #app 外，单独委托）
    var ib = document.getElementById('installBar');
    if (ib) ib.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      if (b.getAttribute('data-act') === 'install-go') App.installApp();
      else if (b.getAttribute('data-act') === 'install-x') App.dismissInstall();
    });

    // v2.2.2 根治：首屏打卡页 = 显式委托「重试」按钮（用户可手动恢复）
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-retry-view]');
      if (!b) return;
      var v = b.getAttribute('data-retry-view');
      var el = document.getElementById('view-' + v);
      if (!el) return;
      // 还原 boot-skeleton
      el.innerHTML = '<div class="boot-skeleton"><div class="boot-spin"></div>' +
        '<div class="boot-msg">重新加载中…</div></div>';
      setTimeout(function () { try { navigate(v); } catch (err) { showBootError(v, el, err); } }, 50);
    });

    // 启动首屏
    App.go('checkin');

    // v2.2.2 根治：3 次递增兜底（500ms / 1500ms / 3s），覆盖不同依赖就绪时机
    var retryDelays = [500, 1500, 3000];
    retryDelays.forEach(function (d) {
      setTimeout(function () {
        try {
          var v = App.currentView || 'checkin';
          var el2 = document.getElementById('view-' + v);
          if (el2 && (!el2.innerHTML.trim() || el2.querySelector('.boot-skeleton, .boot-error'))
              && App[v] && typeof App[v].onShow === 'function') {
            App[v].onShow(el2);
            console.log('safety re-rendered view-' + v + ' at +' + d + 'ms');
          }
        } catch (e) { console.warn('safetyRender +' + d + 'ms', e); }
      }, d);
    });
  }
  // v2.2.3 终极兜底：load 事件后若首屏仍是 boot-skeleton，强制再调一次 onShow。
  // 覆盖"start() 跑过但 onShow 因任何原因被静默吞掉"的所有场景（GitHub Pages https 环境下曾复现）。
  window.addEventListener('load', function () {
    setTimeout(function () {
      try {
        var v = (global.App && App.currentView) || 'checkin';
        var el = document.getElementById('view-' + v);
        if (el && el.querySelector('.boot-skeleton') && global.App && global.App[v] && typeof global.App[v].onShow === 'function') {
          global.App[v].onShow(el);
          console.log('[v2.2.3 backup] 强制重渲 view-' + v);
        }
      } catch (e) { console.warn('[v2.2.3 backup] onShow 失败', e); }
    }, 400);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})(window);
