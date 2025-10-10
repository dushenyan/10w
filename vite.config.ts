import { defineConfig } from 'vite'
import { resolve } from 'path'
import fs from 'fs'

function getPageEntries() {
  const pagesDir = resolve(__dirname, 'pages')
  const entries: Record<string, string> = {}
  
  function scanDirectory(dir: string, basePath = '') {
    const items = fs.readdirSync(dir)
    
    items.forEach(item => {
      const fullPath = resolve(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, basePath ? `${basePath}/${item}` : item)
      } else if (item === 'index.html') {
        const dirName = basePath || 'home'
        entries[dirName] = fullPath
      }
    })
  }
  
  scanDirectory(pagesDir)
  return entries
}

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  const base = process.env.VITE_BASE_URL || (isProduction ? './' : '/')
  
  return {
    base,
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: getPageEntries(),
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        }
      }
    },
    server: {
      open: '/pages/home/index.html'
    },
    publicDir: 'public'
  }
})
