import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: process.env.NODE_ENV === "production" ? "/helpBuy/" : "/",
  build: {
    // 程式碼分割配置
    rollupOptions: {
      output: {
        manualChunks: {
          // 將 Vue 核心分離
          vue: ["vue"],
          // 將 Supabase 分離（較大的依賴）
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
    // 啟用 CSS 程式碼分割
    cssCodeSplit: true,
    // 設定 chunk 大小警告閾值
    chunkSizeWarningLimit: 500,
    // 壓縮選項
    minify: "esbuild",
    // 生產環境移除 console 和 debugger
    esbuild: {
      drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
    },
  },
  // 優化依賴預構建
  optimizeDeps: {
    include: ["vue", "@supabase/supabase-js"],
  },
});
