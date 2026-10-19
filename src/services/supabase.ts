import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Profile, FarmSlotRow, PlantCropResult, HarvestCropResult } from '../types/database';
import { CROPS_DATA } from '../constants/crops';
import { TIERS_DATA } from '../constants/tiers';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Kiểm tra xem Supabase đã được cấu hình thật hay chưa
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// =========================================================================
// MÔ PHỎNG MÁY CHỦ CỤC BỘ (LOCAL SERVER-AUTHORITATIVE SIMULATOR)
// Đảm bảo game chạy mượt 100% khi chưa cấu hình Supabase Key
// =========================================================================

const STORAGE_KEY = 'langtienan_save_v1';

interface LocalGameState {
  profile: Profile;
  slots: FarmSlotRow[];
}

function getInitialState(): LocalGameState {
  const defaultProfile: Profile = {
    id: 'local-dev-user-001',
    username: 'Dân Làng Tiền An',
    gold_coins: 150,     // Khởi điểm 150 Vàng Nén
    fame_exp: 0,         // Cấp 1
    paper_currency: 10,  // 10 Giấy Điệp
    unlocked_floors: 1   // Mặc định mở Tầng 1: Ao Bèo
  };

  const defaultSlots: FarmSlotRow[] = [];
  // Khởi tạo 4 ô cho mỗi tầng (5 tầng = 20 ô)
  for (let f = 1; f <= 5; f++) {
    for (let s = 0; s < 4; s++) {
      defaultSlots.push({
        id: `slot-f${f}-s${s}`,
        user_id: defaultProfile.id,
        floor_id: f,
        slot_index: s,
        item_type: null,
        planted_at: null,
        harvest_at: null,
        status: 'EMPTY'
      });
    }
  }

  // Tải từ LocalStorage nếu có
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.profile && Array.isArray(parsed.slots)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc LocalStorage:', e);
  }

  return { profile: defaultProfile, slots: defaultSlots };
}

let localState: LocalGameState = getInitialState();
const listeners: Array<() => void> = [];

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localState));
    listeners.forEach((fn) => fn());
  } catch (e) {
    console.error('Không thể lưu state:', e);
  }
}

// =========================================================================
// CÁC HÀM TƯƠNG TÁC SERVER-AUTHORITATIVE DÀNH CHO PHASER SCENES
// =========================================================================

