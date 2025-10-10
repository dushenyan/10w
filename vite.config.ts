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
        // 修改这里：使用页面名称作为入口名称，而不是路径
        const relativePath = resolve(fullPath).replace(resolve(pagesDir) + '/', '')
        const entryName = relativePath.replace('/index.html', '').replace(/\//g, '-')
        entries[entryName || 'home'] = fullPath
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
      output: {
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]'
      }
    },
  },
  server: {
    open: '/pages/home/index.html' // 默认打开首页
  }
})
