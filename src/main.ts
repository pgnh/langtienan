import Phaser from 'phaser';
import { gameConfig } from './config/gameConfig';

// Khởi chạy game Phaser 3
window.addEventListener('DOMContentLoaded', () => {
  const game = new Phaser.Game(gameConfig);

  // Đăng ký Service Worker cho PWA nếu trình duyệt hỗ trợ
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Đăng ký Service Worker thất bại:', err);
      });
    });
  }

  console.log('🌾 Làng Tiền An PWA - Phaser 3 Game Engine đã sẵn sàng!');
  return game;
});
