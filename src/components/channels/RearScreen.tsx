import { useExplanationStore } from '../../store/useExplanationStore'

const iconMap = { info: 'ℹ️', warning: '⚠️', safety: '🛡️', route: '🗺️' }

export function RearScreen() {
  const content = useExplanationStore(s => s.current?.rearScreen)
  const loading = useExplanationStore(s => s.loading)
  const consensusReached = useExplanationStore(s => s.consensusReached)

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <span>REAR_DISPLAY_UNIT</span>
        <span style={{ color: consensusReached ? '#4ade80' : '#444' }}>●</span>
      </div>
      {loading ? (
        <div style={loadingStyle}>[STREAMING_METRICS...]</div>
      ) : content && consensusReached ? (
        <div style={{ padding: '20px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', borderLeft: '3px solid #4ade80', paddingLeft: 10 }}>
                {content.headline.toUpperCase()}
            </div>
            <p style={{ fontSize: 15, color: '#ccc', lineHeight: 1.6, margin: 0 }}>{content.comfortNote}</p>
          </div>
        </div>
      ) : content && !consensusReached ? (
        <div style={loadingStyle}>[PROCESSING_REASSURANCE_MAP...]</div>
      ) : (
        <div style={emptyStyle}>NO_SIGNAL: STANDBY</div>
      )}
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#080808', 
  borderRadius: '4px', 
  overflow: 'hidden', 
  display: 'flex', 
  flexDirection: 'column',
  border: '1px solid #111',
}
const headerStyle: React.CSSProperties = {
  padding: '12px 14px', 
  fontSize: '10px', 
  fontWeight: 700,
  textTransform: 'uppercase', 
  letterSpacing: '1.5px',
  color: '#666', 
  borderBottom: '1px solid #111', 
  background: '#0a0a0a',
  display: 'flex',
  justifyContent: 'space-between',
  fontFamily: 'monospace'
}
const loadingStyle: React.CSSProperties = { padding: 24, color: '#333', fontSize: 11, textAlign: 'center', fontFamily: 'monospace' }
const emptyStyle: React.CSSProperties = { padding: 24, color: '#222', fontSize: 10, textAlign: 'center', fontFamily: 'monospace' }
