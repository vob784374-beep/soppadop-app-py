from sqlalchemy import or_
from src.api.models import db


class QueryBuilder:
    """
    Flexible query builder for SQLAlchemy models.
    Supports chaining filter, search, sort, paginate operations.

    Usage:
        result = QueryBuilder(PageSection) \
            .filter("section_type", "general") \
            .filter("is_visible", True) \
            .search(["title", "description"], keyword) \
            .sort("sort_order", "asc") \
            .sort("id", "desc") \
            .paginate(page=1, per_page=20) \
            .execute()

    Filter operators:
        .filter("field", "value")             # == (default)
        .filter("field", "value", op="ne")     # !=
        .filter("field", "value", op="gt")     # >
        .filter("field", "value", op="gte")    # >=
        .filter("field", "value", op="lt")     # <
        .filter("field", "value", op="lte")    # <=
        .filter("field", [1,2,3], op="in")     # IN
        .filter("field", "val", op="like")     # LIKE %val%
        .filter("field", "val", op="ilike")    # ILIKE %val%
    """

    OPERATORS = {
        "eq": lambda col, val: col == val,
        "ne": lambda col, val: col != val,
        "gt": lambda col, val: col > val,
        "gte": lambda col, val: col >= val,
        "lt": lambda col, val: col < val,
        "lte": lambda col, val: col <= val,
        "in": lambda col, val: col.in_(val),
        "like": lambda col, val: col.like(f"%{val}%"),
        "ilike": lambda col, val: col.ilike(f"%{val}%"),
    }

    def __init__(self, model):
        self.model = model
        self._query = model.query
        self._filters = []
        self._sorts = []
        self._search_fields = []
        self._search_keyword = None
        self._pagination = None

    def filter(self, field, value, op="eq"):
        """Add a filter condition."""
        if value is None:
            return self
        col = getattr(self.model, field)
        self._filters.append((col, value, op))
        return self

    def filter_many(self, filters):
        """
        Add multiple filters from a dict/list.
        filters: list of {"field": str, "value": any, "op": str}
        """
        for f in filters:
            self.filter(f["field"], f.get("value"), f.get("op", "eq"))
        return self

    def search(self, fields, keyword):
        """Add ILIKE search across multiple string fields."""
        if not keyword or not fields:
            return self
        self._search_fields = fields
        self._search_keyword = keyword.strip()
        return self

    def sort(self, field, direction="asc"):
        """Add a sort order. Can be called multiple times for multi-sort."""
        if not hasattr(self.model, field):
            return self
        col = getattr(self.model, field)
        self._sorts.append((col, direction.lower()))
        return self

    def sort_by(self, sorts):
        """
        Add multiple sorts from a list.
        sorts: [{"field": str, "direction": "asc"|"desc"}]
        """
        for s in sorts:
            self.sort(s["field"], s.get("direction", "asc"))
        return self

    def paginate(self, page=1, per_page=20):
        """Set pagination parameters."""
        self._pagination = (page, per_page)
        return self

    def execute(self):
        """Build and execute the query, return SQLAlchemy pagination object."""
        # Apply filters
        for col, value, op in self._filters:
            if value is not None:
                op_func = self.OPERATORS.get(op, self.OPERATORS["eq"])
                self._query = self._query.filter(op_func(col, value))

        # Apply search
        if self._search_keyword and self._search_fields:
            search_term = f"%{self._search_keyword}%"
            conditions = []
            for field_name in self._search_fields:
                if hasattr(self.model, field_name):
                    col = getattr(self.model, field_name)
                    conditions.append(col.ilike(search_term))
            if conditions:
                self._query = self._query.filter(or_(*conditions))

        # Apply sorts
        for col, direction in self._sorts:
            if direction == "desc":
                self._query = self._query.order_by(col.desc())
            else:
                self._query = self._query.order_by(col.asc())

        # Apply pagination
        if self._pagination:
            page, per_page = self._pagination
            return self._query.paginate(page=page, per_page=per_page, error_out=False)

        return self._query.all()

    def first(self):
        """Execute and return first result."""
        # Apply filters
        for col, value, op in self._filters:
            if value is not None:
                op_func = self.OPERATORS.get(op, self.OPERATORS["eq"])
                self._query = self._query.filter(op_func(col, value))

        # Apply search
        if self._search_keyword and self._search_fields:
            search_term = f"%{self._search_keyword}%"
            conditions = []
            for field_name in self._search_fields:
                if hasattr(self.model, field_name):
                    col = getattr(self.model, field_name)
                    conditions.append(col.ilike(search_term))
            if conditions:
                self._query = self._query.filter(or_(*conditions))

        return self._query.first()

    def count(self):
        """Return count of matching records."""
        for col, value, op in self._filters:
            if value is not None:
                op_func = self.OPERATORS.get(op, self.OPERATORS["eq"])
                self._query = self._query.filter(op_func(col, value))

        if self._search_keyword and self._search_fields:
            search_term = f"%{self._search_keyword}%"
            conditions = []
            for field_name in self._search_fields:
                if hasattr(self.model, field_name):
                    col = getattr(self.model, field_name)
                    conditions.append(col.ilike(search_term))
            if conditions:
                self._query = self._query.filter(or_(*conditions))

        return self._query.count()


def build_query(model, filters=None, search=None, sorts=None, page=None, per_page=None):
    """
    One-liner helper to build and execute a query.

    Args:
        model: SQLAlchemy model class
        filters: list of {"field": str, "value": any, "op": str}
        search: {"fields": [str], "keyword": str}
        sorts: [{"field": str, "direction": "asc"|"desc"}]
        page: int
        per_page: int

    Returns:
        SQLAlchemy pagination object or list

    Example:
        result = build_query(
            PageSection,
            filters=[{"field": "is_visible", "value": True}],
            search={"fields": ["title", "description"], "keyword": "test"},
            sorts=[{"field": "sort_order", "direction": "asc"}],
            page=1, per_page=20
        )
    """
    qb = QueryBuilder(model)

    if filters:
        qb.filter_many(filters)

    if search and search.get("keyword"):
        qb.search(search.get("fields", []), search["keyword"])

    if sorts:
        qb.sort_by(sorts)

    if page and per_page:
        qb.paginate(page, per_page)

    return qb.execute()
