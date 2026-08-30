import Phaser from 'phaser'
import {
  CAMERA,
  CAMERA_ZOOM,
  GAME_HEIGHT,
  GAME_WIDTH,
  INSTALL,
  JUICE,
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
import { floatScore, spawnDebris, spawnPickupBurst, spawnSparks } from '../systems/VfxSystem.ts'

function tileSurfaceY(tiles: number[][], x: number, fromY: number): number {
  const tileX = Math.floor(x / TILE_SIZE)
  let tileY = Math.max(0, Math.floor(fromY / TILE_SIZE))
  while (tileY < tiles.length) {
    const id = tiles[tileY]?.[tileX] ?? 0
    if (id > 0) return tileY * TILE_SIZE
    tileY += 1
  }
  return fromY
}

function plant(
  scene: Phaser.Scene,
  x: number,
  feetY: number,
  key: string,
  scale: number,
  depth: number,
): Phaser.GameObjects.Image {
  return scene.add.image(x, feetY, key).setOrigin(0.5, 1).setScale(scale).setDepth(depth)
}

export class PlayScene extends Phaser.Scene {
  private player!: Player
  private inputSystem!: InputSystem
  private dogs: PatrolDog[] = []
  private elapsedMs = 0
  private checkpointX = 0
  private checkpointY = 0
  private ended = false
  private hintUntil = 0
  private collectReady = false
  private sky!: Phaser.GameObjects.Image
  private skyline!: Phaser.GameObjects.Image
  private lookAheadX = CAMERA.offsetXRight

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

    this.sky = this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'sky')
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setDepth(-20)
    this.skyline = this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT + 4, 'skyline')
      .setOrigin(0.5, 1)
      .setDepth(-10)
      .setAlpha(0.96)

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
    this.cameras.main.setZoom(CAMERA_ZOOM)
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
    this.cameras.main.startFollow(this.player.sprite, true, 0.18, 0.16)
    this.lookAheadX = CAMERA.offsetXRight
    this.cameras.main.setFollowOffset(this.lookAheadX, CAMERA.offsetY)
    this.pinBackdrop()
    this.scale.on(Phaser.Scale.Events.RESIZE, this.lockCameraZoom, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.lockCameraZoom, this)
    })

    const cables = this.physics.add.staticGroup()
    const hazards = this.physics.add.staticGroup()
    const installBoxes = this.physics.add.staticGroup()

    for (const object of level.objects) {
      const feetY = tileSurfaceY(level.tiles, object.x, object.y)
      switch (object.type) {
        case 'van':
          plant(this, object.x, feetY + 6, 'van', 1.45, 6)
          break
        case 'house':
          plant(this, object.x, feetY + 4, 'house', 2.2, 4)
          break
        case 'cone':
          plant(this, object.x, feetY + 4, 'cone', 1.15, 5)
          break
        case 'window':
          this.add.image(object.x, object.y, 'window').setScale(1.35).setDepth(3)
          break
        case 'cable': {
          const coil = this.physics.add.staticSprite(object.x, feetY - 2, 'cable')
          coil.setOrigin(0.5, 1)
          coil.setPosition(object.x, feetY - 2)
          coil.refreshBody()
          coil.setDepth(9)
          coil.setScale(1.12)
          coil.play('cable-spin')
          cables.add(coil)
          break
        }
        case 'wire': {
          const live = hazards.create(object.x, object.y, 'wire') as Phaser.Physics.Arcade.Sprite
          live.setDepth(7)
          live.play('wire-spark')
          break
        }
        case 'install': {
          const box = installBoxes.create(object.x, feetY, 'box') as Phaser.Physics.Arcade.Sprite
          box.setOrigin(0.5, 1)
          box.setPosition(object.x, feetY)
          box.refreshBody()
          box.setDepth(8)
          box.play('box-blink')
          this.add
            .text(object.x, feetY - box.displayHeight - 16, 'INSTALAR', {
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              fontSize: '18px',
              color: theme.orangeHex,
              fontStyle: '900',
              stroke: theme.inkHex,
              strokeThickness: 5,
            })
            .setOrigin(0.5, 1)
            .setDepth(8)
          break
        }
        case 'dog': {
          const dog = new PatrolDog(this, object.x, feetY - 16, object.minX ?? object.x - 80, object.maxX ?? object.x + 80)
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
      spawnPickupBurst(this, sprite.x, sprite.y)
      floatScore(this, sprite.x, sprite.y - 12, '+100')
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

    const input = this.inputSystem.sample()
    this.player.update(input, delta)
    this.updateCameraLook(delta)
    this.pinBackdrop()
    for (const dog of this.dogs) dog.update()

    this.updateCheckpointFromPlayer()

    if (this.player.y > this.physics.world.bounds.height + 40) {
      this.hitHazard()
    }
  }

  private lockCameraZoom = (): void => {
    this.cameras.main.setZoom(CAMERA_ZOOM)
    this.pinBackdrop()
  }

  private updateCameraLook(delta: number): void {
    const target = this.player.sprite.flipX ? CAMERA.offsetXLeft : CAMERA.offsetXRight
    this.lookAheadX += (target - this.lookAheadX) * Math.min(1, delta * CAMERA.lookLerp)
    this.cameras.main.setFollowOffset(this.lookAheadX, CAMERA.offsetY)
    this.cameras.main.setZoom(CAMERA_ZOOM)
  }

  private pinBackdrop(): void {
    const view = this.cameras.main.worldView
    const width = Math.ceil(view.width) + 10
    const height = Math.ceil(view.height) + 10
    this.sky.setPosition(view.centerX, view.centerY)
    this.sky.setDisplaySize(width, height)
    this.skyline.setPosition(view.centerX, view.bottom + 2)
    this.skyline.setDisplaySize(width + 8, Math.round(width * (300 / 1280) * 1.12))
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
    this.cameras.main.shake(JUICE.shakeHurtMs, JUICE.shakeHurtIntensity)
    spawnDebris(this, this.player.x, this.player.y)
    this.player.beginHurt()
    if (lives <= 0) {
      this.time.delayedCall(JUICE.deathHoldMs, () => this.finish(false))
      return
    }
    this.time.delayedCall(JUICE.hurtStunMs, () => {
      if (this.ended) return
      this.player.respawn(this.checkpointX, this.checkpointY)
      spawnDebris(this, this.checkpointX, this.checkpointY)
    })
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
    spawnSparks(this, this.player.x, this.player.y, 16)
    this.time.addEvent({
      delay: 220,
      repeat: 6,
      callback: () => {
        if (!this.player.isInstalling) return
        spawnSparks(this, this.player.x, this.player.y - 10, 6)
      },
    })
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
}
