"""
Lifecycle Controller
====================
Global API endpoints for lifecycle management of any entity.

Routes:
    GET  /api/lifecycle/types                    - List registered entity types
    GET  /api/lifecycle/types/<type>/config      - Get lifecycle config for entity type
    GET  /api/lifecycle/types/<type>/overview    - Get status counts overview
    GET  /api/lifecycle/types/<type>/display     - Get display metadata for all states
    GET  /api/lifecycle/types/<type>/states      - Get available states
    GET  /api/lifecycle/types/<type>/transitions/<status> - Get valid transitions from status

    POST /api/lifecycle/transition               - Transition single entity
    POST /api/lifecycle/batch-transition         - Transition multiple entities

    GET  /api/lifecycle/entity/<type>/<id>       - Get entity lifecycle info
    GET  /api/lifecycle/entity/<type>/<id>/history - Get entity transition history
    GET  /api/lifecycle/history                  - Get recent transitions (global)
"""

from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.api.services.lifecycle_service import LifecycleService
from src.api.utils.response import success, error
from src.api.utils.request import get_json_body

lifecycle_bp = Blueprint("lifecycle", __name__, url_prefix="/api/lifecycle")


def _uid():
    return int(get_jwt_identity())


# ─── Registry Info ────────────────────────────────────────


@lifecycle_bp.route("/types", methods=["GET"])
@jwt_required()
def list_registered_types():
    """List all registered entity types."""
    types = LifecycleService.get_registered_types()
    result = []
    for t in types:
        config = LifecycleService.get_config(t)
        result.append(
            {
                "entity_type": t,
                "states": config.get("states", []),
                "default": config.get("default"),
                "display": config.get("display", {}),
            }
        )
    return success({"types": result})


@lifecycle_bp.route("/types/<entity_type>/config", methods=["GET"])
@jwt_required()
def get_type_config(entity_type):
    """Get full lifecycle config for an entity type."""
    config = LifecycleService.get_config(entity_type)
    if not config:
        return error(f"Entity type '{entity_type}' not registered", 404)
    # Don't expose model_class and adapter in API
    safe_config = {
        "entity_type": entity_type,
        "states": config.get("states", []),
        "transitions": config.get("transitions", {}),
        "default": config.get("default"),
        "display": config.get("display", {}),
        "status_field": config.get("status_field", "status"),
    }
    return success(safe_config)


@lifecycle_bp.route("/types/<entity_type>/overview", methods=["GET"])
@jwt_required()
def get_type_overview(entity_type):
    """Get status counts overview for an entity type."""
    result, err = LifecycleService.get_overview(entity_type)
    if err:
        return error(err, 404)
    return success(result)


@lifecycle_bp.route("/types/<entity_type>/display", methods=["GET"])
@jwt_required()
def get_type_display(entity_type):
    """Get display metadata for all states of an entity type."""
    result, err = LifecycleService.get_all_display_info(entity_type)
    if err:
        return error(err, 404)
    return success({"entity_type": entity_type, "display": result})


@lifecycle_bp.route("/types/<entity_type>/states", methods=["GET"])
@jwt_required()
def get_type_states(entity_type):
    """Get available states for an entity type."""
    states, err = LifecycleService.get_states(entity_type)
    if err:
        return error(err, 404)
    return success({"entity_type": entity_type, "states": states})


@lifecycle_bp.route(
    "/types/<entity_type>/transitions/<current_status>", methods=["GET"]
)
@jwt_required()
def get_valid_transitions(entity_type, current_status):
    """Get valid transitions from a given status."""
    transitions, err = LifecycleService.get_valid_transitions(
        entity_type, current_status
    )
    if err:
        return error(err, 404)
    return success(
        {
            "entity_type": entity_type,
            "current_status": current_status,
            "valid_transitions": transitions,
        }
    )


# ─── Transitions ──────────────────────────────────────────


@lifecycle_bp.route("/transition", methods=["POST"])
@jwt_required()
def transition_entity():
    """Transition a single entity to a new status."""
    data, err = get_json_body()
    if err:
        return error(err, 400)

    entity_type = data.get("entity_type")
    entity_id = data.get("entity_id")
    to_status = data.get("to_status")
    reason = data.get("reason")
    metadata = data.get("metadata")

    if not all([entity_type, entity_id, to_status]):
        return error("entity_type, entity_id, and to_status are required", 400)

    entity, err = LifecycleService.transition(
        entity_type=entity_type,
        entity_id=entity_id,
        to_status=to_status,
        user_id=_uid(),
        reason=reason,
        metadata=metadata,
    )
    if err:
        return error(err, 400)

    # Use adapter's admin payload if available
    config = LifecycleService.get_config(entity_type)
    adapter = config.get("adapter") if config else None
    if adapter and hasattr(adapter, "get_admin_payload"):
        payload = adapter.get_admin_payload(entity)
    elif hasattr(entity, "to_dict_admin"):
        payload = entity.to_dict_admin()
    elif hasattr(entity, "to_dict"):
        payload = entity.to_dict()
    else:
        payload = {"id": entity.id}

    info, _ = LifecycleService.get_entity_status_info(entity_type, entity_id)
    return success(
        {
            "entity": payload,
            "lifecycle": info,
        },
        f"Transitioned to '{to_status}'",
    )


@lifecycle_bp.route("/batch-transition", methods=["POST"])
@jwt_required()
def batch_transition():
    """Transition multiple entities at once."""
    data, err = get_json_body()
    if err:
        return error(err, 400)

    entity_type = data.get("entity_type")
    entity_ids = data.get("entity_ids", [])
    to_status = data.get("to_status")
    reason = data.get("reason")
    metadata = data.get("metadata")

    if not all([entity_type, to_status]):
        return error("entity_type and to_status are required", 400)
    if not entity_ids:
        return error("entity_ids cannot be empty", 400)

    result, err = LifecycleService.batch_transition(
        entity_type=entity_type,
        entity_ids=entity_ids,
        to_status=to_status,
        user_id=_uid(),
        reason=reason,
        metadata=metadata,
    )
    if err:
        return error(err, 400)

    return success(result, f"Batch transition to '{to_status}' completed")


# ─── Entity Info ──────────────────────────────────────────


@lifecycle_bp.route("/entity/<entity_type>/<int:entity_id>", methods=["GET"])
@jwt_required()
def get_entity_info(entity_type, entity_id):
    """Get current lifecycle info for a specific entity."""
    info, err = LifecycleService.get_entity_status_info(entity_type, entity_id)
    if err:
        return error(err, 404)
    return success(info)


@lifecycle_bp.route("/entity/<entity_type>/<int:entity_id>/history", methods=["GET"])
@jwt_required()
def get_entity_history(entity_type, entity_id):
    """Get transition history for a specific entity."""
    history, err = LifecycleService.get_history(entity_type, entity_id)
    if err:
        return error(err, 404)
    return success(
        {"entity_type": entity_type, "entity_id": entity_id, "history": history}
    )


# ─── Global History ───────────────────────────────────────


@lifecycle_bp.route("/history", methods=["GET"])
@jwt_required()
def get_recent_history():
    """Get recent lifecycle transitions (global or filtered by entity type)."""
    from flask import request

    entity_type = request.args.get("entity_type")
    limit = request.args.get("limit", 50, type=int)

    history, err = LifecycleService.get_recent_transitions(entity_type, limit)
    if err:
        return error(err, 400)

    return success({"history": history})
