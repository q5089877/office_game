import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    // 1. 加入 base，這會解決資源找不到 (404) 的問題
    // 請確認您的 GitHub 儲存庫名稱是否為 OFFICE (大小寫需一致)
    base: '/OFFICE/', 

    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    
    // 2. 加入 build 設定，將產出的資料夾名稱改為 docs
    build: {
      outDir: 'docs',
    },

    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});