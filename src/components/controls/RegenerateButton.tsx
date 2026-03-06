import { useExplanationStore } from '../../store/useExplanationStore'
import { useGeminiExplanation } from '../../hooks/useGeminiExplanation'

export function RegenerateButton() {
  const { currentIncident, loading } = useExplanationStore()
  const { regenerate } = useGeminiExplanation()

  if (!currentIncident) return null

  return (
    <div style={{ padding: '0 12px' }}>
      <button
        onClick={regenerate}
        disabled={loading}
        style={{
          width: '100%',
          padding: '8px 0',
          fontSize: 13,
          fontWeight: 600,
          background: loading ? '#374151' : '#3b82f6',
          color: loading ? '#6b7280' : 'white',
          border: 'none',
          borderRadius: 6,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Regenerating...' : 'Regenerate Explanations'}
      </button>
    </div>
  )
}
