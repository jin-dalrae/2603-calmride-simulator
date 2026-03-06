import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { Agent } from '../../types/scenario'
import { interpolateAgent } from '../../services/trajectoryInterpolator'

interface Props {
  agent: Agent
  time: number
}

export function EgoVehicle({ agent, time }: Props) {
  const meshRef = useRef<Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    const state = interpolateAgent(agent.trajectory, time)
    if (!state.visible) {
      meshRef.current.visible = false
      return
    }
    meshRef.current.visible = true
    meshRef.current.position.set(state.x, 0.5, -state.y)
    meshRef.current.rotation.set(0, -state.heading + Math.PI / 2, 0)
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[4.5, 1.5, 2]} />
      <meshStandardMaterial color="#3b82f6" />
    </mesh>
  )
}
