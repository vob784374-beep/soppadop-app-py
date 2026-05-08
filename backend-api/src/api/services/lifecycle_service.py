"""
Lifecycle Service
=================
Centralized lifecycle management for any entity in the system.

Supports:
- Flexible state definitions per entity type
- Configurable state transitions (valid next states)
- Lifecycle hooks (on_enter, on_exit callbacks)
- Batch operations
- Lifecycle history tracking
- Custom metadata per state

Usage:
    # Register an entity type
    LifecycleService.register("page_section", {
        "states": ["draft", "review", "published", "archived"],
        "transitions": {
            "draft": ["review", "published", "archived"],
            "review": ["draft", "published", "archived"],
            "published": ["draft", "archived"],
            "archived": ["draft"],
        },
        "default": "draft",
        "display": {
            "draft": {"label": "Draft", "color": "gray", "icon": "edit"},
            "review": {"label": "In Review", "color": "amber", "icon": "clock"},
            "published": {"label": "Published", "color": "green", "icon": "eye"},
            "archived": {"label": "Archived", "color": "red", "icon": "archive"},
        },
    })

    # Change lifecycle state
    result, err = LifecycleService.transition(
        entity_type="page_section",
        entity_id=1,
        to_status="published",
        user_id=current_user_id,
        reason="Ready for production"
    )

    # Query
    published, err = LifecycleService.get_by_status("page_section", "published")
"""

from src.api.models import db
from src.api.utils.logger import get_daily_logger
from datetime import datetime, timezone
import json

log = get_daily_logger()


# ─── Lifecycle Transition History Model ───────────────────
class LifecycleTransition(db.Model):
    __tablename__ = "lifecycle_transitions"

    id = db.Column(db.Integer, primary_key=True)
    entity_type = db.Column(db.String(100), nullable=False, index=True)
    entity_id = db.Column(db.Integer, nullable=False, index=True)
    from_status = db.Column(db.String(50), nullable=True)
    to_status = db.Column(db.String(50), nullable=False)
    reason = db.Column(db.Text, nullable=True)
    metadata_json = db.Column(db.Text, nullable=True)
    changed_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    changed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    changer = db.relationship("User", foreign_keys=[changed_by])

    def to_dict(self):
        meta = None
        if self.metadata_json:
            try:
                meta = json.loads(self.metadata_json)
            except (json.JSONDecodeError, TypeError):
                meta = None
        return {
            "id": self.id,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "from_status": self.from_status,
            "to_status": self.to_status,
            "reason": self.reason,
            "metadata": meta,
            "changed_by": self.changed_by,
            "changed_by_user": self.changer.username if self.changer else None,
            "changed_at": self.changed_at.isoformat() if self.changed_at else None,
        }


# ─── Callback types ───────────────────────────────────────
# on_enter(status, entity, user_id, context) -> (entity, error_or_none)
# on_exit(status, entity, user_id, context) -> (entity, error_or_none)
# on_transition(entity_type, entity_id, from, to, user_id, context) -> None
# validate_transition(entity, from_status, to_status, user_id, context) -> (bool, error_or_none)


