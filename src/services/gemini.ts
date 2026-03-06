import { GoogleGenerativeAI, type GenerationConfig } from '@google/generative-ai'
import type { ChannelExplanation } from '../types/channels'
import type { Incident, QAPair } from '../types/scenario'
import type { Personality, PromptConfig } from '../types/prompt'

const RESPONSE_SCHEMA = {
  type: 'object' as const,
  properties: {
    agentConversation: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          speaker: { type: 'string' as const, enum: ['Operational', 'Comfort', 'Minimalist', 'Concierge', 'Technical'] },
          text: { type: 'string' as const },
        },
        required: ['speaker', 'text'],
      },
    },
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
  required: ['agentConversation', 'frontScreen', 'rearScreen', 'appNotification', 'voice'],
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

FIRST, generate a transcript of the ENSEMBLE AGENTS having a conversation with each other in the "agentConversation" array. They must debate and discuss the incident, what happened, and what the best approach is to communicate with the passenger. They should act like a team in a control room. Let them talk for 3-5 messages.

IMPORTANT: If the incident severity is "medium" or "low" (e.g. routine lane change, smooth deceleration), the agents MUST remain calm, professional, and brief. They should only show urgency for "high" severity incidents. If no safety threat exists, treat it as a routine operational state.

THEN, assign each agent to generate the finalized content for the channel best suited to their persona. Return a JSON object with the conversation and the content for all 4 channels.`
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
  const isHigh = incident.severity === 'high'
  return {
    agentConversation: [
      { speaker: 'Technical', text: isHigh ? 'Critical telemetry anomaly detected.' : 'Routine maneuver recorded in logs.' },
      { speaker: 'Operational', text: isHigh ? 'Acknowledged. Prioritizing safety explanation.' : 'Agreed. Minor update for the passenger.' },
    ],
    frontScreen: {
      headline: isHigh ? `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}` : 'Standard Maneuver',
      body: incident.description,
      icon: isHigh ? 'warning' : 'info',
      etaImpact: isHigh ? 'May add 1-2 minutes' : undefined,
    },
    rearScreen: {
      headline: isHigh ? 'Safety Maneuver' : 'Smooth Transit',
      comfortNote: isHigh ? 'The vehicle is responding to road conditions.' : 'We are adjusting our position for a smoother ride.',
      icon: 'safety',
    },
    appNotification: {
      title: `CalmRide: ${isHigh ? 'Safety Alert' : 'Update'}`,
      body: isHigh ? `Detected ${typeLabel}. ${incident.description}` : `Performing a routine ${typeLabel}.`,
      priority: isHigh ? 'high' : 'low',
    },
    voice: {
      text: isHigh ? `I'm making a safety maneuver. ${incident.description}.` : `Just a routine ${typeLabel} for a better route.`,
      tone: isHigh ? 'urgent' : 'calm',
    },
  }
}
