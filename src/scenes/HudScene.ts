import Phaser from 'phaser'
import { GAME_WIDTH, LIVES_START, RegistryKey, SceneKey } from '../config/constants.ts'
import { copy, theme } from '../config/theme.ts'

const HUD_FONT = 'ui-sans-serif, system-ui, sans-serif'

export class HudScene extends Phaser.Scene {
  private cableText!: Phaser.GameObjects.Text
  private scoreText!: Phaser.GameObjects.Text
  private hintText!: Phaser.GameObjects.Text
  private hearts: Phaser.GameObjects.Image[] = []

  constructor() {
    super(SceneKey.Hud)
  }

  create(): void {
    this.add.rectangle(0, 0, GAME_WIDTH, 66, theme.navy, 0.72).setOrigin(0).setScrollFactor(0)
    this.add.rectangle(0, 66, GAME_WIDTH, 5, theme.orange, 1).setOrigin(0).setScrollFactor(0)

    this.add.image(40, 34, 'cable').setScale(0.7).setScrollFactor(0)
    this.cableText = this.add
      .text(72, 34, '', {
        fontFamily: HUD_FONT,
        fontSize: '22px',
        fontStyle: '800',
        color: '#ffffff',
        stroke: theme.inkHex,
        strokeThickness: 3,
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)

    this.scoreText = this.add
      .text(GAME_WIDTH / 2, 24, '', {
        fontFamily: HUD_FONT,
        fontSize: '24px',
        fontStyle: '900',
        color: theme.sandHex,
        stroke: theme.inkHex,
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)

    this.add
      .text(GAME_WIDTH / 2, 48, copy.mission, {
        fontFamily: HUD_FONT,
        fontSize: '13px',
        fontStyle: '800',
        color: theme.orangeHex,
        letterSpacing: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)

    this.add
      .text(GAME_WIDTH - 24, 34, `${copy.house} →`, {
        fontFamily: HUD_FONT,
        fontSize: '22px',
        fontStyle: '900',
        color: theme.orangeHex,
        stroke: theme.inkHex,
        strokeThickness: 4,
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0)

    this.hintText = this.add
      .text(GAME_WIDTH / 2, 96, '', {
        fontFamily: HUD_FONT,
        fontSize: '24px',
        fontStyle: '900',
        color: theme.orangeHex,
        stroke: theme.inkHex,
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)

    this.hearts = []
    for (let i = 0; i < LIVES_START; i += 1) {
      this.hearts.push(this.add.image(GAME_WIDTH - 176 - i * 34, 34, 'heart').setScrollFactor(0).setScale(1.05))
    }

    this.refresh()
    this.registry.events.on('changedata', this.refresh, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.registry.events.off('changedata', this.refresh, this)
    })
  }

  private refresh = (): void => {
    const cables = Number(this.registry.get(RegistryKey.cables) ?? 0)
    const total = Number(this.registry.get('cablesTotal') ?? 12)
    const needed = Number(this.registry.get('cablesNeeded') ?? 8)
    const score = Number(this.registry.get(RegistryKey.score) ?? 0)
    const lives = Number(this.registry.get(RegistryKey.lives) ?? 0)
    const hint = String(this.registry.get('hint') ?? '')

    this.cableText.setText(`${copy.cables} ${cables}/${total}  ·  falta ${Math.max(0, needed - cables)}`)
    this.scoreText.setText(String(score).padStart(6, '0'))
    this.hintText.setText(hint)
    this.hearts.forEach((heart, index) => {
      heart.setAlpha(index < lives ? 1 : 0.22)
    })
  }
}
