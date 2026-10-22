import Phaser from 'phaser';
import { DongHoColors, DongHoHex } from '../config/theme';
import { TIERS_LIST, WORLD_WIDTH, VIEWPORT_HEIGHT } from '../constants/tiers';
import { sound } from '../services/soundService';

export class TierNavigatorModal extends Phaser.GameObjects.Container {
  public isOpen = false;
  private onSelectTier: (floorId: number) => void;
  private unlockedFloors = 1;
  private modalBox!: Phaser.GameObjects.Container;
  private rowsContainer!: Phaser.GameObjects.Container;

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

    // =========================================================
    // 1. Lớp phủ đen mờ (Dark Overlay Alpha) toàn màn hình
    // Chạm vào vùng ngoài hộp thoại để đóng modal
    // =========================================================
    const dimmer = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.65);
    dimmer.setInteractive();
    dimmer.on('pointerdown', () => this.close());
    this.add(dimmer);

    // =========================================================
    // 2. Khung hộp thoại Chiếu Thư / Mộc Bản Cổ
    // =========================================================
    this.modalBox = this.scene.add.container(width / 2, height / 2);

    const boxWidth = 580;
    const boxHeight = 720;

    // Nền giấy Điệp cổ phong
    const boxBg = this.scene.add.rectangle(0, 0, boxWidth, boxHeight, DongHoHex.giayDiep, 0.98);
    boxBg.setStrokeStyle(4, DongHoHex.thanDen);

    // Khung chỉ son kép trang trí phong cách mộc bản
    const innerBorder = this.scene.add.rectangle(0, 0, boxWidth - 24, boxHeight - 24);
    innerBorder.setStrokeStyle(2, DongHoHex.doSon);

    // Tiêu đề modal phong cách thư pháp khắc gỗ
    const titleText = this.scene.add.text(0, -295, 'BẢN ĐỒ NGŨ TẦNG CANH TÁC', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '22px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const subText = this.scene.add.text(0, -265, 'Chạm vào tầng bất kỳ để lướt nhanh góc nhìn', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '13px',
      color: DongHoColors.doSonDark,
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Dấu triện son góc tiêu đề
    const sealBox = this.scene.add.rectangle(235, -295, 34, 34, DongHoHex.thanDen);
    sealBox.setStrokeStyle(1.5, DongHoHex.doSon);
    const sealText = this.scene.add.text(235, -295, '図', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '18px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Nút đóng "X" phong cách dân gian ở góc trên bên phải
    const closeCircle = this.scene.add.circle(boxWidth / 2 - 28, -boxHeight / 2 + 28, 20, DongHoHex.doSon);
    closeCircle.setStrokeStyle(2, DongHoHex.thanDen);
    closeCircle.setInteractive({ useHandCursor: true });

    const closeXText = this.scene.add.text(boxWidth / 2 - 28, -boxHeight / 2 + 28, '✕', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '18px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    closeCircle.on('pointerdown', () => {
      sound.playBambooClick();
      this.close();
    });

    this.modalBox.add([
      boxBg,
      innerBorder,
      titleText,
      subText,
      sealBox,
      sealText,
      closeCircle,
      closeXText
    ]);

    // Container chứa danh sách 5 tầng
    this.rowsContainer = this.scene.add.container(0, 0);
    this.modalBox.add(this.rowsContainer);

    this.renderTierRows();

    // =========================================================
    // 3. Nút Đóng Lại ở đáy hộp thoại
    // =========================================================
    const bottomCloseBtn = this.scene.add.container(0, 310);
    const bottomCloseBg = this.scene.add.rectangle(0, 0, 160, 44, DongHoHex.doSon);
    bottomCloseBg.setStrokeStyle(2, DongHoHex.thanDen);
    bottomCloseBg.setInteractive({ useHandCursor: true });

    const bottomCloseText = this.scene.add.text(0, 0, 'ĐÓNG LẠI', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '14px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    bottomCloseBtn.add([bottomCloseBg, bottomCloseText]);

    bottomCloseBg.on('pointerdown', () => {
      sound.playBambooClick();
      this.close();
    });

    this.modalBox.add(bottomCloseBtn);
    this.add(this.modalBox);
  }

  /**
   * Render danh mục 5 tầng canh tác (xếp từ trên xuống dưới: Tầng 5 -> Tầng 1)
   */
  private renderTierRows() {
    this.rowsContainer.removeAll(true);

    const reversedTiers = [...TIERS_LIST].reverse();
    const rowHeight = 88;
    const startY = -205;

    reversedTiers.forEach((tier, idx) => {
      const rowY = startY + idx * (rowHeight + 12);
      const row = this.scene.add.container(0, rowY);

      const isLocked = tier.id > this.unlockedFloors;

      // Nền hàng thẻ tầng
      const rowBg = this.scene.add.rectangle(
        0,
        0,
        510,
        rowHeight,
        isLocked ? DongHoHex.giayDiepDark : DongHoHex.thanDenSoft,
        0.92
      );
      rowBg.setStrokeStyle(2, isLocked ? DongHoHex.thanDen : DongHoHex.vangHoaHoe);
      rowBg.setInteractive({ useHandCursor: true });

      // Biểu tượng tầng
      const iconMap: Record<number, string> = {
        5: '🏛️',
        4: '📜',
        3: '🧱',
        2: '🍌',
        1: '🌊'
      };
      const tierIcon = isLocked ? '🔒' : (iconMap[tier.id] || '🌾');
      const iconText = this.scene.add.text(-215, 0, tierIcon, { fontSize: '26px' }).setOrigin(0.5);

      // Tên tầng
      const nameText = this.scene.add.text(-175, -16, tier.name, {
        fontFamily: "'Playfair Display', serif",
        fontSize: '16px',
        color: isLocked ? DongHoColors.thanDenSoft : DongHoColors.vangHoaHoe,
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      // Mô tả tầng / NPC phụ trách / Yêu cầu mở khóa
      const descText = this.scene.add.text(-175, 14, isLocked ? tier.unlockReqDesc : `Phụ trách: ${tier.character}`, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '12px',
        color: isLocked ? DongHoColors.doSonDark : DongHoColors.trangXac
      }).setOrigin(0, 0.5);

      // Nút hành động đến ngay
      const actionText = this.scene.add.text(200, 0, isLocked ? 'CHƯA MỞ' : 'ĐẾN NGAY ➔', {
        fontFamily: "'Playfair Display', serif",
        fontSize: '12px',
        color: isLocked ? DongHoColors.thanDenSoft : DongHoColors.vangHoaHoe,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      row.add([rowBg, iconText, nameText, descText, actionText]);

      // Hiệu ứng tương tác chọn tầng
      rowBg.on('pointerdown', () => {
        sound.playBambooClick();
        // Co nhẹ hàng khi bấm
        this.scene.tweens.add({
          targets: row,
          scaleX: 0.97,
          scaleY: 0.97,
          duration: 70,
          yoyo: true,
          onComplete: () => {
            this.onSelectTier(tier.id);
            this.close();
          }
        });
      });

      this.rowsContainer.add(row);
    });
  }

  /**
   * Mở modal và làm mới trạng thái khóa/mở của các tầng
   */
  public open(unlockedFloors: number) {
    this.unlockedFloors = unlockedFloors;
    this.renderTierRows();

    this.isOpen = true;
    this.setVisible(true);
    this.setAlpha(0);

    // Hiệu ứng nảy mở popup (Pop-in animation)
    this.modalBox.setScale(0.9);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 200,
      ease: 'Cubic.easeOut'
    });
    this.scene.tweens.add({
      targets: this.modalBox,
      scaleX: 1,
      scaleY: 1,
      duration: 220,
      ease: 'Back.easeOut'
    });
  }

  /**
   * Đóng modal êm ái
   */
  public close() {
    this.isOpen = false;
    this.scene.tweens.add({
      targets: this.modalBox,
      scaleX: 0.92,
      scaleY: 0.92,
      duration: 150,
      ease: 'Cubic.easeIn'
    });
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 160,
      ease: 'Cubic.easeIn',
      onComplete: () => this.setVisible(false)
    });
  }
}
