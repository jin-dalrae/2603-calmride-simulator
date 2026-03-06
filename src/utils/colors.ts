import type { AgentType } from '../types/scenario'

export const AGENT_COLORS: Record<AgentType, string> = {
  ego: '#3b82f6',
  vehicle: '#6b7280',
  pedestrian: '#22c55e',
  cyclist: '#f97316',
}

export const AGENT_HEX: Record<AgentType, number> = {
  ego: 0x3b82f6,
  vehicle: 0x6b7280,
  pedestrian: 0x22c55e,
  cyclist: 0xf97316,
}
