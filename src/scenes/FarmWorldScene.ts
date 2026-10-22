import Phaser from 'phaser';
import confetti from 'canvas-confetti';
import { DongHoColors, DongHoHex } from '../config/theme';
import { TIERS_DATA, TIERS_LIST, WORLD_WIDTH, WORLD_HEIGHT, VIEWPORT_HEIGHT } from '../constants/tiers';
import { CROPS_DATA } from '../constants/crops';
import { GameService } from '../services/supabase';
import { Profile, FarmSlotRow } from '../types/database';
import { sound } from '../services/soundService';
import { ASSET_KEYS } from '../constants/assets';
import { FarmSlotObject } from '../ui/FarmSlotObject';
import { playHarvestBurst, spawnFlyingRewards } from '../utils/fx';

export class FarmWorldScene extends Phaser.Scene {
  private profile: Profile | null = null;
  private slots: FarmSlotRow[] = [];
  private slotViews: Map<string, FarmSlotObject> = new Map();
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
   * Dựng cảnh quan nền và các tầng canh tác cuộn dọc theo đúng thứ tự depth
   * Đồ họa hữu cơ liền mạch chuẩn tranh mộc bản Đông Hồ, KHÔNG dùng các khối hộp viền đen thô cứng
   */
  private renderWorldBackground() {
    // === DEPTH 0: Nền màu giấy Điệp làm fallback ấm áp ===
    this.add.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, DongHoHex.giayDiep).setDepth(0);

    // === DEPTH 1: Bức tranh dân gian Đông Hồ liền mạch toàn thế giới (720 x 2200) ===
    if (this.textures.exists(ASSET_KEYS.WORLD_MAP_ART)) {
      this.add.image(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, ASSET_KEYS.WORLD_MAP_ART)
        .setDisplaySize(WORLD_WIDTH, WORLD_HEIGHT)
        .setDepth(1);
    } else if (this.textures.exists(ASSET_KEYS.BG_DIEP)) {
      // Fallback giấy điệp nếu chưa có
      this.add.tileSprite(
        WORLD_WIDTH / 2,
        WORLD_HEIGHT / 2,
        WORLD_WIDTH,
        WORLD_HEIGHT,
        ASSET_KEYS.BG_DIEP
      ).setDepth(1).setAlpha(0.85);
    }

