import Phaser from 'phaser';
import { TopStatusBar } from '../ui/TopStatusBar';
import { BottomDock } from '../ui/BottomDock';
import { StoreDrawer } from '../ui/StoreDrawer';
import { TierNavigatorModal } from '../ui/TierNavigatorModal';
import { NavTabId } from '../types/hud';
import { Profile } from '../types/database';
import { CROPS_DATA } from '../constants/crops';
import { WOODBLOCK_BUFFS } from '../constants/tiers';
import { DongHoColors, DongHoHex } from '../config/theme';
import { sound } from '../services/soundService';

export class HUDOverlayScene extends Phaser.Scene {
  private topBar!: TopStatusBar;
  private bottomDock!: BottomDock;
  private storeDrawer!: StoreDrawer;
  private mapModal!: TierNavigatorModal;
  private woodblockModal!: Phaser.GameObjects.Container;
  private achievementsModal!: Phaser.GameObjects.Container;
  private toastContainer!: Phaser.GameObjects.Container;

  private currentProfile: Profile | null = null;
  private selectedCropId: string | null = null;

  constructor() {
    super({ key: 'HUDOverlayScene' });
  }

  create() {
    // 1. Thanh trạng thái trên cùng
    this.topBar = new TopStatusBar(this);

    // 2. Ngăn kéo Tiệm Tạp Hóa
    this.storeDrawer = new StoreDrawer(this, (cropId: string) => {
      this.handleSelectCrop(cropId);
    });

    // 3. Modal Bản Đồ điều hướng 5 tầng
    this.mapModal = new TierNavigatorModal(this, (floorId: number) => {
      this.game.events.emit('SCROLL_TO_TIER', floorId);
    });

    // 4. Modal Bàn Chế Tác Mộc Bản
    this.createWoodblockModal();

    // 5. Modal Sổ Đinh Thành Tích
    this.createAchievementsModal();

    // 6. Thanh Dock 4 nút điều hướng ở đáy
    this.bottomDock = new BottomDock(this, (tabId: NavTabId) => {
      this.handleNavTabClick(tabId);
    });

    // 7. Hộp thông báo nhanh (Toast Notification)
    this.createToastBanner();

    // Lắng nghe sự kiện
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Cập nhật hồ sơ từ FarmWorldScene
    this.game.events.on('UPDATE_HUD_PROFILE', (profile: Profile) => {
      this.currentProfile = profile;
      this.topBar.updateProfile(profile);
    });

    // Mở tiệm tạp hóa từ ô đất trống
    this.game.events.on('OPEN_STORE_DRAWER', (_floorId?: number) => {
      this.storeDrawer.open();
    });

    this.events.on('SHOW_TOAST', (msg: string) => {
      this.showToast(msg);
    });
  }

  private handleNavTabClick(tabId: NavTabId) {
    // Đóng các modal khác trước
    if (tabId !== 'store' && this.storeDrawer.isOpen) this.storeDrawer.close();
    if (tabId !== 'map' && this.mapModal.isOpen) this.mapModal.close();
    if (tabId !== 'woodblock') this.woodblockModal.setVisible(false);
    if (tabId !== 'achievements') this.achievementsModal.setVisible(false);

    switch (tabId) {
      case 'map':
        this.mapModal.open(this.currentProfile?.unlocked_floors || 1);
        break;
      case 'store':
        this.storeDrawer.toggle();
        break;
      case 'woodblock':
        this.woodblockModal.setVisible(true);
        break;
      case 'achievements':
        this.achievementsModal.setVisible(true);
        break;
    }
  }

  private handleSelectCrop(cropId: string) {
    this.selectedCropId = cropId;
    const crop = CROPS_DATA[cropId];

    this.game.events.emit('SELECT_SEED_TO_PLANT', cropId);

    if (crop) {
      this.showToast(`🌱 Đã chọn ${crop.name}! Hãy chạm vào ô đất trống.`);
    }
  }

