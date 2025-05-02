import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    (monacoEditorPlugin as any).default({
      languageWorkers: ['editorWorkerService', 'json', 'html', 'typescript', 'css'],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'docs', // thư mục output thay vì dist
    rollupOptions: {
      output: {
        manualChunks(id) {
          console.log('🚀 ~ vite.config.ts:30 ~ manualChunks ~ id:', id)
          if (id.includes('node_modules/monaco-editor')) {
            return 'vendor_monaco_editor'
          }
          // else if (id.includes('node_modules/ant-design-vue')) {
          //   return 'vendor_ant_design_vue'
          // } else if (id.includes('node_modules/@ant-design/icons')) {
          //   return 'vendor_ant_design_icon'
          // } else if (id.includes('node_modules/lodash')) {
          //   return 'vendor_lodash'
          // } else if (id.includes('node_modules/monaco-editor')) {
          //   return 'vendor_monaco_editor'
          // } else if (id.includes('node_modules')) {
          //   return 'vendor'
          // } else if (id.includes('src/modules')) {
          //   // return 'src_modules'
          // } else if (id.includes('src/common')) {
          //   return 'src_common'
          // }
        },
      },
    },
  },
})
