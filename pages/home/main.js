// 导入QRCode库
import QRCode from 'qrcode';

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
  // 获取所有显示二维码按钮
  const qrButtons = document.querySelectorAll('.qr-btn');
  const backButtons = document.querySelectorAll('.back-btn');
  
  // 为每个显示二维码按钮添加点击事件
  qrButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // 获取URL
      const url = button.getAttribute('data-url');
      // 获取卡片元素
      const card = button.closest('.card');
      // 获取二维码容器
      const qrContainer = card.querySelector('.qr-container');
      
      // 生成二维码
      generateQRCode(url, qrContainer);
      
      // 翻转卡片
      card.classList.add('flipped');
    });
  });
  
  // 为每个返回按钮添加点击事件
  backButtons.forEach(button => {
    button.addEventListener('click', () => {
      // 获取卡片元素
      const card = button.closest('.card');
      // 取消翻转
      card.classList.remove('flipped');
    });
  });
  
  // 添加卡片点击事件，点击卡片正面跳转到对应页面
  document.querySelectorAll('.card-front').forEach(front => {
    front.addEventListener('click', (e) => {
      // 如果点击的是按钮，不执行跳转
      if (e.target.classList.contains('qr-btn')) return;
      
      // 获取URL
      const button = front.querySelector('.qr-btn');
      const url = button.getAttribute('data-url');
      
      // 跳转到对应页面
      window.location.href = url;
    });
  });
});

// 生成二维码函数
function generateQRCode(url, container) {
  // 获取完整URL（包含主机名）
  const fullUrl = new URL(url, window.location.origin).href;
  
  // 清空容器
  container.innerHTML = '';
  
  // 创建 canvas 元素
  const canvas = document.createElement('canvas');
  
  // 生成二维码
  QRCode.toCanvas(
    canvas, 
    fullUrl, 
    { 
      width: 150,
      margin: 1,
      color: {
        dark: '#4a6bdf',
        light: '#ffffff'
      }
    },
    (error) => {
      if (error) console.error(error);
      // 将 canvas 添加到容器中
      container.appendChild(canvas);
    }
  );
}
