import Phaser from 'phaser';
import { DongHoColors, DongHoHex } from '../config/theme';
import { Profile } from '../types/database';
import { sound } from '../services/soundService';

export interface DailyQuest {
  id: string;
  name: string;
  desc: string;
  current: number;
  target: number;
  rewardGold: number;
  rewardFame: number;
  rewardPaper?: number;
  claimed: boolean;
  icon: string;
}

export interface PhuOngMilestone {
  level: number;
  title: string;
  desc: string;
  rewardPaper: number;
  claimed: boolean;
  icon: string;
}

export interface AchievementModalOptions {
  getProfile: () => Profile | null;
  onRewardClaimed?: (reward: { gold: number; fame: number; paper: number }) => void;
}

const QUESTS_STORAGE_KEY = 'langtienan_quests_v1';
const MILESTONES_STORAGE_KEY = 'langtienan_milestones_v1';

/**
 * AchievementModal - Sổ Đinh & Bảng Vàng Thành Tích
 * Thiết kế dạng cuốn sổ mở hai trang gáy chỉ cổ truyền (dựa theo ref: 5. Sổ đinh thành tích.jpg)
 * - Cột trái (Nhiệm Vụ Ngày): Danh sách thử thách thường nhật, thanh tiến độ và nút "Nhận".
 * - Cột phải (Bảng Vàng Phú Ông): Các mốc danh vọng, thưởng Giấy Điệp và dấu son đỏ "[ĐÃ NHẬN]".
 */
export class AchievementModal extends Phaser.GameObjects.Container {
  public isOpen = false;

  private dimmer!: Phaser.GameObjects.Rectangle;
  private bookContainer!: Phaser.GameObjects.Container;
  private leftPageContainer!: Phaser.GameObjects.Container;
  private rightPageContainer!: Phaser.GameObjects.Container;

  private getProfile: () => Profile | null;
  private onRewardClaimed?: (reward: { gold: number; fame: number; paper: number }) => void;

  private modalWidth = 690;
  private modalHeight = 900;

  private dailyQuests: DailyQuest[] = [
    {
      id: 'quest_beo_01',
      name: 'Vớt Bèo Ao Xanh',
      desc: 'Thu hoạch 5 vụ Bèo Hoa Dâu',
      current: 5,
      target: 5,
      rewardGold: 100,
      rewardFame: 30,
      claimed: false,
      icon: '🌿'
    },
    {
      id: 'quest_chuoi_01',
      name: 'Vườn Chuối Trĩu Quả',
      desc: 'Thu hoạch 3 vụ Chuối Ngự Nam Sang',
      current: 2,
      target: 3,
      rewardGold: 150,
      rewardFame: 45,
      claimed: false,
      icon: '🍌'
    },
    {
      id: 'quest_gach_01',
      name: 'Đỏ Lửa Lò Gạch',
      desc: 'Nung thành công 1 mẻ Gạch Đất Sét',
      current: 1,
      target: 1,
      rewardGold: 200,
      rewardFame: 60,
      claimed: false,
      icon: '🧱'
    }
  ];

  private milestones: PhuOngMilestone[] = [
    {
      level: 1,
      title: 'Bần Nông Cần Cù',
      desc: 'Đạt danh hiệu Cấp 1 lập nghiệp bên bờ ao',
      rewardPaper: 5,
      claimed: true,
      icon: '🌾'
    },
    {
      level: 3,
      title: 'Trung Nông Vang Tiếng',
      desc: 'Khai khẩn Vườn Chuối bãi bồi đạt Cấp 3',
      rewardPaper: 15,
      claimed: false,
      icon: '🏡'
    },
    {
      level: 8,
      title: 'Thợ Thủ Công Làng Nghề',
      desc: 'Thổi lửa Lò Gạch Cũ đạt Cấp 8',
      rewardPaper: 30,
      claimed: false,
      icon: '🏛️'
    },
    {
      level: 15,
      title: 'Nghệ Nhân Mộc Bản',
      desc: 'Phục dựng Xưởng Giấy Dó đạt Cấp 15',
      rewardPaper: 50,
      claimed: false,
      icon: '📜'
    }
  ];

