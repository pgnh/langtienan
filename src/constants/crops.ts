import { CropDefinition } from '../types/farm';
import { DongHoHex } from '../config/theme';

export const CROPS_DATA: Record<string, CropDefinition> = {
  // Tầng 1: Ao Bèo & Bến Nước
  beo_hoa_dau: {
    id: 'beo_hoa_dau',
    name: 'Bèo Hoa Dâu',
    floorId: 1,
    tierName: 'Ao Bèo',
    growDurationSec: 60, // 1 phút
    costGold: 5,
    yieldQty: 1,
    yieldUnit: 'Bụi',
    sellPriceGold: 8,
    rewardFame: 2,
    roiPercent: 60,
    description: 'Bèo dâu nước ngọt, cánh mỏng xanh mướt tạo phân bón xanh.',
    icon: '🌿',
    colorHex: DongHoHex.xanhReu
  },
  ca_chep: {
    id: 'ca_chep',
    name: 'Cá Chép Vàng',
    floorId: 1,
    tierName: 'Ao Bèo',
    growDurationSec: 900, // 15 phút
    costGold: 50,
    yieldQty: 1,
    yieldUnit: 'Con',
    sellPriceGold: 110,
    rewardFame: 25,
    roiPercent: 120,
    description: 'Cá chép sông Hồng quẫy đuôi ánh vàng, biểu tượng Lý Ngư Vọng Nguyệt.',
    icon: '🐟',
    colorHex: DongHoHex.vangHoaHoe
  },
  oc_mit: {
    id: 'oc_mit',
    name: 'Ốc Mít Rãnh Nước',
    floorId: 1,
    tierName: 'Ao Bèo',
    growDurationSec: 2700, // 45 phút
    costGold: 120,
    yieldQty: 3,
    yieldUnit: 'Con',
    sellPriceGold: 320,
    rewardFame: 60,
    roiPercent: 166,
    description: 'Ốc béo múp ngâm nước vo gạo, món khoái khẩu của làng quê.',
    icon: '🐚',
    colorHex: DongHoHex.xanhCham
  },

  // Tầng 2: Vườn Chuối Bãi Bồi
  chuoi_ngu: {
    id: 'chuoi_ngu',
    name: 'Chuối Ngự Nam Sang',
    floorId: 2,
    tierName: 'Vườn Chuối',
    growDurationSec: 300, // 5 phút
    costGold: 20,
    yieldQty: 2,
    yieldUnit: 'Nải',
    sellPriceGold: 45,
    rewardFame: 10,
    roiPercent: 125,
    description: 'Chuối tiến vua nức tiếng Đại Hoàng thơm ngát dịu dàng.',
    icon: '🍌',
    colorHex: DongHoHex.vangHoaHoe
  },
  ngo_nep: {
    id: 'ngo_nep',
    name: 'Ngô Nếp Bãi Bồi',
    floorId: 2,
    tierName: 'Vườn Chuối',
    growDurationSec: 1800, // 30 phút
    costGold: 80,
    yieldQty: 3,
    yieldUnit: 'Bắp',
    sellPriceGold: 210,
    rewardFame: 45,
    roiPercent: 162,
    description: 'Hạt ngô căng sữa từ đất phù sa sông Đáy nướng thơm lừng.',
    icon: '🌽',
    colorHex: DongHoHex.vangHoaHoeDark
  },

  // Tầng 3: Lò Gạch Cũ
  gach_nung: {
    id: 'gach_nung',
    name: 'Gạch Nung Đất Sét',
    floorId: 3,
    tierName: 'Lò Gạch Cũ',
    growDurationSec: 1200, // 20 phút
    costGold: 60,
    costSecondary: { item: 'Củi Lửa', amount: 1 },
    yieldQty: 10,
    yieldUnit: 'Viên',
    sellPriceGold: 180,
    rewardFame: 35,
    roiPercent: 200,
    description: 'Gạch mộc nung than củi đỏ rực từ tay bác Chí Phèo cần cù.',
    icon: '🧱',
    colorHex: DongHoHex.doSon
  },
  gach_bat_trang: {
    id: 'gach_bat_trang',
    name: 'Gạch Bát Tràng Men Tro',
    floorId: 3,
    tierName: 'Lò Gạch Cũ',
    growDurationSec: 7200, // 2 giờ
    costGold: 250,
    costSecondary: { item: 'Củi Lửa', amount: 3 },
    yieldQty: 8,
    yieldUnit: 'Viên',
    sellPriceGold: 850,
    rewardFame: 150,
    roiPercent: 240,
    description: 'Gạch lát sân đình tráng men tro trứ danh trường tồn ngàn năm.',
    icon: '🏛️',
    colorHex: DongHoHex.datSet
  },

  // Tầng 4: Xưởng Giấy & Khắc Bản
  giay_do: {
    id: 'giay_do',
    name: 'Giấy Dó Thô',
    floorId: 4,
    tierName: 'Xưởng Giấy',
    growDurationSec: 3600, // 1 giờ
    costGold: 150,
    costSecondary: { item: 'Vỏ Cây Dó', amount: 2 },
    yieldQty: 5,
    yieldUnit: 'Xấp',
    sellPriceGold: 480,
    rewardFame: 90,
    roiPercent: 220,
    description: 'Vỏ dó giã nhuyễn ngâm bể lắng, phên phơi khô đón gió.',
    icon: '📜',
    colorHex: DongHoHex.giayDiepDark
  },
  giay_diep: {
    id: 'giay_diep',
    name: 'Giấy Điệp Ánh Bạc',
    floorId: 4,
    tierName: 'Xưởng Giấy',
    growDurationSec: 14400, // 4 giờ
    costGold: 350,
    costSecondary: { item: 'Bột Điệp', amount: 2 },
    yieldQty: 3,
    yieldUnit: 'Tờ',
    sellPriceGold: 0,
    rewardFame: 300,
    rewardPaper: 15,
    roiPercent: 300,
    description: 'Quét hồ nếp trộn bột vỏ điệp lóng lánh xà cừ quý giá.',
    icon: '✨',
    colorHex: DongHoHex.trangXac
  }
};

export const CROPS_LIST = Object.values(CROPS_DATA);
