import traceback
from functools import wraps
from flask import request, jsonify, g
from src.api.models import db, User
from src.api.utils.constants import Msg
from src.api.utils.logger import get_daily_logger

daily_logger = get_daily_logger()


def _get_current_user_from_jwt():
    from src.api.services.jwt_service import JWTService

    if not JWTService.verify_access():
        return None
    identity = JWTService.get_current_identity()
    user = db.session.get(User, identity["id"])
    return user


def owner_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            user = _get_current_user_from_jwt()
            if not user:
                return jsonify({"error": Msg.Permission.OWNER_REQUIRED}), 403
            if not user.is_owner:
                return jsonify({"error": Msg.Permission.OWNER_REQUIRED}), 403
            if not user.is_active:
                return jsonify(
                    {"error": Msg.Auth.ACCOUNT_LOCKED.format(minutes=0, seconds=0)}
                ), 401
            g.current_user = user
            return fn(*args, **kwargs)
        except Exception as e:
            daily_logger.error(f"owner_required | EXCEPTION | {type(e).__name__}: {e}")
            raise

    return wrapper


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            user = _get_current_user_from_jwt()
            if not user:
                return jsonify({"error": Msg.Permission.ADMIN_REQUIRED}), 403
            if not user.role or user.role.name != "admin":
                return jsonify({"error": Msg.Permission.ADMIN_REQUIRED}), 403
            if not user.is_active:
                return jsonify({"error": Msg.General.AUTH_REQUIRED}), 401
            g.current_user = user
            return fn(*args, **kwargs)
        except Exception as e:
            daily_logger.error(f"admin_required | EXCEPTION | {type(e).__name__}: {e}")
            raise

    return wrapper


def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            user = _get_current_user_from_jwt()
            if not user:
                return jsonify({"error": Msg.General.AUTH_REQUIRED}), 401
            if not user.is_active:
                return jsonify({"error": Msg.General.AUTH_REQUIRED}), 401
            g.current_user = user
            g.current_user_id = user.id
            g.current_user_role = user.role.name if user.role else None
            return fn(*args, **kwargs)
        except Exception as e:
            daily_logger.error(f"auth_required | EXCEPTION | {type(e).__name__}: {e}")
            raise

    return wrapper


def permission_required(*permission_names):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                user = _get_current_user_from_jwt()
                if not user:
                    return jsonify({"error": Msg.General.AUTH_REQUIRED}), 401
                if not user.is_active:
                    return jsonify({"error": Msg.General.AUTH_REQUIRED}), 401
                if not user.role:
                    return jsonify({"error": Msg.Permission.INSUFFICIENT}), 403
                if user.role.name == "admin":
                    g.current_user = user
                    return fn(*args, **kwargs)
                if not user.has_any_permission(*permission_names):
                    return jsonify(
                        {
                            "error": Msg.Permission.INSUFFICIENT,
                            "required": list(permission_names),
                        }
                    ), 403
                g.current_user = user
                return fn(*args, **kwargs)
            except Exception as e:
                daily_logger.error(
                    f"permission_required | EXCEPTION | {type(e).__name__}: {e}"
                )
                raise

        return wrapper

    return decorator


def json_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 415
        return fn(*args, **kwargs)

    return wrapper
