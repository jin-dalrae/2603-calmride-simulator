"""
CalmRide Backend — Firebase Functions Entry Point
"""

from __future__ import annotations

import logging
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from firebase_functions import https_fn
from firebase_functions.options import set_global_options
from firebase_admin import initialize_app as initialize_firebase

# Memory and Scale configuration for Waymax
set_global_options(max_instances=10, memory=2048)

from config import CORS_ORIGINS
from models import ParsedScenarioModel, ScenarioSummaryModel
from services.data_loader import initialize, list_scenarios, get_scenario
from services.metrics_service import _WAYMAX_METRICS_AVAILABLE

# Initialize Firebase Admin
initialize_firebase()

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Load Data lazily
# ---------------------------------------------------------------------------
_initialized = False


def ensure_initialized():
    global _initialized
    if not _initialized:
        initialize()
        _initialized = True
        logger.info("🚗 CalmRide Backend initialized with data")


# ---------------------------------------------------------------------------
# FastAPI App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="CalmRide Backend",
    description="Waymax-powered scenario data API for the CalmRide Simulator",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for simplicity in deployment, adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "service": "CalmRide Backend",
        "version": "1.0.0",
        "waymax_available": _WAYMAX_METRICS_AVAILABLE,
    }


@app.get("/api/health")
async def health():
    ensure_initialized()
    scenarios = list_scenarios()
    return {
        "status": "ok",
        "scenario_count": len(scenarios),
        "waymax_metrics_available": _WAYMAX_METRICS_AVAILABLE,
    }


@app.get("/api/scenarios", response_model=list[ScenarioSummaryModel])
async def get_scenarios():
    """List all available scenarios."""
    ensure_initialized()
    return list_scenarios()


@app.get("/api/scenarios/{scenario_id}", response_model=ParsedScenarioModel)
async def get_scenario_detail(scenario_id: str):
    """Get full scenario data by ID."""
    ensure_initialized()
    scenario = get_scenario(scenario_id)
    if not scenario:
        raise HTTPException(
            status_code=404, detail=f"Scenario '{scenario_id}' not found"
        )
    return scenario


@app.get("/api/scenarios/{scenario_id}/metrics")
async def get_scenario_metrics(scenario_id: str):
    """Get Waymax-computed metrics for a scenario."""
    ensure_initialized()
    scenario = get_scenario(scenario_id)
    if not scenario:
        raise HTTPException(
            status_code=404, detail=f"Scenario '{scenario_id}' not found"
        )

    return {
        "scenario_id": scenario_id,
        "waymax_metrics": scenario.waymax_metrics,
        "waymax_available": _WAYMAX_METRICS_AVAILABLE,
    }


# ---------------------------------------------------------------------------
# Firebase Cloud Function wrapper
# ---------------------------------------------------------------------------
@https_fn.on_request()
def api(req: https_fn.Request) -> https_fn.Response:
    """Entry point for Firebase Functions to handle HTTP requests."""
    return https_fn.asgi_handler(app)(req)
