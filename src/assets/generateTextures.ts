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

/** Metal Slug-inspired soldier + K9 palette (thick outline, chunky shades). */
const SPRITE = {
  C: '#0A0806',
  H: '#F0CC28',
  h: '#C49A18',
  I: '#FFE45C',
  W: '#F7F2E8',
  w: '#C4BCA8',
  S: '#E8B48A',
  s: '#C48A62',
  T: '#A86A46',
  E: '#FFF6EE',
  B: '#14100C',
  R: '#C41C1C',
  r: '#7A1010',
  V: '#E83428',
  K: '#8A96A4',
  k: '#4A5664',
  L: '#C8D0D8',
  G: '#6A7A32',
  g: '#465220',
  Y: '#A08A46',
  N: '#2E3A16',
  P: '#1A1610',
  p: '#3C3224',
  A: '#FF7420',
  a: '#CC5510',
  F: '#D4A04A',
  f: '#8A5420',
  D: '#E8B86A',
  M: '#2A1C10',
  m: '#5C3A1C',
  U: '#F08080',
  Q: '#6A4830',
} satisfies Palette

const CAR = {
  C: '#141414',
  W: '#F4F4F4',
  w: '#D0D4D8',
  H: '#FFFFFF',
  L: '#3A4A58',
  l: '#243038',
  B: '#1C1C1C',
  N: '#0A0A0A',
  S: '#C4C8CC',
  R: '#C42828',
  Y: '#F0D878',
} satisfies Palette

const PLAYER_W = 36
const PLAYER_H = 40
const DOG_W = 40
const DOG_H = 22

function frame(name: string, width: number, height: number, rows: string[]): string[] {
  if (rows.length !== height) {
    throw new Error(`${name}: ${rows.length} rows, expected ${height}`)
  }
  rows.forEach((row, i) => {
    if (row.length !== width) {
      throw new Error(`${name}[${i}] width ${row.length} != ${width} :: ${row}`)
    }
  })
  return rows
}

function dropToGround(name: string, rows: string[]): string[] {
  const width = rows[0]?.length ?? 0
  const empty = '.'.repeat(width)
  let last = rows.length - 1
  while (last > 0 && rows[last] === empty) last -= 1
  const pad = rows.length - 1 - last
  if (pad <= 0) return rows
  return frame(name, width, rows.length, [
    ...Array.from({ length: pad }, () => empty),
    ...rows.slice(0, last + 1),
  ])
}

const PLAYER_IDLE = frame('player-idle', PLAYER_W, PLAYER_H, [
  '....................................',
  '......C.............................',
  '......C............CCCCCCC..........',
  '......C...........CHHHHHHHC.........',
  '......C..........CHHHIHHHHHC........',
  '......C.........CHHHHHHHHHHHC.......',
  '......C........CHHhHHHHHHHHHC.......',
  '.....CLC.......CHHWHHHHHHHHHC.......',
  '.....CkC.......CHWWWWWWWWWWCC.......',
  '.....CkKC......CWWSSSSSSWWWCC.......',
  '.....CkLC......CSSSSSSSSSSSC........',
  '.....CkKC......CSsWBSSSwBSSC........',
  '.....CkKC.......CSSSEEEEESC.........',
  '.....CkKCC......CsSTTTTTsC..........',
  '.....CkKKCCCC..CRRRRRRRRRRC.........',
  '.....CkKLCCCCCRRRRRRRRRRRRRCC.......',
  '.....CkKKCCCRRVRRRRRRRRRRRRCC.......',
  '......CCCCCCRRRRRRRRRRRRRRRCC.......',
  '.......CCQCCSSRRRRRRRRRRRSSC........',
  '........CQCsSSRRRRRRRRSsSC..........',
  '.........CCsSRRRRRRRsSC.............',
  '..........CRRRRRRRRC................',
  '..........CGGGGGGGGC................',
  '.........CGYGGGYGGGC................',
  '.........CGGGGGGGGGC................',
  '..........CGgGYGgGC.................',
  '..........CGGC.CGGC.................',
  '..........CGGC.CGGC.................',
  '..........CNGC.CGNC.................',
  '..........CPPC.CPPC.................',
  '..........CPPC.CPPC.................',
  '..........CppC.CppC.................',
  '...........CC...CC..................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
])

