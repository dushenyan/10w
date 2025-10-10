const bgMusic = document.getElementById('bgMusic')

// 冒泡? 捕获?
document.body.addEventListener(
  'mousedown',
  () => {
    bgMusic.play()
  },
  false,
)
