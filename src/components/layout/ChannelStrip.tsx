import { FrontScreen } from '../channels/FrontScreen'
import { RearScreen } from '../channels/RearScreen'
import { AppNotification } from '../channels/AppNotification'
import { VoiceChannel } from '../channels/VoiceChannel'

export function ChannelStrip() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 8,
      padding: 8,
      background: '#111827',
      minHeight: 160,
    }}>
      <FrontScreen />
      <RearScreen />
      <AppNotification />
      <VoiceChannel />
    </div>
  )
}
