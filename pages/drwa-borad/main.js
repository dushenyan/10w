const myCanvas = document.getElementById('MyCanvas')
const save_image = document.getElementById('save_image')
const ctx = myCanvas.getContext('2d')

const slt_width = document.getElementById('sltWidth')
const slt_color = document.getElementById('sltColor')

const clear_draw = document.getElementById('clear_draw')
let slt_w = slt_width.value
let slt_c = slt_color.value
let lastX = 0
let lastY = 0
let mouse_pressed = false

window.onload = function () {
  initThis()
}

function initThis() {
  // touch 手机触摸屏操作
  myCanvas.addEventListener(
    'touchstart',
    () => {
      console.log('tstart')
    },
    false,
  )

  myCanvas.addEventListener(
    'touchmove',
    () => {
      console.log('tmove')
    },
    false,
  )

  myCanvas.addEventListener(
    'touchend',
    () => {
      console.log('tend')
    },
    false,
  )

  // mouse 鼠标操作
  myCanvas.onmousedown = function (e) {
    // console.log('mmdown')
    mouse_pressed = true
    Draw(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, false)
  }

  myCanvas.onmousemove = function (e) {
    // console.log('mmove')
    if (mouse_pressed)
      Draw(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true)
  }
  myCanvas.onmouseup = function () {
    // console.log('mup')
    mouse_pressed = false
  }
}

slt_width.addEventListener('change', e => (slt_w = e.target.value))

slt_color.addEventListener('change', e => (slt_c = e.target.value))

function Draw(x, y, is_down) {
  if (is_down) {
    ctx.beginPath()
    ctx.strokeStyle = slt_c
    ctx.lineWidth = slt_w
    ctx.lineJoin = 'round'
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.closePath()
    ctx.stroke()
  }

  lastX = x
  lastY = y
}

clear_draw.onclick = function () {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

function saveImage() {
  const image = myCanvas
    .toDataURL('image/png')
    .replace('image/png', 'image/octet-stream')
  const image_span = document.createElement('span')
  image_span.innerHTML = `<image src='${image}'  alt="canvas Image Info"/>`
  if (save_image.getElementsByTagName('span') >= 1) {
    const span_old = save_image.getElementsByTagName('span')[0]
    save_image.replaceChild(ctximg, span_old)
  }
  else {
    save_image.appendChild(image_span)
  }
}
