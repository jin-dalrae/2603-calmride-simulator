import { useExplanationStore } from '../../store/useExplanationStore'

const priorityColors = { low: '#4ade80', medium: '#fbbf24', high: '#f87171' }

export function AppNotification() {
  const content = useExplanationStore(s => s.current?.appNotification)
  const loading = useExplanationStore(s => s.loading)
  const consensusReached = useExplanationStore(s => s.consensusReached)

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <span>PUSH_NOTIF_RELAY</span>
        <span style={{ color: consensusReached ? '#4ade80' : '#444' }}>●</span>
      </div>
      {loading ? (
        <div style={loadingStyle}>[QUEUEING_PUSH...]</div>
      ) : content && consensusReached ? (
        <div style={{ padding: '20px 16px' }}>
          <div style={{
            background: '#0a0a0a', borderRadius: '4px', padding: '12px',
            border: `1px solid ${priorityColors[content.priority]}33`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{ width: 14, height: 14, borderRadius: 2, background: '#38bdf8', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 900 }}>CR</div>
              <span style={{ fontSize: '9px', color: '#666', fontWeight: 700, letterSpacing: 0.5 }}>CALMRIDE_MOBILE</span>
              <span style={{ fontSize: '9px', color: '#333', marginLeft: 'auto', fontFamily: 'monospace' }}>NOW</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#eee', marginBottom: 4 }}>{content.title}</div>
            <div style={{ fontSize: 12, color: '#888', lineHeight: 1.4 }}>{content.body}</div>
            <div style={{
              marginTop: 10, fontSize: '8px', color: priorityColors[content.priority],
              textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800, fontFamily: 'monospace'
            }}>
              PRIORITY: {content.priority}
            </div>
          </div>
        </div>
      ) : content && !consensusReached ? (
        <div style={loadingStyle}>[ENCRYPTING_PAYLOAD...]</div>
      ) : (
        <div style={emptyStyle}>PUSH_SERVER_IDLE</div>
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
