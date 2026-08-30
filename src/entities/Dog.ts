import Phaser from 'phaser'

export class PatrolDog {
  readonly sprite: Phaser.Physics.Arcade.Sprite
  private readonly minX: number
  private readonly maxX: number

  constructor(scene: Phaser.Scene, x: number, y: number, minX: number, maxX: number) {
    this.sprite = scene.physics.add.sprite(x, y, 'dog', 0)
    this.minX = minX
    this.maxX = maxX
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setSize(36, 18)
    body.setOffset(6, 6)
    body.setVelocityX(70)
    body.setBounce(0, 0)
    this.sprite.setDepth(8)
    this.sprite.play('dog-run')
  }

  update(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    if (this.sprite.x <= this.minX) {
      body.setVelocityX(70)
      this.sprite.setFlipX(false)
    } else if (this.sprite.x >= this.maxX) {
      body.setVelocityX(-70)
      this.sprite.setFlipX(true)
    }
  }
}
