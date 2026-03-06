import { usePromptStore } from '../../store/usePromptStore'
import type { Personality } from '../../types/prompt'

const personalities: { value: Personality; label: string }[] = [
  { value: 'professional', label: 'Pro (Operational)' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'comfort', label: 'Comfort/Empathy' },
  { value: 'technical', label: 'Technical' },
  { value: 'concierge', label: 'Concierge' },
]

export function PersonalitySelector() {
  const { personality, setPersonality } = usePromptStore()

  return (
    <div style={{ padding: '0 12px' }}>
      <label style={labelStyle}>Personality</label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {personalities.map(p => (
          <button
            key={p.value}
            onClick={() => setPersonality(p.value)}
            style={{
              flex: 1,
              padding: '6px 0',
              fontSize: 12,
              border: personality === p.value ? '1px solid #3b82f6' : '1px solid #4b5563',
              borderRadius: 6,
              background: personality === p.value ? '#3b82f622' : '#374151',
              color: personality === p.value ? '#93c5fd' : '#9ca3af',
              cursor: 'pointer',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280',
  display: 'block', marginBottom: 6,
}
