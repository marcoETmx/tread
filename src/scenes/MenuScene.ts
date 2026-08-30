import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, SceneKey } from '../config/constants.ts'
import { copy, theme } from '../config/theme.ts'
import { audio } from '../systems/AudioSystem.ts'

const FONT = 'ui-sans-serif, system-ui, sans-serif'

function addButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
): void {
  const shadow = scene.add.rectangle(x, y + 6, 300, 68, theme.ink, 1)
  const bg = scene.add.rectangle(x, y, 300, 68, theme.orange, 1).setInteractive({ useHandCursor: true })
  const text = scene.add
    .text(x, y, label, {
      fontFamily: FONT,
      fontSize: '28px',
      fontStyle: '900',
      color: '#ffffff',
      stroke: theme.inkHex,
      strokeThickness: 4,
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
  void shadow
}

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Menu)
  }

  create(): void {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'sky').setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT + 4, 'skyline').setOrigin(0.5, 1).setAlpha(0.96)

    this.add.rectangle(GAME_WIDTH / 2, 196, 620, 6, theme.orange, 1)
    this.add.rectangle(GAME_WIDTH / 2, 258, 420, 4, theme.navy, 0.7)

    this.add.image(168, 536, 'van').setScale(2.45)
    const preview = this.add.sprite(338, 508, 'player', 0).setScale(2)
    preview.play('player-walk')
    this.add.image(292, 562, 'dust').setScale(1.4).setAlpha(0.8)
    this.add.image(376, 562, 'dust').setScale(1.05).setAlpha(0.55)

    this.add
      .text(GAME_WIDTH / 2, 118, copy.mission, {
        fontFamily: FONT,
        fontSize: '18px',
        fontStyle: '800',
        color: theme.orangeHex,
        stroke: theme.inkHex,
        strokeThickness: 4,
        letterSpacing: 8,
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, 186, copy.title, {
        fontFamily: FONT,
        fontSize: '104px',
        fontStyle: '900',
        color: '#ffffff',
        stroke: theme.navyHex,
        strokeThickness: 12,
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, 268, copy.tagline, {
        fontFamily: FONT,
        fontSize: '26px',
        fontStyle: '700',
        color: theme.fogHex,
        stroke: theme.inkHex,
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, 318, copy.how, {
        fontFamily: FONT,
        fontSize: '20px',
        fontStyle: '700',
        color: '#ffffff',
        stroke: theme.inkHex,
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    addButton(this, GAME_WIDTH / 2, 430, copy.play, () => {
      this.scene.start(SceneKey.Play)
    })

    this.input.keyboard?.on('keydown-ENTER', () => {
      audio.resume()
      this.scene.start(SceneKey.Play)
    })
    this.input.keyboard?.on('keydown-SPACE', () => {
      audio.resume()
      this.scene.start(SceneKey.Play)
    })

    this.add
      .text(GAME_WIDTH / 2, 680, 'Celular: pad táctil  ·  Desktop: flechas / WASD + espacio', {
        fontFamily: FONT,
        fontSize: '18px',
        color: theme.fogHex,
      })
      .setOrigin(0.5)

    this.add.image(1020, 492, 'house').setScale(2.45)
    this.add.sprite(860, 548, 'box', 0).play('box-blink').setScale(1.7)
    this.add.sprite(800, 524, 'cable', 0).play('cable-spin').setScale(1.35)
  }
}
