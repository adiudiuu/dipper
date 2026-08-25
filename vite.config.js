import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three'
        }
      }
    }
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js']
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    open: false,
    watch: {
      // Windows: avoid EBUSY when native fs.watch hits locked texture files
      ignored: ['**/public/textures/**']
    }
  }
})