const PLAYER_WALK_A = frame('player-walk-a', PLAYER_W, PLAYER_H, [
  '....................................',
  '......C.............................',
  '......C............CCCCCCC..........',
  '......C...........CHHHHHHHC.........',
  '......C..........CHHHIHHHHHC........',
  '......C.........CHHHHHHHHHHHC.......',
  '......C........CHHhHHHHHHHHHC.......',
  '.....CLC.......CHHWHHHHHHHHHC.......',
  '.....CkC.......CHWWWWWWWWWWCC.......',
  '.....CkKC......CWWSSSSSSWWWCC.......',
  '.....CkLC......CSSSSSSSSSSSC........',
  '.....CkKC......CSsWBSSSwBSSC........',
  '.....CkKC.......CSSSEEEEESC.........',
  '.....CkKCC......CsSTTTTTsC..........',
  '.....CkKKCCCC..CRRRRRRRRRRC.........',
  '.....CkKLCCCCCRRRRRRRRRRRRRCC.......',
  '.....CkKKCCCRRVRRRRRRRRRRRRCC.......',
  '......CCCCCCRRRRRRRRRRRRRRRCC.......',
  '.......CCQCCSSRRRRRRRRRRRSSSSC......',
  '........CQCsSSRRRRRRRRSsSCsC........',
  '.........CCsSRRRRRRRsSC..CC.........',
  '..........CRRRRRRRRC................',
  '..........CGGGGGGGGGC...............',
  '.........CGYGGGYGGGGC...............',
  '.........CGGGGGGGGGGC...............',
  '........CGGC.....CGGC...............',
  '.......CGYGC.....CGYGC..............',
  '......CGNCC.......CCNGC.............',
  '......CPPC.........CPPC.............',
  '.....CPPC...........CPPC............',
  '.....CppC...........CppC............',
  '......CC.............CC.............',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
])

const PLAYER_WALK_B = frame('player-walk-b', PLAYER_W, PLAYER_H, [
  '....................................',
  '....................................',
  '......C.............................',
  '......C............CCCCCCC..........',
  '......C...........CHHHHHHHC.........',
  '......C..........CHHHIHHHHHC........',
  '......C.........CHHHHHHHHHHHC.......',
  '......C........CHHhHHHHHHHHHC.......',
  '.....CLC.......CHHWHHHHHHHHHC.......',
  '.....CkC.......CHWWWWWWWWWWCC.......',
  '.....CkKC......CWWSSSSSSWWWCC.......',
  '.....CkLC......CSSSSSSSSSSSC........',
  '.....CkKC......CSsWBSSSwBSSC........',
  '.....CkKC.......CSSSEEEEESC.........',
  '.....CkKCC......CsSTTTTTsC..........',
  '.....CkKKCCCC..CRRRRRRRRRRC.........',
  '.....CkKLCCCCCRRRRRRRRRRRRRCC.......',
  '.....CkKKCCCRRVRRRRRRRRRRRRCC.......',
  '......CCCCCCRRRRRRRRRRRRRRRCC.......',
  '.......CCQCCSSRRRRRRRRRRRSSC........',
  '........CQCsSSRRRRRRRRSsSC..........',
  '.........CCsSRRRRRRRsSC.............',
  '..........CRRRRRRRRC................',
  '..........CGGGGGGGGC................',
  '.........CGYGGGYGGGC................',
  '.........CGGGGGGGGGC................',
  '..........CGgGYGgGC.................',
  '..........CGGC.CGGC.................',
  '..........CNGC.CGNC.................',
  '..........CPPC.CPPC.................',
  '..........CPPC.CPPC.................',
  '..........CppC.CppC.................',
  '...........CC...CC..................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
])

