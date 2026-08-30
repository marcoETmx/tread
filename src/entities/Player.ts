import Phaser from 'phaser'
import { PLAYER } from '../config/constants.ts'
import { audio } from '../systems/AudioSystem.ts'
import type { GameInputState } from '../systems/InputSystem.ts'

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite
  private coyoteMs = 0
  private bufferMs = 0
  private invulnMs = 0
  private installing = false
  private wasGrounded = true
  private jumpCutApplied = false
  private jumpHoldMs = 0

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, 'player', 0)
    this.sprite.setDepth(10)
    this.sprite.setCollideWorldBounds(false)
    const body = this.sprite.body as Phaser.Physics.Arcade.Body
    body.setSize(26, 54)
    body.setOffset(22, 26)
    body.setMaxVelocity(PLAYER.speed + 40, PLAYER.maxFall)
  }

  get x(): number {
    return this.sprite.x
  }

  get y(): number {
    return this.sprite.y
  }

  get body(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body
  }

  get isInvulnerable(): boolean {
    return this.invulnMs > 0
  }

  get isInstalling(): boolean {
    return this.installing
  }

  startInstall(): void {
    this.installing = true
    this.body.setVelocity(0, 0)
    this.sprite.play('player-install', true)
  }

  hurtFlash(): void {
    this.invulnMs = PLAYER.invulnMs
    audio.hurt()
  }

  respawn(x: number, y: number): void {
    this.installing = false
    this.sprite.setPosition(x, y)
    this.body.setVelocity(0, 0)
    this.jumpCutApplied = false
    this.jumpHoldMs = 0
    this.hurtFlash()
  }

  update(input: GameInputState, delta: number): void {
    if (this.installing) {
      this.body.setVelocity(0, 0)
      return
    }

    const grounded = this.body.blocked.down || this.body.touching.down
    if (grounded) {
      this.coyoteMs = PLAYER.coyoteMs
      if (!this.wasGrounded) audio.land()
    } else {
      this.coyoteMs = Math.max(0, this.coyoteMs - delta)
    }
    this.wasGrounded = grounded

    if (input.jumpPressed) this.bufferMs = PLAYER.jumpBufferMs
    else this.bufferMs = Math.max(0, this.bufferMs - delta)

    const speed = grounded ? PLAYER.speed : PLAYER.airSpeed
    if (input.left && !input.right) {
      this.body.setVelocityX(-speed)
      this.sprite.setFlipX(true)
    } else if (input.right && !input.left) {
      this.body.setVelocityX(speed)
      this.sprite.setFlipX(false)
    } else {
      this.body.setVelocityX(grounded ? 0 : this.body.velocity.x * 0.92)
    }

    if (this.bufferMs > 0 && this.coyoteMs > 0) {
      this.body.setVelocityY(PLAYER.jumpVelocity)
      this.coyoteMs = 0
      this.bufferMs = 0
      this.jumpCutApplied = false
      this.jumpHoldMs = 0
      audio.jump()
    }

    if (input.jump) this.jumpHoldMs += delta

    // A quick tap is a full jump. Hold-then-release still cuts height.
    if (!input.jump && !this.jumpCutApplied && this.body.velocity.y < 0) {
      if (this.jumpHoldMs >= PLAYER.jumpTapMs) {
        this.body.setVelocityY(this.body.velocity.y * PLAYER.jumpCut)
        this.jumpCutApplied = true
      }
    }

    if (this.invulnMs > 0) {
      this.invulnMs = Math.max(0, this.invulnMs - delta)
      this.sprite.setAlpha(Math.sin(this.invulnMs / 40) > 0 ? 1 : 0.45)
    } else {
      this.sprite.setAlpha(1)
    }

    this.playAnim(grounded)
  }

  private playAnim(grounded: boolean): void {
    if (this.installing) return
    if (!grounded) {
      this.sprite.play(this.body.velocity.y < 0 ? 'player-jump' : 'player-fall', true)
      return
    }
    if (Math.abs(this.body.velocity.x) > 20) {
      this.sprite.play('player-walk', true)
      return
    }
    this.sprite.play('player-idle', true)
  }
}
