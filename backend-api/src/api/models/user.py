from src.api.models import db
from datetime import datetime
import bcrypt


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    username = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey("roles.id"), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    is_owner = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    role = db.relationship("Role", lazy="joined")
    attributes = db.relationship("UserAttribute", backref="user", lazy="selectin", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(
            password.encode("utf-8"), bcrypt.gensalt()
        ).decode("utf-8")

    def check_password(self, password):
        return bcrypt.checkpw(
            password.encode("utf-8"), self.password_hash.encode("utf-8")
        )

    def has_permission(self, permission_name):
        if self.role and self.role.is_super_admin:
            return True
        return any(p.name == permission_name for p in self.role.permissions)

    def has_any_permission(self, *permission_names):
        if self.role and self.role.is_super_admin:
            return True
        role_perms = {p.name for p in self.role.permissions}
        return bool(role_perms.intersection(permission_names))

    def get_attribute(self, key: str):
        """Get a user attribute value."""
        for attr in self.attributes:
            if attr.attr_key == key:
                return attr.attr_value
        return None

    def has_attribute(self, key: str, value=None):
        """Check if user has attribute (optionally matching value)."""
        attr_value = self.get_attribute(key)
        if attr_value is None:
            return False
        return value is None or attr_value == value

    def to_dict(self, include_attributes=False):
        data = {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "role": self.role.to_dict() if self.role else None,
            "is_active": self.is_active,
            "is_owner": self.is_owner,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_attributes:
            data["attributes"] = {
                attr.attr_key: attr.attr_value for attr in self.attributes
            }
        return data
