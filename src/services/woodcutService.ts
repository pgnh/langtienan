import { WoodcutRecipe, WoodcutBuffType } from '../types/farm';

export interface CraftingMaterials {
  woodThi: number;      // Gỗ Thị (phôi khắc ván in)
  colorPigment: number; // Bát Bột Màu (chàm, son, hòe, than tre)
  diepPaper: number;    // Giấy Điệp (bản in thử xà cừ)
}

export interface UserWoodcutState {
  recipeId: string;
  unlocked: boolean;
  carvingProgress: number; // 0..100 (%)
  assignedFloor: number | null; // 1..5 hoặc null nếu chưa ấn định
}

export const WOODCUT_RECIPES: Record<string, WoodcutRecipe> = {
  lon_am_duong: {
    id: 'lon_am_duong',
    name: 'Lợn Âm Dương',
    description: 'Chú lợn nái béo tròn mang xoáy âm dương tượng trưng cho sự phồn thực, no ấm làng quê.',
    targetFloorId: 1, // Gắn Tầng 1: Ao Bèo & Bến Nước
    buffType: WoodcutBuffType.YIELD_BOOST,
    buffValuePercent: 15,
    passiveBuffDesc: '+15% cơ hội bắt cá hiếm & tăng sản lượng Ao Bèo',
    costGold: 100,
    costMaterials: [
      { itemCode: 'wood_thi', quantity: 2 },
      { itemCode: 'color_pigment', quantity: 1 }
    ],
    unlocked: false,
    assignedFloor: null
  },
  ga_dai_cat: {
    id: 'ga_dai_cat',
    name: 'Gà Đại Cát',
    description: 'Chú gà trống dũng mãnh gáy sáng đón bình minh mang lại may mắn, đại cát đại lợi.',
    targetFloorId: 2, // Gắn Tầng 2: Vườn Chuối Bãi Bồi
    buffType: WoodcutBuffType.SPEED_BOOST,
    buffValuePercent: 15,
    passiveBuffDesc: '-15% thời gian sinh trưởng Chuối Ngự & Ngô Nếp',
    costGold: 150,
    costMaterials: [
      { itemCode: 'wood_thi', quantity: 3 },
      { itemCode: 'color_pigment', quantity: 2 }
    ],
    unlocked: true, // Mặc định mở khóa đầu tiên để trải nghiệm
    assignedFloor: 2
  },
  dam_cuoi_chuot: {
    id: 'dam_cuoi_chuot',
    name: 'Đám Cưới Chuột',
    description: 'Bức tranh trào phúng kinh điển, đám cưới rộn ràng tiếng kèn thổi sáo dâng lễ vật.',
    targetFloorId: 3, // Gắn Tầng 3: Lò Gạch Cũ
    buffType: WoodcutBuffType.COST_REDUCTION,
    buffValuePercent: 20,
    passiveBuffDesc: '-20% thời gian nung và tiết kiệm than củi Lò Gạch',
    costGold: 220,
    costMaterials: [
      { itemCode: 'wood_thi', quantity: 4 },
      { itemCode: 'color_pigment', quantity: 3 }
    ],
    unlocked: false,
    assignedFloor: null
  },
  ca_chep_trong_trang: {
    id: 'ca_chep_trong_trang',
    name: 'Cá Chép Trông Trăng',
    description: 'Lý Ngư Vọng Nguyệt hướng về ánh trăng đáy nước thể hiện sự tinh anh, vượt vũ môn.',
    targetFloorId: 1,
    buffType: WoodcutBuffType.LUCK_BONUS,
    buffValuePercent: 20,
    passiveBuffDesc: '+20% giá bán cá chép và vàng thu được tại Bến Nước',
    costGold: 300,
    costMaterials: [
      { itemCode: 'wood_thi', quantity: 5 },
      { itemCode: 'color_pigment', quantity: 4 }
    ],
    unlocked: false,
    assignedFloor: null
  }
};

