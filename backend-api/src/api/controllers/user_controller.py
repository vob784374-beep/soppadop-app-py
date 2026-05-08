from flask import Blueprint
from flask_jwt_extended import jwt_required
from src.api.services.user_service import UserService
from src.api.services.jwt_service import JWTService
from src.api.utils.decorators import owner_required, permission_required
from src.api.utils.response import success, error, paginate
from src.api.utils.request import get_json_body, get_json_fields, get_pagination
from src.api.utils.constants import Msg
from src.api.utils.logger import get_daily_logger
from src.api.models import User
from src.api.repositories.user_repository import UserRepository

log = get_daily_logger()
users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@users_bp.route("", methods=["GET"])
@permission_required("users.list")
def get_users():
    page, per_page = get_pagination()
    p = UserService.get_all(page, per_page)
    return success(paginate(p, "users"))


@users_bp.route("/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    user = UserRepository.get_by_id(user_id)
    if not user:
        return error(Msg.User.NOT_FOUND, 404)
    return success({"user": user.to_dict(include_attributes=True)})


@users_bp.route("/<int:user_id>", methods=["PATCH"])
@jwt_required()
def update_user(user_id):
    identity = JWTService.get_current_identity()
    if identity["role"] != "admin" and identity["id"] != user_id:
        return error(Msg.Permission.FORBIDDEN, 403)

    user = UserRepository.get_by_id(user_id)
    if not user:
        return error(Msg.User.NOT_FOUND, 404)

    data, err = get_json_body()
    if err:
        return error(err)

    user, err = UserService.update_user(user_id, **data)
    if err:
        return error(err)

    log.info(f"Update user SUCCESS | uid={user_id}")
    return success({"user": user.to_dict()}, Msg.User.USER_UPDATED)


@users_bp.route("/<int:user_id>", methods=["DELETE"])
@owner_required
def delete_user(user_id):
    user = UserRepository.get_by_id(user_id)
    ok, err = UserService.delete_user(user_id)
    if err:
        return error(err, 404 if "not found" in err.lower() else 400)

    log.info(f"Delete user SUCCESS | uid={user_id}")
    return success({"user": user.to_dict()}, Msg.User.USER_DELETED)


@users_bp.route("/me", methods=["GET"])
@jwt_required()
def get_own_profile():
    identity = JWTService.get_current_identity()
    user = UserRepository.get_by_id(identity["id"])
    return success({"user": user.to_dict(include_attributes=True)})


@users_bp.route("/me/username", methods=["PATCH"])
@jwt_required()
def update_own_username():
    identity = JWTService.get_current_identity()

    data, err = get_json_body()
    if err:
        return error(err)

    user, err = UserService.update_user(identity["id"], username=data["username"])
    if err:
        return error(err)

    log.info(f"Update username SUCCESS | uid={identity['id']}")
    return success({"user": user.to_dict()})
