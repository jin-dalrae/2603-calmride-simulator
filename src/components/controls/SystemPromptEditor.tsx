import { usePromptStore } from '../../store/usePromptStore'

export function SystemPromptEditor() {
  const { systemPrompt, setSystemPrompt } = usePromptStore()

  return (
    <div style={{ padding: '0 12px' }}>
      <label style={labelStyle}>System Prompt</label>
      <textarea
        value={systemPrompt}
        onChange={e => setSystemPrompt(e.target.value)}
        rows={4}
        style={textareaStyle}
        placeholder="Enter system prompt..."
      />
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#6b7280',
  display: 'block', marginBottom: 4,
}
const textareaStyle: React.CSSProperties = {
  width: '100%', background: '#374151', color: '#e5e7eb',
  border: '1px solid #4b5563', borderRadius: 6, padding: 10, fontSize: 12,
  resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5,
}