  constructor(scene: Phaser.Scene, options: AchievementModalOptions) {
    super(scene, 0, 0);

    this.getProfile = options.getProfile;
    this.onRewardClaimed = options.onRewardClaimed;

    this.loadState();
    this.createUI();
    this.setVisible(false);
    scene.add.existing(this);
  }

  private loadState() {
    try {
      const q = localStorage.getItem(QUESTS_STORAGE_KEY);
      if (q) this.dailyQuests = JSON.parse(q);

      const m = localStorage.getItem(MILESTONES_STORAGE_KEY);
      if (m) this.milestones = JSON.parse(m);
    } catch (e) {
      console.warn('Lỗi đọc lưu sổ đinh:', e);
    }
  }

  private saveState() {
    try {
      localStorage.setItem(QUESTS_STORAGE_KEY, JSON.stringify(this.dailyQuests));
      localStorage.setItem(MILESTONES_STORAGE_KEY, JSON.stringify(this.milestones));
    } catch (e) {
      console.error('Lỗi lưu sổ đinh:', e);
    }
  }

  private createUI() {
    // Dimmer
    this.dimmer = this.scene.add.rectangle(360, 640, 720, 1280, 0x000000, 0.65);
    this.dimmer.setInteractive();
    this.dimmer.on('pointerdown', () => this.close());
    this.add(this.dimmer);

    // Book Container
    this.bookContainer = this.scene.add.container(360, 640);

    // Bìa sách gáy chỉ cổ truyền
    const bookBg = this.scene.add.rectangle(0, 0, this.modalWidth, this.modalHeight, DongHoHex.giayDiep, 0.98);
    bookBg.setStrokeStyle(4, DongHoHex.thanDen);
    this.bookContainer.add(bookBg);

    // Dây chỉ đỏ may gáy chạy dọc giữa
    const spine = this.scene.add.rectangle(0, 0, 10, this.modalHeight - 40, DongHoHex.doSon, 0.8);
    spine.setStrokeStyle(1.5, DongHoHex.thanDen);
    this.bookContainer.add(spine);

    // Header tiêu đề
    const headerBg = this.scene.add.rectangle(0, -this.modalHeight / 2 + 45, this.modalWidth - 40, 56, DongHoHex.doSon);
    headerBg.setStrokeStyle(2, DongHoHex.vangHoaHoe);

    const titleText = this.scene.add.text(0, -this.modalHeight / 2 + 45, '📜 SỔ ĐINH & BẢNG VÀNG THÀNH TÍCH 📜', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '18px',
      color: DongHoColors.trangXac,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Nút đóng góc phải '✖'
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

    this.bookContainer.add([headerBg, titleText, closeBtn]);

    // Trang trên: Nhiệm vụ ngày
    this.leftPageContainer = this.scene.add.container(0, -150);
    this.bookContainer.add(this.leftPageContainer);

    // Trang dưới: Bảng vàng Phú Ông
    this.rightPageContainer = this.scene.add.container(0, 175);
    this.bookContainer.add(this.rightPageContainer);

    // Nút đóng dưới đáy
    const footerBtn = this.scene.add.container(0, this.modalHeight / 2 - 38);
    const footerBg = this.scene.add.rectangle(0, 0, 220, 42, DongHoHex.doSon);
    footerBg.setStrokeStyle(2, DongHoHex.thanDen);
    footerBg.setInteractive({ useHandCursor: true });
    const footerText = this.scene.add.text(0, 0, 'GẤP SỔ ĐINH', {
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
    this.bookContainer.add(footerBtn);

    this.add(this.bookContainer);
  }

  public refreshContent() {
    // 1. Render Trang trên: Nhiệm vụ ngày
    this.leftPageContainer.removeAll(true);
    const titleLeft = this.scene.add.text(-300, -135, '1. CÔNG ĐỨC THƯỜNG NHẬT (NHIỆM VỤ NGÀY)', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '14px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    });
    this.leftPageContainer.add(titleLeft);

    const startY = -90;
    const itemH = 80;

    this.dailyQuests.forEach((quest, idx) => {
      const cardY = startY + idx * itemH;
      const card = this.scene.add.container(0, cardY);

      const cardBg = this.scene.add.rectangle(0, 0, this.modalWidth - 60, 68, DongHoHex.giayDiepDark, 0.85);
      cardBg.setStrokeStyle(1.5, DongHoHex.thanDen);

      const iconT = this.scene.add.text(-270, 0, quest.icon, { fontSize: '26px' }).setOrigin(0.5);

      const nameT = this.scene.add.text(-235, -16, quest.name, {
        fontFamily: "'Playfair Display', serif",
        fontSize: '14px',
        color: DongHoColors.thanDen,
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      const descT = this.scene.add.text(-235, 4, quest.desc, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '11px',
        color: DongHoColors.thanDenSoft
      }).setOrigin(0, 0.5);

      const progT = this.scene.add.text(-235, 20, `Tiến độ: ${quest.current}/${quest.target}  (+${quest.rewardGold} 🪙  +${quest.rewardFame} EXP)`, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '10px',
        color: DongHoColors.doSonDark,
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      // Nút nhận thưởng
      const canClaim = quest.current >= quest.target && !quest.claimed;
      const claimBtn = this.scene.add.container(230, 0);

      const btnBg = this.scene.add.rectangle(0, 0, 95, 36, quest.claimed ? DongHoHex.thanDenSoft : (canClaim ? DongHoHex.doSon : DongHoHex.thanDen));
      btnBg.setStrokeStyle(1.5, canClaim ? DongHoHex.vangHoaHoe : DongHoHex.thanDen);
      btnBg.setInteractive({ useHandCursor: canClaim });

      const label = quest.claimed ? 'ĐÃ NHẬN' : (canClaim ? 'NHẬN' : 'CHƯA ĐẠT');
      const btnT = this.scene.add.text(0, 0, label, {
        fontFamily: "'Playfair Display', serif",
        fontSize: '11px',
        color: canClaim ? DongHoColors.trangXac : DongHoColors.thanDenSoft,
        fontStyle: 'bold'
      }).setOrigin(0.5);
      claimBtn.add([btnBg, btnT]);

      if (canClaim) {
        btnBg.on('pointerdown', () => {
          sound.playCoinChime();
          quest.claimed = true;
          this.saveState();

          if (this.onRewardClaimed) {
            this.onRewardClaimed({ gold: quest.rewardGold, fame: quest.rewardFame, paper: quest.rewardPaper || 0 });
          }
          this.scene.events.emit('SHOW_TOAST', `🏅 Đã hoàn thành ${quest.name}, nhận +${quest.rewardGold} Vàng!`);
          this.refreshContent();
        });
      }

      card.add([cardBg, iconT, nameT, descT, progT, claimBtn]);
      this.leftPageContainer.add(card);
    });

    // 2. Render Trang dưới: Bảng vàng Phú Ông
    this.rightPageContainer.removeAll(true);
    const titleRight = this.scene.add.text(-300, -140, '2. BẢNG VÀNG PHÚ ÔNG (CỘT MỐC TIẾN TRÌNH)', {
      fontFamily: "'Playfair Display', serif",
      fontSize: '14px',
      color: DongHoColors.thanDen,
      fontStyle: 'bold'
    });
    this.rightPageContainer.add(titleRight);

    const profile = this.getProfile();
    const userFame = profile?.fame_exp || 0;
    const userLevel = Math.floor(userFame / 100) + 1;

    const startY2 = -95;
    const itemH2 = 64;

    this.milestones.forEach((m, idx) => {
      const cardY = startY2 + idx * itemH2;
      const card = this.scene.add.container(0, cardY);
      const isReached = userLevel >= m.level;

      const cardBg = this.scene.add.rectangle(0, 0, this.modalWidth - 60, 54, isReached ? DongHoHex.giayDiepDark : DongHoHex.thanDenSoft, 0.9);
      cardBg.setStrokeStyle(1.5, isReached ? DongHoHex.doSon : DongHoHex.thanDen);

      const iconT = this.scene.add.text(-270, 0, m.icon, { fontSize: '24px' }).setOrigin(0.5);

      const nameT = this.scene.add.text(-235, -10, `${m.title} (Cấp ${m.level})`, {
        fontFamily: "'Playfair Display', serif",
        fontSize: '14px',
        color: isReached ? DongHoColors.thanDen : DongHoColors.vangHoaHoe,
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      const descT = this.scene.add.text(-235, 10, `${m.desc} • Thưởng: +${m.rewardPaper} 📜 Giấy Điệp`, {
        fontFamily: "'Noto Serif', serif",
        fontSize: '11px',
        color: isReached ? DongHoColors.doSonDark : DongHoColors.trangXac
      }).setOrigin(0, 0.5);

      // Con dấu son đỏ hoặc nút nhận
      const stampContainer = this.scene.add.container(230, 0);

      if (m.claimed) {
        // Con dấu son đỏ tròn
        const stampBg = this.scene.add.rectangle(0, 0, 88, 28, DongHoHex.doSon);
        stampBg.setStrokeStyle(1.5, DongHoHex.vangHoaHoe);
        const stampT = this.scene.add.text(0, 0, 'ĐÃ NHẬN', {
          fontFamily: "'Playfair Display', serif",
          fontSize: '10px',
          color: DongHoColors.trangXac,
          fontStyle: 'bold'
        }).setOrigin(0.5);
        stampContainer.add([stampBg, stampT]);
      } else if (isReached) {
        // Nút nhận Giấy Điệp
        const claimBg = this.scene.add.rectangle(0, 0, 95, 32, DongHoHex.vangHoaHoe);
        claimBg.setStrokeStyle(1.5, DongHoHex.thanDen);
        claimBg.setInteractive({ useHandCursor: true });
        const claimT = this.scene.add.text(0, 0, 'LĨNH THƯỞNG', {
          fontFamily: "'Playfair Display', serif",
          fontSize: '10px',
          color: DongHoColors.thanDen,
          fontStyle: 'bold'
        }).setOrigin(0.5);
        stampContainer.add([claimBg, claimT]);

        claimBg.on('pointerdown', () => {
          sound.playCoinChime();
          m.claimed = true;
          this.saveState();

          if (this.onRewardClaimed) {
            this.onRewardClaimed({ gold: 0, fame: 0, paper: m.rewardPaper });
          }
          this.scene.events.emit('SHOW_TOAST', `📜 Đạt tước hiệu ${m.title}! Nhận +${m.rewardPaper} Giấy Điệp.`);
          this.refreshContent();
        });
      } else {
        const lockT = this.scene.add.text(0, 0, `CHƯA ĐẠT`, {
          fontFamily: "'Noto Serif', serif",
          fontSize: '11px',
          color: DongHoColors.thanDenSoft,
          fontStyle: 'italic'
        }).setOrigin(0.5);
        stampContainer.add(lockT);
      }

      card.add([cardBg, iconT, nameT, descT, stampContainer]);
      this.rightPageContainer.add(card);
    });
  }

  public open() {
    this.isOpen = true;
    this.setVisible(true);
    this.refreshContent();

    this.dimmer.setAlpha(0);
    this.bookContainer.setScale(0.92);

    this.scene.tweens.add({
      targets: this.dimmer,
      alpha: 0.65,
      duration: 220,
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
