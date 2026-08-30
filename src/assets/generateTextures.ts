type Palette = Record<string, string>

function canvas(width: number, height: number): {
  el: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
} {
  const el = document.createElement('canvas')
  el.width = width
  el.height = height
  const ctx = el.getContext('2d')
  if (!ctx) throw new Error('No 2D context')
  ctx.imageSmoothingEnabled = false
  return { el, ctx }
}

function blit(
  ctx: CanvasRenderingContext2D,
  pixels: readonly string[],
  palette: Palette,
  scale: number,
  dx: number,
  dy: number,
): void {
  for (let y = 0; y < pixels.length; y += 1) {
    const row = pixels[y]
    if (!row) continue
    for (let x = 0; x < row.length; x += 1) {
      const ch = row[x]
      if (!ch || ch === '.') continue
      const color = palette[ch]
      if (!color) continue
      ctx.fillStyle = color
      ctx.fillRect(dx + x * scale, dy + y * scale, scale, scale)
    }
  }
}

function rect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
): void {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

const PAL = {
  C: '#051D2E',
  O: '#FF7420',
  o: '#FFBE98',
  K: '#C9B896',
  k: '#A89068',
  D: '#3D5A80',
  d: '#2A4060',
  R: '#C4451C',
  r: '#8B2E12',
  S: '#E8B896',
  s: '#C49272',
  W: '#F4F7FA',
  B: '#1A1A1A',
  N: '#0049FC',
  F: '#CBE9F2',
  A: '#2B3540',
  G: '#8B93A0',
  g: '#6E7684',
  M: '#4A5D78',
  m: '#33445C',
  Y: '#FFD27A',
  X: '#FF3B3B',
  P: '#6B4A2B',
  p: '#4A321C',
} satisfies Palette

function playerFrame(legs: readonly string[]): string[] {
  return [
    '......CCCC......',
    '.....CCCCCC.....',
    '.....CCOOCC.....',
    '....CRRSSRC.....',
    '....CSSSSSC.....',
    '.....SsSSsS.....',
    '.....SSSSSS.....',
    '......sSSs......',
    '.....KKKKKK.....',
    '....KKWWKKKK....',
    '....KKKKOKKK....',
    '...kKKKKKKKKk...',
    '...kKKKKKKKKk...',
    '....KKKKKKKK....',
    '.....kKDDKk.....',
    ...legs,
    '................',
    '................',
  ]
}

const PLAYER_IDLE = playerFrame([
  '.....DDDDDD.....',
  '.....DD..DD.....',
  '.....Dd..Dd.....',
  '.....DD..DD.....',
  '.....DD..DD.....',
  '.....BB..BB.....',
  '.....BB..BB.....',
])

const PLAYER_WALK_A = playerFrame([
  '.....DDDDDD.....',
  '....DD....DD....',
  '....Dd....Dd....',
  '...DD......DD...',
  '..DD........DD..',
  '..BB........BB..',
  '..BB........BB..',
])

const PLAYER_WALK_B = playerFrame([
  '.....DDDDDD.....',
  '.....DD..DD.....',
  '.....Dd..Dd.....',
  '.....DD..DD.....',
  '.....DD..DD.....',
  '.....BB..BB.....',
  '.....BB..BB.....',
])

const PLAYER_WALK_C = playerFrame([
  '.....DDDDDD.....',
  '....DD....DD....',
  '...Dd......dD...',
  '..DD........DD..',
  '.DD..........DD.',
  '.BB..........BB.',
  '.BB..........BB.',
])

const PLAYER_JUMP = playerFrame([
  '.....DDDDDD.....',
  '....DD....DD....',
  '...Dd......dD...',
  '..DD........DD..',
  '..DD........DD..',
  '..BB........BB..',
  '..BB........BB..',
])

const PLAYER_FALL = playerFrame([
  '.....DDDDDD.....',
  '.....D....D.....',
  '.....D....D.....',
  '....DD....DD....',
  '....DD....DD....',
  '....BB....BB....',
  '....BB....BB....',
])

const PLAYER_INSTALL = [
  '......CCCC......',
  '.....CCCCCC.....',
  '.....CCOOCC.....',
  '....CRRSSRC.....',
  '....CSSSSSC.....',
  '.....SSSSSS.....',
  '......sSSs......',
  '.....KKKKKK.....',
  '....KKWWKKKK....',
  '...kKKKKOKKKk...',
  '...kKKKKKKKKk...',
  '....KKKKKKKK....',
  '....OOOOOOOO....',
  '.....kKDDKk.....',
  '....DDDDDDDD....',
  '....DD....DD....',
  '....DD....DD....',
  '...DD......DD...',
  '...BB......BB...',
  '...BB......BB...',
  '................',
  '................',
  '................',
  '................',
]

const DOG_A = [
  '................',
  '..rr............',
  '.rRRrr....rr....',
  'rRRRRRrrrrRRr...',
  '.RRRRRRRRRRR....',
  '..BB.RRRR.BB....',
  '..BB......BB....',
  '................',
]

const DOG_B = [
  '................',
  '..rr............',
  '.rRRrr....rr....',
  'rRRRRRrrrrRRr...',
  '.RRRRRRRRRRR....',
  '.BB..RRRR..BB...',
  'BB........BB....',
  '................',
]

const CABLE = [
  '....OOOO....',
  '..OOooooOO..',
  '.OOoCNNNoOO.',
  '.OoCNWWCNoO.',
  'OOoCWWWWCoOO',
  'OoCNWooWNCoO',
  'OoCNWooWNCoO',
  'OOoCWWWWCoOO',
  '.OoCNWWCNoO.',
  '.OOoCNNNoOO.',
  '..OOooooOO..',
  '....OOOO....',
]

const VAN = [
  '........................',
  '.........CCCCCCCCCCC....',
  '.......CCCCCCCCCCCCCCC..',
  '......CCNNNNNNNNNNNCCC..',
  '......CCNYYYYYYYYYNCCC..',
  '.....CCCNYYYYYYYYYNCCCC.',
  '.....CCCCCCCCCCCCCCCCCC.',
  '....CCOOOOOOOOOOOOOOCCC.',
  '....CCCCCCCCCCCCCCCCCCC.',
  '...CCCCCCCCCCCCCCCCCCCC.',
  '...CC..........CC....CC.',
  '...C............C....C..',
  '..CCC..........CCC..CCC.',
  '.CBBBC........CBBBCBBBC.',
  '.CBWBC........CBWBCBWBC.',
  '.CBBBC........CBBBCBBBC.',
  '..CCC..........CCC..CCC.',
]

const HOUSE = [
  '...............................',
  '..............mmmmm.............',
  '.............mMMMMMm............',
  '............mMMCCMMMm...........',
  '...........mMMCCCCMMMm..........',
  '..........mMMMCCCCMMMmm.........',
  '.........mmMMMMMMMMMMmmm........',
  '........mmmmmmmmmmmmmmmmm.......',
  '........mMMMMMMMMMMMMMMMm.......',
  '........mMMYYYYMMYYYYMMMm.......',
  '........mMMYYYYMMYYYYMMMm.......',
  '........mMMMMMMMMMMMMMMMm.......',
  '........mMMYYYYMMYYYYMMMm.......',
  '........mMMYYYYMMYYYYMMMm.......',
  '........mMMMMMMMMMMMMMMMm.......',
  '........mMMYYYYMMPPPMMMMm.......',
  '........mMMYYYYMMpPpMMMMm.......',
  '........mMMMMMMMMpPpMMMMm.......',
  '........mMMMMMMMMPPMMMMMm.......',
  '........mmmmmmmmmmmmmmmmm.......',
]

const BOX = [
  '....OOOOOO....',
  '...OCCCCCCO...',
  '..OCNNNNNNCO..',
  '..OCNYYYYNCO..',
  '..OCNYYYYNCO..',
  '..OCNNNNNNCO..',
  '...OCCCCCCO...',
  '....OOOOOO....',
  '......CC......',
  '......CC......',
]

const CONE = [
  '....OO....',
  '...OWWO...',
  '...OOOO...',
  '..OWWWWO..',
  '..OOOOOO..',
  '.OWWWWWWO.',
  '.OOOOOOOO.',
  'WWWWWWWWWW',
]

const WIRE = [
  'C.............',
  'CCC...........',
  '..XXX.........',
  '...XXXX.......',
  '.....XXXX.....',
  '.......XXXX...',
  '.........XXX..',
  '..........XXC.',
  '...........CC.',
  '............C.',
]

const WINDOW = [
  'CCCCCC',
  'CYYYYC',
  'CYYYYC',
  'CYYYYC',
  'CCCCCC',
]

function drawTileset(): HTMLCanvasElement {
  const size = 32
  const { el, ctx } = canvas(size * 7, size)

  // 0 empty
  // 1 ground
  rect(ctx, size, 0, size, 8, PAL.G)
  rect(ctx, size, 8, size, 4, PAL.O)
  rect(ctx, size, 12, size, 20, PAL.A)
  for (let i = 0; i < 8; i += 1) {
    rect(ctx, size + 4 + i * 4, 2, 2, 2, PAL.g)
  }

  // 2 fill
  rect(ctx, size * 2, 0, size, size, PAL.A)
  for (let i = 0; i < 6; i += 1) {
    rect(ctx, size * 2 + (i % 3) * 10 + 2, 6 + Math.floor(i / 3) * 12, 6, 2, '#232C36')
  }

  // 3 brick
  rect(ctx, size * 3, 0, size, size, PAL.M)
  for (let row = 0; row < 4; row += 1) {
    const offset = row % 2 === 0 ? 0 : 8
    for (let col = 0; col < 3; col += 1) {
      rect(ctx, size * 3 + offset + col * 12, row * 8 + 1, 10, 6, PAL.m)
    }
  }

  // 4 roof
  rect(ctx, size * 4, 0, size, size, PAL.C)
  for (let i = 0; i < 4; i += 1) {
    rect(ctx, size * 4, i * 8, size, 3, PAL.N)
  }
  rect(ctx, size * 4, 0, size, 4, PAL.O)

  // 5 platform
  rect(ctx, size * 5, 0, size, 10, PAL.g)
  rect(ctx, size * 5, 10, size, 6, PAL.C)
  rect(ctx, size * 5 + 2, 2, size - 4, 4, PAL.N)

  // 6 crate
  rect(ctx, size * 6, 4, size, 28, PAL.k)
  ctx.strokeStyle = PAL.K
  ctx.lineWidth = 2
  ctx.strokeRect(size * 6 + 3, 7, size - 6, 22)
  rect(ctx, size * 6 + 8, 14, 16, 4, PAL.O)

  return el
}

function sheet(
  frames: readonly (readonly string[])[],
  scale: number,
): HTMLCanvasElement {
  const frameH = frames[0]?.length ?? 0
  const frameW = frames[0]?.[0]?.length ?? 0
  const { el, ctx } = canvas(frameW * scale * frames.length, frameH * scale)
  frames.forEach((frame, i) => {
    blit(ctx, frame, PAL, scale, i * frameW * scale, 0)
  })
  return el
}

const SKYLINE_WIDTH = 1280
const SKYLINE_HEIGHT = 260

type NearBuilding = {
  x: number
  w: number
  h: number
  kind: 'block' | 'tower' | 'step' | 'spire' | 'antenna' | 'wide' | 'factory'
  windowGapX: number
  windowGapY: number
  lit: number
}

function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

function drawWindows(
  ctx: CanvasRenderingContext2D,
  x: number,
  top: number,
  w: number,
  h: number,
  color: string,
  lit: number,
  gapX: number,
  gapY: number,
  seed: number,
): void {
  const rng = seededRandom(seed)
  ctx.fillStyle = color
  const inset = 5
  const winW = gapX >= 10 ? 5 : 3
  const winH = gapY >= 12 ? 6 : 4
  for (let wy = top + 8; wy < top + h - 16; wy += gapY) {
    for (let wx = x + inset; wx < x + w - inset - winW; wx += gapX) {
      if (rng() < lit) ctx.fillRect(wx, wy, winW, winH)
    }
  }
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  building: NearBuilding,
  canvasHeight: number,
  body: string,
  windows: string,
): void {
  const top = canvasHeight - building.h
  ctx.fillStyle = body
  ctx.fillRect(building.x, top, building.w, building.h)

  if (building.kind === 'step') {
    const stepW = Math.floor(building.w * 0.58)
    const stepH = 22
    ctx.fillRect(building.x + Math.floor((building.w - stepW) / 2), top - stepH, stepW, stepH)
  }

  if (building.kind === 'tower' || building.kind === 'antenna') {
    ctx.fillRect(building.x + Math.floor(building.w / 2) - 1, top - 26, 3, 26)
    ctx.fillRect(building.x + Math.floor(building.w / 2) - 6, top - 22, 12, 3)
  }

  if (building.kind === 'spire') {
    const mid = building.x + Math.floor(building.w / 2)
    ctx.beginPath()
    ctx.moveTo(building.x + 6, top)
    ctx.lineTo(mid, top - 34)
    ctx.lineTo(building.x + building.w - 6, top)
    ctx.closePath()
    ctx.fill()
  }

  if (building.kind === 'factory') {
    ctx.fillRect(building.x + 10, top - 28, 10, 28)
    ctx.fillRect(building.x + 28, top - 18, 8, 18)
    ctx.fillRect(building.x + building.w - 22, top - 36, 12, 36)
  }

  drawWindows(
    ctx,
    building.x,
    top,
    building.w,
    building.h,
    windows,
    building.lit,
    building.windowGapX,
    building.windowGapY,
    0x9a00 + building.x * 17 + building.w,
  )
}

function skyTexture(): HTMLCanvasElement {
  const { el, ctx } = canvas(160, 90)
  const gradient = ctx.createLinearGradient(0, 0, 0, 90)
  gradient.addColorStop(0, '#0049FC')
  gradient.addColorStop(0.55, '#3E7CFF')
  gradient.addColorStop(1, '#CBE9F2')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 160, 90)
  return el
}

