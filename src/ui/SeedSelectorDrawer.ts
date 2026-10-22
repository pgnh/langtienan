import Phaser from 'phaser';
import { DongHoColors, DongHoHex } from '../config/theme';
import { CROPS_LIST } from '../constants/crops';
import { CropDefinition } from '../types/farm';
import { sound } from '../services/soundService';

export interface SeedSelectorDrawerOptions {
  onPlantCrop: (slotId: string, cropId: string) => Promise<void> | void;
  getUserGold: () => number;
}

/**
 * SeedSelectorDrawer - Khay trượt chọn hạt giống và phôi nung
 * Kế thừa từ Phaser.GameObjects.Container, hiển thị danh sách hạt giống theo tầng
 * Hỗ trợ kiểm tra số dư Vàng, rung nút khi thiếu tiền, và đóng mở mượt mà.
 */
export class SeedSelectorDrawer extends Phaser.GameObjects.Container {
  public isOpen = false;
  private currentFloorId = 1;
  private currentSlotId: string | null = null;

  // UI Components
  private dimmer!: Phaser.GameObjects.Rectangle;
  private drawerContainer!: Phaser.GameObjects.Container;
  private itemsContainer!: Phaser.GameObjects.Container;
  private titleText!: Phaser.GameObjects.Text;
  private floorSubtitleText!: Phaser.GameObjects.Text;
  private userGoldText!: Phaser.GameObjects.Text;

  private drawerWidth = 700;
  private drawerHeight = 580;
  private openY = 700;
  private closedY = 1320;

  private onPlantCrop: (slotId: string, cropId: string) => Promise<void> | void;
  private getUserGold: () => number;

  constructor(
    scene: Phaser.Scene,
    options: SeedSelectorDrawerOptions
  ) {
    super(scene, 0, 0);

    this.onPlantCrop = options.onPlantCrop;
    this.getUserGold = options.getUserGold;

    this.createUI();
    this.setVisible(false);
    scene.add.existing(this);
  }

