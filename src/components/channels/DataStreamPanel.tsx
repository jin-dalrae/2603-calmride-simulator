import React, { useMemo } from 'react'
import { useScenarioStore } from '../../store/useScenarioStore'
import { usePlaybackStore } from '../../store/usePlaybackStore'
import { interpolateAgent } from '../../services/trajectoryInterpolator'

export function DataStreamPanel() {
    const currentScenario = useScenarioStore(s => s.currentScenario)
    const currentTime = usePlaybackStore(s => s.currentTime)

    const ego = useMemo(() => {
        if (!currentScenario) return null
        const agent = currentScenario.agents.find(a => a.id === currentScenario.egoId)
        if (!agent) return null
        return {
            agent,
            state: interpolateAgent(agent.trajectory, currentTime)
        }
    }, [currentScenario, currentTime])

    const surrounding = useMemo(() => {
        if (!currentScenario || !ego) return []
        return currentScenario.agents
            .filter(a => a.id !== currentScenario.egoId)
            .map(agent => {
                const state = interpolateAgent(agent.trajectory, currentTime)
                if (!state.visible) return null
                const dist = Math.sqrt(
                    (state.x - ego.state.x) ** 2 + 
                    (state.y - ego.state.y) ** 2
                )
                if (dist > 100) return null
                return { agent, state, dist }
            })
            .filter((a): a is NonNullable<typeof a> => a !== null)
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 5)
    }, [currentScenario, ego, currentTime])

    return (
        <div style={{
            width: 300,
            background: '#0a0f1e',
            borderLeft: '1px solid #1f2937',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#34d399',
            overflow: 'hidden'
        }}>
            <div style={{
                padding: '16px',
                borderBottom: '1px solid #1f2937',
                background: '#111827',
                color: '#f3f4f6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <strong style={{ fontSize: '13px', letterSpacing: '0.5px' }}>LIVE_DATA_STREAM</strong>
                <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                    animation: 'pulse 2s infinite'
                }} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ color: '#64748b', marginBottom: '8px', fontWeight: 'bold' }}>[SYSTEM_METRICS]</div>
                    <div>TIME: {currentTime.toFixed(3)}s</div>
                    <div>SCENARIO: {currentScenario?.id || 'NO_LOAD'}</div>
                    <div>RATE: 10Hz (WOMD)</div>
                    <div>STATUS: {currentScenario ? 'TRACKING' : 'IDLE'}</div>
                </div>

                {ego && (
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ color: '#60a5fa', marginBottom: '8px', fontWeight: 'bold' }}>[EGO_VEHICLE_STATE]</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px' }}>
                            <span>POSITION:</span> <span>[{ego.state.x.toFixed(3)}, {ego.state.y.toFixed(3)}]</span>
                            <span>VELOCITY:</span> <span>{ego.state.speed.toFixed(3)} m/s</span>
                            <span>HEADING:</span> <span>{(ego.state.heading * (180 / Math.PI)).toFixed(2)}°</span>
                            <span>ACCEL:</span> <span style={{ color: Math.abs(ego.state.speed) > 0.1 ? '#34d399' : '#64748b' }}>{((ego.agent.trajectory.find(p => Math.abs(p.t - currentTime) < 0.15)?.accel || 0)).toFixed(3)} m/s²</span>
                        </div>
                    </div>
                )}

                <div>
                    <div style={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}>[SURROUNDING_OBJECTS]</div>
                    {surrounding.length === 0 ? (
                        <div style={{ color: '#4b5563', fontStyle: 'italic' }}>NO_OBJECTS_IN_RANGE</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {surrounding.map(obj => (
                                <div key={obj.agent.id} style={{ borderLeft: '2px solid #374151', paddingLeft: '8px' }}>
                                    <div style={{ color: '#e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{obj.agent.type.toUpperCase()}_{obj.agent.id.slice(0,4)}</span>
                                        <span style={{ color: '#f59e0b' }}>{obj.dist.toFixed(1)}m</span>
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '10px' }}>
                                        SPD: {obj.state.speed.toFixed(2)}m/s | HDG: {(obj.state.heading * (180 / Math.PI)).toFixed(0)}°
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div style={{
                padding: '12px',
                borderTop: '1px solid #1f2937',
                background: '#0a0f1e',
                fontSize: '10px',
                color: '#4b5563'
            }}>
                CALMRIDE_V1.0_TELEMETRY_ENGINE
            </div>

            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    )
}
