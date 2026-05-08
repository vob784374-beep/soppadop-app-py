from flask import Blueprint, request, g
from src.api.services.page_section_service import (
    PageSectionService,
    SectionContentService,
    TemplateService,
)
from src.api.services.section_display_service import SectionDisplayService
from src.api.services.lifecycle_service import LifecycleService
from src.api.utils.decorators import auth_required
from src.api.utils.response import success, error
from src.api.utils.request import get_json_body
from src.api.utils.request_query import get_query_params
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()

public_page_bp = Blueprint("public_page", __name__, url_prefix="/api/public-page")
admin_page_bp = Blueprint("admin_page", __name__, url_prefix="/api/admin/page")


# ═══════════════════════════════════════════════════
#  PUBLIC API — no auth required
# ═══════════════════════════════════════════════════


@public_page_bp.route("", methods=["GET"])
def get_public_page():
    groups = SectionDisplayService.get_displayed_sections()
    return success({"groups": groups})


@public_page_bp.route("/sections/<int:section_id>", methods=["GET"])
def get_public_section(section_id):
    section, err = PageSectionService.get_by_id(section_id)
    if err:
        return error(err, 404)
    if not section.is_visible:
        return error("Section not found", 404)

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    result, err = SectionContentService.get_by_section(
        section_id, page=page, per_page=per_page
    )
    if err:
        return error(err, 404)
    return success(result)


@public_page_bp.route("/layouts", methods=["GET"])
def get_public_layouts():
    data, err = TemplateService.get_all_layouts()
    if err:
        return error(err, 500)
    return success({"layouts": data})


@public_page_bp.route("/templates", methods=["GET"])
def get_public_templates():
    data, err = TemplateService.get_all_templates()
    if err:
        return error(err, 500)
    return success(data)


# ═══════════════════════════════════════════════════
#  ADMIN API — auth required
# ═══════════════════════════════════════════════════


def _uid():
    return g.current_user.id


# ───────────────── Sections CRUD ─────────────────


@admin_page_bp.route("/sections", methods=["GET"])
@auth_required
def list_sections():
    params = get_query_params(
        default_sort=[
            {"field": "sort_order", "direction": "asc"},
            {"field": "id", "direction": "desc"},
        ],
        searchable_fields=["title", "description"],
        filterable_fields=["section_type", "status", "is_visible"],
    )

    result, err = PageSectionService.get_list(
        page=params["page"],
        per_page=params["per_page"],
        filters=params["filters"],
        search=params["search"],
        sorts=params["sorts"],
    )
    if err:
        return error(err, 500)
    return success(result)


@admin_page_bp.route("/sections/<int:section_id>", methods=["GET"])
@auth_required
def get_section(section_id):
    section, err = PageSectionService.get_by_id(section_id)
    if err:
        return error(err, 404)
    return success({"section": section.to_dict_admin()})


@admin_page_bp.route("/sections", methods=["POST"])
@auth_required
def create_section():
    data, err = get_json_body()
    if err:
        return error(err, 400)

    title = data.get("title")
    if not title:
        return error("title is required", 400)

    section, err = PageSectionService.create(
        user_id=_uid(),
        title=title,
        section_type=data.get("section_type", "general"),
        description=data.get("description"),
        cover_image=data.get("cover_image"),
        sort_order=data.get("sort_order"),
        is_visible=data.get("is_visible"),
        status=data.get("status", "draft"),
        layout=data.get("layout"),
        max_items=data.get("max_items"),
        background_color=data.get("background_color"),
    )
    if err:
        return error(err, 400)
    return success({"section": section.to_dict_admin()}, "Section created", 201)


@admin_page_bp.route("/sections/<int:section_id>", methods=["PATCH"])
@auth_required
def update_section(section_id):
    data, err = get_json_body()
    if err:
        return error(err, 400)

    section, err = PageSectionService.update(
        section_id,
        user_id=_uid(),
        title=data.get("title"),
        section_type=data.get("section_type"),
        description=data.get("description"),
        cover_image=data.get("cover_image"),
        sort_order=data.get("sort_order"),
        is_visible=data.get("is_visible"),
        status=data.get("status"),
        layout=data.get("layout"),
        max_items=data.get("max_items"),
        background_color=data.get("background_color"),
        section_effects=data.get("section_effects"),
    )
    if err:
        return error(err, 404)
    return success({"section": section.to_dict_admin()}, "Section updated")


@admin_page_bp.route("/sections/<int:section_id>", methods=["DELETE"])
@auth_required
def delete_section(section_id):
    ok, err = PageSectionService.delete(section_id, user_id=_uid())
    if err:
        return error(err, 404)
    return success(message="Section deleted")


