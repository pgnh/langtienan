import Phaser from 'phaser';
import confetti from 'canvas-confetti';
import { DongHoColors, DongHoHex } from '../config/theme';
import { sound } from '../services/soundService';

export interface FlyRewardOptions {
  scene: Phaser.Scene;
  startX: number;
  startY: number;
  targetX?: number;
  targetY?: number;
  icon?: string;
  count?: number;
  onTargetReached?: () => void;
}

export interface BurstParticleOptions {
  scene: Phaser.Scene;
  x: number;
  y: number;
  colorHex?: number;
  particleCount?: number;
}

/**
 * Hiệu ứng bùng nổ hạt phong cách dân gian (Folk Particle Burst) tại vị trí ô đất
 */
export function playHarvestBurst(options: BurstParticleOptions) {
  const { scene, x, y, particleCount = 16 } = options;

  // Sử dụng canvas-confetti tạo hạt pháo hoa mộc bản rực rỡ
  // Chuyển đổi tọa độ game sang tỷ lệ màn hình (viewport ratio)
  const camera = scene.cameras.main;
  const screenX = (x - camera.scrollX) / camera.width;
  const screenY = (y - camera.scrollY) / camera.height;

  confetti({
    particleCount: 38,
    spread: 55,
    origin: {
      x: Phaser.Math.Clamp(screenX, 0.1, 0.9),
      y: Phaser.Math.Clamp(screenY, 0.1, 0.9)
    },
    colors: ['#E5A823', '#9A422D', '#D9C28D', '#2A4B6E', '#FFFFFF'],
    ticks: 120,
    gravity: 1.1,
    scalar: 0.85
  });

  // Tạo các tia sao nhỏ trực tiếp trong Phaser Game Layer
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const speed = Phaser.Math.Between(45, 95);
    const star = scene.add.text(x, y, '✨', {
      fontSize: `${Phaser.Math.Between(12, 18)}px`
    }).setOrigin(0.5).setDepth(40);

    const destX = x + Math.cos(angle) * speed;
    const destY = y + Math.sin(angle) * speed;

    scene.tweens.add({
      targets: star,
      x: destX,
      y: destY,
      alpha: 0,
      scale: 0.4,
      duration: Phaser.Math.Between(450, 750),
      ease: 'Cubic.easeOut',
      onComplete: () => star.destroy()
    });
  }
}

/**
 * Hiệu ứng các icon đồng tiền vàng / nông sản bay vút theo đường cong Bezier
 * hướng về hộp số dư trên TopStatusBar (Top Bar Gold Pill: x ~ 370, y ~ 67)
 */
export function spawnFlyingRewards(options: FlyRewardOptions) {
  const {
    scene,
    startX,
    startY,
    targetX = 370,
    targetY = 67,
    icon = '🪙',
    count = 6,
    onTargetReached
  } = options;

  for (let i = 0; i < count; i++) {
    // Trễ so le giữa các đồng tiền bay
    const delay = i * 65;

    scene.time.delayedCall(delay, () => {
      // Icon đồng vàng / nông sản
      const flyingObj = scene.add.text(startX, startY, icon, {
        fontSize: '22px'
      }).setOrigin(0.5).setDepth(100);

      // Điểm uốn cong Bezier ngẫu nhiên hai bên
      const spreadX = Phaser.Math.Between(-80, 80);
      const midX = (startX + targetX) / 2 + spreadX;
      const midY = Math.min(startY, targetY) - Phaser.Math.Between(60, 140);

      // Hoạt ảnh bay theo đường cong Bezier qua biến t (0 -> 1)
      const tweenData = { t: 0 };

      scene.tweens.add({
        targets: tweenData,
        t: 1,
        duration: Phaser.Math.Between(650, 850),
        ease: 'Cubic.easeInOut',
        onUpdate: () => {
          const t = tweenData.t;
          // Công thức đường cong Quadratic Bezier: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
          const currentX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * targetX;
          const currentY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * targetY;

          flyingObj.setPosition(currentX, currentY);
          flyingObj.setScale(1 + Math.sin(t * Math.PI) * 0.35); // Phồng nhẹ giữa đường bay
        },
        onComplete: () => {
          flyingObj.destroy();
          sound.playCoinChime();

          // Khi đồng tiền đầu tiên hoặc cuối cùng chạm đích
          if (i === count - 1 && onTargetReached) {
            onTargetReached();
          }
        }
      });
    });
  }
}
