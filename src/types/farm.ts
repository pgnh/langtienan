import { SlotStatus } from './database';

export interface CropCostSecondary {
  item: string;
  amount: number;
}

export interface CropDefinition {
  id: string;
  name: string;
  floorId: number;
  tierName: string;
  growDurationSec: number;
  costGold: number;
  costSecondary?: CropCostSecondary;
  yieldQty: number;
  yieldUnit: string;
  sellPriceGold: number;
  rewardFame: number;
  rewardPaper?: number;
  roiPercent: number;
  description: string;
  icon: string;
  colorHex: number;
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
