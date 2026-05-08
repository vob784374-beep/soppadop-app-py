"""
PageSection Lifecycle Adapter
=============================
Custom lifecycle logic for PageSection entities.
"""

from src.api.services.lifecycle_adapter import BaseLifecycleAdapter
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()


class PageSectionLifecycleAdapter(BaseLifecycleAdapter):
    """
    Handles lifecycle for PageSection.

    States: draft → review → published → archived
    - draft: Work in progress, not visible
    - review: Ready for review, not visible
    - published: Live on public page, visible
    - archived: Removed from public, kept for reference
    """

    def validate_transition(self, entity, from_status, to_status, user_id, context):
        """Custom validation rules for PageSection."""

        # Can't publish a section without a title
        if to_status == "published" and not entity.title:
            return False, "Cannot publish section without a title"

        return True, None

    def on_enter(self, status, entity, user_id, context):
        """Side effects when entering a new status."""

        if status == "published":
            log.info(f"Section #{entity.id} published by user #{user_id}")

            # Auto-update visibility
            if not entity.is_visible:
                entity.is_visible = True
                from src.api.models import db

                db.session.commit()

        elif status == "archived":
            log.info(f"Section #{entity.id} archived by user #{user_id}")

            # Auto-hide archived sections
            if entity.is_visible:
                entity.is_visible = False
                from src.api.models import db

                db.session.commit()

        elif status == "draft":
            log.info(f"Section #{entity.id} moved to draft by user #{user_id}")

        return entity, None

    def on_exit(self, status, entity, user_id, context):
        """Cleanup when leaving a status."""
        return entity, None

    def on_transition(
        self, entity_type, entity_id, from_status, to_status, user_id, context
    ):
        """Post-transition hooks like cache invalidation."""
        log.debug(f"PageSection #{entity_id}: {from_status} → {to_status}")
