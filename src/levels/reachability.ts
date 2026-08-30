import { PLAYER, TILE_SIZE } from '../config/constants.ts'
import { TileId, type LevelData } from './types.ts'

const SOLID = new Set<number>([
  TileId.Ground,
  TileId.Fill,
  TileId.Brick,
  TileId.Roof,
  TileId.Platform,
  TileId.Crate,
])

export function isSolid(tiles: number[][], x: number, y: number): boolean {
  const row = tiles[y]
  if (!row || x < 0 || x >= row.length || y < 0) return false
  return SOLID.has(row[x] ?? -1)
}

export function standableTiles(tiles: number[][]): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = []
  for (let y = 1; y < tiles.length; y += 1) {
    const row = tiles[y]
    if (!row) continue
    for (let x = 0; x < row.length; x += 1) {
      if (isSolid(tiles, x, y) && !isSolid(tiles, x, y - 1)) {
        out.push({ x, y })
      }
    }
  }
  return out
}

export function maxJumpHeightPx(): number {
  return (PLAYER.jumpVelocity * PLAYER.jumpVelocity) / (2 * PLAYER.gravity)
}

export function canJumpBetween(dxTiles: number, upTiles: number): boolean {
  const dx = Math.abs(dxTiles) * TILE_SIZE
  const up = upTiles * TILE_SIZE
  const v = Math.abs(PLAYER.jumpVelocity)
  const g = PLAYER.gravity
  const maxH = maxJumpHeightPx()
  const slack = 8
  if (up > maxH - slack) return false

  const air = PLAYER.airSpeed
  const reachFactor = 0.9
  if (up <= 0) {
    const apex = maxH
    const fall = apex - up
    const t = v / g + Math.sqrt((2 * fall) / g)
    return dx <= air * t * reachFactor
  }

  const disc = v * v - 2 * g * up
  if (disc < 0) return false
  const tLand = (v + Math.sqrt(disc)) / g
  return dx <= air * tLand * reachFactor
}

export type ReachabilityReport = {
  maxJumpTiles: number
  reachedInstall: boolean
  cablesReachable: number
  cablesTotal: number
  unreachableCables: { x: number; y: number }[]
  spawnOk: boolean
}

export function checkLevelReachability(level: LevelData): ReachabilityReport {
  const tiles = level.tiles
  const spots = standableTiles(tiles)
  const spawn = level.objects.find((object) => object.type === 'spawn')
  const install = level.objects.find((object) => object.type === 'install')
  const cables = level.objects.filter((object) => object.type === 'cable')

  const key = (x: number, y: number) => `${x},${y}`
  const index = new Map(spots.map((spot) => [key(spot.x, spot.y), spot]))

  const tileAtPx = (px: number, py: number) => ({
    x: Math.floor(px / TILE_SIZE),
    y: Math.floor(py / TILE_SIZE),
  })

  const spawnTile = spawn ? tileAtPx(spawn.x, spawn.y) : { x: 7, y: 18 }
  const start =
    index.get(key(spawnTile.x, GROUND_STAND_Y(tiles, spawnTile.x))) ??
    nearestStand(spots, spawnTile.x, GROUND_STAND_Y(tiles, spawnTile.x))

  const seen = new Set<string>()
  const queue: { x: number; y: number }[] = []
  if (start) {
    seen.add(key(start.x, start.y))
    queue.push(start)
  }

  while (queue.length > 0) {
    const from = queue.pop()
    if (!from) break
    for (const to of spots) {
      const dest = key(to.x, to.y)
      if (seen.has(dest)) continue
      if (canJumpBetween(to.x - from.x, from.y - to.y)) {
        seen.add(dest)
        queue.push(to)
      }
    }
  }

  const reached = (px: number, py: number): boolean => {
    const tx = Math.floor(px / TILE_SIZE)
    const ty = Math.floor(py / TILE_SIZE)
    for (const [k, spot] of index) {
      if (!seen.has(k)) continue
      if (Math.abs(spot.x - tx) <= 1 && spot.y >= ty && spot.y - ty <= 2) return true
    }
    return false
  }

  const unreachableCables = cables
    .filter((cable) => !reached(cable.x, cable.y))
    .map((cable) => ({ x: cable.x, y: cable.y }))

  return {
    maxJumpTiles: maxJumpHeightPx() / TILE_SIZE,
    reachedInstall: install ? reached(install.x, install.y) : false,
    cablesReachable: cables.length - unreachableCables.length,
    cablesTotal: cables.length,
    unreachableCables,
    spawnOk: Boolean(start),
  }
}

function GROUND_STAND_Y(tiles: number[][], x: number): number {
  for (let y = 0; y < tiles.length; y += 1) {
    if (isSolid(tiles, x, y) && !isSolid(tiles, x, y - 1)) return y
  }
  return 20
}

function nearestStand(
  spots: { x: number; y: number }[],
  x: number,
  y: number,
): { x: number; y: number } | undefined {
  return spots.find((spot) => Math.abs(spot.x - x) <= 1 && Math.abs(spot.y - y) <= 1)
}
