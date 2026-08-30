import { createLevel1 } from '../src/levels/level1.ts'
import { checkLevelReachability, maxJumpHeightPx } from '../src/levels/reachability.ts'
import { TILE_SIZE } from '../src/config/constants.ts'

const report = checkLevelReachability(createLevel1())
console.log(
  JSON.stringify(
    {
      ...report,
      maxJumpPx: Math.round(maxJumpHeightPx()),
      maxJumpTiles: Number((maxJumpHeightPx() / TILE_SIZE).toFixed(2)),
    },
    null,
    2,
  ),
)

if (!report.spawnOk) {
  console.error('Spawn is not on a standable tile')
  process.exit(1)
}
if (!report.reachedInstall) {
  console.error('Install box is not reachable from spawn')
  process.exit(1)
}
if (report.cablesReachable < 8) {
  console.error(`Only ${report.cablesReachable}/${report.cablesTotal} cables are reachable; need 8`)
  process.exit(1)
}
if (report.unreachableCables.length > 0) {
  console.error('Some cables are unreachable', report.unreachableCables)
  process.exit(1)
}

console.log('All required jumps are passable.')
