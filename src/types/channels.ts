export interface FrontScreenContent {
  headline: string
  body: string
  icon: 'info' | 'warning' | 'safety' | 'route'
  etaImpact?: string
}

export interface RearScreenContent {
  headline: string
  comfortNote: string
  icon: 'info' | 'warning' | 'safety' | 'route'
}

export interface AppNotificationContent {
  title: string
  body: string
  priority: 'low' | 'medium' | 'high'
}

export interface VoiceContent {
  text: string
  tone: 'calm' | 'informative' | 'urgent'
}

export interface AgentMessage {
  speaker: 'Operational' | 'Comfort' | 'Minimalist' | 'Concierge' | 'Technical'
  text: string
}

export interface ChannelExplanation {
  agentConversation: AgentMessage[]
  frontScreen: FrontScreenContent
  rearScreen: RearScreenContent
  appNotification: AppNotificationContent
  voice: VoiceContent
}
