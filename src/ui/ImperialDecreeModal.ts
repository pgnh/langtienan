import Phaser from 'phaser';
import { DongHoColors, DongHoHex } from '../config/theme';
import { TIERS_DATA } from '../constants/tiers';
import { sound } from '../services/soundService';

export interface ImperialDecreeModalOptions {
  onConfirmUnlock: (floorId: number) => Promise<void> | void;
  getUserGold: () => number;
  getUserLevel: () => number;
}

/**
 * ImperialDecreeModal - Modal Chiếu Thư Khai Mở Tầng Đất Mới
 * Thiết kế khung chiếu thư sắc phong viền dây thừng gỗ (dựa theo ref: 4. Chiếu thư khai mở.jpg)
 * - Tuyên cáo điều kiện khai hoang lập tầng mới (Vàng Nén + Cấp độ Phú Ông).
 * - Nút "KHAI HOANG LẬP TẦNG" đóng dấu triện son đỏ bốc khói rực rỡ và nút "ĐỂ SAU".
 */
export class ImperialDecreeModal extends Phaser.GameObjects.Container {
  public isOpen = false;
  private targetFloorId: number = 2;

  private dimmer!: Phaser.GameObjects.Rectangle;
  private scrollContainer!: Phaser.GameObjects.Container;
  private titleText!: Phaser.GameObjects.Text;
  private decreeBodyText!: Phaser.GameObjects.Text;
  private reqGoldText!: Phaser.GameObjects.Text;
  private reqLevelText!: Phaser.GameObjects.Text;
  private confirmBtn!: Phaser.GameObjects.Container;
  private confirmBtnBg!: Phaser.GameObjects.Rectangle;
  private confirmBtnText!: Phaser.GameObjects.Text;

  private onConfirmUnlock: (floorId: number) => Promise<void> | void;
  private getUserGold: () => number;
  private getUserLevel: () => number;

  private modalWidth = 620;
  private modalHeight = 720;

  constructor(scene: Phaser.Scene, options: ImperialDecreeModalOptions) {
    super(scene, 0, 0);

    this.onConfirmUnlock = options.onConfirmUnlock;
    this.getUserGold = options.getUserGold;
    this.getUserLevel = options.getUserLevel;

    this.createUI();
    this.setVisible(false);
    scene.add.existing(this);
  }

