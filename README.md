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

### Frontend
- **Vite + React + TypeScript** — modern web stack
- **Three.js (React Three Fiber + drei)** — Waymo World Model cinematic renderer
- **Zustand** — global state orchestration
- **Google Gemini 2.0 Flash** — LLM-driven ensemble deliberation
- **Web Speech API** — synthesized voice communications

### Backend (Waymax Engine)
- **FastAPI** — research-data gateway
- **Waymax (JAX)** — high-fidelity simulation and metrics computation
- **TensorFlow** — TFRecord parsing and data loading

The backend is **optional** — the frontend works standalone with local sample scenarios. When the backend is running, it adds:
- **Real WOMD scenarios** loaded via `waymax.dataloader` (103K+ segments)
- **Research-grade metrics** via `waymax.metrics` (collision overlap, offroad, wrong-way, comfort)
- **Server-side incident classification** with richer detection than the frontend's threshold-based approach

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini API key ([get one here](https://aistudio.google.com/apikey))
- Python 3.10+ (for the backend — optional)

### Install & Run (Frontend Only)

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

### Install & Run (With Waymax Backend)

1. **Set up the Python backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. **Configure WOMD data access:**

```bash
cp .env.example .env
# Edit .env and set WOMD_DATA_DIR to your WOMD TFRecord directory
```

> You need to download the Waymo Open Motion Dataset from [waymo.com/open](https://waymo.com/open). Accept the terms of use, then download the motion dataset TFRecord files.

3. **Start the backend:**

```bash
./venv/bin/uvicorn main:app --reload --port 8000
```

4. **Start the frontend** (in a separate terminal):

```bash
cd ..  # back to calmride-simulator root
npm run dev
```

The frontend will automatically detect the backend and switch to loading scenarios from the API. The Vite dev server proxies `/api/*` requests to `localhost:8000`.

> If the backend is not running, the frontend falls back to local sample scenarios — no configuration needed.

---

## How to Use

### 1. Select a Scenario

Use the **Scenario** dropdown in the sidebar to load one of the included scenarios:

- **Intersection Stop** — Ego vehicle hard-brakes for a jaywalking pedestrian
- **Highway Lane Change** — Ego vehicle changes lanes to pass a slow truck
- **Pedestrian Crossing** — Ego vehicle yields at an uncontrolled crosswalk

With the backend running, you'll also see WOMD scenarios loaded via Waymax.

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

With Waymax metrics enabled, additional detections include:

- **Collision overlap** — bounding-box overlap with other agents
- **Offroad** — vehicle leaves the driveable road area
- **Wrong-way** — driving against traffic direction
- **Kinematic infeasibility** — comfort violations (jerk, lateral acceleration)

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

The UI uses a cinematic 4-column layout designed for real-time monitoring and AI deliberation tracking:

```
+---------+-----------+-----------+-----------+
|         |           |           |           |
| Sidebar | Three.js  | Telemetry | Ensemble  |
| (280px) | View      | Stream    | Chat      |
|         |           | (280px)   | (Resizable)|
|         |           |           |           |
+---------+-----------+-----------+-----------+
|         | Timeline  |           |           |
+---------+-----------+-----------+-----------+
|         | Channels (Front/Rear/App/Voice)    |
+---------+-----------------------------------+
```

---

## Aesthetic: Waymo World Model

The simulation and UI are inspired by the **Waymo World Model** aesthetic (as seen in Waymo's 2026 frontiers research):
- **Cinematic Rendering**: 3D perspective with realistic lighting, shadows, and environment mapping.
- **High-Fidelity Telemetry**: Real-time smoothing and interpolation of agent data for 60fps monitoring.
- **Dark Mode Terminal**: Monospace typography and high-contrast technical indicators (cyan, amber, emerald).
- **Agent Intelligence**: A dedicated deliberation panel where the AI ensemble debates the best communication strategy before broadcasting.

---

## Adding Custom Scenarios

### Local JSON Files

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

If `agents` and `map_features` are omitted, the parser generates synthetic trajectories from the Q&A text descriptions.

### WOMD TFRecord Files (via Waymax)

Place WOMD TFRecord files in `backend/data/womd/` (or set `WOMD_DATA_DIR` in `backend/.env`). The backend will automatically index and serve these scenarios via the API.

---

## Project Structure

```
calmride-simulator/
├── src/                    # React frontend
│   ├── types/              # TypeScript interfaces (WOMD, scenario, channels, prompt)
│   ├── store/              # Zustand stores (scenario, playback, prompt, explanation)
│   ├── hooks/              # React hooks (playback loop, incident detection, Gemini trigger)
│   ├── services/           # API client, Gemini, scenario parser, trajectory interpolator
│   ├── components/
│   │   ├── layout/         # ControlRoom grid, Sidebar, ChannelStrip
│   │   ├── scene/          # R3F components (EgoVehicle, SurroundingAgent, RoadMap, etc.)
│   │   ├── timeline/       # TimelineBar, DataAccumulator
│   │   ├── channels/       # FrontScreen, RearScreen, AppNotification, VoiceChannel
│   │   └── controls/       # ScenarioPicker, SystemPromptEditor, ToneSliders, etc.
│   └── utils/              # Color maps, math helpers
├── backend/                # FastAPI + Waymax backend (optional)
│   ├── main.py             # FastAPI app entry point
│   ├── config.py           # Environment configuration
│   ├── models.py           # Pydantic response models
│   ├── services/
│   │   ├── data_loader.py  # Waymax dataloader + sample JSON loader
│   │   └── metrics_service.py  # Waymax metrics computation
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Example environment variables
└── public/
    └── sample-scenarios/   # Local JSON scenario files (fallback)
```

---

## Waymax Integration

The backend uses several [Waymax](https://github.com/waymo-research/waymax) components:

| Waymax Module | How CalmRide Uses It |
|---|---|
| `waymax.dataloader` | Loads real WOMD scenarios (trajectories, maps, traffic signals) |
| `waymax.metrics` | Computes overlap, offroad, wrong-way, comfort, and route metrics |
| `waymax.datatypes` | Standardized data structures for simulator state |

Waymax modules **not used**: `waymax.env` (RL environment), `waymax.rewards` (RL rewards), `waymax.agents` (sim agent training).

> **Note:** Waymax is licensed for **non-commercial use** only. See the [Waymax License Agreement](https://github.com/waymo-research/waymax/blob/main/LICENSE).
