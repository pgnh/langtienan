import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'Làng Tiền An - Nông Trại Mộc Bản',
        short_name: 'Làng Tiền An',
        description: 'Web Game PWA Nông Trại Cuộn Dọc Mộc Bản Đông Hồ & Văn Học Hiện Thực',
        theme_color: '#9A422D',
        background_color: '#D9C28D',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    open: false
  }
});
