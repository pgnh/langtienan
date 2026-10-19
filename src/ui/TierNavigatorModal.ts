import Phaser from 'phaser';
import { DongHoColors, DongHoHex } from '../config/theme';
import { TIERS_LIST } from '../constants/tiers';
import { sound } from '../services/soundService';

export class TierNavigatorModal extends Phaser.GameObjects.Container {
  public isOpen = false;
  private onSelectTier: (floorId: number) => void;
  private unlockedFloors = 1;

  constructor(scene: Phaser.Scene, onSelectTier: (floorId: number) => void) {
    super(scene, 0, 0);
    this.onSelectTier = onSelectTier;

    this.setVisible(false);
    this.createModal();
    scene.add.existing(this);
  }

  private createModal() {
    const width = 720;
    const height = 1280;

    // Lớp phủ đen mờ (Dimmer)
    const dimmer = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    dimmer.setInteractive();
    dimmer.on('pointerdown', () => this.close());
    this.add(dimmer);

    // Hộp thoại Chiếu Thư Cổ
    const modalBox = this.scene.add.container(width / 2, height / 2);
    const boxBg = this.scene.add.rectangle(0, 0, 560, 680, DongHoHex.giayDiep, 0.98);
    boxBg.setStrokeStyle(4, DongHoHex.thanDen);

    const innerLine = this.scene.add.rectangle(0, 0, 530, 650);
    innerLine.setStrokeStyle(2, DongHoHex.doSon);

    // Tiêu đề modal
    const titleT = this.scene.add.text(0, -280, 'BẢN ĐỒ NGŨ TẦNG CANH TÁC', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '20px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const subT = this.scene.add.text(0, -250, 'Chạm vào tầng để lướt nhanh góc nhìn', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '13px',
      color: DongHoColors.doSonDark,
      fontStyle: 'italic'
    }).setOrigin(0.5);

    modalBox.add([boxBg, innerLine, titleT, subT]);

    // Danh sách 5 tầng xếp từ trên xuống dưới (T5 -> T1)
    const reversedTiers = [...TIERS_LIST].reverse();
    reversedTiers.forEach((tier, idx) => {
      const rowY = -190 + idx * 95;
      const row = this.scene.add.container(0, rowY);

      const isLocked = tier.id > this.unlockedFloors;

      const rowBg = this.scene.add.rectangle(0, 0, 480, 80, isLocked ? DongHoHex.giayDiepDark : DongHoHex.thanDenSoft, 0.9);
      rowBg.setStrokeStyle(2, isLocked ? DongHoHex.thanDen : DongHoHex.vangHoaHoe);
      rowBg.setInteractive({ useHandCursor: true });

      const iconT = this.scene.add.text(-200, 0, isLocked ? '🔒' : '🌾', { fontSize: '24px' }).setOrigin(0.5);

      const nameT = this.scene.add.text(-160, -14, tier.name, {
        fontFamily: "'Playfair Display', serif",
        fontSize: '16px',
        color: isLocked ? DongHoColors.thanDenSoft : DongHoColors.vangHoaHoe,
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      const descT = this.scene.add.text(-160, 14, isLocked ? tier.unlockReqDesc : `Phụ trách: ${tier.character}`, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '12px',
        color: isLocked ? DongHoColors.doSonDark : DongHoColors.trangXac
      }).setOrigin(0, 0.5);

      const actionBtn = this.scene.add.text(190, 0, isLocked ? 'CHƯA MỞ' : 'ĐẾN NGAY ➔', {
        fontFamily: "'Playfair Display', serif",
        fontSize: '12px',
        color: isLocked ? DongHoColors.thanDenSoft : DongHoColors.vangHoaHoe,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      row.add([rowBg, iconT, nameT, descT, actionBtn]);

      rowBg.on('pointerdown', () => {
        sound.playBambooClick();
        this.onSelectTier(tier.id);
        this.close();
      });

      modalBox.add(row);
    });

    // Nút Đóng
    const closeBtn = this.scene.add.container(0, 290);
    const closeBg = this.scene.add.rectangle(0, 0, 140, 42, DongHoHex.doSon);
    closeBg.setStrokeStyle(2, DongHoHex.thanDen);
    closeBg.setInteractive({ useHandCursor: true });
    const closeT = this.scene.add.text(0, 0, 'ĐÓNG LẠI', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '13px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    closeBtn.add([closeBg, closeT]);
    closeBg.on('pointerdown', () => this.close());
    modalBox.add(closeBtn);

    this.add(modalBox);
  }

  public open(unlockedFloors: number) {
    this.unlockedFloors = unlockedFloors;
    this.isOpen = true;
    this.setVisible(true);
    this.setAlpha(0);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 200,
      ease: 'Cubic.easeOut'
    });
  }

  public close() {
    this.isOpen = false;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 180,
      ease: 'Cubic.easeIn',
      onComplete: () => this.setVisible(false)
    });
  }
}
