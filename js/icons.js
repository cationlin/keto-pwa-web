/* keto-pwa icon 系统 v1
 * 规则：
 *   - 单线条 SVG，viewBox 0 0 24 24
 *   - stroke=currentColor（跟父元素 color）
 *   - stroke-width=2 / linecap=round / linejoin=round / fill=none
 *   - 默认 20px（紧凑），按钮内 18px，FAB 28px
 *   - 必须有 aria-hidden="true"（装饰语义）
 *   - 零 CDN、零字体依赖、零网络
 *
 * 用法：Icons.svg('trash', 18)  →  '<svg ...></svg>'
 */
(function (global) {
  var BASE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="{S}" height="{S}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';

  var PATHS = {
    // 通用
    close:           '<path d="M18 6L6 18M6 6l12 12"/>',
    chevronLeft:     '<path d="M15 18l-6-6 6-6"/>',
    chevronRight:    '<path d="M9 18l6-6-6-6"/>',
    chevronUp:       '<path d="M18 15l-6-6-6 6"/>',
    chevronDown:     '<path d="M6 9l6 6 6-6"/>',
    plus:            '<path d="M12 5v14M5 12h14"/>',
    minus:           '<path d="M5 12h14"/>',
    check:           '<path d="M20 6L9 17l-5-5"/>',

    // 食物 / 记录
    utensils:        '<path d="M3 2v7c0 1.7 1.3 3 3 3s3-1.3 3-3V2"/><path d="M6 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>',
    plusCircle:      '<circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>',
    coffee:          '<path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M6 2v3M10 2v3M14 2v3"/>',

    // 删除 / 列表
    trash:           '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    edit:            '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',

    // 数据 / 趋势 / 分析
    trendUp:         '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    barChart:        '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
    activity:        '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    pieChart:        '<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',

    // 我的
    user:            '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    settings:        '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    download:        '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    upload:          '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    camera:          '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',

    // 知识 / 工具
    book:            '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    search:          '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    tool:            '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',

    // 家居 / 家人
    home:            '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    share:           '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',

    // 运动 / 健身
    dumbbell:        '<path d="M6.5 6.5l11 11"/><path d="M21 21l-1-1"/><path d="M3 3l1 1"/><path d="M18 22l4-4"/><path d="M2 6l4-4"/><path d="M3 10l7-7"/><path d="M14 21l7-7"/>',
    play:            '<polygon points="5 3 19 12 5 21 5 3"/>',
    pause:           '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
    rotate:          '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',

    // 安装 / 系统
    downloadBox:     '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/><polyline points="17 5 12 10 7 5"/>',
    smartphone:      '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',

    // 家族
    baby:            '<path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16a3.5 3.5 0 0 0 4 0"/><circle cx="12" cy="12" r="10"/>',

    // 水
    droplet:         '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',

    // 星 / 收藏
    starFilled:      '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/>',
    star:            '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',

    // 火 / 防弹咖啡
    zap:             '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'
  };

  function svg(name, size) {
    var p = PATHS[name];
    if (!p) return '';
    var s = size || 20;
    return BASE.replace('{S}', s) + p + '</svg>';
  }

  /* 带文字的按钮：icon + "文字"  组合 */
  function withIcon(name, label, size) {
    return svg(name, size || 16) + ' <span>' + label + '</span>';
  }

  /* 仅 icon 圆形/方形按钮（FAB / 顶栏） */
  function iconOnly(name, size) {
    return svg(name, size || 18);
  }

  global.ICONS = {
    svg: svg,
    with: withIcon,
    only: iconOnly
  };
})(window);
