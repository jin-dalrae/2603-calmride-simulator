import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { Incident } from '../../types/scenario'

interface Props {
  incident: Incident
}

export function IncidentMarker({ incident }: Props) {
  const ringRef = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!ringRef.current) return
    const scale = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.2
    ringRef.current.scale.set(scale, scale, 1)
  })

  return (
    <mesh ref={ringRef} position={[incident.x, 0.2, -incident.y]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[3, 4, 32]} />
      <meshBasicMaterial color="#ef4444" opacity={0.6} transparent side={2} />
    </mesh>
  )
}
