import Phaser from 'phaser'
import { gameConfig } from './config/gameConfig.ts'
import { audio } from './systems/AudioSystem.ts'
import { bindTouchControls } from './systems/InputSystem.ts'
import './style.css'

function isPortraitMobile(): boolean {
  const portrait = window.matchMedia('(orientation: portrait)').matches
  const narrow = Math.min(window.innerWidth, window.innerHeight) < 900
  return portrait && narrow
}

function layoutViewport(): { width: number; height: number; left: number; top: number } {
  const vv = window.visualViewport
  const zoomed = vv != null && Math.abs(vv.scale - 1) > 0.02
  if (vv && !zoomed) {
    return {
      width: Math.round(vv.width),
      height: Math.round(vv.height),
      left: Math.round(vv.offsetLeft),
      top: Math.round(vv.offsetTop),
    }
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    left: 0,
    top: 0,
  }
}

function refreshScale(game: Phaser.Game): void {
  window.scrollTo(0, 0)
  const parent = document.getElementById('game-root')
  if (parent) {
    const box = layoutViewport()
    parent.style.width = `${box.width}px`
    parent.style.height = `${box.height}px`
    parent.style.left = `${box.left}px`
    parent.style.top = `${box.top}px`
  }
  game.scale.refresh()
}

function preventPageZoom(): void {
  const block = (event: Event) => event.preventDefault()
  document.addEventListener('gesturestart', block)
  document.addEventListener('gesturechange', block)
  document.addEventListener('gestureend', block)
  document.addEventListener(
    'touchmove',
    (event) => {
      if (event.touches.length > 1) event.preventDefault()
    },
    { passive: false },
  )
  let lastTouchEnd = 0
  document.addEventListener(
    'touchend',
    (event) => {
      const now = Date.now()
      if (now - lastTouchEnd < 350) event.preventDefault()
      lastTouchEnd = now
    },
    { passive: false },
  )
}

function syncOrientation(game: Phaser.Game): void {
  const overlay = document.getElementById('rotate-overlay')
  if (!overlay) return
  const portrait = isPortraitMobile()
  overlay.hidden = !portrait
  if (portrait) game.pause()
  else if (game.isPaused) game.resume()
  requestAnimationFrame(() => {
    refreshScale(game)
    requestAnimationFrame(() => refreshScale(game))
  })
}

preventPageZoom()
const game = new Phaser.Game(gameConfig)
bindTouchControls()
syncOrientation(game)

window.addEventListener('resize', () => syncOrientation(game))
window.addEventListener('orientationchange', () => {
  syncOrientation(game)
  window.setTimeout(() => refreshScale(game), 250)
})
window.visualViewport?.addEventListener('resize', () => refreshScale(game))
window.visualViewport?.addEventListener('scroll', () => {
  window.scrollTo(0, 0)
  refreshScale(game)
})
document.addEventListener('pointerdown', () => audio.resume(), { once: true })
document.addEventListener('keydown', () => audio.resume(), { once: true })
