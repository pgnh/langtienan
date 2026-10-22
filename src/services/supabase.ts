import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Profile, FarmSlotRow, PlantCropResult, HarvestCropResult } from '../types/database';
import { CROPS_DATA } from '../constants/crops';
import { TIERS_DATA } from '../constants/tiers';
import { WoodcutService } from './woodcutService';

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
  inventory: Record<string, number>;
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

  // Khởi tạo kho nông sản mặc định cho người chơi
  const defaultInventory: Record<string, number> = {
    beo_hoa_dau: 6,
    chuoi_ngu: 4,
    ca_chep: 1
  };

  // Tải từ LocalStorage nếu có
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.profile && Array.isArray(parsed.slots)) {
        return {
          profile: parsed.profile,
          slots: parsed.slots,
          inventory: parsed.inventory || defaultInventory
        };
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc LocalStorage:', e);
  }

  return { profile: defaultProfile, slots: defaultSlots, inventory: defaultInventory };
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

    // Tính thời gian thu hoạch theo Server Time kèm Passive Buff mộc bản (nếu có)
    const speedMult = WoodcutService.getFloorSpeedMultiplier(slot.floor_id);
    const effectiveDurationSec = Math.max(Math.round(crop.growDurationSec * speedMult), 5);

    const now = Date.now();
    const harvestAtMs = now + effectiveDurationSec * 1000;
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

    // Tính phần thưởng kèm Passive Buff mộc bản tăng sản lượng/giá bán
    const yieldMult = WoodcutService.getFloorYieldMultiplier(slot.floor_id);
    const rewardGold = Math.round(crop.sellPriceGold * yieldMult);
    const rewardFame = crop.rewardFame;
    const rewardPaper = crop.rewardPaper || 0;

    localState.profile.gold_coins += rewardGold;
    localState.profile.fame_exp += rewardFame;
    localState.profile.paper_currency += rewardPaper;

    // Cập nhật kho nông sản
    const harvestedItem = slot.item_type;
    const yieldQty = crop.yieldQty || 1;
    localState.inventory[harvestedItem] = (localState.inventory[harvestedItem] || 0) + yieldQty;

    // Reset ô đất
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
   * Lấy kho nông sản thu hoạch
   */
  async getInventory(): Promise<Record<string, number>> {
    return { ...localState.inventory };
  },

  /**
   * Bán nông sản trong kho đồ lấy Vàng Nén
   */
  async sellCrop(cropId: string, quantity: number = 1): Promise<{ success: boolean; earnedGold: number; remainingQty: number; currentGold: number }> {
    const crop = CROPS_DATA[cropId];
    if (!crop) throw new Error('Sản phẩm không hợp lệ!');

    const currentQty = localState.inventory[cropId] || 0;
    if (currentQty < quantity) {
      throw new Error(`Kho không đủ hàng! Hiện có ${currentQty} ${crop.yieldUnit}.`);
    }

    const earnedGold = crop.sellPriceGold * quantity;
    localState.inventory[cropId] = currentQty - quantity;
    localState.profile.gold_coins += earnedGold;

    saveState();

    return {
      success: true,
      earnedGold,
      remainingQty: localState.inventory[cropId],
      currentGold: localState.profile.gold_coins
    };
  },

  /**
   * Hoàn thành đơn thu mua của dân làng (Thị Nở, Chí Phèo, Bá Kiến)
   */
  async fulfillOrder(orderId: string, costItems: { cropId: string; quantity: number }[], rewardGold: number, rewardFame: number): Promise<{ success: boolean; message: string }> {
    for (const item of costItems) {
      const stock = localState.inventory[item.cropId] || 0;
      if (stock < item.quantity) {
        const c = CROPS_DATA[item.cropId];
        throw new Error(`Thiếu ${c ? c.name : item.cropId}! Cần ${item.quantity}.`);
      }
    }

    for (const item of costItems) {
      localState.inventory[item.cropId] -= item.quantity;
    }

    localState.profile.gold_coins += rewardGold;
    localState.profile.fame_exp += rewardFame;

    saveState();

    return {
      success: true,
      message: 'Giao hàng thành công, nhận trọn vẹn tiền thưởng!'
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
