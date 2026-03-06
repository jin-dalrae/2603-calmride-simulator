import { Sidebar } from './Sidebar'
import { ChannelStrip } from './ChannelStrip'
import { SceneCanvas } from '../scene/SceneCanvas'
import { TimelineBar } from '../timeline/TimelineBar'
import { AgentChatPanel } from '../channels/AgentChatPanel'
import { DataStreamPanel } from '../channels/DataStreamPanel'

export function ControlRoom() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '300px 1fr 300px 350px',
      gridTemplateRows: '1fr auto auto',
      width: '100vw',
      height: '100vh',
      background: '#111827',
    }}>
      {/* Sidebar spans all rows, col 1 */}
      <div style={{ gridRow: '1 / -1', gridColumn: '1' }}>
        <Sidebar />
      </div>

      {/* Main scene area, col 2 */}
      <div style={{ minHeight: 0, gridColumn: '2' }}>
        <SceneCanvas />
      </div>

      {/* Timeline bar, col 2 */}
      <div style={{ gridColumn: '2' }}>
        <TimelineBar />
      </div>

      {/* Channel strip, col 2 */}
      <div style={{ gridColumn: '2' }}>
        <ChannelStrip />
      </div>

      <div style={{ gridRow: '1 / -1', gridColumn: '3' }}>
        <DataStreamPanel />
      </div>

      <div style={{ gridRow: '1 / -1', gridColumn: '4' }}>
        <AgentChatPanel />
      </div>
    </div>
  )
}
