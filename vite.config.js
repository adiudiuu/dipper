import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
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
