import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    open: false,
    watch: {
      // Windows: avoid EBUSY when native fs.watch hits locked texture files
      ignored: ['**/public/textures/**']
    }
  }
})
