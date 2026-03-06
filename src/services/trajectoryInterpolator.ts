import type { TrajectoryPoint } from '../types/scenario'
import { lerp, lerpAngle } from '../utils/math'

export interface InterpolatedState {
  x: number
  y: number
  heading: number
  speed: number
  visible: boolean
}

export function interpolateAgent(
  trajectory: TrajectoryPoint[],
  time: number
): InterpolatedState {
  if (trajectory.length === 0) {
    return { x: 0, y: 0, heading: 0, speed: 0, visible: false }
  }

  const first = trajectory[0]
  const last = trajectory[trajectory.length - 1]

  if (time < first.t || time > last.t) {
    return { x: 0, y: 0, heading: 0, speed: 0, visible: false }
  }

  // Find surrounding keyframes
  let i = 0
  while (i < trajectory.length - 1 && trajectory[i + 1].t <= time) {
    i++
  }

  if (i >= trajectory.length - 1) {
    const p = trajectory[trajectory.length - 1]
    return { x: p.x, y: p.y, heading: p.heading, speed: p.speed, visible: true }
  }

  const a = trajectory[i]
  const b = trajectory[i + 1]
  const t = (time - a.t) / (b.t - a.t)

  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    heading: lerpAngle(a.heading, b.heading, t),
    speed: lerp(a.speed, b.speed, t),
    visible: true,
  }
}
