import { Sidebar } from './Sidebar'
import { ChannelStrip } from './ChannelStrip'
import { SceneCanvas } from '../scene/SceneCanvas'
import { TimelineBar } from '../timeline/TimelineBar'

export function ControlRoom() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gridTemplateRows: '1fr auto auto',
      width: '100vw',
      height: '100vh',
      background: '#111827',
    }}>
      {/* Sidebar spans all rows */}
      <div style={{ gridRow: '1 / -1' }}>
        <Sidebar />
      </div>

      {/* Main scene area */}
      <div style={{ minHeight: 0 }}>
        <SceneCanvas />
      </div>

      {/* Timeline bar */}
      <TimelineBar />

      {/* Channel strip */}
      <ChannelStrip />
    </div>
  )
}