  private createToastBanner() {
    this.toastContainer = this.add.container(360, 150);
    this.toastContainer.setAlpha(0);

    const bg = this.add.rectangle(0, 0, 480, 48, DongHoHex.thanDenSoft, 0.95);
    bg.setStrokeStyle(2, DongHoHex.vangHoaHoe);

    const text = this.add.text(0, 0, '', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '14px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.toastContainer.add([bg, text]);
  }

  private showToast(msg: string) {
    const textObj = this.toastContainer.getAt(1) as Phaser.GameObjects.Text;
    textObj.setText(msg);

    this.tweens.killTweensOf(this.toastContainer);
    this.toastContainer.setAlpha(0);
    this.toastContainer.setY(150);

    this.tweens.add({
      targets: this.toastContainer,
      alpha: 1,
      y: 135,
      duration: 250,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(2500, () => {
          this.tweens.add({
            targets: this.toastContainer,
            alpha: 0,
            y: 120,
            duration: 250,
            ease: 'Cubic.easeIn'
          });
        });
      }
    });
  }

  /**
   * Modal Bàn Chế Tác Mộc Bản Đông Hồ
   */
  private createWoodblockModal() {
    this.woodblockModal = this.add.container(0, 0);
    this.woodblockModal.setVisible(false);

    const dimmer = this.add.rectangle(360, 640, 720, 1280, 0x000000, 0.6);
    dimmer.setInteractive();
    dimmer.on('pointerdown', () => this.woodblockModal.setVisible(false));

    const box = this.add.container(360, 640);
    const boxBg = this.add.rectangle(0, 0, 560, 620, DongHoHex.giayDiep, 0.98);
    boxBg.setStrokeStyle(4, DongHoHex.thanDen);

    const titleT = this.add.text(0, -260, 'BÀN KHẮC GỖ MỘC BẢN', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '22px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const subT = this.add.text(0, -225, 'Đóng dấu son gia tăng sản lượng & giảm thời gian', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '13px',
      color: DongHoColors.doSonDark
    }).setOrigin(0.5);

    box.add([boxBg, titleT, subT]);

