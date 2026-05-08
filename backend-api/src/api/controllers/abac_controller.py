from flask import Blueprint, request, jsonify
import json
from src.api.models import UserAttribute, ResourceAttribute, PolicyRule, User, Role
from src.api.utils.decorators import permission_required, auth_required
from src.api.utils.logger import get_daily_logger
from src.api.utils.response import success, error
from src.api.utils.request import get_json_body
from src.api.models import db

log = get_daily_logger()
abac_bp = Blueprint("abac", __name__, url_prefix="/api")


def validate_resource_exists(resource_type, resource_id):
    """Validate that a resource exists by type and ID."""
    if resource_type == "users":
        return User.query.get(resource_id) is not None
    if resource_type == "roles":
        return Role.query.get(resource_id) is not None
    if resource_type == "resources":
        from src.api.models.resource import Resource
        return Resource.query.get(resource_id) is not None
    if resource_type == "page_sections":
        from src.api.models.page_section import PageSection
        return PageSection.query.get(resource_id) is not None
    return True  # Allow unknown resource types for flexibility


@abac_bp.route("/user-attributes", methods=["GET"])
@auth_required
def get_user_attributes():
    """Get all user attributes (admin only)."""
    try:
        attributes = UserAttribute.query.order_by(
            UserAttribute.user_id, UserAttribute.attr_key
        ).all()
        return success({
            "attributes": [a.to_dict() for a in attributes]
        })
    except Exception as e:
        log.error(f"Get user attributes exception: {type(e).__name__}: {e}")
        return error("Internal server error"), 500


@abac_bp.route("/users/<int:user_id>/attributes", methods=["GET"])
@auth_required
def get_user_attributes_by_id(user_id):
    """Get attributes for a specific user."""
    try:
        from src.api.models import User
        user = User.query.get(user_id)
        if not user:
            return error("User not found"), 404
        return success({
            "user_id": user_id,
            "attributes": user.to_dict(include_attributes=True).get("attributes", {})
        })
    except Exception as e:
        log.error(f"Get user attributes exception: {type(e).__name__}: {e}")
        return error("Internal server error"), 500


@abac_bp.route("/users/<int:user_id>/attributes", methods=["POST"])
@permission_required("users.update")
def create_user_attribute(user_id):
    """Create or update a user attribute."""
    data, err = get_json_body()
    if err:
        return error(err), 400

    key = data.get("attr_key")
    value = data.get("attr_value")
    if not key or not value:
        return error("attr_key and attr_value are required"), 400

    try:
        from src.api.models import User
        user = User.query.get(user_id)
        if not user:
            return error("User not found"), 404

        attr = UserAttribute.query.filter_by(user_id=user_id, attr_key=key).first()
        if attr:
            attr.attr_value = value
            db.session.commit()
            log.info(f"Updated user attribute | user_id={user_id} | key={key}")
        else:
            attr = UserAttribute(user_id=user_id, attr_key=key, attr_value=value)
            db.session.add(attr)
            db.session.commit()
            log.info(f"Created user attribute | user_id={user_id} | key={key}")

        return success({"attribute": attr.to_dict()}, "Attribute saved")
    except Exception as e:
        db.session.rollback()
        log.error(f"Create user attribute exception: {type(e).__name__}: {e}")
        return error("Internal server error"), 500


@abac_bp.route("/users/<int:user_id>/attributes/<string:attr_key>", methods=["DELETE"])
@permission_required("users.update")
def delete_user_attribute(user_id, attr_key):
    """Delete a user attribute."""
    try:
        attr = UserAttribute.query.filter_by(user_id=user_id, attr_key=attr_key).first()
        if not attr:
            return error("Attribute not found"), 404

        db.session.delete(attr)
        db.session.commit()
        log.info(f"Deleted user attribute | user_id={user_id} | key={attr_key}")
        return success(message="Attribute deleted")
    except Exception as e:
        db.session.rollback()
        log.error(f"Delete user attribute exception: {type(e).__name__}: {e}")
        return error("Internal server error"), 500