const WOODCUT_STORAGE_KEY = 'langtienan_woodcuts_v1';
const MATERIALS_STORAGE_KEY = 'langtienan_materials_v1';

export class WoodcutService {
  private static materials: CraftingMaterials = {
    woodThi: 8,       // Khởi điểm cấp phát 8 phôi Gỗ Thị
    colorPigment: 6,  // 6 Bát Bột Màu
    diepPaper: 10     // 10 Giấy Điệp
  };

  private static userWoodcuts: Record<string, UserWoodcutState> = {};
  private static listeners: Array<() => void> = [];

  static {
    this.loadState();
  }

  private static loadState() {
    try {
      const savedMat = localStorage.getItem(MATERIALS_STORAGE_KEY);
      if (savedMat) {
        this.materials = { ...this.materials, ...JSON.parse(savedMat) };
      }

      const savedWc = localStorage.getItem(WOODCUT_STORAGE_KEY);
      if (savedWc) {
        this.userWoodcuts = JSON.parse(savedWc);
      } else {
        // Khởi tạo trạng thái mặc định
        Object.values(WOODCUT_RECIPES).forEach((recipe) => {
          this.userWoodcuts[recipe.id] = {
            recipeId: recipe.id,
            unlocked: recipe.unlocked,
            carvingProgress: recipe.unlocked ? 100 : 0,
            assignedFloor: recipe.assignedFloor || null
          };
        });
        this.saveState();
      }
    } catch (e) {
      console.warn('Lỗi đọc dữ liệu mộc bản:', e);
    }
  }

