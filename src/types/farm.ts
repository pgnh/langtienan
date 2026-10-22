import { SlotStatus } from './database';

/**
 * Danh mục các loại cây trồng, thủy sản và sản phẩm thủ công
 */
export enum CropType {
  // Tầng 1: Ao Bèo & Bến Nước
  BEO_HOA_DAU = 'beo_hoa_dau',
  CA_CHEP = 'ca_chep',
  OC_MIT = 'oc_mit',

  // Tầng 2: Vườn Chuối Bãi Bồi
  CHUOI_NGU = 'chuoi_ngu',
  NGO_NEP = 'ngo_nep',

  // Tầng 3: Lò Gạch Cũ
  GACH_NUNG = 'gach_nung',
  GACH_BAT_TRANG = 'gach_bat_trang',

  // Tầng 4: Xưởng Giấy Dó
  GIAY_DO = 'giay_do',
  GIAY_DIEP = 'giay_diep'
}

/**
 * Các giai đoạn sinh trưởng của cây trồng / sản phẩm
 */
export enum CropStage {
  EMPTY = 'EMPTY',
  SEEDED = 'SEEDED',       // Mới gieo / mới nhóm lửa / thả giống
  SPROUT = 'SPROUT',       // Đang lớn / đếm ngược
  RIPE = 'RIPE'            // Đã chín / hoàn thành nung
}

/**
 * Trạng thái ô canh tác
 */
export type FarmSlotState = SlotStatus;

/**
 * Phân loại hiệu ứng bổ trợ từ Mộc Bản Đông Hồ
 */
export enum WoodcutBuffType {
  SPEED_BOOST = 'SPEED_BOOST',           // Giảm thời gian sinh trưởng (-15%)
  YIELD_BOOST = 'YIELD_BOOST',           // Tăng tỷ lệ sản lượng / vàng (+20%)
  COST_REDUCTION = 'COST_REDUCTION',     // Giảm chi phí gieo nung (-20%)
  LUCK_BONUS = 'LUCK_BONUS'              // Tăng cơ hội rơi nguyên liệu quý / giấy điệp (+10%)
}

/**
 * Công thức chế tác mộc bản tại Bàn Khắc Gỗ
 */
export interface WoodcutRecipe {
  id: string;
  name: string;
  description: string;
  targetFloorId: number;                 // Tầng ấn định buff (1..5 hoặc 0: toàn làng)
  buffType: WoodcutBuffType;
  buffValuePercent: number;              // Giá trị % buff (vd: 15, 20)
  passiveBuffDesc: string;
  costGold: number;
  costMaterials: {
    itemCode: string;
    quantity: number;
  }[];
  unlocked: boolean;
  assignedFloor?: number | null;         // Tầng hiện tại đang được ấn dấu triện
}

/**
 * Vật phẩm trong kho đồ cá nhân
 */
export interface InventoryItem {
  id?: string;
  itemCode: string;
  name: string;
  quantity: number;
  category: 'CROP' | 'PRODUCT' | 'MATERIAL' | 'WOODCUT';
  icon?: string;
}

export interface CropCostSecondary {
  item: string;
  amount: number;
}

export interface CropAssetKeys {
  sprout?: string;
  mature?: string;
  ready?: string;
}

export interface CropDefinition {
  id: string;
  name: string;
  floorId: number;
  tierId: number;                  // Alias for floorId
  tierName: string;
  growDurationSec: number;
  growthTime: number;              // Thời gian sinh trưởng (giây)
  costGold: number;
  cost: number;                    // Chi phí gieo/nung (Vàng Nén)
  costSecondary?: CropCostSecondary;
  yieldQty: number;
  yieldUnit: string;
  sellPriceGold: number;
  rewardGold: number;              // Giá trị/vàng thu được
  rewardFame: number;
  rewardExp: number;               // Điểm kinh nghiệm / Danh vọng
  rewardPaper?: number;
  roiPercent: number;
  description: string;
  icon: string;
  colorHex: number;
  assetKeys?: CropAssetKeys;       // Asset keys (mầm, trưởng thành, chín / lửa đỏ)
}

export interface TierDefinition {
  id: number;
  name: string;
  alias: string;
  yStart: number;
  yEnd: number;
  unlockLevel: number;
  unlockGold: number;
  unlockReqDesc: string;
  description: string;
  bgColor: number;
  accentColor: number;
  character: string;
}

export interface SlotState {
  id: string;
  floorId: number;
  slotIndex: number;
  itemType: string | null;
  plantedAt: number | null; // ms timestamp
  harvestAt: number | null; // ms timestamp
  status: SlotStatus;
  x: number;
  y: number;
}

export interface WoodblockBuff {
  id: string;
  name: string;
  targetFloorId: number;
  description: string;
  passiveBuff: string;
  icon: string;
  unlocked: boolean;
}
