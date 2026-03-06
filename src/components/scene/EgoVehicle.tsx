import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import type { Mesh, Group } from 'three'
import type { Agent } from '../../types/scenario'
import { interpolateAgent } from '../../services/trajectoryInterpolator'

interface Props {
  agent: Agent
  time: number
}

// Waymax 'controlled' color
const EGO_COLOR = '#0099cc'

export function EgoVehicle({ agent, time }: Props) {
  const groupRef = useRef<Group>(null)

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

  const width = agent.width || 2.0
  const height = agent.height || 1.5
  const length = agent.length || 4.5

  return (
    <group ref={groupRef}>
      {/* Chassis */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width, height, length]} />
        <meshStandardMaterial color={EGO_COLOR} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Roof Sensor Pod (Waymo style) */}
      <mesh position={[0, 1.6, -0.2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.4, 16]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      {/* Headlights (Front indicator) */}
      <mesh position={[0.7, 0.6, 2.25]}>
        <boxGeometry args={[0.4, 0.2, 0.1]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
      </mesh>
      <mesh position={[-0.7, 0.6, 2.25]}>
        <boxGeometry args={[0.4, 0.2, 0.1]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        rotation={[Math.PI / 2, Math.PI, 0]} // View from top
      >
        EGO (SDC)
      </Text>
    </group>
  )
}
