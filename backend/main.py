"""
CalmRide Backend — FastAPI Application

Serves WOMD scenario data to the React frontend.
Uses Waymax for data loading and metrics when available,
falls back to local sample JSON files otherwise.

Start with:
    cd backend && uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS, BACKEND_PORT
from models import ParsedScenarioModel, ScenarioSummaryModel
from services.data_loader import initialize, list_scenarios, get_scenario
from services.metrics_service import (
    compute_waymax_metrics,
    metrics_to_incidents,
    _ensure_waymax_metrics,
)

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="CalmRide Backend",
    description="Waymax-powered scenario data API for the CalmRide Simulator",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup_event():
    logger.info("🚗 CalmRide Backend starting...")
    initialize()
    logger.info("🚗 CalmRide Backend ready")


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "service": "CalmRide Backend",
        "version": "1.0.0",
        "waymax_available": _ensure_waymax_metrics(),
    }


@app.get("/api/health")
async def health():
    scenarios = list_scenarios()
    return {
        "status": "ok",
        "scenario_count": len(scenarios),
        "waymax_metrics_available": _ensure_waymax_metrics(),
    }


@app.get("/api/scenarios", response_model=list[ScenarioSummaryModel])
async def get_scenarios():
    """List all available scenarios."""
    return list_scenarios()


@app.get("/api/scenarios/{scenario_id}", response_model=ParsedScenarioModel)
async def get_scenario_detail(scenario_id: str):
    """Get full scenario data by ID."""
    scenario = get_scenario(scenario_id)
    if not scenario:
        raise HTTPException(
            status_code=404, detail=f"Scenario '{scenario_id}' not found"
        )
    return scenario


@app.get("/api/scenarios/{scenario_id}/metrics")
async def get_scenario_metrics(scenario_id: str):
    """
    Get Waymax-computed metrics for a scenario.
    Returns null metrics if Waymax is not available.
    """
    scenario = get_scenario(scenario_id)
    if not scenario:
        raise HTTPException(
            status_code=404, detail=f"Scenario '{scenario_id}' not found"
        )

    return {
        "scenario_id": scenario_id,
        "waymax_metrics": scenario.waymax_metrics,
        "waymax_available": _ensure_waymax_metrics(),
    }


# ---------------------------------------------------------------------------
# Run directly
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=BACKEND_PORT, reload=True)
