import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import type { MapFeature } from '../../types/scenario'

// Values taken from Waymax visualization/color.py
const ROAD_COLORS: Record<string, string> = {
  'LaneCenter-Freeway': '#334155',
  'LaneCenter-SurfaceStreet': '#334155',
  'LaneCenter-BikeLane': '#334155',
  'RoadLine-BrokenSingleWhite': '#64748b',
  'RoadLine-SolidSingleWhite': '#94a3b8',
  'RoadLine-SolidDoubleWhite': '#94a3b8',
  'RoadLine-BrokenSingleYellow': '#f59e0b',
  'RoadLine-BrokenDoubleYellow': '#f59e0b',
  'RoadLine-SolidSingleYellow': '#b45309',
  'RoadLine-SolidDoubleYellow': '#b45309',
  'RoadLine-PassingDoubleYellow': '#b45309',
  'RoadEdgeBoundary': '#1e293b',
  'RoadEdgeMedian': '#1e293b',
  'StopSign': '#ef4444',
  'Crosswalk': '#475569',
  'SpeedBump': '#475569',
  'lane_boundary': '#334155',
  'lane_center': '#1e293b',
  'road_edge': '#0f172a',
  'crosswalk': '#334155',
}

interface Props {
  features: MapFeature[]
}

export function RoadMap({ features }: Props) {
  const renderedFeatures = useMemo(() => {
    return features
      .filter(f => f.points.length >= 2)
      .map((feature, i) => {
        const points = feature.points.map(p => [p.x, 0.02, -p.y] as [number, number, number])
        const color = ROAD_COLORS[feature.type] || '#334155'

        const isCenter = feature.type.includes('LaneCenter')
        const isBoundary = feature.type.includes('RoadLine') || feature.type.includes('RoadEdge')
        const isDashed = feature.type.includes('Broken')

        return {
          points,
          color,
          key: `map-${feature.type}-${i}`,
          lineWidth: isCenter ? 1 : isBoundary ? 2 : 3,
          dashed: isDashed,
          opacity: isCenter ? 0.2 : 0.6,
          transparent: true
        }
      })
  }, [features])

  return (
    <group>
      {renderedFeatures.map((feat) => (
        <Line
          key={feat.key}
          points={feat.points}
          color={feat.color}
          lineWidth={feat.lineWidth}
          transparent={feat.transparent}
          opacity={feat.opacity}
          dashed={feat.dashed}
          dashSize={feat.dashed ? 0.8 : undefined}
          gapSize={feat.dashed ? 0.4 : undefined}
        />
      ))}
    </group>
  )
}
