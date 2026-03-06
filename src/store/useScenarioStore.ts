import { create } from 'zustand'
import type { ParsedScenario } from '../types/scenario'
import type { WOMDRawScenario } from '../types/womd'
import { parseScenario } from '../services/scenarioParser'

interface ScenarioState {
  availableScenarios: string[]
  currentScenario: ParsedScenario | null
  loading: boolean
  error: string | null
  loadScenarioList: () => Promise<void>
  loadScenario: (filename: string) => Promise<void>
}

const SCENARIO_FILES = [
  'scenario-intersection-stop.json',
  'scenario-highway-lanechange.json',
  'scenario-pedestrian-crossing.json',
]

export const useScenarioStore = create<ScenarioState>((set) => ({
  availableScenarios: SCENARIO_FILES,
  currentScenario: null,
  loading: false,
  error: null,

  loadScenarioList: async () => {
    set({ availableScenarios: SCENARIO_FILES })
  },

  loadScenario: async (filename: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/sample-scenarios/${filename}`)
      if (!response.ok) throw new Error(`Failed to load ${filename}`)
      const raw: WOMDRawScenario = await response.json()
      const parsed = parseScenario(raw)
      set({ currentScenario: parsed, loading: false })
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },
}))
