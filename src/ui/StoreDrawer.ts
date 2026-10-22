import Phaser from 'phaser';
import { DongHoColors, DongHoHex } from '../config/theme';
import { CROPS_LIST, CROPS_DATA } from '../constants/crops';
import { GameService } from '../services/supabase';
import { sound } from '../services/soundService';

export class StoreDrawer extends Phaser.GameObjects.Container {
  public isOpen = false;
  private contentContainer!: Phaser.GameObjects.Container;
  private activeTab: 'buy' | 'sell' | 'orders' = 'buy';

  private tabBuyBtn!: Phaser.GameObjects.Container;
  private tabSellBtn!: Phaser.GameObjects.Container;
  private tabOrdersBtn!: Phaser.GameObjects.Container;
  private onSelectCrop: (cropId: string) => void;

  private drawerWidth = 700;
  private drawerHeight = 880;
  private openY = 380;
  private closedY = 1320;

  constructor(scene: Phaser.Scene, onSelectCrop: (cropId: string) => void) {
    super(scene, 10, 1320);
    this.onSelectCrop = onSelectCrop;

    this.createDrawer();
    scene.add.existing(this);
  }

  private createDrawer() {
    // 1. Lớp phủ nền mộc bản Đông Hồ cuộn giấy
    const bg = this.scene.add.rectangle(
      this.drawerWidth / 2,
      this.drawerHeight / 2,
      this.drawerWidth,
      this.drawerHeight,
      DongHoHex.giayDiep,
      0.98
    );
    bg.setStrokeStyle(4, DongHoHex.thanDen);
    this.add(bg);

    // 2. Viền hoa văn triện son trang trí
    const innerBorder = this.scene.add.rectangle(
      this.drawerWidth / 2,
      this.drawerHeight / 2,
      this.drawerWidth - 18,
      this.drawerHeight - 18
    );
    innerBorder.setStrokeStyle(1.5, DongHoHex.doSon);
    this.add(innerBorder);

    // 3. Tiêu đề Tiệm Tạp Hóa phong cách bảng gỗ
    const headerBg = this.scene.add.rectangle(
      this.drawerWidth / 2,
      45,
      this.drawerWidth - 36,
      56,
      DongHoHex.doSon
    );
    headerBg.setStrokeStyle(2, DongHoHex.vangHoaHoe);

    const titleText = this.scene.add.text(
      this.drawerWidth / 2 - 25,
      45,
      'TIỆM TẠP HÓA & GIAO THƯƠNG LÀNG',
      {
        fontFamily: "'Playfair Display', serif",
        fontSize: '18px',
        color: DongHoColors.trangXac,
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    const sealText = this.scene.add.text(50, 45, '🏪', { fontSize: '26px' }).setOrigin(0.5);

    // Nút đóng ngăn kéo '✖'
    const closeBtn = this.scene.add.container(this.drawerWidth - 55, 45);
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

    // 4. Thanh 3 Tab: Mua Giống - Bán Nông Sản - Đơn Thu Mua
    this.createTabs();

    // 5. Vùng nội dung danh sách
    this.contentContainer = this.scene.add.container(0, 145);
    this.add(this.contentContainer);

    // 6. Nút Đỏ Mộc Bản "ĐÓNG GIAO DỊCH" ở chân bảng gỗ
    const footerBtn = this.scene.add.container(this.drawerWidth / 2, this.drawerHeight - 40);
    const footerBg = this.scene.add.rectangle(0, 0, 240, 42, DongHoHex.doSon);
    footerBg.setStrokeStyle(2, DongHoHex.thanDen);
    footerBg.setInteractive({ useHandCursor: true });
    const footerText = this.scene.add.text(0, 0, 'ĐÓNG GIAO DỊCH', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '13px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    footerBtn.add([footerBg, footerText]);
    footerBg.on('pointerdown', () => {
      sound.playBambooClick();
      this.close();
    });
    this.add(footerBtn);

    this.renderActiveTabContent();
  }

  private createTabs() {
    const tabY = 105;
    const tabWidth = 210;
    const tabHeight = 42;

    // Tab 1: Mua Hạt Giống
    this.tabBuyBtn = this.scene.add.container(125, tabY);
    const buyBg = this.scene.add.rectangle(0, 0, tabWidth, tabHeight, DongHoHex.doSon);
    buyBg.setStrokeStyle(2, DongHoHex.thanDen);
    buyBg.setInteractive({ useHandCursor: true });
    const buyText = this.scene.add.text(0, 0, '🌱 MUA GIỐNG', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '13px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.tabBuyBtn.add([buyBg, buyText]);

    buyBg.on('pointerdown', () => {
      sound.playBambooClick();
      this.activeTab = 'buy';
      this.updateTabStyles();
      this.renderActiveTabContent();
    });

    // Tab 2: Bán Nông Sản (Kho Đồ)
    this.tabSellBtn = this.scene.add.container(350, tabY);
    const sellBg = this.scene.add.rectangle(0, 0, tabWidth, tabHeight, DongHoHex.giayDiepDark);
    sellBg.setStrokeStyle(2, DongHoHex.thanDen);
    sellBg.setInteractive({ useHandCursor: true });
    const sellText = this.scene.add.text(0, 0, '🧺 BÁN NÔNG SẢN', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '13px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.tabSellBtn.add([sellBg, sellText]);

    sellBg.on('pointerdown', () => {
      sound.playBambooClick();
      this.activeTab = 'sell';
      this.updateTabStyles();
      this.renderActiveTabContent();
    });

    // Tab 3: Đơn Thu Mua Làng (Thị Nở & Chí Phèo)
    this.tabOrdersBtn = this.scene.add.container(575, tabY);
    const ordersBg = this.scene.add.rectangle(0, 0, tabWidth, tabHeight, DongHoHex.giayDiepDark);
    ordersBg.setStrokeStyle(2, DongHoHex.thanDen);
    ordersBg.setInteractive({ useHandCursor: true });
    const ordersText = this.scene.add.text(0, 0, '📜 HỢP ĐỒNG', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '13px',
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

    this.add([this.tabBuyBtn, this.tabSellBtn, this.tabOrdersBtn]);
  }

  private updateTabStyles() {
    const tabs = [
      { key: 'buy', container: this.tabBuyBtn },
      { key: 'sell', container: this.tabSellBtn },
      { key: 'orders', container: this.tabOrdersBtn }
    ];

    tabs.forEach((tab) => {
      const bg = tab.container.getAt(0) as Phaser.GameObjects.Rectangle;
      const text = tab.container.getAt(1) as Phaser.GameObjects.Text;
      const isActive = this.activeTab === tab.key;

      bg.setFillStyle(isActive ? DongHoHex.doSon : DongHoHex.giayDiepDark);
      text.setColor(isActive ? DongHoColors.trangXac : DongHoColors.thanDen);
    });
  }

  private async renderActiveTabContent() {
    this.contentContainer.removeAll(true);

    if (this.activeTab === 'buy') {
      this.renderBuyList();
    } else if (this.activeTab === 'sell') {
      await this.renderSellList();
    } else {
      await this.renderOrdersList();
    }
  }

  /**
   * Tab 1: Danh mục hàng hóa mua hạt giống & phôi
   */
  private renderBuyList() {
    const startY = 15;
    const itemHeight = 100;

    // Hiển thị 6 loại giống tiêu biểu
    CROPS_LIST.slice(0, 6).forEach((crop, idx) => {
      const cardY = startY + idx * itemHeight;
      const card = this.scene.add.container(this.drawerWidth / 2, cardY);

      const cardBg = this.scene.add.rectangle(0, 0, this.drawerWidth - 44, 90, DongHoHex.giayDiepDark, 0.7);
      cardBg.setStrokeStyle(2, DongHoHex.thanDen);

      const iconCircle = this.scene.add.circle(-265, 0, 30, DongHoHex.thanDenSoft);
      iconCircle.setStrokeStyle(1.5, DongHoHex.vangHoaHoe);
      const iconText = this.scene.add.text(-265, 0, crop.icon, { fontSize: '28px' }).setOrigin(0.5);

      const nameText = this.scene.add.text(-220, -22, crop.name, {
        fontFamily: "'Playfair Display', serif",
        fontSize: '16px',
        color: DongHoColors.thanDen,
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      const durationMins = Math.round(crop.growDurationSec / 60);
      const durationLabel = durationMins > 0 ? `${durationMins} phút` : `${crop.growDurationSec}s`;

      const infoText = this.scene.add.text(-220, 4, `Giá mua: ${crop.costGold} 🪙 Vàng  •  Thời gian: ⏳ ${durationLabel}`, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '12px',
        color: DongHoColors.doSonDark,
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      const yieldText = this.scene.add.text(-220, 24, `Thu hoạch: +${crop.sellPriceGold} 🪙 Vàng  +${crop.rewardFame} EXP [${crop.tierName}]`, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '11px',
        color: DongHoColors.thanDenSoft
      }).setOrigin(0, 0.5);

      const chooseBtn = this.scene.add.container(240, 0);
      const btnBg = this.scene.add.rectangle(0, 0, 115, 44, DongHoHex.doSon);
      btnBg.setStrokeStyle(2, DongHoHex.vangHoaHoe);
      btnBg.setInteractive({ useHandCursor: true });
      const btnText = this.scene.add.text(0, 0, 'CHỌN GIỐNG', {
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

      card.add([cardBg, iconCircle, iconText, nameText, infoText, yieldText, chooseBtn]);
      this.contentContainer.add(card);
    });
  }

  /**
   * Tab 2: Bán nông sản trong kho đồ lấy Vàng Nén
   */
  private async renderSellList() {
    const inventory = await GameService.getInventory();
    const cropKeys = Object.keys(inventory).filter((k) => inventory[k] > 0);

    if (cropKeys.length === 0) {
      const emptyText = this.scene.add.text(
        this.drawerWidth / 2,
        180,
        'Kho đồ trống rỗng! Hãy thu hoạch nông sản rồi mang ra tiệm bán.',
        {
          fontFamily: "'Noto Serif', serif",
          fontSize: '14px',
          color: DongHoColors.thanDenSoft,
          fontStyle: 'italic'
        }
      ).setOrigin(0.5);
      this.contentContainer.add(emptyText);
      return;
    }

    const startY = 15;
    const itemHeight = 100;

    cropKeys.forEach((cropId, idx) => {
      const crop = CROPS_DATA[cropId];
      if (!crop) return;

      const qty = inventory[cropId];
      const cardY = startY + idx * itemHeight;
      const card = this.scene.add.container(this.drawerWidth / 2, cardY);

      const cardBg = this.scene.add.rectangle(0, 0, this.drawerWidth - 44, 90, DongHoHex.giayDiepDark, 0.7);
      cardBg.setStrokeStyle(2, DongHoHex.thanDen);

      const iconT = this.scene.add.text(-265, 0, crop.icon, { fontSize: '32px' }).setOrigin(0.5);

      const nameT = this.scene.add.text(-220, -22, `${crop.name} (Có: ${qty} ${crop.yieldUnit})`, {
        fontFamily: "'Playfair Display', serif",
        fontSize: '16px',
        color: DongHoColors.thanDen,
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      const sellPriceT = this.scene.add.text(-220, 10, `Giá thu mua: ${crop.sellPriceGold} 🪙 / ${crop.yieldUnit}`, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '13px',
        color: DongHoColors.vangHoaHoeDark,
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      // Nút Bán 1 Đơn Vị
      const sellBtn = this.scene.add.container(240, 0);
      const btnBg = this.scene.add.rectangle(0, 0, 115, 44, DongHoHex.vangHoaHoe);
      btnBg.setStrokeStyle(2, DongHoHex.thanDen);
      btnBg.setInteractive({ useHandCursor: true });
      const btnText = this.scene.add.text(0, 0, `BÁN (+${crop.sellPriceGold} 🪙)`, {
        fontFamily: "'Playfair Display', serif",
        fontSize: '11px',
        color: DongHoColors.thanDen,
        fontStyle: 'bold'
      }).setOrigin(0.5);
      sellBtn.add([btnBg, btnText]);

      btnBg.on('pointerdown', async () => {
        sound.playCoinChime();
        try {
          const res = await GameService.sellCrop(cropId, 1);
          this.scene.events.emit('SHOW_TOAST', `🪙 Đã bán 1 ${crop.yieldUnit} ${crop.name}, nhận +${res.earnedGold} Vàng Nén!`);
          this.renderActiveTabContent();
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Lỗi bán hàng!';
          this.scene.events.emit('SHOW_TOAST', `⚠️ ${msg}`);
        }
      });

      card.add([cardBg, iconT, nameT, sellPriceT, sellBtn]);
      this.contentContainer.add(card);
    });
  }

  /**
   * Tab 3: Hợp đồng thu mua đặc biệt của dân làng (Thị Nở, Chí Phèo, Bá Kiến)
   */
  private async renderOrdersList() {
    const orders = [
      {
        id: 'order_thino_01',
        npc: 'Bát Cháo Hành Thị Nở',
        desc: 'Cần: 2 Nải Chuối Ngự Nam Sang',
        costItems: [{ cropId: 'chuoi_ngu', quantity: 2 }],
        rewardGold: 160,
        rewardFame: 40,
        icon: '🍲'
      },
      {
        id: 'order_chipheo_01',
        npc: 'Lò Than Bác Chí Phèo',
        desc: 'Cần: 3 Bụi Bèo Hoa Dâu ủ men',
        costItems: [{ cropId: 'beo_hoa_dau', quantity: 3 }],
        rewardGold: 90,
        rewardFame: 25,
        icon: '🧱'
      },
      {
        id: 'order_bakien_01',
        npc: 'Tiến Vua Cụ Bá Kiến',
        desc: 'Cần: 1 Con Cá Chép Vàng Sông Đáy',
        costItems: [{ cropId: 'ca_chep', quantity: 1 }],
        rewardGold: 220,
        rewardFame: 55,
        icon: '🐟'
      }
    ];

    const inventory = await GameService.getInventory();

    orders.forEach((order, idx) => {
      const cardY = 30 + idx * 140;
      const card = this.scene.add.container(this.drawerWidth / 2, cardY);

      // Kiểm tra có đủ hàng trong kho
      const hasEnough = order.costItems.every((req) => (inventory[req.cropId] || 0) >= req.quantity);

      const cardBg = this.scene.add.rectangle(0, 0, this.drawerWidth - 44, 120, DongHoHex.giayDiepDark, 0.75);
      cardBg.setStrokeStyle(2, hasEnough ? DongHoHex.doSon : DongHoHex.thanDen);

      const iconT = this.scene.add.text(-260, 0, order.icon, { fontSize: '38px' }).setOrigin(0.5);

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

      const rewardT = this.scene.add.text(-200, 24, `Phần thưởng: +${order.rewardGold} 🪙 Vàng  +${order.rewardFame} Danh Vọng`, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '12px',
        color: DongHoColors.doSon,
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      const fulfillBtn = this.scene.add.container(240, 0);
      const btnBg = this.scene.add.rectangle(0, 0, 115, 48, hasEnough ? DongHoHex.doSon : DongHoHex.thanDenSoft);
      btnBg.setStrokeStyle(2, DongHoHex.vangHoaHoe);
      btnBg.setInteractive({ useHandCursor: hasEnough });

      const btnT = this.scene.add.text(0, 0, hasEnough ? 'GIAO HÀNG' : 'CHƯA ĐỦ', {
        fontFamily: "'Playfair Display', serif",
        fontSize: '12px',
        color: hasEnough ? DongHoColors.trangXac : DongHoColors.thanDenSoft,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      fulfillBtn.add([btnBg, btnT]);

      btnBg.on('pointerdown', async () => {
        if (!hasEnough) {
          sound.playBambooClick();
          this.scene.events.emit('SHOW_TOAST', '⚠️ Bạn chưa tích lũy đủ nông sản để hoàn tất đơn này!');
          return;
        }

        try {
          sound.playCoinChime();
          const res = await GameService.fulfillOrder(order.id, order.costItems, order.rewardGold, order.rewardFame);
          this.scene.events.emit('SHOW_TOAST', `🎉 ${order.npc}: ${res.message}`);
          this.renderActiveTabContent();
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Lỗi giao hàng!';
          this.scene.events.emit('SHOW_TOAST', `⚠️ ${msg}`);
        }
      });

      card.add([cardBg, iconT, npcT, descT, rewardT, fulfillBtn]);
      this.contentContainer.add(card);
    });
  }

  public open() {
    this.isOpen = true;
    this.renderActiveTabContent();

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
