export type SlotStatus = 'EMPTY' | 'GROWING' | 'READY';

export interface Profile {
  id: string;
  username: string;
  gold_coins: number;
  fame_exp: number;
  paper_currency: number;
  unlocked_floors: number;
  created_at?: string;
  last_login?: string;
}

export interface FarmSlotRow {
  id: string;
  user_id: string;
  floor_id: number; // 1: Ao Bèo, 2: Vườn Chuối, 3: Lò Gạch, 4: Xưởng Giấy, 5: Sân Đình
  slot_index: number; // 0..3
  item_type: string | null;
  planted_at: string | null;
  harvest_at: string | null;
  status: SlotStatus;
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
