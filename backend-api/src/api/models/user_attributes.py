from src.api.models import db
from datetime import datetime


class UserAttribute(db.Model):
    __tablename__ = "user_attributes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    attr_key = db.Column(db.String(50), nullable=False)
    attr_value = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Don't define 'user' backref here since User.attributes already provides it
    __table_args__ = (db.UniqueConstraint("user_id", "attr_key", name="uq_user_attr"),)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "attr_key": self.attr_key,
            "attr_value": self.attr_value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ResourceAttribute(db.Model):
    __tablename__ = "resource_attributes"

    id = db.Column(db.Integer, primary_key=True)
    resource_type = db.Column(db.String(50), nullable=False)
    resource_id = db.Column(db.Integer, nullable=False)
    attr_key = db.Column(db.String(50), nullable=False)
    attr_value = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("resource_type", "resource_id", "attr_key"),
        db.Index("idx_resource_attrs_lookup", "resource_type", "resource_id"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "attr_key": self.attr_key,
            "attr_value": self.attr_value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
