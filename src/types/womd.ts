export interface WOMDRawScenario {
  sid: string
  ego: string
  cur_time: number
  future_time: number
  env_q: string[]
  env_a: string[]
  ego_q: string[]
  ego_a: string[]
  sur_q: string[]
  sur_a: string[]
  int_q: string[]
  int_a: string[]
  agents?: WOMDRawAgent[]
  map_features?: WOMDRawMapFeature[]
}

export interface WOMDRawAgent {
  id: string
  type: 'vehicle' | 'pedestrian' | 'cyclist'
  trajectory: WOMDRawTrajectoryPoint[]
}

export interface WOMDRawTrajectoryPoint {
  t: number
  x: number
  y: number
  heading: number
  vx?: number
  vy?: number
}

export interface WOMDRawMapFeature {
  type: 'lane_boundary' | 'crosswalk' | 'stop_sign' | 'speed_bump'
  polyline: { x: number; y: number }[]
}
