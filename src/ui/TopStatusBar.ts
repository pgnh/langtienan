import Phaser from 'phaser';
import { DongHoColors, DongHoHex } from '../config/theme';
import { Profile } from '../types/database';
import { sound } from '../services/soundService';

export class TopStatusBar extends Phaser.GameObjects.Container {
  private goldText!: Phaser.GameObjects.Text;
  private fameText!: Phaser.GameObjects.Text;
  private paperText!: Phaser.GameObjects.Text;
  private muteBtnText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.createBar();
    scene.add.existing(this);
  }

  private createBar() {
    const width = 720;
    const height = 110;

    // Nền thanh trạng thái gỗ mộc bản
    const bg = this.scene.add.rectangle(width / 2, height / 2, width - 16, height - 12, DongHoHex.giayDiep, 0.96);
    bg.setStrokeStyle(3, DongHoHex.thanDen);
    this.add(bg);

    // Biển hiệu khắc gỗ "LÀNG TIỀN AN"
    const titleSign = this.scene.add.container(130, 48);
    const titleBg = this.scene.add.rectangle(0, 0, 190, 48, DongHoHex.doSon);
    titleBg.setStrokeStyle(2, DongHoHex.vangHoaHoe);
    const titleText = this.scene.add.text(0, 0, 'LÀNG TIỀN AN', {
      fontFamily: "'Playfair Display', 'Cinzel Decorative', serif",
      fontSize: '18px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    titleSign.add([titleBg, titleText]);
    this.add(titleSign);

    // Dấu triện son nhỏ
    const seal = this.scene.add.rectangle(242, 48, 30, 30, DongHoHex.thanDen);
    seal.setStrokeStyle(1.5, DongHoHex.doSon);
    const sealText = this.scene.add.text(242, 48, '安', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '16px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.add([seal, sealText]);

    // Cụm hiển thị 3 tài nguyên chính (Vàng Nén, Danh Vọng, Giấy Điệp)
    // 1. Vàng Nén
    const goldGroup = this.createPill(355, 48, '🪙', '150', DongHoHex.vangHoaHoeDark);
    this.goldText = goldGroup.text;
    this.add(goldGroup.container);

    // 2. Danh Vọng
    const fameGroup = this.createPill(475, 48, '🎖️', 'Cấp 1', DongHoHex.doSonDark);
    this.fameText = fameGroup.text;
    this.add(fameGroup.container);

    // 3. Giấy Điệp
    const paperGroup = this.createPill(585, 48, '📜', '10', DongHoHex.xanhChamDark);
    this.paperText = paperGroup.text;
    this.add(paperGroup.container);

    // Nút Bật/Tắt Âm thanh
    const muteBtn = this.scene.add.container(670, 48);
    const muteBg = this.scene.add.rectangle(0, 0, 42, 42, DongHoHex.giayDiepDark);
    muteBg.setStrokeStyle(2, DongHoHex.thanDen);
    muteBg.setInteractive({ useHandCursor: true });

    this.muteBtnText = this.scene.add.text(0, 0, '🔊', { fontSize: '20px' }).setOrigin(0.5);
    muteBtn.add([muteBg, this.muteBtnText]);

    muteBg.on('pointerdown', () => {
      const isMuted = sound.toggleMute();
      this.muteBtnText.setText(isMuted ? '🔇' : '🔊');
    });

    this.add(muteBtn);
  }

  private createPill(x: number, y: number, icon: string, initialVal: string, borderColor: number) {
    const container = this.scene.add.container(x, y);
    const bg = this.scene.add.rectangle(0, 0, 98, 42, DongHoHex.thanDenSoft, 0.9);
    bg.setStrokeStyle(2, borderColor);

    const iconT = this.scene.add.text(-32, 0, icon, { fontSize: '18px' }).setOrigin(0.5);
    const valT = this.scene.add.text(6, 0, initialVal, {
      fontFamily: "'Playfair Display', serif",
      fontSize: '14px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, iconT, valT]);
    return { container, text: valT };
  }

  public updateProfile(profile: Profile) {
    this.goldText.setText(profile.gold_coins.toLocaleString());
    this.fameText.setText(`Cấp ${Math.floor(profile.fame_exp / 100) + 1}`);
    this.paperText.setText(profile.paper_currency.toString());
  }
}
