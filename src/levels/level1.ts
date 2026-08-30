import { INSTALL, TILE_SIZE } from '../config/constants.ts'
import { TileId, type LevelData, type LevelObject } from './types.ts'

const WIDTH = 236
const HEIGHT = 23
const GROUND_Y = 20

function emptyGrid(): number[][] {
  return Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => TileId.Empty))
}

function stamp(tiles: number[][], x: number, y: number, id: number): void {
  if (y < 0 || y >= HEIGHT || x < 0 || x >= WIDTH) return
  const row = tiles[y]
  if (!row) return
  row[x] = id
}

function fillRect(
  tiles: number[][],
  x: number,
  y: number,
  w: number,
  h: number,
  id: number,
): void {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      stamp(tiles, xx, yy, id)
    }
  }
}

function groundStrip(tiles: number[][], x0: number, x1: number): void {
  for (let x = x0; x < x1; x += 1) {
    stamp(tiles, x, GROUND_Y, TileId.Ground)
    stamp(tiles, x, GROUND_Y + 1, TileId.Fill)
    stamp(tiles, x, GROUND_Y + 2, TileId.Fill)
  }
}

function gap(tiles: number[][], x0: number, x1: number): void {
  for (let x = x0; x < x1; x += 1) {
    stamp(tiles, x, GROUND_Y, TileId.Empty)
    stamp(tiles, x, GROUND_Y + 1, TileId.Empty)
    stamp(tiles, x, GROUND_Y + 2, TileId.Empty)
  }
}

function platform(tiles: number[][], x: number, y: number, w: number, id: number = TileId.Platform): void {
  fillRect(tiles, x, y, w, 1, id)
}

function building(tiles: number[][], x: number, width: number, floors: number): void {
  const top = GROUND_Y - floors
  fillRect(tiles, x, top, width, floors, TileId.Brick)
  fillRect(tiles, x, top - 1, width, 1, TileId.Roof)
}

function px(tileX: number, tileY: number): { x: number; y: number } {
  return {
    x: tileX * TILE_SIZE + TILE_SIZE / 2,
    y: tileY * TILE_SIZE + TILE_SIZE / 2,
  }
}

export function createLevel1(): LevelData {
  const tiles = emptyGrid()
  const objects: LevelObject[] = []

  groundStrip(tiles, 0, WIDTH)

  // First street hurdle is a low crate on solid ground so a missed hop
  // does not dump you in a pit. The first real pit is the second gap.
  gap(tiles, 42, 48)
  gap(tiles, 72, 77)
  gap(tiles, 112, 118)
  gap(tiles, 162, 171)

  fillRect(tiles, 20, 19, 4, 1, TileId.Crate)
  platform(tiles, 43, 18, 3, TileId.Crate)
  platform(tiles, 72, 18, 5)

  fillRect(tiles, 30, 18, 2, 2, TileId.Crate)
  fillRect(tiles, 36, 19, 2, 1, TileId.Crate)

  // Rooftop climb: 2-tile steps, 3–5 tiles apart. Buildings block the street,
  // so this is the required route — not an optional secret.
  platform(tiles, 50, 18, 4, TileId.Crate)
  platform(tiles, 56, 16, 5)
  platform(tiles, 63, 14, 5)
  platform(tiles, 70, 13, 4)

  building(tiles, 78, 10, 6)
  platform(tiles, 74, 13, 3)
  building(tiles, 90, 8, 5)
  platform(tiles, 86, 12, 4)
  platform(tiles, 98, 14, 5)
  platform(tiles, 104, 12, 4)
  platform(tiles, 108, 15, 4)

  platform(tiles, 113, 18, 2)
  platform(tiles, 115, 16, 2)
  platform(tiles, 114, 15, 3)
  platform(tiles, 118, 15, 5)

  building(tiles, 124, 7, 4)
  platform(tiles, 132, 15, 5)
  platform(tiles, 140, 13, 4)

  platform(tiles, 163, 18, 2)
  platform(tiles, 166, 17, 2, TileId.Crate)
  platform(tiles, 169, 18, 2)

  fillRect(tiles, 176, 18, 3, 2, TileId.Brick)
  fillRect(tiles, 176, 17, 3, 1, TileId.Roof)
  platform(tiles, 182, 15, 5)
  platform(tiles, 190, 13, 4)

  building(tiles, 208, 18, 6)
  fillRect(tiles, 226, 0, 10, HEIGHT, TileId.Brick)

  objects.push(
    { type: 'van', ...px(4, GROUND_Y - 2) },
    { type: 'spawn', ...px(7, GROUND_Y - 2) },
    { type: 'cone', ...px(11, GROUND_Y - 1) },
    { type: 'checkpoint', x: 49 * TILE_SIZE + TILE_SIZE / 2, y: 0 },
    { type: 'checkpoint', x: 136 * TILE_SIZE + TILE_SIZE / 2, y: 0 },
    { type: 'cable', ...px(16, GROUND_Y - 1) },
    { type: 'cable', ...px(19, GROUND_Y - 1) },
    { type: 'cable', ...px(31, 17) },
    { type: 'cable', ...px(38, GROUND_Y - 1) },
    { type: 'cable', ...px(58, 15) },
    { type: 'cable', ...px(65, 13) },
    { type: 'cable', ...px(83, 12) },
    { type: 'cable', ...px(93, 13) },
    { type: 'cable', ...px(106, 11) },
    { type: 'cable', ...px(120, 14) },
    { type: 'cable', ...px(134, 14) },
    { type: 'cable', ...px(184, 14) },
    {
      type: 'dog',
      ...px(58, GROUND_Y - 1),
      minX: 48 * TILE_SIZE,
      maxX: 70 * TILE_SIZE,
    },
    {
      type: 'dog',
      ...px(148, GROUND_Y - 1),
      minX: 142 * TILE_SIZE,
      maxX: 158 * TILE_SIZE,
    },
    { type: 'wire', ...px(105, 9) },
    { type: 'wire', ...px(142, 10) },
    { type: 'house', ...px(214, GROUND_Y - 5) },
    { type: 'install', ...px(206, GROUND_Y - 1) },
  )

  for (const x of [80, 83, 86, 92, 95, 126, 128]) {
    objects.push({ type: 'window', ...px(x, GROUND_Y - 3) })
    objects.push({ type: 'window', ...px(x, GROUND_Y - 5) })
  }

  return {
    id: 'level-1',
    name: 'Ruta centro',
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    tiles,
    objects,
    requiredCables: INSTALL.requiredCables,
  }
}

export function countCables(level: LevelData): number {
  return level.objects.filter((object) => object.type === 'cable').length
}
