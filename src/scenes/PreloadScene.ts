import Phaser from 'phaser'
import {
  BOX_FRAME,
  CABLE_FRAME,
  createGeneratedCanvases,
  DOG_FRAME,
  PLAYER_ANIMS,
  PLAYER_FRAME,
  WIRE_FRAME,
} from '../assets/generateTextures.ts'
import { SceneKey } from '../config/constants.ts'
import { theme } from '../config/theme.ts'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Preload)
  }

  create(): void {
    this.cameras.main.setBackgroundColor(theme.navyHex)
    const canvases = createGeneratedCanvases()

    this.load.spritesheet('player', canvases.player.toDataURL(), {
      frameWidth: PLAYER_FRAME.width,
      frameHeight: PLAYER_FRAME.height,
    })
    this.load.spritesheet('dog', canvases.dog.toDataURL(), {
      frameWidth: DOG_FRAME.width,
      frameHeight: DOG_FRAME.height,
    })
    this.load.spritesheet('cable', canvases.cable.toDataURL(), {
      frameWidth: CABLE_FRAME.width,
      frameHeight: CABLE_FRAME.height,
    })
    this.load.spritesheet('wire', canvases.wire.toDataURL(), {
      frameWidth: WIRE_FRAME.width,
      frameHeight: WIRE_FRAME.height,
    })
    this.load.spritesheet('box', canvases.box.toDataURL(), {
      frameWidth: BOX_FRAME.width,
      frameHeight: BOX_FRAME.height,
    })
    this.load.image('tiles', canvases.tiles.toDataURL())
    this.load.image('van', canvases.van.toDataURL())
    this.load.image('house', canvases.house.toDataURL())
    this.load.image('cone', canvases.cone.toDataURL())
    this.load.image('window', canvases.window.toDataURL())
    this.load.image('sky', canvases.sky.toDataURL())
    const skyline = this.textures.addCanvas('skyline', canvases.skyline)
    skyline?.setWrap(Phaser.Textures.WrapMode.CLAMP_TO_EDGE, Phaser.Textures.WrapMode.CLAMP_TO_EDGE)
    this.load.image('spark', canvases.spark.toDataURL())
    this.load.image('dust', canvases.dust.toDataURL())
    this.load.image('debris', canvases.debris.toDataURL())
    this.load.image('heart', canvases.heart.toDataURL())

    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      this.createAnims()
      this.scene.start(SceneKey.Menu)
    })
    this.load.start()
  }

  private createAnims(): void {
    const define = (key: string, config: Phaser.Types.Animations.Animation) => {
      if (!this.anims.exists(key)) this.anims.create(config)
    }

    define('player-idle', {
      key: 'player-idle',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: PLAYER_ANIMS.idleEnd }),
      frameRate: 4,
      repeat: -1,
    })
    define('player-walk', {
      key: 'player-walk',
      frames: this.anims.generateFrameNumbers('player', {
        start: PLAYER_ANIMS.walkStart,
        end: PLAYER_ANIMS.walkEnd,
      }),
      frameRate: 14,
      repeat: -1,
    })
    define('player-jump', {
      key: 'player-jump',
      frames: [{ key: 'player', frame: PLAYER_ANIMS.jump }],
      frameRate: 1,
    })
    define('player-fall', {
      key: 'player-fall',
      frames: [{ key: 'player', frame: PLAYER_ANIMS.fall }],
      frameRate: 1,
    })
    define('player-hurt', {
      key: 'player-hurt',
      frames: [{ key: 'player', frame: PLAYER_ANIMS.hurt }],
      frameRate: 1,
    })
    define('player-install', {
      key: 'player-install',
      frames: this.anims.generateFrameNumbers('player', {
        start: PLAYER_ANIMS.installStart,
        end: PLAYER_ANIMS.installEnd,
      }),
      frameRate: 8,
      repeat: -1,
    })
    define('dog-run', {
      key: 'dog-run',
      frames: this.anims.generateFrameNumbers('dog', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    })
    define('cable-spin', {
      key: 'cable-spin',
      frames: this.anims.generateFrameNumbers('cable', { start: 0, end: 1 }),
      frameRate: 6,
      repeat: -1,
    })
    define('wire-spark', {
      key: 'wire-spark',
      frames: this.anims.generateFrameNumbers('wire', { start: 0, end: 2 }),
      frameRate: 12,
      repeat: -1,
    })
    define('box-blink', {
      key: 'box-blink',
      frames: this.anims.generateFrameNumbers('box', { start: 0, end: 1 }),
      frameRate: 4,
      repeat: -1,
    })
  }
}
