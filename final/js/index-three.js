/* =========================================================
   index-three.js - 首页三维展示逻辑
   功能：用 Three.js 渲染校园场馆三维导览，建筑高度/颜色随使用率变化
   暴露 window.renderHomeThree(buildingUsage)，由图表模块加载数据后调用
   ========================================================= */

window.renderHomeThree = function (buildingUsage) {
  'use strict';

  const container = document.getElementById('three-container');

  // 依赖检查
  if (typeof THREE === 'undefined') {
    container.innerHTML = '<div class="error-tip m-3">三维场景加载失败：Three.js 库未成功引入，请检查网络。</div>';
    return;
  }
  try {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeaf2ff);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(14, 12, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 灯光
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // 地面
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshLambertMaterial({ color: 0xdfe9f7 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // 网格辅助线
    const grid = new THREE.GridHelper(40, 20, 0xbfd4f5, 0xdce8f8);
    grid.position.y = 0.01;
    scene.add(grid);

    // 场馆建筑：颜色随使用率变化，高度与名称映射
    const palette = [0x1677ff, 0x13c2c2, 0x52c41a, 0xfaad14, 0x722ed1, 0xeb2f96];
    const basePositions = [
      [-8, -6], [-2, -6], [4, -6], [-8, 2], [-2, 2], [4, 2]
    ];

    buildingUsage.forEach(function (b, i) {
      const pos = basePositions[i] || [0, 0];
      const h = 2 + (b.usage / 100) * 6;          // 使用率越高建筑越高
      const color = b.usage >= 80 ? 0xff4d4f : (b.usage >= 60 ? 0xfaad14 : palette[i % palette.length]);
      const geo = new THREE.BoxGeometry(3, h, 3);
      const mat = new THREE.MeshLambertMaterial({ color: color });
      const box = new THREE.Mesh(geo, mat);
      box.position.set(pos[0], h / 2, pos[1]);
      box.userData = { name: b.name, usage: b.usage };
      scene.add(box);

      // 顶部小块做“楼顶”装饰
      const top = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.3, 3.2),
        new THREE.MeshLambertMaterial({ color: 0xffffff })
      );
      top.position.set(pos[0], h + 0.15, pos[1]);
      scene.add(top);
    });

    // 控制器
    let controls = null;
    if (THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.8;
      controls.minDistance = 8;
      controls.maxDistance = 40;
      controls.maxPolarAngle = Math.PI / 2.1;
    }

    // 隐藏 loading
    const loading = document.getElementById('three-loading');
    if (loading) loading.style.display = 'none';

    // 动画循环
    function animate() {
      requestAnimationFrame(animate);
      if (controls) controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // 自适应尺寸
    window.addEventListener('resize', function () {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  } catch (e) {
    container.innerHTML = '<div class="error-tip m-3">三维场景初始化失败：' + App.escapeHtml(e.message) + '</div>';
  }
};
