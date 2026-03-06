import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import type { Agent } from '../../types/scenario'
import { AGENT_COLORS } from '../../utils/colors'

interface Props {
  agent: Agent
  currentTime: number
}

export function TrajectoryLine({ agent, currentTime }: Props) {
  const color = AGENT_COLORS[agent.type]

  const { pastPoints, futurePoints } = useMemo(() => {
    const past: [number, number, number][] = []
    const future: [number, number, number][] = []

    for (const p of agent.trajectory) {
      const v: [number, number, number] = [p.x, 0.1, -p.y]
      if (p.t <= currentTime) {
        past.push(v)
      } else {
        if (past.length > 0 && future.length === 0) {
          future.push(past[past.length - 1])
        }
        future.push(v)
      }
    }

    return { pastPoints: past, futurePoints: future }
  }, [agent.trajectory, currentTime])

  return (
    <group>
      {pastPoints.length >= 2 && (
        <Line points={pastPoints} color={color} lineWidth={2} />
      )}
      {futurePoints.length >= 2 && (
        <Line points={futurePoints} color={color} lineWidth={1} opacity={0.3} transparent dashed dashSize={1} gapSize={0.5} />
      )}
    </group>
  )
}
