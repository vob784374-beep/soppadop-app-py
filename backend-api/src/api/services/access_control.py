from functools import wraps
from typing import Any, Dict, List, Optional, Callable

from flask import jsonify, g, request
from src.api.services.policy_engine import policy_engine, Effect
from src.api.services.jwt_service import JWTService
from src.api.models import User
from src.api.utils.constants import Msg
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()


def abac_required(action: str, resource: str,
                  resource_id_param: Optional[str] = None,
                  custom_context: Optional[Callable] = None):
    """
    Enhanced decorator combining RBAC and ABAC.

    Args:
        action: The action being performed (e.g., "view", "edit", "delete")
        resource: The resource type (e.g., "resources", "users", "page_sections")
        resource_id_param: URL parameter name for resource ID (e.g., "section_id")
        custom_context: Function to extract additional context from request

    Usage:
        @abac_required("delete", "resources", resource_id_param="resource_id")
        def delete_resource(resource_id):
            ...

        @abac_required("publish", "page_sections", resource_id_param="section_id")
        def publish_section(section_id):
            ...
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # Get current user
            if not JWTService.verify_access():
                return jsonify({"error": Msg.General.AUTH_REQUIRED}), 401

            identity = JWTService.get_current_identity()
            user = User.query.get(identity["id"])

            if not user or not user.is_active:
                return jsonify({"error": Msg.General.AUTH_REQUIRED}), 401

            # Super admin bypass (maintain backward compatibility)
            if user.role and user.role.is_super_admin:
                g.current_user = user
                return fn(*args, **kwargs)

            # Extract resource ID if needed
            context = {}
            if resource_id_param and resource_id_param in kwargs:
                res_id = kwargs[resource_id_param]
                context["resource_attrs"] = policy_engine.get_resource_attrs(resource, res_id)

            # Custom context extraction
            if custom_context:
                extra = custom_context(*args, **kwargs)
                if extra:
                    context.update(extra)

            # Evaluate policies
            allowed, reasons = policy_engine.evaluate(user, action, resource, context)

            if not allowed:
                log.warning(
                    f"ABAC DENIED | user_id={user.id} | role={user.role.name if user.role else None} "
                    f"| action={action} | resource={resource} | reasons={reasons}"
                )
                return jsonify({
                    "error": Msg.Permission.INSUFFICIENT,
                    "reasons": reasons
                }), 403

            g.current_user = user
            log.debug(
                f"ABAC ALLOWED | user_id={user.id} | role={user.role.name if user.role else None} "
                f"| action={action} | resource={resource}"
            )
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def abac_or_rbac_required(rbac_permissions: List[str], abac_action: str, abac_resource: str,
                          resource_id_param: Optional[str] = None):
    """
    Requires either RBAC permission OR ABAC policy to allow access.
    Useful for gradual migration from RBAC to ABAC.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if not JWTService.verify_access():
                return jsonify({"error": Msg.General.AUTH_REQUIRED}), 401

            identity = JWTService.get_current_identity()
            user = User.query.get(identity["id"])

            if not user or not user.is_active:
                return jsonify({"error": Msg.General.AUTH_REQUIRED}), 401

            # Super admin bypass
            if user.role and (user.role.is_super_admin or user.role.name == "admin"):
                g.current_user = user
                return fn(*args, **kwargs)

            # Check RBAC first
            if user.has_any_permission(*rbac_permissions):
                g.current_user = user
                return fn(*args, **kwargs)

            # Fall back to ABAC
            context = {}
            if resource_id_param and resource_id_param in kwargs:
                res_id = kwargs[resource_id_param]
                context["resource_attrs"] = policy_engine.get_resource_attrs(abac_resource, res_id)

            allowed, reasons = policy_engine.evaluate(user, abac_action, abac_resource, context)
            if allowed:
                g.current_user = user
                return fn(*args, **kwargs)

            log.warning(
                f"ABAC_OR_RBAC DENIED | user_id={user.id} | role={user.role.name if user.role else None} "
                f"| rbac_perms={rbac_permissions} | abac_action={abac_action} | resource={abac_resource}"
            )
            return jsonify({
                "error": Msg.Permission.INSUFFICIENT,
                "reasons": reasons + [f"Missing RBAC permissions: {rbac_permissions}"]
            }), 403
        return wrapper
    return decorator