function skylineTexture(): HTMLCanvasElement {
  const width = SKYLINE_WIDTH
  const height = SKYLINE_HEIGHT
  const { el, ctx } = canvas(width, height)
  ctx.clearRect(0, 0, width, height)

  const far = [
    [0, 90, 70],
    [86, 54, 110],
    [136, 120, 64],
    [248, 40, 150],
    [284, 72, 88],
    [352, 160, 52],
    [508, 48, 170],
    [552, 96, 78],
    [644, 70, 124],
    [710, 130, 60],
    [836, 44, 96],
    [876, 88, 140],
    [960, 50, 72],
    [1006, 110, 100],
    [1110, 66, 58],
    [1170, 80, 132],
    [1244, 50, 84],
  ] as const

  ctx.fillStyle = '#3A6280'
  for (const [x, w, h] of far) {
    ctx.fillRect(x, height - h, w, h)
  }

  const near: NearBuilding[] = [
    { x: -6, w: 78, h: 92, kind: 'block', windowGapX: 9, windowGapY: 11, lit: 0.7 },
    { x: 68, w: 36, h: 148, kind: 'tower', windowGapX: 8, windowGapY: 10, lit: 0.85 },
    { x: 102, w: 94, h: 70, kind: 'wide', windowGapX: 12, windowGapY: 14, lit: 0.45 },
    { x: 188, w: 50, h: 118, kind: 'step', windowGapX: 9, windowGapY: 12, lit: 0.6 },
    { x: 234, w: 28, h: 196, kind: 'antenna', windowGapX: 8, windowGapY: 9, lit: 0.9 },
    { x: 260, w: 72, h: 84, kind: 'block', windowGapX: 10, windowGapY: 11, lit: 0.55 },
    { x: 328, w: 110, h: 64, kind: 'factory', windowGapX: 14, windowGapY: 16, lit: 0.35 },
    { x: 430, w: 44, h: 132, kind: 'spire', windowGapX: 9, windowGapY: 11, lit: 0.75 },
    { x: 470, w: 86, h: 100, kind: 'block', windowGapX: 11, windowGapY: 13, lit: 0.5 },
    { x: 548, w: 32, h: 168, kind: 'tower', windowGapX: 8, windowGapY: 10, lit: 0.8 },
    { x: 576, w: 120, h: 76, kind: 'wide', windowGapX: 13, windowGapY: 12, lit: 0.4 },
    { x: 688, w: 40, h: 210, kind: 'antenna', windowGapX: 8, windowGapY: 9, lit: 0.88 },
    { x: 724, w: 68, h: 112, kind: 'step', windowGapX: 10, windowGapY: 11, lit: 0.62 },
    { x: 788, w: 54, h: 90, kind: 'block', windowGapX: 9, windowGapY: 12, lit: 0.58 },
    { x: 836, w: 98, h: 58, kind: 'factory', windowGapX: 15, windowGapY: 14, lit: 0.3 },
    { x: 926, w: 46, h: 154, kind: 'spire', windowGapX: 9, windowGapY: 10, lit: 0.72 },
    { x: 968, w: 80, h: 96, kind: 'block', windowGapX: 11, windowGapY: 12, lit: 0.52 },
    { x: 1042, w: 34, h: 178, kind: 'tower', windowGapX: 8, windowGapY: 9, lit: 0.84 },
    { x: 1072, w: 74, h: 82, kind: 'step', windowGapX: 10, windowGapY: 13, lit: 0.48 },
    { x: 1140, w: 58, h: 124, kind: 'block', windowGapX: 9, windowGapY: 11, lit: 0.66 },
    { x: 1194, w: 92, h: 68, kind: 'wide', windowGapX: 12, windowGapY: 15, lit: 0.42 },
  ]

  for (const building of near) {
    drawBuilding(ctx, building, height, '#051D2E', '#FFD27A')
  }

  ctx.fillStyle = '#0B2838'
  ctx.fillRect(0, height - 12, width, 12)
  return el
}

