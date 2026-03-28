from src.api.models import db, Role, Permission
from src.api.utils.logger import get_daily_logger

daily_logger = get_daily_logger()


class RoleRepository:
    @staticmethod
    def create(name, description=None, is_system=False):
        daily_logger.debug(
            f"RoleRepository.create | name={name} | description={description} | is_system={is_system}"
        )
        role = Role(name=name, description=description, is_system=is_system)
        db.session.add(role)
        daily_logger.debug(f"RoleRepository.create | session.add done")
        db.session.commit()
        daily_logger.debug(f"RoleRepository.create | commit done | role_id={role.id}")
        return role

    @staticmethod
    def get_by_id(role_id):
        daily_logger.debug(f"RoleRepository.get_by_id | role_id={role_id}")
        role = db.session.get(Role, role_id)
        daily_logger.debug(
            f"RoleRepository.get_by_id | result={'found role_id=' + str(role.id) + ' name=' + role.name if role else 'None'}"
        )
        return role

    @staticmethod
    def get_by_name(name):
        daily_logger.debug(f"RoleRepository.get_by_name | name={name}")
        role = Role.query.filter_by(name=name).first()
        daily_logger.debug(
            f"RoleRepository.get_by_name | result={'found role_id=' + str(role.id) if role else 'None'}"
        )
        return role

    @staticmethod
    def get_all():
        daily_logger.debug(f"RoleRepository.get_all")
        roles = Role.query.order_by(Role.name).all()
        daily_logger.debug(f"RoleRepository.get_all | returned {len(roles)} roles")
        return roles

    @staticmethod
    def update(role, **kwargs):
        daily_logger.debug(
            f"RoleRepository.update | role_id={role.id} | fields={list(kwargs.keys())}"
        )
        for key, value in kwargs.items():
            if hasattr(role, key) and key not in ("id", "is_system"):
                setattr(role, key, value)
                daily_logger.debug(
                    f"RoleRepository.update | field set | role_id={role.id} | {key}={value}"
                )
        db.session.commit()
        daily_logger.debug(f"RoleRepository.update | commit done | role_id={role.id}")
        return role

    @staticmethod
    def delete(role):
        daily_logger.debug(
            f"RoleRepository.delete | role_id={role.id} | name={role.name} | is_system={role.is_system}"
        )
        if role.is_system:
            daily_logger.warning(
                f"RoleRepository.delete | rejected: system role | role_id={role.id}"
            )
            return False, "Cannot delete system role"
        db.session.delete(role)
        daily_logger.debug(
            f"RoleRepository.delete | session.delete done | role_id={role.id}"
        )
        db.session.commit()
        daily_logger.debug(f"RoleRepository.delete | commit done | role_id={role.id}")
        return True, None

    @staticmethod
    def name_exists(name):
        daily_logger.debug(f"RoleRepository.name_exists | name={name}")
        exists = Role.query.filter_by(name=name).first() is not None
        daily_logger.debug(
            f"RoleRepository.name_exists | result={exists} | name={name}"
        )
        return exists


class PermissionRepository:
    @staticmethod
    def get_all():
        daily_logger.debug(f"PermissionRepository.get_all")
        permissions = Permission.query.order_by(
            Permission.resource, Permission.action
        ).all()
        daily_logger.debug(
            f"PermissionRepository.get_all | returned {len(permissions)} permissions"
        )
        return permissions

    @staticmethod
    def get_by_id(perm_id):
        daily_logger.debug(f"PermissionRepository.get_by_id | perm_id={perm_id}")
        perm = db.session.get(Permission, perm_id)
        daily_logger.debug(
            f"PermissionRepository.get_by_id | result={'found perm_id=' + str(perm.id) + ' name=' + perm.name if perm else 'None'}"
        )
        return perm

    @staticmethod
    def get_by_name(name):
        daily_logger.debug(f"PermissionRepository.get_by_name | name={name}")
        perm = Permission.query.filter_by(name=name).first()
        daily_logger.debug(
            f"PermissionRepository.get_by_name | result={'found perm_id=' + str(perm.id) if perm else 'None'}"
        )
        return perm

    @staticmethod
    def get_by_resource(resource):
        daily_logger.debug(
            f"PermissionRepository.get_by_resource | resource={resource}"
        )
        permissions = Permission.query.filter_by(resource=resource).all()
        daily_logger.debug(
            f"PermissionRepository.get_by_resource | returned {len(permissions)} permissions for resource={resource}"
        )
        return permissions

    @staticmethod
    def assign_to_role(role, permission):
        daily_logger.debug(
            f"PermissionRepository.assign_to_role | role_id={role.id} | permission_id={permission.id}"
        )
        if permission not in role.permissions:
            role.permissions.append(permission)
            db.session.commit()
            daily_logger.debug(
                f"PermissionRepository.assign_to_role | assigned | role_id={role.id} | permission_id={permission.id}"
            )
        else:
            daily_logger.debug(
                f"PermissionRepository.assign_to_role | already assigned | role_id={role.id} | permission_id={permission.id}"
            )
        return role

    @staticmethod
    def remove_from_role(role, permission):
        daily_logger.debug(
            f"PermissionRepository.remove_from_role | role_id={role.id} | permission_id={permission.id}"
        )
        if permission in role.permissions:
            role.permissions.remove(permission)
            db.session.commit()
            daily_logger.debug(
                f"PermissionRepository.remove_from_role | removed | role_id={role.id} | permission_id={permission.id}"
            )
        else:
            daily_logger.debug(
                f"PermissionRepository.remove_from_role | not assigned | role_id={role.id} | permission_id={permission.id}"
            )
        return role

    @staticmethod
    def set_role_permissions(role, permission_ids):
        daily_logger.debug(
            f"PermissionRepository.set_role_permissions | role_id={role.id} | permission_ids={permission_ids}"
        )
        permissions = Permission.query.filter(Permission.id.in_(permission_ids)).all()
        daily_logger.debug(
            f"PermissionRepository.set_role_permissions | found {len(permissions)} permissions from {len(permission_ids)} requested ids"
        )
        role.permissions = permissions
        db.session.commit()
        daily_logger.debug(
            f"PermissionRepository.set_role_permissions | commit done | role_id={role.id}"
        )
        return role
