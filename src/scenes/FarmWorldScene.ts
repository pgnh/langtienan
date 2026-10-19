import Phaser from 'phaser';
import confetti from 'canvas-confetti';
import { DongHoColors, DongHoHex } from '../config/theme';
import { TIERS_DATA, TIERS_LIST, WORLD_WIDTH, WORLD_HEIGHT, VIEWPORT_HEIGHT } from '../constants/tiers';
import { CROPS_DATA } from '../constants/crops';
import { GameService } from '../services/supabase';
import { Profile, FarmSlotRow } from '../types/database';
import { sound } from '../services/soundService';

interface SlotView {
  container: Phaser.GameObjects.Container;
  bgSprite: Phaser.GameObjects.Sprite;
  iconText: Phaser.GameObjects.Text;
  nameText: Phaser.GameObjects.Text;
  timerText: Phaser.GameObjects.Text;
  progressBar: Phaser.GameObjects.Rectangle;
  readyBadge: Phaser.GameObjects.Container;
  slotData: FarmSlotRow;
}

export class FarmWorldScene extends Phaser.Scene {
  private profile: Profile | null = null;
  private slots: FarmSlotRow[] = [];
  private slotViews: Map<string, SlotView> = new Map();
  private tierContainers: Map<number, Phaser.GameObjects.Container> = new Map();

  // Scrolling logic
  private isDragging = false;
  private startPointerY = 0;
  private startCameraScrollY = 0;
  private scrollVelocity = 0;
  private lastPointerY = 0;
  private lastDragTime = 0;
  private maxScrollY = WORLD_HEIGHT - VIEWPORT_HEIGHT; // 2200 - 1280 = 920

  private selectedSeedId: string | null = null;

  constructor() {
    super({ key: 'FarmWorldScene' });
  }

  create() {
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    // Bắt đầu tại đáy thế giới (Tầng 1: Ao Bèo)
    this.cameras.main.scrollY = this.maxScrollY;

    // Dựng cảnh quan 5 tầng
    this.renderWorldBackground();
    this.setupScrollInput();
    this.setupEventListeners();

    // Nạp dữ liệu ban đầu
    this.refreshAllData();

    // Bộ định thời cập nhật đếm ngược mỗi giây
    this.time.addEvent({
      delay: 1000,
      callback: () => this.updateSlotTimers(),
      loop: true
    });
  }

  /**
   * Dựng cảnh quan nền cho 5 tầng canh tác cuộn dọc
   */
  private renderWorldBackground() {
    // Nền Giấy Điệp toàn cảnh
    this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, DongHoHex.giayDiep);

    TIERS_LIST.forEach((tier) => {
      const tierHeight = tier.yEnd - tier.yStart;
      const centerY = tier.yStart + tierHeight / 2;

      const tierContainer = this.add.container(0, 0);
      this.tierContainers.set(tier.id, tierContainer);

      // Nền của từng tầng với màu sắc Đông Hồ đặc trưng
      const tierBg = this.add.rectangle(WORLD_WIDTH / 2, centerY, WORLD_WIDTH - 24, tierHeight - 16, tier.bgColor, 0.22);
      tierBg.setStrokeStyle(3, DongHoHex.thanDen);
      tierContainer.add(tierBg);

      // Biển hiệu tên tầng phong cách bảng gỗ khắc mộc bản
      const signY = tier.yStart + 42;
      const signBg = this.add.rectangle(WORLD_WIDTH / 2, signY, 440, 50, DongHoHex.giayDiepDark);
      signBg.setStrokeStyle(3, DongHoHex.thanDen);

      const signText = this.add.text(WORLD_WIDTH / 2, signY, tier.name.toUpperCase(), {
        fontFamily: "'Playfair Display', 'Cinzel Decorative', serif",
        fontSize: '18px',
        color: DongHoColors.thanDen,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // Nhân vật đại diện của tầng
      const charY = tier.yStart + 76;
      const charText = this.add.text(WORLD_WIDTH / 2, charY, `Phụ trách: ${tier.character}`, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '13px',
        color: DongHoColors.doSon,
        fontStyle: 'italic'
      }).setOrigin(0.5);

      tierContainer.add([signBg, signText, charText]);
    });
  }

