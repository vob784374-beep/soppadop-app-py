from datetime import datetime, timezone
from src.api.models import db


class PolicyRule(db.Model):
    __tablename__ = 'policy_rules'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.String(500))
    priority = db.Column(db.Integer, nullable=False, default=50)
    effect = db.Column(db.String(10), nullable=False, default='allow')
    actions = db.Column(db.Text, nullable=False, default='[]')
    resources = db.Column(db.Text, nullable=False, default='[]')
    conditions = db.Column(db.Text, nullable=False, default='{}')
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        db.CheckConstraint(
            effect.in_(['allow', 'deny']),
            name='chk_policy_effect'
        ),
        db.CheckConstraint(
            priority >= 0,
            name='chk_policy_priority_non_negative'
        ),
    )

    def to_dict(self):
        import json
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'priority': self.priority,
            'effect': self.effect,
            'actions': json.loads(self.actions) if self.actions else [],
            'resources': json.loads(self.resources) if self.resources else [],
            'conditions': json.loads(self.conditions) if self.conditions else {},
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
