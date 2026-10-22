import Phaser from 'phaser';
import { DongHoColors, DongHoHex } from '../config/theme';
import { NavTabId } from '../types/hud';
import { ASSET_KEYS } from '../constants/assets';
import { sound } from '../services/soundService';

interface DockButtonConfig {
  id: NavTabId;
  label: string;
  assetKey: string;
}

export class BottomDock extends Phaser.GameObjects.Container {
  private buttons: Map<NavTabId, Phaser.GameObjects.Container> = new Map();
  private onTabClick: (tabId: NavTabId) => void;

  constructor(scene: Phaser.Scene, onTabClick: (tabId: NavTabId) => void) {
    // Đặt ở sát đáy màn hình chuẩn 720 x 1280 (y = 1145, chiều cao dock 135px phủ xuống 1280)
    super(scene, 0, 1145);
    this.onTabClick = onTabClick;

    this.createDock();
    scene.add.existing(this);
  }

  private createDock() {
    const dockWidth = 720;
    const dockHeight = 135;

    // =========================================================
    // 1. Khung nền đế gỗ phong cách mộc bản Đông Hồ độc lập
    // =========================================================
    const dockBg = this.scene.add.rectangle(dockWidth / 2, dockHeight / 2, dockWidth, dockHeight, DongHoHex.giayDiepDark, 0.98);
    dockBg.setStrokeStyle(3, DongHoHex.thanDen);
    this.add(dockBg);

    // Đường viền trang trí son đỏ phía trên nẹp gỗ
    const topTrim = this.scene.add.rectangle(dockWidth / 2, 4, dockWidth, 4, DongHoHex.doSon);
    this.add(topTrim);

    // =========================================================
    // 2. Cấu hình 4 nút chức năng dạng mộc bản đồng đều
    // =========================================================
    const navConfigs: DockButtonConfig[] = [
      { id: 'map', label: 'Bản Đồ', assetKey: ASSET_KEYS.BTN_MAP },
      { id: 'store', label: 'Tiệm Tạp Hóa', assetKey: ASSET_KEYS.BTN_SHOP },
      { id: 'woodblock', label: 'Khắc Gỗ', assetKey: ASSET_KEYS.BTN_WOODCUT },
      { id: 'achievements', label: 'Thành Tích', assetKey: ASSET_KEYS.BTN_ACHIEVEMENT }
    ];

    const btnCount = navConfigs.length;
    const spacing = dockWidth / (btnCount + 1); // 720 / 5 = 144

    navConfigs.forEach((cfg, idx) => {
      const btnX = spacing * (idx + 1);
      const btnY = dockHeight / 2 + 2;

      const btnContainer = this.scene.add.container(btnX, btnY);

      // Icon nút mộc bản (dùng asset ảnh thực tế)
      let btnImage: Phaser.GameObjects.GameObject;

      if (this.scene.textures.exists(cfg.assetKey)) {
        const sprite = this.scene.add.image(0, -12, cfg.assetKey)
          .setDisplaySize(62, 62)
          .setInteractive({ useHandCursor: true });
        btnContainer.add(sprite);
        btnImage = sprite;
      } else {
        // Fallback ô vuông mộc bản
        const fallbackBox = this.scene.add.rectangle(0, -12, 58, 58, DongHoHex.giayDiepDark)
          .setStrokeStyle(2, DongHoHex.thanDen)
          .setInteractive({ useHandCursor: true });
        const fallbackText = this.scene.add.text(0, -12, '📦', { fontSize: '24px' }).setOrigin(0.5);
        btnContainer.add([fallbackBox, fallbackText]);
        btnImage = fallbackBox;
      }

      // Nhãn tiêu đề bên dưới nút
      const labelText = this.scene.add.text(0, 28, cfg.label, {
        fontFamily: "'Playfair Display', serif",
        fontSize: '13px',
        color: DongHoColors.thanDen,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      btnContainer.add(labelText);

      // =========================================================
      // 3. Hiệu ứng Button Bounce Tween:
      // Co nhỏ 0.95 khi pointerdown và nảy lại khi pointerup
      // =========================================================
      btnImage.on('pointerdown', () => {
        sound.playBambooClick();
        this.scene.tweens.add({
          targets: btnContainer,
          scaleX: 0.95,
          scaleY: 0.95,
          duration: 70,
          ease: 'Sine.easeInOut'
        });
      });

      btnImage.on('pointerup', () => {
        this.scene.tweens.add({
          targets: btnContainer,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 120,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.onTabClick(cfg.id);
          }
        });
      });

      btnImage.on('pointerout', () => {
        // Trả lại kích thước chuẩn nếu kéo ngón tay ra ngoài nút
        this.scene.tweens.add({
          targets: btnContainer,
          scaleX: 1.0,
          scaleY: 1.0,
          duration: 100,
          ease: 'Sine.easeOut'
        });
      });

      this.buttons.set(cfg.id, btnContainer);
      this.add(btnContainer);
    });
  }

  /**
   * Tạo hiệu ứng sáng nhẹ hoặc đổi màu khi tab được chọn
   */
  public highlightTab(tabId: NavTabId | null) {
    this.buttons.forEach((btn, id) => {
      const isSelected = id === tabId;
      btn.setAlpha(isSelected ? 1 : 0.85);
      if (isSelected) {
        this.scene.tweens.add({
          targets: btn,
          y: 58,
          duration: 150,
          ease: 'Sine.easeOut'
        });
      } else {
        this.scene.tweens.add({
          targets: btn,
          y: 62,
          duration: 150,
          ease: 'Sine.easeOut'
        });
      }
    });
  }
}