function particle(): HTMLCanvasElement {
  const { el, ctx } = canvas(8, 8)
  rect(ctx, 2, 2, 4, 4, PAL.O)
  return el
}

function heart(): HTMLCanvasElement {
  const { el, ctx } = canvas(16, 16)
  blit(
    ctx,
    ['..X.X..', '.XXXXX.', '.XXXXX.', '..XXX..', '...X...'],
    PAL,
    2,
    1,
    2,
  )
  return el
}

export function createGeneratedCanvases(): Record<string, HTMLCanvasElement> {
  return {
    tiles: drawTileset(),
    player: sheet(
      [PLAYER_IDLE, PLAYER_WALK_A, PLAYER_WALK_B, PLAYER_WALK_C, PLAYER_JUMP, PLAYER_FALL, PLAYER_INSTALL],
      3,
    ),
    dog: sheet([DOG_A, DOG_B], 3),
    cable: sheet([CABLE], 3),
    van: sheet([VAN], 3),
    house: sheet([HOUSE], 3),
    box: sheet([BOX], 3),
    cone: sheet([CONE], 3),
    wire: sheet([WIRE], 3),
    window: sheet([WINDOW], 3),
    sky: skyTexture(),
    skyline: skylineTexture(),
    spark: particle(),
    heart: heart(),
  }
}

export const PLAYER_FRAME = { width: 48, height: 72 }
export const DOG_FRAME = { width: 48, height: 24 }
