import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, SceneKey } from '../config/constants.ts'
import { copy, theme } from '../config/theme.ts'
import { audio } from '../systems/AudioSystem.ts'

function addButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
): void {
  const bg = scene.add.rectangle(x, y, 280, 64, theme.orange, 1).setInteractive({ useHandCursor: true })
  const text = scene.add
    .text(x, y, label, {
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      fontSize: '28px',
      fontStyle: '800',
      color: '#ffffff',
    })
    .setOrigin(0.5)

  const activate = () => {
    audio.resume()
    onClick()
  }

  bg.on('pointerdown', activate)
  text.setInteractive({ useHandCursor: true }).on('pointerdown', activate)
  bg.on('pointerover', () => bg.setFillStyle(theme.sky))
  bg.on('pointerout', () => bg.setFillStyle(theme.orange))
}

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Menu)
  }

  create(): void {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'sky').setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
    this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT - 80, 'skyline')
      .setDisplaySize(GAME_WIDTH, 280)
      .setAlpha(0.95)

    this.add.image(210, 520, 'van').setScale(2)
    const preview = this.add.sprite(360, 488, 'player', 0).setScale(1.5)
    preview.play('player-walk')

    this.add
      .text(GAME_WIDTH / 2, 150, copy.title, {
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: '96px',
        fontStyle: '900',
        color: '#ffffff',
        stroke: theme.navyHex,
        strokeThickness: 10,
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, 240, copy.tagline, {
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: '28px',
        color: theme.fogHex,
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, 310, copy.how, {
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: '22px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    addButton(this, GAME_WIDTH / 2, 430, copy.play, () => {
      this.scene.start(SceneKey.Play)
    })

    this.add
      .text(GAME_WIDTH / 2, 680, 'Celular: pad táctil  ·  Desktop: flechas / WASD + espacio', {
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: '18px',
        color: theme.fogHex,
      })
      .setOrigin(0.5)

    this.add.image(980, 500, 'house').setScale(2)
    this.add.image(860, 545, 'box').setScale(1.4)
    this.add.image(820, 528, 'cable').setScale(1.2)
  }
}