@abac_bp.route("/resource-attributes", methods=["GET"])
@permission_required("resources.view")
def get_resource_attributes():
    """Get all resource attributes."""
    try:
        attrs = ResourceAttribute.query.order_by(
            ResourceAttribute.resource_type,
            ResourceAttribute.resource_id,
            ResourceAttribute.attr_key,
        ).all()
        return success({"attributes": [a.to_dict() for a in attrs]})
    except Exception as e:
        log.error(f"Get resource attributes exception: {type(e).__name__}: {e}")
        return error("Internal server error"), 500


@abac_bp.route("/resources/<resource_type>/<int:resource_id>/attributes", methods=["GET"])
@auth_required
def get_resource_attributes_by_id(resource_type, resource_id):
    """Get attributes for a specific resource."""
    try:
        attrs = ResourceAttribute.query.filter_by(
            resource_type=resource_type, resource_id=resource_id
        ).all()
        return success({
            "resource_type": resource_type,
            "resource_id": resource_id,
            "attributes": {a.attr_key: a.attr_value for a in attrs}
        })
    except Exception as e:
        log.error(f"Get resource attributes exception: {type(e).__name__}: {e}")
        return error("Internal server error"), 500


@abac_bp.route("/resources/<resource_type>/<int:resource_id>/attributes", methods=["POST"])
@permission_required("resources.upload")
def create_resource_attribute(resource_type, resource_id):
    """Create or update a resource attribute."""
    data, err = get_json_body()
    if err:
        return error(err), 400

    key = data.get("attr_key")
    value = data.get("attr_value")
    if not key or not value:
        return error("attr_key and attr_value are required"), 400

    try:
        # Validate resource exists (basic check - extend per resource type)
        validate_resource_exists(resource_type, resource_id)

        attr = ResourceAttribute.query.filter_by(
            resource_type=resource_type, resource_id=resource_id, attr_key=key
        ).first()
        if attr:
            attr.attr_value = value
            db.session.commit()
            log.info(f"Updated resource attribute | type={resource_type} | id={resource_id} | key={key}")
        else:
            attr = ResourceAttribute(
                resource_type=resource_type,
                resource_id=resource_id,
                attr_key=key,
                attr_value=value,
            )
            db.session.add(attr)
            db.session.commit()
            log.info(f"Created resource attribute | type={resource_type} | id={resource_id} | key={key}")

        return success({"attribute": attr.to_dict()}, "Attribute saved")
    except Exception as e:
        db.session.rollback()
        log.error(f"Create resource attribute exception: {type(e).__name__}: {e}")
        return error("Internal server error"), 500


@abac_bp.route(
    "/resources/<resource_type>/<int:resource_id>/attributes/<string:attr_key>",
    methods=["DELETE"],
)
@permission_required("resources.delete")
def delete_resource_attribute(resource_type, resource_id, attr_key):
    """Delete a resource attribute."""
    try:
        attr = ResourceAttribute.query.filter_by(
            resource_type=resource_type, resource_id=resource_id, attr_key=attr_key
        ).first()
        if not attr:
            return error("Attribute not found"), 404

        db.session.delete(attr)
        db.session.commit()
        log.info(
            f"Deleted resource attribute | type={resource_type} | id={resource_id} | key={attr_key}"
        )
        return success(message="Attribute deleted")
    except Exception as e:
        db.session.rollback()
        log.error(f"Delete resource attribute exception: {type(e).__name__}: {e}")
        return error("Internal server error"), 500


@abac_bp.route("/abac/policies", methods=["GET"])
@permission_required("system.health")
def list_policies():
    """List all active policy rules (read-only)."""
    try:
        rules = PolicyRule.query.filter_by(is_active=True).order_by(PolicyRule.priority.desc()).all()
        return success({"policies": [r.to_dict() for r in rules], "total": len(rules)})
    except Exception as e:
        log.error(f"List policies exception: {type(e).__name__}: {e}")
        return error("Internal server error"), 500


