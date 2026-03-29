from src.api.controllers.auth_controller import auth_bp
from src.api.controllers.verification_controller import verify_bp
from src.api.controllers.role_controller import role_bp
from src.api.controllers.backup_controller import backup_bp
from src.api.controllers.resource_controller import resource_bp
from src.api.controllers.cv_controller import cv_bp

__all__ = ["auth_bp", "verify_bp", "role_bp", "backup_bp", "resource_bp", "cv_bp"]