    WOODBLOCK_BUFFS.forEach((buff, idx) => {
      const cardY = -150 + idx * 100;
      const card = this.add.container(0, cardY);

      const cardBg = this.add.rectangle(0, 0, 480, 84, buff.unlocked ? DongHoHex.giayDiepDark : DongHoHex.thanDenSoft, 0.9);
      cardBg.setStrokeStyle(2, buff.unlocked ? DongHoHex.doSon : DongHoHex.thanDen);

      const iconT = this.add.text(-200, 0, buff.icon, { fontSize: '28px' }).setOrigin(0.5);

      const nameT = this.add.text(-160, -16, buff.name, {
        fontFamily: "'Playfair Display', serif",
        fontSize: '16px',
        color: buff.unlocked ? DongHoColors.thanDen : DongHoColors.vangHoaHoe,
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      const buffT = this.add.text(-160, 14, buff.passiveBuff, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '12px',
        color: buff.unlocked ? DongHoColors.doSon : DongHoColors.trangXac
      }).setOrigin(0, 0.5);

      const statusT = this.add.text(180, 0, buff.unlocked ? 'ĐÃ KHẮC' : 'CHƯA MỞ', {
        fontFamily: "'Playfair Display', serif",
        fontSize: '12px',
        color: buff.unlocked ? DongHoColors.doSonDark : DongHoColors.thanDenSoft,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      card.add([cardBg, iconT, nameT, buffT, statusT]);
      box.add(card);
    });

    const closeBtn = this.add.container(0, 260);
    const closeBg = this.add.rectangle(0, 0, 140, 42, DongHoHex.doSon);
    closeBg.setStrokeStyle(2, DongHoHex.thanDen);
    closeBg.setInteractive({ useHandCursor: true });
    const closeT = this.add.text(0, 0, 'ĐÓNG LẠI', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '13px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    closeBtn.add([closeBg, closeT]);
    closeBg.on('pointerdown', () => this.woodblockModal.setVisible(false));
    box.add(closeBtn);

    this.woodblockModal.add([dimmer, box]);
  }

  /**
   * Modal Sổ Đinh Thành Tích
   */
  private createAchievementsModal() {
    this.achievementsModal = this.add.container(0, 0);
    this.achievementsModal.setVisible(false);

    const dimmer = this.add.rectangle(360, 640, 720, 1280, 0x000000, 0.6);
    dimmer.setInteractive();
    dimmer.on('pointerdown', () => this.achievementsModal.setVisible(false));

    const box = this.add.container(360, 640);
    const boxBg = this.add.rectangle(0, 0, 560, 580, DongHoHex.giayDiep, 0.98);
    boxBg.setStrokeStyle(4, DongHoHex.thanDen);

    const titleT = this.add.text(0, -240, 'SỔ ĐINH & THÀNH TỰU', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '22px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const subT = this.add.text(0, -205, 'Ghi nhận công trạng xây dựng làng quê', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '13px',
      color: DongHoColors.doSonDark
    }).setOrigin(0.5);

    box.add([boxBg, titleT, subT]);

    const achievements = [
      { name: 'Khai Canh Bờ Ao', desc: 'Thu hoạch 10 vụ Bèo Hoa Dâu', progress: '10/10 (Đạt)', done: true },
      { name: 'Chủ Lò Cần Cù', desc: 'Đốt thành công 5 mẻ gạch nung', progress: '3/5', done: false },
      { name: 'Nghệ Nhân Khắc Bản', desc: 'Khắc hoàn thiện 2 mộc bản Đông Hồ', progress: '1/2', done: false }
    ];

    achievements.forEach((ach, idx) => {
      const cardY = -130 + idx * 110;
      const card = this.add.container(0, cardY);

      const cardBg = this.add.rectangle(0, 0, 480, 90, DongHoHex.giayDiepDark, 0.8);
      cardBg.setStrokeStyle(2, DongHoHex.thanDen);

      const iconT = this.add.text(-200, 0, ach.done ? '🏅' : '⏳', { fontSize: '28px' }).setOrigin(0.5);

      const nameT = this.add.text(-160, -20, ach.name, {
        fontFamily: "'Playfair Display', serif",
        fontSize: '16px',
        color: DongHoColors.thanDen,
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      const descT = this.add.text(-160, 6, ach.desc, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '12px',
        color: DongHoColors.thanDenSoft
      }).setOrigin(0, 0.5);

      const progT = this.add.text(-160, 24, `Tiến độ: ${ach.progress}`, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '11px',
        color: ach.done ? DongHoColors.doSon : DongHoColors.xanhChamDark,
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      const rewardBtn = this.add.text(180, 0, ach.done ? 'ĐÃ NHẬN' : 'CHƯA ĐẠT', {
        fontFamily: "'Playfair Display', serif",
        fontSize: '12px',
        color: ach.done ? DongHoColors.doSonDark : DongHoColors.thanDenSoft,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      card.add([cardBg, iconT, nameT, descT, progT, rewardBtn]);
      box.add(card);
    });

    const closeBtn = this.add.container(0, 230);
    const closeBg = this.add.rectangle(0, 0, 140, 42, DongHoHex.doSon);
    closeBg.setStrokeStyle(2, DongHoHex.thanDen);
    closeBg.setInteractive({ useHandCursor: true });
    const closeT = this.add.text(0, 0, 'ĐÓNG LẠI', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '13px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    closeBtn.add([closeBg, closeT]);
    closeBg.on('pointerdown', () => this.achievementsModal.setVisible(false));
    box.add(closeBtn);

    this.achievementsModal.add([dimmer, box]);
  }
}
