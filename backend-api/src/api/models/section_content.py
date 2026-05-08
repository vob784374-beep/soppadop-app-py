from src.api.models import db
from datetime import datetime, timezone


class SectionContent(db.Model):
    __tablename__ = "section_contents"

    id = db.Column(db.Integer, primary_key=True)
    section_id = db.Column(
        db.Integer, db.ForeignKey("page_sections.id"), nullable=False
    )
    title = db.Column(db.String(255), nullable=True)
    subtitle = db.Column(db.String(500), nullable=True)
    body = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    video_url = db.Column(db.String(500), nullable=True)
    link_url = db.Column(db.String(500), nullable=True)
    tags = db.Column(db.String(500), nullable=True)
    author = db.Column(db.String(100), nullable=True)
    sort_order = db.Column(db.Integer, nullable=False, default=0)
    is_visible = db.Column(db.Boolean, nullable=False, default=True)
    content_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "section_id": self.section_id,
            "title": self.title,
            "subtitle": self.subtitle,
            "body": self.body,
            "image_url": self.image_url,
            "video_url": self.video_url,
            "link_url": self.link_url,
            "tags": self.tags,
            "author": self.author,
            "sort_order": self.sort_order,
            "is_visible": self.is_visible,
            "content_date": self.content_date.isoformat()
            if self.content_date
            else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
