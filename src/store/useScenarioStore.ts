import { create } from 'zustand'
import type { ParsedScenario, Incident, IncidentType } from '../types/scenario'
import type { WOMDRawScenario } from '../types/womd'
import { parseScenario } from '../services/scenarioParser'
import {
  isBackendAvailable,
  fetchScenarioList,
  fetchScenario,
  type ScenarioSummary,
  type BackendScenario,
} from '../services/api'

interface ScenarioState {
  availableScenarios: string[]
  scenarioSummaries: ScenarioSummary[]
  currentScenario: ParsedScenario | null
  loading: boolean
  error: string | null
  backendConnected: boolean
  waymaxAvailable: boolean
  loadScenarioList: () => Promise<void>
  loadScenario: (idOrFilename: string) => Promise<void>
}

const SAMPLE_FILES = [
  'scenario-intersection-stop.json',
  'scenario-highway-lanechange.json',
  'scenario-pedestrian-crossing.json',
]

/**
 * Convert a backend scenario response into the frontend ParsedScenario type.
 */
function backendToFrontend(backend: BackendScenario): ParsedScenario {
  return {
    id: backend.id,
    egoId: backend.ego_id,
    duration: backend.duration,
    curTime: backend.cur_time,
    agents: backend.agents.map(a => ({
      id: a.id,
      type: a.type,
      trajectory: a.trajectory,
    })),
    qaPairs: backend.qa_pairs.map(qa => ({
      category: qa.category,
      question: qa.question,
      answer: qa.answer,
      timestamp: qa.timestamp,
    })),
    incidents: backend.incidents.map(i => ({
      id: i.id,
      type: i.type as IncidentType,
      timestamp: i.timestamp,
      x: i.x,
      y: i.y,
      description: i.description,
      severity: i.severity,
    })),
    mapFeatures: backend.map_features.map(f => ({
      type: f.type as any,
      points: f.points,
    })),
  }
}

export const useScenarioStore = create<ScenarioState>((set, get) => ({
  availableScenarios: SAMPLE_FILES,
  scenarioSummaries: [],
  currentScenario: null,
  loading: false,
  error: null,
  backendConnected: false,
  waymaxAvailable: false,

  loadScenarioList: async () => {
    // Try backend first
    try {
      const backendUp = await isBackendAvailable()
      if (backendUp) {
        const summaries = await fetchScenarioList()
        set({
          backendConnected: true,
          scenarioSummaries: summaries,
          availableScenarios: summaries.map(s => s.id),
        })
        return
      }
    } catch {
      // Backend not available — fall back
    }

    set({
      backendConnected: false,
      availableScenarios: SAMPLE_FILES,
    })
  },

  loadScenario: async (idOrFilename: string) => {
    set({ loading: true, error: null })

    const { backendConnected } = get()

    try {
      if (backendConnected) {
        // Load from backend API
        const backend = await fetchScenario(idOrFilename)
        const parsed = backendToFrontend(backend)
        set({ currentScenario: parsed, loading: false })
      } else {
        // Fallback: load from local sample files
        const response = await fetch(`/sample-scenarios/${idOrFilename}`)
        if (!response.ok) throw new Error(`Failed to load ${idOrFilename}`)
        const raw: WOMDRawScenario = await response.json()
        const parsed = parseScenario(raw)
        set({ currentScenario: parsed, loading: false })
      }
    } catch (err) {
      set({ error: (err as Error).message, loading: false })
    }
  },
}))
