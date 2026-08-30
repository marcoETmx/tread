import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, RegistryKey, SceneKey } from '../config/constants.ts'
import { copy, theme } from '../config/theme.ts'
import { audio } from '../systems/AudioSystem.ts'
import { spawnSparks } from '../systems/VfxSystem.ts'

function formatTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const FONT = 'ui-sans-serif, system-ui, sans-serif'

function resultUi(
  scene: Phaser.Scene,
  title: string,
  body: string,
  accent: number,
): void {
  scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, theme.navy, 1)
  scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'sky').setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setAlpha(0.4)
  scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT + 4, 'skyline').setOrigin(0.5, 1).setAlpha(0.55)

  scene.add.rectangle(GAME_WIDTH / 2, 168, 560, 6, accent, 1)

  scene.add
    .text(GAME_WIDTH / 2, 148, title, {
      fontFamily: FONT,
      fontSize: '52px',
      fontStyle: '900',
      color: '#ffffff',
      stroke: theme.inkHex,
      strokeThickness: 8,
    })
    .setOrigin(0.5)

  scene.add
    .text(GAME_WIDTH / 2, 222, body, {
      fontFamily: FONT,
      fontSize: '24px',
      fontStyle: '700',
      color: theme.fogHex,
      stroke: theme.inkHex,
      strokeThickness: 3,
    })
    .setOrigin(0.5)

  const cables = Number(scene.registry.get(RegistryKey.cables) ?? 0)
  const score = Number(scene.registry.get(RegistryKey.score) ?? 0)
  const elapsed = Number(scene.registry.get(RegistryKey.elapsedMs) ?? 0)

  scene.add
    .text(
      GAME_WIDTH / 2,
      300,
      `${String(score).padStart(6, '0')}   ·   Cable ${cables}   ·   Tiempo ${formatTime(elapsed)}`,
      {
        fontFamily: FONT,
        fontSize: '22px',
        fontStyle: '800',
        color: '#ffffff',
        stroke: theme.inkHex,
        strokeThickness: 4,
      },
    )
    .setOrigin(0.5)

  const retry = scene.add.rectangle(GAME_WIDTH / 2 - 160, 460, 260, 64, accent).setInteractive({ useHandCursor: true })
  scene.add.rectangle(GAME_WIDTH / 2 - 160, 466, 260, 64, theme.ink, 0.35)
  scene.add.text(GAME_WIDTH / 2 - 160, 460, copy.again, {
    fontFamily: FONT,
    fontSize: '24px',
    fontStyle: '900',
    color: '#ffffff',
    stroke: theme.inkHex,
    strokeThickness: 4,
  }).setOrigin(0.5)

  const menu = scene.add.rectangle(GAME_WIDTH / 2 + 160, 460, 260, 64, theme.sky).setInteractive({ useHandCursor: true })
  scene.add.text(GAME_WIDTH / 2 + 160, 460, copy.menu, {
    fontFamily: FONT,
    fontSize: '24px',
    fontStyle: '900',
    color: '#ffffff',
    stroke: theme.inkHex,
    strokeThickness: 4,
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
    const tech = this.add.sprite(GAME_WIDTH / 2, 568, 'player', 0).play('player-install')
    this.add.sprite(GAME_WIDTH / 2 + 74, 576, 'box', 0).play('box-blink')
    spawnSparks(this, tech.x, tech.y - 8, 12)
  }
}

export class FailScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Fail)
  }

  create(): void {
    resultUi(this, copy.failTitle, copy.failBody, 0xb42318)
    this.add.sprite(GAME_WIDTH / 2, 568, 'player', 0).play('player-hurt')
    this.add.sprite(GAME_WIDTH / 2 + 90, 590, 'dog', 0).play('dog-run')
  }
}
