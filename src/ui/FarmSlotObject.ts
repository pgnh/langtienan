import Phaser from 'phaser';
import { FarmSlotRow, SlotStatus } from '../types/database';
import { CROPS_DATA } from '../constants/crops';
import { DongHoColors, DongHoHex } from '../config/theme';
import { ASSET_KEYS } from '../constants/assets';

export interface FarmSlotObjectOptions {
  slot: FarmSlotRow;
  onOpenSeedSelector?: (floorId: number, slotId: string) => void;
  onHarvest?: (slotId: string) => void;
}

/**
 * FarmSlotObject - Component tương tác đại diện cho 1 ô canh tác trong game
 * Kế thừa từ Phaser.GameObjects.Container, tuân thủ kiến trúc phân tách UI/World & GDD Làng Tiền An.
 */
export class FarmSlotObject extends Phaser.GameObjects.Container {
  public slotData: FarmSlotRow;

  // Visual Elements
  private baseSprite!: Phaser.GameObjects.Sprite;
  private cropSprite!: Phaser.GameObjects.Sprite;
  private sproutBadge!: Phaser.GameObjects.Container;
  private timerBadge!: Phaser.GameObjects.Container;
  private timerText!: Phaser.GameObjects.Text;
  private progressBarBg!: Phaser.GameObjects.Rectangle;
  private progressBarFill!: Phaser.GameObjects.Rectangle;
  private readyBadge!: Phaser.GameObjects.Container;
  private readyBadgeText!: Phaser.GameObjects.Text;
  private titleLabel!: Phaser.GameObjects.Text;

  // Animation Tweens
  private readyPulseTween?: Phaser.Tweens.Tween;
  private sproutGlowTween?: Phaser.Tweens.Tween;

