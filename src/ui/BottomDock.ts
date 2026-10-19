import Phaser from 'phaser';
import { DongHoColors, DongHoHex } from '../config/theme';
import { NavTabId, NavButtonConfig } from '../types/hud';
import { sound } from '../services/soundService';

export class BottomDock extends Phaser.GameObjects.Container {
  private buttons: Map<NavTabId, Phaser.GameObjects.Container> = new Map();
  private onTabClick: (tabId: NavTabId) => void;

  constructor(scene: Phaser.Scene, onTabClick: (tabId: NavTabId) => void) {
    super(scene, 0, 1180);
    this.onTabClick = onTabClick;

    this.createDock();
    scene.add.existing(this);
  }

  private createDock() {
    const dockWidth = 720;
    const dockHeight = 100;

    // Nền mộc bản đế dưới cùng
    const bg = this.scene.add.rectangle(dockWidth / 2, dockHeight / 2, dockWidth - 12, dockHeight, DongHoHex.giayDiep, 0.98);
    bg.setStrokeStyle(3, DongHoHex.thanDen);
    this.add(bg);

    const navConfigs: NavButtonConfig[] = [
      { id: 'map', label: 'BẢN ĐỒ', subLabel: '5 Tầng', icon: '🗺️' },
      { id: 'store', label: 'TẠP HÓA', subLabel: 'Gieo & Bán', icon: '🛒' },
      { id: 'woodblock', label: 'KHẮC GỖ', subLabel: 'Mộc Bản', icon: '🪵' },
      { id: 'achievements', label: 'SỔ ĐINH', subLabel: 'Thành Tích', icon: '📜' }
    ];

    const btnWidth = 155;
    const startX = 45 + btnWidth / 2;
    const gap = 162;

    navConfigs.forEach((cfg, idx) => {
      const btnX = startX + idx * gap;
      const btnY = dockHeight / 2;

      const btnContainer = this.scene.add.container(btnX, btnY);

      // Nền nút bấm
      const btnBg = this.scene.add.rectangle(0, 0, btnWidth, 76, DongHoHex.giayDiepDark);
      btnBg.setStrokeStyle(2.5, DongHoHex.thanDen);
      btnBg.setInteractive({ useHandCursor: true });

      // Biểu tượng icon
      const iconText = this.scene.add.text(0, -16, cfg.icon, {
        fontSize: '24px'
      }).setOrigin(0.5);

      // Tiêu đề chính
      const labelText = this.scene.add.text(0, 12, cfg.label, {
        fontFamily: "'Playfair Display', serif",
        fontSize: '13px',
        color: DongHoColors.thanDen,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // Phụ đề
      const subText = this.scene.add.text(0, 26, cfg.subLabel, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '10px',
        color: DongHoColors.doSonDark
      }).setOrigin(0.5);

      btnContainer.add([btnBg, iconText, labelText, subText]);

      // Hiệu ứng tương tác chạm
      btnBg.on('pointerdown', () => {
        sound.playBambooClick();
        this.scene.tweens.add({
          targets: btnContainer,
          scaleX: 0.94,
          scaleY: 0.94,
          duration: 80,
          yoyo: true,
          onComplete: () => this.onTabClick(cfg.id)
        });
      });

      this.buttons.set(cfg.id, btnContainer);
      this.add(btnContainer);
    });
  }

  public highlightTab(tabId: NavTabId | null) {
    this.buttons.forEach((btn, id) => {
      const bg = btn.getAt(0) as Phaser.GameObjects.Rectangle;
      if (id === tabId) {
        bg.setFillStyle(DongHoHex.doSon);
        bg.setStrokeStyle(3, DongHoHex.vangHoaHoe);
      } else {
        bg.setFillStyle(DongHoHex.giayDiepDark);
        bg.setStrokeStyle(2.5, DongHoHex.thanDen);
      }
    });
  }
}