const PLAYER_WALK_C = frame('player-walk-c', PLAYER_W, PLAYER_H, [
  '....................................',
  '......C.............................',
  '......C............CCCCCCC..........',
  '......C...........CHHHHHHHC.........',
  '......C..........CHHHIHHHHHC........',
  '......C.........CHHHHHHHHHHHC.......',
  '......C........CHHhHHHHHHHHHC.......',
  '.....CLC.......CHHWHHHHHHHHHC.......',
  '.....CkC.......CHWWWWWWWWWWCC.......',
  '.....CkKC......CWWSSSSSSWWWCC.......',
  '.....CkLC......CSSSSSSSSSSSC........',
  '.....CkKC......CSsWBSSSwBSSC........',
  '.....CkKC.......CSSSEEEEESC.........',
  '.....CkKCC......CsSTTTTTsC..........',
  '.....CkKKCCCC..CRRRRRRRRRRC.........',
  '.....CkKLCCCCCRRRRRRRRRRRRRCC.......',
  '.....CkKKCCCRRVRRRRRRRRRRRRCC.......',
  '......CCCCCCRRRRRRRRRRRRRRRCC.......',
  '......SCCQCCSSRRRRRRRRRRRSSC........',
  '.....Cs.CQCsSSRRRRRRRRSsSC..........',
  '.....CC..CCsSRRRRRRRsSC.............',
  '..........CRRRRRRRRC................',
  '..........CGGGGGGGGGC...............',
  '.........CGGGGYGGYGGC...............',
  '.........CGGGGGGGGGGC...............',
  '........CGGC.....CGGC...............',
  '.......CGYGC.....CGYGC..............',
  '......CGNCC.......CCNGC.............',
  '.....CPPC...........CPPC............',
  '.....CPPC...........CPPC............',
  '....CppC.............CppC...........',
  '.....CC...............CC............',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
])

const PLAYER_JUMP = frame('player-jump', PLAYER_W, PLAYER_H, [
  '....................................',
  '......C.............................',
  '......C............CCCCCCC..........',
  '......C...........CHHHHHHHC.........',
  '......C..........CHHHIHHHHHC........',
  '......C.........CHHHHHHHHHHHC.......',
  '......C........CHHhHHHHHHHHHC.......',
  '.....CLC.......CHHWHHHHHHHHHC.......',
  '.....CkC.......CHWWWWWWWWWWCC.......',
  '.....CkKC......CWWSSSSSSWWWCC.......',
  '.....CkLC......CSSSSSSSSSSSC........',
  '.....CkKC......CSsWBSSSwBSSC........',
  '.....CkKC.......CSSSEEEEESC.........',
  '.....CkKCC......CsSTTTTTsC..........',
  '.....CkKKCCCC..CRRRRRRRRRRC.........',
  '.....CkKLCCCCCRRRRRRRRRRRRRCC.......',
  '.....CkKKCCCRRVRRRRRRRRRRRRCC.......',
  '....SCCCCCCRRRRRRRRRRRRRRRCC........',
  '...sSCCQCCSSRRRRRRRRRRRSSSSC........',
  '...CC.CQCsSSRRRRRRRRSsSCsC..........',
  '......CCCsSRRRRRRRsSC..CC...........',
  '..........CRRRRRRRRC................',
  '.........CGGGGGGGGGC................',
  '........CGYGGGYGGGGC................',
  '........CGGGGGGGGGGC................',
  '.......CGNGGGGGGGNGC................',
  '.......CPPC.....CPPC................',
  '.......CppC.....CppC................',
  '........CC.......CC.................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
])

