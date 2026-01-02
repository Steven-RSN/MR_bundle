// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    mkcert(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Marche et Ramasse',
        short_name: 'MarcheRamasse',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#42b883',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],

  test: {
    environment: 'jsdom',
  },

  server: {
    host: true,
    https: true,
    proxy: {
      '/api': {
        target: 'http://192.168.1.63:3000',
        changeOrigin: false,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})
