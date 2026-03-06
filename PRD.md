# Product Requirements Document: CalmRide Simulator

## Vision
To create a high-fidelity simulator that explores the intersection of autonomous driving telemetry and large language model (LLM) reasoning, specifically focusing on passenger communication during non-routine events.

## Core Pillars
1. **Real-World Fidelity**: Use the Waymo Open Motion Dataset (WOMD) and Waymax to provide realistic, multi-agent scenarios.
2. **AI-Driven Communication**: Utilize Google Gemini to generate multi-channel, persona-driven explanations for driving maneuvers.
3. **High-Tech Aesthetic**: Adopt the "Waymo World Model" look—a clean, technical, and cinematic representation of autonomous driving data.
4. **Interactive Transparency**: Expose the underlying "deliberation" of the AI agents to build trust through transparency.

## User Persona: "The Explainability Researcher"
Researchers who want to test how different communication strategies (tone, technical depth, persona) affect passenger trust and comfort in autonomous vehicles.

## Key Features

### 1. Cinematic Simulation Engine
- Perspective 3D view with dynamic lighting and environment mapping.
- Realistic EGO vehicle model with status LEDs and functional headlights/taillights.
- High-fidelity map rendering following Waymo standard color palettes.
- Smooth 60fps trajectory interpolation for all agents.

### 2. Live Telemetry Engine
- Real-time EGO unit telemetry (coordinates, velocity, heading, acceleration).
- Proximity detection of surrounding agents with dynamic distance tracking.
- System metrics (timing, sampling rate, latency indicators).

### 3. AI Ensemble Deliberation
- A dedicated "Control Room" panel where specialized AI agents (Operational, Comfort, Technical, Concierge) debate incident explanations.
- Periodic "Routine Status Updates" every 8 seconds of smooth driving to maintain presence.
- Severity-based filtering: Only medium/high incidents or scheduled updates trigger full deliberations.

### 4. Multi-Channel Interface
- **Front Screen**: High-impact terminal view for factual updates.
- **Rear Screen**: Large-format comfort/reassurance view with high-fidelity status indicators.
- **App Notification**: Mobile-optimized alerts with priority-coded visual headers.
- **Voice TTS**: Natural language spoken updates with tone-specific synthesis.

### 5. Control Suite
- **Scenario Source**: Waymo TFRecord research data vs. synthetic matrices.
- **AI personality Kernel**: Grid-based selection of LLM reasoning profiles.
- **Tone Parameters**: Real-time control of anxiety acknowledgment, technical depth, and verbosity.
- **System Instruction Set**: Direct override of AI behavior via system prompt injection.

## Aesthetics & UI
- **Primary Color Palette**: Deep blacks (#050505), Slate grays, and high-contrast indicators (Sky Blue, Emerald, Amber).
- **Typography**: Monospace (for technical data) paired with clean sans-serif for UI.
- **Layout**: 4-column "Mission Control" grid with resizable intelligence panels.

## Technical Constraints
- Frontend: Vite + React + Three.js (R3F).
- Backend: FastAPI + Waymax + JAX.
- AI: Google Gemini 2.0 Flash (via generative-ai SDK).
- Deployment: Firebase Hosting + Functions.
