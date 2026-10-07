const state = {
  data: null,
  barChart: null,
  pieChart: null,
  activeCategory: '全部'
};

// 加载本地 JSON；传入不同 url 即可演示 加载中/失败/空数据 三种状态
const loadData = async (url = 'data/books.json') => {
  // 重置页面：清空卡片、筛选器与旧图表
  $('#status').removeClass('alert-danger').addClass('alert-warning')
    .text('加载中...').show();
  $('#cards').empty();
  $('#filters').empty();
  if (state.barChart) { state.barChart.dispose(); state.barChart = null; }
  if (state.pieChart) { state.pieChart.destroy(); state.pieChart = null; }

  try {
    await new Promise(resolve => setTimeout(resolve, 400)); // 便于观察“加载中”状态
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }
    const data = await response.json();
    // 空数据状态
    if (!data.series || data.series.length === 0) {
      $('#status').text('暂无数据（当前记账周期内没有消费记录）').show();
      return;
    }
    state.data = data;
    state.activeCategory = '全部';
    $('#sub-title').text(data.title + ' · 数据来源：' + data.source);
    $('#status').hide();
    renderCards(data);
    renderFilters(data);
    renderBarChart(data);
    renderPieChart(data);
  } catch (error) {
    // 失败状态
    $('#status').removeClass('alert-warning').addClass('alert-danger')
      .text('加载失败：' + error.message + '，请检查 JSON 文件路径后重试。').show();
  }
};

// 三张统计卡片：总支出 / 月均支出 / 支出最高类别
const renderCards = (data) => {
  const total = data.series.reduce(
    (sum, s) => sum + s.counts.reduce((a, b) => a + b, 0), 0
  );
  const monthlyAvg = Math.round(total / data.months.length);
  const categoryTotals = data.series.map(s => ({
    category: s.category,
    total: s.counts.reduce((a, b) => a + b, 0)
  }));
  const top = categoryTotals.slice().sort((a, b) => b.total - a.total)[0];

  const cards = [
    { label: '总支出', value: '¥' + total, note: `共${data.months.length}个月累计消费` },
    { label: '月均支出', value: '¥' + monthlyAvg, note: '按记账月份平均' },
    { label: '支出最高类别', value: top.category, note: `累计 ¥${top.total}` }
  ];
  cards.forEach(c => {
    $('#cards').append(`
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h3 class="card-title h6">${c.label}</h3>
            <p class="card-text fs-4">${c.value}</p>
            <p class="card-text small text-muted">${c.note}</p>
          </div>
        </div>
      </div>
    `);
  });
};

// jQuery 交互：类别按钮筛选柱状图
const renderFilters = (data) => {
  const cats = ['全部', ...data.series.map(s => s.category)];
  cats.forEach(cat => {
    const isActive = cat === state.activeCategory;
    $('#filters').append(`
      <button type="button"
        class="btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-primary'}"
        data-cat="${cat}">${cat}</button>
    `);
  });

  $('#filters').off('click').on('click', 'button', function () {
    state.activeCategory = $(this).data('cat');
    $('#filters button')
      .removeClass('btn-primary').addClass('btn-outline-primary');
    $(this).removeClass('btn-outline-primary').addClass('btn-primary');
    updateBarChart();
  });
};

// ECharts 堆叠柱状图：各月分类支出（可按类别筛选）
const renderBarChart = (data) => {
  state.barChart = echarts.init(document.getElementById('bar-chart'));
  updateBarChart();
  window.addEventListener('resize', () => {
    if (state.barChart) state.barChart.resize();
  });
};

const updateBarChart = () => {
  const data = state.data;
  const series = data.series
    .filter(s => state.activeCategory === '全部' || s.category === state.activeCategory)
    .map(s => ({
      name: s.category,
      type: 'bar',
      stack: 'total',
      emphasis: { focus: 'series' },
      data: s.counts
    }));
  // replaceMerge 保证从“全部”切到单一类别时旧系列被移除
  state.barChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' },
      valueFormatter: v => v + ' ' + data.unit },
    legend: { data: series.map(s => s.name), top: 0 },
    grid: { top: 40, left: 50, right: 20, bottom: 30 },
    xAxis: { type: 'category', data: data.months },
    yAxis: { type: 'value', name: '单位：' + data.unit },
    series
  }, { replaceMerge: ['series', 'legend'] });
};

// Chart.js 饼图：各类别累计支出占比
const renderPieChart = (data) => {
  const totals = data.series.map(s => ({
    category: s.category,
    total: s.counts.reduce((a, b) => a + b, 0)
  }));
  state.pieChart = new Chart(document.getElementById('pie-chart'), {
    type: 'pie',
    data: {
      labels: totals.map(t => t.category),
      datasets: [{
        data: totals.map(t => t.total),
        backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6c757d']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: '单位：' + data.unit },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}：${ctx.parsed} ${data.unit}`
          }
        }
      }
    }
  });
};

// 三个演示按钮：正常 / 失败（请求不存在的文件）/ 空数据
$('#btn-normal').on('click', () => loadData('data/books.json'));
$('#btn-error').on('click', () => loadData('data/not-exist.json'));
$('#btn-empty').on('click', () => loadData('data/empty.json'));

loadData();