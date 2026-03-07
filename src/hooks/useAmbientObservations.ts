import { useEffect, useRef } from 'react'
import { useScenarioStore } from '../store/useScenarioStore'
import { usePlaybackStore } from '../store/usePlaybackStore'
import { useExplanationStore } from '../store/useExplanationStore'
import { interpolateAgent } from '../services/trajectoryInterpolator'
import type { ChannelExplanation, AgentMessage } from '../types/channels'
import type { Agent } from '../types/scenario'

/**
 * Generates ambient observations from real WOMD vision data:
 * spatial relationships, relative velocities, crossing paths,
 * approach vectors, lane positions, and trajectory predictions.
 */
export function useAmbientObservations() {
  const lastFireTime = useRef(0)
  const firedCount = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const scenario = useScenarioStore.getState().currentScenario
      const time = usePlaybackStore.getState().currentTime
      const isPlaying = usePlaybackStore.getState().isPlaying
      const { current, loading } = useExplanationStore.getState()

      if (!scenario || !isPlaying || loading) return
      if (current && !useExplanationStore.getState().consensusReached) return
      if (Math.abs(time - lastFireTime.current) < 5) return

      const ego = scenario.agents.find(a => a.id === scenario.egoId)
      if (!ego) return
      const egoState = interpolateAgent(ego.trajectory, time)
      if (!egoState.visible) return

      // Also get ego state slightly in the future for trajectory prediction
      const egoFuture = interpolateAgent(ego.trajectory, time + 1.0)

      const nearby = scenario.agents
        .filter(a => a.id !== scenario.egoId)
        .map(a => {
          const state = interpolateAgent(a.trajectory, time)
          if (!state.visible) return null
          const dist = Math.sqrt(
            (state.x - egoState.x) ** 2 + (state.y - egoState.y) ** 2
          )
          if (dist > 80) return null

          // Future state for trajectory prediction
          const futureState = interpolateAgent(a.trajectory, time + 1.0)
          const futureDist = futureState.visible
            ? Math.sqrt((futureState.x - (egoFuture.visible ? egoFuture.x : egoState.x)) ** 2 +
                        (futureState.y - (egoFuture.visible ? egoFuture.y : egoState.y)) ** 2)
            : dist

          // Compute spatial relationship relative to ego heading
          const dx = state.x - egoState.x
          const dy = state.y - egoState.y
          const cosH = Math.cos(egoState.heading)
          const sinH = Math.sin(egoState.heading)
          // Project onto ego's forward/lateral axes
          const forward = dx * cosH + dy * sinH   // positive = ahead
          const lateral = -dx * sinH + dy * cosH   // positive = left

          // Heading difference (are they going same direction, crossing, oncoming?)
          const headingDiff = normalizeAngle(state.heading - egoState.heading)

          // Closing rate (negative = approaching)
          const closingRate = futureDist - dist // per second

          return {
            agent: a,
            state,
            futureState,
            dist,
            futureDist,
            forward,
            lateral,
            headingDiff,
            closingRate,
            position: getRelativePosition(forward, lateral),
            direction: getRelativeDirection(headingDiff),
            approaching: closingRate < -0.5,
            receding: closingRate > 0.5,
            crossingPath: Math.abs(headingDiff) > 0.5 && Math.abs(headingDiff) < 2.6 && dist < 30,
          }
        })
        .filter((a): a is NonNullable<typeof a> => a !== null)
        .sort((a, b) => a.dist - b.dist)

      if (nearby.length === 0) return

      lastFireTime.current = time
      firedCount.current++

      const observation = buildVisionObservation(egoState, nearby, time)
      if (!observation) return

      const { setExplanation } = useExplanationStore.getState()
      setExplanation(
        {
          id: `ambient-${firedCount.current}`,
          type: 'routine_update',
          timestamp: time,
          x: egoState.x,
          y: egoState.y,
          description: 'Vision data observation',
          severity: 'low',
        },
        observation
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])
}

function normalizeAngle(a: number): number {
  while (a > Math.PI) a -= 2 * Math.PI
  while (a < -Math.PI) a += 2 * Math.PI
  return a
}

function getRelativePosition(forward: number, lateral: number): string {
  const fwd = forward > 3 ? 'ahead' : forward < -3 ? 'behind' : 'alongside'
  const lat = lateral > 2 ? 'left' : lateral < -2 ? 'right' : ''
  if (lat && fwd !== 'alongside') return `${fwd}-${lat}`
  return lat || fwd
}

function getRelativeDirection(headingDiff: number): string {
  const abs = Math.abs(headingDiff)
  if (abs < 0.3) return 'same direction'
  if (abs > 2.8) return 'oncoming'
  if (headingDiff > 0) return 'crossing left-to-right'
  return 'crossing right-to-left'
}

interface EnrichedAgent {
  agent: Agent
  state: { x: number; y: number; heading: number; speed: number }
  futureState: { x: number; y: number; heading: number; speed: number; visible: boolean }
  dist: number
  futureDist: number
  forward: number
  lateral: number
  headingDiff: number
  closingRate: number
  position: string
  direction: string
  approaching: boolean
  receding: boolean
  crossingPath: boolean
}

