import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import alias from "@rollup/plugin-alias";
import resolve from "@rollup/plugin-node-resolve";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), alias()],
  build: {
    rollupOptions: {
      plugins: [
        resolve()
      ]
    },
  },
})
