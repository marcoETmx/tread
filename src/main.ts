import Phaser from 'phaser'
import { gameConfig } from './config/gameConfig.ts'
import { audio } from './systems/AudioSystem.ts'
import { bindTouchControls } from './systems/InputSystem.ts'
import { applyDisplayFit, bindDisplayFit } from './systems/ScaleSystem.ts'
import './style.css'

function isPortraitMobile(): boolean {
  const portrait = window.matchMedia('(orientation: portrait)').matches
  const narrow = Math.min(window.innerWidth, window.innerHeight) < 900
  return portrait && narrow
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
    applyDisplayFit(game)
    requestAnimationFrame(() => applyDisplayFit(game))
  })
}

preventPageZoom()
const game = new Phaser.Game(gameConfig)
bindTouchControls()
bindDisplayFit(game)
syncOrientation(game)

window.addEventListener('resize', () => syncOrientation(game))
window.addEventListener('orientationchange', () => {
  syncOrientation(game)
})
document.addEventListener('pointerdown', () => audio.resume(), { once: true })
document.addEventListener('keydown', () => audio.resume(), { once: true })
