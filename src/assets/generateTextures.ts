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
  I: '#07080A',
  U: '#B5522A',
  E: '#D4A574',
  L: '#6B7A3A',
  H: '#1A2228',
  T: '#3A3228',
  Q: '#F0C878',
  q: '#C48A32',
  e: '#FFF3C4',
  V: '#6A160C',
  l: '#3E4A1C',
  n: '#8FA34C',
  z: '#A86C50',
  b: '#454038',
  w: '#C8D0D8',
} satisfies Palette

const PW = 48
const PH = 64

function pr(s: string): string {
  if (s.length > PW) throw new Error(`player row ${s.length}: ${s}`)
  return s.padEnd(PW, '.')
}

function shiftRow(row: string, n: number): string {
  const padded = pr(row)
  if (n > 0) return `${'.'.repeat(n)}${padded.slice(0, PW - n)}`
  if (n < 0) return `${padded.slice(-n)}${'.'.repeat(-n)}`.slice(0, PW)
  return padded
}

function mergeRow(a: string, b: string): string {
  const left = pr(a).split('')
  const right = pr(b)
  for (let i = 0; i < PW; i += 1) {
    const ch = right[i]
    if (ch && ch !== '.') left[i] = ch
  }
  return left.join('')
}

function mergeRows(base: readonly string[], overlay: readonly string[]): string[] {
  const height = Math.max(base.length, overlay.length)
  const out: string[] = []
  for (let y = 0; y < height; y += 1) {
    out.push(mergeRow(base[y] ?? '', overlay[y] ?? ''))
  }
  return out
}

type Arm = 'down' | 'fwd' | 'back' | 'up' | 'out'

function headRows(lean: number): string[] {
  return [
    '........IIIIIIIIIIIIII..............',
    '......ICeeeeeeeeeeeeCCI.............',
    '.....ICqeQQQQQQQQQQeeCI.............',
    '....ICQqeeQQQQQQQQeqQCI.............',
    '....ICQqWWWWWWWWWWQqQCI.............',
    '..IIICQqWwWWWWWWWwQqQCI.............',
    '.IWWICQqWIIIIIIIIWQqQCI.............',
    '.IwWICQqSSSSSSSSSSqQCI..............',
    '..IIICRqSBBWWBBSSSqCI...............',
    '....ICRSsssSzzSSSSICI...............',
    '.....ICSSSSSSsssSSCI................',
    '......IssSSSSsssSI..................',
    '.......ISSSSSSSI....................',
    '........IsssssI.....................',
    '......IIRRRRRRRII...................',
    '.....IRRRRRRRRRRRI..................',
    '....IRRWWWWRRRRRRRI.................',
    '....IRRRRRRRRRRRRRrI................',
    '...IrRRRRRRRRRRRRRRI................',
    '....IRRRRRRRRRRRRRRI................',
    '....IRRrRRRRRRRRRRRI................',
    '.....IRRRRRRRRRRRRI.................',
  ].map((row) => shiftRow(row, lean))
}

function packRows(): string[] {
  return [
    'II',
    'IOI',
    'IIOOII',
    'IOoOoOI',
    'IOOOYOI',
    'IOoOoOI',
    'IOOOOOI',
    'IOoOoOI',
    'IOOOI',
    'IOI',
    'I',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ].map(pr)
}

function vestRows(lean: number): string[] {
  return [
    '....IRRRRRRRRRRRRRI.................',
    '...IRRRWWWWRRRRRRRRI................',
    '...IRRRRRRRRRRRRRRRrI...............',
    '..IrRRRRRRRRRRRRRRRRI...............',
    '...IRRRRRrRRRRRRRRRRI...............',
    '...IRRWWWWWRRRRRRRRRI...............',
    '...IRRRRRRRRRRRRRRRRI...............',
    '...IRRRRrOOOOOORRRRI................',
    '...IRRRRRrQrRRRRRRRI................',
    '....IRRRRRRRRRRRRRI.................',
    '....IRrRRRRRRRRRRI..................',
    '.....IRRRRRRRRRRI...................',
    '.....IrLLLLLLRRRI...................',
    '......InLnLnLnRI....................',
    '......ILLlLLLlI.....................',
    '......ILLIILLLI.....................',
    '.......ILLLLLI......................',
    '.......ITTTI.......................',
  ].map((row) => shiftRow(row, lean))
}