const PLAYER_FALL = frame('player-fall', PLAYER_W, PLAYER_H, [
  '....................................',
  '......C.............................',
  '......C............CCCCCCC..........',
  '......C...........CHHHHHHHC.........',
  '......C..........CHHHIHHHHHC........',
  '......C.........CHHHHHHHHHHHC.......',
  '......C........CHHhHHHHHHHHHC.......',
  '.....CLC.......CHHWHHHHHHHHHC.......',
  '.....CkC.......CHWWWWWWWWWWCC.......',
  '.....CkKC......CWWSSSSSSWWWCC.......',
  '.....CkLC......CSSSSSSSSSSSC........',
  '.....CkKC......CSsWBSSSwBSSC........',
  '.....CkKC.......CSSSEEEEESC.........',
  '.....CkKCC......CsSTTTTTsC..........',
  '.....CkKKCCCC..CRRRRRRRRRRC.........',
  '.....CkKLCCCCCRRRRRRRRRRRRRCC.......',
  '.....CkKKCCCRRVRRRRRRRRRRRRCC.......',
  '....SCCCCCCRRRRRRRRRRRRRRRCC........',
  '...sSCCQCCSSRRRRRRRRRRRSSC..........',
  '...CC.CQCsSSRRRRRRRRSsSC............',
  '......CCCsSRRRRRRRsSC...............',
  '..........CRRRRRRRRC................',
  '..........CGGGGGGGGC................',
  '.........CGYGGGYGGGC................',
  '.........CGGGGGGGGGC................',
  '........CGGC.....CGGC...............',
  '........CGGC.....CGGC...............',
  '........CNGC.....CGNC...............',
  '........CPPC.....CPPC...............',
  '........CppC.....CppC...............',
  '.........CC.......CC................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
])

const PLAYER_INSTALL = frame('player-install', PLAYER_W, PLAYER_H, [
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '......C.............................',
  '......C............CCCCCCC..........',
  '......C...........CHHHHHHHC.........',
  '......C..........CHHHIHHHHHC........',
  '......C.........CHHHHHHHHHHHC.......',
  '......C........CHHhHHHHHHHHHC.......',
  '.....CLC.......CHHWHHHHHHHHHC.......',
  '.....CkC.......CHWWWWWWWWWWCC.......',
  '.....CkKC......CWWSSSSSSWWWCC.......',
  '.....CkLC......CSSSSSSSSSSSC........',
  '.....CkKC......CSsWBSSSwBSSC........',
  '.....CkKC.......CSSSEEEEESC.........',
  '.....CkKCC......CsSTTTTTsC..........',
  '.....CkKKCCCC..CRRRRRRRRRRC.........',
  '.....CkKLCCCCCRRRRRRRRRRRRRCC.......',
  '.....CkKKCCCRRVRRRRRRRRRRRRCC.......',
  '......CCCCCCRRRRRRRRRRRRRRRCC.......',
  '.......CCQCCSSRRRRRRRRRRRAAAC.......',
  '........CQCsSSRRRRRRRRSsaAaC........',
  '.........CCsSRRRRRRRsSC.aAC.........',
  '..........CRRRRRRRRC...CC...........',
  '.........CGGGGGGGGGGC...............',
  '........CGYGGGGGYGGGC...............',
  '.......CGGGGGGGGGGGGC...............',
  '......CGGC........CGGC..............',
  '.....CNGC.........CPPC..............',
  '.....CPPC.........CPPC..............',
  '.....CppC.........CppC..............',
  '......CC...........CC...............',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
  '....................................',
])

const DOG_A = frame('dog-a', DOG_W, DOG_H, [
  '........................................',
  'C.............................CCC.......',
  'CC...........................CfffC......',
  '.CfC........................CfDFFfC.....',
  '..CFC.......................CFFFFFC.....',
  '...CFCCC...................CFFMMSSC.....',
  '....CFFFFCCCCCCCCCCCCCCCCCfBBWWC........',
  '.....CFFFFFFmmFFFFFFFFFFFFCSSC..........',
  '......CCFFFFFRRRRRRRRRRFFFCC............',
  '.......CFFFFRRVVRRRRRRRFC...............',
  '.......CFFFFRRRRRRRRRRFC................',
  '........CFFFFFFFFFFFFC..................',
  '.........CFmmmmmmFFC....................',
  '..........CNNNNNNNCC....................',
  '...........CPPCC.CPC....................',
  '..........CPP.....PPC...................',
  '..........Cpp.....ppC...................',
  '...........CC.....CC....................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
])

