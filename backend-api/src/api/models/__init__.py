from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from src.api.models.role import Role, Permission, role_permissions  # noqa: E402
from src.api.models.user import User  # noqa: E402
from src.api.models.user_attributes import UserAttribute, ResourceAttribute  # noqa: E402
from src.api.models.policy_rule import PolicyRule  # noqa: E402
from src.api.models.backup_log import BackupLog  # noqa: E402
from src.api.models.resource import Resource  # noqa: E402
from src.api.models.page_section import PageSection  # noqa: E402
from src.api.models.section_content import SectionContent  # noqa: E402

__all__ = [
    "db",
    "User",
    "Role",
    "Permission",
    "role_permissions",
    "UserAttribute",
    "ResourceAttribute",
    "PolicyRule",
    "BackupLog",
    "Resource",
    "PageSection",
    "SectionContent",
]
