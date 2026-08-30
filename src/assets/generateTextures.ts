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
  const { el, ctx } = canvas(320, 90)
  ctx.fillStyle = '#051D2E'
  const blocks = [
    [0, 48, 28],
    [24, 32, 36],
    [52, 40, 30],
    [78, 22, 42],
    [108, 50, 26],
    [132, 28, 38],
    [160, 44, 28],
    [188, 18, 46],
    [214, 38, 32],
    [248, 52, 24],
    [276, 26, 40],
    [300, 46, 28],
  ] as const
  for (const [x, top, w] of blocks) {
    ctx.fillRect(x, top, w, 90 - top)
    ctx.fillStyle = '#FFD27A'
    for (let wx = x + 4; wx < x + w - 4; wx += 8) {
      for (let wy = top + 6; wy < 80; wy += 10) {
        if ((wx + wy) % 5 !== 0) ctx.fillRect(wx, wy, 4, 5)
      }
    }
    ctx.fillStyle = '#051D2E'
  }
  ctx.fillStyle = '#0B2838'
  ctx.fillRect(0, 82, 320, 8)
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
