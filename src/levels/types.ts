export type LevelObjectType =
  | 'spawn'
  | 'cable'
  | 'dog'
  | 'wire'
  | 'install'
  | 'van'
  | 'house'
  | 'checkpoint'
  | 'cone'
  | 'window'

export type LevelObject = {
  type: LevelObjectType
  x: number
  y: number
  minX?: number
  maxX?: number
}

export type LevelData = {
  id: string
  name: string
  tileWidth: number
  tileHeight: number
  tiles: number[][]
  objects: LevelObject[]
  requiredCables: number
}

export const TileId = {
  Empty: 0,
  Ground: 1,
  Fill: 2,
  Brick: 3,
  Roof: 4,
  Platform: 5,
  Crate: 6,
} as const

export type TileIdValue = (typeof TileId)[keyof typeof TileId]
