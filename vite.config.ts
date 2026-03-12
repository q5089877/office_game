import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 載入環境變數
  const env = loadEnv(mode, process.cwd(), '');

  return {
    /**
     * 1. 修正路徑問題：
     * 使用 './' (相對路徑) 是最保險的做法，
     * 這樣無論您的 GitHub 專案名稱是 office_game 還是其他名稱，都能正確讀取資源。
     */
    base: './',

    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        // 設定 @ 指向專案根目錄
        '@': path.resolve(__dirname, '.'),
      },
    },

    /**
     * 2. 指定輸出資料夾：
     * 將原本的 'dist' 改為 'docs'，這是為了配合 GitHub Pages 的部署設定。
     */
    build: {
      outDir: 'docs',
      // 確保每次 build 都會先清空舊檔案
      emptyOutDir: true,
    },

    server: {
      // HMR 相關設定 (維持您原本的設定)
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});