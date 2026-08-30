import Phaser from 'phaser'

export type GameInputState = {
  left: boolean
  right: boolean
  jump: boolean
  jumpPressed: boolean
}

const touch = {
  left: false,
  right: false,
  jump: false,
  jumpQueued: false,
}

function bindHold(el: HTMLElement | null, key: 'left' | 'right' | 'jump'): void {
  if (!el) return

  const down = (event: Event) => {
    event.preventDefault()
    touch[key] = true
    if (key === 'jump') touch.jumpQueued = true
    el.classList.add('is-down')
  }
  const up = (event: Event) => {
    event.preventDefault()
    touch[key] = false
    el.classList.remove('is-down')
  }

  el.addEventListener('pointerdown', down)
  el.addEventListener('pointerup', up)
  el.addEventListener('pointerleave', up)
  el.addEventListener('pointercancel', up)
  el.addEventListener('contextmenu', (event) => event.preventDefault())
}

export function bindTouchControls(): void {
  bindHold(document.getElementById('btn-left'), 'left')
  bindHold(document.getElementById('btn-right'), 'right')
  bindHold(document.getElementById('btn-jump'), 'jump')
}

export class InputSystem {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined
  private wasd:
    | {
        A: Phaser.Input.Keyboard.Key
        D: Phaser.Input.Keyboard.Key
        W: Phaser.Input.Keyboard.Key
        space: Phaser.Input.Keyboard.Key
      }
    | undefined
  private jumpWasDown = false

  attach(scene: Phaser.Scene): void {
    this.cursors = scene.input.keyboard?.createCursorKeys()
    const keyboard = scene.input.keyboard
    if (!keyboard) return
    this.wasd = {
      A: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      D: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      W: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      space: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    }
  }

  sample(): GameInputState {
    const left =
      touch.left ||
      Boolean(this.cursors?.left.isDown) ||
      Boolean(this.wasd?.A.isDown)
    const right =
      touch.right ||
      Boolean(this.cursors?.right.isDown) ||
      Boolean(this.wasd?.D.isDown)
    const jump =
      touch.jump ||
      Boolean(this.cursors?.up.isDown) ||
      Boolean(this.wasd?.W.isDown) ||
      Boolean(this.wasd?.space.isDown)
    const jumpPressed = (jump && !this.jumpWasDown) || touch.jumpQueued
    touch.jumpQueued = false
    this.jumpWasDown = jump || jumpPressed
    return { left, right, jump: jump || jumpPressed, jumpPressed }
  }
}
