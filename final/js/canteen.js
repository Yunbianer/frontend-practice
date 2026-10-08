/* =========================================================
   canteen.js - 食堂信息页
   功能：加载食堂 JSON、搜索、菜系筛选、卡片渲染、繁忙度柱状图
   ========================================================= */

$(function () {
  'use strict';

  App.setActiveNav('canteen');

  let canteens = [];
  const $list = $('#canteenList');

  App.renderLoading($list);

  App.loadJSON('data/canteen.json')
    .then(function (data) {
      canteens = data;
      initCuisineFilter();
      renderChart();
      applyFilters();
    })
    .catch(function (err) {
      App.renderError($list, err.message);
      App.renderError($('#canteen-chart').parent(), err.message);
    });

  /* ---------- 菜系筛选 ---------- */
  function initCuisineFilter() {
    const set = {};
    canteens.forEach(function (c) { set[c.cuisine] = true; });
    const options = Object.keys(set).map(function (k) {
      return '<option value="' + k + '">' + k + '</option>';
    }).join('');
    $('#filterCuisine').append(options);
  }

  /* ---------- 图表：繁忙度柱状图 ---------- */
  function renderChart() {
    const el = document.getElementById('canteen-chart');
    if (!el) return;
    const chart = echarts.init(el);
    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 70, right: 30, top: 20, bottom: 30 },
      xAxis: { type: 'value', max: 100, name: '繁忙度 %' },
      yAxis: { type: 'category', data: canteens.map(function (c) { return c.name; }) },
      series: [{
        type: 'bar',
        data: canteens.map(function (c) { return c.busyLevel; }),
        itemStyle: {
          color: function (p) {
            const v = p.value;
            if (v >= 75) return '#ff4d4f';
            if (v >= 50) return '#faad14';
            return '#52c41a';
          },
          borderRadius: [0, 6, 6, 0]
        },
        label: { show: true, position: 'right', formatter: '{c}%' }
      }]
    });
    window.addEventListener('resize', function () { chart.resize(); });
  }

  /* ---------- 星级 ---------- */
  function stars(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    let html = '';
    for (let i = 0; i < full; i++) html += '<i class="fa-solid fa-star text-warning"></i>';
    if (half) html += '<i class="fa-solid fa-star-half-stroke text-warning"></i>';
    const empty = 5 - full - (half ? 1 : 0);
    for (let i = 0; i < empty; i++) html += '<i class="fa-regular fa-star text-warning"></i>';
    return html + ' <span class="text-muted small">' + rating.toFixed(1) + '</span>';
  }

  /* ---------- 搜索 + 筛选 ---------- */
  function applyFilters() {
    const kw = $('#searchInput').val().trim().toLowerCase();
    const cuisine = $('#filterCuisine').val();
    const result = canteens.filter(function (c) {
      const hitKw = !kw || c.name.toLowerCase().indexOf(kw) !== -1 || c.cuisine.toLowerCase().indexOf(kw) !== -1;
      const hitCuisine = !cuisine || c.cuisine === cuisine;
      return hitKw && hitCuisine;
    });
    renderList(result);
  }

  function renderList(list) {
    $('#resultCount').text('共 ' + list.length + ' 个食堂');
    if (list.length === 0) {
      App.renderEmpty($list, '没有找到匹配的食堂');
      return;
    }
    const html = list.map(function (c) {
      const busyColor = c.busyLevel >= 75 ? '#ff4d4f' : (c.busyLevel >= 50 ? '#faad14' : '#52c41a');
      const rec = (c.recommend || []).map(function (r) { return '<span class="tag">' + App.escapeHtml(r) + '</span>'; }).join('');
      return '' +
        '<div class="col-12 col-md-6 mb-3">' +
          '<div class="card-custom p-3 h-100">' +
            '<div class="d-flex justify-content-between align-items-start mb-2">' +
              '<div>' +
                '<h6 class="mb-1"><i class="fa-solid fa-utensils text-primary"></i> ' + App.escapeHtml(c.name) + '</h6>' +
                '<small class="text-muted">' + c.floor + ' · ' + App.escapeHtml(c.cuisine) + '</small>' +
              '</div>' +
              '<span>' + stars(c.rating) + '</span>' +
            '</div>' +
            '<div class="mb-2">' +
              '<div class="d-flex justify-content-between small mb-1">' +
                '<span>当前繁忙度</span><span>' + c.busyLevel + '%</span>' +
              '</div>' +
              '<div class="progress" style="height:6px;">' +
                '<div class="progress-bar" style="width:' + c.busyLevel + '%;background:' + busyColor + ';"></div>' +
              '</div>' +
            '</div>' +
            '<div class="small text-muted row mb-2">' +
              '<div class="col-6"><i class="fa-regular fa-clock"></i> ' + App.escapeHtml(c.openTime) + '</div>' +
              '<div class="col-6"><i class="fa-solid fa-yen-sign"></i> 人均 ¥' + c.avgPrice + '</div>' +
              '<div class="col-6"><i class="fa-solid fa-chair"></i> 座位 ' + c.seats + '</div>' +
            '</div>' +
            '<div>' + rec + '</div>' +
          '</div>' +
        '</div>';
    }).join('');
    $list.html('<div class="row g-3">' + html + '</div>');
  }

  $('#searchInput').on('input', applyFilters);
  $('#filterCuisine').on('change', applyFilters);
});
