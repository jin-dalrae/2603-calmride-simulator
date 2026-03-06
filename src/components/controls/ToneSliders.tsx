import { usePromptStore } from '../../store/usePromptStore'

const sliders = [
  { key: 'anxietyLevel' as const, label: 'Anxiety Acknowledgment' },
  { key: 'technicalDepth' as const, label: 'Technical Depth' },
  { key: 'verbosity' as const, label: 'Verbosity' },
]

export function ToneSliders() {
  const { tone, setTone } = usePromptStore()

  return (
    <div style={{ padding: '0 16px' }}>
      <label style={labelStyle}>Tone_Parameters</label>
      {sliders.map(({ key, label }) => (
        <div key={key} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '10px', color: '#888', fontWeight: 600, fontFamily: 'monospace' }}>{label.toUpperCase()}</span>
            <span style={{ fontSize: '10px', color: '#34d399', fontFamily: 'monospace' }}>{tone[key]}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={tone[key]}
            onChange={e => setTone({ [key]: parseInt(e.target.value) })}
            className="tone-slider"
            style={{ width: '100%', accentColor: '#38bdf8', height: '2px', background: '#111', appearance: 'none' }}
          />
        </div>
      ))}
      <style>{`
        .tone-slider::-webkit-slider-thumb {
            appearance: none;
            width: 10px;
            height: 10px;
            background: #38bdf8;
            border-radius: 2px;
        }
      `}</style>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#444',
  display: 'block', marginBottom: 12, fontWeight: 800, fontFamily: 'monospace'
}
