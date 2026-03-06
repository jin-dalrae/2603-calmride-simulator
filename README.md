# CalmRide Simulator

A ride simulator that plays back real Waymo Open Motion Dataset (WOMD) driving scenarios in a Three.js bird's-eye view, generates passenger-facing explanations via Google Gemini AI across 4 communication channels, and lets you iterate on explanation style through prompt controls.

Built to explore the question: **What should an autonomous vehicle say to its passengers when something unexpected happens?**

---

## What It Does

CalmRide loads driving scenarios (intersection stops, lane changes, pedestrian crossings), animates the vehicles and pedestrians in a top-down 3D view, and automatically detects incidents like hard braking or sudden stops. When an incident occurs, it sends the scenario context to Google Gemini, which generates tailored passenger communications for 4 channels:

| Channel | Description |
|---|---|
| **Front Screen** | Tablet-style display — headline, explanation body, icon, ETA impact |
| **Rear Screen** | Larger font, simpler language — headline + comfort note |
| **App Notification** | Mobile push notification mockup — concise title + body with priority |
| **Voice** | Spoken aloud via browser Text-to-Speech — natural, conversational tone |

You control the AI's communication style in real-time using tone sliders (anxiety acknowledgment, technical depth, verbosity), personality presets (Professional / Friendly / Minimal), and a fully editable system prompt.

---

## Tech Stack

- **Vite + React + TypeScript** — frontend framework
- **Three.js** (React Three Fiber + drei) — 3D bird's-eye scene
- **Zustand** — state management
- **Google Gemini API** (`@google/generative-ai`) — explanation generation with structured JSON output
- **Browser SpeechSynthesis API** — voice channel TTS

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini API key ([get one here](https://aistudio.google.com/apikey))

### Install & Run

```bash
cd calmride-simulator
npm install
```

Add your Gemini API key to `.env`:

```
VITE_GEMINI_API_KEY=your-api-key-here
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> Without a Gemini API key, the app still works — incident explanations fall back to locally generated templates.

---

## How to Use

### 1. Select a Scenario

Use the **Scenario** dropdown in the sidebar to load one of the included scenarios:

- **Intersection Stop** — Ego vehicle hard-brakes for a jaywalking pedestrian
- **Highway Lane Change** — Ego vehicle changes lanes to pass a slow truck
- **Pedestrian Crossing** — Ego vehicle yields at an uncontrolled crosswalk

### 2. Play the Scenario

- Press the **Play** button or hit **Space** to start playback
- Agents animate along their trajectories in the bird's-eye view
- The **Data Accumulator** in the sidebar progressively reveals Q&A pairs as time advances
- Red dots on the timeline mark detected incidents

### 3. Watch for Incidents

The system automatically detects:

- **Hard braking** — deceleration > 6 m/s²
- **Sudden stops** — rapid speed drop to near zero
- **Lane changes** — heading change > 15°

When an incident is detected, it triggers a Gemini API call and all 4 channel previews populate with generated explanations. A pulsing red ring appears at the incident location in the scene.

### 4. Adjust Communication Style

- **Personality** — Switch between Professional, Friendly, or Minimal
- **Tone Sliders** — Adjust anxiety acknowledgment (0-100), technical depth (0-100), and verbosity (0-100)
- **System Prompt** — Edit the full system prompt to change the AI's behavior
- **Regenerate** — Click to re-generate explanations with your updated settings

### 5. Listen to Voice

Click **Play** on the Voice channel card to hear the explanation spoken aloud via browser TTS.

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `Left Arrow` | Seek back 0.5s |
| `Right Arrow` | Seek forward 0.5s |

---

## Layout

```
+------------------+-----------------------------+
|                  |                             |
|   Sidebar        |     Three.js Bird's-Eye     |
|   (300px)        |     (OrthographicCamera)    |
|                  |                             |
|  - Scenario      +-----------------------------+
|    Picker        |     Timeline Bar            |
|  - Personality   +-----------------------------+
|  - Tone Sliders  |  Front  | Rear  | App |Voice|
|  - System Prompt |  Screen | Screen| Push| TTS |
|  - Regenerate    |         |       |     |     |
|  - Data          |         |       |     |     |
|    Accumulator   |         |       |     |     |
+------------------+-----------------------------+
```

---

## Adding Custom Scenarios

Place WOMD-Reasoning JSON files in `public/sample-scenarios/` following this structure:

```json
{
  "sid": "my-scenario-id",
  "ego": "ego",
  "cur_time": 0,
  "future_time": 9,
  "env_q": ["..."],
  "env_a": ["..."],
  "ego_q": ["..."],
  "ego_a": ["..."],
  "sur_q": ["..."],
  "sur_a": ["..."],
  "int_q": ["..."],
  "int_a": ["..."],
  "agents": [
    {
      "id": "ego",
      "type": "vehicle",
      "trajectory": [
        { "t": 0, "x": 0, "y": 0, "heading": 0, "vx": 10, "vy": 0 }
      ]
    }
  ],
  "map_features": [
    {
      "type": "lane_boundary",
      "polyline": [{ "x": 0, "y": 0 }, { "x": 100, "y": 0 }]
    }
  ]
}
```

Then add the filename to the `SCENARIO_FILES` array in `src/store/useScenarioStore.ts`.

If `agents` and `map_features` are omitted, the parser generates synthetic trajectories from the Q&A text descriptions.

---

## Project Structure

```
src/
├── types/          # TypeScript interfaces (WOMD, scenario, channels, prompt)
├── store/          # Zustand stores (scenario, playback, prompt, explanation)
├── hooks/          # React hooks (playback loop, incident detection, Gemini trigger)
├── services/       # Gemini API client, scenario parser, trajectory interpolator, incident classifier
├── components/
│   ├── layout/     # ControlRoom grid, Sidebar, ChannelStrip
│   ├── scene/      # R3F components (EgoVehicle, SurroundingAgent, RoadMap, etc.)
│   ├── timeline/   # TimelineBar, DataAccumulator
│   ├── channels/   # FrontScreen, RearScreen, AppNotification, VoiceChannel
│   └── controls/   # ScenarioPicker, SystemPromptEditor, ToneSliders, etc.
└── utils/          # Color maps, math helpers
```
