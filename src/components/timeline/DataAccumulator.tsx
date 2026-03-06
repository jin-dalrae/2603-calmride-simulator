import { useScenarioStore } from '../../store/useScenarioStore'
import { usePlaybackStore } from '../../store/usePlaybackStore'

const categoryColors: Record<string, string> = {
  environment: '#4ade80',
  ego: '#38bdf8',
  surrounding: '#f97316',
  interaction: '#c084fc',
}

export function DataAccumulator() {
  const scenario = useScenarioStore(s => s.currentScenario)
  const currentTime = usePlaybackStore(s => s.currentTime)

  if (!scenario) return <div style={emptyStyle}>[AWAITING_INPUT_STREAM]</div>

  const visiblePairs = scenario.qaPairs.filter(qa => qa.timestamp <= currentTime)

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
      <div style={{ fontSize: '9px', color: '#444', padding: '16px 16px 8px', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 800, fontFamily: 'monospace' }}>
        CONTEXT_BUFFER ({visiblePairs.length}/{scenario.qaPairs.length})
      </div>
      {visiblePairs.length === 0 ? (
        <div style={emptyStyle}>[BUFFERING...]</div>
      ) : (
        visiblePairs.map((qa, i) => (
          <div key={i} style={{
            padding: '12px 16px',
            borderBottom: '1px solid #111',
            background: 'rgba(0,0,0,0.2)',
            animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{
              display: 'inline-block',
              fontSize: '8px',
              padding: '2px 6px',
              borderRadius: '2px',
              border: `1px solid ${categoryColors[qa.category]}44`,
              color: categoryColors[qa.category],
              marginBottom: 6,
              textTransform: 'uppercase',
              fontWeight: 800,
              fontFamily: 'monospace'
            }}>
              {qa.category}
            </div>
            <div style={{ fontSize: '12px', color: '#eee', marginBottom: 4, fontWeight: 700 }}>{qa.question}</div>
            <div style={{ fontSize: '11px', color: '#666', lineHeight: 1.4 }}>{qa.answer}</div>
          </div>
        ))
      )}
    </div>
  )
}

const emptyStyle: React.CSSProperties = {
  padding: 32, color: '#333', fontSize: 11, textAlign: 'center', fontFamily: 'monospace'
}
