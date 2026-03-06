import { create } from 'zustand'
import type { Personality, PromptConfig, ToneSettings } from '../types/prompt'

interface PromptState extends PromptConfig {
  setSystemPrompt: (p: string) => void
  setPersonality: (p: Personality) => void
  setTone: (t: Partial<ToneSettings>) => void
  getConfig: () => PromptConfig
}

export const usePromptStore = create<PromptState>((set, get) => ({
  systemPrompt: 'You are CalmRide, an AI communication system for autonomous vehicles. Your job is to explain vehicle behavior to passengers in a way that reduces anxiety and builds trust.',
  personality: 'friendly',
  tone: {
    anxietyLevel: 50,
    technicalDepth: 30,
    verbosity: 50,
  },

  setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
  setPersonality: (personality) => set({ personality }),
  setTone: (partial) => set(s => ({ tone: { ...s.tone, ...partial } })),
  getConfig: () => {
    const { systemPrompt, personality, tone } = get()
    return { systemPrompt, personality, tone }
  },
}))
