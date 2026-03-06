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
      gridTemplateColumns: '280px 1fr auto',
      gridTemplateRows: '1fr auto auto',
      width: '100vw',
      height: '100vh',
      background: '#050505',
      color: '#e5e7eb',
      overflow: 'hidden'
    }}>
      {/* Left Sidebar */}
      <div style={{ gridRow: '1 / -1', gridColumn: '1', borderRight: '1px solid #111' }}>
        <Sidebar />
      </div>

      {/* Main View Area */}
      <div style={{ 
        gridColumn: '2', 
        display: 'flex', 
        flexDirection: 'column',
        minWidth: 0,
        position: 'relative'
      }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <SceneCanvas />
        </div>
        
        <div style={{ position: 'absolute', bottom: 140, left: 20, right: 20, zIndex: 10 }}>
          <TimelineBar />
        </div>

        <div style={{ height: 120, borderTop: '1px solid #111', background: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(10px)' }}>
          <ChannelStrip />
        </div>
      </div>

      {/* Right Intelligence Panel (Resizable) */}
      <div style={{ 
        gridRow: '1 / -1', 
        gridColumn: '3',
        display: 'flex',
        borderLeft: '1px solid #111',
        background: '#080808'
      }}>
        <div style={{ 
          width: 280, 
          borderRight: '1px solid #111',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <DataStreamPanel />
        </div>
        
        <div style={{ 
          minWidth: 350,
          maxWidth: 600,
          width: '30vw',
          resize: 'horizontal',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          direction: 'rtl' // Hack to put resize handle on the left
        }}>
          <div style={{ direction: 'ltr', flex: 1, display: 'flex', flexDirection: 'column' }}>
             <AgentChatPanel />
          </div>
        </div>
      </div>
    </div>
  )
}
