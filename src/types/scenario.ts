export interface TrajectoryPoint {
  t: number
  x: number
  y: number
  heading: number
  speed: number
  accel: number
}

export type AgentType = 'ego' | 'vehicle' | 'pedestrian' | 'cyclist'

export interface Agent {
  id: string
  type: AgentType
  length?: number
  width?: number
  height?: number
  trajectory: TrajectoryPoint[]
}

export type QACategory = 'environment' | 'ego' | 'surrounding' | 'interaction'

export interface QAPair {
  category: QACategory
  question: string
  answer: string
  timestamp: number
}

export type IncidentType = 'hard_brake' | 'sudden_stop' | 'lane_change' | 'near_miss' | 'erratic_movement' | 'offroad' | 'wrong_way' | 'routine_update'

export interface Incident {
  id: string
  type: IncidentType
  timestamp: number
  x: number
  y: number
  description: string
  severity: 'low' | 'medium' | 'high'
}

export type MapFeatureType =
  | 'LaneCenter-Freeway' | 'LaneCenter-SurfaceStreet' | 'LaneCenter-BikeLane'
  | 'RoadLine-BrokenSingleWhite' | 'RoadLine-SolidSingleWhite' | 'RoadLine-SolidDoubleWhite'
  | 'RoadLine-BrokenSingleYellow' | 'RoadLine-BrokenDoubleYellow'
  | 'RoadLine-SolidSingleYellow' | 'RoadLine-SolidDoubleYellow' | 'RoadLine-PassingDoubleYellow'
  | 'RoadEdgeBoundary' | 'RoadEdgeMedian'
  | 'StopSign' | 'Crosswalk' | 'SpeedBump'
  | 'lane_boundary' | 'crosswalk' | 'stop_sign' | 'speed_bump' // Fallback types

export interface MapFeature {
  type: MapFeatureType
  points: { x: number; y: number }[]
}

export interface TrafficSignal {
  id: string
  x: number
  y: number
  state: number // 0-8 (Waymo palette)
  timestamp: number
}

export interface ParsedScenario {
  id: string
  egoId: string
  duration: number
  curTime: number
  agents: Agent[]
  qaPairs: QAPair[]
  incidents: Incident[]
  mapFeatures: MapFeature[]
  trafficSignals: TrafficSignal[]
}
