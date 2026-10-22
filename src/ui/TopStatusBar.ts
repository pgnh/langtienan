import Phaser from 'phaser';
import { DongHoColors, DongHoHex } from '../config/theme';
import { Profile, PhuOngRank } from '../types/database';
import { ASSET_KEYS } from '../constants/assets';
import { sound } from '../services/soundService';

export class TopStatusBar extends Phaser.GameObjects.Container {
  private goldText!: Phaser.GameObjects.Text;
  private fameLevelText!: Phaser.GameObjects.Text;
  private rankTitleText!: Phaser.GameObjects.Text;
  private paperText!: Phaser.GameObjects.Text;
  private expFillBar!: Phaser.GameObjects.Rectangle;
  private expText!: Phaser.GameObjects.Text;
  private settingBtn!: Phaser.GameObjects.Container;

  private goldPill!: Phaser.GameObjects.Container;
  private expContainer!: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.createBar();
    scene.add.existing(this);
  }

  private createBar() {
    const width = 720;

    // =========================================================
    // 1. Khung cuộn giấy Parchment ở góc trên bên trái
    // Căn neo chuẩn: x: 20, y: 30, kích thước 260 x 185 (giữ đúng tỉ lệ aspect ratio gốc ~1.4:1)
    // =========================================================
    const parchmentContainer = this.scene.add.container(20, 24);

    const parchmentKey = this.scene.textures.exists(ASSET_KEYS.STATS_PARCHMENT_CLEAN)
      ? ASSET_KEYS.STATS_PARCHMENT_CLEAN
      : ASSET_KEYS.STATS_PARCHMENT;

    if (this.scene.textures.exists(parchmentKey)) {
      const parchmentImg = this.scene.add.image(0, 0, parchmentKey)
        .setOrigin(0, 0)
        .setDisplaySize(260, 185);
      parchmentContainer.add(parchmentImg);
    } else {
      const parchmentFallback = this.scene.add.rectangle(0, 0, 260, 185, DongHoHex.giayDiep, 0.96)
        .setOrigin(0, 0)
        .setStrokeStyle(3, DongHoHex.thanDen);
      parchmentContainer.add(parchmentFallback);
    }

    // =========================================================
    // 2. Nội dung 3 dòng hiển thị trên cuộn giấy mộc bản:
    // Dòng 1: Vàng Nén
    // Dòng 2: Phú Ông Cấp độ
    // Dòng 3: Giấy Điệp
    // =========================================================
    // Dòng 1: Vàng Nén (x: 28, y: 38)
    const goldIcon = this.scene.add.text(28, 42, '🪙', { fontSize: '20px' }).setOrigin(0, 0.5);
    const goldLabel = this.scene.add.text(56, 42, 'Vàng Nén:', {
      fontFamily: "'Playfair Display', 'Noto Serif', serif",
      fontSize: '15px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.goldText = this.scene.add.text(142, 42, '1.000', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '15px',
      color: DongHoColors.doSonDark,
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // Dòng 2: Phú Ông (x: 28, y: 88)
    const fameIcon = this.scene.add.text(28, 88, '👴', { fontSize: '20px' }).setOrigin(0, 0.5);
    const fameLabel = this.scene.add.text(56, 88, 'Phú Ông:', {
      fontFamily: "'Playfair Display', 'Noto Serif', serif",
      fontSize: '15px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.fameLevelText = this.scene.add.text(142, 88, 'Cấp 1', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '15px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // Dòng 3: Giấy Điệp (x: 28, y: 134)
    const paperIcon = this.scene.add.text(28, 134, '📜', { fontSize: '20px' }).setOrigin(0, 0.5);
    const paperLabel = this.scene.add.text(56, 134, 'Giấy Điệp:', {
      fontFamily: "'Playfair Display', 'Noto Serif', serif",
      fontSize: '15px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.paperText = this.scene.add.text(142, 134, '10', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '15px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // Thanh tiến trình EXP nhỏ gọn đặt kín đáo phía dưới Phú Ông
    const expTrack = this.scene.add.rectangle(56, 106, 160, 6, DongHoHex.thanDen, 0.4)
      .setOrigin(0, 0.5);
    this.expFillBar = this.scene.add.rectangle(56, 106, 20, 4, 0x2A7E56)
      .setOrigin(0, 0.5);
    this.expText = this.scene.add.text(136, 115, '0/100 EXP', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '9px',
      color: DongHoColors.thanDenSoft
    }).setOrigin(0.5);

    this.rankTitleText = this.scene.add.text(192, 88, 'Bần Nông', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '11px',
      color: DongHoColors.doSonDark,
      fontStyle: 'italic'
    }).setOrigin(0, 0.5);

    this.goldPill = this.scene.add.container(0, 0);
    this.goldPill.add([goldIcon, goldLabel, this.goldText]);

    parchmentContainer.add([
      this.goldPill,
      fameIcon,
      fameLabel,
      this.fameLevelText,
      this.rankTitleText,
      paperIcon,
      paperLabel,
      this.paperText,
      expTrack,
      this.expFillBar,
      this.expText
    ]);

    this.add(parchmentContainer);

    // =========================================================
    // 3. Biển hiệu 'Làng Tiền An' ở góc trên bên phải
    // =========================================================
    const titleKey = this.scene.textures.exists(ASSET_KEYS.TITLE_BOARD_CLEAN)
      ? ASSET_KEYS.TITLE_BOARD_CLEAN
      : ASSET_KEYS.TITLE_BOARD;

    if (this.scene.textures.exists(titleKey)) {
      const titleBoard = this.scene.add.image(480, 78, titleKey)
        .setDisplaySize(310, 146);
      this.add(titleBoard);
    }

    // =========================================================
    // 4. Nút Cài Đặt bánh răng gỗ (btn_setting.png) ở góc trên bên phải
    // =========================================================
    this.settingBtn = this.scene.add.container(width - 50, 58);

    const settingKey = this.scene.textures.exists(ASSET_KEYS.BTN_SETTING_CLEAN)
      ? ASSET_KEYS.BTN_SETTING_CLEAN
      : ASSET_KEYS.BTN_SETTING;

    if (this.scene.textures.exists(settingKey)) {
      const settingSprite = this.scene.add.image(0, 0, settingKey)
        .setDisplaySize(62, 62)
        .setInteractive({ useHandCursor: true });

      this.settingBtn.add(settingSprite);
      this.bindSettingInteraction(settingSprite);
    } else {
      const settingBg = this.scene.add.circle(0, 0, 24, DongHoHex.giayDiepDark);
      settingBg.setStrokeStyle(2.5, DongHoHex.thanDen);
      settingBg.setInteractive({ useHandCursor: true });
      const settingIcon = this.scene.add.text(0, 0, '⚙️', { fontSize: '22px' }).setOrigin(0.5);

      this.settingBtn.add([settingBg, settingIcon]);
      this.bindSettingInteraction(settingBg);
    }

    this.add(this.settingBtn);
  }

  private bindSettingInteraction(target: Phaser.GameObjects.GameObject) {
    target.on('pointerdown', () => {
      sound.playBambooClick();
      // Hiệu ứng co nảy bánh răng
      this.scene.tweens.add({
        targets: this.settingBtn,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 80,
        yoyo: true,
        onComplete: () => {
          const isMuted = sound.toggleMute();
          this.scene.events.emit('SHOW_TOAST', isMuted ? '🔇 Đã tắt tiếng âm thanh' : '🔊 Đã bật âm thanh');
        }
      });
    });
  }

  /**
   * Hiệu ứng nảy nhẹ (Punch Scale Tween) khi đồng vàng bay về hộp số dư
   */
  public punchGoldBox() {
    this.scene.tweens.killTweensOf(this.goldPill);
    this.goldPill.setScale(1);

    this.scene.tweens.add({
      targets: this.goldPill,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 110,
      yoyo: true,
      ease: 'Back.easeOut'
    });
  }

  /**
   * Hiệu ứng nảy nhẹ khi EXP bay về thanh tiến trình
   */
  public punchExpBar() {
    this.scene.tweens.killTweensOf(this.expContainer);
    this.expContainer.setScale(1);

    this.scene.tweens.add({
      targets: this.expContainer,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 100,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Cập nhật số liệu từ Profile người chơi
   */
  public updateProfile(profile: Profile) {
    // 1. Cập nhật Vàng Nén
    this.goldText.setText(profile.gold_coins.toLocaleString());

    // 2. Cập nhật Giấy Điệp
    this.paperText.setText(profile.paper_currency.toLocaleString());

    // 3. Tính toán Cấp độ Phú Ông & Thanh EXP ngọc bích
    // Mỗi cấp cần 100 EXP
    const exp = profile.fame_exp || 0;
    const level = Math.floor(exp / 100) + 1;
    const currentLevelExp = exp % 100;
    const maxBarWidth = 140;
    const progress = Phaser.Math.Clamp(currentLevelExp / 100, 0, 1);

    this.fameLevelText.setText(`Cấp ${level}`);
    this.expFillBar.width = Math.max(2, maxBarWidth * progress);
    this.expText.setText(`${currentLevelExp}/100 EXP`);

    // 4. Danh hiệu Phú Ông theo cấp bậc
    let rank = PhuOngRank.BAN_NONG;
    if (level >= 25) {
      rank = PhuOngRank.PHU_ONG;
    } else if (level >= 15) {
      rank = PhuOngRank.NGHE_NHAN;
    } else if (level >= 8) {
      rank = PhuOngRank.THO_THU_CONG;
    } else if (level >= 3) {
      rank = PhuOngRank.TRUNG_NONG;
    }
    this.rankTitleText.setText(rank);
  }
}