export const GameService = {
  isLiveServer(): boolean {
    return isSupabaseConfigured;
  },

  subscribe(callback: () => void): () => void {
    listeners.push(callback);
    return () => {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  },

  async getProfile(): Promise<Profile> {
    if (supabase) {
      const { data, error } = await supabase.from('profiles').select('*').single();
      if (!error && data) return data as Profile;
    }
    return { ...localState.profile };
  },

  async getFarmSlots(): Promise<FarmSlotRow[]> {
    if (supabase) {
      const { data, error } = await supabase.from('farm_slots').select('*').order('floor_id').order('slot_index');
      if (!error && data) return data as FarmSlotRow[];
    }

    // Tự động kiểm tra thời gian chín đối với các ô đang GROWING
    const now = Date.now();
    let changed = false;
    localState.slots.forEach((slot) => {
      if (slot.status === 'GROWING' && slot.harvest_at) {
        const harvestTime = new Date(slot.harvest_at).getTime();
        if (now >= harvestTime) {
          slot.status = 'READY';
          changed = true;
        }
      }
    });
    if (changed) saveState();

    return [...localState.slots];
  },

  /**
   * RPC: Gieo trồng hạt giống / thả cá / khởi động lò nung
   * Thực thi Server-Authoritative: trừ tiền và gán thời gian thu hoạch chuẩn máy chủ
   */
  async plantCrop(slotId: string, itemType: string): Promise<PlantCropResult> {
    const crop = CROPS_DATA[itemType];
    if (!crop) {
      throw new Error(`Cây trồng hoặc sản phẩm '${itemType}' không tồn tại!`);
    }

    if (supabase) {
      const { data, error } = await supabase.rpc('plant_crop', {
        target_slot_id: slotId,
        p_item_type: itemType
      });
      if (error) throw new Error(error.message);
      return data as PlantCropResult;
    }

    // Logic giả lập Server-Authoritative trong Memory
    const slot = localState.slots.find((s) => s.id === slotId);
    if (!slot) throw new Error('Không tìm thấy ô đất!');
    if (slot.status !== 'EMPTY') throw new Error('Ô đất này đang canh tác!');
    if (localState.profile.gold_coins < crop.costGold) {
      throw new Error(`Không đủ Vàng Nén! Cần ${crop.costGold} Vàng.`);
    }

    // Khấu trừ tài nguyên
    localState.profile.gold_coins -= crop.costGold;

    // Tính thời gian thu hoạch theo Server Time
    const now = Date.now();
    const harvestAtMs = now + crop.growDurationSec * 1000;
    const harvestAtIso = new Date(harvestAtMs).toISOString();

    slot.item_type = itemType;
    slot.planted_at = new Date(now).toISOString();
    slot.harvest_at = harvestAtIso;
    slot.status = 'GROWING';

    saveState();

    return {
      success: true,
      slot_id: slotId,
      item_type: itemType,
      harvest_at: harvestAtIso,
      cost_gold: crop.costGold,
      remaining_gold: localState.profile.gold_coins
    };
  },

  /**
   * RPC: Thu hoạch nông sản / gạch nung / giấy điệp
   * Chống tua giờ: Kiểm tra NOW >= harvest_at
   */
  async harvestCrop(slotId: string): Promise<HarvestCropResult> {
    if (supabase) {
      const { data, error } = await supabase.rpc('harvest_crop', {
        target_slot_id: slotId
      });
      if (error) throw new Error(error.message);
      return data as HarvestCropResult;
    }

    // Logic giả lập Server-Authoritative trong Memory
    const slot = localState.slots.find((s) => s.id === slotId);
    if (!slot) throw new Error('Không tìm thấy ô canh tác!');
    if (!slot.item_type || slot.status === 'EMPTY') {
      throw new Error('Ô đất này đang rỗng, không có gì để thu hoạch!');
    }

    const crop = CROPS_DATA[slot.item_type];
    if (!crop) throw new Error('Dữ liệu sản phẩm không xác định!');

    const now = Date.now();
    const harvestAtMs = slot.harvest_at ? new Date(slot.harvest_at).getTime() : 0;

    if (now < harvestAtMs) {
      throw new Error('Sản phẩm chưa chín tới! Vui lòng kiên nhẫn chờ thêm.');
    }

    // Tính phần thưởng
    const rewardGold = crop.sellPriceGold;
    const rewardFame = crop.rewardFame;
    const rewardPaper = crop.rewardPaper || 0;

    localState.profile.gold_coins += rewardGold;
    localState.profile.fame_exp += rewardFame;
    localState.profile.paper_currency += rewardPaper;

    // Reset ô đất
    const harvestedItem = slot.item_type;
    slot.item_type = null;
    slot.planted_at = null;
    slot.harvest_at = null;
    slot.status = 'EMPTY';

    saveState();

    return {
      success: true,
      reward_gold: rewardGold,
      reward_fame: rewardFame,
      reward_paper: rewardPaper,
      item_type: harvestedItem,
      current_gold: localState.profile.gold_coins,
      current_fame: localState.profile.fame_exp,
      current_paper: localState.profile.paper_currency
    };
  },

  /**
   * Mở khóa tầng canh tác mới (T2 -> T5)
   */
  async unlockFloor(floorId: number): Promise<{ success: boolean; message: string }> {
    const tier = TIERS_DATA[floorId];
    if (!tier) throw new Error('Tầng không hợp lệ!');

    if (localState.profile.unlocked_floors >= floorId) {
      return { success: true, message: 'Tầng này đã được khai mở trước đó!' };
    }

    if (localState.profile.unlocked_floors !== floorId - 1) {
      throw new Error(`Bạn cần mở khóa Tầng ${floorId - 1} trước!`);
    }

    if (localState.profile.gold_coins < tier.unlockGold) {
      throw new Error(`Không đủ Vàng Nén! Cần ${tier.unlockGold.toLocaleString()} Vàng.`);
    }

    // Trừ vàng và mở tầng
    localState.profile.gold_coins -= tier.unlockGold;
    localState.profile.unlocked_floors = floorId;
    saveState();

    return {
      success: true,
      message: `Chúc mừng bạn đã khai mở thành công ${tier.name}!`
    };
  },

  /**
   * Đặt lại dữ liệu thử nghiệm
   */
  resetTestData(): void {
    localStorage.removeItem(STORAGE_KEY);
    localState = getInitialState();
    saveState();
  }
};
