/**
 * assets.ts - Định nghĩa tập trung danh mục Assets của game Làng Tiền An
 * Tuân thủ quy tắc kiến trúc: Không hardcode đường dẫn asset rải rác trong logic.
 */

export const ASSET_KEYS = {
  // Characters / NPCs
  NPC_CHI_PHEO: 'npc_chipheo',
  NPC_THI_NO: 'npc_thino',
  SCARECROW: 'scarecrow',

  // Crops & Farming Slots
  CROP_BANANA_TREE: 'crop_banana_tree',
  CROP_BEO_READY: 'crop_beo_ready',
  SLOT_SOIL: 'slot_soil',
  SLOT_WATER: 'slot_water',

  // Environment & Scenery
  BG_DIEP: 'bg_diep',
  SIGN_FLOOR: 'sign_floor',
  TREE_BANYAN: 'tree_banyan',
  WORLD_MAP_ART: 'world_map_art',

  // User Interface (HUD & Controls)
  BTN_ACHIEVEMENT: 'btn_achievement',
  BTN_MAP: 'btn_map',
  BTN_SETTING: 'btn_setting',
  BTN_SETTING_CLEAN: 'btn_setting_clean',
  BTN_SHOP: 'btn_shop',
  BTN_WOODCUT: 'btn_woodcut',
  STATS_PARCHMENT: 'stats_parchment',
  STATS_PARCHMENT_CLEAN: 'stats_parchment_clean',
  TITLE_BOARD: 'title_board',
  TITLE_BOARD_CLEAN: 'title_board_clean',
  BOTTOM_DOCK_CLEAN: 'bottom_dock_clean',

  // Reference Concepts
  REF_LOADING_SCENE: 'ref_loading_scene',
  REF_HUD_SCENE: 'ref_hud_scene',
  REF_SHOP_DRAWER: 'ref_shop_drawer',
  REF_IMPERIAL_DECREE: 'ref_imperial_decree',
  REF_ACHIEVEMENT_LOG: 'ref_achievement_log',
  REF_WOODCUT_STUDIO: 'ref_woodcut_studio',
  REF_VISIT_FRIENDS: 'ref_visit_friends',
  REF_VANVILLAGE: 'ref_vanvillage',
} as const;

export type AssetKey = typeof ASSET_KEYS[keyof typeof ASSET_KEYS];

export interface AssetDefinition {
  key: AssetKey;
  path: string;
}

/**
 * Danh sách toàn bộ các file ảnh thực tế trong thư mục public/assets/
 */
export const ASSET_LIST: AssetDefinition[] = [
  // Characters
  { key: ASSET_KEYS.NPC_CHI_PHEO, path: '/assets/characters/npc_chipheo.png' },
  { key: ASSET_KEYS.NPC_THI_NO, path: '/assets/characters/npc_thino.png' },
  { key: ASSET_KEYS.SCARECROW, path: '/assets/characters/scarecrow.png' },

  // Crops & Slots
  { key: ASSET_KEYS.CROP_BANANA_TREE, path: '/assets/crops/crop_banana_tree.png' },
  { key: ASSET_KEYS.CROP_BEO_READY, path: '/assets/crops/crop_beo_ready.png' },
  { key: ASSET_KEYS.SLOT_SOIL, path: '/assets/crops/slot_soil.png' },
  { key: ASSET_KEYS.SLOT_WATER, path: '/assets/crops/slot_water.png' },

  // Environment
  { key: ASSET_KEYS.BG_DIEP, path: '/assets/environment/bg_diep.png' },
  { key: ASSET_KEYS.SIGN_FLOOR, path: '/assets/environment/sign_floor.png' },
  { key: ASSET_KEYS.TREE_BANYAN, path: '/assets/environment/tree_banyan.png' },
  { key: ASSET_KEYS.WORLD_MAP_ART, path: '/assets/environment/world_map_art.png' },

  // UI
  { key: ASSET_KEYS.BTN_ACHIEVEMENT, path: '/assets/ui/btn_achievement.png' },
  { key: ASSET_KEYS.BTN_MAP, path: '/assets/ui/btn_map.png' },
  { key: ASSET_KEYS.BTN_SETTING, path: '/assets/ui/btn_setting.png' },
  { key: ASSET_KEYS.BTN_SETTING_CLEAN, path: '/assets/ui/btn_setting_clean.png' },
  { key: ASSET_KEYS.BTN_SHOP, path: '/assets/ui/btn_shop.png' },
  { key: ASSET_KEYS.BTN_WOODCUT, path: '/assets/ui/btn_woodcut.png' },
  { key: ASSET_KEYS.STATS_PARCHMENT, path: '/assets/ui/stats_parchment.png' },
  { key: ASSET_KEYS.STATS_PARCHMENT_CLEAN, path: '/assets/ui/stats_parchment_clean.png' },
  { key: ASSET_KEYS.TITLE_BOARD, path: '/assets/ui/title_board.png' },
  { key: ASSET_KEYS.TITLE_BOARD_CLEAN, path: '/assets/ui/title_board_clean.png' },
  { key: ASSET_KEYS.BOTTOM_DOCK_CLEAN, path: '/assets/ui/bottom_dock_clean.png' },

  // References
  { key: ASSET_KEYS.REF_LOADING_SCENE, path: '/assets/references/1.Loading Scene.png' },
  { key: ASSET_KEYS.REF_HUD_SCENE, path: '/assets/references/2.HUD Scene.png' },
  { key: ASSET_KEYS.REF_SHOP_DRAWER, path: '/assets/references/3.Ngan keo tiem tap hoa.png' },
  { key: ASSET_KEYS.REF_IMPERIAL_DECREE, path: '/assets/references/4. Chiếu thư khai mở.jpg' },
  { key: ASSET_KEYS.REF_ACHIEVEMENT_LOG, path: '/assets/references/5. Sổ đinh thành tích.jpg' },
  { key: ASSET_KEYS.REF_WOODCUT_STUDIO, path: '/assets/references/6. Bàn chế tác mộc bản.png' },
  { key: ASSET_KEYS.REF_VISIT_FRIENDS, path: '/assets/references/7. Thăm bạn bè.jpg' },
  { key: ASSET_KEYS.REF_VANVILLAGE, path: '/assets/references/vanvillage.jpg' },
];
