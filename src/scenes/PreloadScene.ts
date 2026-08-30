import Phaser from 'phaser'
import {
  createGeneratedCanvases,
  DOG_FRAME,
  PLAYER_FRAME,
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
    this.load.image('tiles', canvases.tiles.toDataURL())
    this.load.image('cable', canvases.cable.toDataURL())
    this.load.image('van', canvases.van.toDataURL())
    this.load.image('house', canvases.house.toDataURL())
    this.load.image('box', canvases.box.toDataURL())
    this.load.image('cone', canvases.cone.toDataURL())
    this.load.image('wire', canvases.wire.toDataURL())
    this.load.image('window', canvases.window.toDataURL())
    this.load.image('sky', canvases.sky.toDataURL())
    const skyline = this.textures.addCanvas('skyline', canvases.skyline)
    skyline?.setWrap(Phaser.Textures.WrapMode.CLAMP_TO_EDGE, Phaser.Textures.WrapMode.CLAMP_TO_EDGE)
    this.load.image('spark', canvases.spark.toDataURL())
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
      frames: [{ key: 'player', frame: 0 }],
      frameRate: 1,
    })
    define('player-walk', {
      key: 'player-walk',
      frames: this.anims.generateFrameNumbers('player', { start: 1, end: 3 }),
      frameRate: 10,
      repeat: -1,
    })
    define('player-jump', {
      key: 'player-jump',
      frames: [{ key: 'player', frame: 4 }],
      frameRate: 1,
    })
    define('player-fall', {
      key: 'player-fall',
      frames: [{ key: 'player', frame: 5 }],
      frameRate: 1,
    })
    define('player-install', {
      key: 'player-install',
      frames: [{ key: 'player', frame: 6 }],
      frameRate: 1,
    })
    define('dog-run', {
      key: 'dog-run',
      frames: this.anims.generateFrameNumbers('dog', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    })
  }
}
