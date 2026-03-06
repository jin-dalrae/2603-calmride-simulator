import { useExplanationStore } from '../../store/useExplanationStore'

const iconMap = { info: 'ℹ️', warning: '⚠️', safety: '🛡️', route: '🗺️' }

export function FrontScreen() {
  const content = useExplanationStore(s => s.current?.frontScreen)
  const loading = useExplanationStore(s => s.loading)
  const consensusReached = useExplanationStore(s => s.consensusReached)

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <span>FRONT_SCREEN_INTERFACE</span>
        <span style={{ color: consensusReached ? '#4ade80' : '#444' }}>●</span>
      </div>
      {loading ? (
        <div style={loadingStyle}>[GENERATING_ASSETS...]</div>
      ) : content && consensusReached ? (
        <div style={contentStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '0.5px', borderLeft: '3px solid #38bdf8', paddingLeft: 10 }}>
                {content.headline.toUpperCase()}
            </div>
            <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6, margin: 0, fontFamily: 'sans-serif' }}>{content.body}</p>
            {content.etaImpact && (
              <div style={{ marginTop: 4, fontSize: '10px', color: '#fbbf24', fontFamily: 'monospace', background: 'rgba(251, 191, 36, 0.05)', padding: '6px 10px', borderRadius: '2px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                LATENCY_IMPACT: {content.etaImpact}
              </div>
            )}
          </div>
        </div>
      ) : content && !consensusReached ? (
        <div style={loadingStyle}>[SYNC_PENDING...]</div>
      ) : (
        <div style={emptyStyle}>SYSTEM_IDLE: AWAITING_INPUT</div>
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
const contentStyle: React.CSSProperties = { padding: '20px 16px' }
const loadingStyle: React.CSSProperties = { padding: 24, color: '#333', fontSize: 11, textAlign: 'center', fontFamily: 'monospace' }
const emptyStyle: React.CSSProperties = { padding: 24, color: '#222', fontSize: 10, textAlign: 'center', fontFamily: 'monospace' }
