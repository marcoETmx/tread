import Phaser from 'phaser'
import { GAME_WIDTH, LIVES_START, RegistryKey, SceneKey } from '../config/constants.ts'
import { copy, theme } from '../config/theme.ts'

export class HudScene extends Phaser.Scene {
  private cableText!: Phaser.GameObjects.Text
  private scoreText!: Phaser.GameObjects.Text
  private hintText!: Phaser.GameObjects.Text
  private hearts: Phaser.GameObjects.Image[] = []

  constructor() {
    super(SceneKey.Hud)
  }

  create(): void {
    this.add.rectangle(0, 0, GAME_WIDTH, 64, theme.navy, 0.55).setOrigin(0).setScrollFactor(0)

    this.add.image(36, 32, 'cable').setScale(0.55).setScrollFactor(0)
    this.cableText = this.add
      .text(64, 32, '', {
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: '22px',
        fontStyle: '700',
        color: '#ffffff',
      })
      .setOrigin(0, 0.5)
      .setScrollFactor(0)

    this.scoreText = this.add
      .text(GAME_WIDTH / 2, 32, '', {
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: '22px',
        fontStyle: '700',
        color: theme.fogHex,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)

    this.add
      .text(GAME_WIDTH - 28, 32, `${copy.house} →`, {
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: '20px',
        fontStyle: '800',
        color: theme.orangeHex,
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0)

    this.hintText = this.add
      .text(GAME_WIDTH / 2, 84, '', {
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: '22px',
        fontStyle: '700',
        color: theme.orangeHex,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)

    this.hearts = []
    for (let i = 0; i < LIVES_START; i += 1) {
      this.hearts.push(this.add.image(GAME_WIDTH - 160 - i * 28, 32, 'heart').setScrollFactor(0))
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
    this.scoreText.setText(`${score} pts`)
    this.hintText.setText(hint)
    this.hearts.forEach((heart, index) => {
      heart.setAlpha(index < lives ? 1 : 0.2)
    })
  }
}
