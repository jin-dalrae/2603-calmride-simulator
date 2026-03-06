/**
 * CalmRide API client.
 *
 * Communicates with the FastAPI backend to fetch scenarios loaded via
 * Waymax / WOMD. Falls back to loading local sample JSON files if the
 * backend is unavailable.
 */

import type { WOMDRawScenario } from '../types/womd'

const API_BASE = '/api'

// ---------- Types from backend ----------

export interface ScenarioSummary {
    id: string
    agent_count: number
    duration: number
    has_incidents: boolean
    incident_types: string[]
    source: 'womd' | 'womd_reasoning' | 'sample'
}

export interface BackendScenario {
    id: string
    ego_id: string
    duration: number
    cur_time: number
    agents: {
        id: string
        type: 'ego' | 'vehicle' | 'pedestrian' | 'cyclist'
        length: number; width: number; height: number
        trajectory: {
            t: number; x: number; y: number
            heading: number; speed: number; accel: number
        }[]
    }[]
    qa_pairs: {
        category: 'environment' | 'ego' | 'surrounding' | 'interaction'
        question: string; answer: string; timestamp: number
    }[]
    incidents: {
        id: string; type: string; timestamp: number
        x: number; y: number; description: string
        severity: 'low' | 'medium' | 'high'
    }[]
    map_features: { type: string; points: { x: number; y: number }[] }[]
    traffic_signals: { id: string; x: number; y: number; state: number; timestamp: number }[]
    waymax_metrics: {
        overlap: boolean; offroad: boolean; wrong_way: boolean
        kinematic_infeasible: boolean; log_divergence: number
        route_following: boolean
    } | null
    source: 'womd' | 'womd_reasoning' | 'sample'
}

export interface HealthResponse {
    status: string
    scenario_count: number
    waymax_metrics_available: boolean
}

// ---------- API calls ----------

async function apiFetch<T>(path: string): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`)
    if (!response.ok) {
        throw new Error(`API ${path} failed: ${response.status} ${response.statusText}`)
    }
    return response.json()
}

export async function checkBackendHealth(): Promise<HealthResponse | null> {
    try {
        return await apiFetch<HealthResponse>('/health')
    } catch {
        return null
    }
}

export async function fetchScenarioList(): Promise<ScenarioSummary[]> {
    return apiFetch<ScenarioSummary[]>('/scenarios')
}

export async function fetchScenario(scenarioId: string): Promise<BackendScenario> {
    return apiFetch<BackendScenario>(`/scenarios/${scenarioId}`)
}

/**
 * Check if the backend is reachable. Used to decide whether to
 * use the API or fall back to local sample files.
 */
export async function isBackendAvailable(): Promise<boolean> {
    const health = await checkBackendHealth()
    return health !== null && health.status === 'ok'
}