@admin_page_bp.route("/sections/reorder", methods=["POST"])
@auth_required
def reorder_sections():
    data, err = get_json_body()
    if err:
        return error(err, 400)

    orders = data.get("orders", [])
    if not orders:
        return error("orders is required", 400)

    ok, err = PageSectionService.reorder(orders, user_id=_uid())
    if err:
        return error(err, 500)
    return success(message="Sections reordered")


# ───────────────── Display Management ─────────────────


@admin_page_bp.route("/sections/display/summary", methods=["GET"])
@auth_required
def display_summary():
    summary = SectionDisplayService.get_display_summary()
    return success(summary)


@admin_page_bp.route("/sections/overview", methods=["GET"])
@auth_required
def sections_overview():
    """Tab-based overview: published / draft / all sections with counts."""
    data = SectionDisplayService.get_overview()
    return success(data)


@admin_page_bp.route("/sections/by-status/<status>", methods=["GET"])
@auth_required
def sections_by_status(status):
    """List sections filtered by status: published or draft."""
    data, err = SectionDisplayService.get_sections_by_status(status)
    if err:
        return error(err, 400)
    return success(data)


@admin_page_bp.route("/sections/<int:section_id>/show", methods=["POST"])
@auth_required
def show_section(section_id):
    section, err = SectionDisplayService.show(section_id)
    if err:
        return error(err, 404)
    return success({"section": section.to_dict_admin()}, "Section shown")


@admin_page_bp.route("/sections/<int:section_id>/hide", methods=["POST"])
@auth_required
def hide_section(section_id):
    section, err = SectionDisplayService.hide(section_id)
    if err:
        return error(err, 404)
    return success({"section": section.to_dict_admin()}, "Section hidden")


@admin_page_bp.route("/sections/<int:section_id>/toggle", methods=["POST"])
@auth_required
def toggle_section(section_id):
    section, err = SectionDisplayService.toggle(section_id)
    if err:
        return error(err, 404)
    action = "shown" if section.is_visible else "hidden"
    return success({"section": section.to_dict_admin()}, f"Section {action}")


@admin_page_bp.route("/sections/<int:section_id>/publish", methods=["POST"])
@auth_required
def publish_section(section_id):
    section, err = LifecycleService.transition(
        "page_section", section_id, "published", user_id=_uid()
    )
    if err:
        return error(err, 400)
    return success({"section": section.to_dict_admin()}, "Section published")


@admin_page_bp.route("/sections/<int:section_id>/unpublish", methods=["POST"])
@auth_required
def unpublish_section(section_id):
    section, err = LifecycleService.transition(
        "page_section", section_id, "draft", user_id=_uid()
    )
    if err:
        return error(err, 400)
    return success({"section": section.to_dict_admin()}, "Section unpublished")


@admin_page_bp.route("/sections/display/batch", methods=["POST"])
@auth_required
def batch_display():
    data, err = get_json_body()
    if err:
        return error(err, 400)

    action = data.get("action")
    section_ids = data.get("section_ids", [])

    if not action or not section_ids:
        return error("action and section_ids required", 400)

    if action == "show":
        count, err = SectionDisplayService.show_many(section_ids)
    elif action == "hide":
        count, err = SectionDisplayService.hide_many(section_ids)
    elif action == "publish":
        result, err = LifecycleService.batch_transition(
            "page_section", section_ids, "published", user_id=_uid()
        )
        count = len(result["success"]) if result else 0
    elif action == "unpublish":
        result, err = LifecycleService.batch_transition(
            "page_section", section_ids, "draft", user_id=_uid()
        )
        count = len(result["success"]) if result else 0
    elif action == "set":
        configs = data.get("configs", [])
        count, err = SectionDisplayService.set_many_display(configs)
    else:
        return error(f"Unknown action: {action}", 400)

    if err:
        return error(err, 500)
    return success({"count": count}, f"Updated {count} sections")


@admin_page_bp.route("/sections/show-all", methods=["POST"])
@auth_required
def show_all_sections():
    count, err = SectionDisplayService.show_all()
    if err:
        return error(err, 500)
    return success(message=f"All {count} sections shown")


@admin_page_bp.route("/sections/hide-all", methods=["POST"])
@auth_required
def hide_all_sections():
    count, err = SectionDisplayService.hide_all()
    if err:
        return error(err, 500)
    return success(message=f"All {count} sections hidden")


# ───────────────── Group Operations ─────────────────


