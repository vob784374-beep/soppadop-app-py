"""
Parses sort, filter, search params from Flask request args.

Query param conventions:
    ?sort=field:direction            (single sort)
    ?sort=field:direction,field2:desc (multiple sorts)
    ?filter[field]=value             (exact match)
    ?filter[field][op]=value         (with operator)
    ?search=keyword                  (search keyword)
    ?search_fields=title,description (fields to search)
    ?page=1&per_page=20              (pagination)

Example URLs:
    /api/sections?sort=sort_order:asc,id:desc&filter[status]=published&search=test&search_fields=title,description
"""

from flask import request


def parse_sort(sort_param):
    """
    Parse sort param into list of {"field": str, "direction": str}.
    Format: "field:direction" or "field1:asc,field2:desc"
    """
    if not sort_param:
        return []

    sorts = []
    for part in sort_param.split(","):
        part = part.strip()
        if ":" in part:
            field, direction = part.split(":", 1)
            sorts.append(
                {"field": field.strip(), "direction": direction.strip().lower()}
            )
        else:
            sorts.append({"field": part.strip(), "direction": "asc"})
    return sorts


def parse_filters(filter_param):
    """
    Parse filter param into list of {"field": str, "value": any, "op": str}.
    Supports: ?filter[field]=value or ?filter[field][op]=value
    """
    if not filter_param:
        return []

    filters = []
    if isinstance(filter_param, dict):
        for field, value in filter_param.items():
            if isinstance(value, dict):
                for op, val in value.items():
                    filters.append({"field": field, "value": val, "op": op})
            else:
                filters.append({"field": field, "value": value, "op": "eq"})
    return filters


def parse_search(search_keyword, search_fields_param=None):
    """
    Parse search params into {"fields": [str], "keyword": str}.
    """
    if not search_keyword:
        return None

    fields = []
    if search_fields_param:
        fields = [f.strip() for f in search_fields_param.split(",") if f.strip()]

    return {"fields": fields, "keyword": search_keyword.strip()}


def get_query_params(default_sort=None, searchable_fields=None, filterable_fields=None):
    """
    Extract and parse all query params from the current request.

    Args:
        default_sort: list of {"field": str, "direction": str} - fallback sort
        searchable_fields: list of field names allowed for search
        filterable_fields: list of field names allowed for filter

    Returns:
        dict with keys: filters, search, sorts, page, per_page

    Usage in controller:
        params = get_query_params(
            default_sort=[{"field": "sort_order", "direction": "asc"}],
            searchable_fields=["title", "description"],
            filterable_fields=["status", "section_type", "is_visible"],
        )
        result = build_query(PageSection, **params)
    """
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    # Parse sorts
    sort_param = request.args.get("sort")
    sorts = parse_sort(sort_param) if sort_param else (default_sort or [])

    # Validate sort fields
    if filterable_fields or searchable_fields:
        allowed = set((filterable_fields or []) + (searchable_fields or []))
        sorts = [s for s in sorts if s["field"] in allowed or s["field"] == "id"]

    # Parse search
    search_keyword = request.args.get("search")
    search_fields_param = request.args.get("search_fields")
    search = None
    if search_keyword:
        fields = []
        if search_fields_param:
            fields = [f.strip() for f in search_fields_param.split(",")]
        elif searchable_fields:
            fields = searchable_fields
        search = {"fields": fields, "keyword": search_keyword.strip()}

    # Parse filters from query params
    filters = []
    for key in request.args:
        if key.startswith("filter[") and key.endswith("]"):
            field = key[7:-1]
            value = request.args.get(key)
            if value is not None:
                filters.append({"field": field, "value": value, "op": "eq"})

    # Also support direct filter params like ?status=published
    if filterable_fields:
        for field in filterable_fields:
            value = request.args.get(field)
            if value is not None and not any(f["field"] == field for f in filters):
                filters.append({"field": field, "value": value, "op": "eq"})

    return {
        "filters": filters if filters else None,
        "search": search,
        "sorts": sorts if sorts else None,
        "page": page,
        "per_page": per_page,
    }
