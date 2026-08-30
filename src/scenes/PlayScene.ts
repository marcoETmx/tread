import Phaser from 'phaser'
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  INSTALL,
  LIVES_START,
  RegistryKey,
  SceneKey,
  TILE_SIZE,
} from '../config/constants.ts'
import { copy, theme } from '../config/theme.ts'
import { PatrolDog } from '../entities/Dog.ts'
import { Player } from '../entities/Player.ts'
import { countCables, createLevel1 } from '../levels/level1.ts'
import { TileId } from '../levels/types.ts'
import { audio } from '../systems/AudioSystem.ts'
import { InputSystem } from '../systems/InputSystem.ts'

export class PlayScene extends Phaser.Scene {
  private player!: Player
  private inputSystem!: InputSystem
  private dogs: PatrolDog[] = []
  private skyline!: Phaser.GameObjects.TileSprite
  private elapsedMs = 0
  private checkpointX = 0
  private checkpointY = 0
  private ended = false
  private hintUntil = 0
  private collectReady = false

  constructor() {
    super(SceneKey.Play)
  }

  create(): void {
    this.ended = false
    this.elapsedMs = 0
    this.dogs = []
    this.inputSystem = new InputSystem()
    this.inputSystem.attach(this)
    audio.resume()

    const level = createLevel1()
    const worldW = (level.tiles[0]?.length ?? 0) * TILE_SIZE
    const worldH = level.tiles.length * TILE_SIZE

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'sky').setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setScrollFactor(0).setDepth(-20)
    this.skyline = this.add
      .tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'skyline')
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(-10)
      .setAlpha(0.9)

    const map = this.make.tilemap({
      data: level.tiles,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    })
    const tileset = map.addTilesetImage('tiles', 'tiles', TILE_SIZE, TILE_SIZE)
    if (!tileset) throw new Error('No se pudo crear el tileset')
    const layer = map.createLayer(0, tileset, 0, 0)
    if (!layer) throw new Error('No se pudo crear la capa del nivel')
    layer.setCollision([
      TileId.Ground,
      TileId.Fill,
      TileId.Brick,
      TileId.Roof,
      TileId.Platform,
      TileId.Crate,
    ])
    layer.setDepth(1)

    this.physics.world.setBounds(0, 0, worldW, worldH)
    this.cameras.main.setBounds(0, 0, worldW, worldH)
    this.cameras.main.setZoom(1)
    this.cameras.main.setBackgroundColor(theme.navy)


    this.registry.set(RegistryKey.cables, 0)
    this.registry.set(RegistryKey.lives, LIVES_START)
    this.registry.set(RegistryKey.score, 0)
    this.registry.set(RegistryKey.elapsedMs, 0)
    this.registry.set('cablesNeeded', INSTALL.requiredCables)
    this.registry.set('cablesTotal', countCables(level))
    this.registry.set('hint', '')

    const spawn = level.objects.find((object) => object.type === 'spawn')
    this.checkpointX = spawn?.x ?? 96
    this.checkpointY = spawn?.y ?? 400
    this.player = new Player(this, this.checkpointX, this.checkpointY)
    this.physics.add.collider(this.player.sprite, layer)
    this.cameras.main.startFollow(this.player.sprite, true, 0.14, 0.14)
    this.scale.on(Phaser.Scale.Events.RESIZE, this.lockCameraZoom, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.lockCameraZoom, this)
    })

    const cables = this.physics.add.staticGroup()
    const hazards = this.physics.add.staticGroup()
    const installBoxes = this.physics.add.staticGroup()

    for (const object of level.objects) {
      switch (object.type) {
        case 'van':
          this.add.image(object.x, object.y - 10, 'van').setScale(1.8).setDepth(6)
          break
        case 'house':
          this.add.image(object.x, object.y - 20, 'house').setScale(2.4).setDepth(4)
          break
        case 'cone':
          this.add.image(object.x, object.y + 8, 'cone').setDepth(5)
          break
        case 'window':
          this.add.image(object.x, object.y, 'window').setDepth(3)
          break
        case 'cable': {
          const coil = this.physics.add.staticImage(object.x, object.y - 8, 'cable')
          coil.setDepth(9)
          cables.add(coil)
          this.tweens.add({
            targets: coil,
            scale: 1.08,
            duration: 650,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
          })
          break
        }
        case 'wire':
          hazards.create(object.x, object.y, 'wire').setDepth(7)
          break
        case 'install':
          installBoxes.create(object.x, object.y, 'box').setDepth(8)
          this.add
            .text(object.x, object.y - 48, 'INSTALAR', {
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              fontSize: '14px',
              color: theme.orangeHex,
              fontStyle: '700',
            })
            .setOrigin(0.5)
            .setDepth(8)
          break
        case 'dog': {
          const dog = new PatrolDog(this, object.x, object.y, object.minX ?? object.x - 80, object.maxX ?? object.x + 80)
          this.dogs.push(dog)
          this.physics.add.collider(dog.sprite, layer)
          this.physics.add.overlap(this.player.sprite, dog.sprite, () => {
            this.hitHazard()
          })
          break
        }
        case 'checkpoint':
          break
        case 'spawn':
          break
      }
    }

    this.physics.add.overlap(this.player.sprite, cables, (_player, cable) => {
      if (!this.collectReady) return
      const sprite = cable as Phaser.Physics.Arcade.Sprite
      if (!sprite.active) return
      sprite.destroy()
      const collected = Number(this.registry.get(RegistryKey.cables) ?? 0) + 1
      this.registry.set(RegistryKey.cables, collected)
      this.registry.set(RegistryKey.score, Number(this.registry.get(RegistryKey.score) ?? 0) + 100)
      audio.collect()
      this.spawnSparks(sprite.x, sprite.y)
    })

    this.physics.add.overlap(this.player.sprite, hazards, () => {
      this.hitHazard()
    })

    this.physics.add.overlap(this.player.sprite, installBoxes, () => {
      this.tryInstall()
    })

    this.scene.launch(SceneKey.Hud)
    this.scene.bringToTop(SceneKey.Hud)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scene.stop(SceneKey.Hud)
    })

    this.time.delayedCall(200, () => {
      this.collectReady = true
    })

    this.updateCheckpointFromPlayer()
  }

  update(_time: number, delta: number): void {
    if (this.ended) return
    this.elapsedMs += delta
    this.registry.set(RegistryKey.elapsedMs, this.elapsedMs)
    this.skyline.tilePositionX = this.cameras.main.scrollX * 0.25

    const input = this.inputSystem.sample()
    this.player.update(input, delta)
    for (const dog of this.dogs) dog.update()

    this.updateCheckpointFromPlayer()

    if (this.player.y > this.physics.world.bounds.height + 40) {
      this.hitHazard()
    }
  }

  private lockCameraZoom = (): void => {
    this.cameras.main.setZoom(1)
  }

  private updateCheckpointFromPlayer(): void {
    const x = this.player.x
    const standY = 18 * TILE_SIZE + TILE_SIZE / 2
    if (x > 48 * TILE_SIZE) {
      this.checkpointX = 49 * TILE_SIZE + TILE_SIZE / 2
      this.checkpointY = standY
    }
    if (x > 136 * TILE_SIZE) {
      this.checkpointX = 152 * TILE_SIZE + TILE_SIZE / 2
      this.checkpointY = standY
    }
  }

  private hitHazard(): void {
    if (this.ended || this.player.isInstalling || this.player.isInvulnerable) return
    const lives = Number(this.registry.get(RegistryKey.lives) ?? 0) - 1
    this.registry.set(RegistryKey.lives, lives)
    this.cameras.main.shake(160, 0.006)
    if (lives <= 0) {
      this.finish(false)
      return
    }
    this.player.respawn(this.checkpointX, this.checkpointY)
  }

  private tryInstall(): void {
    if (this.ended || this.player.isInstalling) return
    const cables = Number(this.registry.get(RegistryKey.cables) ?? 0)
    if (cables < INSTALL.requiredCables) {
      if (this.time.now > this.hintUntil) {
        this.registry.set('hint', copy.needCable)
        this.hintUntil = this.time.now + 1400
        this.time.delayedCall(1400, () => {
          if (this.registry.get('hint') === copy.needCable) this.registry.set('hint', '')
        })
      }
      return
    }

    this.player.startInstall()
    audio.install()
    this.spawnSparks(this.player.x, this.player.y)
    this.registry.set('hint', copy.installing)
    this.time.delayedCall(INSTALL.durationMs, () => {
      this.registry.set(RegistryKey.score, Number(this.registry.get(RegistryKey.score) ?? 0) + 500)
      this.finish(true)
    })
  }

  private finish(won: boolean): void {
    if (this.ended) return
    this.ended = true
    if (won) audio.win()
    this.cameras.main.fadeOut(400, 5, 29, 46)
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(won ? SceneKey.Win : SceneKey.Fail)
    })
  }

  private spawnSparks(x: number, y: number): void {
    for (let i = 0; i < 8; i += 1) {
      const spark = this.add.image(x, y, 'spark').setDepth(20)
      this.tweens.add({
        targets: spark,
        x: x + Phaser.Math.Between(-40, 40),
        y: y + Phaser.Math.Between(-50, 10),
        alpha: 0,
        duration: 350,
        onComplete: () => spark.destroy(),
      })
    }
  }
}
