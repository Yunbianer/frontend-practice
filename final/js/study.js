/* =========================================================
   study.js - 自习室查询与管理
   功能：搜索、筛选、新增、修改；数据持久化到 localStorage；
        首次从 data/study.json 加载并缓存
   ========================================================= */

$(function () {
  'use strict';

  App.setActiveNav('study');

  const STORAGE_KEY = 'campus_study_rooms';
  let rooms = [];          // 当前全部数据
  const $list = $('#roomList');

  const editModal = new bootstrap.Modal('#editModal');

  /* ---------- 数据加载 ---------- */
  function loadData() {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        rooms = JSON.parse(cached);
        App.showToast('已加载本地数据', 'info');
        afterLoad();
        return;
      } catch (e) { /* 解析失败则回退到 JSON */ }
    }
    App.renderLoading($list);
    App.loadJSON('data/study.json')
      .then(function (data) {
        rooms = data;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
        afterLoad();
      })
      .catch(function (err) {
        App.renderError($list, err.message);
      });
  }

  function afterLoad() {
    initBuildingFilter();
    applyFilters();
  }

  /* ---------- 楼栋筛选下拉 ---------- */
  function initBuildingFilter() {
    const set = {};
    rooms.forEach(function (r) { set[r.building] = true; });
    const options = Object.keys(set).map(function (b) {
      return '<option value="' + b + '">' + b + '</option>';
    }).join('');
    $('#filterBuilding').append(options);
  }

  /* ---------- 计算状态 ---------- */
  function computeStatus(r) {
    if (r.totalSeats <= 0) return '开放';
    if (r.freeSeats <= 0) return '满座';
    if (r.freeSeats / r.totalSeats < 0.15) return '快满';
    return '开放';
  }

  function statusBadge(status) {
    const map = { '开放': 'badge-open', '满座': 'badge-full', '快满': 'badge-busy' };
    return '<span class="badge-status ' + (map[status] || 'badge-open') + '">' + status + '</span>';
  }

  /* ---------- 搜索 + 筛选 ---------- */
  function applyFilters() {
    const kw = $('#searchInput').val().trim().toLowerCase();
    const b = $('#filterBuilding').val();
    const s = $('#filterStatus').val();
    const a = $('#filterAircon').val();

    const result = rooms.filter(function (r) {
      if (kw && r.name.toLowerCase().indexOf(kw) === -1) return false;
      if (b && r.building !== b) return false;
      if (s && computeStatus(r) !== s) return false;
      if (a !== '' && String(r.hasAircon) !== a) return false;
      return true;
    });

    renderList(result);
  }

  /* ---------- 渲染列表 ---------- */
  function renderList(list) {
    $('#resultCount').text('共 ' + list.length + ' 条记录');
    if (list.length === 0) {
      App.renderEmpty($list, '没有符合条件的自习室，试试调整筛选条件或新增一个');
      return;
    }
    const html = list.map(function (r) {
      const status = computeStatus(r);
      const usage = r.totalSeats > 0 ? Math.round(((r.totalSeats - r.freeSeats) / r.totalSeats) * 100) : 0;
      const barColor = usage >= 90 ? '#ff4d4f' : (usage >= 70 ? '#faad14' : '#52c41a');
      const tags = (r.tags || []).map(function (t) { return '<span class="tag">' + App.escapeHtml(t) + '</span>'; }).join('');
      return '' +
        '<div class="col-12 col-md-6 col-xl-4 mb-3">' +
          '<div class="card-custom p-3 h-100">' +
            '<div class="d-flex justify-content-between align-items-start mb-2">' +
              '<div>' +
                '<h6 class="mb-1">' + App.escapeHtml(r.name) + '</h6>' +
                '<small class="text-muted"><i class="fa-solid fa-location-dot"></i> ' +
                  App.escapeHtml(r.building) + ' · ' + r.floor + '楼</small>' +
              '</div>' +
              statusBadge(status) +
            '</div>' +
            '<div class="mb-2">' +
              '<div class="d-flex justify-content-between small mb-1">' +
                '<span>座位 <strong>' + r.freeSeats + '</strong> / ' + r.totalSeats + ' 空闲</span>' +
                '<span class="text-muted">使用率 ' + usage + '%</span>' +
              '</div>' +
              '<div class="progress" style="height:6px;">' +
                '<div class="progress-bar" style="width:' + usage + '%;background:' + barColor + ';"></div>' +
              '</div>' +
            '</div>' +
            '<div class="small text-muted mb-2">' +
              '<i class="fa-regular fa-clock"></i> ' + App.escapeHtml(r.openTime || '—') +
              ' &nbsp; <i class="fa-solid ' + (r.hasAircon ? 'fa-snowflake text-primary' : 'fa-fan text-muted') + '"></i> ' +
              (r.hasAircon ? '空调' : '无空调') +
              ' &nbsp; <i class="fa-solid fa-volume-high"></i> ' + r.quietLevel +
            '</div>' +
            '<div class="mb-2">' + tags + '</div>' +
            '<button class="btn btn-sm btn-outline-primary w-100 btn-edit" data-id="' + r.id + '">' +
              '<i class="fa-solid fa-pen"></i> 修改信息' +
            '</button>' +
          '</div>' +
        '</div>';
    }).join('');
    $list.html('<div class="row g-3">' + html + '</div>');
  }

  /* ---------- 事件绑定 ---------- */
  $('#searchInput').on('input', applyFilters);
  $('#filterBuilding, #filterStatus, #filterAircon').on('change', applyFilters);

  // 新增
  $('#btnAdd').on('click', function () {
    $('#modalTitle').text('新增自习室');
    $('#editForm')[0].reset();
    $('#f_id').val('');
    $('#f_floor').val(1);
    $('#f_hasAircon').prop('checked', false);
    editModal.show();
  });

  // 编辑
  $list.on('click', '.btn-edit', function () {
    const id = Number($(this).data('id'));
    const r = rooms.find(function (x) { return x.id === id; });
    if (!r) return;
    $('#modalTitle').text('修改自习室');
    $('#f_id').val(r.id);
    $('#f_name').val(r.name);
    $('#f_building').val(r.building);
    $('#f_floor').val(r.floor);
    $('#f_totalSeats').val(r.totalSeats);
    $('#f_freeSeats').val(r.freeSeats);
    $('#f_openTime').val(r.openTime || '');
    $('#f_quietLevel').val(r.quietLevel || '普通');
    $('#f_hasAircon').prop('checked', !!r.hasAircon);
    $('#f_tags').val((r.tags || []).join(','));
    editModal.show();
  });

  // 保存
  $('#btnSave').on('click', function () {
    const name = $('#f_name').val().trim();
    const building = $('#f_building').val();
    const total = Number($('#f_totalSeats').val());
    const free = Number($('#f_freeSeats').val());

    // 校验
    if (!name) { App.showToast('请填写名称', 'warning'); return; }
    if (!building) { App.showToast('请选择楼栋', 'warning'); return; }
    if (isNaN(total) || total < 0) { App.showToast('总座位数不合法', 'warning'); return; }
    if (isNaN(free) || free < 0) { App.showToast('空闲座位数不合法', 'warning'); return; }
    if (free > total) { App.showToast('空闲座位不能大于总座位', 'warning'); return; }

    const tags = $('#f_tags').val().split(/[,，]/).map(function (t) { return t.trim(); }).filter(Boolean);

    const record = {
      name: name,
      building: building,
      floor: Number($('#f_floor').val()) || 1,
      totalSeats: total,
      freeSeats: free,
      openTime: $('#f_openTime').val().trim() || '07:00-22:30',
      hasAircon: $('#f_hasAircon').is(':checked'),
      quietLevel: $('#f_quietLevel').val(),
      tags: tags
    };

    const id = $('#f_id').val();
    if (id) {
      // 修改
      const idx = rooms.findIndex(function (x) { return x.id === Number(id); });
      if (idx > -1) {
        rooms[idx] = $.extend({ id: Number(id) }, record);
        App.showToast('修改成功', 'success');
      }
    } else {
      // 新增
      const newId = rooms.reduce(function (m, x) { return Math.max(m, x.id); }, 0) + 1;
      rooms.unshift($.extend({ id: newId }, record));
      App.showToast('新增成功', 'success');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    editModal.hide();
    applyFilters();
  });

  // 恢复默认数据
  $('#btnReset').on('click', function () {
    if (!confirm('确定要恢复默认数据吗？本地新增和修改将丢失。')) return;
    localStorage.removeItem(STORAGE_KEY);
    rooms = [];
    App.showToast('已恢复默认数据', 'success');
    loadData();
  });

  // 启动
  loadData();
});
