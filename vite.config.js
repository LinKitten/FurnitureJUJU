import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

//引入路径模块
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 配置端口
  server: {
    port: 3000,
    // 设置接口请求代理
    proxy: {
      '/shop': {
        target: "http://www.fast.com/shop",
        changeOrigin: true,//允许跨域
        rewrite: (path) => path.replace(/^\/shop/, ''), //替换/shop前缀，放防止多个api接口
      }
    }
  },
  resolve: {
    alias: {
      //配置了一个路径的别名，@ == 代表就是一个绝对路径 会指向到的 src目录下
      "@": path.resolve(__dirname, "src"),
    }
  }

})
