import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import type { MapFeature } from '../../types/scenario'

interface Props {
  features: MapFeature[]
}

export function RoadMap({ features }: Props) {
  const lines = useMemo(() => {
    return features
      .filter(f => f.points.length >= 2)
      .map((feature, i) => {
        const points = feature.points.map(p => [p.x, 0.05, -p.y] as [number, number, number])
        const color = feature.type === 'crosswalk' ? '#fbbf24'
          : feature.type === 'stop_sign' ? '#ef4444'
          : '#475569'
        return { points, color, key: `map-${i}` }
      })
  }, [features])

  return (
    <group>
      {lines.map(({ points, color, key }) => (
        <Line key={key} points={points} color={color} lineWidth={1.5} />
      ))}
    </group>
  )
}
