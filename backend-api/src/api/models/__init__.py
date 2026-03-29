from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from src.api.models.role import Role, Permission, role_permissions  # noqa: E402
from src.api.models.user import User  # noqa: E402
from src.api.models.backup_log import BackupLog  # noqa: E402
from src.api.models.resource import Resource  # noqa: E402
from src.api.models.cv import (
    CV,
    CVEducation,
    CVExperience,
    CVSkill,
    CVProject,
    CVCertification,
)  # noqa: E402

__all__ = [
    "db",
    "User",
    "Role",
    "Permission",
    "role_permissions",
    "BackupLog",
    "Resource",
    "CV",
    "CVEducation",
    "CVExperience",
    "CVSkill",
    "CVProject",
    "CVCertification",
]
