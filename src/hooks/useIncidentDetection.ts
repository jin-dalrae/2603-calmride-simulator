import { useEffect, useRef } from 'react'
import { useScenarioStore } from '../store/useScenarioStore'
import { usePlaybackStore } from '../store/usePlaybackStore'
import type { Incident } from '../types/scenario'

export function useIncidentDetection(onIncident: (incident: Incident) => void) {
  const scenario = useScenarioStore(s => s.currentScenario)
  const currentTime = usePlaybackStore(s => s.currentTime)
  const firedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    firedRef.current.clear()
  }, [scenario?.id])

  useEffect(() => {
    if (!scenario) return

    for (const incident of scenario.incidents) {
      if (incident.timestamp <= currentTime && !firedRef.current.has(incident.id)) {
        firedRef.current.add(incident.id)
        onIncident(incident)
      }
    }
  }, [currentTime, scenario, onIncident])
}
