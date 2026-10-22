import { TierDefinition, WoodblockBuff } from '../types/farm';
import { DongHoHex } from '../config/theme';

export const WORLD_WIDTH = 720;
export const WORLD_HEIGHT = 2200;
export const VIEWPORT_WIDTH = 720;
export const VIEWPORT_HEIGHT = 1280;

export const TIERS_DATA: Record<number, TierDefinition> = {
  1: {
    id: 1,
    name: 'Tầng 1: Ao Bèo & Bến Nước',
    alias: 'Ao Bèo',
    yStart: 1800,
    yEnd: 2200,
    unlockLevel: 1,
    unlockGold: 0,
    unlockReqDesc: 'Mặc định mở khóa khi bắt đầu',
    description: 'Không gian mênh mang sóng nước, bè tre neo đậu, đàn cá chép quẫy đuôi.',
    bgColor: DongHoHex.xanhChamDark,
    accentColor: DongHoHex.xanhCham,
    character: 'Lão Ngư Phủ'
  },
  2: {
    id: 2,
    name: 'Tầng 2: Vườn Chuối Bãi Bồi',
    alias: 'Vườn Chuối',
    yStart: 1200,
    yEnd: 1800,
    unlockLevel: 3,
    unlockGold: 500,
    unlockReqDesc: 'Cấp Danh Vọng 3 + 500 Vàng Nén',
    description: 'Phù sa sông Đáy màu mỡ, những bụi chuối ngự trổ buồng xanh tốt đan xen ruộng ngô.',
    bgColor: DongHoHex.xanhReu,
    accentColor: DongHoHex.giayDiep,
    character: 'Thị Nở Nấu Cháo'
  },
  3: {
    id: 3,
    name: 'Tầng 3: Lò Gạch Cũ',
    alias: 'Lò Gạch',
    yStart: 600,
    yEnd: 1200,
    unlockLevel: 8,
    unlockGold: 3000,
    unlockReqDesc: 'Cấp Danh Vọng 8 + 3.000 Vàng Nén',
    description: 'Vách đất nung đỏ, vòm lò nghi ngút khói cùng bãi tập kết gạch mộc và than củi.',
    bgColor: DongHoHex.doSonDark,
    accentColor: DongHoHex.datSet,
    character: 'Bác Chí Phèo'
  },
  4: {
    id: 4,
    name: 'Tầng 4: Xưởng Giấy & Khắc Bản',
    alias: 'Xưởng Giấy',
    yStart: 350,
    yEnd: 600,
    unlockLevel: 15,
    unlockGold: 12000,
    unlockReqDesc: 'Cấp Danh Vọng 15 + 12.000 Vàng + 50 Gạch Bát Tràng',
    description: 'Căn nhà tranh vách nứa phơi những phên giấy điệp lấp lánh xà cừ dưới ánh nắng ban mai.',
    bgColor: DongHoHex.giayDiepDark,
    accentColor: DongHoHex.trangXac,
    character: 'Thầy Đồ Cóc'
  },
  5: {
    id: 5,
    name: 'Tầng 5: Sân Đình Cổ Kính',
    alias: 'Sân Đình',
    yStart: 0,
    yEnd: 350,
    unlockLevel: 25,
    unlockGold: 50000,
    unlockReqDesc: 'Cấp Danh Vọng 25 + 50.000 Vàng + 200 Giấy Điệp',
    description: 'Gốc đa đại thụ ngàn năm rủ bóng; sân đình lát gạch nghiêng, rước kiệu và đám cưới chuột tưng bừng.',
    bgColor: DongHoHex.thanDenSoft,
    accentColor: DongHoHex.doSon,
    character: 'Quan Tri Huyện Bá Kiến'
  }
};

export const TIERS_LIST = Object.values(TIERS_DATA);

export const WOODBLOCK_BUFFS: WoodblockBuff[] = [
  {
    id: 'ga_dai_cat',
    name: 'Mộc Bản Gà Đại Cát',
    targetFloorId: 2,
    description: 'Bức tranh chú gà trống uy nghi với cành hoa hồng nở rộ.',
    passiveBuff: '-15% thời gian sinh trưởng Chuối Ngự & Ngô Nếp',
    icon: '🐓',
    unlocked: true
  },
  {
    id: 'ca_chep_trong_trang',
    name: 'Mộc Bản Lý Ngư Vọng Nguyệt',
    targetFloorId: 1,
    description: 'Cá chép trông trăng biểu tượng của sự kiên trì vượt vũ môn.',
    passiveBuff: '+25% sản lượng Cá Chép Vàng & Ốc Mít',
    icon: '🌕',
    unlocked: false
  },
  {
    id: 'thay_do_coc',
    name: 'Mộc Bản Thầy Đồ Cóc',
    targetFloorId: 4,
    description: 'Chú cóc thông thái đeo kính đọc sách dạy học trò.',
    passiveBuff: '+100% điểm Danh Vọng khi hoàn thành Giấy Điệp',
    icon: '🐸',
    unlocked: false
  },
  {
    id: 'lon_am_duong',
    name: 'Mộc Bản Lợn Âm Dương',
    targetFloorId: 3,
    description: 'Chú lợn nái béo tròn mang xoáy âm dương tượng trưng sự sinh sôi.',
    passiveBuff: '+20% giá bán Gạch Nung Đất Sét & Bát Tràng',
    icon: '🐖',
    unlocked: false
  }
];
