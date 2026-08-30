import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, PLAYER } from './constants.ts'
import { theme } from './theme.ts'
import { BootScene } from '../scenes/BootScene.ts'
import { HudScene } from '../scenes/HudScene.ts'
import { MenuScene } from '../scenes/MenuScene.ts'
import { PlayScene } from '../scenes/PlayScene.ts'
import { PreloadScene } from '../scenes/PreloadScene.ts'
import { FailScene, WinScene } from '../scenes/ResultScenes.ts'

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-frame',
  title: 'Tread',
  backgroundColor: theme.navyHex,
  pixelArt: true,
  roundPixels: true,
  disableContextMenu: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-frame',
    expandParent: false,
    resizeInterval: 100,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: PLAYER.gravity },
      debug: false,
    },
  },
  input: {
    activePointers: 3,
    keyboard: true,
    mouse: true,
    touch: true,
  },
  audio: {
    disableWebAudio: false,
  },
  scene: [BootScene, PreloadScene, MenuScene, PlayScene, HudScene, WinScene, FailScene],
}