  private static saveState() {
    try {
      localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(this.materials));
      localStorage.setItem(WOODCUT_STORAGE_KEY, JSON.stringify(this.userWoodcuts));
      this.listeners.forEach((fn) => fn());
    } catch (e) {
      console.error('Lỗi lưu dữ liệu mộc bản:', e);
    }
  }

  public static subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      const idx = this.listeners.indexOf(fn);
      if (idx !== -1) this.listeners.splice(idx, 1);
    };
  }

  public static getMaterials(): CraftingMaterials {
    return { ...this.materials };
  }

  public static addMaterials(mat: Partial<CraftingMaterials>) {
    if (mat.woodThi) this.materials.woodThi += mat.woodThi;
    if (mat.colorPigment) this.materials.colorPigment += mat.colorPigment;
    if (mat.diepPaper) this.materials.diepPaper += mat.diepPaper;
    this.saveState();
  }

  public static getWoodcutState(recipeId: string): UserWoodcutState {
    if (!this.userWoodcuts[recipeId]) {
      const recipe = WOODCUT_RECIPES[recipeId];
      this.userWoodcuts[recipeId] = {
        recipeId,
        unlocked: recipe ? recipe.unlocked : false,
        carvingProgress: recipe && recipe.unlocked ? 100 : 0,
        assignedFloor: recipe ? recipe.assignedFloor || null : null
      };
    }
    return { ...this.userWoodcuts[recipeId] };
  }

  public static getAllRecipes(): WoodcutRecipe[] {
    return Object.values(WOODCUT_RECIPES).map((r) => {
      const state = this.getWoodcutState(r.id);
      return {
        ...r,
        unlocked: state.unlocked,
        assignedFloor: state.assignedFloor
      };
    });
  }

  /**
   * Khắc mộc bản (Carving Woodcut)
   * Tốn Gỗ Thị, Bột Màu và Vàng
   */
  public static carveWoodcut(recipeId: string, userGold: number): { success: boolean; message: string; remainingGold: number } {
    const recipe = WOODCUT_RECIPES[recipeId];
    if (!recipe) {
      return { success: false, message: 'Bản vẽ mộc bản không tồn tại!', remainingGold: userGold };
    }

    const state = this.getWoodcutState(recipeId);
    if (state.unlocked) {
      return { success: false, message: 'Bức tranh này đã được khắc thành ván in!', remainingGold: userGold };
    }

    if (userGold < recipe.costGold) {
      return { success: false, message: `Thiếu Vàng Nén! Cần ${recipe.costGold} 🪙 Vàng.`, remainingGold: userGold };
    }

    // Kiểm tra nguyên liệu
    for (const req of recipe.costMaterials) {
      if (req.itemCode === 'wood_thi' && this.materials.woodThi < req.quantity) {
        return { success: false, message: `Thiếu Gỗ Thị! Cần ${req.quantity} phôi gỗ.`, remainingGold: userGold };
      }
      if (req.itemCode === 'color_pigment' && this.materials.colorPigment < req.quantity) {
        return { success: false, message: `Thiếu Bát Bột Màu! Cần ${req.quantity} bát màu.`, remainingGold: userGold };
      }
    }

    // Khấu trừ nguyên liệu
    for (const req of recipe.costMaterials) {
      if (req.itemCode === 'wood_thi') this.materials.woodThi -= req.quantity;
      if (req.itemCode === 'color_pigment') this.materials.colorPigment -= req.quantity;
    }

    const remainingGold = userGold - recipe.costGold;

    // Cập nhật trạng thái hoàn thành khắc ván in
    state.carvingProgress = 100;
    state.unlocked = true;
    state.assignedFloor = recipe.targetFloorId; // Tự động ấn định vào tầng đích
    this.userWoodcuts[recipeId] = state;

    this.saveState();

    return {
      success: true,
      message: `Khắc ván in '${recipe.name}' thành công rực rỡ!`,
      remainingGold
    };
  }

  /**
   * Cơ chế "Ấn Định Dấu Son" (Assign Stamp to Floor)
   * Đóng dấu son đỏ xác nhận kích hoạt buff vào tầng canh tác tương ứng
   */
  public static stampToFloor(recipeId: string, floorId: number): { success: boolean; message: string } {
    const recipe = WOODCUT_RECIPES[recipeId];
    if (!recipe) {
      return { success: false, message: 'Mộc bản không hợp lệ!' };
    }

    const state = this.getWoodcutState(recipeId);
    if (!state.unlocked) {
      return { success: false, message: 'Bạn cần khắc hoàn thiện ván in này trước khi ấn dấu triện!' };
    }

    // Hủy bỏ ấn định của mộc bản khác nếu đang cùng chiếm tầng đích
    Object.values(this.userWoodcuts).forEach((wc) => {
      if (wc.assignedFloor === floorId && wc.recipeId !== recipeId) {
        wc.assignedFloor = null;
      }
    });

    state.assignedFloor = floorId;
    this.userWoodcuts[recipeId] = state;
    this.saveState();

    return {
      success: true,
      message: `Đã đóng dấu son ấn định '${recipe.name}' lên Tầng ${floorId}!`
    };
  }

  /**
   * Tính toán hệ số giảm thời gian sinh trưởng cho tầng (Speed Boost %)
   */
  public static getFloorSpeedMultiplier(floorId: number): number {
    let multiplier = 1.0;
    Object.values(this.userWoodcuts).forEach((state) => {
      if (state.unlocked && state.assignedFloor === floorId) {
        const recipe = WOODCUT_RECIPES[state.recipeId];
        if (recipe && recipe.buffType === WoodcutBuffType.SPEED_BOOST) {
          multiplier *= (1 - recipe.buffValuePercent / 100);
        }
      }
    });
    return Math.max(multiplier, 0.5); // Giảm tối đa 50%
  }

  /**
   * Tính toán hệ số tăng sản lượng / vàng cho tầng (Yield Boost %)
   */
  public static getFloorYieldMultiplier(floorId: number): number {
    let multiplier = 1.0;
    Object.values(this.userWoodcuts).forEach((state) => {
      if (state.unlocked && state.assignedFloor === floorId) {
        const recipe = WOODCUT_RECIPES[state.recipeId];
        if (recipe && recipe.buffType === WoodcutBuffType.YIELD_BOOST) {
          multiplier += (recipe.buffValuePercent / 100);
        }
      }
    });
    return multiplier;
  }
}
