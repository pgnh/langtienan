export type SlotStatus = 'EMPTY' | 'GROWING' | 'READY';

/**
 * Các cấp bậc tước hiệu Phú Ông tương ứng với điểm Fame EXP
 */
export enum PhuOngRank {
  BAN_NONG = 'Bần Nông',               // Cấp 1 - 2
  TRUNG_NONG = 'Trung Nông',           // Cấp 3 - 7
  THO_THU_CONG = 'Thợ Thủ Công',       // Cấp 8 - 14
  NGHE_NHAN = 'Nghệ Nhân Làng',       // Cấp 15 - 24
  PHU_ONG = 'Phú Ông Tri Huyện'        // Cấp 25+
}

/**
 * Hồ sơ người chơi lưu trữ tại public.profiles
 */
export interface Profile {
  id: string;
  username: string;
  gold_coins: number;         // Vàng Nén (tiền tệ cơ bản)
  fame_exp: number;           // Điểm Danh Vọng tích lũy để thăng cấp Phú Ông
  paper_currency: number;     // Giấy Điệp (tiền tệ quý hiếm / gem)
  unlocked_floors: number;    // Số tầng đã mở khóa (1..5)
  created_at?: string;
  last_login?: string;
}

/**
 * Chi tiết ô canh tác phân tầng lưu trữ tại public.farm_slots
 */
export interface FarmSlotRow {
  id: string;
  user_id: string;
  floor_id: number;           // 1: Ao Bèo, 2: Vườn Chuối, 3: Lò Gạch, 4: Xưởng Giấy, 5: Sân Đình
  slot_index: number;         // 0..3 (4 ô trên mỗi tầng)
  item_type: string | null;   // Mã sản phẩm (beo_hoa_dau, chuoi_ngu, gach_nung, ...)
  planted_at: string | null;  // ISO timestamp từ server khi gieo/nung
  harvest_at: string | null;  // ISO timestamp server tính toán thời điểm thu hoạch
  status: SlotStatus;         // EMPTY | GROWING | READY
}

/**
 * Kho đồ người chơi lưu trữ tại public.user_inventory
 */
export interface UserInventoryRow {
  id: string;
  user_id: string;
  item_code: string;
  quantity: number;
  updated_at: string;
}

/**
 * Trạng thái mộc bản người chơi sở hữu và ấn định tại public.user_woodcuts
 */
export interface UserWoodcutRow {
  id: string;
  user_id: string;
  woodcut_id: string;
  assigned_floor: number | null; // Tầng được gắn mộc bản
  created_at: string;
}

export interface PlantCropResult {
  success: boolean;
  slot_id: string;
  item_type: string;
  harvest_at: string;
  cost_gold: number;
  remaining_gold: number;
  message?: string;
}

export interface HarvestCropResult {
  success: boolean;
  reward_gold: number;
  reward_fame: number;
  reward_paper?: number;
  item_type: string;
  current_gold: number;
  current_fame: number;
  current_paper: number;
  message?: string;
}
