// vite.config.js
import { defineConfig } from 'vite'
import { resolve } from 'path'
import fs from 'fs'

// 自动扫描 pages 目录下的 HTML 文件
function getPageEntries() {
  const pagesDir = resolve(__dirname, 'pages')
  const entries = {}
  
  function scanDirectory(dir, basePath = '') {
    const items = fs.readdirSync(dir)
    
    items.forEach(item => {
      const fullPath = resolve(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, basePath ? `${basePath}/${item}` : item)
      } else if (item === 'index.html') {
        const entryName = basePath || 'main'
        entries[entryName] = fullPath
      }
    })
  }
  
  scanDirectory(pagesDir)
  return entries
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: getPageEntries(),
    },
  },
  server: {
    open: '/pages/home/index.html' // 默认打开首页
  }
})