@abac_bp.route("/abac/policies", methods=["POST"])
@permission_required("system.health")
def create_policy():
    """Create a new policy rule."""
    data, err = get_json_body()
    if err:
        return error(err)
    
    required_fields = ["name", "effect", "priority"]
    for field in required_fields:
        if field not in data:
            return error(f"Missing required field: {field}"), 400
    
    if data["effect"] not in ["allow", "deny"]:
        return error("Effect must be 'allow' or 'deny'"), 400
    
    try:
        conditions_json = json.dumps(data.get("conditions", {}))
        actions_json = json.dumps(data.get("actions", ["*"]))
        resources_json = json.dumps(data.get("resources", ["*"]))
    except (TypeError, ValueError) as e:
        return error(f"Invalid JSON format: {e}"), 400
    
    try:
        rule = PolicyRule(
            name=data["name"],
            description=data.get("description", ""),
            priority=int(data["priority"]),
            effect=data["effect"],
            actions=actions_json,
            resources=resources_json,
            conditions=conditions_json,
            is_active=data.get("is_active", True)
        )
        db.session.add(rule)
        db.session.commit()
        log.info(f"Create policy rule SUCCESS | rule_id={rule.id} | name={rule.name}")
        return success({"policy": rule.to_dict()}, "Policy rule created", 201)
    except Exception as e:
        db.session.rollback()
        log.error(f"Create policy rule exception: {type(e).__name__}: {e}")
        return error("Policy rule already exists or invalid data"), 409


@abac_bp.route("/abac/policies/<int:rule_id>", methods=["GET"])
@permission_required("system.health")
def get_policy(rule_id):
    """Get a specific policy rule."""
    rule = PolicyRule.query.get(rule_id)
    if not rule:
        return error("Policy rule not found"), 404
    return success({"policy": rule.to_dict()})


@abac_bp.route("/abac/policies/<int:rule_id>", methods=["PUT"])
@permission_required("system.health")
def update_policy(rule_id):
    """Update a policy rule."""
    rule = PolicyRule.query.get(rule_id)
    if not rule:
        return error("Policy rule not found"), 404
    
    data, err = get_json_body()
    if err:
        return error(err)
    
    try:
        if "name" in data:
            rule.name = data["name"]
        if "description" in data:
            rule.description = data["description"]
        if "priority" in data:
            rule.priority = int(data["priority"])
        if "effect" in data:
            if data["effect"] not in ["allow", "deny"]:
                return error("Effect must be 'allow' or 'deny'"), 400
            rule.effect = data["effect"]
        if "conditions" in data:
            rule.conditions = json.dumps(data["conditions"])
        if "actions" in data:
            rule.actions = json.dumps(data["actions"])
        if "resources" in data:
            rule.resources = json.dumps(data["resources"])
        if "is_active" in data:
            rule.is_active = bool(data["is_active"])
        
        db.session.commit()
        log.info(f"Update policy rule SUCCESS | rule_id={rule.id} | name={rule.name}")
        return success({"policy": rule.to_dict()}, "Policy rule updated")
    except Exception as e:
        db.session.rollback()
        log.error(f"Update policy rule exception: {type(e).__name__}: {e}")
        return error("Failed to update policy rule"), 400


@abac_bp.route("/abac/policies/<int:rule_id>", methods=["DELETE"])
@permission_required("system.health")
def delete_policy(rule_id):
    """Delete a policy rule."""
    rule = PolicyRule.query.get(rule_id)
    if not rule:
        return error("Policy rule not found"), 404
    
    try:
        db.session.delete(rule)
        db.session.commit()
        log.info(f"Delete policy rule SUCCESS | rule_id={rule_id}")
        return success(message="Policy rule deleted")
    except Exception as e:
        db.session.rollback()
        log.error(f"Delete policy rule exception: {type(e).__name__}: {e}")
        return error("Failed to delete policy rule"), 500


@abac_bp.route("/abac/policies/<int:rule_id>/active", methods=["PATCH"])
@permission_required("system.health")
def toggle_policy(rule_id):
    """Toggle policy rule active status."""
    rule = PolicyRule.query.get(rule_id)
    if not rule:
        return error("Policy rule not found"), 404
    
    data, err = get_json_body()
    if err:
        return error(err)
    
    is_active = data.get("is_active")
    if is_active is None:
        is_active = not rule.is_active
    
    rule.is_active = bool(is_active)
    db.session.commit()
    log.info(f"Toggle policy rule SUCCESS | rule_id={rule_id} | is_active={rule.is_active}")
    return success({"policy": rule.to_dict()})
