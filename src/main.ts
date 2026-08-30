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

function refreshScale(game: Phaser.Game): void {
  const parent = document.getElementById('game-root')
  if (parent) {
    parent.style.width = `${window.innerWidth}px`
    parent.style.height = `${window.innerHeight}px`
  }
  game.scale.refresh()
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

const game = new Phaser.Game(gameConfig)
bindTouchControls()
syncOrientation(game)

window.addEventListener('resize', () => syncOrientation(game))
window.addEventListener('orientationchange', () => {
  syncOrientation(game)
  window.setTimeout(() => refreshScale(game), 250)
})
window.visualViewport?.addEventListener('resize', () => refreshScale(game))
document.addEventListener('pointerdown', () => audio.resume(), { once: true })
document.addEventListener('keydown', () => audio.resume(), { once: true })