function armRows(arm: Arm): string[] {
  if (arm === 'fwd') {
    return [
      '',
      '.........................ISSSSI',
      '........................ISSSSSI',
      '.......................ISSSSSSI',
      '.......................ISSSSSSzI',
      '........................ISSSSsI',
      '.........................ISSsI',
      '..........................IsI',
      '...........................I',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ].map(pr)
  }
  if (arm === 'back') {
    return [
      '',
      '.ISSSI',
      'ISSSSSI',
      'ISSSSSI',
      '.ISSSsI',
      '..ISsI',
      '...IsI',
      '....I',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ].map(pr)
  }
  if (arm === 'up') {
    return [
      '.........................ISSSSI',
      '.........................ISSSSI',
      '.........................ISSSSI',
      '.........................ISSSsI',
      '..........................ISSI',
      '...........................II',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ].map(pr)
  }
  if (arm === 'out') {
    return [
      '',
      'ISSSI...................ISSSSI',
      'ISSSSI.................ISSSSSI',
      'ISSSsI.................ISSSsI',
      '.ISsI...................ISsI',
      '..IsI....................IsI',
      '...I......................I',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ].map(pr)
  }
  return [
    '',
    '.ISSSI',
    '.ISSSSI',
    '.ISSSSI',
    '.ISSSsI',
    '..ISSsI',
    '...ISsI',
    '....IsI',
    '.....I',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ].map(pr)
}

function torsoRows(lean: number, arm: Arm): string[] {
  return mergeRows(mergeRows(vestRows(lean), packRows()), armRows(arm))
}

function padLegs(rows: readonly string[]): string[] {
  const out = rows.map(pr)
  if (out.length > 24) throw new Error(`legs ${out.length}`)
  if (out.length === 24) return out
  const hip = out.slice(0, Math.min(4, out.length))
  const rest = out.slice(hip.length)
  const fill = hip[hip.length - 1] ?? pr('')
  while (hip.length + rest.length < 24) hip.push(fill)
  return [...hip, ...rest]
}

const LEGS_IDLE = padLegs([
  '.....InLLLLLLLLLnI..................',
  '.....ILLlLLnLnLLLI..................',
  '.....ILLLL..LLLLI...................',
  '.....InLL....LLLI...................',
  '.....ITLL....TLI....................',
  '.....ILLL....LLI....................',
  '.....ILnL....nLI....................',
  '.....ILLL....LLI....................',
  '.....IlLL....LLI....................',
  '.....ILLL....LLI....................',
  '....IBBbb....bbBBI..................',
  '....IBBBB....BBBBI..................',
  '....IBbBB....BBbBI..................',
  '....IBBB......BBBI..................',
  '....IIII......IIII..................',
])

const LEGS_IDLE_B = padLegs([
  '.....InLLLLLLLLLnI..................',
  '.....ILLlLLnLnLLLI..................',
  '.....ILLLL..LLLLI...................',
  '.....InLL....LLLI...................',
  '.....ITLL....TLI....................',
  '.....ILLL....LLI....................',
  '.....ILnL....nLI....................',
  '......ILL....LLI....................',
  '.....IlLL...LLI.....................',
  '.....ILLL...LLI.....................',
  '....IBBbb....bbBBI..................',
  '....IBBBB....BBBBI..................',
  '.....IBbBB...BBbBI..................',
  '.....IBBB....BBBI...................',
  '.....III.....IIII...................',
])

const LEGS_WALK: readonly string[][] = [
  padLegs([
    '.....InLLLLLLLLLnI..................',
    '..........ILLlL..nLLI..............',
    '.........ILLL......LI..............',
    '........ILnL........TI.............',
    '.......ILLT..........LI............',
    '......ILLL............LI...........',
    '.....ILL...............LI..........',
    '....IBBb...............bBBI........',
    '....IBBB...............BBBI........',
    '....IBbB...............BbBI........',
    '....IBB.................BBI........',
    '....III.................III........',
  ]),
  padLegs([
    '.....InLLLLLLLLLnI..................',
    '..........ILLlL..nLI...............',
    '.........ILLL.....LI...............',
    '........ILnL......TI...............',
    '.......ILLT........LI..............',
    '......ILLL..........LI.............',
    '.....ILL.............LI............',
    '....IBBb.............bBBI..........',
    '....IBBB.............BBBI..........',
    '.....IBbB............BbBI..........',
    '.....IBB.............BBI...........',
    '.....III.............III...........',
  ]),
  padLegs([
    '.....InLLLLLLLLLnI..................',
    '...........ILLlLnLI................',
    '...........ILL...LI................',
    '...........ITL...TI................',
    '...........ILL...LI................',
    '..........ILLL..nLLI...............',
    '..........ILL.....LI...............',
    '..........IBBb...bBBI..............',
    '..........IBBB...BBBI..............',
    '..........IBbB...BbBI..............',
    '..........IBB.....BBI..............',
    '..........III.....III..............',
  ]),
  padLegs([
    '.....InLLLLLLLLLnI..................',
    '..........ILI....ILI...............',
    '.........ILL.......LI..............',
    '........ILlT.......TI..............',
    '.......ILLL.........LI.............',
    '......ILL............LI............',
    '.....IBBb............bBBI..........',
    '.....IBBB............BBBI..........',
    '.....IBbB............BbBI..........',
    '.....IBB..............BBI..........',
    '.....III..............III..........',
  ]),
  padLegs([
    '.....InLLLLLLLLLnI..................',
    '...........ILLlLnLI................',
    '..........ILLl..nLLI...............',
    '..........ITL.....TI...............',
    '...........ILL....LI...............',
    '...........ILL....LI...............',
    '...........IBBb..bBBI..............',
    '...........IBBBBBBBBI..............',
    '...........IBbB..BbBI..............',
    '...........IBB....BBI..............',
    '...........III....III..............',
  ]),
  padLegs([
    '.....InLLLLLLLLLnI..................',
    '..........ILI....LI................',
    '.........ILLL.....LI...............',
    '........ILlT......TI...............',
    '.......ILLL........LI..............',
    '......ILL..........LI..............',
    '.....IBBb..........bBBI............',
    '.....IBBB..........BBBI............',
    '......IBbB.........BbBI............',
    '......IBB..........BBI.............',
    '......III..........III.............',
  ]),
]

