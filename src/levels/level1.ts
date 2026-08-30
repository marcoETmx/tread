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
  gap(tiles, 20, 25)
  gap(tiles, 42, 48)
  gap(tiles, 72, 77)
  gap(tiles, 112, 118)
  gap(tiles, 162, 171)

  platform(tiles, 21, 17, 3)
  platform(tiles, 43, 16, 3, TileId.Crate)
  platform(tiles, 73, 15, 3)
  platform(tiles, 113, 16, 2)
  platform(tiles, 115, 13, 3)
  platform(tiles, 163, 17, 3)
  platform(tiles, 167, 14, 3, TileId.Crate)

  fillRect(tiles, 30, 18, 2, 2, TileId.Crate)
  fillRect(tiles, 36, 19, 2, 1, TileId.Crate)
  platform(tiles, 52, 15, 6)
  platform(tiles, 60, 12, 4)

  building(tiles, 78, 10, 8)
  building(tiles, 90, 8, 6)
  platform(tiles, 86, 8, 5)
  platform(tiles, 98, 10, 4)

  building(tiles, 124, 7, 5)
  platform(tiles, 132, 12, 6)
  platform(tiles, 140, 9, 4)

  fillRect(tiles, 176, 17, 3, 3, TileId.Brick)
  fillRect(tiles, 176, 16, 3, 1, TileId.Roof)
  platform(tiles, 182, 15, 5)
  platform(tiles, 190, 12, 4)

  building(tiles, 208, 18, 9)
  fillRect(tiles, 226, 0, 10, HEIGHT, TileId.Brick)

  objects.push(
    { type: 'van', ...px(4, GROUND_Y - 2) },
    { type: 'spawn', ...px(7, GROUND_Y - 2) },
    { type: 'cone', ...px(11, GROUND_Y - 1) },
    { type: 'checkpoint', x: 8 * TILE_SIZE, y: 0 },
    { type: 'checkpoint', x: 80 * TILE_SIZE, y: 0 },
    { type: 'checkpoint', x: 148 * TILE_SIZE, y: 0 },
    { type: 'cable', ...px(16, GROUND_Y - 1) },
    { type: 'cable', ...px(19, GROUND_Y - 1) },
    { type: 'cable', ...px(31, 16) },
    { type: 'cable', ...px(38, GROUND_Y - 1) },
    { type: 'cable', ...px(55, 14) },
    { type: 'cable', ...px(62, 11) },
    { type: 'cable', ...px(83, 11) },
    { type: 'cable', ...px(93, 12) },
    { type: 'cable', ...px(116, 12) },
    { type: 'cable', ...px(134, 11) },
    { type: 'cable', ...px(151, GROUND_Y - 1) },
    { type: 'cable', ...px(184, 14) },
    {
      type: 'dog',
      ...px(58, GROUND_Y - 1),
      minX: 50 * TILE_SIZE,
      maxX: 70 * TILE_SIZE,
    },
    {
      type: 'dog',
      ...px(148, GROUND_Y - 1),
      minX: 142 * TILE_SIZE,
      maxX: 158 * TILE_SIZE,
    },
    { type: 'wire', ...px(122, 10) },
    { type: 'wire', ...px(137, 8) },
    { type: 'house', ...px(214, GROUND_Y - 5) },
    { type: 'install', ...px(206, GROUND_Y - 1) },
  )

  for (const x of [79, 82, 85, 91, 95, 126, 128]) {
    objects.push({ type: 'window', ...px(x, GROUND_Y - 4) })
    objects.push({ type: 'window', ...px(x, GROUND_Y - 6) })
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
