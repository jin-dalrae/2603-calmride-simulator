"""
Pydantic models for API responses.
These mirror the frontend TypeScript types in src/types/scenario.ts and src/types/womd.ts.
"""

from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel


# ---------- Trajectory ----------
class TrajectoryPointModel(BaseModel):
    t: float
    x: float
    y: float
    heading: float
    speed: float
    accel: float = 0.0


# ---------- Agent ----------
AgentType = Literal["ego", "vehicle", "pedestrian", "cyclist"]


class AgentModel(BaseModel):
    id: str
    type: AgentType
    length: float = 4.5
    width: float = 2.0
    height: float = 1.5
    trajectory: list[TrajectoryPointModel]


# ---------- Q&A ----------
QACategory = Literal["environment", "ego", "surrounding", "interaction"]


class QAPairModel(BaseModel):
    category: QACategory
    question: str
    answer: str
    timestamp: float = 0.0


# ---------- Incident ----------
IncidentType = Literal[
    "hard_brake", "sudden_stop", "lane_change",
    "near_miss", "erratic_movement",
    "offroad", "wrong_way",  # New from Waymax metrics
]


class IncidentModel(BaseModel):
    id: str
    type: IncidentType
    timestamp: float
    x: float
    y: float
    description: str
    severity: Literal["low", "medium", "high"]


# ---------- Map ----------
MapFeatureType = Literal[
    "LaneCenter-Freeway", "LaneCenter-SurfaceStreet", "LaneCenter-BikeLane",
    "RoadLine-BrokenSingleWhite", "RoadLine-SolidSingleWhite", "RoadLine-SolidDoubleWhite",
    "RoadLine-BrokenSingleYellow", "RoadLine-BrokenDoubleYellow",
    "RoadLine-SolidSingleYellow", "RoadLine-SolidDoubleYellow", "RoadLine-PassingDoubleYellow",
    "RoadEdgeBoundary", "RoadEdgeMedian",
    "StopSign", "Crosswalk", "SpeedBump",
    "lane_boundary", "crosswalk", "stop_sign", "speed_bump", # Fallback
    "lane_center", "road_edge", # Fallback
]


class MapFeatureModel(BaseModel):
    type: MapFeatureType
    points: list[dict]  # [{x, y}]


# ---------- Traffic Signals ----------
class TrafficSignalModel(BaseModel):
    id: str
    x: float
    y: float
    state: int  # 0-8 (Waymo palette)
    timestamp: float


# ---------- Waymax Metrics ----------
class WaymaxMetricsModel(BaseModel):
    """Per-scenario metric results computed by Waymax."""
    overlap: bool = False         # Any bounding-box overlap with other agents
    offroad: bool = False         # Vehicle leaves driveable area
    wrong_way: bool = False       # Vehicle driving against traffic direction
    kinematic_infeasible: bool = False  # Violates vehicle dynamics constraints
    log_divergence: float = 0.0   # MSE from logged trajectory
    route_following: bool = True  # Following the intended route


# ---------- Full Scenario ----------
class ScenarioSummaryModel(BaseModel):
    """Lightweight scenario info for the scenario list."""
    id: str
    agent_count: int
    duration: float
    has_incidents: bool
    incident_types: list[str] = []
    source: Literal["womd", "womd_reasoning", "sample"] = "sample"


class ParsedScenarioModel(BaseModel):
    """Full scenario data for the detail view."""
    id: str
    ego_id: str
    duration: float
    cur_time: float
    agents: list[AgentModel]
    qa_pairs: list[QAPairModel]
    incidents: list[IncidentModel]
    map_features: list[MapFeatureModel]
    traffic_signals: list[TrafficSignalModel] = []
    waymax_metrics: Optional[WaymaxMetricsModel] = None
    source: Literal["womd", "womd_reasoning", "sample"] = "sample"
