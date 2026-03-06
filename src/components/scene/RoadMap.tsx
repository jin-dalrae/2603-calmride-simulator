import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import type { MapFeature } from '../../types/scenario'

// Values taken from Waymax visualization/color.py
const ROAD_COLORS: Record<string, string> = {
  'LaneCenter-Freeway': '#e6e6e6',
  'LaneCenter-SurfaceStreet': '#e6e6e6',
  'LaneCenter-BikeLane': '#e6e6e6',
  'RoadLine-BrokenSingleWhite': '#8ce6ff',
  'RoadLine-SolidSingleWhite': '#59dbff',
  'RoadLine-SolidDoubleWhite': '#59dbff',
  'RoadLine-BrokenSingleYellow': '#f199ff',
  'RoadLine-BrokenDoubleYellow': '#f199ff',
  'RoadLine-SolidSingleYellow': '#787878',
  'RoadLine-SolidDoubleYellow': '#787878',
  'RoadLine-PassingDoubleYellow': '#787878',
  'RoadEdgeBoundary': '#505050',
  'RoadEdgeMedian': '#505050',
  'StopSign': '#ff0000',
  'Crosswalk': '#c8c8c8',
  'SpeedBump': '#c8c8c8',
  // Fallbacks
  'lane_boundary': '#475569',
  'lane_center': '#e6e6e6',
  'road_edge': '#505050',
  'crosswalk': '#c8c8c8',
}

interface Props {
  features: MapFeature[]
}

export function RoadMap({ features }: Props) {
  const renderedFeatures = useMemo(() => {
    return features
      .filter(f => f.points.length >= 2)
      .map((feature, i) => {
        const points = feature.points.map(p => [p.x, 0.05, -p.y] as [number, number, number])
        const color = ROAD_COLORS[feature.type] || '#475569'

        // Define line properties based on type
        const isCenter = feature.type.includes('LaneCenter')
        const isBoundary = feature.type.includes('RoadLine') || feature.type.includes('RoadEdge')
        const isDashed = feature.type.includes('Broken')

        return {
          points,
          color,
          key: `map-${feature.type}-${i}`,
          lineWidth: isCenter ? 0.8 : isBoundary ? 1.2 : 1.5,
          dashed: isDashed,
          opacity: isCenter ? 0.3 : 0.8,
          transparent: isCenter
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
          dashSize={feat.dashed ? 1 : undefined}
          gapSize={feat.dashed ? 0.5 : undefined}
        />
      ))}
    </group>
  )
}
