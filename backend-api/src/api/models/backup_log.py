from src.api.models import db
from datetime import datetime, timezone


class BackupLog(db.Model):
    __tablename__ = "backup_logs"

    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False, index=True)
    version = db.Column(db.Integer, nullable=False, default=1)
    action = db.Column(db.String(20), nullable=False)
    size = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), nullable=False, default="success")
    error_message = db.Column(db.Text, nullable=True)

    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    creator = db.relationship(
        "User", foreign_keys=[created_by], backref="backup_actions"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "version": self.version,
            "action": self.action,
            "size": self.size,
            "status": self.status,
            "error_message": self.error_message,
            "created_by": self.created_by,
            "created_by_user": self.creator.username if self.creator else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
