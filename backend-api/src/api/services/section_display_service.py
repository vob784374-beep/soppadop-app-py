from src.api.models import db, PageSection
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()


class SectionDisplayService:
    """
    Service for managing section display/visibility on pages.
    Controls which sections are shown to visitors and their display state.

    Visibility rules:
    - is_visible=True + status="published" → shown on public page
    - is_visible=False or status="draft" → hidden from public page
    - Admin can see all regardless of visibility

    Template grouping:
    - Sections from the same page template share template_group
    - group_order preserves section position within the template
    - sort_order is the global display order across all sections
    """

    @staticmethod
    def get_displayed_sections():
        """Get all sections that should be shown on public page, grouped by template."""
        sections = (
            PageSection.query.filter_by(is_visible=True, status="published")
            .order_by(
                PageSection.sort_order.asc(),
                PageSection.group_order.asc(),
                PageSection.id.asc(),
            )
            .all()
        )
        return SectionDisplayService._group_sections(sections)

    @staticmethod
    def get_all_with_display_state():
        """Get all sections with their display state for admin view, grouped by template."""
        sections = PageSection.query.order_by(
            PageSection.sort_order.asc(),
            PageSection.group_order.asc(),
            PageSection.id.asc(),
        ).all()
        return SectionDisplayService._group_sections(sections)

    @staticmethod
    def _group_sections(sections):
        """
        Group sections by template_group.
        Returns list of groups, each with sections in correct order.
        """
        groups = []
        seen_groups = set()

        for section in sections:
            group_key = section.template_group or f"single:{section.id}"

            if group_key not in seen_groups:
                seen_groups.add(group_key)
                group_sections = [
                    s
                    for s in sections
                    if (s.template_group or f"single:{s.id}") == group_key
                ]
                # Sort by group_order within the group
                group_sections.sort(key=lambda s: s.group_order)

                groups.append(
                    {
                        "group": section.template_group,
                        "is_template": section.template_group is not None
                        and not section.template_group.startswith("section:"),
                        "sort_order": section.sort_order,
                        "sections": [s.to_dict_admin() for s in group_sections],
                    }
                )

        return groups

    # ─── Single Section Toggle ───────────────────────────

    @staticmethod
    def show(section_id):
        """Make a section visible."""
        section = db.session.get(PageSection, section_id)
        if not section:
            return None, "Section not found"

        section.is_visible = True
        db.session.commit()
        log.info(f"SectionDisplayService.show | id={section_id}")
        return section, None

    @staticmethod
    def hide(section_id):
        """Hide a section from display."""
        section = db.session.get(PageSection, section_id)
        if not section:
            return None, "Section not found"

        section.is_visible = False
        db.session.commit()
        log.info(f"SectionDisplayService.hide | id={section_id}")
        return section, None

    @staticmethod
    def toggle(section_id):
        """Toggle section visibility."""
        section = db.session.get(PageSection, section_id)
        if not section:
            return None, "Section not found"

        section.is_visible = not section.is_visible
        db.session.commit()
        log.info(
            f"SectionDisplayService.toggle | id={section_id} | visible={section.is_visible}"
        )
        return section, None

    @staticmethod
    def publish(section_id):
        """Publish a section (make it live)."""
        section = db.session.get(PageSection, section_id)
        if not section:
            return None, "Section not found"

        section.status = "published"
        db.session.commit()
        log.info(f"SectionDisplayService.publish | id={section_id}")
        return section, None

    @staticmethod
    def unpublish(section_id):
        """Unpublish a section (set to draft)."""
        section = db.session.get(PageSection, section_id)
        if not section:
            return None, "Section not found"

        section.status = "draft"
        db.session.commit()
        log.info(f"SectionDisplayService.unpublish | id={section_id}")
        return section, None

    # ─── Template Group Operations ───────────────────────

    @staticmethod
    def get_groups():
        """Get all template groups with their sections."""
        all_sections = PageSection.query.order_by(
            PageSection.sort_order.asc(),
            PageSection.group_order.asc(),
            PageSection.id.asc(),
        ).all()
        return SectionDisplayService._group_sections(all_sections)

    @staticmethod
    def show_group(template_group):
        """Show all sections in a template group."""
        count = PageSection.query.filter_by(template_group=template_group).update(
            {"is_visible": True}
        )
        db.session.commit()
        log.info(
            f"SectionDisplayService.show_group | group={template_group} | count={count}"
        )
        return count, None

    @staticmethod
    def hide_group(template_group):
        """Hide all sections in a template group."""
        count = PageSection.query.filter_by(template_group=template_group).update(
            {"is_visible": False}
        )
        db.session.commit()
        log.info(
            f"SectionDisplayService.hide_group | group={template_group} | count={count}"
        )
        return count, None

    @staticmethod
    def toggle_group(template_group):
        """Toggle visibility of all sections in a template group."""
        sections = PageSection.query.filter_by(template_group=template_group).all()
        if not sections:
            return 0, "No sections found in group"

        # If any is visible, hide all; otherwise show all
        any_visible = any(s.is_visible for s in sections)
        new_state = not any_visible

        for section in sections:
            section.is_visible = new_state

        db.session.commit()
        action = "shown" if new_state else "hidden"
        log.info(
            f"SectionDisplayService.toggle_group | group={template_group} | action={action} | count={len(sections)}"
        )
        return len(sections), None

    @staticmethod
    def publish_group(template_group):
        """Publish all sections in a template group."""
        count = PageSection.query.filter_by(template_group=template_group).update(
            {"status": "published"}
        )
        db.session.commit()
        log.info(
            f"SectionDisplayService.publish_group | group={template_group} | count={count}"
        )
        return count, None

    @staticmethod
    def unpublish_group(template_group):
        """Unpublish all sections in a template group."""
        count = PageSection.query.filter_by(template_group=template_group).update(
            {"status": "draft"}
        )
        db.session.commit()
        log.info(
            f"SectionDisplayService.unpublish_group | group={template_group} | count={count}"
        )
        return count, None

    @staticmethod
    def delete_group(template_group):
        """Delete all sections in a template group."""
        from src.api.repositories.page_section_repository import (
            SectionContentRepository,
            PageSectionRepository,
        )

        sections = PageSection.query.filter_by(template_group=template_group).all()
        count = 0
        for section in sections:
            SectionContentRepository.delete_by_section(section.id)
            PageSectionRepository.delete(section)
            count += 1

        db.session.commit()
        log.info(
            f"SectionDisplayService.delete_group | group={template_group} | count={count}"
        )
        return count, None

    # ─── Batch Operations ────────────────────────────────

    @staticmethod
    def show_many(section_ids):
        """Show multiple sections at once."""
        count = 0
        for sid in section_ids:
            section = db.session.get(PageSection, sid)
            if section:
                section.is_visible = True
                count += 1

        db.session.commit()
        log.info(f"SectionDisplayService.show_many | count={count}")
        return count, None

    @staticmethod
    def hide_many(section_ids):
        """Hide multiple sections at once."""
        count = 0
        for sid in section_ids:
            section = db.session.get(PageSection, sid)
            if section:
                section.is_visible = False
                count += 1

        db.session.commit()
        log.info(f"SectionDisplayService.hide_many | count={count}")
        return count, None

    @staticmethod
    def publish_many(section_ids):
        """Publish multiple sections at once."""
        count = 0
        for sid in section_ids:
            section = db.session.get(PageSection, sid)
            if section:
                section.status = "published"
                count += 1

        db.session.commit()
        log.info(f"SectionDisplayService.publish_many | count={count}")
        return count, None

    @staticmethod
    def unpublish_many(section_ids):
        """Unpublish multiple sections at once."""
        count = 0
        for sid in section_ids:
            section = db.session.get(PageSection, sid)
            if section:
                section.status = "draft"
                count += 1

        db.session.commit()
        log.info(f"SectionDisplayService.unpublish_many | count={count}")
        return count, None

    @staticmethod
    def set_display(section_id, is_visible=None, status=None):
        """
        Set display state of a section.

        Args:
            section_id: Section ID
            is_visible: True/False to show/hide (None = no change)
            status: "published"/"draft" (None = no change)
        """
        section = db.session.get(PageSection, section_id)
        if not section:
            return None, "Section not found"

        if is_visible is not None:
            section.is_visible = is_visible
        if status is not None:
            section.status = status

        db.session.commit()
        log.info(
            f"SectionDisplayService.set_display | id={section_id} | visible={section.is_visible} | status={section.status}"
        )
        return section, None

    @staticmethod
    def set_many_display(display_configs):
        """
        Set display state for multiple sections.

        Args:
            display_configs: list of {"id": int, "is_visible": bool?, "status": str?}
        """
        count = 0
        for config in display_configs:
            section = db.session.get(PageSection, config["id"])
            if section:
                if "is_visible" in config:
                    section.is_visible = config["is_visible"]
                if "status" in config:
                    section.status = config["status"]
                count += 1

        db.session.commit()
        log.info(f"SectionDisplayService.set_many_display | count={count}")
        return count, None

    # ─── Display Info ────────────────────────────────────

    @staticmethod
    def get_display_summary():
        """Get summary of section display states with group info."""
        all_sections = PageSection.query.all()

        total = len(all_sections)
        visible = sum(1 for s in all_sections if s.is_visible)
        hidden = total - visible
        published = sum(1 for s in all_sections if s.status == "published")
        draft = total - published
        displayed = sum(
            1 for s in all_sections if s.is_visible and s.status == "published"
        )

        # Group stats
        groups = {}
        for s in all_sections:
            g = s.template_group or "ungrouped"
            if g not in groups:
                groups[g] = {"total": 0, "visible": 0, "published": 0, "displayed": 0}
            groups[g]["total"] += 1
            if s.is_visible:
                groups[g]["visible"] += 1
            if s.status == "published":
                groups[g]["published"] += 1
            if s.is_visible and s.status == "published":
                groups[g]["displayed"] += 1

        return {
            "total": total,
            "visible": visible,
            "hidden": hidden,
            "published": published,
            "draft": draft,
            "displayed": displayed,
            "groups": groups,
        }

    @staticmethod
    def get_overview():
        """Get tab-based overview for admin dashboard.

        Returns sections organized into tabs:
        - published: All sections with status="published"
        - draft: All sections with status="draft"
        - all: All sections

        Each tab includes full section info and group context.
        """
        all_sections = PageSection.query.order_by(
            PageSection.sort_order.asc(),
            PageSection.group_order.asc(),
            PageSection.id.asc(),
        ).all()

        published_sections = [s for s in all_sections if s.status == "published"]
        draft_sections = [s for s in all_sections if s.status == "draft"]

        return {
            "tabs": {
                "published": {
                    "label": "Published",
                    "count": len(published_sections),
                    "sections": [s.to_dict_admin() for s in published_sections],
                },
                "draft": {
                    "label": "Draft",
                    "count": len(draft_sections),
                    "sections": [s.to_dict_admin() for s in draft_sections],
                },
                "all": {
                    "label": "All Sections",
                    "count": len(all_sections),
                    "sections": [s.to_dict_admin() for s in all_sections],
                },
            },
            "summary": {
                "total": len(all_sections),
                "published": len(published_sections),
                "draft": len(draft_sections),
                "visible": sum(1 for s in all_sections if s.is_visible),
                "hidden": sum(1 for s in all_sections if not s.is_visible),
                "displayed": sum(
                    1 for s in all_sections if s.is_visible and s.status == "published"
                ),
            },
        }

    @staticmethod
    def get_sections_by_status(status):
        """Get sections filtered by publish status (published/draft)."""
        if status not in ("published", "draft"):
            return None, "Status must be 'published' or 'draft'"

        sections = (
            PageSection.query.filter_by(status=status)
            .order_by(
                PageSection.sort_order.asc(),
                PageSection.group_order.asc(),
                PageSection.id.asc(),
            )
            .all()
        )

        return {
            "status": status,
            "count": len(sections),
            "sections": [s.to_dict_admin() for s in sections],
        }, None

    @staticmethod
    def get_groups_with_status():
        """Get all template groups with their publish/visibility status.

        Returns groups organized for easy management:
        - Each group shows count of published/draft/visible/hidden sections
        - Groups are sorted by name
        - Includes overall status indicator
        """
        all_sections = PageSection.query.order_by(
            PageSection.template_group.asc(),
            PageSection.group_order.asc(),
            PageSection.id.asc(),
        ).all()

        groups_map = {}
        for s in all_sections:
            g = s.template_group or "__ungrouped__"
            if g not in groups_map:
                groups_map[g] = {
                    "name": s.template_group,
                    "is_template": s.template_group is not None
                    and not s.template_group.startswith("section:")
                    and s.template_group != "__ungrouped__",
                    "sections": [],
                }
            groups_map[g]["sections"].append(s)

        result = []
        for g_key, g_data in groups_map.items():
            secs = g_data["sections"]
            total = len(secs)
            published = sum(1 for s in secs if s.status == "published")
            draft = total - published
            visible = sum(1 for s in secs if s.is_visible)
            displayed = sum(1 for s in secs if s.is_visible and s.status == "published")

            if published == total:
                overall_status = "published"
            elif draft == total:
                overall_status = "draft"
            else:
                overall_status = "mixed"

            result.append(
                {
                    "group": g_data["name"],
                    "is_template": g_data["is_template"],
                    "total": total,
                    "published": published,
                    "draft": draft,
                    "visible": visible,
                    "hidden": total - visible,
                    "displayed": displayed,
                    "overall_status": overall_status,
                    "sections": [s.to_dict_admin() for s in secs],
                }
            )

        # Sort: templates first, then ungrouped, then by name
        result.sort(
            key=lambda g: (
                0 if g["is_template"] else (1 if g["group"] is not None else 2),
                g["group"] or "",
            )
        )

        return result

    @staticmethod
    def show_all():
        """Show all sections."""
        count = PageSection.query.update({"is_visible": True})
        db.session.commit()
        log.info(f"SectionDisplayService.show_all | count={count}")
        return count, None

    @staticmethod
    def hide_all():
        """Hide all sections."""
        count = PageSection.query.update({"is_visible": False})
        db.session.commit()
        log.info(f"SectionDisplayService.hide_all | count={count}")
        return count, None
