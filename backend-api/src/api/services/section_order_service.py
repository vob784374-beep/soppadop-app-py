from src.api.models import db, PageSection, SectionContent
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()


class SectionOrderService:
    """
    Service for managing section and content ordering.
    Handles sort_order assignment, reordering, and position management.
    """

    # ─── Section Ordering ────────────────────────────────

    @staticmethod
    def get_next_section_order():
        """Get the next available sort_order for sections."""
        max_order = db.session.query(db.func.max(PageSection.sort_order)).scalar() or 0
        return max_order + 1

    @staticmethod
    def get_all_ordered():
        """Get all sections ordered by sort_order."""
        return PageSection.query.order_by(
            PageSection.sort_order.asc(), PageSection.id.desc()
        ).all()

    @staticmethod
    def reorder(orders):
        """
        Reorder sections by explicit sort_order values.

        Args:
            orders: list of {"id": int, "sort_order": int}

        Returns:
            (True, None) on success, (None, error) on failure
        """
        if not orders:
            return None, "No orders provided"

        for item in orders:
            section = db.session.get(PageSection, item["id"])
            if section:
                section.sort_order = item["sort_order"]

        db.session.commit()
        log.info(f"SectionOrderService.reorder | count={len(orders)}")
        return True, None

    @staticmethod
    def normalize_orders():
        """
        Re-number all sections sequentially (0, 1, 2, ...) based on current order.
        Useful after deletions to clean up gaps.
        """
        sections = PageSection.query.order_by(
            PageSection.sort_order.asc(), PageSection.id.asc()
        ).all()
        for i, section in enumerate(sections):
            section.sort_order = i

        db.session.commit()
        log.info(f"SectionOrderService.normalize_orders | count={len(sections)}")
        return True, None

    @staticmethod
    def move_to_position(section_id, new_position):
        """
        Move a section to a specific position, shifting others as needed.

        Args:
            section_id: ID of section to move
            new_position: Target position (0-indexed)
        """
        section = db.session.get(PageSection, section_id)
        if not section:
            return None, "Section not found"

        sections = SectionOrderService.get_all_ordered()
        current_idx = next(
            (i for i, s in enumerate(sections) if s.id == section_id), None
        )

        if current_idx is None:
            return None, "Section not in ordered list"

        # Remove from current position
        sections.pop(current_idx)
        # Insert at new position
        sections.insert(new_position, section)

        # Reassign sort_order
        for i, s in enumerate(sections):
            s.sort_order = i

        db.session.commit()
        log.info(
            f"SectionOrderService.move_to_position | id={section_id} | from={current_idx} | to={new_position}"
        )
        return True, None

    @staticmethod
    def swap_positions(section_id_1, section_id_2):
        """Swap the sort_order of two sections."""
        s1 = db.session.get(PageSection, section_id_1)
        s2 = db.session.get(PageSection, section_id_2)

        if not s1 or not s2:
            return None, "One or both sections not found"

        s1.sort_order, s2.sort_order = s2.sort_order, s1.sort_order
        db.session.commit()
        log.info(
            f"SectionOrderService.swap_positions | {section_id_1} <-> {section_id_2}"
        )
        return True, None

    @staticmethod
    def insert_at_end(section_id):
        """Move a section to the end of the list."""
        max_order = SectionOrderService.get_next_section_order() - 1
        section = db.session.get(PageSection, section_id)
        if section:
            section.sort_order = max_order + 1
            db.session.commit()
            return True, None
        return None, "Section not found"

    @staticmethod
    def assign_sequential(section_ids):
        """
        Assign sequential sort_order to a list of section IDs.
        Used when creating sections from a page template.

        Args:
            section_ids: list of section IDs in desired order
        """
        start_order = SectionOrderService.get_next_section_order()
        for i, sid in enumerate(section_ids):
            section = db.session.get(PageSection, sid)
            if section:
                section.sort_order = start_order + i

        db.session.commit()
        log.info(
            f"SectionOrderService.assign_sequential | count={len(section_ids)} | start={start_order}"
        )
        return True, None

    @staticmethod
    def insert_sections_at_end(section_ids):
        """
        Insert sections at the end, maintaining their relative order.
        Used when applying page templates to keep section sequence intact.

        Args:
            section_ids: list of section IDs in template order
        """
        return SectionOrderService.assign_sequential(section_ids)

    # ─── Content Ordering (within a section) ─────────────

    @staticmethod
    def get_next_content_order(section_id):
        """Get the next available sort_order for content within a section."""
        max_order = (
            db.session.query(db.func.max(SectionContent.sort_order))
            .filter_by(section_id=section_id)
            .scalar()
            or 0
        )
        return max_order + 1

    @staticmethod
    def reorder_contents(section_id, orders):
        """
        Reorder contents within a section.

        Args:
            section_id: Parent section ID
            orders: list of {"id": int, "sort_order": int}
        """
        if not orders:
            return None, "No orders provided"

        for item in orders:
            content = db.session.get(SectionContent, item["id"])
            if content and content.section_id == section_id:
                content.sort_order = item["sort_order"]

        db.session.commit()
        log.info(
            f"SectionOrderService.reorder_contents | section={section_id} | count={len(orders)}"
        )
        return True, None

    @staticmethod
    def normalize_content_orders(section_id):
        """Re-number contents within a section sequentially."""
        contents = (
            SectionContent.query.filter_by(section_id=section_id)
            .order_by(SectionContent.sort_order.asc(), SectionContent.id.asc())
            .all()
        )
        for i, content in enumerate(contents):
            content.sort_order = i

        db.session.commit()
        return True, None