const LEGS_JUMP = padLegs([
  '...........InLLLLLnI...............',
  '..........ILLlL..nLLI..............',
  '.........ILLL......LLI.............',
  '........ILnL........TI.............',
  '.......ILLT..........LI............',
  '.......ILL............LI...........',
  '......IBBb............bBBI.........',
  '......IBBB............BBBI.........',
  '......IBbB............BbBI.........',
  '......IBB..............BBI.........',
  '......III..............III.........',
])

const LEGS_FALL = padLegs([
  '...........IL....LI................',
  '..........ILL......LI..............',
  '.........ILL........LI.............',
  '........ILnL........TI.............',
  '.......ILLT..........LLI...........',
  '.......ILL............LI...........',
  '........IBBb........bBBI...........',
  '........IBBB........BBBI...........',
  '........IBbB........BbBI...........',
  '........IBB..........BBI...........',
  '........III..........III...........',
])

function playerFrame(legs: readonly string[], lean: number, arm: Arm): string[] {
  const rows = [...headRows(lean), ...torsoRows(lean, arm), ...legs]
  if (rows.length !== PH) throw new Error(`player height ${rows.length}`)
  return rows.map(pr)
}

const PLAYER_HURT = [
  ...headRows(2),
  ...torsoRows(2, 'out'),
  ...padLegs([
    '..........ILL........LLI...........',
    '.........IL...........LI...........',
    '........ILlT..........TI...........',
    '.......IBBb............bBBI........',
    '.......IBBB............BBBI........',
    '.......IBbB............BbBI........',
    '.......IBB..............BBI........',
    '.......III..............III........',
  ]),
].map(pr)

const PLAYER_INSTALL_A = playerFrame(
  padLegs([
    '.....InLLLLLLLLLnI..................',
    '..........ILLlL..nLLI..............',
    '..........ILL......LI..............',
    '.........ILL........LI.............',
    '.........IBBb......bBBI............',
    '.........IBBB......BBBI............',
    '.........IBbB......BbBI............',
    '.........IBB........BBI............',
    '.........III........III............',
  ]),
  0,
  'fwd',
).map((row, i) => (i >= 26 && i <= 40 ? mergeRow(row, '..............IOOOOOOI') : row))

const PLAYER_INSTALL_B = playerFrame(
  padLegs([
    '.....InLLLLLLLLLnI..................',
    '..........ILLlL..nLLI..............',
    '..........ILL......LI..............',
    '.........ILL........LI.............',
    '.........IBBb......bBBI............',
    '.........IBBB......BBBI............',
    '.........IBbB......BbBI............',
    '.........IBB........BBI............',
    '.........III........III............',
  ]),
  0,
  'fwd',
).map((row, i) => (i >= 26 && i <= 40 ? mergeRow(row, '..............IOYWWYOI') : row))

function dw(s: string, width: number): string {
  if (s.length > width) throw new Error(`row ${s.length}>${width}: ${s}`)
  return s.padEnd(width, '.')
}

