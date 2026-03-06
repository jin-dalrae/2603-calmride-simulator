import { GoogleGenerativeAI, type GenerationConfig } from '@google/generative-ai'
import type { ChannelExplanation } from '../types/channels'
import type { Incident, QAPair } from '../types/scenario'
import type { Personality, PromptConfig } from '../types/prompt'

const RESPONSE_SCHEMA = {
  type: 'object' as const,
  properties: {
    frontScreen: {
      type: 'object' as const,
      properties: {
        headline: { type: 'string' as const },
        body: { type: 'string' as const },
        icon: { type: 'string' as const, enum: ['info', 'warning', 'safety', 'route'] },
        etaImpact: { type: 'string' as const },
      },
      required: ['headline', 'body', 'icon'],
    },
    rearScreen: {
      type: 'object' as const,
      properties: {
        headline: { type: 'string' as const },
        comfortNote: { type: 'string' as const },
        icon: { type: 'string' as const, enum: ['info', 'warning', 'safety', 'route'] },
      },
      required: ['headline', 'comfortNote', 'icon'],
    },
    appNotification: {
      type: 'object' as const,
      properties: {
        title: { type: 'string' as const },
        body: { type: 'string' as const },
        priority: { type: 'string' as const, enum: ['low', 'medium', 'high'] },
      },
      required: ['title', 'body', 'priority'],
    },
    voice: {
      type: 'object' as const,
      properties: {
        text: { type: 'string' as const },
        tone: { type: 'string' as const, enum: ['calm', 'informative', 'urgent'] },
      },
      required: ['text', 'tone'],
    },
  },
  required: ['frontScreen', 'rearScreen', 'appNotification', 'voice'],
}

function buildSystemPrompt(config: PromptConfig): string {
  const personalityMap: Record<Personality, string> = {
    professional: 'The Operational Agent leads. Focus heavily on logistics, safety, and clear facts.',
    friendly: 'The Friendly Agent leads. Ensure the overall tone is warm, approachable, and reassuring.',
    minimal: 'The Minimalist Agent leads. Keep all explanations extremely concise and clear.',
    comfort: 'The Comfort Agent leads. Focus heavily on acknowledging the passenger\'s physical experience and anxiety. Validate sudden movements.',
    technical: 'The Technical Agent leads. Focus on exposing the underlying sensor data and metrics to build trust through transparency.',
    concierge: 'The Concierge Agent leads. Focus on route progress, external environment context, and overall convenience.',
  }

  return `${config.systemPrompt || 'You are CalmRide, an AI communication system for autonomous vehicles.'}

You are not a single entity, but an ENSEMBLE OF specialized explanation agents working together to address the passenger. You must divide the communication channels among your team based on their strengths.

MEET THE TEAM:
1. Operational Agent: Direct, authoritative, focuses on logistics and facts. (Best for Front Screen).
2. Comfort/Empathy Agent: Warm, conversational, acknowledges physical sensations. (Best for Rear Screen).
3. Minimalist Agent: Extremely concise and urgent. (Best for App Push Notification).
4. Concierge Agent: Relaxed, informative, natural speaker. (Best for Voice).

TEAM DYNAMICS:
Work together to create a unified but multi-faceted communication strategy. While each agent handles a channel, they must coordinate to ensure the passenger receives a cohesive message.
${personalityMap[config.personality]}

Tone parameters (0=low, 100=high):
- Anxiety acknowledgment level: ${config.tone.anxietyLevel}/100
- Technical depth: ${config.tone.technicalDepth}/100
- Verbosity: ${config.tone.verbosity}/100

Assign each agent to generate the content for the channel best suited to their persona. Return a JSON object with content for all 4 channels.`
}

function buildUserMessage(
  incident: Incident,
  qaPairs: QAPair[],
  egoSpeed: number,
  nearbyAgentsSummary: string
): string {
  const qaContext = qaPairs.length > 0
    ? `\nAccumulated scenario context:\n${qaPairs.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}`
    : ''

  return `An incident has occurred during the ride:

Type: ${incident.type.replace(/_/g, ' ')}
Severity: ${incident.severity}
Description: ${incident.description}
Location: (${incident.x.toFixed(1)}, ${incident.y.toFixed(1)})
Time: ${incident.timestamp.toFixed(1)}s into the scenario

Current vehicle state:
- Speed: ${egoSpeed.toFixed(1)} m/s (${(egoSpeed * 2.237).toFixed(0)} mph)

Nearby agents: ${nearbyAgentsSummary || 'None detected'}
${qaContext}

Generate appropriate passenger-facing explanations for all 4 channels.`
}

export async function generateExplanation(
  incident: Incident,
  qaPairs: QAPair[],
  egoSpeed: number,
  nearbyAgentsSummary: string,
  promptConfig: PromptConfig
): Promise<ChannelExplanation> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey || apiKey === 'your-api-key-here') {
    return getFallbackExplanation(incident)
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const generationConfig: GenerationConfig = {
    responseMimeType: 'application/json',
    responseSchema: RESPONSE_SCHEMA as any,
    temperature: 0.7,
  }

  const result = await model.generateContent({
    contents: [{
      role: 'user',
      parts: [{ text: buildUserMessage(incident, qaPairs, egoSpeed, nearbyAgentsSummary) }],
    }],
    systemInstruction: buildSystemPrompt(promptConfig),
    generationConfig,
  })

  const text = result.response.text()
  return JSON.parse(text) as ChannelExplanation
}

function getFallbackExplanation(incident: Incident): ChannelExplanation {
  const typeLabel = incident.type.replace(/_/g, ' ')
  return {
    frontScreen: {
      headline: `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} Detected`,
      body: incident.description,
      icon: incident.severity === 'high' ? 'warning' : 'info',
      etaImpact: incident.severity === 'high' ? 'May add 1-2 minutes' : undefined,
    },
    rearScreen: {
      headline: `Safety Maneuver`,
      comfortNote: 'The vehicle is responding to road conditions. We\'ll resume normal driving shortly.',
      icon: 'safety',
    },
    appNotification: {
      title: `CalmRide: ${typeLabel}`,
      body: `Your vehicle detected a ${typeLabel}. ${incident.description}`,
      priority: incident.severity === 'high' ? 'high' : 'medium',
    },
    voice: {
      text: `I'm making a ${typeLabel} maneuver. ${incident.description}. Everything is under control.`,
      tone: incident.severity === 'high' ? 'urgent' : 'calm',
    },
  }
}
