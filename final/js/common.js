/* =========================================================
   common.js - 全局通用脚本
   功能：JSON 数据加载（含错误处理）、Toast 提示、加载/空态渲染、
        导航高亮、数字滚动动画、HTML 转义
   依赖：jQuery
   ========================================================= */

(function () {
  'use strict';

  const App = {};

  /* ---------- 加载 JSON 数据 ---------- */
  /**
   * 加载本地 JSON 文件
   * @param {string} url - json 文件相对路径
   * @returns {Promise<any>}
   */
  App.loadJSON = function (url) {
    return fetch(url, { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }
        return res.json();
      })
      .catch(function (err) {
        // file:// 协议下 fetch 常被浏览器拦截，给出明确提示
        if (err.message.indexOf('Failed to fetch') !== -1 || err.name === 'TypeError') {
          throw new Error(
            '无法加载数据文件。请不要直接双击打开 HTML，' +
            '需通过本地服务器运行（详见运行说明）。'
          );
        }
        throw new Error('加载数据失败（' + err.message + '），请检查 data 文件是否存在。');
      });
  };

  /* ---------- Toast 轻提示 ---------- */
  App.showToast = function (msg, type) {
    type = type || 'info';
    const bg = {
      success: '#52c41a',
      danger: '#ff4d4f',
      warning: '#faad14',
      info: '#1677ff'
    }[type] || '#1677ff';

    const icon = {
      success: 'fa-circle-check',
      danger: 'fa-circle-exclamation',
      warning: 'fa-triangle-exclamation',
      info: 'fa-circle-info'
    }[type] || 'fa-circle-info';

    const $toast = $(
      '<div class="toast" role="alert" style="min-width:240px;background:' + bg + ';color:#fff;border:none;">' +
        '<div class="d-flex align-items-center px-3 py-2">' +
          '<i class="fa-solid ' + icon + ' me-2"></i>' +
          '<span>' + App.escapeHtml(msg) + '</span>' +
        '</div>' +
      '</div>'
    );

    let $container = $('.toast-container-custom');
    if ($container.length === 0) {
      $container = $('<div class="toast-container-custom"></div>').appendTo('body');
    }
    $container.append($toast);

    const bsToast = new bootstrap.Toast($toast[0], { delay: 2600 });
    bsToast.show();
    $toast.on('hidden.bs.toast', function () { $toast.remove(); });
  };

  /* ---------- 状态渲染 ---------- */
  App.renderLoading = function ($container, text) {
    $container.html(
      '<div class="loading-box">' +
        '<div class="spinner-custom"></div>' +
        '<span>' + (text || '数据加载中…') + '</span>' +
      '</div>'
    );
  };

  App.renderError = function ($container, msg) {
    $container.html(
      '<div class="error-tip">' +
        '<i class="fa-solid fa-circle-exclamation"></i>' +
        '<div>' + App.escapeHtml(msg || '加载失败，请稍后重试。') + '</div>' +
      '</div>'
    );
  };

  App.renderEmpty = function ($container, text) {
    $container.html(
      '<div class="empty-tip">' +
        '<i class="fa-solid fa-inbox" style="font-size:2rem;display:block;margin-bottom:8px;"></i>' +
        '<span>' + (text || '暂无数据') + '</span>' +
      '</div>'
    );
  };

  /* ---------- 导航高亮 ---------- */
  App.setActiveNav = function (pageId) {
    $('.site-navbar .nav-link').each(function () {
      const $a = $(this);
      $a.toggleClass('active', $a.data('page') === pageId);
    });
  };

  /* ---------- 数字滚动动画 ---------- */
  App.animateNumber = function (el, target, duration) {
    duration = duration || 1200;
    const start = performance.now();
    const from = 0;
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (target - from) * ease).toLocaleString();
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  /* ---------- HTML 转义（防 XSS） ---------- */
  App.escapeHtml = function (str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  };

  /* ---------- 格式化百分比条 ---------- */
  App.usageText = function (used, total) {
    if (!total) return 0;
    return Math.round((used / total) * 100);
  };

  // 暴露到全局
  window.App = App;
})();
