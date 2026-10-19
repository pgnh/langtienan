import Phaser from 'phaser';
import { DongHoColors, DongHoHex } from '../config/theme';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Tạo giao diện màn hình nạp (Loading Scene) phong cách tranh dân gian Đông Hồ
    const { width, height } = this.cameras.main;

    // Nền Giấy Điệp
    const bg = this.add.rectangle(width / 2, height / 2, width, height, DongHoHex.giayDiep);
    bg.setOrigin(0.5);

    // Khung viền mộc bản
    const border = this.add.rectangle(width / 2, height / 2, width - 40, height - 60);
    border.setStrokeStyle(4, DongHoHex.thanDen);
    border.setOrigin(0.5);

    // Tiêu đề Làng Tiền An
    this.add.text(width / 2, height / 2 - 120, 'LÀNG TIỀN AN', {
      fontFamily: "'Playfair Display', 'Cinzel Decorative', serif",
      fontSize: '44px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Dấu triện son đỏ
    this.add.rectangle(width / 2, height / 2 - 40, 56, 56, DongHoHex.doSon).setOrigin(0.5);
    this.add.text(width / 2, height / 2 - 40, '安', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '32px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Khẩu hiệu trào phúng
    this.add.text(width / 2, height / 2 + 25, 'Vườn Xưa Lò Cũ • Mộc Bản Đông Hồ', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '18px',
      color: DongHoColors.doSon,
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Thanh nạp tiến trình
    const barWidth = 320;
    const barHeight = 20;
    const barBg = this.add.rectangle(width / 2, height / 2 + 90, barWidth, barHeight, DongHoHex.giayDiepDark);
    barBg.setStrokeStyle(2, DongHoHex.thanDen);
    barBg.setOrigin(0.5);

    const progressBar = this.add.rectangle(width / 2 - barWidth / 2 + 2, height / 2 + 90, 0, barHeight - 4, DongHoHex.doSon);
    progressBar.setOrigin(0, 0.5);

    const progressText = this.add.text(width / 2, height / 2 + 130, 'Đang mài mực than tre, quét hồ điệp...', {
      fontFamily: "'Noto Serif', serif",
      fontSize: '15px',
      color: DongHoColors.thanDenSoft
    }).setOrigin(0.5);

    // Mô phỏng tiến trình tải
    this.load.on('progress', (value: number) => {
      progressBar.width = (barWidth - 4) * value;
    });

    // Thử nạp ảnh tham khảo nếu có trong thư mục assets
    this.load.image('ref_vanvillage', '/assets/references/vanvillage.jpg');

    // Tạo các texture procedural ngay trong BootScene
    this.createProceduralTextures();
  }

  create() {
    // Chuyển sang thế giới nông trại và khởi chạy HUD song song
    this.time.delayedCall(400, () => {
      this.scene.start('FarmWorldScene');
      this.scene.launch('HUDOverlayScene');
    });
  }

  /**
   * Tạo các texture mộc bản Đông Hồ trực tiếp lên bộ đệm Phaser Canvas
   */
  private createProceduralTextures() {
    // 1. Texture ô nước Ao Bèo (Tầng 1)
    const gWater = this.make.graphics({ x: 0, y: 0 });
    gWater.fillStyle(DongHoHex.xanhChamDark, 1);
    gWater.fillRoundedRect(0, 0, 140, 120, 14);
    gWater.lineStyle(3, DongHoHex.thanDen, 1);
    gWater.strokeRoundedRect(0, 0, 140, 120, 14);
    // Gợn sóng nước phong cách Đông Hồ
    gWater.lineStyle(2, DongHoHex.xanhCham, 0.8);
    gWater.beginPath();
    gWater.arc(45, 60, 20, 0, Math.PI, false);
    gWater.arc(85, 60, 20, 0, Math.PI, false);
    gWater.strokePath();
    gWater.generateTexture('slot_water', 140, 120);
    gWater.destroy();

    // 2. Texture luống đất Vườn Chuối (Tầng 2)
    const gSoil = this.make.graphics({ x: 0, y: 0 });
    gSoil.fillStyle(DongHoHex.datSet, 1);
    gSoil.fillRoundedRect(0, 0, 140, 120, 14);
    gSoil.lineStyle(3, DongHoHex.thanDen, 1);
    gSoil.strokeRoundedRect(0, 0, 140, 120, 14);
    // Vạch luống cày phù sa
    gSoil.lineStyle(2, DongHoHex.thanDenSoft, 0.6);
    gSoil.lineBetween(15, 40, 125, 40);
    gSoil.lineBetween(15, 80, 125, 80);
    gSoil.generateTexture('slot_soil', 140, 120);
    gSoil.destroy();

    // 3. Texture cửa lò nung Lò Gạch Cũ (Tầng 3)
    const gKiln = this.make.graphics({ x: 0, y: 0 });
    gKiln.fillStyle(DongHoHex.doSonDark, 1);
    gKiln.fillRoundedRect(0, 0, 140, 120, 14);
    gKiln.lineStyle(3, DongHoHex.thanDen, 1);
    gKiln.strokeRoundedRect(0, 0, 140, 120, 14);
    // Vòm cửa lò gạch nung rực lửa
    gKiln.fillStyle(DongHoHex.thanDen, 0.8);
    gKiln.fillCircle(70, 60, 36);
    gKiln.fillStyle(DongHoHex.doSon, 1);
    gKiln.fillCircle(70, 65, 20);
    gKiln.generateTexture('slot_kiln', 140, 120);
    gKiln.destroy();

    // 4. Texture phên phơi Xưởng Giấy (Tầng 4)
    const gPaper = this.make.graphics({ x: 0, y: 0 });
    gPaper.fillStyle(DongHoHex.giayDiepDark, 1);
    gPaper.fillRoundedRect(0, 0, 140, 120, 14);
    gPaper.lineStyle(3, DongHoHex.thanDen, 1);
    gPaper.strokeRoundedRect(0, 0, 140, 120, 14);
    // Nan tre phên phơi giấy
    gPaper.lineStyle(1.5, DongHoHex.thanDen, 0.5);
    for (let x = 20; x <= 120; x += 15) {
      gPaper.lineBetween(x, 15, x, 105);
    }
    gPaper.generateTexture('slot_paper', 140, 120);
    gPaper.destroy();

    // 5. Texture bậc đá Sân Đình (Tầng 5)
    const gShrine = this.make.graphics({ x: 0, y: 0 });
    gShrine.fillStyle(DongHoHex.thanDenSoft, 1);
    gShrine.fillRoundedRect(0, 0, 140, 120, 14);
    gShrine.lineStyle(3, DongHoHex.vangHoaHoe, 1);
    gShrine.strokeRoundedRect(0, 0, 140, 120, 14);
    // Hoa văn gạch nghiêng sân đình
    gShrine.lineStyle(1.5, DongHoHex.doSon, 0.7);
    gShrine.lineBetween(20, 20, 120, 100);
    gShrine.lineBetween(120, 20, 20, 100);
    gShrine.generateTexture('slot_shrine', 140, 120);
    gShrine.destroy();

    // 6. Texture nút bấm đáy mộc bản (Nav Button Background)
    const gBtn = this.make.graphics({ x: 0, y: 0 });
    gBtn.fillStyle(DongHoHex.giayDiep, 1);
    gBtn.fillRoundedRect(0, 0, 130, 64, 12);
    gBtn.lineStyle(3, DongHoHex.thanDen, 1);
    gBtn.strokeRoundedRect(0, 0, 130, 64, 12);
    gBtn.generateTexture('btn_dock', 130, 64);
    gBtn.destroy();

    // 7. Texture nút bấm chọn / mua đỏ son
    const gBtnRed = this.make.graphics({ x: 0, y: 0 });
    gBtnRed.fillStyle(DongHoHex.doSon, 1);
    gBtnRed.fillRoundedRect(0, 0, 110, 42, 8);
    gBtnRed.lineStyle(2, DongHoHex.thanDen, 1);
    gBtnRed.strokeRoundedRect(0, 0, 110, 42, 8);
    gBtnRed.generateTexture('btn_red', 110, 42);
    gBtnRed.destroy();
  }
}
