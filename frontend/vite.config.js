import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": "/src", // 用于简化路径引用，使用 `@` 来引用 `src` 目录
    },
  },
  server: {
    hmr: {
      overlay: false, // 禁用错误覆盖
    },
    proxy: {
      // 将所有以 `/api` 开头的请求代理到后端服务器
      "/codeforces-problem": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/codeforces-problem/, "/codeforces-problem"),
      },
      "/run-code": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/run-code/, "/run-code"),
      },
    },
  },
});

