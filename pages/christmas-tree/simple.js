import * as THREE from 'https://unpkg.com/three@0.181.2/build/three.module.js';

// 着色器代码
const foliageVertexShader = `
  attribute float size;
  attribute vec3 customColor;
  varying vec3 vColor;
  
  void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const foliageFragmentShader = `
  varying vec3 vColor;
  
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5, 0.5));
    if (r > 0.5) discard;
    
    vec3 color = mix(
      vec3(0.05, 0.3, 0.1), // 深绿色边缘
      vec3(0.1, 0.8, 0.2), // 亮绿色中心
      1.0 - r * 2.0
    );
    
    gl_FragColor = vec4(color * vColor, 1.0 - r);
  }
`;

// 创建圣诞树场景
const createChristmasTreeScene = () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 4, 20);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.setClearColor(0x0a0a0a);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  document.getElementById('root').appendChild(renderer.domElement);
  
  // 添加灯光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);
  
  const pointLight = new THREE.PointLight(0xffd700, 0.8, 100);
  pointLight.position.set(0, 10, 0);
  scene.add(pointLight);
  
  // 添加金色点光源以创建Bloom效果
  const goldLights = [];
  for (let i = 0; i < 30; i++) {
    const light = new THREE.PointLight(0xffd700, 0.2, 5);
    light.position.set(
      (Math.random() - 0.5) * 20,
      Math.random() * 10,
      (Math.random() - 0.5) * 20
    );
    goldLights.push(light);
    scene.add(light);
  }
  
  // 创建圣诞树
  const createChristmasTree = (state) => {
    const treeGroup = new THREE.Group();
    
    // 创建针叶粒子系统
    const particleCount = 5000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // 存储两种状态的位置
    const chaosPositions = [];
    const targetPositions = [];
    
    for (let i = 0; i < particleCount; i++) {
      // 混乱状态：球形随机分布
      const chaosTheta = Math.random() * Math.PI * 2;
      const chaosPhi = Math.acos(2 * Math.random() - 1);
      const chaosRadius = 3 + Math.random() * 7;
      
      const chaosX = chaosRadius * Math.sin(chaosPhi) * Math.cos(chaosTheta);
      const chaosY = chaosRadius * Math.sin(chaosPhi) * Math.sin(chaosTheta) + 4;
      const chaosZ = chaosRadius * Math.cos(chaosPhi);
      
      const chaosPos = new THREE.Vector3(chaosX, chaosY, chaosZ);
      chaosPositions.push(chaosPos);
      
      // 聚合状态：圣诞树形状（圆锥）
      const height = Math.random() * 8;
      const normalizedHeight = height / 8;
      const maxRadius = 5 * (1 - normalizedHeight);
      
      const theta = Math.random() * Math.PI * 2;
      const radius = Math.random() * maxRadius;
      
      const targetX = radius * Math.cos(theta);
      const targetY = height;
      const targetZ = radius * Math.sin(theta);
      
      const targetPos = new THREE.Vector3(targetX, targetY, targetZ);
      targetPositions.push(targetPos);
      
      // 设置当前位置
      const currentPos = state === 'CHAOS' ? chaosPos : targetPos;
      positions[i * 3] = currentPos.x;
      positions[i * 3 + 1] = currentPos.y;
      positions[i * 3 + 2] = currentPos.z;
      
      // 颜色从深绿到亮绿
      const greenShade = 0.3 + Math.random() * 0.5;
      colors[i * 3] = 0.05;
      colors[i * 3 + 1] = greenShade;
      colors[i * 3 + 2] = 0.1;
      
      // 随机大小
      sizes[i] = Math.random() * 5 + 2;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.ShaderMaterial({
      vertexShader: foliageVertexShader,
      fragmentShader: foliageFragmentShader,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const particles = new THREE.Points(geometry, material);
    treeGroup.add(particles);
    
    // 添加装饰物
    const ornamentCount = 200;
    const ornamentGeometry = new THREE.SphereGeometry(1, 16, 16);
    
    const ornamentPositions = [];
    const ornamentChaosPositions = [];
    const ornamentScales = [];
    
    for (let i = 0; i < ornamentCount; i++) {
      // 在圣诞树形状内的随机位置
      const height = Math.random() * 7.5;
      const normalizedHeight = height / 8;
      const maxRadius = 5 * (1 - normalizedHeight);
      
      const theta = Math.random() * Math.PI * 2;
      const radius = Math.random() * maxRadius * 0.9;
      
      const x = radius * Math.cos(theta);
      const z = radius * Math.sin(theta);
      
      const position = new THREE.Vector3(x, height, z);
      ornamentPositions.push(position);
      
      // 混乱状态位置
      const chaosTheta = Math.random() * Math.PI * 2;
      const chaosPhi = Math.acos(2 * Math.random() - 1);
      const chaosRadius = 3 + Math.random() * 7;
      
      const chaosX = chaosRadius * Math.sin(chaosPhi) * Math.cos(chaosTheta);
      const chaosY = chaosRadius * Math.sin(chaosPhi) * Math.sin(chaosTheta) + 4;
      const chaosZ = chaosRadius * Math.cos(chaosPhi);
      
      const chaosPosition = new THREE.Vector3(chaosX, chaosY, chaosZ);
      ornamentChaosPositions.push(chaosPosition);
      
      const scale = 0.15 + Math.random() * 0.1;
      ornamentScales.push(scale);
      
      // 根据类型设置不同颜色
      const type = Math.floor(Math.random() * 3);
      let ornamentMaterial;
      
      if (type === 0) { // 礼物盒 - 较大
        ornamentMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0.8 + Math.random() * 0.2, Math.random() * 0.3, Math.random() * 0.3),
          metalness: 0.3,
          roughness: 0.7
        });
      } else if (type === 1) { // 彩球 - 中等
        const hue = Math.random();
        ornamentMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(hue, 0.8, 0.6),
          metalness: 0.6,
          roughness: 0.3
        });
      } else { // 灯光 - 小
        ornamentMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0.9, 0.9, Math.random() * 0.3),
          emissive: new THREE.Color(0.9, 0.9, Math.random() * 0.3),
          emissiveIntensity: 0.5,
          metalness: 0.8,
          roughness: 0.2
        });
      }
      
      const ornament = new THREE.Mesh(ornamentGeometry, ornamentMaterial);
      ornament.position.set(state === 'CHAOS' ? chaosPosition.x : position.x, 
                         state === 'CHAOS' ? chaosPosition.y : position.y, 
                         state === 'CHAOS' ? chaosPosition.z : position.z);
      ornament.scale.set(scale, scale, scale);
      ornament.castShadow = true;
      ornament.receiveShadow = true;
      
      treeGroup.add(ornament);
    }
    
    // 添加拍立得照片
    const polaroidCount = 15;
    const polaroidPositions = [];
    const polaroidChaosPositions = [];
    
    for (let i = 0; i < polaroidCount; i++) {
      // 在圣诞树表面随机分布
      const height = Math.random() * 7 + 0.5;
      const normalizedHeight = height / 8;
      const maxRadius = 5 * (1 - normalizedHeight);
      
      const theta = Math.random() * Math.PI * 2;
      const radius = Math.random() * maxRadius * 0.9;
      
      const x = radius * Math.cos(theta);
      const z = radius * Math.sin(theta);
      
      const position = new THREE.Vector3(x, height, z);
      polaroidPositions.push(position);
      
      // 混乱位置
      const chaosTheta = Math.random() * Math.PI * 2;
      const chaosPhi = Math.acos(2 * Math.random() - 1);
      const chaosRadius = 3 + Math.random() * 7;
      
      const chaosX = chaosRadius * Math.sin(chaosPhi) * Math.cos(chaosTheta);
      const chaosY = chaosRadius * Math.sin(chaosPhi) * Math.sin(chaosTheta) + 4;
      const chaosZ = chaosRadius * Math.cos(chaosPhi);
      
      const chaosPosition = new THREE.Vector3(chaosX, chaosY, chaosZ);
      polaroidChaosPositions.push(chaosPosition);
      
      const polaroidGroup = new THREE.Group();
      const polaroidScale = 0.2 + Math.random() * 0.1;
      
      // 创建拍立得照片
      const polaroidGeometry = new THREE.BoxGeometry(1, 1.2, 0.1);
      const polaroidMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        roughness: 0.8
      });
      const polaroid = new THREE.Mesh(polaroidGeometry, polaroidMaterial);
      
      const photoGeometry = new THREE.PlaneGeometry(0.9, 1.1);
      const photoMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xf5f5f5,
        roughness: 0.9
      });
      const photo = new THREE.Mesh(photoGeometry, photoMaterial);
      photo.position.z = 0.06;
      
      polaroidGroup.add(polaroid);
      polaroidGroup.add(photo);
      
      polaroidGroup.position.set(state === 'CHAOS' ? chaosPosition.x : position.x, 
                             state === 'CHAOS' ? chaosPosition.y : position.y, 
                             state === 'CHAOS' ? chaosPosition.z : position.z);
      polaroidGroup.scale.set(polaroidScale, polaroidScale * 1.2, polaroidScale * 0.1);
      
      treeGroup.add(polaroidGroup);
    }
    
    // 添加树干
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 1, 16);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513, 
      roughness: 0.8 
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(0, -0.5, 0);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);
    
    // 添加树基座
    const baseGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 16);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x654321, 
      roughness: 0.7 
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, -1, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    treeGroup.add(base);
    
    // 添加星空背景
    const starsGeometry = new THREE.BufferGeometry();
    const starsVertices = [];
    
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = Math.random() * 2000 - 200;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starsMaterial = new THREE.PointsMaterial({ 
      color: 0xffffff, 
      size: 1,
      transparent: true,
      opacity: 0.8
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // 动画参数
    let progress = 0;
    let targetState = state;
    let isTransitioning = false;
    
    // 状态转换函数
    const transitionToState = (newState) => {
      if (newState !== targetState) {
        targetState = newState;
        progress = 0;
        isTransitioning = true;
      }
    };
    
    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      
      // 更新转换进度
      if (isTransitioning) {
        progress = Math.min(progress + 0.01, 1);
        if (progress >= 1) {
          isTransitioning = false;
        }
      }
      
      // 更新粒子位置
      const particlePositions = particles.geometry.attributes.position.array;
      
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const chaosPos = chaosPositions[i];
        const targetPos = targetPositions[i];
        
        if (targetState === 'CHAOS') {
          // 从 FORMED 到 CHAOS
          particlePositions[idx] = THREE.MathUtils.lerp(targetPos.x, chaosPos.x, progress);
          particlePositions[idx + 1] = THREE.MathUtils.lerp(targetPos.y, chaosPos.y, progress);
          particlePositions[idx + 2] = THREE.MathUtils.lerp(targetPos.z, chaosPos.z, progress);
        } else {
          // 从 CHAOS 到 FORMED
          particlePositions[idx] = THREE.MathUtils.lerp(chaosPos.x, targetPos.x, progress);
          particlePositions[idx + 1] = THREE.MathUtils.lerp(chaosPos.y, targetPos.y, progress);
          particlePositions[idx + 2] = THREE.MathUtils.lerp(chaosPos.z, targetPos.z, progress);
        }
      }
      
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y += 0.005;
      
      // 更新装饰物位置
      for (let i = 1; i < ornamentCount + 1; i++) {
        const ornament = treeGroup.children[i];
        if (ornament && ornament.isMesh) {
          const targetPos = ornamentPositions[i-1];
          const chaosPos = ornamentChaosPositions[i-1];
          
          if (targetState === 'CHAOS') {
            ornament.position.lerpVectors(targetPos, chaosPos, progress);
          } else {
            ornament.position.lerpVectors(chaosPos, targetPos, progress);
          }
          
          ornament.rotation.y += 0.01;
        }
      }
      
      // 更新拍立得照片位置
      for (let i = ornamentCount + 2; i < ornamentCount + 2 + polaroidCount; i++) {
        const polaroid = treeGroup.children[i];
        if (polaroid && polaroid.isGroup) {
          const targetPos = polaroidPositions[i - (ornamentCount + 2)];
          const chaosPos = polaroidChaosPositions[i - (ornamentCount + 2)];
          
          if (targetState === 'CHAOS') {
            polaroid.position.lerpVectors(targetPos, chaosPos, progress);
          } else {
            polaroid.position.lerpVectors(chaosPos, targetPos, progress);
          }
          
          polaroid.rotation.y += 0.01;
        }
      }
      
      // 闪烁金色灯光
      const time = Date.now() * 0.001;
      goldLights.forEach((light, i) => {
        light.intensity = 0.2 + Math.sin(time + i) * 0.1;
      });
      
      renderer.render(scene, camera);
    };
    
    animate();
    
    // 返回状态转换函数供外部调用
    return { transitionToState };
  };
  
  const tree = createChristmasTree('CHAOS');
  scene.add(tree);
  
  // 添加简单的相机控制
  let mouseX = 0, mouseY = 0;
  let isMouseDown = false;
  
  document.addEventListener('mousedown', () => { isMouseDown = true; });
  document.addEventListener('mouseup', () => { isMouseDown = false; });
  document.addEventListener('mouseleave', () => { isMouseDown = false; });
  
  document.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
      const deltaX = event.clientX - mouseX;
      const deltaY = event.clientY - mouseY;
      
      // 根据鼠标移动旋转相机
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position);
      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
      
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);
    }
    
    mouseX = event.clientX;
    mouseY = event.clientY;
  });
  
  // 滚轮缩放
  document.addEventListener('wheel', (event) => {
    const scale = event.deltaY > 0 ? 1.1 : 0.9;
    camera.position.multiplyScalar(scale);
    camera.position.clampLength(10, 50);
  });
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  // 更新状态显示
  const updateStateDisplay = (state) => {
    const stateDisplay = document.getElementById('tree-state');
    const stateIndicator = document.getElementById('state-indicator');
    
    if (stateDisplay) {
      stateDisplay.textContent = state === 'CHAOS' ? '散落中' : '聚合成树';
    }
    
    if (stateIndicator) {
      stateIndicator.className = state === 'CHAOS' ? 
        'status-indicator status-inactive' : 
        'status-indicator status-active';
    }
  };
  
  // 初始化状态显示
  updateStateDisplay('CHAOS');
  
  // 绑定按钮事件
  const toggleButton = document.getElementById('toggle-tree');
  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      const currentState = tree.targetState || 'CHAOS';
      const newState = currentState === 'CHAOS' ? 'FORMED' : 'CHAOS';
      tree.transitionToState(newState);
      updateStateDisplay(newState);
    });
  }
  
  // 手势控制模拟
  let gestureEnabled = false;
  const videoContainer = document.getElementById('video-container');
  const toggleCameraButton = document.getElementById('toggle-camera');
  const gestureStatus = document.getElementById('gesture-status');
  const gestureIndicator = document.getElementById('gesture-indicator');
  
  if (toggleCameraButton) {
    toggleCameraButton.addEventListener('click', async () => {
      gestureEnabled = !gestureEnabled;
      
      if (gestureStatus) {
        gestureStatus.textContent = gestureEnabled ? '已启用' : '未启用';
      }
      
      if (gestureIndicator) {
        gestureIndicator.className = gestureEnabled ? 
          'status-indicator status-active' : 
          'status-indicator status-inactive';
      }
      
      if (videoContainer) {
        videoContainer.style.display = gestureEnabled ? 'block' : 'none';
      }
      
      if (gestureEnabled) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
          });
          
          const video = document.getElementById('video');
          if (video) {
            video.srcObject = stream;
          }
          
          // 模拟手势检测
          // 在实际应用中，应该集成MediaPipe的手势识别模型
          const detectGesture = () => {
            if (!gestureEnabled || !video) return;
            
            // 模拟手势检测
            // 实际应用中应该使用MediaPipe或其他手势识别库
            const mockIsOpen = Math.random() > 0.95; // 5%概率检测到手势张开
            
            const currentState = tree.targetState || 'CHAOS';
            const newState = mockIsOpen ? 'CHAOS' : 'FORMED';
            
            if (newState !== currentState) {
              tree.transitionToState(newState);
              updateStateDisplay(newState);
            }
            
            if (gestureEnabled) {
              setTimeout(detectGesture, 100);
            }
          };
          
          // 开始检测
          setTimeout(detectGesture, 1000);
        } catch (error) {
          console.error("Error setting up camera:", error);
          gestureEnabled = false;
          if (gestureStatus) {
            gestureStatus.textContent = '未启用';
          }
          if (gestureIndicator) {
            gestureIndicator.className = 'status-indicator status-inactive';
          }
          if (videoContainer) {
            videoContainer.style.display = 'none';
          }
        }
      } else {
        const video = document.getElementById('video');
        if (video && video.srcObject) {
          const stream = video.srcObject;
          stream.getTracks().forEach(track => track.stop());
          video.srcObject = null;
        }
      }
    });
  }
};

// 初始化场景
createChristmasTreeScene();