const DOG_W = 48
const DOG_H = 24
const DOG_FRAMES = [
  [
    '.................IIpI...............',
    '................IpPPPI...........I..',
    '...............IpPkKKPI.........IpI.',
    '..............IpPPWWWWRIp......IpPpI',
    '.............IpPPBWWBPPIppppppIPPPI',
    '............IpPKsssPPPPPPPPPPPPPPPI',
    '...........IpPPPPPPPRRRRRRRRRRRRPI.',
    '...........I.PPPPWWWWRRRRRRRRRRPI..',
    '...........I.IPPPPPYRRRRRRR.IBBbI..',
    '...........I..IBBbI.PPPPPP..IBBbI..',
    '...........I..IBBBI.........IBBBI..',
    '...............IbI...........IbI...',
    '................I.............I....',
  ],
  [
    '.................IIpI...............',
    '................IpPPPI...........I..',
    '...............IpPkKKPI.........IpI.',
    '..............IpPPWWWWRIp......IpPpI',
    '.............IpPPBWWBPPIppppppIPPPI',
    '............IpPKsssPPPPPPPPPPPPPPPI',
    '...........IpPPPPPPPRRRRRRRRRRRRPI.',
    '...........I.PPPPWWWWRRRRRRRRRRPI..',
    '..........IBBbIPPPPYRRRRRR...IBBbI.',
    '.........IBBBI..PPPPPP.......IBBBI.',
    '.........IBbI.................IbI..',
    '..........I....................I...',
    '',
  ],
  [
    '.................IIpI...............',
    '................IpPPPI..........IpI.',
    '...............IpPkKKPI........IpPpI',
    '..............IpPPWWWWRIppppppIPPPI',
    '.............IpPPBWWBPPPRRRRRRRRRRI',
    '............IpPKsssPPPPPPPPPPPPPPI.',
    '...........IpPPPPPPPRRRRRRRRRRRPI..',
    '...........I.PPPPWWWWRRRRRRRRRPI...',
    '...........I.IPPPPPYRRRR.IBBbI.....',
    '...........I..IBBbI......IBBBI.....',
    '............IBBBI.......IBbI.......',
    '.............IbI.........I.........',
    '..............I....................',
  ],
  [
    '.................IIpI...............',
    '................IpPPPI...........I..',
    '...............IpPkKKPI.........IpI.',
    '..............IpPPWWWWRIp......IpPpI',
    '.............IpPPBWWBPPIppppppIPPPI',
    '............IpPKsssPPPPPPPPPPPPPPPI',
    '...........IpPPPPPPPRRRRRRRRRRRRPI.',
    '...........I.PPPPWWWWRRRRRRRRRRPI..',
    '...........IBBbPPPPYRRRRRR..IBBbI..',
    '...........IBBBI.PPPPPP.....IBBBI..',
    '...........IBbI..............IbI...',
    '............I.................I....',
    '',
  ],
].map((frame) => {
  const content = frame.map((row) => dw(row, DOG_W))
  const rows = [...content]
  while (rows.length < DOG_H) rows.unshift(dw('', DOG_W))
  return rows.slice(-DOG_H)
})

const CABLE_A = [
  '......IOOOOI',
  '....IOooooOOI',
  '...IOoCNNNoOOI',
  '..IoCNWWWCNoOI',
  '.IOoCWWWWWCoOOI',
  '.IoCNWWooWWNCoOI',
  '.IoCNWWooWWNCoOI',
  '.IOoCWWWWWCoOOI',
  '..IoCNWWWCNoOI',
  '...IOoCNNNoOOI',
  '....IOooooOOI',
  '......IOOOOI',
].map((row) => dw(row, 20))

const CABLE_B = [
  '......IOOOOI',
  '....IOoooOOOI',
  '...IOoNCCCoOOI',
  '..IoCWNNNWCNoI',
  '.IOoCWWWWWCoOOI',
  '.IoCNoWWWWoNCOI',
  '.IoCNoWWWWoNCOI',
  '.IOoCWWWWWCoOOI',
  '..IoCWNNNWCNoI',
  '...IOoNCCCoOOI',
  '....IOoooOOOI',
  '......IOOOOI',
].map((row) => dw(row, 20))

const VAN = [
  '.................IIIIIIII',
  '...............IIWWWWWWWWII',
  '.............IIWWWWWWWWWWWWII',
  '.......IIIIIIWWWWWWWWWWWWWWWWII',
  '.....IIWWWWWWWWWWWWWWWWWWWWWWWWI',
  '....IWWWAAAAAAWWWWWAAAAWWWWWWWWWI',
  '...IWWWAAAAAAAAWWWAAAAAAWWWWWWWWWI',
  '...IWWWHAAAAAAAWWWAAAAAAWWWWWWWWWWI',
  '...IWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWI',
  '...IRRRWWWWWWWWWWWWWWWWWWWWWYYYYWWI',
  '...IWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWI',
  '...IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAI',
  '....I.IBBBI..............IBBBI.I',
  '....I.IBBGI..............IBBGI.I',
  '.....IIBBBI..............IBBBI.I',
  '......IIII................IIII',
].map((row) => dw(row, 48))

const HOUSE = [
  '....................ImmmmI',
  '...................ImMMMMIm........I',
  '..................ImMMCCMMIm......IQI',
  '.................ImMMCCCCMMIm.....IQI',
  '................ImMMMCCCCMMImm....II',
  '...............ImmMMMMMMMMMMmmmI',
  '..............ImmmmmmmmmmmmmmmmI',
  '..............ImMMMMMMMMMMMMMMIm',
  '..............ImMMYYYYMMYYYYMMIm',
  '..............ImMMYWWYMMYWWYMMIm',
  '..............ImMMMMMMMMMMMMMMIm',
  '..............ImMMYYYYMMYYYYMMIm',
  '..............ImMMYWWYMMYWWYMMIm',
  '..............ImMMMMMMMMMMMMMMIm',
  '..............ImMMYYYYMMPPPMMMIm',
  '..............ImMMYYYYMMpYpMMMIm',
  '..............ImMMMMMMMMpYpMMMIm',
  '..............ImMMYYYYMMpYpMMMIm',
  '..............ImMMMMMMMMPPMMMMIm',
  '..............ImmmmmmmmmmmmmmmmI',
  '...............IIIIIIIIIIIIIIIII',
].map((row) => dw(row, 48))

