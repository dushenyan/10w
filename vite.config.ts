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
        // 使用目录名作为入口点名称
        const dirName = basePath || 'home'
        entries[dirName] = fullPath
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
      // 确保每个入口都生成对应的 JS 文件
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
  },
  server: {
    open: '/pages/home/index.html' // 默认打开首页
  },
  // 添加这个配置确保静态资源正确处理
  publicDir: 'public'
})
