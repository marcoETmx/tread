export const GAME_WIDTH = 1280
export const GAME_HEIGHT = 720

export const TILE_SIZE = 32

export const PLAYER = {
  speed: 260,
  airSpeed: 250,
  jumpVelocity: -660,
  gravity: 1600,
  maxFall: 980,
  coyoteMs: 110,
  jumpBufferMs: 130,
  jumpCut: 0.5,
  /** Taps shorter than this count as a full jump (mobile tap-to-jump). */
  jumpTapMs: 200,
  invulnMs: 1200,
} as const

export const INSTALL = {
  requiredCables: 8,
  totalCables: 12,
  durationMs: 1600,
} as const

export const LIVES_START = 3

/** Screen juice — no combat, just Metal Slug-style feedback. */
export const JUICE = {
  hurtStunMs: 420,
  deathHoldMs: 780,
  shakeHurtMs: 300,
  shakeHurtIntensity: 0.014,
  shakeLandMs: 70,
  shakeLandIntensity: 0.003,
  dustRunMs: 72,
  knockbackX: 160,
  knockbackY: -140,
} as const

export const SceneKey = {
  Boot: 'BootScene',
  Preload: 'PreloadScene',
  Menu: 'MenuScene',
  Play: 'PlayScene',
  Hud: 'HudScene',
  Win: 'WinScene',
  Fail: 'FailScene',
} as const

export const RegistryKey = {
  cables: 'cables',
  lives: 'lives',
  score: 'score',
  elapsedMs: 'elapsedMs',
  checkpoints: 'checkpointX',
} as const
