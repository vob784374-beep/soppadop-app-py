from src.api.repositories.role_repository import RoleRepository, PermissionRepository
from src.api.utils.logger import get_daily_logger

daily_logger = get_daily_logger()


class RoleService:
    @staticmethod
    def create(name, description=None):
        daily_logger.debug(
            f"RoleService.create | name={name} | description={description}"
        )

        daily_logger.debug(f"RoleService.create | checking name_exists | name={name}")
        if RoleRepository.name_exists(name):
            daily_logger.warning(
                f"RoleService.create | name already exists | name={name}"
            )
            return None, "Role name already exists"

        if name == "super_admin":
            daily_logger.warning(f"RoleService.create | rejected super_admin creation")
            return None, "Cannot create super_admin role"

        daily_logger.debug(f"RoleService.create | creating role | name={name}")
        role = RoleRepository.create(name, description)
        daily_logger.debug(f"RoleService.create | role created | role_id={role.id}")
        return role, None

    @staticmethod
    def get_by_id(role_id):
        daily_logger.debug(f"RoleService.get_by_id | role_id={role_id}")
        role = RoleRepository.get_by_id(role_id)
        if role:
            daily_logger.debug(
                f"RoleService.get_by_id | found | role_id={role.id} | name={role.name}"
            )
        else:
            daily_logger.debug(f"RoleService.get_by_id | not found | role_id={role_id}")
        return role

    @staticmethod
    def get_all():
        daily_logger.debug("RoleService.get_all")
        roles = RoleRepository.get_all()
        daily_logger.debug(f"RoleService.get_all | returned {len(roles)} roles")
        return roles

    @staticmethod
    def update(role_id, **kwargs):
        daily_logger.debug(
            f"RoleService.update | role_id={role_id} | fields={list(kwargs.keys())}"
        )

        role = RoleRepository.get_by_id(role_id)
        if not role:
            daily_logger.warning(
                f"RoleService.update | role not found | role_id={role_id}"
            )
            return None, "Role not found"

        if role.is_super_admin:
            daily_logger.warning(
                f"RoleService.update | rejected: cannot modify super_admin role | role_id={role_id}"
            )
            return None, "Cannot modify super_admin role"

        if "name" in kwargs and kwargs["name"] != role.name:
            daily_logger.debug(
                f"RoleService.update | name change requested | old={role.name} | new={kwargs['name']}"
            )
            if role.is_system:
                daily_logger.warning(
                    f"RoleService.update | rejected: cannot rename system role | role_id={role_id}"
                )
                return None, "Cannot rename system role"
            if kwargs["name"] == "super_admin":
                daily_logger.warning(
                    f"RoleService.update | rejected: cannot rename to super_admin"
                )
                return None, "Cannot rename to super_admin"
            if RoleRepository.name_exists(kwargs["name"]):
                daily_logger.warning(
                    f"RoleService.update | rejected: name already exists | name={kwargs['name']}"
                )
                return None, "Role name already exists"

        role = RoleRepository.update(role, **kwargs)
        daily_logger.debug(
            f"RoleService.update | updated successfully | role_id={role_id}"
        )
        return role, None

    @staticmethod
    def delete(role_id):
        daily_logger.debug(f"RoleService.delete | role_id={role_id}")
        role = RoleRepository.get_by_id(role_id)
        if not role:
            daily_logger.warning(
                f"RoleService.delete | role not found | role_id={role_id}"
            )
            return False, "Role not found"
        if role.is_super_admin:
            daily_logger.warning(
                f"RoleService.delete | rejected: cannot delete super_admin role | role_id={role_id}"
            )
            return False, "Cannot delete super_admin role"

        daily_logger.debug(
            f"RoleService.delete | deleting role | role_id={role_id} | name={role.name}"
        )
        result = RoleRepository.delete(role)
        daily_logger.debug(
            f"RoleService.delete | deleted successfully | role_id={role_id}"
        )
        return result


