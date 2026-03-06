"""
CalmRide Backend Configuration

Environment variables:
  WOMD_DATA_DIR  — Path to the directory containing WOMD TFRecord files
  WOMD_VERSION   — Dataset version (default: 1.2.1)
  BACKEND_PORT   — Port to serve on (default: 8000)
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# --- Waymo Open Motion Dataset ---
BASE_DIR = Path(__file__).parent
WOMD_DATA_DIR = Path(os.getenv("WOMD_DATA_DIR", BASE_DIR / "data" / "womd"))
WOMD_VERSION = os.getenv("WOMD_VERSION", "1.2.1")

# --- Server ---
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8000"))
CORS_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:4173",  # Vite preview
    "http://127.0.0.1:5173",
]

# --- Data limits ---
MAX_SCENARIOS = 500          # Max scenarios to index at startup
MAX_AGENTS_PER_SCENARIO = 32 # Limit agents returned per scenario
TRAJECTORY_SAMPLE_RATE = 5   # Sample every Nth point for large trajectories
