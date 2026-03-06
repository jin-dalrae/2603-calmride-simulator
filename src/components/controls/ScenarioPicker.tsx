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
    <div style={{ padding: '0 12px' }}>
      <label style={labelStyle}>Scenario</label>
      <select
        onChange={e => handleSelect(e.target.value)}
        value={currentScenario?.id || ''}
        style={selectStyle}
        disabled={loading}
      >
        <option value="">Select scenario...</option>

        <optgroup label="High-Fidelity (Waymax/WOMD)" style={{ background: '#111827' }}>
          {availableScenarios.filter(f => f.startsWith('womd-')).map(f => (
            <option key={f} value={f}>{f.toUpperCase()}</option>
          ))}
        </optgroup>

        <optgroup label="Synthetic Samples" style={{ background: '#111827' }}>
          {availableScenarios.filter(f => !f.startsWith('womd-')).map(f => (
            <option key={f} value={f}>{f.replace('.json', '').replace(/-/g, ' ')}</option>
          ))}
        </optgroup>
      </select>
      {loading && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Loading...</div>}
      {error && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{error}</div>}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280',
  display: 'block', marginBottom: 4,
}
const selectStyle: React.CSSProperties = {
  width: '100%', background: '#374151', color: '#e5e7eb',
  border: '1px solid #4b5563', borderRadius: 6, padding: '8px 10px', fontSize: 13,
}
