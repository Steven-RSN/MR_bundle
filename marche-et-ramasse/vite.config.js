// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig(({ mode }) => {
  // Le mode `ci` est forcé dans GitHub Actions via `vite --mode ci`.
  // On l'utilise en plus de CI=true pour éviter toute ambiguïté.
  const isCI = process.env.CI === 'true' || mode === 'ci'

  return {
    plugins: [
      vue(),
      tailwindcss(),
      // mkcert uniquement en local
      ...(isCI ? [] : [mkcert()]),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW', // service worker généré automatiquement
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
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg}'], // précharge tous les fichiers
        runtimeCaching: [
          {
            urlPattern: /\/.*/,       // toutes les routes de ton app
            handler: 'NetworkFirst',   // essaie réseau sinon cache
            options: {
              cacheName: 'pages-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 }, // 7 jours
            },
          },
        ],
      }
    })
    ],

    test: {
      environment: 'jsdom',
    },

    server: {
      host: true,
      // HTTPS uniquement en local
      https: !isCI,
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://192.168.1.63:3000',
          changeOrigin: false,
          rewrite: path => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
