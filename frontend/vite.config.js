//import { defineConfig } from 'vite'
//import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
//export default defineConfig({
//  plugins: [vue()],
//})

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "codemirror": "codemirror/lib/codemirror.js",
    },
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
});

