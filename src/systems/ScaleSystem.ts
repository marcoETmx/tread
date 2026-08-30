import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../config/constants.ts'

function viewportSize(): { width: number; height: number } {
  const vv = window.visualViewport
  let width = Math.max(window.innerWidth, document.documentElement.clientWidth, 1)
  let height = Math.max(window.innerHeight, document.documentElement.clientHeight, 1)
  if (vv && Math.abs(vv.scale - 1) < 0.05) {
    width = Math.max(width, Math.round(vv.width))
    height = Math.max(height, Math.round(vv.height))
  }
  const landscape = window.matchMedia('(orientation: landscape)').matches
  if (landscape && height > width) {
    const swapped = width
    width = height
    height = swapped
  }
  return { width, height }
}

function sizeFrame(): { width: number; height: number } {
  const { width, height } = viewportSize()
  const scale = Math.min(width / GAME_WIDTH, height / GAME_HEIGHT)
  const frameW = Math.max(1, Math.round(GAME_WIDTH * scale))
  const frameH = Math.max(1, Math.round(GAME_HEIGHT * scale))

  const root = document.getElementById('game-root')
  if (root) {
    root.style.width = `${width}px`
    root.style.height = `${height}px`
  }

  const frame = document.getElementById('game-frame')
  if (frame) {
    frame.style.width = `${frameW}px`
    frame.style.height = `${frameH}px`
  }

  return { width: frameW, height: frameH }
}

function paintCanvas(game: Phaser.Game, frameW: number, frameH: number): void {
  const canvas = game.canvas
  if (!canvas) return
  canvas.style.setProperty('width', `${frameW}px`, 'important')
  canvas.style.setProperty('height', `${frameH}px`, 'important')
  canvas.style.setProperty('max-width', '100%', 'important')
  canvas.style.setProperty('max-height', '100%', 'important')
  canvas.style.margin = '0'
  canvas.style.position = 'absolute'
  canvas.style.left = '0'
  canvas.style.top = '0'
}

export function applyDisplayFit(game: Phaser.Game): void {
  window.scrollTo(0, 0)
  const frame = sizeFrame()
  game.scale.setParentSize(frame.width, frame.height)
  game.scale.refresh()
  paintCanvas(game, frame.width, frame.height)
}

export function bindDisplayFit(game: Phaser.Game): void {
  const fit = () => applyDisplayFit(game)
  game.events.once(Phaser.Core.Events.READY, fit)
  window.addEventListener('resize', fit)
  window.addEventListener('orientationchange', () => {
    fit()
    window.setTimeout(fit, 80)
    window.setTimeout(fit, 280)
  })
  window.visualViewport?.addEventListener('resize', fit)
  window.visualViewport?.addEventListener('scroll', fit)
  game.scale.on(Phaser.Scale.Events.RESIZE, () => {
    const frame = document.getElementById('game-frame')
    if (!frame) return
    paintCanvas(game, frame.clientWidth, frame.clientHeight)
  })
}
