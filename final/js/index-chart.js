/* =========================================================
   index-chart.js - 首页统计与图表逻辑
   功能：统计卡片（数字滚动）、人流折线图、场馆柱状图、周趋势图、通知公告
   数据加载完成后，调用 window.renderHomeThree 渲染三维场景
   ========================================================= */

$(function () {
  'use strict';

  App.setActiveNav('home');

  const $statCards = $('#stat-cards');
  const $noticeList = $('#notice-list');
  App.renderLoading($statCards);

  // 加载仪表盘数据
  App.loadJSON('data/dashboard.json')
    .then(function (data) {
      renderStatCards(data.summary);
      renderFlowChart(data.hourlyFlow);
      renderBuildingChart(data.buildingUsage);
      renderWeekChart(data.weekTrend);
      renderNotices(data.notices);
      // 交给三维模块渲染
      if (window.renderHomeThree) window.renderHomeThree(data.buildingUsage);
    })
    .catch(function (err) {
      App.renderError($statCards, err.message);
      App.renderError($('#chart-flow').parent(), err.message);
      App.renderError($('#three-container'), err.message);
      App.renderError($noticeList, err.message);
    });

  /* ---------- 统计卡片 ---------- */
  function renderStatCards(summary) {
    const cards = [
      { icon: 'fa-seat', label: '自习座位总数', value: summary.totalSeats, cls: '' },
      { icon: 'fa-circle-check', label: '当前空闲座位', value: summary.freeSeats, cls: 'success' },
      { icon: 'fa-user-group', label: '今日访问人次', value: summary.todayVisits, cls: 'accent' },
      { icon: 'fa-building', label: '开放场馆数', value: summary.activeBuildings, cls: 'warning' }
    ];
    const html = cards.map(function (c) {
      return '' +
        '<div class="col-6 col-md-3">' +
          '<div class="stat-card ' + c.cls + ' d-flex justify-content-between align-items-center">' +
            '<div>' +
              '<div class="stat-num" data-target="' + c.value + '">0</div>' +
              '<div class="stat-label">' + c.label + '</div>' +
            '</div>' +
            '<i class="fa-solid ' + c.icon + ' stat-icon"></i>' +
          '</div>' +
        '</div>';
    }).join('');
    $statCards.html(html);
    $statCards.find('.stat-num').each(function () {
      App.animateNumber(this, Number(this.dataset.target));
    });
  }

  /* ---------- 图表1：各时段人流折线图 ---------- */
  function renderFlowChart(flow) {
    const chart = echarts.init(document.getElementById('chart-flow'));
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['自习区', '食堂区'], bottom: 0 },
      grid: { left: 40, right: 20, top: 20, bottom: 50 },
      xAxis: { type: 'category', data: flow.hours, boundaryGap: false },
      yAxis: { type: 'value', name: '人次' },
      series: [
        {
          name: '自习区', type: 'line', smooth: true, data: flow.studyRoom,
          itemStyle: { color: '#1677ff' },
          areaStyle: { color: 'rgba(22,119,255,0.18)' }
        },
        {
          name: '食堂区', type: 'line', smooth: true, data: flow.canteen,
          itemStyle: { color: '#13c2c2' },
          areaStyle: { color: 'rgba(19,194,194,0.15)' }
        }
      ]
    });
    window.addEventListener('resize', function () { chart.resize(); });
  }

  /* ---------- 图表2：场馆使用率柱状图 ---------- */
  function renderBuildingChart(usage) {
    const chart = echarts.init(document.getElementById('chart-building'));
    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 70, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'value', max: 100, name: '%' },
      yAxis: { type: 'category', data: usage.map(function (d) { return d.name; }) },
      series: [{
        type: 'bar',
        data: usage.map(function (d) { return d.usage; }),
        itemStyle: {
          color: function (params) {
            const v = params.value;
            if (v >= 80) return '#ff4d4f';
            if (v >= 60) return '#faad14';
            return '#52c41a';
          },
          borderRadius: [0, 6, 6, 0]
        },
        label: { show: true, position: 'right', formatter: '{c}%' }
      }]
    });
    window.addEventListener('resize', function () { chart.resize(); });
  }

  /* ---------- 图表3：本周趋势面积图 ---------- */
  function renderWeekChart(trend) {
    const chart = echarts.init(document.getElementById('week-chart'));
    chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 50, right: 20, top: 20, bottom: 30 },
      xAxis: { type: 'category', data: trend.days, boundaryGap: false },
      yAxis: { type: 'value' },
      series: [{
        type: 'line', smooth: true, data: trend.visits,
        itemStyle: { color: '#1677ff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(22,119,255,0.45)' },
            { offset: 1, color: 'rgba(22,119,255,0.02)' }
          ])
        }
      }]
    });
    window.addEventListener('resize', function () { chart.resize(); });
  }

  /* ---------- 通知公告 ---------- */
  function renderNotices(notices) {
    if (!notices || notices.length === 0) {
      App.renderEmpty($noticeList, '暂无通知');
      return;
    }
    const levelColor = { '重要': 'danger', '通知': 'warning', '公告': 'info' };
    const html = notices.map(function (n) {
      const lv = levelColor[n.level] || 'info';
      return '' +
        '<div class="d-flex align-items-center py-2 border-bottom">' +
          '<span class="badge text-bg-' + lv + ' me-3">' + n.level + '</span>' +
          '<span class="flex-grow-1">' + App.escapeHtml(n.title) + '</span>' +
          '<span class="text-muted small">' + n.date + '</span>' +
        '</div>';
    }).join('');
    $noticeList.html(html);
  }
});
