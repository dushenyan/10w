const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d')


canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

var texts = '0123456789'.split('');
const fontSize = 16
const colunm = canvas.width / fontSize

const s = []


for(let x =0;x<colunm;x++){
  s[x] = 1
}


function drwa(){
  //让背景逐渐由透明到不透明
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  //文字颜色
  ctx.fillStyle = '#0F0';
  ctx.font = fontSize + 'px arial';
  //逐行输出文字
  for (var i = 0; i < s.length; i++) {
      var text = texts[Math.floor(Math.random() * texts.length)];
      ctx.fillText(text, i * fontSize, s[i] * fontSize);

      if (s[i] * fontSize > canvas.height || Math.random() > 0.95) {
          s[i] = 0;
      }

      s[i]++;
  }
}

setInterval(drwa,33)