  private createUI() {
    // 1. Lớp phủ mờ toàn màn hình (Dimmer), click ra ngoài để đóng
    this.dimmer = this.scene.add.rectangle(360, 640, 720, 1280, 0x000000, 0.5);
    this.dimmer.setInteractive();
    this.dimmer.on('pointerdown', () => {
      this.close();
    });
    this.add(this.dimmer);

    // 2. Container khay trượt chính
    this.drawerContainer = this.scene.add.container(10, this.closedY);

    // Nền mộc bản Đông Hồ giấy Điệp
    const bg = this.scene.add.rectangle(
      this.drawerWidth / 2,
      this.drawerHeight / 2,
      this.drawerWidth,
      this.drawerHeight,
      DongHoHex.giayDiep,
      0.98
    );
    bg.setStrokeStyle(4, DongHoHex.thanDen);
    this.drawerContainer.add(bg);

    // Viền triện đỏ trang trí
    const innerBorder = this.scene.add.rectangle(
      this.drawerWidth / 2,
      this.drawerHeight / 2,
      this.drawerWidth - 18,
      this.drawerHeight - 18
    );
    innerBorder.setStrokeStyle(1.5, DongHoHex.doSon);
    this.drawerContainer.add(innerBorder);

    // Header tiêu đề
    const headerBg = this.scene.add.rectangle(
      this.drawerWidth / 2,
      44,
      this.drawerWidth - 36,
      56,
      DongHoHex.doSon
    );
    headerBg.setStrokeStyle(2, DongHoHex.vangHoaHoe);

    this.titleText = this.scene.add.text(
      this.drawerWidth / 2 - 30,
      34,
      'CHỌN GIỐNG CANH TÁC',
      {
        fontFamily: "'Playfair Display', serif",
        fontSize: '18px',
        color: DongHoColors.trangXac,
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    this.floorSubtitleText = this.scene.add.text(
      this.drawerWidth / 2 - 30,
      56,
      'Tầng 1: Ao Bèo & Bến Nước',
      {
        fontFamily: "'Noto Serif', serif",
        fontSize: '12px',
        color: DongHoColors.vangHoaHoe,
        fontStyle: 'italic'
      }
    ).setOrigin(0.5);

    // Dấu triện icon nhỏ
    const sealText = this.scene.add.text(45, 44, '🌱', { fontSize: '26px' }).setOrigin(0.5);

    // Nút đóng khay '✖'
    const closeBtn = this.scene.add.container(this.drawerWidth - 50, 44);
    const closeBg = this.scene.add.circle(0, 0, 18, DongHoHex.thanDen);
    closeBg.setStrokeStyle(2, DongHoHex.vangHoaHoe);
    closeBg.setInteractive({ useHandCursor: true });
    const closeText = this.scene.add.text(0, 0, '✖', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '16px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    closeBtn.add([closeBg, closeText]);

    closeBg.on('pointerdown', () => {
      sound.playBambooClick();
      this.close();
    });

    this.drawerContainer.add([headerBg, sealText, this.titleText, this.floorSubtitleText, closeBtn]);

    // Thanh hiển thị số dư ví tiền người chơi
    const walletBg = this.scene.add.rectangle(this.drawerWidth / 2, 94, this.drawerWidth - 36, 32, DongHoHex.thanDenSoft, 0.9);
    walletBg.setStrokeStyle(1, DongHoHex.vangHoaHoe);
    this.userGoldText = this.scene.add.text(this.drawerWidth / 2, 94, 'Túi tiền: 0 🪙', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '12px',
      color: DongHoColors.vangHoaHoe,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.drawerContainer.add([walletBg, this.userGoldText]);

    // Container chứa danh sách vật phẩm
    this.itemsContainer = this.scene.add.container(0, 125);
    this.drawerContainer.add(this.itemsContainer);

    this.add(this.drawerContainer);
  }

  /**
   * Mở khay chọn hạt giống cho ô cụ thể tại tầng floorId
   */
  public open(floorId: number, slotId: string) {
    this.currentFloorId = floorId;
    this.currentSlotId = slotId;
    this.isOpen = true;
    this.setVisible(true);

    // Cập nhật tiêu đề theo tầng
    const floorTitles: Record<number, string> = {
      1: 'Tầng 1: Ao Bèo & Bến Nước',
      2: 'Tầng 2: Vườn Chuối Bãi Bồi',
      3: 'Tầng 3: Lò Gạch Cũ',
      4: 'Tầng 4: Xưởng Giấy Dó',
      5: 'Tầng 5: Sân Đình Cổ Kính'
    };
    this.floorSubtitleText.setText(floorTitles[floorId] || `Tầng ${floorId}`);

    // Cập nhật số dư vàng
    const currentGold = this.getUserGold();
    this.userGoldText.setText(`Túi tiền hiện có: ${currentGold.toLocaleString()} 🪙 Vàng Nén`);

    // Render danh sách hạt giống theo tầng
    this.renderCropsForFloor(floorId);

    // Hoạt ảnh trượt lên
    this.dimmer.setAlpha(0);
    this.drawerContainer.setY(this.closedY);

    this.scene.tweens.add({
      targets: this.dimmer,
      alpha: 0.5,
      duration: 250,
      ease: 'Linear'
    });

    this.scene.tweens.add({
      targets: this.drawerContainer,
      y: this.openY,
      duration: 350,
      ease: 'Back.easeOut'
    });

    sound.playBambooClick();
  }

  /**
   * Đóng khay trượt
   */
  public close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    this.scene.tweens.add({
      targets: this.dimmer,
      alpha: 0,
      duration: 220,
      ease: 'Linear'
    });

    this.scene.tweens.add({
      targets: this.drawerContainer,
      y: this.closedY,
      duration: 250,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        this.setVisible(false);
      }
    });
  }

  /**
   * Lọc và vẽ danh sách hạt giống theo tầng hiện tại
   */
  private renderCropsForFloor(floorId: number) {
    this.itemsContainer.removeAll(true);

    const eligibleCrops = CROPS_LIST.filter((crop) => crop.floorId === floorId || crop.tierId === floorId);

    if (eligibleCrops.length === 0) {
      const emptyText = this.scene.add.text(
        this.drawerWidth / 2,
        140,
        'Chưa có giống canh tác nào cho tầng này!',
        {
          fontFamily: "'Noto Serif', serif",
          fontSize: '14px',
          color: DongHoColors.thanDenSoft,
          fontStyle: 'italic'
        }
      ).setOrigin(0.5);
      this.itemsContainer.add(emptyText);
      return;
    }

    const startY = 15;
    const itemHeight = 110;

    eligibleCrops.forEach((crop: CropDefinition, idx: number) => {
      const cardY = startY + idx * itemHeight;
      const card = this.createCropCard(crop, cardY);
      this.itemsContainer.add(card);
    });
  }

  /**
   * Tạo thẻ hiển thị hạt giống/sản phẩm
   */
  private createCropCard(crop: CropDefinition, y: number): Phaser.GameObjects.Container {
    const card = this.scene.add.container(this.drawerWidth / 2, y);
    const userGold = this.getUserGold();
    const canAfford = userGold >= crop.costGold;

    // Nền thẻ mộc bản
    const cardBg = this.scene.add.rectangle(
      0,
      0,
      this.drawerWidth - 36,
      98,
      canAfford ? DongHoHex.giayDiepDark : DongHoHex.thanDenSoft,
      canAfford ? 0.75 : 0.85
    );
    cardBg.setStrokeStyle(2, canAfford ? DongHoHex.thanDen : DongHoHex.doSon);

    // Biểu tượng icon tròn
    const iconCircle = this.scene.add.circle(-265, 0, 32, DongHoHex.thanDenSoft);
    iconCircle.setStrokeStyle(1.5, DongHoHex.vangHoaHoe);
    const iconText = this.scene.add.text(-265, 0, crop.icon, { fontSize: '30px' }).setOrigin(0.5);

    // Tên cây trồng / sản phẩm
    const nameText = this.scene.add.text(-215, -26, crop.name, {
      fontFamily: "'Playfair Display', serif",
      fontSize: '16px',
      color: canAfford ? DongHoColors.thanDen : DongHoColors.vangHoaHoe,
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // Chi phí và thời gian sinh trưởng
    const durationMins = Math.round(crop.growDurationSec / 60);
    const durationLabel = durationMins > 0 ? `${durationMins} phút` : `${crop.growDurationSec} giây`;

    const costColor = canAfford ? DongHoColors.doSonDark : '#FF4D4D';
    const costText = this.scene.add.text(
      -215,
      -2,
      `Vốn: ${crop.costGold} 🪙 Vàng  •  Thời gian: ⏳ ${durationLabel}`,
      {
        fontFamily: "'Noto Serif', serif",
        fontSize: '12px',
        color: costColor,
        fontStyle: 'bold'
      }
    ).setOrigin(0, 0.5);

    // Phần thưởng thu hoạch & ROI
    const rewardText = this.scene.add.text(
      -215,
      22,
      `Thu hoạch: +${crop.sellPriceGold} 🪙 Vàng  +${crop.rewardFame} Danh Vọng (+${crop.roiPercent}% ROI)`,
      {
        fontFamily: "'Noto Serif', serif",
        fontSize: '11px',
        color: DongHoColors.xanhChamDark
      }
    ).setOrigin(0, 0.5);

    // Nút Gieo / Đốt lò
    const actionBtn = this.scene.add.container(240, 0);
    const isKiln = this.currentFloorId === 3;
    const btnLabel = isKiln ? 'ĐỐT LÒ' : 'GIEO TRỒNG';

    const btnBg = this.scene.add.rectangle(
      0,
      0,
      125,
      46,
      canAfford ? DongHoHex.doSon : DongHoHex.thanDen
    );
    btnBg.setStrokeStyle(2, canAfford ? DongHoHex.vangHoaHoe : 0x777777);
    btnBg.setInteractive({ useHandCursor: canAfford });

    const btnText = this.scene.add.text(0, 0, btnLabel, {
      fontFamily: "'Playfair Display', serif",
      fontSize: '13px',
      color: canAfford ? DongHoColors.trangXac : '#AAAAAA',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    actionBtn.add([btnBg, btnText]);

    btnBg.on('pointerdown', async () => {
      if (!this.currentSlotId) return;

      const latestGold = this.getUserGold();
      if (latestGold < crop.costGold) {
        // Thiếu tiền: Rung lắc nút và thông báo cảnh báo đỏ
        sound.playBambooClick();
        this.shakeButton(actionBtn);
        this.scene.events.emit('SHOW_TOAST', `⚠️ Không đủ Vàng! Cần ${crop.costGold} 🪙 Vàng Nén.`);
        return;
      }

      // Đủ tiền: Kích hoạt callback gieo trồng
      sound.playBambooClick();
      await this.onPlantCrop(this.currentSlotId, crop.id);
      this.close();
    });

    card.add([cardBg, iconCircle, iconText, nameText, costText, rewardText, actionBtn]);
    return card;
  }

  /**
   * Hiệu ứng rung lắc nút khi thiếu tiền
   */
  private shakeButton(btn: Phaser.GameObjects.Container) {
    const originX = btn.x;
    this.scene.tweens.add({
      targets: btn,
      x: originX + 8,
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        btn.setX(originX);
      }
    });
  }
}
