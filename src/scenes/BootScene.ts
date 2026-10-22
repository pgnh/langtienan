import Phaser from 'phaser';
import { DongHoColors, DongHoHex } from '../config/theme';
import { ASSET_LIST } from '../constants/assets';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const { width, height } = this.cameras.main;

    // 1. Nền Giấy Điệp truyền thống
    const bg = this.add.rectangle(width / 2, height / 2, width, height, DongHoHex.giayDiep);
    bg.setOrigin(0.5);

    // 2. Khung viền mộc bản Đông Hồ
    const border = this.add.rectangle(width / 2, height / 2, width - 40, height - 60);
    border.setStrokeStyle(4, DongHoHex.thanDen);
    border.setOrigin(0.5);

    // 3. Tiêu đề LÀNG TIỀN AN
    this.add.text(width / 2, height / 2 - 130, 'LÀNG TIỀN AN', {
      fontFamily: "'Playfair Display', 'Cinzel Decorative', 'Noto Serif', serif",
      fontSize: '46px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 4. Dấu triện son đỏ "安" (An)
    this.add.rectangle(width / 2, height / 2 - 50, 56, 56, DongHoHex.doSon).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 50, '安', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '32px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 5. Khẩu hiệu nghệ thuật
    this.add.text(width / 2, height / 2 + 15, 'Vườn Xưa Lò Cũ • Mộc Bản Đông Hồ', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '18px',
      color: DongHoColors.doSon,
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // 6. Khung thanh nạp tiến trình
    const barWidth = 340;
    const barHeight = 22;
    const barY = height / 2 + 85;

    const barBg = this.add.rectangle(width / 2, barY, barWidth, barHeight, DongHoHex.giayDiepDark);
    barBg.setStrokeStyle(2, DongHoHex.thanDen);
    barBg.setOrigin(0.5);

    const progressBar = this.add.rectangle(width / 2 - barWidth / 2 + 2, barY, 0, barHeight - 4, DongHoHex.doSon);
    progressBar.setOrigin(0, 0.5);

    // 7. Nhãn phần trăm & trạng thái nạp
    const percentText = this.add.text(width / 2, barY - 24, '0%', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '16px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const progressText = this.add.text(width / 2, barY + 36, 'Đang mài mực than tre, quét hồ điệp...', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '15px',
      color: DongHoColors.thanDenSoft
    }).setOrigin(0.5);

    // Lắng nghe sự kiện tải tài nguyên của Phaser Loader
    this.load.on('progress', (value: number) => {
      progressBar.width = (barWidth - 4) * value;
      percentText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on('fileprogress', (file: Phaser.Loader.File) => {
      progressText.setText(`Đang nạp ván in: ${file.key}...`);
    });

    this.load.on('complete', () => {
      progressText.setText('Mộc bản hoàn tất! Đang mở cổng làng...');
    });

    // 8. Tải toàn bộ assets thực tế được đăng ký trong ASSET_LIST
    for (const asset of ASSET_LIST) {
      this.load.image(asset.key, asset.path);
    }

    // 9. Sinh texture procedural bổ trợ cho các slot chưa có file ảnh riêng (cửa lò, bậc đình, nút dock)
    this.createProceduralTextures();
  }

  create() {
    // Tự động chuyển tiếp sang FarmWorldScene và kích hoạt song song HUDOverlayScene
    this.time.delayedCall(300, () => {
      this.scene.start('FarmWorldScene');
      this.scene.launch('HUDOverlayScene');
    });
  }

  /**
   * Tạo texture mộc bản procedural dự phòng hoặc các element canvas
   */
  private createProceduralTextures() {
    // 1. Slot cửa lò gạch Tầng 3
    if (!this.textures.exists('slot_kiln')) {
      const gKiln = this.make.graphics({ x: 0, y: 0 });
      gKiln.fillStyle(DongHoHex.doSonDark, 1);
      gKiln.fillRoundedRect(0, 0, 140, 120, 14);
      gKiln.lineStyle(3, DongHoHex.thanDen, 1);
      gKiln.strokeRoundedRect(0, 0, 140, 120, 14);
      gKiln.fillStyle(DongHoHex.thanDen, 0.8);
      gKiln.fillCircle(70, 60, 36);
      gKiln.fillStyle(DongHoHex.doSon, 1);
      gKiln.fillCircle(70, 65, 20);
      gKiln.generateTexture('slot_kiln', 140, 120);
      gKiln.destroy();
    }

    // 2. Slot phên phơi xưởng giấy Tầng 4
    if (!this.textures.exists('slot_paper')) {
      const gPaper = this.make.graphics({ x: 0, y: 0 });
      gPaper.fillStyle(DongHoHex.giayDiepDark, 1);
      gPaper.fillRoundedRect(0, 0, 140, 120, 14);
      gPaper.lineStyle(3, DongHoHex.thanDen, 1);
      gPaper.strokeRoundedRect(0, 0, 140, 120, 14);
      gPaper.lineStyle(1.5, DongHoHex.thanDen, 0.5);
      for (let x = 20; x <= 120; x += 15) {
        gPaper.lineBetween(x, 15, x, 105);
      }
      gPaper.generateTexture('slot_paper', 140, 120);
      gPaper.destroy();
    }

    // 3. Slot bậc đá Sân Đình Tầng 5
    if (!this.textures.exists('slot_shrine')) {
      const gShrine = this.make.graphics({ x: 0, y: 0 });
      gShrine.fillStyle(DongHoHex.thanDenSoft, 1);
      gShrine.fillRoundedRect(0, 0, 140, 120, 14);
      gShrine.lineStyle(3, DongHoHex.vangHoaHoe, 1);
      gShrine.strokeRoundedRect(0, 0, 140, 120, 14);
      gShrine.lineStyle(1.5, DongHoHex.doSon, 0.7);
      gShrine.lineBetween(20, 20, 120, 100);
      gShrine.lineBetween(120, 20, 20, 100);
      gShrine.generateTexture('slot_shrine', 140, 120);
      gShrine.destroy();
    }

    // 4. Nút bấm Dock đáy
    if (!this.textures.exists('btn_dock')) {
      const gBtn = this.make.graphics({ x: 0, y: 0 });
      gBtn.fillStyle(DongHoHex.giayDiep, 1);
      gBtn.fillRoundedRect(0, 0, 130, 64, 12);
      gBtn.lineStyle(3, DongHoHex.thanDen, 1);
      gBtn.strokeRoundedRect(0, 0, 130, 64, 12);
      gBtn.generateTexture('btn_dock', 130, 64);
      gBtn.destroy();
    }

    // 5. Nút bấm đỏ son
    if (!this.textures.exists('btn_red')) {
      const gBtnRed = this.make.graphics({ x: 0, y: 0 });
      gBtnRed.fillStyle(DongHoHex.doSon, 1);
      gBtnRed.fillRoundedRect(0, 0, 110, 42, 8);
      gBtnRed.lineStyle(2, DongHoHex.thanDen, 1);
      gBtnRed.strokeRoundedRect(0, 0, 110, 42, 8);
      gBtnRed.generateTexture('btn_red', 110, 42);
      gBtnRed.destroy();
    }
  }
}
