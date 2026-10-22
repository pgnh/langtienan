import Phaser from 'phaser';
import { TopStatusBar } from '../ui/TopStatusBar';
import { BottomDock } from '../ui/BottomDock';
import { StoreDrawer } from '../ui/StoreDrawer';
import { SeedSelectorDrawer } from '../ui/SeedSelectorDrawer';
import { TierNavigatorModal } from '../ui/TierNavigatorModal';
import { WoodcutStudioModal } from '../ui/WoodcutStudioModal';
import { AchievementModal } from '../ui/AchievementModal';
import { ImperialDecreeModal } from '../ui/ImperialDecreeModal';
import { NavTabId } from '../types/hud';
import { Profile } from '../types/database';
import { CROPS_DATA } from '../constants/crops';
import { DongHoColors, DongHoHex } from '../config/theme';
import { sound } from '../services/soundService';

export class HUDOverlayScene extends Phaser.Scene {
  private topBar!: TopStatusBar;
  private bottomDock!: BottomDock;
  private storeDrawer!: StoreDrawer;
  private seedSelector!: SeedSelectorDrawer;
  private mapModal!: TierNavigatorModal;
  private woodcutStudio!: WoodcutStudioModal;
  private achievementModal!: AchievementModal;
  private imperialDecreeModal!: ImperialDecreeModal;
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

    // 3. Khay chọn hạt giống trực tiếp khi chạm vào ô trống
    this.seedSelector = new SeedSelectorDrawer(this, {
      getUserGold: () => this.currentProfile?.gold_coins || 0,
      onPlantCrop: (slotId: string, cropId: string) => {
        this.game.events.emit('CONFIRM_PLANT_CROP', { slotId, cropId });
      }
    });

    // 4. Modal Bản Đồ điều hướng 5 tầng
    this.mapModal = new TierNavigatorModal(this, (floorId: number) => {
      this.game.events.emit('SCROLL_TO_TIER', floorId);
    });

    // 5. Modal Bàn Chế Tác Mộc Bản Đông Hồ
    this.woodcutStudio = new WoodcutStudioModal(this, {
      getUserGold: () => this.currentProfile?.gold_coins || 0,
      onGoldChanged: (newGold: number) => {
        if (this.currentProfile) {
          this.currentProfile.gold_coins = newGold;
          this.topBar.updateProfile(this.currentProfile);
        }
      }
    });

    // 6. Modal Sổ Đinh Thành Tích
    this.achievementModal = new AchievementModal(this, {
      getProfile: () => this.currentProfile,
      onRewardClaimed: (reward) => {
        if (this.currentProfile) {
          this.currentProfile.gold_coins += reward.gold;
          this.currentProfile.fame_exp += reward.fame;
          this.currentProfile.paper_currency += reward.paper;
          this.topBar.updateProfile(this.currentProfile);
        }
      }
    });

    // 7. Modal Chiếu Thư Khai Mở Tầng
    this.imperialDecreeModal = new ImperialDecreeModal(this, {
      getUserGold: () => this.currentProfile?.gold_coins || 0,
      getUserLevel: () => {
        const fame = this.currentProfile?.fame_exp || 0;
        return Math.floor(fame / 100) + 1;
      },
      onConfirmUnlock: (floorId: number) => {
        this.game.events.emit('TRIGGER_UNLOCK_FLOOR', floorId);
      }
    });

    // 8. Thanh Dock 4 nút điều hướng ở đáy
    this.bottomDock = new BottomDock(this, (tabId: NavTabId) => {
      this.handleNavTabClick(tabId);
    });

    // 9. Hộp thông báo nhanh (Toast Notification)
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

    // Mở khay chọn hạt giống theo tầng cho ô đất trống
    this.game.events.on('OPEN_SEED_SELECTOR', (payload: { floorId: number; slotId: string }) => {
      if (this.storeDrawer.isOpen) this.storeDrawer.close();
      this.seedSelector.open(payload.floorId, payload.slotId);
    });

    // Mở tiệm tạp hóa chung
    this.game.events.on('OPEN_STORE_DRAWER', (_floorId?: number) => {
      if (this.seedSelector.isOpen) this.seedSelector.close();
      this.storeDrawer.open();
    });

    // Hiệu ứng nảy vàng / EXP khi đồng xu bay tới TopStatusBar
    this.game.events.on('HARVEST_REWARD_ARRIVED', (data?: { rewardGold?: number; rewardExp?: number }) => {
      this.topBar.punchGoldBox();
      if (data?.rewardExp) {
        this.topBar.punchExpBar();
      }
    });

    // Mở Chiếu Thư Khai Mở Tầng
    this.game.events.on('OPEN_IMPERIAL_DECREE', (floorId: number) => {
      this.imperialDecreeModal.open(floorId);
    });

    this.events.on('SHOW_TOAST', (msg: string) => {
      this.showToast(msg);
    });

    this.game.events.on('SHOW_TOAST', (msg: string) => {
      this.showToast(msg);
    });
  }

  private handleNavTabClick(tabId: NavTabId) {
    // Đóng các modal khác trước
    if (tabId !== 'store' && this.storeDrawer.isOpen) this.storeDrawer.close();
    if (tabId !== 'map' && this.mapModal.isOpen) this.mapModal.close();
    if (tabId !== 'woodblock' && this.woodcutStudio.isOpen) this.woodcutStudio.close();
    if (tabId !== 'achievements' && this.achievementModal.isOpen) this.achievementModal.close();

    switch (tabId) {
      case 'map':
        this.mapModal.open(this.currentProfile?.unlocked_floors || 1);
        break;
      case 'store':
        this.storeDrawer.toggle();
        break;
      case 'woodblock':
        this.woodcutStudio.open();
        break;
      case 'achievements':
        this.achievementModal.open();
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
}
