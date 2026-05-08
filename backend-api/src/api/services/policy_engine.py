import operator
from datetime import datetime
from typing import Any, Dict, List, Optional
from dataclasses import dataclass
from enum import Enum
from flask import g, request
from src.api.models import UserAttribute, ResourceAttribute, db
from src.api.models.policy_rule import PolicyRule as PolicyRuleModel
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()


class Effect(Enum):
    ALLOW = "allow"
    DENY = "deny"


@dataclass
class PolicyRule:
    id: str
    description: str
    effect: Effect
    actions: List[str]
    resources: List[str]
    conditions: Dict[str, Any]
    priority: int = 0


class ConditionEvaluator:
    """Evaluates attribute-based conditions."""

    OPERATORS = {
        "eq": operator.eq,
        "ne": operator.ne,
        "gt": operator.gt,
        "gte": operator.ge,
        "lt": operator.lt,
        "lte": operator.le,
        "in": lambda x, y: x in y,
        "not_in": lambda x, y: x not in y,
        "contains": lambda x, y: y in x if isinstance(x, (list, str)) else False,
    }

    @classmethod
    def evaluate(cls, op: str, user_val: Any, rule_val: Any) -> bool:
        if op not in cls.OPERATORS:
            return False
        try:
            return cls.OPERATORS[op](user_val, rule_val)
        except (TypeError, ValueError):
            return False


class PolicyEngine:
    """Central policy evaluation engine combining RBAC and ABAC."""

    def __init__(self):
        self.rules: List[PolicyRule] = []

    def add_rule(self, rule: PolicyRule):
        self.rules.append(rule)
        self.rules.sort(key=lambda r: r.priority, reverse=True)

    def load_rules_from_db(self):
        """Load active policy rules from database into memory."""
        import json
        self.rules.clear()
        for rule_model in PolicyRuleModel.query.filter_by(is_active=True).order_by(PolicyRuleModel.priority.desc()):
            try:
                rule = PolicyRule(
                    id=rule_model.name,
                    description=rule_model.description or "",
                    effect=Effect(rule_model.effect),
                    actions=json.loads(rule_model.actions) if rule_model.actions else [],
                    resources=json.loads(rule_model.resources) if rule_model.resources else [],
                    conditions=json.loads(rule_model.conditions) if rule_model.conditions else {},
                    priority=rule_model.priority,
                )
                self.rules.append(rule)
            except Exception as e:
                log.error(f"Failed to load policy rule {rule_model.id}: {e}")
        log.info(f"Loaded {len(self.rules)} policy rules from database")

    def get_context(self) -> Dict[str, Any]:
        """Extract environment context from request."""
        return {
            "ip_address": request.remote_addr if request else None,
            "user_agent": request.user_agent.string if request and request.user_agent else None,
            "time_of_day": datetime.utcnow().hour,
            "day_of_week": datetime.utcnow().weekday(),
            "method": request.method if request else None,
            "path": request.path if request else None,
        }

    def get_user_attrs(self, user) -> Dict[str, Any]:
        """Get user attributes for policy evaluation."""
        attrs = {"role": user.role.name if user.role else None, "id": user.id}
        for attr in user.attributes:
            attrs[attr.attr_key] = attr.attr_value
        return attrs

    def get_resource_attrs(self, resource_type: str, resource_id: int) -> Dict[str, Any]:
        """Get resource attributes for policy evaluation."""
        attrs = {}
        for attr in ResourceAttribute.query.filter_by(
            resource_type=resource_type, resource_id=resource_id
        ).all():
            attrs[attr.attr_key] = attr.attr_value
        return attrs

    def evaluate(self, user, action: str, resource: str,
                 context: Optional[Dict] = None) -> tuple[bool, List[str]]:
        """
        Evaluate all applicable policies and return decision.
        Returns: (allowed: bool, reasons: List[str])
        """
        user_attrs = self.get_user_attrs(user)
        env_context = self.get_context()
        combined_context = {**env_context, **(context or {})}

        matching_rules = []
        for rule in self.rules:
            if action in rule.actions or "*" in rule.actions:
                if resource in rule.resources or "*" in rule.resources:
                    matching_rules.append(rule)

        if not matching_rules:
            return False, ["No matching policy rules found"]

        for rule in matching_rules:
            if self._evaluate_conditions(rule.conditions, user_attrs, combined_context):
                return rule.effect == Effect.ALLOW, [f"Rule '{rule.id}' matched (effect={rule.effect.value})"]

        return False, ["No rules matched with conditions"]

    def _evaluate_conditions(self, conditions: Dict[str, Any],
                            user_attrs: Dict, env: Dict) -> bool:
        """Check if all conditions are satisfied."""
        for key, condition in conditions.items():
            parts = key.split(".")
            source = parts[0]

            actual = None
            if source == "user" and len(parts) > 1:
                actual = user_attrs.get(parts[1])
            elif source == "environment" and len(parts) > 1:
                actual = env.get(parts[1])
            elif source == "resource_attrs" and len(parts) > 1:
                actual = env.get("resource_attrs", {}).get(parts[1])

            if actual is None and condition.get("required", False):
                return False

            if "op" in condition:
                rule_val = condition.get("value")
                if not ConditionEvaluator.evaluate(condition["op"], actual, rule_val):
                    return False

        return True


policy_engine = PolicyEngine()