class LifecycleService:
    """
    Global lifecycle management service.

    Registry holds configuration for each entity type.
    Adapters provide custom hooks per entity.
    """

    _registry = {}  # entity_type -> config
    _adapters = {}  # entity_type -> adapter instance

    # ─── Registration ─────────────────────────────────────

    @classmethod
    def register(cls, entity_type, config):
        """
        Register an entity type with its lifecycle configuration.

        config = {
            "states": ["draft", "published", ...],
            "transitions": {"draft": ["published"], ...},
            "default": "draft",
            "display": {"draft": {"label": "...", "color": "..."}, ...},
            "model_class": PageSection,      # optional
            "status_field": "status",         # optional, default "status"
            "visibility_field": "is_visible", # optional
            "adapter": MyAdapter(),           # optional
        }
        """
        cls._registry[entity_type] = config

        if "adapter" in config:
            cls._adapters[entity_type] = config["adapter"]

        log.info(
            f"LifecycleService.register | type={entity_type} | states={config.get('states')}"
        )

    @classmethod
    def is_registered(cls, entity_type):
        return entity_type in cls._registry

    @classmethod
    def get_config(cls, entity_type):
        return cls._registry.get(entity_type)

    @classmethod
    def get_registered_types(cls):
        return list(cls._registry.keys())

    # ─── State Queries ────────────────────────────────────

    @classmethod
    def get_states(cls, entity_type):
        """Get all available states for an entity type."""
        config = cls._registry.get(entity_type)
        if not config:
            return None, f"Entity type '{entity_type}' not registered"
        return config.get("states", []), None

    @classmethod
    def get_valid_transitions(cls, entity_type, current_status):
        """Get valid next states from current status."""
        config = cls._registry.get(entity_type)
        if not config:
            return None, f"Entity type '{entity_type}' not registered"
        transitions = config.get("transitions", {})
        return transitions.get(current_status, []), None

    @classmethod
    def can_transition(cls, entity_type, from_status, to_status):
        """Check if a transition is valid."""
        valid, err = cls.get_valid_transitions(entity_type, from_status)
        if err:
            return False, err
        return to_status in valid, None

    @classmethod
    def get_display_info(cls, entity_type, status):
        """Get display metadata for a status."""
        config = cls._registry.get(entity_type)
        if not config:
            return None, f"Entity type '{entity_type}' not registered"
        display = config.get("display", {})
        return display.get(status, {"label": status, "color": "gray"}), None

    @classmethod
    def get_all_display_info(cls, entity_type):
        """Get display metadata for all statuses of an entity type."""
        config = cls._registry.get(entity_type)
        if not config:
            return None, f"Entity type '{entity_type}' not registered"
        return config.get("display", {}), None

    # ─── Core Transition ──────────────────────────────────

    @classmethod
    def transition(
        cls,
        entity_type,
        entity_id,
        to_status,
        user_id=None,
        reason=None,
        metadata=None,
        skip_validation=False,
    ):
        """
        Transition an entity to a new lifecycle state.

        Steps:
        1. Validate entity type is registered
        2. Load entity from database
        3. Check transition validity
        4. Call on_exit hook (if adapter exists)
        5. Update status field
        6. Call on_enter hook (if adapter exists)
        7. Record history
        8. Call on_transition hook

        Returns (entity, error_or_none)
        """
        config = cls._registry.get(entity_type)
        if not config:
            return None, f"Entity type '{entity_type}' not registered"

        model_class = config.get("model_class")
        if not model_class:
            return None, f"No model_class configured for '{entity_type}'"

        status_field = config.get("status_field", "status")

        # Load entity
        entity = model_class.query.get(entity_id)
        if not entity:
            return None, f"{entity_type} #{entity_id} not found"

        current_status = getattr(entity, status_field, None)

        # Validate transition
        if not skip_validation and current_status != to_status:
            ok, err = cls.can_transition(entity_type, current_status, to_status)
            if not ok:
                return (
                    None,
                    err
                    or f"Cannot transition from '{current_status}' to '{to_status}'",
                )

        # Get adapter
        adapter = cls._adapters.get(entity_type)

        # Validate with adapter
        if adapter and hasattr(adapter, "validate_transition"):
            ok, err = adapter.validate_transition(
                entity, current_status, to_status, user_id, metadata or {}
            )
            if not ok:
                return None, err or "Transition validation failed"

        # on_exit hook
        if adapter and hasattr(adapter, "on_exit"):
            entity, err = adapter.on_exit(
                current_status, entity, user_id, metadata or {}
            )
            if err:
                return None, err

        # Update status
        old_status = current_status
        setattr(entity, status_field, to_status)

        # Handle visibility field (auto-show/hide)
        vis_field = config.get("visibility_field")
        if vis_field:
            visible_states = config.get("visible_when_published", [])
            if visible_states:
                setattr(entity, vis_field, to_status in visible_states)

        db.session.commit()

        # on_enter hook
        if adapter and hasattr(adapter, "on_enter"):
            entity, err = adapter.on_enter(to_status, entity, user_id, metadata or {})
            if err:
                return None, err

        # Record history
        cls._record_history(
            entity_type, entity_id, old_status, to_status, user_id, reason, metadata
        )

        # on_transition hook
        if adapter and hasattr(adapter, "on_transition"):
            adapter.on_transition(
                entity_type, entity_id, old_status, to_status, user_id, metadata or {}
            )

        log.info(
            f"LifecycleService.transition | {entity_type}#{entity_id} | {old_status} → {to_status} | by={user_id}"
        )
        return entity, None

    # ─── Batch Operations ─────────────────────────────────

    @classmethod
    def batch_transition(
        cls,
        entity_type,
        entity_ids,
        to_status,
        user_id=None,
        reason=None,
        metadata=None,
    ):
        """Transition multiple entities at once."""
        results = {"success": [], "failed": []}

        for eid in entity_ids:
            entity, err = cls.transition(
                entity_type, eid, to_status, user_id, reason, metadata
            )
            if err:
                results["failed"].append({"id": eid, "error": err})
            else:
                results["success"].append(eid)

        log.info(
            f"LifecycleService.batch_transition | {entity_type} | {to_status} | "
            f"ok={len(results['success'])} fail={len(results['failed'])}"
        )
        return results, None

    @classmethod
    def batch_get_by_status(cls, entity_type, status):
        """Get all entities of a type with a specific status."""
        config = cls._registry.get(entity_type)
        if not config:
            return None, f"Entity type '{entity_type}' not registered"

        model_class = config.get("model_class")
        status_field = config.get("status_field", "status")

        entities = model_class.query.filter(
            getattr(model_class, status_field) == status
        ).all()
        return entities, None

    # ─── Status Overview ──────────────────────────────────

    @classmethod
    def get_overview(cls, entity_type):
        """Get lifecycle counts for an entity type."""
        config = cls._registry.get(entity_type)
        if not config:
            return None, f"Entity type '{entity_type}' not registered"

        model_class = config.get("model_class")
        status_field = config.get("status_field", "status")
        states = config.get("states", [])

        counts = {}
        for state in states:
            count = model_class.query.filter(
                getattr(model_class, status_field) == state
            ).count()
            counts[state] = count

        total = sum(counts.values())
        display = config.get("display", {})

        return {
            "entity_type": entity_type,
            "total": total,
            "counts": counts,
            "display": display,
            "states": states,
        }, None

    # ─── History ──────────────────────────────────────────

    @classmethod
    def get_history(cls, entity_type, entity_id, limit=50):
        """Get lifecycle transition history for an entity."""
        history = (
            LifecycleTransition.query.filter_by(
                entity_type=entity_type, entity_id=entity_id
            )
            .order_by(LifecycleTransition.changed_at.desc())
            .limit(limit)
            .all()
        )
        return [h.to_dict() for h in history], None

    @classmethod
    def get_recent_transitions(cls, entity_type=None, limit=50):
        """Get recent lifecycle transitions, optionally filtered by entity type."""
        query = LifecycleTransition.query
        if entity_type:
            query = query.filter_by(entity_type=entity_type)
        history = (
            query.order_by(LifecycleTransition.changed_at.desc()).limit(limit).all()
        )
        return [h.to_dict() for h in history], None

    # ─── Helpers ──────────────────────────────────────────

    @classmethod
    def _record_history(
        cls, entity_type, entity_id, from_status, to_status, user_id, reason, metadata
    ):
        """Record a lifecycle transition in history."""
        record = LifecycleTransition(
            entity_type=entity_type,
            entity_id=entity_id,
            from_status=from_status,
            to_status=to_status,
            reason=reason,
            metadata_json=json.dumps(metadata) if metadata else None,
            changed_by=user_id,
        )
        db.session.add(record)
        db.session.commit()

    @classmethod
    def get_entity_status_info(cls, entity_type, entity_id):
        """Get current lifecycle info for a specific entity."""
        config = cls._registry.get(entity_type)
        if not config:
            return None, f"Entity type '{entity_type}' not registered"

        model_class = config.get("model_class")
        status_field = config.get("status_field", "status")

        entity = model_class.query.get(entity_id)
        if not entity:
            return None, f"{entity_type} #{entity_id} not found"

        current_status = getattr(entity, status_field)
        valid_next, _ = cls.get_valid_transitions(entity_type, current_status)
        display, _ = cls.get_display_info(entity_type, current_status)

        return {
            "entity_type": entity_type,
            "entity_id": entity_id,
            "current_status": current_status,
            "valid_transitions": valid_next or [],
            "display": display,
        }, None
