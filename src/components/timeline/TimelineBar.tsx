import { usePlaybackStore } from '../../store/usePlaybackStore'
import { useScenarioStore } from '../../store/useScenarioStore'

const speeds = [0.25, 0.5, 1, 2, 4]

export function TimelineBar() {
  const { currentTime, isPlaying, speed, duration, togglePlay, setSpeed, seek } = usePlaybackStore()
  const incidents = useScenarioStore(s => s.currentScenario?.incidents || [])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px',
      background: '#1f2937', borderTop: '1px solid #374151',
    }}>
      <button onClick={togglePlay} style={btnStyle}>
        {isPlaying ? '⏸' : '▶'}
      </button>

      <div style={{ flex: 1, position: 'relative' }}>
        <input
          type="range"
          min={0}
          max={duration}
          step={0.01}
          value={currentTime}
          onChange={e => seek(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#3b82f6' }}
        />
        {/* Incident markers on timeline */}
        {incidents.map(inc => (
          <div
            key={inc.id}
            style={{
              position: 'absolute',
              left: `${(inc.timestamp / duration) * 100}%`,
              top: -2,
              width: 6, height: 6,
              borderRadius: '50%',
              background: '#ef4444',
              transform: 'translateX(-3px)',
              pointerEvents: 'none',
            }}
          />
        ))}
      </div>

      <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13, color: '#9ca3af', minWidth: 80, textAlign: 'center' }}>
        {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
      </span>

      <select
        value={speed}
        onChange={e => setSpeed(parseFloat(e.target.value))}
        style={{ background: '#374151', color: '#e5e7eb', border: '1px solid #4b5563', borderRadius: 4, padding: '2px 6px', fontSize: 13 }}
      >
        {speeds.map(s => (
          <option key={s} value={s}>{s}x</option>
        ))}
      </select>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  width: 36, height: 36,
  fontSize: 16,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}
