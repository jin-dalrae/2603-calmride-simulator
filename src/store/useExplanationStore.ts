import { create } from 'zustand'
import type { ChannelExplanation } from '../types/channels'
import type { Incident } from '../types/scenario'

interface ExplanationEntry {
  incident: Incident
  explanation: ChannelExplanation
  timestamp: number
}

interface ExplanationState {
  current: ChannelExplanation | null
  currentIncident: Incident | null
  history: ExplanationEntry[]
  loading: boolean
  error: string | null
  setExplanation: (incident: Incident, explanation: ChannelExplanation) => void
  setLoading: (l: boolean) => void
  setError: (e: string | null) => void
  clear: () => void
}

export const useExplanationStore = create<ExplanationState>((set) => ({
  current: null,
  currentIncident: null,
  history: [],
  loading: false,
  error: null,

  setExplanation: (incident, explanation) => set(s => ({
    current: explanation,
    currentIncident: incident,
    history: [...s.history, { incident, explanation, timestamp: Date.now() }],
    loading: false,
    error: null,
  })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
  clear: () => set({ current: null, currentIncident: null, history: [], error: null }),
}))
