import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  base: process.env.NODE_ENV === "production" ? "/helpBuy/" : "/", // 將 'helpBuy' 替換成您的 repository 名稱
});