class PermissionService:
    @staticmethod
    def get_all():
        daily_logger.debug("PermissionService.get_all")
        permissions = PermissionRepository.get_all()
        daily_logger.debug(
            f"PermissionService.get_all | returned {len(permissions)} permissions"
        )
        return permissions

    @staticmethod
    def get_by_resource(resource):
        daily_logger.debug(f"PermissionService.get_by_resource | resource={resource}")
        return PermissionRepository.get_by_resource(resource)

    @staticmethod
    def assign_to_role(role_id, permission_id):
        daily_logger.debug(
            f"PermissionService.assign_to_role | role_id={role_id} | permission_id={permission_id}"
        )

        daily_logger.debug(
            f"PermissionService.assign_to_role | looking up role | role_id={role_id}"
        )
        role = RoleRepository.get_by_id(role_id)
        if not role:
            daily_logger.warning(
                f"PermissionService.assign_to_role | role not found | role_id={role_id}"
            )
            return None, "Role not found"
        if role.is_super_admin:
            daily_logger.warning(
                f"PermissionService.assign_to_role | rejected: cannot modify super_admin | role_id={role_id}"
            )
            return None, "Cannot modify super_admin permissions"

        daily_logger.debug(
            f"PermissionService.assign_to_role | looking up permission | permission_id={permission_id}"
        )
        permission = PermissionRepository.get_by_id(permission_id)
        if not permission:
            daily_logger.warning(
                f"PermissionService.assign_to_role | permission not found | permission_id={permission_id}"
            )
            return None, "Permission not found"
        daily_logger.debug(
            f"PermissionService.assign_to_role | permission found | name={permission.name}"
        )

        role = PermissionRepository.assign_to_role(role, permission)
        daily_logger.debug(
            f"PermissionService.assign_to_role | assigned successfully | role_id={role_id} | permission_id={permission_id}"
        )
        return role, None

    @staticmethod
    def remove_from_role(role_id, permission_id):
        daily_logger.debug(
            f"PermissionService.remove_from_role | role_id={role_id} | permission_id={permission_id}"
        )

        daily_logger.debug(
            f"PermissionService.remove_from_role | looking up role | role_id={role_id}"
        )
        role = RoleRepository.get_by_id(role_id)
        if not role:
            daily_logger.warning(
                f"PermissionService.remove_from_role | role not found | role_id={role_id}"
            )
            return None, "Role not found"
        if role.is_super_admin:
            daily_logger.warning(
                f"PermissionService.remove_from_role | rejected: cannot modify super_admin | role_id={role_id}"
            )
            return None, "Cannot modify super_admin permissions"

        daily_logger.debug(
            f"PermissionService.remove_from_role | looking up permission | permission_id={permission_id}"
        )
        permission = PermissionRepository.get_by_id(permission_id)
        if not permission:
            daily_logger.warning(
                f"PermissionService.remove_from_role | permission not found | permission_id={permission_id}"
            )
            return None, "Permission not found"

        role = PermissionRepository.remove_from_role(role, permission)
        daily_logger.debug(
            f"PermissionService.remove_from_role | removed successfully | role_id={role_id} | permission_id={permission_id}"
        )
        return role, None

    @staticmethod
    def set_role_permissions(role_id, permission_ids):
        daily_logger.debug(
            f"PermissionService.set_role_permissions | role_id={role_id} | permission_ids={permission_ids}"
        )

        daily_logger.debug(
            f"PermissionService.set_role_permissions | looking up role | role_id={role_id}"
        )
        role = RoleRepository.get_by_id(role_id)
        if not role:
            daily_logger.warning(
                f"PermissionService.set_role_permissions | role not found | role_id={role_id}"
            )
            return None, "Role not found"
        if role.is_super_admin:
            daily_logger.warning(
                f"PermissionService.set_role_permissions | rejected: cannot modify super_admin | role_id={role_id}"
            )
            return None, "Cannot modify super_admin permissions"

        role = PermissionRepository.set_role_permissions(role, permission_ids)
        daily_logger.debug(
            f"PermissionService.set_role_permissions | completed | role_id={role_id} | count={len(permission_ids)}"
        )
        return role, None
