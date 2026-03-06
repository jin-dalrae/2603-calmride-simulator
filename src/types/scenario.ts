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
  trajectory: TrajectoryPoint[]
}

export type QACategory = 'environment' | 'ego' | 'surrounding' | 'interaction'

export interface QAPair {
  category: QACategory
  question: string
  answer: string
  timestamp: number
}

export type IncidentType = 'hard_brake' | 'sudden_stop' | 'lane_change' | 'near_miss' | 'erratic_movement'

export interface Incident {
  id: string
  type: IncidentType
  timestamp: number
  x: number
  y: number
  description: string
  severity: 'low' | 'medium' | 'high'
}

export interface MapFeature {
  type: 'lane_boundary' | 'crosswalk' | 'stop_sign' | 'speed_bump'
  points: { x: number; y: number }[]
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
}
