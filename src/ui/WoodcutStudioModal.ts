import Phaser from 'phaser';
import { DongHoColors, DongHoHex } from '../config/theme';
import { WoodcutService, CraftingMaterials } from '../services/woodcutService';
import { WoodcutRecipe } from '../types/farm';
import { sound } from '../services/soundService';

export interface WoodcutStudioModalOptions {
  getUserGold: () => number;
  onGoldChanged?: (newGold: number) => void;
}

/**
 * WoodcutStudioModal - Modal Bàn Chế Tác Mộc Bản Đông Hồ
 * Kế thừa từ Phaser.GameObjects.Container
 * Thiết kế giao diện mô phỏng quyển sách cổ mở đôi (dựa theo ref: 6. Bàn chế tác mộc bản.png):
 * - Trang trái: Phôi Gỗ & Nguyên Liệu (Gỗ Thị, Bát Bột Màu, Giấy Điệp, Nút bấm Khắc Gỗ).
 * - Trang phải: Bộ Sưu Tập Mộc Bản (Lợn Âm Dương, Gà Đại Cát...), tiến độ khắc (Progress bar), dấu son đỏ "ĐÃ ẤN".
 */
export class WoodcutStudioModal extends Phaser.GameObjects.Container {
  public isOpen = false;

  private dimmer!: Phaser.GameObjects.Rectangle;
  private bookContainer!: Phaser.GameObjects.Container;
  private leftPageContainer!: Phaser.GameObjects.Container;
  private rightPageContainer!: Phaser.GameObjects.Container;

  // Selected recipe state
  private selectedRecipeId: string = 'lon_am_duong';

  // Left page components
  private woodStockText!: Phaser.GameObjects.Text;
  private pigmentStockText!: Phaser.GameObjects.Text;
  private paperStockText!: Phaser.GameObjects.Text;
  private selectedTitleText!: Phaser.GameObjects.Text;
  private selectedDescText!: Phaser.GameObjects.Text;
  private selectedBuffText!: Phaser.GameObjects.Text;
  private costInfoText!: Phaser.GameObjects.Text;
  private carveBtnContainer!: Phaser.GameObjects.Container;
  private carveBtnBg!: Phaser.GameObjects.Rectangle;
  private carveBtnText!: Phaser.GameObjects.Text;

  private getUserGold: () => number;
  private onGoldChanged?: (newGold: number) => void;

  private modalWidth = 680;
  private modalHeight = 920;

  constructor(scene: Phaser.Scene, options: WoodcutStudioModalOptions) {
    super(scene, 0, 0);

    this.getUserGold = options.getUserGold;
    this.onGoldChanged = options.onGoldChanged;

    this.createUI();
    this.setVisible(false);
    scene.add.existing(this);

    // Lắng nghe cập nhật state từ WoodcutService
    WoodcutService.subscribe(() => {
      if (this.isOpen) {
        this.refreshStudioView();
      }
    });
  }

