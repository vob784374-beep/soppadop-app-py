import traceback
import os
from src.api.models import db, Role, Permission, User
from src.api.utils.logger import get_daily_logger

daily_logger = get_daily_logger()


DEFAULT_PERMISSIONS = [
    {
        "name": "users.view",
        "resource": "users",
        "action": "view",
        "description": "View user profiles",
    },
    {
        "name": "users.create",
        "resource": "users",
        "action": "create",
        "description": "Create new users",
    },
    {
        "name": "users.update",
        "resource": "users",
        "action": "update",
        "description": "Update user profiles",
    },
    {
        "name": "users.delete",
        "resource": "users",
        "action": "delete",
        "description": "Delete users",
    },
    {
        "name": "users.list",
        "resource": "users",
        "action": "list",
        "description": "List all users",
    },
    {
        "name": "roles.view",
        "resource": "roles",
        "action": "view",
        "description": "View roles",
    },
    {
        "name": "roles.create",
        "resource": "roles",
        "action": "create",
        "description": "Create roles",
    },
    {
        "name": "roles.update",
        "resource": "roles",
        "action": "update",
        "description": "Update roles",
    },
    {
        "name": "roles.delete",
        "resource": "roles",
        "action": "delete",
        "description": "Delete roles",
    },
    {
        "name": "permissions.view",
        "resource": "permissions",
        "action": "view",
        "description": "View permissions",
    },
    {
        "name": "permissions.assign",
        "resource": "permissions",
        "action": "assign",
        "description": "Assign permissions to roles",
    },
    {
        "name": "system.health",
        "resource": "system",
        "action": "health",
        "description": "Access health endpoints",
    },
    {
        "name": "system.admin",
        "resource": "system",
        "action": "admin",
        "description": "Full system administration",
    },
    {
        "name": "system.owner",
        "resource": "system",
        "action": "owner",
        "description": "Owner-only operations",
    },
    {
        "name": "resources.view",
        "resource": "resources",
        "action": "view",
        "description": "View resources",
    },
    {
        "name": "resources.upload",
        "resource": "resources",
        "action": "upload",
        "description": "Upload resources",
    },
    {
        "name": "resources.delete",
        "resource": "resources",
        "action": "delete",
        "description": "Delete resources",
    },
    {
        "name": "resources.download",
        "resource": "resources",
        "action": "download",
        "description": "Download resources",
    },
    {
        "name": "resources.stats",
        "resource": "resources",
        "action": "stats",
        "description": "View resource statistics",
    },
    {
        "name": "sections.view",
        "resource": "sections",
        "action": "view",
        "description": "View page sections",
    },
    {
        "name": "sections.create",
        "resource": "sections",
        "action": "create",
        "description": "Create new page sections",
    },
    {
        "name": "sections.update",
        "resource": "sections",
        "action": "update",
        "description": "Update page sections",
    },
    {
        "name": "sections.delete",
        "resource": "sections",
        "action": "delete",
        "description": "Delete page sections",
    },
    {
        "name": "sections.list",
        "resource": "sections",
        "action": "list",
        "description": "List all page sections",
    },
    {
        "name": "sections.publish",
        "resource": "sections",
        "action": "publish",
        "description": "Publish page sections",
    },
    {
        "name": "sections.unpublish",
        "resource": "sections",
        "action": "unpublish",
        "description": "Unpublish page sections",
    },
]

DEFAULT_ROLES = [
    {
        "name": "super_admin",
        "description": "Owner - highest authority, unique account",
        "is_system": True,
        "is_super_admin": True,
        "permissions": "ALL",
    },
    {
        "name": "admin",
        "description": "Administrator - full system access",
        "is_system": True,
        "is_super_admin": False,
        "permissions": [
            "users.view",
            "users.create",
            "users.update",
            "users.delete",
            "users.list",
            "roles.view",
            "roles.create",
            "roles.update",
            "roles.delete",
            "permissions.view",
            "permissions.assign",
            "system.health",
            "system.admin",
            "resources.view",
            "resources.upload",
            "resources.delete",
            "resources.download",
            "resources.stats",
            "sections.view",
            "sections.create",
            "sections.update",
            "sections.delete",
            "sections.list",
            "sections.publish",
            "sections.unpublish",
        ],
    },
    {
        "name": "manager",
        "description": "Manager - manage users and view roles",
        "is_system": True,
        "is_super_admin": False,
        "permissions": [
            "users.view",
            "users.create",
            "users.update",
            "users.list",
            "roles.view",
            "permissions.view",
            "system.health",
            "resources.view",
            "resources.upload",
            "resources.download",
            "resources.stats",
            "sections.view",
            "sections.create",
            "sections.update",
            "sections.list",
            "sections.publish",
            "sections.unpublish",
        ],
    },
    {
        "name": "client",
        "description": "Client - standard user access",
        "is_system": True,
        "is_super_admin": False,
        "permissions": [
            "users.view",
            "system.health",
            "resources.view",
            "resources.upload",
            "resources.download",
            "sections.view",
            "sections.list",
        ],
    },
]