    // === DEPTH 2: Dựng biển hiệu tên tầng mộc bản nhẹ nhàng tinh tế (Không viền hộp cứng) ===
    TIERS_LIST.forEach((tier) => {
      const tierContainer = this.add.container(0, 0).setDepth(2);
      this.tierContainers.set(tier.id, tierContainer);

      // Biển hiệu tên tầng phong cách bảng gỗ mộc bản treo bên mép trái
      const signY = tier.yStart + 45;
      const signKey = this.textures.exists(ASSET_KEYS.SIGN_FLOOR)
        ? ASSET_KEYS.SIGN_FLOOR
        : null;

      if (signKey) {
        const signSprite = this.add.image(135, signY, signKey)
          .setDisplaySize(210, 48)
          .setOrigin(0.5);
        tierContainer.add(signSprite);
      } else {
        const signBg = this.add.rectangle(135, signY, 210, 44, DongHoHex.giayDiepDark, 0.92);
        signBg.setStrokeStyle(2.5, DongHoHex.thanDen);
        tierContainer.add(signBg);
      }

      const signText = this.add.text(135, signY - 1, tier.alias.toUpperCase(), {
        fontFamily: "'Playfair Display', 'Cinzel Decorative', serif",
        fontSize: '15px',
        color: DongHoColors.thanDen,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      tierContainer.add(signText);
    });

    // === DEPTH 5: Bố trí các tầng địa hình và asset môi trường đặc trưng ===
    this.renderTierEnvironmentAssets();
  }

  /**
   * Bố trí các asset môi trường cho từng tầng theo đúng thiết kế
   */
  private renderTierEnvironmentAssets() {
    // -------------------------------------------------------------
    // TẦNG 1: Ao Bèo & Bến Nước (yStart: 1800, yEnd: 2200)
    // Đặt bè tre (slot_water), bến nước, cá lội trên mặt nước
    // -------------------------------------------------------------
    const tier1 = TIERS_DATA[1];
    if (tier1) {
      const waterLayer = this.add.container(0, 0).setDepth(5);

      // Mặt nước gợn sóng trang trí
      const waterDecor1 = this.add.text(120, tier1.yStart + 80, '〰〰  🐟  〰〰', {
        fontSize: '20px',
        color: DongHoColors.xanhCham
      }).setAlpha(0.65);

      const waterDecor2 = this.add.text(520, tier1.yStart + 90, '〰〰  🐠  〰〰', {
        fontSize: '18px',
        color: DongHoColors.xanhCham
      }).setAlpha(0.65);

      waterLayer.add([waterDecor1, waterDecor2]);

      // Hiệu ứng cá bơi lội nhấp nhô
      this.tweens.add({
        targets: waterDecor1,
        x: '+=35',
        y: '+=5',
        duration: 2400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.tweens.add({
        targets: waterDecor2,
        x: '-=30',
        y: '-=6',
        duration: 2800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Bè tre bến nước trang trí phía rìa trái
      if (this.textures.exists(ASSET_KEYS.SLOT_WATER)) {
        const raft = this.add.image(90, tier1.yStart + 220, ASSET_KEYS.SLOT_WATER)
          .setDisplaySize(110, 110)
          .setAlpha(0.85)
          .setRotation(-0.1);
        waterLayer.add(raft);

        // Hiệu ứng bè bập bềnh theo sóng
        this.tweens.add({
          targets: raft,
          y: '+=8',
          rotation: 0.08,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }

    // -------------------------------------------------------------
    // TẦNG 2: Vườn Chuối Bãi Bồi (yStart: 1200, yEnd: 1800)
    // Đất trồng, bụi chuối, bù nhìn rơm (scarecrow.png)
    // -------------------------------------------------------------
    const tier2 = TIERS_DATA[2];
    if (tier2) {
      const bananaLayer = this.add.container(0, 0).setDepth(5);

      // Bụi chuối rặng cây trang trí 2 bên
      if (this.textures.exists(ASSET_KEYS.CROP_BANANA_TREE)) {
        const bananaLeft = this.add.image(75, tier2.yStart + 180, ASSET_KEYS.CROP_BANANA_TREE)
          .setDisplaySize(100, 120)
          .setAlpha(0.9);
        const bananaRight = this.add.image(645, tier2.yStart + 190, ASSET_KEYS.CROP_BANANA_TREE)
          .setDisplaySize(100, 120)
          .setFlipX(true)
          .setAlpha(0.9);
        bananaLayer.add([bananaLeft, bananaRight]);

        // Cây chuối đung đưa nhẹ theo gió
        this.tweens.add({
          targets: [bananaLeft, bananaRight],
          angle: { from: -2, to: 2 },
          duration: 2600,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      // Bù nhìn rơm ở trung tâm bãi bồi
      if (this.textures.exists(ASSET_KEYS.SCARECROW)) {
        const scarecrow = this.add.image(580, tier2.yStart + 110, ASSET_KEYS.SCARECROW)
          .setDisplaySize(72, 85);
        bananaLayer.add(scarecrow);

        // Tween bù nhìn lắc lư nhẹ
        this.tweens.add({
          targets: scarecrow,
          angle: { from: -3, to: 3 },
          duration: 1800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }

    // -------------------------------------------------------------
    // TẦNG 3: Lò Gạch Cũ (yStart: 600, yEnd: 1200)
    // Cụm lò gạch, kệ gạch nung, bậc thang đá kết nối, 2 NPC Chí Phèo & Thị Nở
    // -------------------------------------------------------------
    const tier3 = TIERS_DATA[3];
    if (tier3) {
      const kilnLayer = this.add.container(0, 0).setDepth(6);

      // Kệ gạch nung & vòm lò nung đất sét (đồ họa mộc bản)
      const kilnDome = this.add.rectangle(180, tier3.yStart + 110, 150, 48, DongHoHex.doSon, 0.88);
      kilnDome.setStrokeStyle(3, DongHoHex.thanDen);
      const kilnLabel = this.add.text(180, tier3.yStart + 110, '🔥 LÒ GẠCH CŨ 🔥', {
        fontFamily: "'Playfair Display', serif",
        fontSize: '13px',
        color: DongHoColors.trangXac,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // Khói nghi ngút bốc lên từ lò gạch
      const smokeText = this.add.text(180, tier3.yStart + 60, '💨', { fontSize: '26px' }).setOrigin(0.5);
      this.tweens.add({
        targets: smokeText,
        y: '-=25',
        alpha: { from: 0.8, to: 0.1 },
        duration: 1600,
        repeat: -1
      });

      // Bậc thang đá kết nối
      const step1 = this.add.rectangle(550, tier3.yStart + 220, 110, 10, DongHoHex.giayDiepDark);
      step1.setStrokeStyle(2, DongHoHex.thanDen);
      const step2 = this.add.rectangle(550, tier3.yStart + 232, 130, 10, DongHoHex.giayDiepDark);
      step2.setStrokeStyle(2, DongHoHex.thanDen);

      kilnLayer.add([kilnDome, kilnLabel, smokeText, step1, step2]);

      // 2 NPC: Chí Phèo (bên trái) và Thị Nở (bên phải)
      if (this.textures.exists(ASSET_KEYS.NPC_CHI_PHEO)) {
        const chiPheo = this.add.image(280, tier3.yStart + 110, ASSET_KEYS.NPC_CHI_PHEO)
          .setDisplaySize(72, 92);
        kilnLayer.add(chiPheo);

        // Tween nhấp nhô idle nhẹ
        this.tweens.add({
          targets: chiPheo,
          y: '+=6',
          scaleX: 0.98,
          duration: 1200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      if (this.textures.exists(ASSET_KEYS.NPC_THI_NO)) {
        const thiNo = this.add.image(350, tier3.yStart + 110, ASSET_KEYS.NPC_THI_NO)
          .setDisplaySize(72, 92);
        kilnLayer.add(thiNo);

        // Tween nhấp nhô idle nhẹ (so le nhịp với Chí Phèo)
        this.tweens.add({
          targets: thiNo,
          y: '+=5',
          scaleY: 0.98,
          duration: 1350,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          delay: 200
        });
      }
    }

    // -------------------------------------------------------------
    // TẦNG 5: Sân Đình Cổ Kính (yStart: 0, yEnd: 350)
    // Cây đa cổ thụ (tree_banyan.png) đặt ở góc trên bên phải
    // -------------------------------------------------------------
    const tier5 = TIERS_DATA[5];
    if (tier5 && this.textures.exists(ASSET_KEYS.TREE_BANYAN)) {
      const banyanTree = this.add.image(590, tier5.yStart + 160, ASSET_KEYS.TREE_BANYAN)
        .setDisplaySize(240, 260)
        .setDepth(15)
        .setAlpha(0.95);

      // Cây đa đu đưa nhẹ cành lá
      this.tweens.add({
        targets: banyanTree,
        angle: { from: -1.2, to: 1.2 },
        duration: 3500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * Lập trình hệ thống camera cuộn dọc có quán tính (Inertia Drag-to-Scroll)
   * Giới hạn camera trong bounds (0, 0, 720, 2200), chỉ cuộn trục Y
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
      // Khóa trục X hoàn toàn tại 0, chỉ cập nhật trục Y
      const newScrollY = Phaser.Math.Clamp(this.startCameraScrollY - dy, 0, this.maxScrollY);
      this.cameras.main.scrollY = newScrollY;

      // Tính vận tốc kéo thả tức thời để tích lũy quán tính
      const dt = this.time.now - this.lastDragTime;
      if (dt > 10) {
        this.scrollVelocity = (pointer.y - this.lastPointerY) / dt;
        this.lastPointerY = pointer.y;
        this.lastDragTime = this.time.now;
      }
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
      // Giới hạn vận tốc tối đa để tránh trôi camera quá trớn
      this.scrollVelocity = Phaser.Math.Clamp(this.scrollVelocity, -3.5, 3.5);
    });

    this.input.on('pointerupoutside', () => {
      this.isDragging = false;
    });

    // Hỗ trợ cuộn chuột trên máy tính để bàn (Wheel scrolling)
    this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: unknown, _deltaX: number, deltaY: number) => {
      this.cameras.main.scrollY = Phaser.Math.Clamp(this.cameras.main.scrollY + deltaY * 0.85, 0, this.maxScrollY);
      this.cameras.main.scrollX = 0;
    });
  }

  update(_time: number, delta: number) {
    // Khóa cuộn ngang (chỉ cuộn trục Y)
    if (this.cameras.main.scrollX !== 0) {
      this.cameras.main.scrollX = 0;
    }

    // Quán tính trượt và tự động hãm đà êm ái khi thả tay (Momentum + Damping)
    if (!this.isDragging && Math.abs(this.scrollVelocity) > 0.01) {
      // delta tính bằng ms (khoảng 16.6ms ở 60fps)
      const scrollStep = this.scrollVelocity * delta * 12;
      const targetScrollY = this.cameras.main.scrollY - scrollStep;

      this.cameras.main.scrollY = Phaser.Math.Clamp(targetScrollY, 0, this.maxScrollY);

      // Hệ số ma sát hãm đà mượt mà (friction damping ~0.92)
      this.scrollVelocity *= 0.92;

      // Chạm biên thế giới thì triệt tiêu quán tính ngay
      if (this.cameras.main.scrollY <= 0 || this.cameras.main.scrollY >= this.maxScrollY) {
        this.scrollVelocity = 0;
      }
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

    // Khi người chơi xác nhận gieo hạt từ SeedSelectorDrawer
    this.game.events.on('CONFIRM_PLANT_CROP', async (payload: { slotId: string; cropId: string }) => {
      try {
        await GameService.plantCrop(payload.slotId, payload.cropId);
        const slotObj = this.slotViews.get(payload.slotId);
        if (slotObj) {
          this.showFloatingNotice(slotObj.x, slotObj.y, 'Đã Gieo Trồng! 🌱');
        }
        await this.refreshAllData();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể gieo!';
        this.game.events.emit('SHOW_TOAST', `⚠️ ${msg}`);
      }
    });

    // Khi người chơi xác nhận mở tầng từ Chiếu Thư Khai Mở
    this.game.events.on('TRIGGER_UNLOCK_FLOOR', async (floorId: number) => {
      await this.tryUnlockTier(floorId);
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
   * Dựng các ô canh tác (4 ô mỗi tầng) sử dụng FarmSlotObject
   */
  private renderSlots() {
    this.slots.forEach((slot) => {
      const tier = TIERS_DATA[slot.floor_id];
      if (!tier) return;

      // Tính tọa độ ô: 2 hàng x 2 cột
      const row = Math.floor(slot.slot_index / 2);
      const col = slot.slot_index % 2;

      const slotX = col === 0 ? 220 : 500;
      const slotY = tier.yStart + 175 + row * 145;

      let slotObject = this.slotViews.get(slot.id);

      if (!slotObject) {
        // Khởi tạo FarmSlotObject mới
        slotObject = new FarmSlotObject(this, slotX, slotY, {
          slot,
          onOpenSeedSelector: (floorId, slotId) => {
            this.handleSlotClick(slotId);
          },
          onHarvest: (slotId) => {
            this.handleSlotClick(slotId);
          }
        }).setDepth(10);

        this.slotViews.set(slot.id, slotObject);
      } else {
        // Cập nhật trạng thái ô
        slotObject.updateState(slot);
      }
    });
  }

  /**
   * Đếm ngược thời gian và tự động đổi trạng thái sang READY
   */
  private updateSlotTimers() {
    const now = Date.now();
    this.slotViews.forEach((slotObj) => {
      slotObj.updateTimer(now);
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

        // Đổi trạng thái ô đất về EMPTY ngay để tạo cảm giác phản hồi tức thì
        const harvestedCropId = slot.item_type;
        const harvestedCrop = harvestedCropId ? CROPS_DATA[harvestedCropId] : null;
        slot.status = 'EMPTY';
        view.updateState(slot);

        // Hiệu ứng bùng nổ hạt/pháo hoa nhỏ tại vị trí ô đất
        playHarvestBurst({
          scene: this,
          x: view.x,
          y: view.y,
          particleCount: 16
        });

        // Gọi Server-Authoritative API
        const result = await GameService.harvestCrop(slot.id);

        // Hiệu ứng các icon đồng tiền vàng & nông sản bay vút về hộp số dư TopStatusBar
        // Vị trí TopStatusBar gold pill: x: 370, y: camera.scrollY + 67
        const targetScreenX = 370;
        const targetScreenY = this.cameras.main.scrollY + 67;

        spawnFlyingRewards({
          scene: this,
          startX: view.x,
          startY: view.y,
          targetX: targetScreenX,
          targetY: targetScreenY,
          icon: harvestedCrop ? harvestedCrop.icon : '🪙',
          count: 5,
          onTargetReached: () => {
            // Khi icon bay tới đích: Kích hoạt hiệu ứng nảy nhẹ (Punch Scale Tween) trên TopStatusBar
            this.game.events.emit('HARVEST_REWARD_ARRIVED', {
              rewardGold: result.reward_gold,
              rewardExp: result.reward_fame
            });
          }
        });

        // Hiển thị chữ bay phần thưởng
        this.showFloatingReward(
          view.x,
          view.y,
          `+${result.reward_gold} 🪙  +${result.reward_fame} Danh Vọng`
        );

        await this.refreshAllData();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Lỗi thu hoạch!';
        this.showFloatingNotice(view.x, view.y, message);
      }
      return;
    }

    // 2. Nếu ô đất trống & đang chọn hạt giống trước đó -> GIEO TRỒNG!
    if (slot.status === 'EMPTY' && this.selectedSeedId) {
      try {
        sound.playBambooClick();
        await GameService.plantCrop(slot.id, this.selectedSeedId);

        this.showFloatingNotice(view.x, view.y, 'Đã Gieo Trồng! 🌱');
        this.selectedSeedId = null;
        await this.refreshAllData();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Không thể gieo trồng!';
        this.showFloatingNotice(view.x, view.y, message);
      }
      return;
    }

    // 3. Nếu ô đất trống & chưa chọn hạt giống -> Mở SeedSelectorDrawer theo đúng tầng!
    if (slot.status === 'EMPTY') {
      sound.playBambooClick();
      this.game.events.emit('OPEN_SEED_SELECTOR', {
        floorId: slot.floor_id,
        slotId: slot.id
      });
      return;
    }

    // 4. Nếu đang lớn -> Hiển thị thông báo kiên nhẫn
    if (slot.status === 'GROWING') {
      sound.playBambooClick();
      this.showFloatingNotice(view.x, view.y, 'Đang sinh trưởng, hãy kiên nhẫn!');
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
        const lockPlate = this.add.container(WORLD_WIDTH / 2, tier.yStart + 230);
        lockPlate.setName('tier_lock_plate');

        const plateBg = this.add.rectangle(0, 0, 360, 130, DongHoHex.giayDiepDark, 0.95);
        plateBg.setStrokeStyle(2.5, DongHoHex.doSon);

        const lockIcon = this.add.text(0, -36, '🔒 ' + tier.name.toUpperCase(), {
          fontFamily: "'Playfair Display', serif",
          fontSize: '15px',
          color: DongHoColors.doSonDark,
          fontStyle: 'bold'
        }).setOrigin(0.5);

        const reqText = this.add.text(0, -8, tier.unlockReqDesc, {
          fontFamily: "'Noto Serif', serif",
          fontSize: '13px',
          color: DongHoColors.thanDen,
          fontStyle: 'italic'
        }).setOrigin(0.5);

        // Nút Khai Mở Tầng
        const unlockBtn = this.add.rectangle(0, 30, 220, 36, DongHoHex.doSon);
        unlockBtn.setStrokeStyle(1.5, DongHoHex.vangHoaHoe);
        unlockBtn.setInteractive({ useHandCursor: true });

        const btnText = this.add.text(0, 30, `📜 Khai Hoang (${tier.unlockGold.toLocaleString()} Vàng)`, {
          fontFamily: "'Noto Serif', serif",
          fontSize: '12px',
          color: DongHoColors.trangXac,
          fontStyle: 'bold'
        }).setOrigin(0.5);

        unlockBtn.on('pointerdown', () => {
          sound.playBambooClick();
          this.game.events.emit('OPEN_IMPERIAL_DECREE', tier.id);
        });

        lockPlate.add([plateBg, lockIcon, reqText, unlockBtn, btnText]);
        tierContainer.add(lockPlate);
      }
    });
  }

  private promptUnlockTier(floorId: number) {
    this.scrollToFloor(floorId);
    this.game.events.emit('OPEN_IMPERIAL_DECREE', floorId);
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
    this.slotViews.forEach((slotObject) => {
      slotObject.updateState(slotObject.slotData);
    });
  }
}
