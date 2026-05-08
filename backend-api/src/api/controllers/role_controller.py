import traceback
from flask import Blueprint, request, jsonify, g
from src.api.services.role_service import RoleService, PermissionService
from src.api.utils.decorators import permission_required
from src.api.utils.logger import get_daily_logger

daily_logger = get_daily_logger()

role_bp = Blueprint("roles", __name__, url_prefix="/api")


@role_bp.route("/roles", methods=["GET"])
@permission_required("roles.view")
def get_roles():
    """Get all roles."""
    daily_logger.debug("=== GET ROLES START ===")
    try:
        daily_logger.debug("Calling RoleService.get_all()")
        roles = RoleService.get_all()
        daily_logger.debug(f"Query returned {len(roles)} roles")
        daily_logger.info(f"Get roles SUCCESS | count={len(roles)} | status=200")
        daily_logger.debug("=== GET ROLES END ===")
        return jsonify(
            {"roles": [r.to_dict(include_permissions=True) for r in roles]}
        ), 200
    except Exception as e:
        daily_logger.error(f"Get roles EXCEPTION | exception={type(e).__name__}: {e}")
        daily_logger.error(f"Traceback:\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500


@role_bp.route("/roles/<int:role_id>", methods=["GET"])
@permission_required("roles.view")
def get_role(role_id):
    """Get role by ID."""
    daily_logger.debug(f"=== GET ROLE START | role_id={role_id} ===")
    try:
        daily_logger.debug(f"Calling RoleService.get_by_id | role_id={role_id}")
        role = RoleService.get_by_id(role_id)
        if not role:
            daily_logger.warning(
                f"Get role FAILED | role_id={role_id} | reason=not found | status=404"
            )
            return jsonify({"error": "Role not found"}), 404
        daily_logger.info(
            f"Get role SUCCESS | role_id={role.id} | name={role.name} | status=200"
        )
        daily_logger.debug("=== GET ROLE END ===")
        return jsonify({"role": role.to_dict(include_permissions=True)}), 200
    except Exception as e:
        daily_logger.error(
            f"Get role EXCEPTION | role_id={role_id} | exception={type(e).__name__}: {e}"
        )
        daily_logger.error(f"Traceback:\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500


@role_bp.route("/roles", methods=["POST"])
@permission_required("roles.create")
def create_role():
    """Create a new role."""
    daily_logger.debug("=== CREATE ROLE START ===")
    data = request.get_json()
    daily_logger.debug(f"Request body: {data}")

    if not data or not data.get("name"):
        daily_logger.warning(
            "Create role rejected | reason=role name is required | status=400"
        )
        return jsonify({"error": "Role name is required"}), 400

    name = data["name"]
    description = data.get("description")
    daily_logger.debug(f"Parsed fields | name={name} | description={description}")

    # Only owner (super_admin role) can create new roles
    user = g.get("current_user")
    if user and not user.role.is_super_admin:
        daily_logger.warning(
            f"Create role FAILED | user_id={user.id} | role={user.role.name} | reason=insufficient privileges | status=403"
        )
        return jsonify({"error": "Only owner can create roles"}), 403

    try:
        daily_logger.debug(f"Calling RoleService.create | name={name}")
        role, error = RoleService.create(name, description)
        if error:
            daily_logger.error(
                f"Create role FAILED | name={name} | error={error} | status=409"
            )
            return jsonify({"error": error}), 409

        daily_logger.info(
            f"Create role SUCCESS | role_id={role.id} | name={role.name} | status=201"
        )
        daily_logger.debug("=== CREATE ROLE END ===")
        return jsonify({"message": "Role created", "role": role.to_dict()}), 201
    except Exception as e:
        daily_logger.error(
            f"Create role EXCEPTION | name={name} | exception={type(e).__name__}: {e}"
        )
        daily_logger.error(f"Traceback:\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500


@role_bp.route("/roles/<int:role_id>", methods=["PUT"])
@permission_required("roles.update")
def update_role(role_id):
    """Update role by ID."""
    daily_logger.debug(f"=== UPDATE ROLE START | role_id={role_id} ===")
    data = request.get_json()
    daily_logger.debug(f"Request body: {data}")

    if not data:
        daily_logger.warning(
            "Update role rejected | reason=no data provided | status=400"
        )
        return jsonify({"error": "No data provided"}), 400

    try:
        daily_logger.debug(
            f"Calling RoleService.update | role_id={role_id} | fields={list(data.keys())}"
        )
        role, error = RoleService.update(role_id, **data)
        if error:
            daily_logger.error(
                f"Update role FAILED | role_id={role_id} | error={error}"
            )
            status = 404 if "not found" in error else 400
            return jsonify({"error": error}), status

        daily_logger.info(
            f"Update role SUCCESS | role_id={role_id} | fields={list(data.keys())} | status=200"
        )
        daily_logger.debug("=== UPDATE ROLE END ===")
        return jsonify({"message": "Role updated", "role": role.to_dict()}), 200
    except Exception as e:
        daily_logger.error(
            f"Update role EXCEPTION | role_id={role_id} | exception={type(e).__name__}: {e}"
        )
        daily_logger.error(f"Traceback:\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500


@role_bp.route("/roles/<int:role_id>", methods=["DELETE"])
@permission_required("roles.delete")
def delete_role(role_id):
    """Delete role by ID."""
    daily_logger.debug(f"=== DELETE ROLE START | role_id={role_id} ===")
    try:
        daily_logger.debug(f"Calling RoleService.delete | role_id={role_id}")
        success, error = RoleService.delete(role_id)
        if error:
            daily_logger.error(
                f"Delete role FAILED | role_id={role_id} | error={error}"
            )
            status = 404 if "not found" in error else 400
            return jsonify({"error": error}), status

        daily_logger.info(f"Delete role SUCCESS | role_id={role_id} | status=200")
        daily_logger.debug("=== DELETE ROLE END ===")
        return jsonify({"message": "Role deleted"}), 200
    except Exception as e:
        daily_logger.error(
            f"Delete role EXCEPTION | role_id={role_id} | exception={type(e).__name__}: {e}"
        )
        daily_logger.error(f"Traceback:\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500


@role_bp.route("/permissions", methods=["GET"])
@permission_required("permissions.view")
def get_permissions():
    """Get all permissions."""
    daily_logger.debug("=== GET PERMISSIONS START ===")
    try:
        daily_logger.debug("Calling PermissionService.get_all()")
        permissions = PermissionService.get_all()
        daily_logger.debug(f"Query returned {len(permissions)} permissions")
        daily_logger.info(
            f"Get permissions SUCCESS | count={len(permissions)} | status=200"
        )
        daily_logger.debug("=== GET PERMISSIONS END ===")
        return jsonify({"permissions": [p.to_dict() for p in permissions]}), 200
    except Exception as e:
        daily_logger.error(
            f"Get permissions EXCEPTION | exception={type(e).__name__}: {e}"
        )
        daily_logger.error(f"Traceback:\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500


@role_bp.route("/roles/<int:role_id>/permissions", methods=["POST"])
@permission_required("permissions.assign")
def set_role_permissions(role_id):
    """Set all permissions for a role (replace existing)."""
    daily_logger.debug(f"=== SET ROLE PERMISSIONS START | role_id={role_id} ===")
    data = request.get_json()
    daily_logger.debug(f"Request body: {data}")

    if not data or "permission_ids" not in data:
        daily_logger.warning(
            "Set role permissions rejected | reason=permission_ids required | status=400"
        )
        return jsonify({"error": "permission_ids is required"}), 400

    permission_ids = data["permission_ids"]
    if not isinstance(permission_ids, list) or not all(
        isinstance(pid, int) for pid in permission_ids
    ):
        daily_logger.warning(
            "Set role permissions rejected | reason=permission_ids must be a list of integers | status=400"
        )
        return jsonify({"error": "permission_ids must be a list of integers"}), 400
    daily_logger.debug(f"Permission IDs to assign: {permission_ids}")

    try:
        daily_logger.debug(
            f"Calling PermissionService.set_role_permissions | role_id={role_id} | permission_ids={permission_ids}"
        )
        role, error = PermissionService.set_role_permissions(role_id, permission_ids)
        if error:
            daily_logger.error(
                f"Set role permissions FAILED | role_id={role_id} | error={error} | status=404"
            )
            return jsonify({"error": error}), 404

        daily_logger.info(
            f"Set role permissions SUCCESS | role_id={role_id} | permission_count={len(permission_ids)} | status=200"
        )
        daily_logger.debug("=== SET ROLE PERMISSIONS END ===")
        return jsonify(
            {
                "message": "Permissions updated",
                "role": role.to_dict(include_permissions=True),
            }
        ), 200
    except Exception as e:
        daily_logger.error(
            f"Set role permissions EXCEPTION | role_id={role_id} | exception={type(e).__name__}: {e}"
        )
        daily_logger.error(f"Traceback:\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500


@role_bp.route("/roles/<int:role_id>/permissions/<int:permission_id>", methods=["POST"])
@permission_required("permissions.assign")
def add_role_permission(role_id, permission_id):
    """Add a permission to a role."""
    daily_logger.debug(
        f"=== ADD ROLE PERMISSION START | role_id={role_id} | permission_id={permission_id} ==="
    )
    try:
        daily_logger.debug(
            f"Calling PermissionService.assign_to_role | role_id={role_id} | permission_id={permission_id}"
        )
        role, error = PermissionService.assign_to_role(role_id, permission_id)
        if error:
            daily_logger.error(
                f"Add permission FAILED | role_id={role_id} | permission_id={permission_id} | error={error} | status=404"
            )
            return jsonify({"error": error}), 404

        daily_logger.info(
            f"Add permission SUCCESS | role_id={role_id} | permission_id={permission_id} | status=200"
        )
        daily_logger.debug("=== ADD ROLE PERMISSION END ===")
        return jsonify(
            {
                "message": "Permission added to role",
                "role": role.to_dict(include_permissions=True),
            }
        ), 200
    except Exception as e:
        daily_logger.error(
            f"Add permission EXCEPTION | role_id={role_id} | permission_id={permission_id} | exception={type(e).__name__}: {e}"
        )
        daily_logger.error(f"Traceback:\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500


@role_bp.route(
    "/roles/<int:role_id>/permissions/<int:permission_id>", methods=["DELETE"]
)
@permission_required("permissions.assign")
def remove_role_permission(role_id, permission_id):
    """Remove a permission from a role."""
    daily_logger.debug(
        f"=== REMOVE ROLE PERMISSION START | role_id={role_id} | permission_id={permission_id} ==="
    )
    try:
        daily_logger.debug(
            f"Calling PermissionService.remove_from_role | role_id={role_id} | permission_id={permission_id}"
        )
        role, error = PermissionService.remove_from_role(role_id, permission_id)
        if error:
            daily_logger.error(
                f"Remove permission FAILED | role_id={role_id} | permission_id={permission_id} | error={error} | status=404"
            )
            return jsonify({"error": error}), 404

        daily_logger.info(
            f"Remove permission SUCCESS | role_id={role_id} | permission_id={permission_id} | status=200"
        )
        daily_logger.debug("=== REMOVE ROLE PERMISSION END ===")
        return jsonify(
            {
                "message": "Permission removed from role",
                "role": role.to_dict(include_permissions=True),
            }
        ), 200
    except Exception as e:
        daily_logger.error(
            f"Remove permission EXCEPTION | role_id={role_id} | permission_id={permission_id} | exception={type(e).__name__}: {e}"
        )
        daily_logger.error(f"Traceback:\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500


@role_bp.route('/roles/<int:role_id>/users', methods=['GET'])
@permission_required('roles.view')
def get_role_users(role_id):
    '''Get all users with this role.'''
    daily_logger.debug(f'=== GET ROLE USERS START | role_id={role_id} ===')
    try:
        daily_logger.debug(f'Calling RoleService.get_by_id | role_id={role_id}')
        role = RoleService.get_by_id(role_id)
        if not role:
            daily_logger.warning(f'Get role users FAILED | role_id={role_id} | reason=not found | status=404')
            return jsonify({'error': 'Role not found'}), 404
        
        from src.api.services.user_service import UserService
        daily_logger.debug(f'Calling UserService.get_by_role | role_id={role_id}')
        users = UserService.get_by_role(role_id)
        
        daily_logger.info(f'Get role users SUCCESS | role_id={role_id} | user_count={len(users)} | status=200')
        daily_logger.debug('=== GET ROLE USERS END ===')
        return jsonify({'users': [u.to_dict() for u in users]}), 200
    except Exception as e:
        daily_logger.error(f'Get role users EXCEPTION | role_id={role_id} | exception={type(e).__name__}: {e}')
        daily_logger.error(f'Traceback:\n{traceback.format_exc()}')
        return jsonify({'error': 'Internal server error'}), 500

