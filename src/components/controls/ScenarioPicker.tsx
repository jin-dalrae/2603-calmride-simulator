import { useScenarioStore } from '../../store/useScenarioStore'
import { usePlaybackStore } from '../../store/usePlaybackStore'
import { useExplanationStore } from '../../store/useExplanationStore'

export function ScenarioPicker() {
  const { availableScenarios, currentScenario, loading, error, loadScenario } = useScenarioStore()
  const { reset, setDuration } = usePlaybackStore()
  const clearExplanations = useExplanationStore(s => s.clear)

  const handleSelect = async (filename: string) => {
    if (!filename) return
    reset()
    clearExplanations()
    await loadScenario(filename)
    const scenario = useScenarioStore.getState().currentScenario
    if (scenario) setDuration(scenario.duration)
  }

  return (
    <div style={{ padding: '0 16px' }}>
      <label style={labelStyle}>Scenario_Source</label>
      <select
        onChange={e => handleSelect(e.target.value)}
        value={currentScenario?.id || ''}
        style={selectStyle}
        disabled={loading}
      >
        <option value="">SELECT_INPUT_VECTOR</option>

        <optgroup label="WOMD_RESEARCH_DATA" style={{ background: '#080808' }}>
          {availableScenarios.filter(f => f.startsWith('womd-')).map(f => (
            <option key={f} value={f}>{f.toUpperCase()}</option>
          ))}
        </optgroup>

        <optgroup label="SYNTHETIC_MATRICES" style={{ background: '#080808' }}>
          {availableScenarios.filter(f => !f.startsWith('womd-')).map(f => (
            <option key={f} value={f}>{f.replace('.json', '').replace(/-/g, '_').toUpperCase()}</option>
          ))}
        </optgroup>
      </select>
      {loading && <div style={{ fontSize: 9, color: '#38bdf8', marginTop: 8, fontFamily: 'monospace' }}>{'>'} LOADING_TFRECORDS...</div>}
      {error && <div style={{ fontSize: 9, color: '#f87171', marginTop: 8, fontFamily: 'monospace' }}>{'>'} ERR: {error.toUpperCase()}</div>}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#444',
  display: 'block', marginBottom: 8, fontWeight: 800, fontFamily: 'monospace'
}
const selectStyle: React.CSSProperties = {
  width: '100%', background: '#0a0a0a', color: '#ccc',
  border: '1px solid #111', borderRadius: '2px', padding: '10px 12px', fontSize: '12px',
  fontFamily: 'monospace', outline: 'none'
}
