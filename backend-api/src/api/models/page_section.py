from src.api.models import db
from datetime import datetime, timezone
import json


class PageSection(db.Model):
    __tablename__ = "page_sections"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    section_type = db.Column(db.String(50), nullable=False, default="general")
    description = db.Column(db.Text, nullable=True)
    cover_image = db.Column(db.String(500), nullable=True)
    sort_order = db.Column(db.Integer, nullable=False, default=0)
    is_visible = db.Column(db.Boolean, nullable=False, default=True)
    status = db.Column(
        db.String(20), nullable=False, default="draft"
    )  # draft | published
    layout = db.Column(db.String(50), nullable=False, default="grid")
    max_items = db.Column(db.Integer, nullable=False, default=6)
    background_color = db.Column(db.String(20), nullable=True)

    # Template grouping
    template_group = db.Column(
        db.String(100), nullable=True, default=None
    )  # e.g. "corporate-homepage" - sections from same template share this
    group_order = db.Column(
        db.Integer, nullable=False, default=0
    )  # position within the template group

    # Visual effects (JSON)
    section_effects = db.Column(
        db.Text, nullable=True, default=None
    )  # JSON: {entry,image,text,card,bg}_effect config

    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    creator = db.relationship(
        "User", foreign_keys=[created_by], backref="page_sections"
    )
    contents = db.relationship(
        "SectionContent",
        backref="section",
        lazy="dynamic",
        cascade="all, delete-orphan",
        order_by="SectionContent.sort_order",
    )

    def to_dict(self, include_contents=False):
        effects = None
        if self.section_effects:
            try:
                effects = json.loads(self.section_effects)
            except (json.JSONDecodeError, TypeError):
                effects = None

        data = {
            "id": self.id,
            "title": self.title,
            "section_type": self.section_type,
            "description": self.description,
            "cover_image": self.cover_image,
            "sort_order": self.sort_order,
            "is_visible": self.is_visible,
            "status": self.status,
            "layout": self.layout,
            "max_items": self.max_items,
            "background_color": self.background_color,
            "template_group": self.template_group,
            "group_order": self.group_order,
            "section_effects": effects,
            "created_by": self.created_by,
            "created_by_user": self.creator.username if self.creator else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_contents:
            data["contents"] = [
                c.to_dict() for c in self.contents.filter_by(is_visible=True).all()
            ]
        return data

    def to_dict_admin(self):
        data = self.to_dict()
        data["contents"] = [c.to_dict() for c in self.contents.all()]
        data["content_count"] = self.contents.count()
        return data