@admin_page_bp.route("/sections/groups", methods=["GET"])
@auth_required
def list_groups():
    groups = SectionDisplayService.get_groups_with_status()
    return success({"groups": groups, "total": len(groups)})


@admin_page_bp.route("/sections/groups/<group_name>/show", methods=["POST"])
@auth_required
def show_group(group_name):
    count, err = SectionDisplayService.show_group(group_name)
    if err:
        return error(err, 500)
    return success({"count": count}, f"Group shown: {count} sections")


@admin_page_bp.route("/sections/groups/<group_name>/hide", methods=["POST"])
@auth_required
def hide_group(group_name):
    count, err = SectionDisplayService.hide_group(group_name)
    if err:
        return error(err, 500)
    return success({"count": count}, f"Group hidden: {count} sections")


@admin_page_bp.route("/sections/groups/<group_name>/toggle", methods=["POST"])
@auth_required
def toggle_group(group_name):
    count, err = SectionDisplayService.toggle_group(group_name)
    if err:
        return error(err, 500)
    return success({"count": count}, f"Group toggled: {count} sections")


@admin_page_bp.route("/sections/groups/<group_name>/publish", methods=["POST"])
@auth_required
def publish_group(group_name):
    count, err = SectionDisplayService.publish_group(group_name)
    if err:
        return error(err, 500)
    return success({"count": count}, f"Group published: {count} sections")


@admin_page_bp.route("/sections/groups/<group_name>/unpublish", methods=["POST"])
@auth_required
def unpublish_group(group_name):
    count, err = SectionDisplayService.unpublish_group(group_name)
    if err:
        return error(err, 500)
    return success({"count": count}, f"Group unpublished: {count} sections")


@admin_page_bp.route("/sections/groups/<group_name>", methods=["DELETE"])
@auth_required
def delete_group(group_name):
    count, err = SectionDisplayService.delete_group(group_name)
    if err:
        return error(err, 500)
    return success({"count": count}, f"Group deleted: {count} sections")


# ───────────────── Content CRUD ─────────────────


@admin_page_bp.route("/sections/<int:section_id>/contents", methods=["GET"])
@auth_required
def list_contents(section_id):
    params = get_query_params(
        default_sort=[{"field": "sort_order", "direction": "asc"}],
        searchable_fields=["title", "subtitle", "body"],
        filterable_fields=["is_visible"],
    )

    result, err = SectionContentService.get_by_section(
        section_id,
        page=params["page"],
        per_page=params["per_page"],
        filters=params["filters"],
        search=params["search"],
        sorts=params["sorts"],
    )
    if err:
        return error(err, 404)
    return success(result)


@admin_page_bp.route("/contents", methods=["POST"])
@auth_required
def create_content():
    data, err = get_json_body()
    if err:
        return error(err, 400)

    section_id = data.get("section_id")
    if not section_id:
        return error("section_id is required", 400)

    content, err = SectionContentService.create(
        section_id=section_id,
        title=data.get("title"),
        subtitle=data.get("subtitle"),
        body=data.get("body"),
        image_url=data.get("image_url"),
        video_url=data.get("video_url"),
        link_url=data.get("link_url"),
        tags=data.get("tags"),
        author=data.get("author"),
        sort_order=data.get("sort_order"),
        is_visible=data.get("is_visible"),
        content_date=data.get("content_date"),
    )
    if err:
        return error(err, 400)
    return success({"content": content.to_dict()}, "Content created", 201)


@admin_page_bp.route("/contents/<int:content_id>", methods=["PATCH"])
@auth_required
def update_content(content_id):
    data, err = get_json_body()
    if err:
        return error(err, 400)

    content, err = SectionContentService.update(
        content_id,
        user_id=_uid(),
        title=data.get("title"),
        subtitle=data.get("subtitle"),
        body=data.get("body"),
        image_url=data.get("image_url"),
        video_url=data.get("video_url"),
        link_url=data.get("link_url"),
        tags=data.get("tags"),
        author=data.get("author"),
        sort_order=data.get("sort_order"),
        is_visible=data.get("is_visible"),
        content_date=data.get("content_date"),
    )
    if err:
        return error(err, 404)
    return success({"content": content.to_dict()}, "Content updated")


@admin_page_bp.route("/contents/<int:content_id>", methods=["DELETE"])
@auth_required
def delete_content(content_id):
    ok, err = SectionContentService.delete(content_id, user_id=_uid())
    if err:
        return error(err, 404)
    return success(message="Content deleted")


# ───────────────── Layouts ─────────────────


@admin_page_bp.route("/layouts", methods=["GET"])
@auth_required
def list_layouts():
    data, err = TemplateService.get_all_layouts()
    if err:
        return error(err, 500)
    return success({"layouts": data})