const BOX_A = [
  '.....IOOOOOI',
  '....IOCCCCCOI',
  '...IOCNNNNNCOI',
  '...IOCNYYYYNCOI',
  '...IOCNYWWYNCOI',
  '...IOCNYYYYNCOI',
  '...IOCNNNNNCOI',
  '....IOCCCCCOI',
  '.....IOOOOOI',
  '.......ICC',
  '.......ICC',
  '',
].map((row) => dw(row, 20))

const BOX_B = [
  '.....IOOOOOI',
  '....IOCCCCCOI',
  '...IOCNNNNNCOI',
  '...IOCNWWWWNCOI',
  '...IOCNWYYWNCOI',
  '...IOCNWWWWNCOI',
  '...IOCNNNNNCOI',
  '....IOCCCCCOI',
  '.....IOOOOOI',
  '.......ICC',
  '.......ICC',
  '',
].map((row) => dw(row, 20))

const CONE = [
  '......IOOI',
  '.....IOWWOI',
  '.....IOOOOI',
  '....IOWWWWOI',
  '....IOOOOOOI',
  '...IOWWWWWWOI',
  '...IOOOOOOOOI',
  '..IOWWWWWWWWOI',
  '..IOOOOOOOOOOI',
  '.IWWWWWWWWWWWWI',
].map((row) => dw(row, 16))

const WIRE_A = [
  'CI',
  'CCCI',
  '..IXXI',
  '...IXXXXI',
  '.....IXXXXI',
  '.......IXXXXI',
  '.........IXXXXI',
  '...........IXXI',
  '............IXCI',
  '.............CCI',
  '..............CI',
  '',
].map((row) => dw(row, 20))

const WIRE_B = [
  'CI',
  'CCCI',
  '..IYYI',
  '...IYYYYI',
  '.....IXXXXI',
  '.......IXXXXI',
  '.........IYYYYI',
  '...........IYYI',
  '............IXCI',
  '.............CCI',
  '..............CI',
  '',
].map((row) => dw(row, 20))

const WIRE_C = [
  'CI',
  'CCCI',
  '..IXXI',
  '...IXXXXI',
  '.....IYYYYI',
  '.......IWWWWI',
  '.........IYYYYI',
  '...........IYYI',
  '............IXCI',
  '.............CCI',
  '..............CI',
  '',
].map((row) => dw(row, 20))

const WINDOW = [
  'ICCCCCCCI',
  'IYYYYYYI',
  'IYWYYWYI',
  'IYYYYYYI',
  'ICCCCCCCI',
  'IYYYYYYI',
  'IYWYYWYI',
  'IYYYYYYI',
  'ICCCCCCCI',
].map((row) => dw(row, 10))

const DUST = [
  '........',
  '..IgI...',
  '.IgggI..',
  '.IEEEEI.',
  '..IEEI..',
  '...II...',
  '........',
  '........',
]

const DEBRIS = [
  '....',
  '.IOI',
  '.IUI',
  '....',
]

const SPARK = [
  '....',
  '.IYI',
  '.IOI',
  '....',
]

