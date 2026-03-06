import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { Agent } from '../../types/scenario'
import { interpolateAgent } from '../../services/trajectoryInterpolator'
import { AGENT_HEX } from '../../utils/colors'

interface Props {
  agent: Agent
  time: number
}

export function SurroundingAgent({ agent, time }: Props) {
  const meshRef = useRef<Mesh>(null)
  const color = AGENT_HEX[agent.type]

  const size: [number, number, number] = agent.type === 'pedestrian'
    ? [0.8, 1.8, 0.8]
    : agent.type === 'cyclist'
    ? [1.8, 1.2, 0.8]
    : [4, 1.4, 1.8]

  useFrame(() => {
    if (!meshRef.current) return
    const state = interpolateAgent(agent.trajectory, time)
    if (!state.visible) {
      meshRef.current.visible = false
      return
    }
    meshRef.current.visible = true
    meshRef.current.position.set(state.x, size[1] / 2, -state.y)
    meshRef.current.rotation.set(0, -state.heading + Math.PI / 2, 0)
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} opacity={0.85} transparent />
    </mesh>
  )
}