@admin_page_bp.route("/layouts/<layout_id>", methods=["GET"])
@auth_required
def get_layout(layout_id):
    layout, err = TemplateService.get_layout_by_id(layout_id)
    if err:
        return error(err, 404)
    return success({"layout": layout})


# ───────────────── Templates ─────────────────


@admin_page_bp.route("/templates", methods=["GET"])
@auth_required
def list_templates():
    data, err = TemplateService.get_all_templates()
    if err:
        return error(err, 500)
    return success(data)


@admin_page_bp.route("/templates/section/<template_id>/apply", methods=["POST"])
@auth_required
def apply_section_template(template_id):
    data = request.get_json(silent=True) or {}
    section_id = data.get("section_id")
    publish = data.get("publish", False)
    section, err = TemplateService.apply_section_template(
        template_id, section_id=section_id, user_id=_uid(), publish=publish
    )
    if err:
        return error(err, 400)
    return success(
        {
            "section": section.to_dict_admin(),
            "template_group": section.template_group,
        },
        f"Template applied: {len(section.contents.all())} items added",
        201,
    )


@admin_page_bp.route("/templates/page/<template_id>/apply", methods=["POST"])
@auth_required
def apply_page_template(template_id):
    data = request.get_json(silent=True) or {}
    publish = data.get("publish", False)
    sections, err = TemplateService.apply_page_template(
        template_id, user_id=_uid(), publish=publish
    )
    if err:
        return error(err, 400)
    total_contents = sum(s.contents.count() for s in sections)
    return success(
        {
            "template_group": template_id,
            "sections": [s.to_dict_admin() for s in sections],
        },
        f"Page template applied: {len(sections)} sections, {total_contents} items",
        201,
    )


# ───────────────── Template Group Management ─────────────────


@admin_page_bp.route("/templates/page/<template_id>/status", methods=["GET"])
@auth_required
def get_template_group_status(template_id):
    data, err = TemplateService.get_template_group_status(template_id)
    if err:
        return error(err, 404)
    return success(data)


@admin_page_bp.route("/templates/page/<template_id>/publish", methods=["POST"])
@auth_required
def publish_template_group(template_id):
    from src.api.models import PageSection

    sections = PageSection.query.filter_by(template_group=template_id).all()
    if not sections:
        return error("No sections found for this template group", 404)

    section_ids = [s.id for s in sections]
    result, err = LifecycleService.batch_transition(
        "page_section",
        section_ids,
        "published",
        user_id=_uid(),
        reason=f"Template group publish: {template_id}",
    )
    if err:
        return error(err, 400)
    count = len(result["success"])
    return success({"count": count}, f"Published all {count} sections in template")


@admin_page_bp.route("/templates/page/<template_id>/unpublish", methods=["POST"])
@auth_required
def unpublish_template_group(template_id):
    from src.api.models import PageSection

    sections = PageSection.query.filter_by(template_group=template_id).all()
    if not sections:
        return error("No sections found for this template group", 404)

    section_ids = [s.id for s in sections]
    result, err = LifecycleService.batch_transition(
        "page_section",
        section_ids,
        "draft",
        user_id=_uid(),
        reason=f"Template group unpublish: {template_id}",
    )
    if err:
        return error(err, 400)
    count = len(result["success"])
    return success({"count": count}, f"Unpublished all {count} sections in template")


@admin_page_bp.route("/templates/page/<template_id>/show", methods=["POST"])
@auth_required
def show_template_group(template_id):
    count, err = TemplateService.show_template_group(template_id, user_id=_uid())
    if err:
        return error(err, 404)
    return success({"count": count}, f"Shown all {count} sections in template")


@admin_page_bp.route("/templates/page/<template_id>/hide", methods=["POST"])
@auth_required
def hide_template_group(template_id):
    count, err = TemplateService.hide_template_group(template_id, user_id=_uid())
    if err:
        return error(err, 404)
    return success({"count": count}, f"Hidden all {count} sections in template")


@admin_page_bp.route("/templates/page/<template_id>", methods=["DELETE"])
@auth_required
def delete_template_group(template_id):
    count, err = TemplateService.delete_template_group(template_id, user_id=_uid())
    if err:
        return error(err, 404)
    return success({"count": count}, f"Deleted {count} sections in template")


@admin_page_bp.route("/templates/page/applied", methods=["GET"])
@auth_required
def get_applied_templates():
    """Get list of page template IDs that have already been applied."""
    applied = TemplateService.get_applied_template_groups()
    return success({"applied": applied})
