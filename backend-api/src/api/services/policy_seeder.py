import json
from src.api.services.policy_engine import policy_engine, PolicyRule, Effect
from src.api.models import db, PolicyRule as PolicyRuleModel
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()


def seed_default_policies():
    """Seed default ABAC policies. Call this after app initialization."""

    # ----------------------------------------------------------------------
    # Owner has full access to everything (super_admin role already covers this,
    # but we include it here for completeness in the ABAC layer)
    # ----------------------------------------------------------------------
    _add_rule("owner-full-access",
        description="Owner account has unrestricted access to all resources",
        effect=Effect.ALLOW,
        actions=["*"],
        resources=["*"],
        conditions={"user.role": {"op": "eq", "value": "super_admin"}},
        priority=100)

    # ----------------------------------------------------------------------
    # Admin role has full access to all non-owner resources
    # ----------------------------------------------------------------------
    _add_rule("admin-full-access",
        description="Admin role has full access to all resources (except owner-restricted)",
        effect=Effect.ALLOW,
        actions=["*"],
        resources=["*"],
        conditions={"user.role": {"op": "eq", "value": "admin"}},
        priority=90)

    # ----------------------------------------------------------------------
    # Time-based restriction: Delete operations restricted to business hours
    # for non-privileged users (helps prevent accidental/malicious deletions)
    # ----------------------------------------------------------------------
    _add_rule("time-restricted-delete-morning",
        description="Delete operations restricted to business hours (9-17) for non-privileged users",
        effect=Effect.DENY,
        actions=["delete"],
        resources=["users", "roles", "permissions", "resources", "page_sections"],
        conditions={"user.role": {"op": "not_in", "value": ["super_admin", "admin"]}, "environment.time_of_day": {"op": "lt", "value": 9}},
        priority=80)

    _add_rule("time-restricted-delete-evening",
        description="Delete operations restricted to business hours (9-17) evening",
        effect=Effect.DENY,
        actions=["delete"],
        resources=["users", "roles", "permissions", "resources", "page_sections"],
        conditions={"user.role": {"op": "not_in", "value": ["super_admin", "admin"]}, "environment.time_of_day": {"op": "gte", "value": 17}},
        priority=80)

    # ----------------------------------------------------------------------
    # Weekend restrictions for sensitive operations
    # ----------------------------------------------------------------------
    _add_rule("weekend-permission-restriction",
        description="Permission modifications restricted on weekends for non-privileged users",
        effect=Effect.DENY,
        actions=["create", "update", "delete"],
        resources=["roles", "permissions"],
        conditions={"user.role": {"op": "not_in", "value": ["super_admin", "admin"]}, "environment.day_of_week": {"op": "in", "value": [5, 6]}},
        priority=75)

    # ----------------------------------------------------------------------
    # IP-based access for high-sensitivity resources
    # ----------------------------------------------------------------------
    _add_rule("internal-only-high-sensitivity",
        description="High sensitivity resources require internal IP address",
        effect=Effect.DENY,
        actions=["view", "download", "update", "delete"],
        resources=["resources"],
        conditions={"resource_attrs.sensitivity": {"op": "eq", "value": "high"}, "environment.ip_address": {"op": "not_in", "value": ["192.168.", "10.", "172.16.", "127.0.0.1", "::1"]}},
        priority=70)

    # ----------------------------------------------------------------------
    # Department isolation
    # ----------------------------------------------------------------------
    _add_rule("department-isolation-view",
        description="Users can only view resources in their own department",
        effect=Effect.DENY,
        actions=["view"],
        resources=["resources"],
        conditions={"resource_attrs.department_id": {"required": True}, "user.department_id": {"required": True}, "resource_attrs.department_id": {"op": "ne", "value": "${user.department_id}"}},
        priority=60)

    _add_rule("department-isolation-delete",
        description="Users can only delete resources in their own department",
        effect=Effect.DENY,
        actions=["delete", "update"],
        resources=["resources"],
        conditions={"resource_attrs.department_id": {"required": True}, "user.department_id": {"required": True}, "resource_attrs.department_id": {"op": "ne", "value": "${user.department_id}"}},
        priority=60)

    # ----------------------------------------------------------------------
    # Manager cannot delete users
    # ----------------------------------------------------------------------
    _add_rule("manager-no-delete",
        description="Manager role cannot delete users",
        effect=Effect.DENY,
        actions=["delete"],
        resources=["users"],
        conditions={"user.role": {"op": "eq", "value": "manager"}},
        priority=55)

    # ----------------------------------------------------------------------
    # Client role restrictions
    # ----------------------------------------------------------------------
    _add_rule("client-restrictions",
        description="Client role has restricted access",
        effect=Effect.DENY,
        actions=["create", "update", "delete"],
        resources=["users", "roles", "permissions", "page_sections"],
        conditions={"user.role": {"op": "eq", "value": "client"}},
        priority=50)

    # ----------------------------------------------------------------------
    # Client own resources
    # ----------------------------------------------------------------------
    _add_rule("client-own-resources",
        description="Client can only view/update/delete their own uploaded resources",
        effect=Effect.ALLOW,
        actions=["view", "update", "download", "delete"],
        resources=["resources"],
        conditions={"user.role": {"op": "eq", "value": "client"}, "resource_attrs.owner_id": {"op": "eq", "value": "${user.id}"}},
        priority=55)

    # ----------------------------------------------------------------------
    # Page section draft restrictions
    # ----------------------------------------------------------------------
    _add_rule("section-draft-restriction",
        description="Draft sections can only be modified by their author or privileged roles",
        effect=Effect.DENY,
        actions=["update", "delete"],
        resources=["page_sections"],
        conditions={"user.role": {"op": "not_in", "value": ["super_admin", "admin", "manager"]}, "resource_attrs.status": {"op": "eq", "value": "draft"}, "resource_attrs.author_id": {"op": "ne", "value": "${user.id}"}},
        priority=65)

    log.info(f"Loaded {len(policy_engine.rules)} policy rules")


def _add_rule(id, description, effect, actions, resources, conditions, priority):
    """Add rule to both in-memory engine and database."""
    policy_engine.add_rule(PolicyRule(
        id=id,
        description=description,
        effect=effect,
        actions=actions,
        resources=resources,
        conditions=conditions,
        priority=priority,
    ))

    existing = PolicyRuleModel.query.filter_by(name=id).first()
    if not existing:
        db.session.add(PolicyRuleModel(
            name=id,
            description=description,
            priority=priority,
            effect=effect.value,
            actions=json.dumps(actions),
            resources=json.dumps(resources),
            conditions=json.dumps(conditions),
            is_active=True,
        ))
    db.session.commit()


def register_custom_policies():
    """
    Register application-specific policies dynamically.
    This function can be called by modules that need to add additional policies.

    Example:
        from src.api.services.policy_seeder import policy_engine, PolicyRule, Effect
        policy_engine.add_rule(PolicyRule(
            id="custom-rule",
            description="Custom policy",
            effect=Effect.ALLOW,
            actions=["view"],
            resources=["custom_resource"],
            conditions={...},
            priority=40,
        ))
    """
    pass
