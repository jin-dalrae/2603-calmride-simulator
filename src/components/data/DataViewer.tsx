import { useState } from 'react'
import { useScenarioStore } from '../../store/useScenarioStore'
import { useAppStore } from '../../store/useAppStore'
import { ScenarioPicker } from '../controls/ScenarioPicker'

export function DataViewer() {
  const { currentScenario, loading } = useScenarioStore()
  const setScreen = useAppStore(s => s.setScreen)
  const [activeTab, setActiveTab] = useState<'overview' | 'telemetry' | 'agents' | 'perception' | 'metrics' | 'qa'>('overview')

  if (loading) {
    return (
      <div style={{ padding: 40, fontFamily: 'monospace', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ fontSize: 24, fontWeight: 'bold', letterSpacing: 2 }}>LOADING_WOMD_DATA...</div>
        <div style={{ fontSize: 12, color: '#666' }}>Fetching scenario and trajectory points from TFRecords</div>
      </div>
    )
  }

  if (!currentScenario) {
    return (
      <div style={{ padding: 40, fontFamily: 'monospace', maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 14, marginBottom: 20, color: '#666' }}>NO_SCENARIO_LOADED</div>
        <ScenarioPicker />
        <div style={{ marginTop: 30 }}>
          <button onClick={() => setScreen('simulator')} style={backButtonStyle}>← BACK TO SIMULATOR</button>
        </div>
      </div>
    )
  }

  const { id, egoId, duration, agents, incidents, qaPairs, mapFeatures, trafficSignals, waymaxMetrics } = currentScenario
  const egoAgent = agents.find(a => a.id === egoId) || agents.find(a => a.type === 'ego')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f5f5', color: '#222', fontFamily: 'monospace' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px',
        background: '#fff', borderBottom: '1px solid #ddd'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button onClick={() => setScreen('simulator')} style={backButtonStyle}>← BACK TO SIM</button>
          <div style={{ fontSize: 18, fontWeight: 'bold', letterSpacing: 1 }}>DATA EXPLORER / {id}</div>
        </div>
        <div style={{ width: 300 }}>
          <ScenarioPicker />
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: 220, background: '#fafafa', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
          {(['overview', 'telemetry', 'agents', 'perception', 'metrics', 'qa'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...navButtonStyle,
                background: activeTab === tab ? '#eee' : 'transparent',
                borderLeft: activeTab === tab ? '4px solid #222' : '4px solid transparent',
              }}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {activeTab === 'overview' && (
            <div>
              <h2 style={sectionHeaderStyle}>SCENARIO OVERVIEW</h2>
              <div style={gridStyle}>
                <StatCard label="SCENARIO ID" value={id} />
                <StatCard label="EGO AGENT ID" value={egoId} />
                <StatCard label="DURATION" value={`${duration.toFixed(2)}s`} />
                <StatCard label="TOTAL AGENTS" value={agents.length} />
                <StatCard label="INCIDENTS" value={incidents.length} />
                <StatCard label="TRAFFIC SIGNALS" value={trafficSignals.length} />
                <StatCard label="MAP FEATURES" value={mapFeatures.length} />
                <StatCard label="WAYMAX METRICS" value={waymaxMetrics ? 'AVAILABLE' : 'N/A'} />
              </div>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div>
              <h2 style={sectionHeaderStyle}>REAL DRIVING DATA (EGO TELEMETRY)</h2>
              {!egoAgent ? (
                <div style={{ color: '#dc2626' }}>EGO_AGENT_NOT_FOUND</div>
              ) : (
                <>
                  <div style={{ marginBottom: 20, padding: 16, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>EGO VEHICLE SPECS</div>
                    <div style={{ display: 'flex', gap: 20 }}>
                      <StatMini label="L" value={`${egoAgent.length?.toFixed(2)}m`} />
                      <StatMini label="W" value={`${egoAgent.width?.toFixed(2)}m`} />
                      <StatMini label="H" value={`${egoAgent.height?.toFixed(2)}m`} />
                      <StatMini label="POINTS" value={egoAgent.trajectory.length} />
                    </div>
                  </div>
                  <table style={tableStyle}>
                    <thead>
                      <tr style={thStyle}>
                        <th style={tdStyle}>TIME (s)</th>
                        <th style={tdStyle}>X</th>
                        <th style={tdStyle}>Y</th>
                        <th style={tdStyle}>HEADING (rad)</th>
                        <th style={tdStyle}>SPEED (m/s)</th>
                        <th style={tdStyle}>ACCEL (m/s²)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {egoAgent.trajectory.map((p, i) => (
                        <tr key={i} style={trStyle}>
                          <td style={tdStyle}>{p.t.toFixed(2)}</td>
                          <td style={tdStyle}>{p.x.toFixed(3)}</td>
                          <td style={tdStyle}>{p.y.toFixed(3)}</td>
                          <td style={tdStyle}>{p.heading.toFixed(4)}</td>
                          <td style={tdStyle}>{p.speed.toFixed(3)}</td>
                          <td style={tdStyle}>{p.accel.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}

          {activeTab === 'agents' && (
            <div>
              <h2 style={sectionHeaderStyle}>PERCEIVED SCENE AGENTS ({agents.length})</h2>
              <table style={tableStyle}>
                <thead>
                  <tr style={thStyle}>
                    <th style={tdStyle}>ID</th>
                    <th style={tdStyle}>TYPE</th>
                    <th style={tdStyle}>LENGTH</th>
                    <th style={tdStyle}>WIDTH</th>
                    <th style={tdStyle}>HEIGHT</th>
                    <th style={tdStyle}>TRAJ_LEN</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.slice(0, 100).map(a => (
                    <tr key={a.id} style={{ ...trStyle, background: a.id === egoId ? '#fffbea' : 'transparent' }}>
                      <td style={tdStyle}>{a.id} {a.id === egoId ? '(EGO)' : ''}</td>
                      <td style={tdStyle}>{a.type}</td>
                      <td style={tdStyle}>{a.length?.toFixed(2) || 'N/A'}m</td>
                      <td style={tdStyle}>{a.width?.toFixed(2) || 'N/A'}m</td>
                      <td style={tdStyle}>{a.height?.toFixed(2) || 'N/A'}m</td>
                      <td style={tdStyle}>{a.trajectory.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'perception' && (
            <div>
              <h2 style={sectionHeaderStyle}>PERCEPTION DATA (SIGNALS & MAP)</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <h3 style={{ fontSize: 14, marginBottom: 12 }}>TRAFFIC SIGNALS ({trafficSignals.length})</h3>
                  {trafficSignals.length === 0 ? (
                    <div style={{ color: '#666', fontSize: 12 }}>No traffic signals detected.</div>
                  ) : (
                    <table style={tableStyle}>
                      <thead>
                        <tr style={thStyle}>
                          <th style={tdStyle}>TIME</th>
                          <th style={tdStyle}>STATE</th>
                          <th style={tdStyle}>LOCATION (X,Y)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trafficSignals.slice(0, 20).map((s, i) => (
                          <tr key={i} style={trStyle}>
                            <td style={tdStyle}>{s.timestamp.toFixed(1)}s</td>
                            <td style={tdStyle}>
                              <span style={{ 
                                padding: '2px 6px', borderRadius: 4, color: '#fff', fontSize: 10,
                                background: s.state === 1 ? '#ef4444' : s.state === 2 ? '#22c55e' : s.state === 3 ? '#eab308' : '#666'
                              }}>
                                STATE_{s.state}
                              </span>
                            </td>
                            <td style={tdStyle}>{s.x.toFixed(1)}, {s.y.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div>
                  <h3 style={{ fontSize: 14, marginBottom: 12 }}>MAP GEOMETRY ({mapFeatures.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {mapFeatures.map((f, i) => (
                      <div key={i} style={{ background: '#fff', padding: 8, borderRadius: 4, border: '1px solid #e0e0e0', fontSize: 11 }}>
                        <div style={{ fontWeight: 'bold' }}>{f.type}</div>
                        <div style={{ color: '#888' }}>Points: {f.points.length}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div>
              <h2 style={sectionHeaderStyle}>DRIVING QUALITY METRICS (WAYMAX)</h2>
              {!waymaxMetrics ? (
                <div style={{ padding: 20, background: '#fee2e2', color: '#b91c1c', borderRadius: 6 }}>
                  Waymax metrics are not available for this scenario. Ensure the Waymax research module is installed on the backend.
                </div>
              ) : (
                <div style={gridStyle}>
                  <MetricCard label="COLLISION_OVERLAP" value={waymaxMetrics.overlap ? 'TRUE' : 'FALSE'} alert={waymaxMetrics.overlap} />
                  <MetricCard label="OFF_ROAD" value={waymaxMetrics.offroad ? 'TRUE' : 'FALSE'} alert={waymaxMetrics.offroad} />
                  <MetricCard label="WRONG_WAY" value={waymaxMetrics.wrongWay ? 'TRUE' : 'FALSE'} alert={waymaxMetrics.wrongWay} />
                  <MetricCard label="KINEMATIC_VIOLATION" value={waymaxMetrics.kinematicInfeasible ? 'TRUE' : 'FALSE'} alert={waymaxMetrics.kinematicInfeasible} />
                  <MetricCard label="LOG_DIVERGENCE" value={waymaxMetrics.logDivergence.toFixed(4)} alert={waymaxMetrics.logDivergence > 1.0} />
                  <MetricCard label="ROUTE_FOLLOWING" value={waymaxMetrics.routeFollowing ? 'PASS' : 'FAIL'} alert={!waymaxMetrics.routeFollowing} />
                </div>
              )}

              <div style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: 14, marginBottom: 16 }}>SCENE INCIDENT LOG</h3>
                {incidents.length === 0 ? (
                  <div style={{ color: '#666', fontSize: 12 }}>No incidents detected.</div>
                ) : (
                  <table style={tableStyle}>
                    <thead>
                      <tr style={thStyle}>
                        <th style={tdStyle}>TIME</th>
                        <th style={tdStyle}>TYPE</th>
                        <th style={tdStyle}>SEVERITY</th>
                        <th style={tdStyle}>DESCRIPTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incidents.map(inc => (
                        <tr key={inc.id} style={trStyle}>
                          <td style={tdStyle}>{inc.timestamp.toFixed(2)}s</td>
                          <td style={tdStyle}>{inc.type.toUpperCase()}</td>
                          <td style={tdStyle}>
                            <span style={{ 
                              padding: '2px 6px', borderRadius: 4, color: '#fff', fontSize: 10,
                              background: inc.severity === 'high' ? '#ef4444' : inc.severity === 'medium' ? '#f59e0b' : '#3b82f6'
                            }}>
                              {inc.severity.toUpperCase()}
                            </span>
                          </td>
                          <td style={tdStyle}>{inc.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'qa' && (
            <div>
              <h2 style={sectionHeaderStyle}>SCENARIO REASONING DATA ({qaPairs.length})</h2>
              {qaPairs.length === 0 ? (
                <div style={{ padding: 20, background: '#fff', borderRadius: 6, color: '#666' }}>
                  No Reasoning Q&A pairs available. Reasoning data requires the <strong>WOMD-Reasoning</strong> dataset extension.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {qaPairs.map((qa, i) => (
                    <div key={i} style={{ background: '#fff', padding: 16, borderRadius: 6, border: '1px solid #e0e0e0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 'bold', color: '#666', background: '#eee', padding: '2px 6px', borderRadius: 4 }}>
                          {qa.category.toUpperCase()}
                        </span>
                        <span style={{ fontSize: 10, color: '#888' }}>{qa.timestamp.toFixed(2)}s</span>
                      </div>
                      <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Q: {qa.question}</div>
                      <div style={{ color: '#444' }}>A: {qa.answer}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: 6, border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, color: '#666', fontWeight: 'bold' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 'bold' }}>{value}</div>
    </div>
  )
}

function MetricCard({ label, value, alert }: { label: string; value: string | number; alert?: boolean }) {
  return (
    <div style={{ 
      background: alert ? '#fff1f2' : '#fff', 
      padding: '20px', 
      borderRadius: 6, 
      border: alert ? '1px solid #fecdd3' : '1px solid #e0e0e0', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 8 
    }}>
      <div style={{ fontSize: 10, color: alert ? '#be123c' : '#666', fontWeight: 'bold' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 'bold', color: alert ? '#e11d48' : '#222' }}>{value}</div>
    </div>
  )
}

function StatMini({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 10, color: '#999' }}>{label}:</span>
      <span style={{ fontSize: 12, fontWeight: 'bold' }}>{value}</span>
    </div>
  )
}

const backButtonStyle: React.CSSProperties = {
  background: '#222', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4,
  cursor: 'pointer', fontWeight: 'bold', fontSize: 11
}

const navButtonStyle: React.CSSProperties = {
  padding: '16px 20px', textAlign: 'left', border: 'none', borderBottom: '1px solid #eee',
  cursor: 'pointer', fontSize: 12, fontWeight: 'bold', color: '#333'
}

const sectionHeaderStyle: React.CSSProperties = {
  margin: '0 0 20px 0', fontSize: 18, borderBottom: '1px solid #ddd', paddingBottom: 10
}

const gridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16
}

const tableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse', background: '#fff', fontSize: 12
}

const thStyle: React.CSSProperties = {
  background: '#f8f9fa', textAlign: 'left', fontWeight: 'bold', borderBottom: '2px solid #ddd'
}

const tdStyle: React.CSSProperties = {
  padding: '10px 12px', borderBottom: '1px solid #eee'
}

const trStyle: React.CSSProperties = {}
