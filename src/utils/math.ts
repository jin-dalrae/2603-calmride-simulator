export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI
  while (angle < -Math.PI) angle += 2 * Math.PI
  return angle
}

export function lerpAngle(a: number, b: number, t: number): number {
  let diff = normalizeAngle(b - a)
  return a + diff * t
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
