import { useScenarioStore } from '../../store/useScenarioStore'
import { usePlaybackStore } from '../../store/usePlaybackStore'

const categoryColors: Record<string, string> = {
  environment: '#22c55e',
  ego: '#3b82f6',
  surrounding: '#f97316',
  interaction: '#a855f7',
}

export function DataAccumulator() {
  const scenario = useScenarioStore(s => s.currentScenario)
  const currentTime = usePlaybackStore(s => s.currentTime)

  if (!scenario) return <div style={emptyStyle}>Load a scenario to see data</div>

  const visiblePairs = scenario.qaPairs.filter(qa => qa.timestamp <= currentTime)

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
      <div style={{ fontSize: 11, color: '#6b7280', padding: '0 12px 6px', textTransform: 'uppercase', letterSpacing: 1 }}>
        Data Points ({visiblePairs.length}/{scenario.qaPairs.length})
      </div>
      {visiblePairs.length === 0 ? (
        <div style={emptyStyle}>Press play to accumulate data...</div>
      ) : (
        visiblePairs.map((qa, i) => (
          <div key={i} style={{
            padding: '8px 12px',
            borderBottom: '1px solid #1f2937',
            animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{
              display: 'inline-block',
              fontSize: 10,
              padding: '1px 6px',
              borderRadius: 3,
              background: categoryColors[qa.category] + '22',
              color: categoryColors[qa.category],
              marginBottom: 4,
            }}>
              {qa.category}
            </div>
            <div style={{ fontSize: 12, color: '#d1d5db', marginBottom: 2 }}>{qa.question}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>{qa.answer}</div>
          </div>
        ))
      )}
    </div>
  )
}

const emptyStyle: React.CSSProperties = {
  padding: 16, color: '#6b7280', fontSize: 13, textAlign: 'center',
}
