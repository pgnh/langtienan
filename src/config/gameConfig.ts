import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { FarmWorldScene } from '../scenes/FarmWorldScene';
import { HUDOverlayScene } from '../scenes/HUDOverlayScene';
import { DongHoHex } from './theme';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-canvas',
  width: 720,
  height: 1280,
  backgroundColor: DongHoHex.giayDiep,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [BootScene, FarmWorldScene, HUDOverlayScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  render: {
    pixelArt: false,
    antialias: true
  }
};
