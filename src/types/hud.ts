export type NavTabId = 'map' | 'store' | 'woodblock' | 'achievements';

export interface NavButtonConfig {
  id: NavTabId;
  label: string;
  subLabel: string;
  icon: string;
}

export type StoreTab = 'seeds' | 'orders';

export interface StoreDrawerState {
  isOpen: boolean;
  activeTab: StoreTab;
  selectedCropId: string | null;
}
