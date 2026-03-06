import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import type { Group } from 'three'
import type { Agent } from '../../types/scenario'
import { interpolateAgent } from '../../services/trajectoryInterpolator'
import { AGENT_HEX } from '../../utils/colors'

interface Props {
  agent: Agent
  time: number
}

export function SurroundingAgent({ agent, time }: Props) {
  const groupRef = useRef<Group>(null)
  const color = AGENT_HEX[agent.type] || '#666666'

  const dim: [number, number, number] = [
    agent.width || (agent.type === 'pedestrian' ? 0.6 : 2.0),
    agent.height || (agent.type === 'pedestrian' ? 1.8 : 1.4),
    agent.length || (agent.type === 'pedestrian' ? 0.6 : 4.0)
  ]

  useFrame(() => {
    if (!groupRef.current) return
    const state = interpolateAgent(agent.trajectory, time)
    if (!state.visible) {
      groupRef.current.visible = false
      return
    }
    groupRef.current.visible = true
    groupRef.current.position.set(state.x, 0, -state.y)
    groupRef.current.rotation.set(0, -state.heading + Math.PI / 2, 0)
  })

  return (
    <group ref={groupRef}>
      {/* Main Body */}
      <mesh position={[0, dim[1] / 2, 0]}>
        {agent.type === 'pedestrian' ? (
          <capsuleGeometry args={[dim[0] / 2, dim[1] - dim[0], 4, 8]} />
        ) : (
          <boxGeometry args={dim} />
        )}
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.8}
          roughness={0.4}
        />
      </mesh>

      {/* Heading Indicator for vehicles/cyclists */}
      {(agent.type === 'vehicle' || agent.type === 'cyclist') && (
        <mesh position={[0, dim[1] * 0.7, dim[2] / 2]}>
          <boxGeometry args={[dim[0] * 0.8, 0.1, 0.2]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" />
        </mesh>
      )}

      {/* Label for visibility */}
      <Text
        position={[0, dim[1] + 0.5, 0]}
        fontSize={0.6}
        color={color}
        anchorX="center"
        anchorY="middle"
        rotation={[Math.PI / 2, Math.PI, 0]} // View from top
      >
        {agent.type.toUpperCase()}
      </Text>
    </group>
  )
}
