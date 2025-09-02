import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  base: './', // 确保打包后资源路径正确
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0', // 允许从任何IP访问
    port: 5173,      // 指定端口，与Electron配置保持一致
    proxy: {
      // 开发环境下代理API请求
      '/api': {
        target: 'http://117.72.79.92:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',  // 构建输出目录
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router'],
          vendor: ['@vueuse/core']
        }
      }
    }
  },
  assetsInclude: ['**/*.ttf', '**/*.woff', '**/*.woff2']
})
