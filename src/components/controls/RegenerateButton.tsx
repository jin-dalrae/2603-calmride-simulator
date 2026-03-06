import { useExplanationStore } from '../../store/useExplanationStore'
import { useGeminiExplanation } from '../../hooks/useGeminiExplanation'

export function RegenerateButton() {
  const { currentIncident, loading } = useExplanationStore()
  const { regenerate } = useGeminiExplanation()

  if (!currentIncident) return null

  return (
    <div style={{ padding: '0 16px' }}>
      <button
        onClick={regenerate}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px 0',
          fontSize: '11px',
          fontWeight: 800,
          fontFamily: 'monospace',
          background: loading ? '#080808' : 'rgba(56, 189, 248, 0.1)',
          color: loading ? '#444' : '#38bdf8',
          border: `1px solid ${loading ? '#111' : '#38bdf8'}`,
          borderRadius: '2px',
          cursor: loading ? 'not-allowed' : 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}
      >
        {loading ? 'RE_INDEXING...' : 'FORCE_RE_DELIBERATION'}
      </button>
    </div>
  )
}
