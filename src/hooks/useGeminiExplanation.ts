import { useCallback } from 'react'
import { useScenarioStore } from '../store/useScenarioStore'
import { usePlaybackStore } from '../store/usePlaybackStore'
import { usePromptStore } from '../store/usePromptStore'
import { useExplanationStore } from '../store/useExplanationStore'
import { generateExplanation } from '../services/gemini'
import { interpolateAgent } from '../services/trajectoryInterpolator'
import type { Incident } from '../types/scenario'

export function useGeminiExplanation() {
  const triggerExplanation = useCallback(async (incident: Incident) => {
    const scenario = useScenarioStore.getState().currentScenario
    const currentTime = usePlaybackStore.getState().currentTime
    const promptConfig = usePromptStore.getState().getConfig()
    const { setLoading, setExplanation, setError } = useExplanationStore.getState()

    if (!scenario) return

    setLoading(true)

    // Get accumulated Q&A pairs up to current time
    const qaPairs = scenario.qaPairs.filter(qa => qa.timestamp <= currentTime)

    // Get ego speed
    const ego = scenario.agents.find(a => a.id === scenario.egoId)
    const egoState = ego ? interpolateAgent(ego.trajectory, currentTime) : null
    const egoSpeed = egoState?.speed || 0

    // Summarize nearby agents
    const nearbyAgents = scenario.agents
      .filter(a => a.id !== scenario.egoId)
      .map(a => {
        const state = interpolateAgent(a.trajectory, currentTime)
        if (!state.visible) return null
        const dist = Math.sqrt((state.x - (egoState?.x || 0)) ** 2 + (state.y - (egoState?.y || 0)) ** 2)
        if (dist > 50) return null
        return `${a.type} at ${dist.toFixed(0)}m, speed ${state.speed.toFixed(1)} m/s`
      })
      .filter(Boolean)
      .join('; ')

    try {
      const explanation = await generateExplanation(
        incident, qaPairs, egoSpeed, nearbyAgents, promptConfig
      )
      setExplanation(incident, explanation)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [])

  const regenerate = useCallback(async () => {
    const incident = useExplanationStore.getState().currentIncident
    if (incident) {
      await triggerExplanation(incident)
    }
  }, [triggerExplanation])

  return { triggerExplanation, regenerate }
}
