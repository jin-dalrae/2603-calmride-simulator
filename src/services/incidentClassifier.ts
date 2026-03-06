import type { Agent, Incident, IncidentType, TrajectoryPoint } from '../types/scenario'

const HARD_BRAKE_THRESHOLD = 6 // m/s²
const HEADING_CHANGE_THRESHOLD = 0.26 // ~15 degrees
const STOP_SPEED_THRESHOLD = 0.5 // m/s
const MIN_SPEED_FOR_BRAKE = 3 // m/s

export function classifyIncidents(agents: Agent[], egoId: string): Incident[] {
  const ego = agents.find(a => a.id === egoId)
  if (!ego) return []

  const incidents: Incident[] = []
  const traj = ego.trajectory
  let incidentCount = 0

  for (let i = 1; i < traj.length; i++) {
    const prev = traj[i - 1]
    const curr = traj[i]
    const dt = curr.t - prev.t
    if (dt <= 0) continue

    const decel = (prev.speed - curr.speed) / dt

    // Hard brake
    if (decel > HARD_BRAKE_THRESHOLD && prev.speed > MIN_SPEED_FOR_BRAKE) {
      incidents.push(makeIncident('hard_brake', curr, incidentCount++,
        `Hard braking detected: deceleration ${decel.toFixed(1)} m/s²`, 'high'))
    }

    // Sudden stop
    if (prev.speed > MIN_SPEED_FOR_BRAKE && curr.speed < STOP_SPEED_THRESHOLD) {
      const alreadyHasBrake = incidents.some(
        inc => inc.type === 'hard_brake' && Math.abs(inc.timestamp - curr.t) < 0.5
      )
      if (!alreadyHasBrake) {
        incidents.push(makeIncident('sudden_stop', curr, incidentCount++,
          `Sudden stop from ${prev.speed.toFixed(1)} m/s`, 'high'))
      }
    }

    // Lane change (heading change)
    if (i >= 2) {
      const prevPrev = traj[i - 2]
      const headingDelta = Math.abs(normalizeAngle(curr.heading - prevPrev.heading))
      if (headingDelta > HEADING_CHANGE_THRESHOLD && curr.speed > 2) {
        incidents.push(makeIncident('lane_change', curr, incidentCount++,
          `Lane change: heading change ${(headingDelta * 180 / Math.PI).toFixed(0)}°`, 'medium'))
      }
    }
  }

  return deduplicateIncidents(incidents)
}

function makeIncident(
  type: IncidentType, point: TrajectoryPoint, index: number,
  description: string, severity: 'low' | 'medium' | 'high'
): Incident {
  return {
    id: `incident-${index}`,
    type,
    timestamp: point.t,
    x: point.x,
    y: point.y,
    description,
    severity,
  }
}

function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI
  while (angle < -Math.PI) angle += 2 * Math.PI
  return angle
}

function deduplicateIncidents(incidents: Incident[]): Incident[] {
  const COOLDOWN = 1.0 // seconds
  const result: Incident[] = []
  for (const inc of incidents) {
    const hasDuplicate = result.some(
      existing => existing.type === inc.type && Math.abs(existing.timestamp - inc.timestamp) < COOLDOWN
    )
    if (!hasDuplicate) result.push(inc)
  }
  return result
}
