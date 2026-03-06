import { useMemo } from 'react'
import type { TrafficSignal } from '../../types/scenario'

interface Props {
    signals: TrafficSignal[]
    time: number
}

// Map from state int (0-8) to color hex
// based on Waymax color.py TRAFFIC_LIGHT_COLORS
const SIGNAL_COLORS: Record<number, string> = {
    0: '#bfbfbf', // Unknown
    1: '#ff0000', // Arrow_Stop
    2: '#ffff00', // Arrow_Caution
    3: '#00ff00', // Arrow_Go
    4: '#ff0000', // Stop
    5: '#ffff00', // Caution
    6: '#00ff00', // Go
    7: '#ffff00', // Flashing_Stop
    8: '#ffff00', // Flashing_Caution
}

export function TrafficSignals({ signals, time }: Props) {
    const currentSignals = useMemo(() => {
        // Traffic signals are provided as a flat list of (id, location, state, timestamp)
        // We need to find the state for each unique signal ID at the current time.

        // 1. Group by ID
        const grouped = signals.reduce((acc, s) => {
            if (!acc[s.id]) acc[s.id] = []
            acc[s.id].push(s)
            return acc
        }, {} as Record<string, TrafficSignal[]>)

        // 2. Find the closest timestamp for each ID
        return Object.values(grouped).map(states => {
            // Find state with largest timestamp <= time
            const pastStates = states.filter(s => s.timestamp <= time)
            if (pastStates.length === 0) return states[0] // Fallback to first if time is early
            return pastStates.reduce((prev, curr) =>
                (curr.timestamp > prev.timestamp) ? curr : prev
            )
        })
    }, [signals, time])

    return (
        <group>
            {currentSignals.map((signal) => (
                <mesh key={signal.id} position={[signal.x, 2, -signal.y]}>
                    <sphereGeometry args={[0.5, 16, 16]} />
                    <meshStandardMaterial
                        color={SIGNAL_COLORS[signal.state] || '#ffffff'}
                        emissive={SIGNAL_COLORS[signal.state] || '#ffffff'}
                        emissiveIntensity={1.5}
                    />
                </mesh>
            ))}
        </group>
    )
}