  /**
   * Lập trình điều khiển cuộn dọc màn hình cảm ứng & chuột mượt mà (Inertial Scrolling)
   */
  private setupScrollInput() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.startPointerY = pointer.y;
      this.lastPointerY = pointer.y;
      this.startCameraScrollY = this.cameras.main.scrollY;
      this.scrollVelocity = 0;
      this.lastDragTime = this.time.now;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging) return;

      const dy = pointer.y - this.startPointerY;
      const newScrollY = Phaser.Math.Clamp(this.startCameraScrollY - dy, 0, this.maxScrollY);
      this.cameras.main.scrollY = newScrollY;

      // Tính vận tốc kéo thả để tạo quán tính
      const dt = this.time.now - this.lastDragTime;
      if (dt > 10) {
        this.scrollVelocity = (pointer.y - this.lastPointerY) / dt;
        this.lastPointerY = pointer.y;
        this.lastDragTime = this.time.now;
      }
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
    });

    // Hỗ trợ cuộn chuột trên máy tính để bàn
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: unknown, _deltaX: number, deltaY: number) => {
      this.cameras.main.scrollY = Phaser.Math.Clamp(this.cameras.main.scrollY + deltaY * 0.8, 0, this.maxScrollY);
    });
  }

  update(_time: number, delta: number) {
    // Quán tính trượt sau khi thả tay
    if (!this.isDragging && Math.abs(this.scrollVelocity) > 0.05) {
      this.cameras.main.scrollY = Phaser.Math.Clamp(
        this.cameras.main.scrollY - this.scrollVelocity * delta * 15,
        0,
        this.maxScrollY
      );
      this.scrollVelocity *= 0.92; // Ma sát hãm đà
    }
  }

  /**
   * Kết nối sự kiện liên Scene (HUD -> World)
   */
  private setupEventListeners() {
    // Khi HUD gửi sự kiện chuyển nhanh đến tầng
    this.game.events.on('SCROLL_TO_TIER', (floorId: number) => {
      this.scrollToFloor(floorId);
    });

    // Khi người chơi chọn hạt giống từ Tiệm Tạp Hóa
    this.game.events.on('SELECT_SEED_TO_PLANT', (cropId: string | null) => {
      this.selectedSeedId = cropId;
      this.highlightEligibleSlots();
    });

    // Lắng nghe cập nhật dữ liệu từ GameService
    GameService.subscribe(() => {
      this.refreshAllData();
    });
  }

  /**
   * Lướt camera mượt mà đến vị trí tầng được chọn
   */
  public scrollToFloor(floorId: number) {
    const tier = TIERS_DATA[floorId];
    if (!tier) return;

    // Tính toán vị trí Y trọng tâm
    const targetY = Phaser.Math.Clamp(tier.yStart - 60, 0, this.maxScrollY);
    this.tweens.add({
      targets: this.cameras.main,
      scrollY: targetY,
      duration: 650,
      ease: 'Cubic.easeInOut'
    });
    sound.playBambooClick();
  }

  /**
   * Làm mới toàn bộ dữ liệu hồ sơ và các ô canh tác
   */
  public async refreshAllData() {
    try {
      this.profile = await GameService.getProfile();
      this.slots = await GameService.getFarmSlots();

      // Đồng bộ thông tin sang HUD
      this.game.events.emit('UPDATE_HUD_PROFILE', this.profile);

      // Dựng hoặc cập nhật ô canh tác
      this.renderSlots();
      this.renderTierLocks();
    } catch (e) {
      console.error('Lỗi nạp dữ liệu:', e);
    }
  }

  /**
   * Dựng các ô canh tác (4 ô mỗi tầng)
   */
  private renderSlots() {
    const slotTextureMap: Record<number, string> = {
      1: 'slot_water',
      2: 'slot_soil',
      3: 'slot_kiln',
      4: 'slot_paper',
      5: 'slot_shrine'
    };

    this.slots.forEach((slot) => {
      const tier = TIERS_DATA[slot.floor_id];
      if (!tier) return;

      // Tính tọa độ ô: 2 hàng x 2 cột
      const row = Math.floor(slot.slot_index / 2);
      const col = slot.slot_index % 2;

      const slotX = col === 0 ? 220 : 500;
      const slotY = tier.yStart + 175 + row * 145;

      let view = this.slotViews.get(slot.id);

      if (!view) {
        // Tạo view mới
        const container = this.add.container(slotX, slotY);

        const bgSprite = this.add.sprite(0, 0, slotTextureMap[slot.floor_id] || 'slot_soil');
        bgSprite.setInteractive({ useHandCursor: true });

        // Tương tác chạm vào ô đất
        bgSprite.on('pointerdown', () => this.handleSlotClick(slot.id));

        // Biểu tượng sản phẩm (Emoji / Icon)
        const iconText = this.add.text(0, -18, '', {
          fontSize: '38px',
          align: 'center'
        }).setOrigin(0.5);

        // Tên nông sản / vật phẩm
        const nameText = this.add.text(0, 18, 'Trống', {
          fontFamily: "'Noto Serif', serif",
          fontSize: '13px',
          color: DongHoColors.trangXac,
          fontStyle: 'bold',
          stroke: DongHoColors.thanDen,
          strokeThickness: 3
        }).setOrigin(0.5);

        // Thanh tiến trình
        const progressBg = this.add.rectangle(0, 42, 100, 8, DongHoHex.thanDen, 0.8);
        progressBg.setStrokeStyle(1, DongHoHex.giayDiep);

        const progressBar = this.add.rectangle(-50, 42, 0, 6, DongHoHex.vangHoaHoe);
        progressBar.setOrigin(0, 0.5);

        const timerText = this.add.text(0, 42, '', {
          fontFamily: "'Noto Serif', serif",
          fontSize: '10px',
          color: DongHoColors.trangXac,
          fontStyle: 'bold'
        }).setOrigin(0.5);

        // Huy hiệu sẵn sàng thu hoạch (Ready Badge)
        const readyBadge = this.add.container(0, -38);
        const badgeBg = this.add.rectangle(0, 0, 96, 26, DongHoHex.doSon);
        badgeBg.setStrokeStyle(2, DongHoHex.vangHoaHoe);
        const badgeText = this.add.text(0, 0, 'THU HOẠCH!', {
          fontFamily: "'Playfair Display', serif",
          fontSize: '11px',
          color: DongHoColors.trangXac,
          fontStyle: 'bold'
        }).setOrigin(0.5);
        readyBadge.add([badgeBg, badgeText]);
        readyBadge.setVisible(false);

        // Hiệu ứng nhấp nhô của huy hiệu thu hoạch
        this.tweens.add({
          targets: readyBadge,
          y: -44,
          duration: 600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        container.add([bgSprite, iconText, nameText, progressBg, progressBar, timerText, readyBadge]);

        view = {
          container,
          bgSprite,
          iconText,
          nameText,
          timerText,
          progressBar,
          readyBadge,
          slotData: slot
        };

        this.slotViews.set(slot.id, view);
      }

      // Cập nhật dữ liệu cho ô
      view.slotData = slot;
      this.updateSlotVisual(view);
    });
  }

  /**
   * Cập nhật hiển thị chi tiết của từng ô đất
   */
  private updateSlotVisual(view: SlotView) {
    const slot = view.slotData;

    if (slot.status === 'EMPTY') {
      view.iconText.setText(this.selectedSeedId ? '🌱' : '➕');
      view.iconText.setAlpha(this.selectedSeedId ? 1 : 0.4);
      view.nameText.setText(this.selectedSeedId ? 'Chạm để gieo' : 'Ô trống');
      view.nameText.setColor(this.selectedSeedId ? DongHoColors.vangHoaHoe : DongHoColors.trangXac);
      view.progressBar.width = 0;
      view.timerText.setText('');
      view.readyBadge.setVisible(false);
    } else if (slot.status === 'GROWING') {
      const crop = slot.item_type ? CROPS_DATA[slot.item_type] : null;
      view.iconText.setText(crop ? crop.icon : '🌱');
      view.iconText.setAlpha(1);
      view.nameText.setText(crop ? crop.name : 'Đang lớn...');
      view.nameText.setColor(DongHoColors.trangXac);
      view.readyBadge.setVisible(false);
    } else if (slot.status === 'READY') {
      const crop = slot.item_type ? CROPS_DATA[slot.item_type] : null;
      view.iconText.setText(crop ? crop.icon : '✨');
      view.iconText.setAlpha(1);
      view.nameText.setText(crop ? crop.name : 'Đã Chín!');
      view.nameText.setColor(DongHoColors.vangHoaHoe);
      view.progressBar.width = 100;
      view.timerText.setText('Hoàn tất');
      view.readyBadge.setVisible(true);
    }
  }

  /**
   * Đếm ngược thời gian và tự động đổi trạng thái sang READY
   */
  private updateSlotTimers() {
    const now = Date.now();

    this.slotViews.forEach((view) => {
      const slot = view.slotData;
      if (slot.status === 'GROWING' && slot.harvest_at) {
        const harvestAt = new Date(slot.harvest_at).getTime();
        const plantedAt = slot.planted_at ? new Date(slot.planted_at).getTime() : now - 1000;
        const totalDuration = Math.max(harvestAt - plantedAt, 1000);
        const remaining = harvestAt - now;

        if (remaining <= 0) {
          slot.status = 'READY';
          this.updateSlotVisual(view);
        } else {
          const progress = Phaser.Math.Clamp((now - plantedAt) / totalDuration, 0, 1);
          view.progressBar.width = 100 * progress;

          const totalSeconds = Math.ceil(remaining / 1000);
          const mins = Math.floor(totalSeconds / 60);
          const secs = totalSeconds % 60;
          const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
          view.timerText.setText(timeStr);
        }
      }
    });
  }

  /**
   * Xử lý tương tác khi chạm vào ô đất
   */
  private async handleSlotClick(slotId: string) {
    const view = this.slotViews.get(slotId);
    if (!view) return;

    const slot = view.slotData;

    // Kiểm tra xem tầng này đã được mở khóa chưa
    if (this.profile && slot.floor_id > this.profile.unlocked_floors) {
      sound.playBambooClick();
      this.promptUnlockTier(slot.floor_id);
      return;
    }

    // 1. Nếu ô đất đã chín -> THU HOẠCH!
    if (slot.status === 'READY') {
      try {
        sound.playHarvestPop();
        const result = await GameService.harvestCrop(slot.id);

        sound.playCoinChime();

        // Hiệu ứng pháo hoa dân gian mừng mùa vụ
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#E5A823', '#9A422D', '#D9C28D']
        });

        // Hiển thị chữ bay phần thưởng
        this.showFloatingReward(
          view.container.x,
          view.container.y,
          `+${result.reward_gold} Vàng  +${result.reward_fame} Danh Vọng`
        );

        this.refreshAllData();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Lỗi thu hoạch!';
        this.showFloatingNotice(view.container.x, view.container.y, message);
      }
      return;
    }

    // 2. Nếu ô đất trống & đang chọn hạt giống -> GIEO TRỒNG!
    if (slot.status === 'EMPTY' && this.selectedSeedId) {
      try {
        sound.playBambooClick();
        await GameService.plantCrop(slot.id, this.selectedSeedId);

        this.showFloatingNotice(view.container.x, view.container.y, 'Đã Gieo Trồng! 🌱');
        this.refreshAllData();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Không thể gieo trồng!';
        this.showFloatingNotice(view.container.x, view.container.y, message);
      }
      return;
    }

    // 3. Nếu ô đất trống & chưa chọn hạt giống -> Mở Tiệm Tạp Hóa
    if (slot.status === 'EMPTY') {
      sound.playBambooClick();
      this.game.events.emit('OPEN_STORE_DRAWER', slot.floor_id);
      return;
    }

    // 4. Nếu đang lớn -> Hiển thị thông báo kiên nhẫn
    if (slot.status === 'GROWING') {
      sound.playBambooClick();
      this.showFloatingNotice(view.container.x, view.container.y, 'Đang sinh trưởng, hãy đợi!');
    }
  }

  /**
   * Tạo hiệu ứng nổi chữ khi nhận thưởng
   */
  private showFloatingReward(x: number, y: number, text: string) {
    const t = this.add.text(x, y - 20, text, {
      fontFamily: "'Playfair Display', serif",
      fontSize: '18px',
      color: DongHoColors.vangHoaHoe,
      fontStyle: 'bold',
      stroke: DongHoColors.thanDen,
      strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: t,
      y: y - 80,
      alpha: 0,
      duration: 1200,
      ease: 'Cubic.easeOut',
      onComplete: () => t.destroy()
    });
  }

  private showFloatingNotice(x: number, y: number, text: string) {
    const t = this.add.text(x, y - 10, text, {
      fontFamily: "'Noto Serif', serif",
      fontSize: '14px',
      color: DongHoColors.trangXac,
      stroke: DongHoColors.thanDen,
      strokeThickness: 3
    }).setOrigin(0.5);

    this.tweens.add({
      targets: t,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => t.destroy()
    });
  }

  /**
   * Hiển thị bảng khóa và nút mở khóa tầng
   */
  private renderTierLocks() {
    if (!this.profile) return;

    TIERS_LIST.forEach((tier) => {
      const isLocked = tier.id > (this.profile?.unlocked_floors || 1);
      const tierContainer = this.tierContainers.get(tier.id);
      if (!tierContainer) return;

      const existingLock = tierContainer.getByName('tier_lock_plate');
      if (existingLock) existingLock.destroy();

      if (isLocked) {
        const lockPlate = this.add.container(WORLD_WIDTH / 2, tier.yStart + 240);
        lockPlate.setName('tier_lock_plate');

        const plateBg = this.add.rectangle(0, 0, 480, 160, DongHoHex.thanDenSoft, 0.92);
        plateBg.setStrokeStyle(3, DongHoHex.doSon);

        const lockIcon = this.add.text(0, -45, '🔒 KHÓA TẦNG', {
          fontFamily: "'Playfair Display', serif",
          fontSize: '20px',
          color: DongHoColors.vangHoaHoe,
          fontStyle: 'bold'
        }).setOrigin(0.5);

        const reqText = this.add.text(0, -10, tier.unlockReqDesc, {
          fontFamily: "'Noto Serif', serif",
          fontSize: '14px',
          color: DongHoColors.trangXac
        }).setOrigin(0.5);

        // Nút Khai Mở Tầng
        const unlockBtn = this.add.rectangle(0, 36, 200, 42, DongHoHex.doSon);
        unlockBtn.setStrokeStyle(2, DongHoHex.vangHoaHoe);
        unlockBtn.setInteractive({ useHandCursor: true });

        const btnText = this.add.text(0, 36, `Khai Mở (${tier.unlockGold.toLocaleString()} Vàng)`, {
          fontFamily: "'Noto Serif', serif",
          fontSize: '13px',
          color: DongHoColors.trangXac,
          fontStyle: 'bold'
        }).setOrigin(0.5);

        unlockBtn.on('pointerdown', () => this.tryUnlockTier(tier.id));

        lockPlate.add([plateBg, lockIcon, reqText, unlockBtn, btnText]);
        tierContainer.add(lockPlate);
      }
    });
  }

  private promptUnlockTier(floorId: number) {
    this.scrollToFloor(floorId);
    this.showFloatingNotice(WORLD_WIDTH / 2, TIERS_DATA[floorId].yStart + 200, 'Hãy khai mở tầng để canh tác!');
  }

  private async tryUnlockTier(floorId: number) {
    try {
      sound.playGongSound();
      const res = await GameService.unlockFloor(floorId);

      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#E5A823', '#9A422D', '#D9C28D', '#2A4B6E']
      });

      this.showFloatingReward(WORLD_WIDTH / 2, TIERS_DATA[floorId].yStart + 220, res.message);
      this.refreshAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể mở tầng!';
      this.showFloatingNotice(WORLD_WIDTH / 2, TIERS_DATA[floorId].yStart + 220, msg);
    }
  }

  private highlightEligibleSlots() {
    this.slotViews.forEach((view) => {
      this.updateSlotVisual(view);
    });
  }
}
