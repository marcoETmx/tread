import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, RegistryKey, SceneKey } from '../config/constants.ts'
import { copy, theme } from '../config/theme.ts'
import { audio } from '../systems/AudioSystem.ts'

function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function resultUi(
  scene: Phaser.Scene,
  title: string,
  body: string,
  accent: number,
): void {
  scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, theme.navy, 1)
  scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'sky').setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setAlpha(0.35)

  scene.add
    .text(GAME_WIDTH / 2, 160, title, {
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      fontSize: '56px',
      fontStyle: '900',
      color: '#ffffff',
    })
    .setOrigin(0.5)

  scene.add
    .text(GAME_WIDTH / 2, 230, body, {
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      fontSize: '24px',
      color: theme.fogHex,
    })
    .setOrigin(0.5)

  const cables = Number(scene.registry.get(RegistryKey.cables) ?? 0)
  const score = Number(scene.registry.get(RegistryKey.score) ?? 0)
  const elapsed = Number(scene.registry.get(RegistryKey.elapsedMs) ?? 0)

  scene.add
    .text(GAME_WIDTH / 2, 320, `Puntos ${score}   ·   Cable ${cables}   ·   Tiempo ${formatTime(elapsed)}`, {
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
    })
    .setOrigin(0.5)

  const retry = scene.add.rectangle(GAME_WIDTH / 2 - 160, 460, 260, 64, accent).setInteractive({ useHandCursor: true })
  scene.add.text(GAME_WIDTH / 2 - 160, 460, copy.again, {
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    fontSize: '24px',
    fontStyle: '800',
    color: '#ffffff',
  }).setOrigin(0.5)

  const menu = scene.add.rectangle(GAME_WIDTH / 2 + 160, 460, 260, 64, theme.sky).setInteractive({ useHandCursor: true })
  scene.add.text(GAME_WIDTH / 2 + 160, 460, copy.menu, {
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    fontSize: '24px',
    fontStyle: '800',
    color: '#ffffff',
  }).setOrigin(0.5)

  retry.on('pointerdown', () => {
    audio.resume()
    scene.scene.start(SceneKey.Play)
  })
  menu.on('pointerdown', () => {
    audio.resume()
    scene.scene.start(SceneKey.Menu)
  })
}

export class WinScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Win)
  }

  create(): void {
    resultUi(this, copy.winTitle, copy.winBody, theme.orange)
    this.add.sprite(GAME_WIDTH / 2, 620, 'player', 6).setOrigin(0.5, 1)
    this.add.image(GAME_WIDTH / 2 + 70, 620, 'box').setOrigin(0.5, 1)
  }
}

export class FailScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Fail)
  }

  create(): void {
    resultUi(this, copy.failTitle, copy.failBody, 0xb42318)
  }
}