  private createUI() {
    // 1. Lớp phủ mờ nền
    this.dimmer = this.scene.add.rectangle(360, 640, 720, 1280, 0x000000, 0.7);
    this.dimmer.setInteractive();
    this.dimmer.on('pointerdown', () => this.close());
    this.add(this.dimmer);

    // 2. Container cuộn chiếu thư sắc phong
    this.scrollContainer = this.scene.add.container(360, 640);

    // Nền cuộn sắc phong giấy điệp hoàng kim
    const scrollBg = this.scene.add.rectangle(0, 0, this.modalWidth, this.modalHeight, DongHoHex.giayDiep, 0.98);
    scrollBg.setStrokeStyle(5, DongHoHex.thanDen);
    this.scrollContainer.add(scrollBg);

    // Hai trục cuốn gỗ hai đầu chiếu thư (Top & Bottom Scroll Rollers)
    const topRoller = this.scene.add.rectangle(0, -this.modalHeight / 2, this.modalWidth + 30, 24, DongHoHex.vangHoaHoeDark);
    topRoller.setStrokeStyle(2, DongHoHex.thanDen);
    const bottomRoller = this.scene.add.rectangle(0, this.modalHeight / 2, this.modalWidth + 30, 24, DongHoHex.vangHoaHoeDark);
    bottomRoller.setStrokeStyle(2, DongHoHex.thanDen);
    this.scrollContainer.add([topRoller, bottomRoller]);

    // Viền triện son và hoa văn mây triều đình
    const innerBorder = this.scene.add.rectangle(0, 0, this.modalWidth - 26, this.modalHeight - 50);
    innerBorder.setStrokeStyle(2, DongHoHex.doSon);
    this.scrollContainer.add(innerBorder);

    // Dấu ấn triện hoàng gia trên đầu sắc phong
    const imperialSeal = this.scene.add.container(0, -this.modalHeight / 2 + 65);
    const sealBg = this.scene.add.circle(0, 0, 28, DongHoHex.doSon);
    sealBg.setStrokeStyle(2, DongHoHex.vangHoaHoe);
    const sealT = this.scene.add.text(0, 0, 'SẮC', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '18px',
      color: DongHoColors.vangHoaHoe,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    imperialSeal.add([sealBg, sealT]);
    this.scrollContainer.add(imperialSeal);

    // Tiêu đề sắc phong
    this.titleText = this.scene.add.text(0, -this.modalHeight / 2 + 125, 'CHIẾU THƯ KHAI HOANG', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '22px',
      color: DongHoColors.doSonDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const subTitle = this.scene.add.text(0, -this.modalHeight / 2 + 155, 'TRIỆU TẬP PHÚ ÔNG MỞ ĐẤT LẬP TẦNG', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '12px',
      color: DongHoColors.thanDen,
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Lời chiếu dụ trào phúng văn học Nam Cao
    this.decreeBodyText = this.scene.add.text(0, -70, '', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '14px',
      color: DongHoColors.thanDen,
      align: 'center',
      lineSpacing: 8,
      wordWrap: { width: 520 }
    }).setOrigin(0.5);

    // Khung điều kiện khai hoang
    const reqBox = this.scene.add.container(0, 95);
    const reqBoxBg = this.scene.add.rectangle(0, 0, 520, 105, DongHoHex.giayDiepDark, 0.85);
    reqBoxBg.setStrokeStyle(1.5, DongHoHex.thanDen);

    const reqTitle = this.scene.add.text(0, -32, 'ĐIỀU KIỆN KHAI MỞ SẮC LẬP', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '13px',
      color: DongHoColors.doSon,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.reqLevelText = this.scene.add.text(0, -6, '• Cấp Phú Ông yêu cầu: Cấp 3 (Hiện tại: Cấp 1)', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '13px',
      color: DongHoColors.thanDen
    }).setOrigin(0.5);

    this.reqGoldText = this.scene.add.text(0, 22, '• Lộ phí khai hoang: 1,000 🪙 Vàng Nén (Túi tiền: 150 🪙)', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '13px',
      color: DongHoColors.doSonDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    reqBox.add([reqBoxBg, reqTitle, this.reqLevelText, this.reqGoldText]);

    // 2 Nút bấm hành động: KHAI HOANG LẬP TẦNG & ĐỂ SAU
    this.confirmBtn = this.scene.add.container(0, 215);
    this.confirmBtnBg = this.scene.add.rectangle(0, 0, 320, 48, DongHoHex.doSon);
    this.confirmBtnBg.setStrokeStyle(2, DongHoHex.vangHoaHoe);
    this.confirmBtnBg.setInteractive({ useHandCursor: true });

    this.confirmBtnText = this.scene.add.text(0, 0, '🏮 KHAI HOANG LẬP TẦNG', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '14px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.confirmBtn.add([this.confirmBtnBg, this.confirmBtnText]);

    this.confirmBtnBg.on('pointerdown', () => this.handleConfirm());

    // Nút Để sau
    const postponeBtn = this.scene.add.container(0, 280);
    const postponeBg = this.scene.add.rectangle(0, 0, 160, 36, DongHoHex.thanDenSoft, 0.8);
    postponeBg.setStrokeStyle(1.5, DongHoHex.giayDiep);
    postponeBg.setInteractive({ useHandCursor: true });
    const postponeText = this.scene.add.text(0, 0, 'ĐỂ SAU', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '12px',
      color: DongHoColors.trangXac
    }).setOrigin(0.5);
    postponeBtn.add([postponeBg, postponeText]);

    postponeBg.on('pointerdown', () => {
      sound.playBambooClick();
      this.close();
    });

    this.scrollContainer.add([
      this.titleText,
      subTitle,
      this.decreeBodyText,
      reqBox,
      this.confirmBtn,
      postponeBtn
    ]);

    this.add(this.scrollContainer);
  }

  public open(floorId: number) {
    this.targetFloorId = floorId;
    this.isOpen = true;
    this.setVisible(true);

    const tier = TIERS_DATA[floorId];
    if (tier) {
      this.titleText.setText(`CHIẾU THƯ KHAI MỞ: ${tier.name.toUpperCase()}`);
      this.decreeBodyText.setText(
        `Phụng thiên thừa vận, hương lý truyền sắc:\nNay xét thấy dân làng cần cù canh tác bờ cõi vững vàng, chuẩn thuận cho phép khai khẩn ${tier.name} (${tier.alias}) để mở rộng nghiệp nông gia!`
      );

      const userGold = this.getUserGold();
      const userLevel = this.getUserLevel();
      const hasLevel = userLevel >= tier.unlockLevel;
      const hasGold = userGold >= tier.unlockGold;

      this.reqLevelText.setText(
        `• Cấp Phú Ông yêu cầu: Cấp ${tier.unlockLevel} (${hasLevel ? '✅ Đạt' : `❌ Hiện tại: Cấp ${userLevel}`})`
      );
      this.reqLevelText.setColor(hasLevel ? DongHoColors.xanhChamDark : '#FF4D4D');

      this.reqGoldText.setText(
        `• Lộ phí khai hoang: ${tier.unlockGold.toLocaleString()} 🪙 (${hasGold ? '✅ Đủ' : `❌ Túi có: ${userGold.toLocaleString()} 🪙`})`
      );
      this.reqGoldText.setColor(hasGold ? DongHoColors.doSonDark : '#FF4D4D');

      const canUnlock = hasLevel && hasGold;
      this.confirmBtnBg.setFillStyle(canUnlock ? DongHoHex.doSon : DongHoHex.thanDen);
      this.confirmBtnText.setColor(canUnlock ? DongHoColors.trangXac : DongHoColors.thanDenSoft);
      this.confirmBtnText.setText(canUnlock ? '🏮 KHAI HOANG LẬP TẦNG' : 'CHƯA ĐỦ ĐIỀU KIỆN');
    }

    this.dimmer.setAlpha(0);
    this.scrollContainer.setScale(0.9);

    this.scene.tweens.add({
      targets: this.dimmer,
      alpha: 0.7,
      duration: 220,
      ease: 'Linear'
    });

    this.scene.tweens.add({
      targets: this.scrollContainer,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    sound.playBambooClick();
  }

  public close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    this.scene.tweens.add({
      targets: this.dimmer,
      alpha: 0,
      duration: 180,
      ease: 'Linear'
    });

    this.scene.tweens.add({
      targets: this.scrollContainer,
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 180,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        this.setVisible(false);
      }
    });
  }

  private async handleConfirm() {
    const tier = TIERS_DATA[this.targetFloorId];
    if (!tier) return;

    const userGold = this.getUserGold();
    const userLevel = this.getUserLevel();

    if (userLevel < tier.unlockLevel) {
      sound.playBambooClick();
      this.scene.events.emit('SHOW_TOAST', `⚠️ Chưa đạt cấp độ Phú Ông yêu cầu (Cần Cấp ${tier.unlockLevel})!`);
      return;
    }

    if (userGold < tier.unlockGold) {
      sound.playBambooClick();
      this.scene.events.emit('SHOW_TOAST', `⚠️ Không đủ Vàng Nén khai hoang! Cần ${tier.unlockGold.toLocaleString()} 🪙.`);
      return;
    }

    sound.playCoinChime();
    await this.onConfirmUnlock(this.targetFloorId);
    this.close();
  }
}
