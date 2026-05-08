from src.api.models import db
from src.api.utils.logger import get_daily_logger

daily_logger = get_daily_logger()


LAYOUTS = [
    {
        "id": "grid",
        "name": "Grid",
        "description": "Responsive grid layout with equal-width columns",
        "icon": "grid_view",
        "category": "standard",
        "supports_columns": True,
        "default_columns": 3,
        "css_class": "layout-grid",
    },
    {
        "id": "list",
        "name": "List",
        "description": "Vertical list layout with full-width items",
        "icon": "view_list",
        "category": "standard",
        "supports_columns": False,
        "default_columns": 1,
        "css_class": "layout-list",
    },
    {
        "id": "hero",
        "name": "Hero",
        "description": "Full-width hero banner with centered content",
        "icon": "view_carousel",
        "category": "banner",
        "supports_columns": False,
        "default_columns": 1,
        "css_class": "layout-hero",
    },
    {
        "id": "carousel",
        "name": "Carousel",
        "description": "Sliding carousel with navigation controls",
        "icon": "swipe",
        "category": "slider",
        "supports_columns": False,
        "default_columns": 1,
        "css_class": "layout-carousel",
    },
    {
        "id": "masonry",
        "name": "Masonry",
        "description": "Pinterest-style masonry grid with variable heights",
        "icon": "dashboard",
        "category": "creative",
        "supports_columns": True,
        "default_columns": 3,
        "css_class": "layout-masonry",
    },
    {
        "id": "featured",
        "name": "Featured",
        "description": "Large featured item with smaller items beside it",
        "icon": "star",
        "category": "highlight",
        "supports_columns": False,
        "default_columns": 1,
        "css_class": "layout-featured",
    },
    {
        "id": "sidebar",
        "name": "Sidebar",
        "description": "Two-column layout with main content and sidebar",
        "icon": "view_sidebar",
        "category": "standard",
        "supports_columns": False,
        "default_columns": 2,
        "css_class": "layout-sidebar",
    },
    {
        "id": "split",
        "name": "Split",
        "description": "Two equal columns side by side",
        "icon": "vertical_split",
        "category": "standard",
        "supports_columns": False,
        "default_columns": 2,
        "css_class": "layout-split",
    },
    {
        "id": "stacked",
        "name": "Stacked",
        "description": "Vertically stacked full-width blocks",
        "icon": "layers",
        "category": "standard",
        "supports_columns": False,
        "default_columns": 1,
        "css_class": "layout-stacked",
    },
    {
        "id": "card",
        "name": "Card Deck",
        "description": "Card-based layout with shadow and hover effects",
        "icon": "style",
        "category": "standard",
        "supports_columns": True,
        "default_columns": 3,
        "css_class": "layout-card",
    },
    {
        "id": "timeline",
        "name": "Timeline",
        "description": "Chronological timeline with connected items",
        "icon": "timeline",
        "category": "creative",
        "supports_columns": False,
        "default_columns": 1,
        "css_class": "layout-timeline",
    },
    {
        "id": "tabs",
        "name": "Tabs",
        "description": "Tabbed content with switchable panels",
        "icon": "tab",
        "category": "interactive",
        "supports_columns": False,
        "default_columns": 1,
        "css_class": "layout-tabs",
    },
]


def seed_layouts():
    """Seed layouts into a dedicated table or store them as config.

    Since the current schema uses a simple string `layout` field on PageSection,
    we seed this as a reference/config table for the frontend to know
    available layouts. The actual layout value is stored in PageSection.layout.
    """
    from src.api.models import db

    inspector = db.inspect(db.engine)
    existing_tables = inspector.get_table_names()

    if "layouts" not in existing_tables:
        db.session.execute(
            db.text(
                """CREATE TABLE IF NOT EXISTS layouts (
                    id VARCHAR(50) PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    icon VARCHAR(50),
                    category VARCHAR(50) DEFAULT 'standard',
                    supports_columns BOOLEAN DEFAULT FALSE,
                    default_columns INT DEFAULT 1,
                    css_class VARCHAR(100),
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )"""
            )
        )
        db.session.commit()
        daily_logger.info("seed_layouts | created layouts table")

    for layout in LAYOUTS:
        existing = db.session.execute(
            db.text("SELECT id FROM layouts WHERE id = :id"), {"id": layout["id"]}
        ).fetchone()

        if not existing:
            db.session.execute(
                db.text(
                    """INSERT INTO layouts (id, name, description, icon, category,
                    supports_columns, default_columns, css_class)
                    VALUES (:id, :name, :description, :icon, :category,
                    :supports_columns, :default_columns, :css_class)"""
                ),
                layout,
            )
            daily_logger.debug(f"seed_layouts | created layout | id={layout['id']}")
        else:
            daily_logger.debug(
                f"seed_layouts | layout already exists | id={layout['id']}"
            )

    db.session.commit()
    daily_logger.info(f"seed_layouts | DONE | total_layouts={len(LAYOUTS)}")


def get_all_layouts():
    """Return all available layouts."""
    return LAYOUTS


def get_layout_by_id(layout_id):
    """Return a specific layout by ID."""
    for layout in LAYOUTS:
        if layout["id"] == layout_id:
            return layout
    return None