def seed_roles_permissions():
    daily_logger.debug("seed_roles_permissions | START")
    perm_map = {}

    for perm_data in DEFAULT_PERMISSIONS:
        perm = Permission.query.filter_by(name=perm_data["name"]).first()
        if not perm:
            daily_logger.debug(
                f"seed_roles_permissions | creating permission | name={perm_data['name']}"
            )
            perm = Permission(**perm_data)
            db.session.add(perm)
        else:
            daily_logger.debug(
                f"seed_roles_permissions | permission already exists | name={perm_data['name']}"
            )
        perm_map[perm_data["name"]] = perm

    db.session.flush()
    daily_logger.debug(
        f"seed_roles_permissions | flushed | total_permissions={len(perm_map)}"
    )

    for role_data in DEFAULT_ROLES:
        role = Role.query.filter_by(name=role_data["name"]).first()
        if not role:
            daily_logger.debug(
                f"seed_roles_permissions | creating role | name={role_data['name']}"
            )
            role = Role(
                name=role_data["name"],
                description=role_data["description"],
                is_system=role_data["is_system"],
                is_super_admin=role_data["is_super_admin"],
            )
            db.session.add(role)
        else:
            daily_logger.debug(
                f"seed_roles_permissions | role already exists | name={role_data['name']}"
            )

        db.session.flush()

        current_perm_names = {p.name for p in role.permissions}
        daily_logger.debug(
            f"seed_roles_permissions | current permissions for role={role_data['name']} | count={len(current_perm_names)}"
        )

        if role_data["permissions"] == "ALL":
            all_perms = list(perm_map.values())
            assigned_count = 0
            for p in all_perms:
                if p.name not in current_perm_names:
                    role.permissions.append(p)
                    assigned_count += 1
            daily_logger.debug(
                f"seed_roles_permissions | assigned ALL permissions | role={role_data['name']} | new_assigned={assigned_count}"
            )
        else:
            assigned_count = 0
            for perm_name in role_data["permissions"]:
                if perm_name not in current_perm_names and perm_name in perm_map:
                    role.permissions.append(perm_map[perm_name])
                    assigned_count += 1
            daily_logger.debug(
                f"seed_roles_permissions | assigned permissions | role={role_data['name']} | new_assigned={assigned_count}"
            )

    db.session.commit()
    daily_logger.info(
        f"seed_roles_permissions | DONE | roles={len(DEFAULT_ROLES)} | permissions={len(DEFAULT_PERMISSIONS)}"
    )


def seed_super_admin():
    daily_logger.debug("seed_super_admin | START")
    existing_owner = User.query.filter_by(is_owner=True).first()
    if existing_owner:
        daily_logger.debug(
            f"seed_super_admin | owner already exists | user_id={existing_owner.id}"
        )
        return

    email = os.environ.get("SUPER_ADMIN_EMAIL", "owner@soppadop.com")
    username = os.environ.get("SUPER_ADMIN_USERNAME", "owner")
    password = os.environ.get("SUPER_ADMIN_PASSWORD", "")
    if not password:
        daily_logger.error(
            "seed_super_admin | SUPER_ADMIN_PASSWORD not set | cannot create owner"
        )
        return
    daily_logger.debug(
        f"seed_super_admin | creating super admin | email={email} | username={username}"
    )

    existing_email = User.query.filter_by(email=email).first()
    if existing_email:
        daily_logger.debug(
            f"seed_super_admin | email already exists | email={email} | skipping"
        )
        return

    super_admin_role = Role.query.filter_by(name="super_admin").first()
    if not super_admin_role:
        daily_logger.error(
            "seed_super_admin | super_admin role not found | cannot create owner"
        )
        return

    user = User(
        email=email,
        username=username,
        role_id=super_admin_role.id,
        is_owner=True,
        is_active=True,
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    daily_logger.info(
        f"seed_super_admin | DONE | user_id={user.id} | email={email} | username={username}"
    )


def run_all_seeds():
    daily_logger.debug("run_all_seeds | START")
    try:
        seed_roles_permissions()
        seed_super_admin()

        from src.api.seeds.layout_seed import seed_layouts

        seed_layouts()

        from src.api.seeds.section_seed import seed_sample_sections

        seed_sample_sections()

        daily_logger.info("run_all_seeds | DONE")
    except Exception as e:
        daily_logger.error(
            f"run_all_seeds | EXCEPTION | exception={type(e).__name__}: {e}"
        )
        daily_logger.error(f"Traceback:\n{traceback.format_exc()}")
        raise