function drawTileset(): HTMLCanvasElement {
  const size = 32
  const { el, ctx } = canvas(size * 7, size)

  // 1 ground — orange lip is the walkable surface, then curb/cracks
  rect(ctx, size, 0, size, 4, PAL.O)
  rect(ctx, size, 4, size, 5, PAL.G)
  rect(ctx, size, 5, size, 2, PAL.g)
  rect(ctx, size, 9, size, 3, PAL.I)
  rect(ctx, size, 12, size, 20, PAL.H)
  for (let i = 0; i < 7; i += 1) {
    rect(ctx, size + 2 + i * 4, 6, 2, 2, PAL.g)
  }
  rect(ctx, size + 6, 16, 4, 2, PAL.A)
  rect(ctx, size + 22, 20, 5, 2, PAL.T)
  rect(ctx, size + 3, 26, 2, 2, PAL.A)
  rect(ctx, size + 12, 18, 8, 8, PAL.A)
  rect(ctx, size + 14, 20, 4, 4, PAL.H)
  ctx.strokeStyle = PAL.g
  ctx.lineWidth = 1
  ctx.strokeRect(size + 12, 18, 8, 8)

  // 2 fill — packed dirt / sub-base
  rect(ctx, size * 2, 0, size, size, PAL.H)
  for (let i = 0; i < 10; i += 1) {
    rect(ctx, size * 2 + (i % 5) * 6 + 2, 3 + Math.floor(i / 5) * 14, 4, 2, PAL.T)
  }
  rect(ctx, size * 2 + 20, 24, 3, 2, PAL.A)

  // 3 brick
  rect(ctx, size * 3, 0, size, size, PAL.I)
  for (let row = 0; row < 4; row += 1) {
    const offset = row % 2 === 0 ? 1 : 9
    for (let col = 0; col < 3; col += 1) {
      const stain = (row + col) % 3 === 0 ? PAL.U : PAL.m
      rect(ctx, size * 3 + offset + col * 12, row * 8 + 1, 10, 6, stain)
      rect(ctx, size * 3 + offset + col * 12 + 1, row * 8 + 2, 3, 2, PAL.M)
      rect(ctx, size * 3 + offset + col * 12 + 6, row * 8 + 5, 2, 1, PAL.I)
    }
  }

  // 4 roof
  rect(ctx, size * 4, 0, size, size, PAL.C)
  for (let i = 0; i < 4; i += 1) {
    rect(ctx, size * 4, i * 8, size, 3, PAL.N)
    rect(ctx, size * 4, i * 8 + 3, size, 1, PAL.I)
    rect(ctx, size * 4 + 4, i * 8 + 1, 2, 1, PAL.W)
  }
  rect(ctx, size * 4, 0, size, 4, PAL.O)
  rect(ctx, size * 4, 4, size, 1, PAL.I)

  // 5 platform — riveted steel with bolts
  rect(ctx, size * 5, 0, size, 11, PAL.g)
  rect(ctx, size * 5, 11, size, 6, PAL.I)
  rect(ctx, size * 5 + 2, 2, size - 4, 5, PAL.N)
  rect(ctx, size * 5 + 4, 4, 3, 3, PAL.Y)
  rect(ctx, size * 5 + 25, 4, 3, 3, PAL.Y)
  rect(ctx, size * 5 + 14, 3, 4, 2, PAL.C)
  rect(ctx, size * 5 + 8, 8, 2, 2, PAL.I)
  rect(ctx, size * 5 + 22, 8, 2, 2, PAL.I)

  // 6 crate
  rect(ctx, size * 6, 3, size, 29, PAL.I)
  rect(ctx, size * 6 + 2, 5, size - 4, 25, PAL.k)
  rect(ctx, size * 6 + 4, 8, 4, 18, PAL.K)
  rect(ctx, size * 6 + 24, 8, 4, 18, PAL.K)
  ctx.strokeStyle = PAL.K
  ctx.lineWidth = 2
  ctx.strokeRect(size * 6 + 5, 8, size - 10, 20)
  ctx.beginPath()
  ctx.moveTo(size * 6 + 7, 10)
  ctx.lineTo(size * 6 + size - 7, 26)
  ctx.moveTo(size * 6 + size - 7, 10)
  ctx.lineTo(size * 6 + 7, 26)
  ctx.stroke()
  rect(ctx, size * 6 + 10, 14, 12, 5, PAL.O)
  rect(ctx, size * 6 + 12, 15, 8, 3, PAL.I)

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
const SKYLINE_HEIGHT = 300

type NearBuilding = {
  x: number
  w: number
  h: number
  kind: 'block' | 'tower' | 'step' | 'spire' | 'antenna' | 'wide' | 'factory' | 'crane' | 'tank'
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

  ctx.fillStyle = '#07080A'
  ctx.fillRect(building.x, top, building.w, 2)

  if (building.kind === 'step') {
    const stepW = Math.floor(building.w * 0.58)
    const stepH = 22
    ctx.fillStyle = body
    ctx.fillRect(building.x + Math.floor((building.w - stepW) / 2), top - stepH, stepW, stepH)
  }

  if (building.kind === 'tower' || building.kind === 'antenna') {
    ctx.fillStyle = body
    ctx.fillRect(building.x + Math.floor(building.w / 2) - 1, top - 26, 3, 26)
    ctx.fillRect(building.x + Math.floor(building.w / 2) - 6, top - 22, 12, 3)
    ctx.fillStyle = PAL.O
    ctx.fillRect(building.x + Math.floor(building.w / 2) - 2, top - 28, 5, 4)
  }

  if (building.kind === 'spire') {
    const mid = building.x + Math.floor(building.w / 2)
    ctx.fillStyle = body
    ctx.beginPath()
    ctx.moveTo(building.x + 6, top)
    ctx.lineTo(mid, top - 34)
    ctx.lineTo(building.x + building.w - 6, top)
    ctx.closePath()
    ctx.fill()
  }

  if (building.kind === 'factory') {
    ctx.fillStyle = body
    ctx.fillRect(building.x + 10, top - 28, 10, 28)
    ctx.fillRect(building.x + 28, top - 18, 8, 18)
    ctx.fillRect(building.x + building.w - 22, top - 36, 12, 36)
    ctx.fillStyle = '#6E7684'
    ctx.fillRect(building.x + 11, top - 40, 8, 12)
    ctx.fillStyle = 'rgba(244,247,250,0.35)'
    ctx.fillRect(building.x + 8, top - 52, 14, 8)
  }

  if (building.kind === 'crane') {
    ctx.fillStyle = PAL.O
    ctx.fillRect(building.x + 8, top - 48, 6, 48)
    ctx.fillRect(building.x + 8, top - 48, 54, 5)
    ctx.fillStyle = PAL.I
    ctx.fillRect(building.x + 56, top - 44, 3, 18)
    ctx.fillStyle = PAL.Y
    ctx.fillRect(building.x + 54, top - 26, 7, 6)
  }

  if (building.kind === 'tank') {
    ctx.fillStyle = PAL.g
    ctx.fillRect(building.x + 6, top - 18, building.w - 12, 18)
    ctx.fillStyle = PAL.O
    ctx.fillRect(building.x + Math.floor(building.w / 2) - 2, top - 26, 4, 8)
  }

  if (building.w > 48) {
    ctx.fillStyle = PAL.g
    ctx.fillRect(building.x + 6, top + 4, 14, 9)
    ctx.fillStyle = PAL.I
    ctx.fillRect(building.x + 8, top + 6, 10, 5)
    ctx.fillStyle = PAL.N
    ctx.fillRect(building.x + 10, top + 7, 6, 3)
  }

  if (building.kind === 'wide' || building.kind === 'block') {
    ctx.fillStyle = PAL.O
    ctx.fillRect(building.x + 8, top + Math.floor(building.h * 0.32), 24, 9)
    ctx.fillStyle = PAL.Y
    ctx.fillRect(building.x + 10, top + Math.floor(building.h * 0.32) + 2, 20, 5)
  }

  if (building.h > 78) {
    ctx.fillStyle = PAL.G
    ctx.fillRect(building.x + 3, top + 38, building.w - 6, 3)
    ctx.fillStyle = PAL.I
    for (let bx = building.x + 5; bx < building.x + building.w - 6; bx += 6) {
      ctx.fillRect(bx, top + 32, 2, 9)
    }
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
  gradient.addColorStop(0, '#1A4DFF')
  gradient.addColorStop(0.42, '#4E8CFF')
  gradient.addColorStop(0.72, '#A8CFFF')
  gradient.addColorStop(1, '#F0C878')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 160, 90)
  ctx.fillStyle = 'rgba(244,247,250,0.55)'
  ctx.fillRect(18, 10, 22, 6)
  ctx.fillRect(28, 8, 14, 5)
  ctx.fillRect(96, 16, 28, 7)
  ctx.fillRect(108, 14, 16, 5)
  ctx.fillRect(52, 22, 18, 5)
  return el
}

function skylineTexture(): HTMLCanvasElement {
  const width = SKYLINE_WIDTH
  const height = SKYLINE_HEIGHT
  const { el, ctx } = canvas(width, height)
  ctx.clearRect(0, 0, width, height)

  const far = [
    [0, 70, 48],
    [68, 42, 72],
    [108, 88, 40],
    [196, 36, 90],
    [232, 60, 54],
    [380, 50, 130],
    [428, 96, 88],
    [520, 40, 168],
    [558, 74, 110],
    [628, 120, 70],
    [880, 80, 46],
    [958, 54, 78],
    [1010, 140, 38],
    [1148, 44, 62],
    [1190, 90, 50],
  ] as const

  ctx.fillStyle = '#3A5A72'
  for (const [x, w, h] of far) {
    ctx.fillRect(x, height - h, w, h)
  }

  const near: NearBuilding[] = [
    { x: -4, w: 86, h: 58, kind: 'wide', windowGapX: 14, windowGapY: 16, lit: 0.35 },
    { x: 78, w: 48, h: 86, kind: 'block', windowGapX: 11, windowGapY: 13, lit: 0.45 },
    { x: 124, w: 70, h: 48, kind: 'tank', windowGapX: 16, windowGapY: 18, lit: 0.2 },
    { x: 190, w: 32, h: 118, kind: 'step', windowGapX: 10, windowGapY: 12, lit: 0.5 },
    { x: 220, w: 92, h: 64, kind: 'crane', windowGapX: 13, windowGapY: 15, lit: 0.32 },
    { x: 408, w: 58, h: 128, kind: 'block', windowGapX: 10, windowGapY: 11, lit: 0.7 },
    { x: 462, w: 36, h: 236, kind: 'antenna', windowGapX: 8, windowGapY: 9, lit: 0.92 },
    { x: 496, w: 88, h: 96, kind: 'step', windowGapX: 11, windowGapY: 12, lit: 0.62 },
    { x: 580, w: 44, h: 162, kind: 'spire', windowGapX: 9, windowGapY: 10, lit: 0.8 },
    { x: 620, w: 112, h: 78, kind: 'wide', windowGapX: 12, windowGapY: 13, lit: 0.55 },
    { x: 728, w: 52, h: 140, kind: 'tower', windowGapX: 8, windowGapY: 10, lit: 0.84 },
    { x: 880, w: 120, h: 54, kind: 'factory', windowGapX: 18, windowGapY: 16, lit: 0.22 },
    { x: 996, w: 64, h: 72, kind: 'factory', windowGapX: 15, windowGapY: 14, lit: 0.18 },
    { x: 1056, w: 40, h: 110, kind: 'antenna', windowGapX: 9, windowGapY: 12, lit: 0.4 },
    { x: 1094, w: 98, h: 48, kind: 'tank', windowGapX: 16, windowGapY: 18, lit: 0.2 },
    { x: 1188, w: 96, h: 66, kind: 'crane', windowGapX: 14, windowGapY: 15, lit: 0.25 },
  ]

  for (const building of near) {
    drawBuilding(ctx, building, height, '#051D2E', '#FFD27A')
  }

  ctx.fillStyle = '#0B2838'
  ctx.fillRect(0, height - 16, width, 16)
  ctx.fillStyle = PAL.O
  ctx.fillRect(0, height - 18, width, 2)

  for (let x = 18; x < width; x += 88) {
    ctx.fillStyle = PAL.I
    ctx.fillRect(x, height - 42, 3, 26)
    ctx.fillStyle = PAL.O
    ctx.fillRect(x - 3, height - 46, 9, 5)
    ctx.fillStyle = PAL.Y
    ctx.fillRect(x - 1, height - 44, 5, 3)
  }

  return el
}

function heart(): HTMLCanvasElement {
  const { el, ctx } = canvas(20, 18)
  blit(
    ctx,
    [
      '.IXX.XXI.',
      'IXXXXXXXI',
      'IXXXXXXXI',
      'IXXXXXXXI',
      '.IXXXXXI.',
      '..IXXXI..',
      '...IXI...',
      '....I....',
    ],
    PAL,
    2,
    1,
    1,
  )
  return el
}

function assertWide(frames: readonly (readonly string[])[], label: string): void {
  const width = frames[0]?.[0]?.length
  const height = frames[0]?.length
  for (const frame of frames) {
    if (frame.length !== height) {
      throw new Error(`${label}: height ${frame.length} != ${height}`)
    }
    for (const row of frame) {
      if (row.length !== width) {
        throw new Error(`${label}: row width ${row.length} != ${width} (${row})`)
      }
    }
  }
}

function assertPlayer(frames: readonly (readonly string[])[]): void {
  for (const frame of frames) {
    if (frame.length !== PH) throw new Error(`player height ${frame.length}`)
    for (const row of frame) {
      if (row.length !== PW) throw new Error(`player width ${row.length}: ${row}`)
    }
  }
}

export function createGeneratedCanvases(): Record<string, HTMLCanvasElement> {
  const walkArms: Arm[] = ['fwd', 'down', 'back', 'fwd', 'down', 'back']
  const playerFrames = [
    playerFrame(LEGS_IDLE, 0, 'down'),
    playerFrame(LEGS_IDLE_B, 0, 'down'),
    playerFrame(LEGS_WALK[0] ?? LEGS_IDLE, 1, walkArms[0] ?? 'fwd'),
    playerFrame(LEGS_WALK[1] ?? LEGS_IDLE, 1, walkArms[1] ?? 'down'),
    playerFrame(LEGS_WALK[2] ?? LEGS_IDLE, 0, walkArms[2] ?? 'back'),
    playerFrame(LEGS_WALK[3] ?? LEGS_IDLE, 1, walkArms[3] ?? 'fwd'),
    playerFrame(LEGS_WALK[4] ?? LEGS_IDLE, 1, walkArms[4] ?? 'down'),
    playerFrame(LEGS_WALK[5] ?? LEGS_IDLE, 0, walkArms[5] ?? 'back'),
    playerFrame(LEGS_JUMP, 0, 'up'),
    playerFrame(LEGS_FALL, 0, 'out'),
    PLAYER_HURT,
    PLAYER_INSTALL_A,
    PLAYER_INSTALL_B,
  ]
  assertPlayer(playerFrames)
  assertWide(DOG_FRAMES, 'dog')
  assertWide([CABLE_A, CABLE_B], 'cable')
  assertWide([WIRE_A, WIRE_B, WIRE_C], 'wire')
  assertWide([BOX_A, BOX_B], 'box')
  assertWide([VAN], 'van')
  assertWide([HOUSE], 'house')

  return {
    tiles: drawTileset(),
    player: sheet(playerFrames, 2),
    dog: sheet(DOG_FRAMES, 2),
    cable: sheet([CABLE_A, CABLE_B], 3),
    van: sheet([VAN], 3),
    house: sheet([HOUSE], 2),
    box: sheet([BOX_A, BOX_B], 3),
    cone: sheet([CONE], 3),
    wire: sheet([WIRE_A, WIRE_B, WIRE_C], 3),
    window: sheet([WINDOW], 3),
    sky: skyTexture(),
    skyline: skylineTexture(),
    spark: sheet([SPARK], 3),
    dust: sheet([DUST], 3),
    debris: sheet([DEBRIS], 3),
    heart: heart(),
  }
}

export const PLAYER_FRAME = { width: 96, height: 128 }
export const DOG_FRAME = { width: 96, height: 48 }
export const CABLE_FRAME = { width: 60, height: 36 }
export const WIRE_FRAME = { width: 60, height: 36 }
export const BOX_FRAME = { width: 60, height: 36 }

export const PLAYER_ANIMS = {
  idleEnd: 1,
  walkStart: 2,
  walkEnd: 7,
  jump: 8,
  fall: 9,
  hurt: 10,
  installStart: 11,
  installEnd: 12,
} as const
