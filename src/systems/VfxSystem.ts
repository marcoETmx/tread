import Phaser from 'phaser'
import { theme } from '../config/theme.ts'

function puff(
  scene: Phaser.Scene,
  texture: string,
  x: number,
  y: number,
  count: number,
  spreadX: number,
  spreadY: number,
  duration: number,
  depth = 20,
): void {
  for (let i = 0; i < count; i += 1) {
    const sprite = scene.add.image(x, y, texture).setDepth(depth).setScale(0.6 + Math.random() * 0.7)
    scene.tweens.add({
      targets: sprite,
      x: x + Phaser.Math.Between(-spreadX, spreadX),
      y: y + Phaser.Math.Between(-spreadY, Math.floor(spreadY * 0.3)),
      alpha: 0,
      scale: 0.2,
      duration: duration + Phaser.Math.Between(-40, 80),
      onComplete: () => sprite.destroy(),
    })
  }
}

export function spawnDust(scene: Phaser.Scene, x: number, y: number): void {
  puff(scene, 'dust', x, y + 18, 3, 18, 10, 220, 9)
}

export function spawnLandDust(scene: Phaser.Scene, x: number, y: number): void {
  puff(scene, 'dust', x, y + 22, 6, 28, 14, 280, 9)
}

export function spawnSparks(scene: Phaser.Scene, x: number, y: number, count = 10): void {
  puff(scene, 'spark', x, y, count, 44, 50, 380, 22)
}

export function spawnDebris(scene: Phaser.Scene, x: number, y: number): void {
  puff(scene, 'debris', x, y, 8, 50, 40, 420, 22)
  puff(scene, 'spark', x, y, 6, 36, 36, 300, 22)
}

export function spawnPickupBurst(scene: Phaser.Scene, x: number, y: number): void {
  spawnSparks(scene, x, y, 14)
  const ring = scene.add.circle(x, y, 8, theme.orange, 0.7).setDepth(21)
  scene.tweens.add({
    targets: ring,
    scale: 3.2,
    alpha: 0,
    duration: 280,
    onComplete: () => ring.destroy(),
  })
}

export function floatScore(scene: Phaser.Scene, x: number, y: number, text: string): void {
  const label = scene.add
    .text(x, y, text, {
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      fontSize: '18px',
      fontStyle: '900',
      color: theme.orangeHex,
      stroke: theme.inkHex,
      strokeThickness: 4,
    })
    .setOrigin(0.5)
    .setDepth(24)
  scene.tweens.add({
    targets: label,
    y: y - 36,
    alpha: 0,
    duration: 520,
    onComplete: () => label.destroy(),
  })
}
