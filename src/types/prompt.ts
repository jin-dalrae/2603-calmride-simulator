export type Personality = 'professional' | 'friendly' | 'minimal' | 'comfort' | 'technical' | 'concierge'

export interface ToneSettings {
  anxietyLevel: number    // 0-100
  technicalDepth: number  // 0-100
  verbosity: number       // 0-100
}

export interface PromptConfig {
  systemPrompt: string
  personality: Personality
  tone: ToneSettings
}