function buildVisionObservation(
  egoState: { x: number; y: number; heading: number; speed: number },
  nearby: EnrichedAgent[],
  time: number,
): ChannelExplanation | null {
  const egoSpeedMph = (egoState.speed * 2.237).toFixed(0)
  const egoSpeedKmh = (egoState.speed * 3.6).toFixed(0)
  const closest = nearby[0]
  const peds = nearby.filter(a => a.agent.type === 'pedestrian')
  const cyclists = nearby.filter(a => a.agent.type === 'cyclist')
  const vehicles = nearby.filter(a => a.agent.type === 'vehicle')
  const approaching = nearby.filter(a => a.approaching)
  const crossing = nearby.filter(a => a.crossingPath)

  const messages: AgentMessage[] = []

  // === OPERATIONAL: Full vision scan with spatial detail ===
  const zoneBreakdown = [
    { label: 'forward', agents: nearby.filter(a => a.forward > 3) },
    { label: 'lateral', agents: nearby.filter(a => Math.abs(a.forward) <= 3) },
    { label: 'rear', agents: nearby.filter(a => a.forward < -3) },
  ].filter(z => z.agents.length > 0)

  const zoneSummary = zoneBreakdown
    .map(z => `${z.label}: ${z.agents.length} (closest ${z.agents[0].dist.toFixed(1)}m)`)
    .join(' | ')

  messages.push({
    speaker: 'Operational',
    text: `VISION SCAN T+${time.toFixed(1)}s — ${nearby.length} objects detected. ` +
      `Zones: [${zoneSummary}]. ` +
      `${approaching.length > 0 ? `${approaching.length} approaching (rate: ${approaching[0].closingRate.toFixed(1)} m/s). ` : ''}` +
      `${crossing.length > 0 ? `WARNING: ${crossing.length} crossing trajectory detected. ` : ''}` +
      `Ego: ${egoSpeedKmh} km/h, heading ${(egoState.heading * 180 / Math.PI).toFixed(0)}°.`,
  })

  // === COMFORT: Context-aware reassurance using vision data ===
  if (crossing.length > 0) {
    const crosser = crossing[0]
    const label = crosser.agent.type === 'pedestrian' ? 'A person' :
                  crosser.agent.type === 'cyclist' ? 'A cyclist' : 'A vehicle'
    messages.push({
      speaker: 'Comfort',
      text: `${label} is crossing our path ${crosser.position}, ${crosser.dist.toFixed(0)}m away. ` +
        `They're moving ${crosser.direction} at ${crosser.state.speed.toFixed(1)} m/s. ` +
        (crosser.dist > 15
          ? `Plenty of time and space — no need to worry.`
          : crosser.dist > 8
          ? `We're tracking them carefully. Safe margin maintained.`
          : `We see them and are prepared to adjust. You're safe.`),
    })
  } else if (peds.length > 0) {
    const ped = peds[0]
    const pedAction = ped.state.speed < 0.3 ? 'standing still' :
                      ped.state.speed < 1.0 ? 'walking slowly' : 'walking'
    messages.push({
      speaker: 'Comfort',
      text: `Pedestrian detected ${ped.position}, ${ped.dist.toFixed(0)}m away, ${pedAction} (${ped.state.speed.toFixed(1)} m/s). ` +
        `Moving ${ped.direction}. ` +
        (ped.approaching
          ? `They're getting closer but we're watching. ${ped.dist > 10 ? 'No concern yet.' : 'Ready to yield if needed.'}`
          : `${ped.receding ? 'Moving away from us.' : 'Holding steady.'} No worries.`),
    })
  } else if (cyclists.length > 0) {
    const cyc = cyclists[0]
    messages.push({
      speaker: 'Comfort',
      text: `Cyclist ${cyc.position} at ${cyc.dist.toFixed(0)}m, ${cyc.direction}, speed ${cyc.state.speed.toFixed(1)} m/s. ` +
        (cyc.approaching
          ? `Approaching — giving extra clearance.`
          : `Maintaining safe buffer. Ride on.`),
    })
  } else {
    const closestVeh = vehicles[0]
    if (closestVeh) {
      messages.push({
        speaker: 'Comfort',
        text: `Nearest vehicle is ${closestVeh.position}, ${closestVeh.dist.toFixed(0)}m away, ` +
          `${closestVeh.direction} at ${(closestVeh.state.speed * 3.6).toFixed(0)} km/h. ` +
          (closestVeh.approaching ? 'Closing in slowly — normal traffic flow.' : 'Stable spacing.') +
          ` Everything looks routine.`,
      })
    }
  }

  // === TECHNICAL: Detailed perception metrics ===
  const top3 = nearby.slice(0, 3)
  const techLines = top3.map((a, i) => {
    const ttc = a.approaching && Math.abs(a.closingRate) > 0.1
      ? (a.dist / Math.abs(a.closingRate)).toFixed(1) + 's'
      : '∞'
    return `[${i + 1}] ${a.agent.type.toUpperCase()} ${a.position} | ` +
      `range: ${a.dist.toFixed(1)}m → ${a.futureDist.toFixed(1)}m (+1s) | ` +
      `v: ${a.state.speed.toFixed(1)} m/s | Δhdg: ${(a.headingDiff * 180 / Math.PI).toFixed(0)}° | ` +
      `closing: ${a.closingRate.toFixed(2)} m/s | TTC: ${ttc}`
  })
  messages.push({
    speaker: 'Technical',
    text: `Perception report — top ${top3.length} tracked objects:\n${techLines.join('\n')}`,
  })

  // === MINIMALIST: One-liner summary ===
  const threat = crossing.length > 0 ? 'crosser' :
                 approaching.filter(a => a.dist < 15).length > 0 ? 'approach' : 'clear'
  messages.push({
    speaker: 'Minimalist',
    text: threat === 'crosser'
      ? `${crossing[0].agent.type} crossing ${crossing[0].dist.toFixed(0)}m. Tracking.`
      : threat === 'approach'
      ? `${approaching[0].agent.type} approaching from ${approaching[0].position}, ${approaching[0].dist.toFixed(0)}m.`
      : `${nearby.length} tracked, nearest ${closest.dist.toFixed(0)}m. Clear.`,
  })

  // Build channel outputs from vision data
  const hasThreat = crossing.length > 0 || approaching.filter(a => a.dist < 10).length > 0
  const primaryAgent = crossing[0] || approaching[0] || closest

  const headline = crossing.length > 0
    ? `${crossing[0].agent.type} crossing path — ${crossing[0].dist.toFixed(0)}m`
    : approaching.length > 0 && approaching[0].dist < 20
    ? `${approaching[0].agent.type} approaching — ${approaching[0].dist.toFixed(0)}m`
    : peds.length > 0
    ? `pedestrian ${peds[0].position} — ${peds[0].dist.toFixed(0)}m`
    : `${nearby.length} agents tracked — clear`

  return {
    agentConversation: messages,
    frontScreen: {
      headline,
      body: `Speed: ${egoSpeedMph} mph. ${nearby.length} objects in view. ` +
        `Nearest: ${primaryAgent.agent.type} ${primaryAgent.position} at ${primaryAgent.dist.toFixed(0)}m, ` +
        `${primaryAgent.direction}. ` +
        (primaryAgent.approaching
          ? `Closing at ${Math.abs(primaryAgent.closingRate).toFixed(1)} m/s.`
          : `Stable distance.`),
      icon: hasThreat ? 'warning' : peds.length > 0 ? 'safety' : 'info',
      etaImpact: crossing.length > 0 ? `Possible yield — monitoring ${crossing[0].agent.type}` : undefined,
    },
    rearScreen: {
      headline: egoState.speed < 0.5 ? 'Holding position' :
                hasThreat ? 'Monitoring situation' : 'Cruising smoothly',
      comfortNote: crossing.length > 0
        ? `We see a ${crossing[0].agent.type} crossing ahead. Tracking them carefully — ${crossing[0].dist > 10 ? 'safe margin maintained' : 'ready to slow down if needed'}.`
        : egoState.speed < 0.5
        ? `Stopped. ${nearby.length} road users nearby. Waiting for a safe gap.`
        : `Moving at ${egoSpeedMph} mph. All ${nearby.length} nearby road users at safe distance. Relax and enjoy.`,
      icon: hasThreat ? 'safety' : 'info',
    },
    appNotification: {
      title: crossing.length > 0
        ? `${crossing[0].agent.type.charAt(0).toUpperCase() + crossing[0].agent.type.slice(1)} Crossing Path`
        : approaching.length > 0 && approaching[0].dist < 15
        ? `${approaching[0].agent.type.charAt(0).toUpperCase() + approaching[0].agent.type.slice(1)} Approaching`
        : 'Scene Update',
      body: `${nearby.length} road users detected. Closest: ${closest.agent.type} at ${closest.dist.toFixed(0)}m (${closest.position}). ` +
        (approaching.length > 0 ? `${approaching.length} approaching. ` : '') +
        (crossing.length > 0 ? `${crossing.length} crossing trajectory. ` : '') +
        `Status: monitoring.`,
      priority: crossing.length > 0 && crossing[0].dist < 10 ? 'high' :
                hasThreat ? 'medium' : 'low',
    },
    voice: {
      text: crossing.length > 0 && crossing[0].dist < 15
        ? `${crossing[0].agent.type} crossing ahead, ${crossing[0].dist.toFixed(0)} meters. We see them and are tracking.`
        : peds.length > 0 && peds[0].dist < 15
        ? `Pedestrian ${peds[0].position}, ${peds[0].dist.toFixed(0)} meters. ${peds[0].approaching ? 'Approaching — monitoring.' : 'Safe distance.'}`
        : approaching.length > 0 && approaching[0].dist < 20
        ? `${approaching[0].agent.type} approaching from the ${approaching[0].position}, ${approaching[0].dist.toFixed(0)} meters.`
        : `${nearby.length} road users nearby. All clear.`,
      tone: crossing.length > 0 && crossing[0].dist < 10 ? 'urgent' :
            hasThreat ? 'informative' : 'calm',
    },
  }
}