const DOG_B = frame('dog-b', DOG_W, DOG_H, [
  '........................................',
  'C..............................CCC......',
  'CC............................CfffC.....',
  '.CfC.........................CfDFFfC....',
  '..CFC........................CFFFFFC....',
  '...CFCCC....................CFFMMSSC....',
  '....CFFFFCCCCCCCCCCCCCCCCCCfBBWWC.......',
  '.....CFFFFFFmmFFFFFFFFFFFFFCSSC.........',
  '......CCFFFFFRRRRRRRRRRRFFFCC...........',
  '.......CFFFFRRVVRRRRRRRRFC..............',
  '.......CFFFFRRRRRRRRRRRFC...............',
  '........CFFFFFFFFFFFFFC.................',
  '.........CFmmmmmmFFC....................',
  '..........CNNNNNNNCC....................',
  '............CPCCC.PC....................',
  '...........CPP...PPC....................',
  '...........Cpp...ppC....................',
  '............CC...CC.....................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
])

const DOG_C = frame('dog-c', DOG_W, DOG_H, [
  '........................................',
  'C.............................CCC.......',
  'CC...........................CfffC......',
  '.CfC........................CfDFFfC.....',
  '..CFC.......................CFFFFFC.....',
  '...CFCCC...................CFFMMSUC.....',
  '....CFFFFCCCCCCCCCCCCCCCCCfBBWWC........',
  '.....CFFFFFFmmFFFFFFFFFFFFCSSC..........',
  '......CCFFFFFRRRRRRRRRRFFFCC............',
  '.......CFFFFRRVVRRRRRRRFC...............',
  '.......CFFFFRRRRRRRRRRFC................',
  '........CFFFFFFFFFFFFC..................',
  '.........CFmmmmmmFFC....................',
  '..........CNNNNNNNCC....................',
  '.........CPPCC.....CPC..................',
  '........CPP.......PPC...................',
  '........Cpp.......ppC...................',
  '.........CC.......CC....................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
])

const DOG_D = frame('dog-d', DOG_W, DOG_H, [
  '........................................',
  '.C............................CCC.......',
  '.CC..........................CfffC......',
  '..CfC........................CfDFFfC....',
  '...CFC.......................CFFFFFC....',
  '....CFCCC...................CFFMMSSC....',
  '.....CFFFFCCCCCCCCCCCCCCCCCfBBWWC.......',
  '......CFFFFFFmmFFFFFFFFFFFFCSSC.........',
  '.......CCFFFFFRRRRRRRRRRFFFCC...........',
  '........CFFFFRRVVRRRRRRRFC..............',
  '........CFFFFRRRRRRRRRRFC...............',
  '.........CFFFFFFFFFFFFC.................',
  '..........CFmmmmmmFFC...................',
  '...........CNNNNNNNCC...................',
  '.............CPCC.CPC...................',
  '............CPP...PPC...................',
  '............Cpp...ppC...................',
  '.............CC...CC....................',
  '........................................',
  '........................................',
  '........................................',
  '........................................',
])

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

