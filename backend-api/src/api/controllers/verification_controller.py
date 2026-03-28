from flask import Blueprint, current_app
from flask_jwt_extended import jwt_required
from src.api.services.user_service import UserService
from src.api.services.jwt_service import JWTService
from src.api.services.verification_service import VerificationService
from src.api.utils.response import success, error
from src.api.utils.request import get_json_body
from src.api.utils.constants import Msg
from src.api.utils.logger import get_daily_logger
from src.api.models import db

log = get_daily_logger()
verify_bp = Blueprint("verification", __name__, url_prefix="/api/auth")


def _verification_response(code):
    dev = current_app.config.get("DEBUG", False)
    smtp = bool(
        current_app.config.get("SMTP_USER") and current_app.config.get("SMTP_PASSWORD")
    )

    if smtp:
        msg = Msg.Password.RESET_CODE_SENT_DEV if dev else Msg.Password.RESET_CODE_SENT
    else:
        msg = Msg.Password.SMTP_NOT_CONFIGURED

    resp = {"message": msg, "expires_in": Msg.Verification.EXPIRES_IN}
    if not smtp or dev:
        resp["verification_code"] = code
    return resp


def _get_user(identity):
    user = UserService.get_by_id(identity["id"])
    if not user:
        return None, Msg.User.NOT_FOUND
    return user, None


def _request_step1(identity, purpose, field, new_value, exists_fn):
    data, err = get_json_body()
    if err:
        return error(err)

    password = data.get("password")
    if not new_value or not password:
        return error(Msg.Request.FIELD_PASSWORD_REQUIRED.format(field=field))

    user, err = _get_user(identity)
    if err:
        return error(err, 404)

    if not user.check_password(password):
        return error(Msg.User.INCORRECT_PASSWORD, 401)

    if exists_fn(new_value, exclude_user_id=user.id):
        return error(f"{field.capitalize()} already exists")

    VerificationService.store_pending(
        user.email, purpose, {f"new_{field}": new_value, "user_id": user.id}
    )
    code, svc_err = VerificationService.send_code(user.email, purpose)
    if svc_err:
        return error(svc_err)

    log.info(f"{purpose} request | user_id={user.id}")
    return success(_verification_response(code))


def _verify_step2(identity, purpose, field):
    data, err = get_json_body()
    if err:
        return error(err)

    code = data.get("verification_code")
    if not code:
        return error(Msg.Verification.CODE_REQUIRED)

    user, err = _get_user(identity)
    if err:
        return error(err, 404)

    pending = VerificationService.get_pending(user.email, purpose)
    if not pending:
        return error(Msg.Verification.PENDING_NOT_FOUND.format(field=field))

    verified, svc_err, _ = VerificationService.verify_code(user.email, purpose, code)
    if not verified:
        return error(svc_err)

    setattr(user, field, pending[f"new_{field}"])
    db.session.commit()
    VerificationService.clear_pending(user.email, purpose)

    log.info(f"{purpose} verify SUCCESS | user_id={user.id}")
    msg_key = f"{field.upper()}_UPDATED"
    return success({"user": user.to_dict()}, getattr(Msg.User, msg_key))


# ============================================================
# RESET PASSWORD
# ============================================================


@verify_bp.route("/reset-password/request", methods=["POST"])
def reset_password_request():
    data, err = get_json_body()
    if err:
        return error(err)

    email = data.get("email")
    if not email:
        return error(Msg.Request.EMAIL_REQUIRED)

    code, svc_err = VerificationService.send_code(email, "reset_password")
    if svc_err:
        return error(svc_err)

    log.info(f"Reset password request | email={email}")
    return success(_verification_response(code))


@verify_bp.route("/reset-password/verify", methods=["POST"])
def reset_password_verify():
    data, err = get_json_body()
    if err:
        return error(err)

    email = data.get("email")
    code = data.get("verification_code")
    new_password = data.get("new_password")

    if not email or not code or not new_password:
        return error(
            Msg.Request.FIELDS_REQUIRED.format(
                fields="email, verification_code, new_password"
            )
        )
    if len(new_password) < 8:
        return error(Msg.Request.PASSWORD_MIN_LENGTH)

    verified, svc_err, _ = VerificationService.verify_code(
        email, "reset_password", code
    )
    if not verified:
        return error(svc_err)

    user, svc_err = UserService.reset_password(email, new_password)
    if svc_err:
        return error(svc_err)

    log.info(f"Reset password SUCCESS | user_id={user.id}")
    return success(message=Msg.Password.RESET_SUCCESS)


# ============================================================
# UPDATE EMAIL
# ============================================================


@verify_bp.route("/me/email/request", methods=["PUT"])
@jwt_required()
def update_email_request():
    identity = JWTService.get_current_identity()
    data, err = get_json_body()
    if err:
        return error(err)
    return _request_step1(
        identity, "update_email", "email", data.get("email"), UserService.email_exists
    )


@verify_bp.route("/me/email/verify", methods=["PUT"])
@jwt_required()
def update_email_verify():
    return _verify_step2(JWTService.get_current_identity(), "update_email", "email")


# ============================================================
# UPDATE USERNAME
# ============================================================


@verify_bp.route("/me/username/request", methods=["PUT"])
@jwt_required()
def update_username_request():
    identity = JWTService.get_current_identity()
    data, err = get_json_body()
    if err:
        return error(err)
    return _request_step1(
        identity,
        "update_username",
        "username",
        data.get("username"),
        UserService.username_exists,
    )


@verify_bp.route("/me/username/verify", methods=["PUT"])
@jwt_required()
def update_username_verify():
    return _verify_step2(
        JWTService.get_current_identity(), "update_username", "username"
    )
