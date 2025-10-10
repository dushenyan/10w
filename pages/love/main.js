// 粒子系统配置
const settings = {
  particles: {
    length: 500,    // 粒子数量
    duration: 2,    // 粒子持续时间(秒)
    velocity: 100,  // 粒子速度
    effect: -0.75,  // 粒子效果系数
    size: 30        // 粒子大小
  }
};

// 兼容性处理：requestAnimationFrame
(function polyfillRAF() {
  let lastTime = 0;
  const vendors = ['ms', 'moz', 'webkit', 'o'];
  
  // 尝试使用浏览器原生实现
  for(let vendor of vendors) {
    if(!window.requestAnimationFrame) {
      window.requestAnimationFrame = window[vendor + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = 
        window[vendor + 'CancelAnimationFrame'] || 
        window[vendor + 'CancelRequestAnimationFrame'];
    }
  }
  
  // 如果浏览器不支持，则使用 setTimeout 模拟
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      const currTime = new Date().getTime();
      const timeToCall = Math.max(0, 16 - (currTime - lastTime));
      const id = window.setTimeout(() => { 
        callback(currTime + timeToCall); 
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  
  // 如果浏览器不支持 cancelAnimationFrame，则使用 clearTimeout 模拟
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
})();

// 获取URL参数并设置标题
(function setTitleFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const name = decodeURIComponent(urlParams.get("name") || "");
  const titleElement = document.querySelector(".title");
  if (titleElement) {
    titleElement.innerHTML = name;
  }
})();

// 点类：表示二维空间中的点
class Point {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  
  // 克隆点
  clone() {
    return new Point(this.x, this.y);
  }
  
  // 计算点到原点的距离，如果传入参数则设置向量长度
  length(newLength) {
    if (newLength === undefined) {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    this.normalize();
    this.x *= newLength;
    this.y *= newLength;
    return this;
  }
  
  // 将向量标准化为单位向量
  normalize() {
    const length = this.length();
    if (length > 0) {
      this.x /= length;
      this.y /= length;
    }
    return this;
  }
}

// 粒子类：表示单个爱心粒子
class Particle {
  constructor() {
    this.position = new Point();     // 位置
    this.velocity = new Point();     // 速度
    this.acceleration = new Point(); // 加速度
    this.age = 0;                    // 存活时间
  }
  
  // 初始化粒子状态
  initialize(x, y, dx, dy) {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = dx;
    this.velocity.y = dy;
    this.acceleration.x = dx * settings.particles.effect;
    this.acceleration.y = dy * settings.particles.effect;
    this.age = 0;
  }
  
  // 更新粒子状态
  update(deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    this.age += deltaTime;
  }
  
  // 绘制粒子
  draw(context, image) {
    // 缓动函数
    const ease = (t) => --t * t * t + 1;
    
    const size = image.width * ease(this.age / settings.particles.duration);
    context.globalAlpha = 1 - this.age / settings.particles.duration;
    context.drawImage(
      image,
      this.position.x - size / 2,
      this.position.y - size / 2,
      size,
      size
    );
  }
}

// 粒子池类：管理所有粒子
class ParticlePool {
  constructor(length) {
    this.particles = new Array(length);
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i] = new Particle();
    }
    
    this.firstActive = 0;  // 第一个活跃粒子的索引
    this.firstFree = 0;    // 第一个空闲粒子的索引
    this.duration = settings.particles.duration;
  }
  
  // 添加新粒子
  add(x, y, dx, dy) {
    this.particles[this.firstFree].initialize(x, y, dx, dy);
    
    // 处理循环队列
    this.firstFree++;
    if (this.firstFree === this.particles.length) this.firstFree = 0;
    if (this.firstActive === this.firstFree) this.firstActive++;
    if (this.firstActive === this.particles.length) this.firstActive = 0;
  }
  
  // 更新所有活跃粒子
  update(deltaTime) {
    if (this.firstActive < this.firstFree) {
      for (let i = this.firstActive; i < this.firstFree; i++) {
        this.particles[i].update(deltaTime);
      }
    } else if (this.firstFree < this.firstActive) {
      for (let i = this.firstActive; i < this.particles.length; i++) {
        this.particles[i].update(deltaTime);
      }
      for (let i = 0; i < this.firstFree; i++) {
        this.particles[i].update(deltaTime);
      }
    }
    
    // 移除过期粒子
    while (
      this.particles[this.firstActive].age >= this.duration && 
      this.firstActive !== this.firstFree
    ) {
      this.firstActive++;
      if (this.firstActive === this.particles.length) this.firstActive = 0;
    }
  }
  
  // 绘制所有活跃粒子
  draw(context, image) {
    if (this.firstActive < this.firstFree) {
      for (let i = this.firstActive; i < this.firstFree; i++) {
        this.particles[i].draw(context, image);
      }
    } else if (this.firstFree < this.firstActive) {
      for (let i = this.firstActive; i < this.particles.length; i++) {
        this.particles[i].draw(context, image);
      }
      for (let i = 0; i < this.firstFree; i++) {
        this.particles[i].draw(context, image);
      }
    }
  }
}

// 获取画布元素
const canvas = document.getElementById("pinkboard");
const context = canvas.getContext("2d");

// 创建粒子池
const particles = new ParticlePool(settings.particles.length);
const particleRate = settings.particles.length / settings.particles.duration;

// 时间变量
let lastTime = 0;

// 计算心形曲线上的点
function pointOnHeart(t) {
  return new Point(
    160 * Math.pow(Math.sin(t), 3),
    130 * Math.cos(t) - 
      50 * Math.cos(2 * t) - 
      20 * Math.cos(3 * t) - 
      10 * Math.cos(4 * t) + 
      25
  );
}

// 创建爱心图像
const heartImage = (function createHeartImage() {
  const tempCanvas = document.createElement("canvas");
  const tempContext = tempCanvas.getContext("2d");
  
  tempCanvas.width = settings.particles.size;
  tempCanvas.height = settings.particles.size;
  
  // 绘制心形路径
  tempContext.beginPath();
  let t = -Math.PI;
  let point = transformHeartPoint(t);
  tempContext.moveTo(point.x, point.y);
  
  while (t < Math.PI) {
    t += 0.01;
    point = transformHeartPoint(t);
    tempContext.lineTo(point.x, point.y);
  }
  tempContext.closePath();
  
  // 填充颜色
  tempContext.fillStyle = "#ea80b0";
  tempContext.fill();
  
  // 创建图像
  const image = new Image();
  image.src = tempCanvas.toDataURL();
  return image;
  
  // 转换心形点坐标
  function transformHeartPoint(t) {
    const point = pointOnHeart(t);
    point.x = settings.particles.size / 2 + (point.x * settings.particles.size) / 350;
    point.y = settings.particles.size / 2 - (point.y * settings.particles.size) / 350;
    return point;
  }
})();

// 渲染循环
function render() {
  requestAnimationFrame(render);
  
  const currentTime = new Date().getTime() / 1000;
  const deltaTime = currentTime - (lastTime || currentTime);
  lastTime = currentTime;
  
  // 清除画布
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // 添加新粒子
  const particleCount = particleRate * deltaTime;
  for (let i = 0; i < particleCount; i++) {
    const pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
    const dir = pos.clone().length(settings.particles.velocity);
    particles.add(
      canvas.width / 2 + pos.x,
      canvas.height / 2 - pos.y,
      dir.x,
      -dir.y
    );
  }
  
  // 更新并绘制粒子
  particles.update(deltaTime);
  particles.draw(context, heartImage);
}

// 调整画布大小
function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

// 监听窗口大小变化
window.addEventListener('resize', resizeCanvas);

// 初始化并开始渲染
setTimeout(() => {
  resizeCanvas();
  render();
}, 10);
