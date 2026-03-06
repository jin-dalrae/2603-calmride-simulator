import { usePromptStore } from '../../store/usePromptStore'

const sliders = [
  { key: 'anxietyLevel' as const, label: 'Anxiety Acknowledgment' },
  { key: 'technicalDepth' as const, label: 'Technical Depth' },
  { key: 'verbosity' as const, label: 'Verbosity' },
]

export function ToneSliders() {
  const { tone, setTone } = usePromptStore()

  return (
    <div style={{ padding: '0 12px' }}>
      <label style={labelStyle}>Tone Settings</label>
      {sliders.map(({ key, label }) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>{label}</span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>{tone[key]}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={tone[key]}
            onChange={e => setTone({ [key]: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: '#3b82f6' }}
          />
        </div>
      ))}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280',
  display: 'block', marginBottom: 8,
}