const VAN = frame('dolphin', 40, 16, [
  '.................CCCCCCCC...............',
  '...............CCWHHHHHWWCC.............',
  '.............CCWWWWWWWWWWWWCC...........',
  '.......CCCCCCWWWWWWWWWWWWWWWWCC.........',
  '.....CCWWWWWWWWWWWWWWWWWWWWWWWWC........',
  '....CWWWLLLLLLWWWWWLLLLWWWWWWWWWC.......',
  '...CWWWLLLLLLLLWWWLLLLLLWWWWWWWWWC......',
  '...CWWWlLLLLLLLWWWLLLLLLWWWWWWWWWWC.....',
  '...CWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWC.....',
  '...CRRWWWWWWWWWWWWWWWWWWWWWWYYYYWWC.....',
  '...CWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWC.....',
  '...CBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBC.....',
  '....C.CNNNC..............CNNNC.C........',
  '....C.CNNSC..............CNNSC.C........',
  '.....CCNNNC..............CNNNC.C........',
  '......CCCC................CCCC..........',
])

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
  // 1 ground — orange lip is the walkable surface so sprites don't hover above it
  rect(ctx, size, 0, size, 4, PAL.O)
  rect(ctx, size, 4, size, 8, PAL.G)
  rect(ctx, size, 12, size, 20, PAL.A)
  for (let i = 0; i < 8; i += 1) {
    rect(ctx, size + 4 + i * 4, 5, 2, 2, PAL.g)
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
  palette: Palette = PAL,
): HTMLCanvasElement {
  const frameH = frames[0]?.length ?? 0
  const frameW = frames[0]?.[0]?.length ?? 0
  const { el, ctx } = canvas(frameW * scale * frames.length, frameH * scale)
  frames.forEach((frame, i) => {
    blit(ctx, frame, palette, scale, i * frameW * scale, 0)
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

  ctx.fillStyle = '#3A6280'
  for (const [x, w, h] of far) {
    ctx.fillRect(x, height - h, w, h)
  }

  const near: NearBuilding[] = [
    { x: -4, w: 86, h: 58, kind: 'wide', windowGapX: 14, windowGapY: 16, lit: 0.35 },
    { x: 78, w: 48, h: 86, kind: 'block', windowGapX: 11, windowGapY: 13, lit: 0.45 },
    { x: 124, w: 70, h: 48, kind: 'wide', windowGapX: 16, windowGapY: 18, lit: 0.28 },
    { x: 190, w: 32, h: 118, kind: 'step', windowGapX: 10, windowGapY: 12, lit: 0.5 },
    { x: 220, w: 92, h: 64, kind: 'block', windowGapX: 13, windowGapY: 15, lit: 0.32 },
    { x: 408, w: 58, h: 128, kind: 'block', windowGapX: 10, windowGapY: 11, lit: 0.7 },
    { x: 462, w: 36, h: 236, kind: 'antenna', windowGapX: 8, windowGapY: 9, lit: 0.92 },
    { x: 496, w: 88, h: 96, kind: 'step', windowGapX: 11, windowGapY: 12, lit: 0.62 },
    { x: 580, w: 44, h: 162, kind: 'spire', windowGapX: 9, windowGapY: 10, lit: 0.8 },
    { x: 620, w: 112, h: 78, kind: 'wide', windowGapX: 12, windowGapY: 13, lit: 0.55 },
    { x: 728, w: 52, h: 140, kind: 'tower', windowGapX: 8, windowGapY: 10, lit: 0.84 },
    { x: 880, w: 120, h: 54, kind: 'factory', windowGapX: 18, windowGapY: 16, lit: 0.22 },
    { x: 996, w: 64, h: 72, kind: 'factory', windowGapX: 15, windowGapY: 14, lit: 0.18 },
    { x: 1056, w: 40, h: 110, kind: 'antenna', windowGapX: 9, windowGapY: 12, lit: 0.4 },
    { x: 1094, w: 98, h: 48, kind: 'wide', windowGapX: 16, windowGapY: 18, lit: 0.2 },
    { x: 1188, w: 96, h: 66, kind: 'factory', windowGapX: 14, windowGapY: 15, lit: 0.25 },
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
      [
        dropToGround('player-idle', PLAYER_IDLE),
        dropToGround('player-walk-a', PLAYER_WALK_A),
        dropToGround('player-walk-b', PLAYER_WALK_B),
        dropToGround('player-walk-c', PLAYER_WALK_C),
        PLAYER_JUMP,
        dropToGround('player-fall', PLAYER_FALL),
        dropToGround('player-install', PLAYER_INSTALL),
      ],
      2,
      SPRITE,
    ),
    dog: sheet(
      [
        dropToGround('dog-a', DOG_A),
        dropToGround('dog-b', DOG_B),
        dropToGround('dog-c', DOG_C),
        dropToGround('dog-d', DOG_D),
      ],
      2,
      SPRITE,
    ),
    cable: sheet([CABLE], 3),
    van: sheet([dropToGround('dolphin', VAN)], 3, CAR),
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

export const PLAYER_FRAME = { width: PLAYER_W * 2, height: PLAYER_H * 2 }
export const DOG_FRAME = { width: DOG_W * 2, height: DOG_H * 2 }
