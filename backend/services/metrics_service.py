"""
Waymax metrics service.

Computes research-grade driving metrics on scenario data using waymax.metrics,
providing richer incident classification than the simple threshold-based
approach.

Falls back gracefully if Waymax is not installed.
"""

from __future__ import annotations

import logging
import math
from typing import Optional

from models import (
    AgentModel,
    IncidentModel,
    WaymaxMetricsModel,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
_WAYMAX_METRICS_AVAILABLE = False
waymax_overlap = None
waymax_roadgraph = None
waymax_comfort = None
waymax_route = None
waymax_imitation = None


def _ensure_waymax_metrics():
    global \
        _WAYMAX_METRICS_AVAILABLE, \
        waymax_overlap, \
        waymax_roadgraph, \
        waymax_comfort, \
        waymax_route, \
        waymax_imitation
    if waymax_overlap is not None:
        return _WAYMAX_METRICS_AVAILABLE
    try:
        from waymax.metrics import overlap, roadgraph, comfort, route, imitation

        waymax_overlap = overlap
        waymax_roadgraph = roadgraph
        waymax_comfort = comfort
        waymax_route = route
        waymax_imitation = imitation
        _WAYMAX_METRICS_AVAILABLE = True
        logger.info("✅ Waymax metrics module loaded")
    except ImportError:
        _WAYMAX_METRICS_AVAILABLE = False
        logger.warning(
            "⚠️  Waymax metrics not available — using threshold-based classification only"
        )
    return _WAYMAX_METRICS_AVAILABLE


def compute_waymax_metrics(state) -> Optional[WaymaxMetricsModel]:
    """
    Compute Waymax metrics on a simulator state.

    Args:
        state: A Waymax SimulatorState object from the dataloader.

    Returns:
        WaymaxMetricsModel with per-scenario metric results, or None if
        Waymax is not available.
    """
    if not _ensure_waymax_metrics() or state is None:
        return None

    try:
        # Overlap detection (collision with other agents)
        overlap_result = waymax_overlap.compute_overlap(state)
        has_overlap = bool(overlap_result.any())

        # Offroad detection
        offroad_result = waymax_roadgraph.compute_offroad(state)
        has_offroad = bool(offroad_result.any())

        # Wrong-way detection
        wrong_way_result = waymax_roadgraph.compute_wrong_way(state)
        has_wrong_way = bool(wrong_way_result.any())

        # Kinematic infeasibility (comfort)
        comfort_result = waymax_comfort.compute_kinematic_infeasibility(state)
        has_kinematic_issue = bool(comfort_result.any())

        # Log divergence (MSE from recorded trajectory)
        log_div = waymax_imitation.compute_log_divergence(state)
        log_divergence_val = float(log_div.mean()) if log_div is not None else 0.0

        # Route following
        try:
            route_result = waymax_route.compute_route_following(state)
            is_following_route = bool(route_result.all())
        except Exception:
            is_following_route = True  # Default if route info unavailable

        return WaymaxMetricsModel(
            overlap=has_overlap,
            offroad=has_offroad,
            wrong_way=has_wrong_way,
            kinematic_infeasible=has_kinematic_issue,
            log_divergence=log_divergence_val,
            route_following=is_following_route,
        )

    except Exception as e:
        logger.error(f"Error computing Waymax metrics: {e}")
        return None


def metrics_to_incidents(
    metrics: WaymaxMetricsModel,
    agents: list[AgentModel],
    ego_id: str,
    base_count: int = 0,
) -> list[IncidentModel]:
    """
    Convert Waymax metric results into CalmRide Incident objects.

    These supplement the threshold-based incidents from the data_loader
    with Waymax's richer detections.
    """
    incidents: list[IncidentModel] = []
    count = base_count

    ego = next((a for a in agents if a.id == ego_id), None)
    if not ego or not ego.trajectory:
        return incidents

    # Use midpoint of trajectory as approximate incident location
    mid_idx = len(ego.trajectory) // 2
    mid_point = ego.trajectory[mid_idx]

    if metrics.overlap:
        incidents.append(
            IncidentModel(
                id=f"incident-wx-{count}",
                type="near_miss",
                timestamp=mid_point.t,
                x=mid_point.x,
                y=mid_point.y,
                description="Waymax detected bounding-box overlap with another agent",
                severity="high",
            )
        )
        count += 1

    if metrics.offroad:
        incidents.append(
            IncidentModel(
                id=f"incident-wx-{count}",
                type="offroad",
                timestamp=mid_point.t,
                x=mid_point.x,
                y=mid_point.y,
                description="Vehicle left the driveable road area",
                severity="high",
            )
        )
        count += 1

    if metrics.wrong_way:
        incidents.append(
            IncidentModel(
                id=f"incident-wx-{count}",
                type="wrong_way",
                timestamp=mid_point.t,
                x=mid_point.x,
                y=mid_point.y,
                description="Vehicle detected driving against traffic direction",
                severity="high",
            )
        )
        count += 1

    if metrics.kinematic_infeasible:
        incidents.append(
            IncidentModel(
                id=f"incident-wx-{count}",
                type="erratic_movement",
                timestamp=mid_point.t,
                x=mid_point.x,
                y=mid_point.y,
                description="Kinematically infeasible motion detected (comfort violation)",
                severity="medium",
            )
        )
        count += 1

    return incidents
