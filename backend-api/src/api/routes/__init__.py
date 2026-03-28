from src.api.controllers.auth_controller import auth_bp
from src.api.routes.health import register_health_routes

__all__ = ["auth_bp", "register_health_routes"]