  // Callbacks
  private onOpenSeedSelector?: (floorId: number, slotId: string) => void;
  private onHarvest?: (slotId: string) => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    options: FarmSlotObjectOptions
  ) {
    super(scene, x, y);

    this.slotData = options.slot;
    this.onOpenSeedSelector = options.onOpenSeedSelector;
    this.onHarvest = options.onHarvest;

    this.setupVisualComponents();
    this.setupInteractivity();
    this.updateState(this.slotData);

    scene.add.existing(this);
  }

  /**
   * Khởi tạo cấu trúc các lớp đồ họa con bên trong Container
   */
  private setupVisualComponents() {
    // 1. Nền ô đất / bè tre / lò gạch
    const baseTexture = this.getBaseTextureForFloor(this.slotData.floor_id);
    this.baseSprite = this.scene.add.sprite(0, 0, baseTexture);
    this.baseSprite.setDisplaySize(130, 130);
    this.add(this.baseSprite);

    // 2. Sprite hiển thị hình ảnh cây trồng / thành phẩm thực tế (crop_banana_tree, crop_beo_ready, ...)
    this.cropSprite = this.scene.add.sprite(0, -10, ASSET_KEYS.SLOT_SOIL);
    this.cropSprite.setVisible(false);
    this.add(this.cropSprite);

    // 3. Mầm cây / Lửa đỏ lò gạch khi đang GROWING (Sprout Badge)
    this.sproutBadge = this.scene.add.container(0, -15);
    const sproutGlow = this.scene.add.circle(0, 0, 32, DongHoHex.vangHoaHoe, 0.25);
    const sproutIcon = this.scene.add.text(0, 0, '🌱', {
      fontSize: '36px'
    }).setOrigin(0.5);
    this.sproutBadge.add([sproutGlow, sproutIcon]);
    this.sproutBadge.setVisible(false);
    this.add(this.sproutBadge);

    // 4. Nhãn tên cây / trạng thái ô đất
    this.titleLabel = this.scene.add.text(0, 22, 'Chờ gieo', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '13px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold',
      stroke: DongHoColors.thanDen,
      strokeThickness: 3
    }).setOrigin(0.5);
    this.add(this.titleLabel);

    // 5. Thanh tiến trình sinh trưởng & Nhãn đếm ngược (Timer Badge)
    this.timerBadge = this.scene.add.container(0, 48);
    this.progressBarBg = this.scene.add.rectangle(0, 0, 96, 12, DongHoHex.thanDenSoft, 0.9);
    this.progressBarBg.setStrokeStyle(1.5, DongHoHex.giayDiep);

    this.progressBarFill = this.scene.add.rectangle(-48, 0, 0, 10, DongHoHex.vangHoaHoe);
    this.progressBarFill.setOrigin(0, 0.5);

    this.timerText = this.scene.add.text(0, -1, '00:00', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '10px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold',
      stroke: DongHoColors.thanDen,
      strokeThickness: 2
    }).setOrigin(0.5);

    this.timerBadge.add([this.progressBarBg, this.progressBarFill, this.timerText]);
    this.timerBadge.setVisible(false);
    this.add(this.timerBadge);

    // 6. Huy hiệu mời gọi thu hoạch "CHÍN!" / Hoàn tất nung (Ready Badge)
    this.readyBadge = this.scene.add.container(0, -42);
    const badgeBg = this.scene.add.rectangle(0, 0, 100, 28, DongHoHex.doSon, 0.95);
    badgeBg.setStrokeStyle(2, DongHoHex.vangHoaHoe);

    this.readyBadgeText = this.scene.add.text(0, 0, '🌾 CHÍN!', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '12px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.readyBadge.add([badgeBg, this.readyBadgeText]);
    this.readyBadge.setVisible(false);
    this.add(this.readyBadge);
  }

  /**
   * Lấy texture nền ô đất chuẩn theo từng tầng
   */
  private getBaseTextureForFloor(floorId: number): string {
    if (floorId === 1 && this.scene.textures.exists(ASSET_KEYS.SLOT_WATER)) {
      return ASSET_KEYS.SLOT_WATER;
    }
    if (this.scene.textures.exists(ASSET_KEYS.SLOT_SOIL)) {
      return ASSET_KEYS.SLOT_SOIL;
    }
    return ASSET_KEYS.SLOT_SOIL;
  }

  /**
   * Thiết lập vùng tương tác nhấp chạm trên ô canh tác
   */
  private setupInteractivity() {
    this.setSize(130, 130);
    this.setInteractive({ useHandCursor: true });

    // Hiệu ứng phản hồi khi ấn/thả (Button bounce)
    this.on('pointerdown', () => {
      this.scene.tweens.add({
        targets: this,
        scaleX: 0.94,
        scaleY: 0.94,
        duration: 80,
        ease: 'Quad.easeOut'
      });
    });

    this.on('pointerup', () => {
      this.scene.tweens.add({
        targets: this,
        scaleX: 1,
        scaleY: 1,
        duration: 120,
        ease: 'Back.easeOut',
        onComplete: () => this.handleClick()
      });
    });

    this.on('pointerout', () => {
      this.setScale(1);
    });
  }

  /**
   * Xử lý hành vi tương tác theo trạng thái:
   * - EMPTY: Mở khay chọn hạt giống
   * - READY: Kích hoạt thu hoạch
   * - GROWING: Thông báo trạng thái đang lớn
   */
  private handleClick() {
    const status = this.slotData.status;

    if (status === 'EMPTY') {
      if (this.onOpenSeedSelector) {
        this.onOpenSeedSelector(this.slotData.floor_id, this.slotData.id);
      }
    } else if (status === 'READY') {
      if (this.onHarvest) {
        this.onHarvest(this.slotData.id);
      }
    } else if (status === 'GROWING') {
      // Nhấp nháy nhẹ mầm cây biểu thị đang chăm sóc
      this.scene.tweens.add({
        targets: this.sproutBadge,
        scaleX: 1.25,
        scaleY: 1.25,
        duration: 160,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * Cập nhật toàn bộ trạng thái hiển thị của ô canh tác
   */
  public updateState(slot: FarmSlotRow) {
    this.slotData = slot;
    const crop = slot.item_type ? CROPS_DATA[slot.item_type] : null;

    // Hủy bỏ các tween phát sáng/nhấp nháy cũ
    this.stopTweens();

    switch (slot.status) {
      case 'EMPTY':
        this.renderEmptyState();
        break;

      case 'GROWING':
        this.renderGrowingState(crop);
        break;

      case 'READY':
        this.renderReadyState(crop);
        break;
    }
  }

  /**
   * 1. TRẠNG THÁI EMPTY: Ô trống chờ gieo hạt hoặc đốt lò
   */
  private renderEmptyState() {
    this.cropSprite.setVisible(false);
    this.sproutBadge.setVisible(false);
    this.timerBadge.setVisible(false);
    this.readyBadge.setVisible(false);

    // Nhãn hướng dẫn người chơi
    const isKiln = this.slotData.floor_id === 3;
    const isWater = this.slotData.floor_id === 1;

    let emptyLabel = 'Chạm gieo';
    if (isKiln) emptyLabel = 'Đốt lò';
    else if (isWater) emptyLabel = 'Thả giống';

    this.titleLabel.setText(emptyLabel);
    this.titleLabel.setColor(DongHoColors.trangXac);
    this.titleLabel.setVisible(true);

    // Base sprite hiển thị rõ nét
    this.baseSprite.setAlpha(0.9);
  }

  /**
   * 2. TRẠNG THÁI GROWING: Đang sinh trưởng / Đang nung gạch
   */
  private renderGrowingState(crop: typeof CROPS_DATA[string] | null) {
    this.readyBadge.setVisible(false);
    this.timerBadge.setVisible(true);
    this.sproutBadge.setVisible(true);
    this.titleLabel.setVisible(true);

    const isKiln = this.slotData.floor_id === 3;
    const sproutIcon = this.sproutBadge.getAt(1) as Phaser.GameObjects.Text;

    if (isKiln) {
      sproutIcon.setText('🔥');
      this.titleLabel.setText(crop ? crop.name : 'Đang nung...');
    } else {
      sproutIcon.setText(crop ? crop.icon : '🌱');
      this.titleLabel.setText(crop ? crop.name : 'Đang lớn...');
    }

    this.titleLabel.setColor(DongHoColors.trangXac);

    // Kiểm tra nếu có asset mầm cây cụ thể
    if (crop?.assetKeys?.mature && this.scene.textures.exists(crop.assetKeys.mature)) {
      this.cropSprite.setTexture(crop.assetKeys.mature);
      this.cropSprite.setDisplaySize(72, 72);
      this.cropSprite.setAlpha(0.5);
      this.cropSprite.setVisible(true);
    } else {
      this.cropSprite.setVisible(false);
    }

    // Hiệu ứng mầm / lửa đỏ nhấp nháy êm dịu
    this.sproutGlowTween = this.scene.tweens.add({
      targets: this.sproutBadge,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Cập nhật tiến độ đếm ngược ngay lập tức
    this.updateTimer(Date.now());
  }

  /**
   * 3. TRẠNG THÁI READY: Cây chín / Gạch hoàn tất / Cá lớn
   */
  private renderReadyState(crop: typeof CROPS_DATA[string] | null) {
    this.sproutBadge.setVisible(false);
    this.timerBadge.setVisible(false);
    this.titleLabel.setVisible(true);
    this.readyBadge.setVisible(true);

    const isKiln = this.slotData.floor_id === 3;
    const readyTag = isKiln ? '🔥 RA LÒ!' : '🌾 CHÍN!';
    this.readyBadgeText.setText(readyTag);

    this.titleLabel.setText(crop ? crop.name : 'Đã Chín!');
    this.titleLabel.setColor(DongHoColors.vangHoaHoe);

    // Hiển thị sprite thành phẩm
    if (crop?.assetKeys?.ready && this.scene.textures.exists(crop.assetKeys.ready)) {
      this.cropSprite.setTexture(crop.assetKeys.ready);
      this.cropSprite.setDisplaySize(85, 85);
      this.cropSprite.setAlpha(1);
      this.cropSprite.setVisible(true);
    } else {
      this.cropSprite.setVisible(false);
    }

    // Hiệu ứng nhấp nháy phát sáng (Tween Alpha & Scale Pulse) mời gọi thu hoạch
    this.readyPulseTween = this.scene.tweens.add({
      targets: [this.readyBadge, this.cropSprite.visible ? this.cropSprite : this.titleLabel],
      scaleX: 1.08,
      scaleY: 1.08,
      alpha: 0.9,
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Cập nhật nhãn đếm ngược và thanh tiến trình theo từng giây
   */
  public updateTimer(nowMs: number) {
    if (this.slotData.status !== 'GROWING' || !this.slotData.harvest_at) {
      return;
    }

    const harvestAtMs = new Date(this.slotData.harvest_at).getTime();
    const plantedAtMs = this.slotData.planted_at
      ? new Date(this.slotData.planted_at).getTime()
      : nowMs - 1000;

    const totalDuration = Math.max(harvestAtMs - plantedAtMs, 1000);
    const remainingMs = harvestAtMs - nowMs;

    if (remainingMs <= 0) {
      this.slotData.status = 'READY';
      this.renderReadyState(this.slotData.item_type ? CROPS_DATA[this.slotData.item_type] : null);
      return;
    }

    // Thanh tiến trình
    const progress = Phaser.Math.Clamp((nowMs - plantedAtMs) / totalDuration, 0, 1);
    this.progressBarFill.width = 96 * progress;

    // Chuẩn hóa định dạng thời gian mm:ss
    const totalSecs = Math.ceil(remainingMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    this.timerText.setText(timeStr);
  }

  /**
   * Dừng tất cả các hoạt ảnh nhấp nháy
   */
  private stopTweens() {
    if (this.readyPulseTween) {
      this.readyPulseTween.stop();
      this.readyPulseTween = undefined;
    }
    if (this.sproutGlowTween) {
      this.sproutGlowTween.stop();
      this.sproutGlowTween = undefined;
    }
    this.readyBadge.setScale(1).setAlpha(1);
    this.titleLabel.setScale(1).setAlpha(1);
    this.sproutBadge.setScale(1).setAlpha(1);
    this.cropSprite.setScale(1).setAlpha(1);
  }

  public destroy(fromScene?: boolean) {
    this.stopTweens();
    super.destroy(fromScene);
  }
}