  private createUI() {
    // 1. Dimmer tối màu nền
    this.dimmer = this.scene.add.rectangle(360, 640, 720, 1280, 0x000000, 0.65);
    this.dimmer.setInteractive();
    this.dimmer.on('pointerdown', () => this.close());
    this.add(this.dimmer);

    // 2. Container quyển sách cổ
    this.bookContainer = this.scene.add.container(360, 640);

    // Nền bìa gỗ lim thô mộc
    const coverBg = this.scene.add.rectangle(0, 0, this.modalWidth, this.modalHeight, DongHoHex.thanDenSoft, 0.98);
    coverBg.setStrokeStyle(4, DongHoHex.thanDen);
    this.bookContainer.add(coverBg);

    // Mép gáy sách may chỉ cổ truyền chạy dọc giữa
    const spine = this.scene.add.rectangle(0, 0, 10, this.modalHeight - 30, DongHoHex.vangHoaHoe, 0.35);
    spine.setStrokeStyle(1.5, DongHoHex.thanDen);

    // Header biển hiệu trên đầu sách
    const headerBg = this.scene.add.rectangle(0, -this.modalHeight / 2 + 45, this.modalWidth - 40, 56, DongHoHex.doSon);
    headerBg.setStrokeStyle(2, DongHoHex.vangHoaHoe);

    const titleText = this.scene.add.text(0, -this.modalHeight / 2 + 45, '🏮 BÀN CHẾ TÁC MỘC BẢN ĐÔNG HỒ 🏮', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '19px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Nút đóng góc phải
    const closeBtn = this.scene.add.container(this.modalWidth / 2 - 45, -this.modalHeight / 2 + 45);
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

    this.bookContainer.add([coverBg, spine, headerBg, titleText, closeBtn]);

    // 3. Phân chia 2 trang mở đôi (Giao diện 2 nửa dọc trên dưới để chuẩn di động 9:16)
    // Nửa trên (Trang trái): Phôi Gỗ, Nguyên Liệu & Nút Khắc
    this.leftPageContainer = this.scene.add.container(0, -150);
    this.createLeftPage();
    this.bookContainer.add(this.leftPageContainer);

    // Nửa dưới (Trang phải): Bộ sưu tập Mộc Bản & Con dấu triện đỏ
    this.rightPageContainer = this.scene.add.container(0, 175);
    this.createRightPage();
    this.bookContainer.add(this.rightPageContainer);

    // Nút Đóng Bàn Chế Tác ở chân modal
    const footerCloseBtn = this.scene.add.container(0, this.modalHeight / 2 - 38);
    const footerBtnBg = this.scene.add.rectangle(0, 0, 220, 42, DongHoHex.doSon);
    footerBtnBg.setStrokeStyle(2, DongHoHex.thanDen);
    footerBtnBg.setInteractive({ useHandCursor: true });
    const footerBtnText = this.scene.add.text(0, 0, 'ĐÓNG BÀN CHẾ TÁC', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '13px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    footerCloseBtn.add([footerBtnBg, footerBtnText]);
    footerBtnBg.on('pointerdown', () => {
      sound.playBambooClick();
      this.close();
    });
    this.bookContainer.add(footerCloseBtn);

    this.add(this.bookContainer);
  }

  /**
   * Dựng Trang trái: Kho Nguyên Liệu & Bàn Khắc
   */
  private createLeftPage() {
    const pageBg = this.scene.add.rectangle(0, 0, this.modalWidth - 40, 280, DongHoHex.giayDiep, 0.98);
    pageBg.setStrokeStyle(2, DongHoHex.thanDen);
    this.leftPageContainer.add(pageBg);

    // Tiêu đề Trang trái
    const sectionTitle = this.scene.add.text(-280, -120, '1. KHO NGUYÊN LIỆU & BẢN THẢO', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '15px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    });

    // 3 Hộp hiển thị số lượng nguyên liệu
    // Hộp 1: Gỗ Thị
    const woodBox = this.scene.add.container(-190, -80);
    const woodBg = this.scene.add.rectangle(0, 0, 160, 42, DongHoHex.giayDiepDark);
    woodBg.setStrokeStyle(1.5, DongHoHex.thanDen);
    this.woodStockText = this.scene.add.text(0, 0, '🪵 Gỗ Thị: 8', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '13px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    woodBox.add([woodBg, this.woodStockText]);

    // Hộp 2: Bát Bột Màu
    const colorBox = this.scene.add.container(0, -80);
    const colorBg = this.scene.add.rectangle(0, 0, 160, 42, DongHoHex.giayDiepDark);
    colorBg.setStrokeStyle(1.5, DongHoHex.thanDen);
    this.pigmentStockText = this.scene.add.text(0, 0, '🎨 Bột Màu: 6', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '13px',
      color: DongHoColors.doSonDark,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    colorBox.add([colorBg, this.pigmentStockText]);

    // Hộp 3: Giấy Điệp
    const paperBox = this.scene.add.container(190, -80);
    const paperBg = this.scene.add.rectangle(0, 0, 160, 42, DongHoHex.giayDiepDark);
    paperBg.setStrokeStyle(1.5, DongHoHex.thanDen);
    this.paperStockText = this.scene.add.text(0, 0, '📜 Giấy Điệp: 10', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '13px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    }).setOrigin(0.5);
    paperBox.add([paperBg, this.paperStockText]);

    // Chi tiết bản thảo được chọn
    this.selectedTitleText = this.scene.add.text(-280, -35, 'Tác phẩm: Lợn Âm Dương', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '16px',
      color: DongHoColors.doSonDark,
      fontStyle: 'bold'
    });

    this.selectedDescText = this.scene.add.text(-280, -12, 'Mô tả...', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '12px',
      color: DongHoColors.thanDen,
      wordWrap: { width: 560 }
    });

    this.selectedBuffText = this.scene.add.text(-280, 28, 'Hiệu ứng: ...', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '12px',
      color: DongHoColors.xanhChamDark,
      fontStyle: 'bold'
    });

    this.costInfoText = this.scene.add.text(-280, 52, 'Yêu cầu: 2 Gỗ Thị  •  1 Bột Màu  •  100 🪙 Vàng', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '12px',
      color: DongHoColors.thanDenSoft
    });

    // Nút Bấm Gỗ Đỏ "KHẮC GỖ"
    this.carveBtnContainer = this.scene.add.container(0, 95);
    this.carveBtnBg = this.scene.add.rectangle(0, 0, 260, 46, DongHoHex.doSon);
    this.carveBtnBg.setStrokeStyle(2, DongHoHex.vangHoaHoe);
    this.carveBtnBg.setInteractive({ useHandCursor: true });

    this.carveBtnText = this.scene.add.text(0, 0, '🔨 KHẮC GỖ (100 🪙)', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '14px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.carveBtnContainer.add([this.carveBtnBg, this.carveBtnText]);

    this.carveBtnBg.on('pointerdown', () => this.handleCarveAction());

    this.leftPageContainer.add([
      sectionTitle,
      woodBox,
      colorBox,
      paperBox,
      this.selectedTitleText,
      this.selectedDescText,
      this.selectedBuffText,
      this.costInfoText,
      this.carveBtnContainer
    ]);
  }

  /**
   * Dựng Trang phải: Bộ sưu tập Mộc Bản & Con dấu triện đỏ
   */
  private createRightPage() {
    const pageBg = this.scene.add.rectangle(0, 0, this.modalWidth - 40, 310, DongHoHex.giayDiep, 0.98);
    pageBg.setStrokeStyle(2, DongHoHex.thanDen);
    this.rightPageContainer.add(pageBg);

    const sectionTitle = this.scene.add.text(-280, -135, '2. BỘ SƯU TẬP MỘC BẢN ĐÔNG HỒ', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '15px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    });
    this.rightPageContainer.add(sectionTitle);
  }

  /**
   * Làm mới toàn bộ nội dung hiển thị của Studio
   */
  public refreshStudioView() {
    // 1. Cập nhật số lượng kho nguyên liệu
    const mats: CraftingMaterials = WoodcutService.getMaterials();
    this.woodStockText.setText(`🪵 Gỗ Thị: ${mats.woodThi}`);
    this.pigmentStockText.setText(`🎨 Bột Màu: ${mats.colorPigment}`);
    this.paperStockText.setText(`📜 Giấy Điệp: ${mats.diepPaper}`);

    // 2. Cập nhật thông tin bản thảo đang chọn
    const recipes = WoodcutService.getAllRecipes();
    const current = recipes.find((r) => r.id === this.selectedRecipeId) || recipes[0];
    if (current) {
      this.selectedRecipeId = current.id;
      this.selectedTitleText.setText(`Bản thảo: ${current.name}`);
      this.selectedDescText.setText(current.description);
      this.selectedBuffText.setText(`⭐ ${current.passiveBuffDesc}`);

      const costWood = current.costMaterials.find((m) => m.itemCode === 'wood_thi')?.quantity || 0;
      const costPigment = current.costMaterials.find((m) => m.itemCode === 'color_pigment')?.quantity || 0;
      this.costInfoText.setText(`Yêu cầu: ${costWood} Gỗ Thị  •  ${costPigment} Bát Màu  •  ${current.costGold} 🪙 Vàng Nén`);

      const userGold = this.getUserGold();
      const state = WoodcutService.getWoodcutState(current.id);

      if (state.unlocked) {
        this.carveBtnBg.setFillStyle(DongHoHex.thanDenSoft);
        this.carveBtnText.setText('✅ ĐÃ KHẮC THÀNH VÁN');
      } else if (userGold < current.costGold || mats.woodThi < costWood || mats.colorPigment < costPigment) {
        this.carveBtnBg.setFillStyle(DongHoHex.thanDen);
        this.carveBtnText.setText(`THIẾU NGUYÊN LIỆU (${current.costGold} 🪙)`);
      } else {
        this.carveBtnBg.setFillStyle(DongHoHex.doSon);
        this.carveBtnText.setText(`🔨 KHẮC GỖ (${current.costGold} 🪙)`);
      }
    }

    // 3. Render danh sách 4 bức tranh mộc bản ở trang phải
    this.renderRightPageCards(recipes);
  }

  /**
   * Render danh sách các thẻ tranh mộc bản
   */
  private renderRightPageCards(recipes: WoodcutRecipe[]) {
    // Xóa thẻ cũ (giữ lại 2 phần tử nền và tiêu đề)
    while (this.rightPageContainer.length > 2) {
      const item = this.rightPageContainer.getAt(2);
      this.rightPageContainer.remove(item, true);
    }

    const startY = -85;
    const itemHeight = 62;

    recipes.forEach((recipe, idx) => {
      const cardY = startY + idx * itemHeight;
      const card = this.scene.add.container(0, cardY);
      const isSelected = recipe.id === this.selectedRecipeId;
      const state = WoodcutService.getWoodcutState(recipe.id);

      // Thẻ bài
      const cardBg = this.scene.add.rectangle(
        0,
        0,
        this.modalWidth - 60,
        56,
        isSelected ? DongHoHex.giayDiepDark : (state.unlocked ? DongHoHex.giayDiep : DongHoHex.thanDenSoft),
        0.95
      );
      cardBg.setStrokeStyle(isSelected ? 2.5 : 1, isSelected ? DongHoHex.doSon : DongHoHex.thanDen);
      cardBg.setInteractive({ useHandCursor: true });
      cardBg.on('pointerdown', () => {
        sound.playBambooClick();
        this.selectedRecipeId = recipe.id;
        this.refreshStudioView();
      });

      // Icon tranh
      const iconT = this.scene.add.text(-260, 0, state.unlocked ? '🖼️' : '🔒', { fontSize: '22px' }).setOrigin(0.5);

      // Tên tranh
      const nameT = this.scene.add.text(-230, -10, recipe.name, {
        fontFamily: "'Playfair Display', serif",
        fontSize: '14px',
        color: state.unlocked ? DongHoColors.thanDen : DongHoColors.trangXac,
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      // Thanh tiến trình khắc (Progress Bar)
      const progBarWidth = 140;
      const progBg = this.scene.add.rectangle(-230, 12, progBarWidth, 8, DongHoHex.thanDen, 0.6).setOrigin(0, 0.5);
      const progFill = this.scene.add.rectangle(
        -230,
        12,
        (progBarWidth * state.carvingProgress) / 100,
        6,
        state.unlocked ? DongHoHex.doSon : DongHoHex.vangHoaHoe
      ).setOrigin(0, 0.5);

      const progText = this.scene.add.text(-80, 12, `${state.carvingProgress}%`, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '10px',
        color: DongHoColors.thanDenSoft
      }).setOrigin(0, 0.5);

      // Con dấu son đỏ "ĐÃ ẤN" hoặc Nút "ẤN DẤU SON"
      let stampObj: Phaser.GameObjects.Container;
      if (state.assignedFloor) {
        // Đã ấn định vào tầng
        stampObj = this.scene.add.container(210, 0);
        const stampBg = this.scene.add.circle(0, 0, 22, DongHoHex.doSon);
        stampBg.setStrokeStyle(2, DongHoHex.vangHoaHoe);
        const stampText = this.scene.add.text(0, -5, 'TRIỆN', {
          fontFamily: "'Playfair Display', serif",
          fontSize: '9px',
          color: DongHoColors.trangXac,
          fontStyle: 'bold'
        }).setOrigin(0.5);
        const floorText = this.scene.add.text(0, 7, `TẦNG ${state.assignedFloor}`, {
          fontFamily: "'Noto Serif', serif",
          fontSize: '8px',
          color: DongHoColors.vangHoaHoe,
          fontStyle: 'bold'
        }).setOrigin(0.5);
        stampObj.add([stampBg, stampText, floorText]);
      } else if (state.unlocked) {
        // Đã khắc xong nhưng chưa ấn dấu son
        stampObj = this.scene.add.container(210, 0);
        const stampBg = this.scene.add.rectangle(0, 0, 95, 34, DongHoHex.vangHoaHoe);
        stampBg.setStrokeStyle(1.5, DongHoHex.thanDen);
        stampBg.setInteractive({ useHandCursor: true });
        const stampText = this.scene.add.text(0, 0, 'ẤN DẤU SON', {
          fontFamily: "'Playfair Display', serif",
          fontSize: '11px',
          color: DongHoColors.thanDen,
          fontStyle: 'bold'
        }).setOrigin(0.5);
        stampObj.add([stampBg, stampText]);

        stampBg.on('pointerdown', () => {
          sound.playCoinChime();
          const res = WoodcutService.stampToFloor(recipe.id, recipe.targetFloorId);
          this.scene.events.emit('SHOW_TOAST', res.message);
          this.refreshStudioView();
        });
      } else {
        // Chưa khắc
        stampObj = this.scene.add.container(210, 0);
        const lockText = this.scene.add.text(0, 0, 'CHƯA KHẮC', {
          fontFamily: "'Noto Serif', serif",
          fontSize: '11px',
          color: DongHoColors.thanDenSoft,
          fontStyle: 'italic'
        }).setOrigin(0.5);
        stampObj.add(lockText);
      }

      card.add([cardBg, iconT, nameT, progBg, progFill, progText, stampObj]);
      this.rightPageContainer.add(card);
    });
  }

  /**
   * Xử lý khi nhấn nút Khắc Gỗ
   */
  private handleCarveAction() {
    const userGold = this.getUserGold();
    const result = WoodcutService.carveWoodcut(this.selectedRecipeId, userGold);

    if (result.success) {
      sound.playHarvestPop();
      if (this.onGoldChanged) {
        this.onGoldChanged(result.remainingGold);
      }
      this.scene.events.emit('SHOW_TOAST', `✨ ${result.message}`);
      this.refreshStudioView();
    } else {
      sound.playBambooClick();
      this.scene.events.emit('SHOW_TOAST', `⚠️ ${result.message}`);
    }
  }

  public open() {
    this.isOpen = true;
    this.setVisible(true);
    this.refreshStudioView();

    this.dimmer.setAlpha(0);
    this.bookContainer.setScale(0.92);

    this.scene.tweens.add({
      targets: this.dimmer,
      alpha: 0.65,
      duration: 200,
      ease: 'Linear'
    });

    this.scene.tweens.add({
      targets: this.bookContainer,
      scaleX: 1,
      scaleY: 1,
      duration: 280,
      ease: 'Back.easeOut'
    });

    sound.playBambooClick();
  }

  public close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    this.scene.tweens.add({
      targets: this.dimmer,
      alpha: 0,
      duration: 180,
      ease: 'Linear'
    });

    this.scene.tweens.add({
      targets: this.bookContainer,
      scaleX: 0.92,
      scaleY: 0.92,
      duration: 180,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        this.setVisible(false);
      }
    });
  }
}
