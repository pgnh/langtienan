import Phaser from 'phaser';
import { DongHoColors, DongHoHex } from '../config/theme';
import { CROPS_LIST } from '../constants/crops';
import { sound } from '../services/soundService';

export class StoreDrawer extends Phaser.GameObjects.Container {
  public isOpen = false;
  private contentContainer!: Phaser.GameObjects.Container;
  private activeTab: 'seeds' | 'orders' = 'seeds';
  private tabSeedsBtn!: Phaser.GameObjects.Container;
  private tabOrdersBtn!: Phaser.GameObjects.Container;
  private onSelectCrop: (cropId: string) => void;

  private drawerWidth = 700;
  private drawerHeight = 840;
  private openY = 440;
  private closedY = 1320;

  constructor(scene: Phaser.Scene, onSelectCrop: (cropId: string) => void) {
    super(scene, 10, 1320);
    this.onSelectCrop = onSelectCrop;

    this.createDrawer();
    scene.add.existing(this);
  }

  private createDrawer() {
    // 1. Lớp phủ nền mộc bản Đông Hồ
    const bg = this.scene.add.rectangle(this.drawerWidth / 2, this.drawerHeight / 2, this.drawerWidth, this.drawerHeight, DongHoHex.giayDiep, 0.98);
    bg.setStrokeStyle(4, DongHoHex.thanDen);
    this.add(bg);

    // 2. Viền hoa văn triện son trang trí
    const innerBorder = this.scene.add.rectangle(this.drawerWidth / 2, this.drawerHeight / 2, this.drawerWidth - 20, this.drawerHeight - 20);
    innerBorder.setStrokeStyle(1.5, DongHoHex.doSon);
    this.add(innerBorder);

    // 3. Tiêu đề Tiệm Tạp Hóa
    const headerBg = this.scene.add.rectangle(this.drawerWidth / 2, 45, this.drawerWidth - 40, 56, DongHoHex.doSon);
    headerBg.setStrokeStyle(2, DongHoHex.vangHoaHoe);

    const titleText = this.scene.add.text(this.drawerWidth / 2 - 40, 45, 'TIỆM TẠP HÓA LÀNG TIỀN AN', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '20px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Dấu triện son nhỏ
    const sealText = this.scene.add.text(80, 45, '🛒', { fontSize: '24px' }).setOrigin(0.5);

    // Nút đóng ngăn kéo
    const closeBtn = this.scene.add.container(this.drawerWidth - 70, 45);
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

    this.add([headerBg, sealText, titleText, closeBtn]);

    // 4. Thanh 2 Tab: Hạt Giống & Giao Thương
    this.createTabs();

    // 5. Vùng nội dung danh sách
    this.contentContainer = this.scene.add.container(0, 150);
    this.add(this.contentContainer);

    this.renderActiveTabContent();
  }

  private createTabs() {
    const tabY = 108;
    const tabWidth = 320;
    const tabHeight = 44;

    // Tab 1: Hạt Giống & Phôi Nung
    this.tabSeedsBtn = this.scene.add.container(this.drawerWidth / 4 + 10, tabY);
    const seedsBg = this.scene.add.rectangle(0, 0, tabWidth, tabHeight, DongHoHex.doSon);
    seedsBg.setStrokeStyle(2, DongHoHex.thanDen);
    seedsBg.setInteractive({ useHandCursor: true });
    const seedsText = this.scene.add.text(0, 0, '🌱 HẠT GIỐNG & PHÔI', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '14px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.tabSeedsBtn.add([seedsBg, seedsText]);

    seedsBg.on('pointerdown', () => {
      sound.playBambooClick();
      this.activeTab = 'seeds';
      this.updateTabStyles();
      this.renderActiveTabContent();
    });

    // Tab 2: Ký Gửi & Bán Nông Sản
    this.tabOrdersBtn = this.scene.add.container((this.drawerWidth / 4) * 3 - 10, tabY);
    const ordersBg = this.scene.add.rectangle(0, 0, tabWidth, tabHeight, DongHoHex.giayDiepDark);
    ordersBg.setStrokeStyle(2, DongHoHex.thanDen);
    ordersBg.setInteractive({ useHandCursor: true });
    const ordersText = this.scene.add.text(0, 0, '📜 ĐƠN THU MUA LÀNG', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '14px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.tabOrdersBtn.add([ordersBg, ordersText]);

    ordersBg.on('pointerdown', () => {
      sound.playBambooClick();
      this.activeTab = 'orders';
      this.updateTabStyles();
      this.renderActiveTabContent();
    });

    this.add([this.tabSeedsBtn, this.tabOrdersBtn]);
  }

  private updateTabStyles() {
    const seedsBg = this.tabSeedsBtn.getAt(0) as Phaser.GameObjects.Rectangle;
    const seedsText = this.tabSeedsBtn.getAt(1) as Phaser.GameObjects.Text;
    const ordersBg = this.tabOrdersBtn.getAt(0) as Phaser.GameObjects.Rectangle;
    const ordersText = this.tabOrdersBtn.getAt(1) as Phaser.GameObjects.Text;

    if (this.activeTab === 'seeds') {
      seedsBg.setFillStyle(DongHoHex.doSon);
      seedsText.setColor(DongHoColors.trangXac);
      ordersBg.setFillStyle(DongHoHex.giayDiepDark);
      ordersText.setColor(DongHoColors.thanDen);
    } else {
      seedsBg.setFillStyle(DongHoHex.giayDiepDark);
      seedsText.setColor(DongHoColors.thanDen);
      ordersBg.setFillStyle(DongHoHex.doSon);
      ordersText.setColor(DongHoColors.trangXac);
    }
  }

  private renderActiveTabContent() {
    this.contentContainer.removeAll(true);

    if (this.activeTab === 'seeds') {
      this.renderSeedsList();
    } else {
      this.renderOrdersList();
    }
  }

  /**
   * Danh sách hạt giống, phôi nung, cá giống
   */
  private renderSeedsList() {
    const startY = 15;
    const itemHeight = 105;

    CROPS_LIST.slice(0, 6).forEach((crop, idx) => {
      const cardY = startY + idx * itemHeight;

      const card = this.scene.add.container(this.drawerWidth / 2, cardY);

      // Thẻ bài mộc bản
      const cardBg = this.scene.add.rectangle(0, 0, this.drawerWidth - 44, 96, DongHoHex.giayDiepDark, 0.6);
      cardBg.setStrokeStyle(2, DongHoHex.thanDen);

      // Icon tròn
      const iconCircle = this.scene.add.circle(-265, 0, 32, DongHoHex.thanDenSoft);
      iconCircle.setStrokeStyle(1.5, DongHoHex.vangHoaHoe);
      const iconText = this.scene.add.text(-265, 0, crop.icon, { fontSize: '28px' }).setOrigin(0.5);

      // Tên cây trồng / sản phẩm
      const nameText = this.scene.add.text(-215, -26, crop.name, {
        fontFamily: "'Playfair Display', serif",
        fontSize: '16px',
        color: DongHoColors.thanDen,
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      // Tầng phù hợp
      const tierBadge = this.scene.add.text(-215, -4, `[${crop.tierName}]`, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '12px',
        color: DongHoColors.doSonDark,
        fontStyle: 'italic'
      }).setOrigin(0, 0.5);

      // Chi phí & thời gian sinh trưởng
      const infoText = this.scene.add.text(-215, 18, `Giá: ${crop.costGold} 🪙  •  Thời gian: ${Math.round(crop.growDurationSec / 60)} phút  •  Thu: ${crop.sellPriceGold} 🪙`, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '12px',
        color: DongHoColors.thanDenSoft
      }).setOrigin(0, 0.5);

      // Nút Chọn Gieo
      const chooseBtn = this.scene.add.container(240, 0);
      const btnBg = this.scene.add.rectangle(0, 0, 120, 48, DongHoHex.doSon);
      btnBg.setStrokeStyle(2, DongHoHex.vangHoaHoe);
      btnBg.setInteractive({ useHandCursor: true });

      const btnText = this.scene.add.text(0, 0, 'CHỌN GIEO', {
        fontFamily: "'Playfair Display', serif",
        fontSize: '12px',
        color: DongHoColors.trangXac,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      chooseBtn.add([btnBg, btnText]);

      btnBg.on('pointerdown', () => {
        sound.playBambooClick();
        this.onSelectCrop(crop.id);
        this.close();
      });

      card.add([cardBg, iconCircle, iconText, nameText, tierBadge, infoText, chooseBtn]);
      this.contentContainer.add(card);
    });
  }

  /**
   * Danh sách đơn hàng từ dân làng (Thị Nở, Bá Kiến, Lái Buôn)
   */
  private renderOrdersList() {
    const orders = [
      {
        npc: 'Thị Nở Nấu Cháo',
        desc: 'Cần: 2 Nải Chuối Ngự Nam Sang',
        reward: '+150 Vàng Nén  +35 Danh Vọng',
        icon: '🥣'
      },
      {
        npc: 'Bác Chí Phèo',
        desc: 'Cần: 5 Bụi Bèo Hoa Dâu ủ men',
        reward: '+80 Vàng Nén  +20 Danh Vọng',
        icon: '🧱'
      },
      {
        npc: 'Bá Kiến Thu Thuế',
        desc: 'Cần: 1 Xấp Giấy Dó Thô đóng sắc phong',
        reward: '+600 Vàng Nén  +120 Danh Vọng',
        icon: '📜'
      }
    ];

    orders.forEach((order, idx) => {
      const cardY = 30 + idx * 135;
      const card = this.scene.add.container(this.drawerWidth / 2, cardY);

      const cardBg = this.scene.add.rectangle(0, 0, this.drawerWidth - 44, 120, DongHoHex.giayDiepDark, 0.7);
      cardBg.setStrokeStyle(2, DongHoHex.thanDen);

      const iconT = this.scene.add.text(-260, 0, order.icon, { fontSize: '36px' }).setOrigin(0.5);

      const npcT = this.scene.add.text(-200, -32, order.npc, {
        fontFamily: "'Playfair Display', serif",
        fontSize: '17px',
        color: DongHoColors.doSonDark,
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      const descT = this.scene.add.text(-200, -4, order.desc, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '13px',
        color: DongHoColors.thanDen
      }).setOrigin(0, 0.5);

      const rewardT = this.scene.add.text(-200, 24, `Phần thưởng: ${order.reward}`, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '12px',
        color: DongHoColors.doSon,
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      const fulfillBtn = this.scene.add.container(240, 0);
      const btnBg = this.scene.add.rectangle(0, 0, 115, 48, DongHoHex.thanDenSoft);
      btnBg.setStrokeStyle(2, DongHoHex.vangHoaHoe);
      btnBg.setInteractive({ useHandCursor: true });

      const btnT = this.scene.add.text(0, 0, 'GIAO HÀNG', {
        fontFamily: "'Playfair Display', serif",
        fontSize: '12px',
        color: DongHoColors.vangHoaHoe,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      fulfillBtn.add([btnBg, btnT]);

      btnBg.on('pointerdown', () => {
        sound.playCoinChime();
        this.scene.events.emit('SHOW_TOAST', `Đã giao hàng thành công cho ${order.npc}!`);
      });

      card.add([cardBg, iconT, npcT, descT, rewardT, fulfillBtn]);
      this.contentContainer.add(card);
    });
  }

  public open() {
    this.isOpen = true;
    this.scene.tweens.add({
      targets: this,
      y: this.openY,
      duration: 350,
      ease: 'Back.easeOut'
    });
  }

  public close() {
    this.isOpen = false;
    this.scene.tweens.add({
      targets: this,
      y: this.closedY,
      duration: 280,
      ease: 'Cubic.easeIn'
    });
  }

  public toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}
