"""
Lifecycle Adapter Base
======================
Base class for entity-specific lifecycle logic.

Each entity type can implement an adapter to customize:
- What happens when entering a state
- What happens when exiting a state
- Custom validation rules
- Side effects on transition
"""


class BaseLifecycleAdapter:
    """
    Base adapter for entity-specific lifecycle logic.

    Subclass and override methods as needed.
    All methods are optional - override only what you need.
    """

    def validate_transition(self, entity, from_status, to_status, user_id, context):
        """
        Validate if a transition should be allowed.

        Returns (True, None) to allow, (False, "reason") to deny.
        """
        return True, None

    def on_exit(self, status, entity, user_id, context):
        """
        Called BEFORE status change.
        Use for cleanup or validation of old state.

        Returns (entity, None) on success, (None, "error") on failure.
        """
        return entity, None

    def on_enter(self, status, entity, user_id, context):
        """
        Called AFTER status change and commit.
        Use for side effects like notifications, indexing, etc.

        Returns (entity, None) on success, (None, "error") on failure.
        """
        return entity, None

    def on_transition(
        self, entity_type, entity_id, from_status, to_status, user_id, context
    ):
        """
        Called after successful transition + history recording.
        Use for logging, webhooks, cache invalidation, etc.

        No return value needed.
        """
        pass

    def get_public_payload(self, entity):
        """
        Return public-safe data for an entity.
        Override to customize what's exposed for public endpoints.
        """
        if hasattr(entity, "to_dict"):
            return entity.to_dict()
        return {}

    def get_admin_payload(self, entity):
        """
        Return admin data for an entity.
        Override to customize what's exposed for admin endpoints.
        """
        if hasattr(entity, "to_dict_admin"):
            return entity.to_dict_admin()
        return self.get_public_payload(entity)
