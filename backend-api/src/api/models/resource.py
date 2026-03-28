from src.api.models import db
from datetime import datetime, timezone


class Resource(db.Model):
    __tablename__ = "resources"

    id = db.Column(db.Integer, primary_key=True)
    display_name = db.Column(db.String(255), nullable=True)
    filename = db.Column(db.String(255), nullable=False)
    original_name = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50), nullable=False)
    mime_type = db.Column(db.String(100), nullable=False)
    size = db.Column(db.BigInteger, nullable=False, default=0)
    cloudinary_url = db.Column(db.String(500), nullable=False)
    cloudinary_public_id = db.Column(db.String(500), nullable=False)
    resource_type = db.Column(db.String(20), nullable=False, default="raw")
    collection = db.Column(db.String(100), nullable=True, default="default")
    folder = db.Column(db.String(255), nullable=True, default="soppadop")
    format = db.Column(db.String(20), nullable=True)
    width = db.Column(db.Integer, nullable=True)
    height = db.Column(db.Integer, nullable=True)
    version = db.Column(db.Integer, nullable=True)
    tags = db.Column(db.Text, nullable=True)
    description = db.Column(db.Text, nullable=True)
    download_count = db.Column(db.Integer, nullable=False, default=0)

    uploaded_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    uploader = db.relationship("User", foreign_keys=[uploaded_by], backref="resources")

    def to_dict(self):
        return {
            "id": self.id,
            "display_name": self.display_name,
            "filename": self.filename,
            "original_name": self.original_name,
            "file_type": self.file_type,
            "mime_type": self.mime_type,
            "size": self.size,
            "cloudinary_url": self.cloudinary_url,
            "cloudinary_public_id": self.cloudinary_public_id,
            "resource_type": self.resource_type,
            "collection": self.collection,
            "folder": self.folder,
            "format": self.format,
            "width": self.width,
            "height": self.height,
            "version": self.version,
            "tags": self.tags,
            "description": self.description,
            "download_count": self.download_count,
            "uploaded_by": self.uploaded_by,
            "uploaded_by_user": self.uploader.username if self.uploader else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
