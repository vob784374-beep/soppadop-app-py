from flask import jsonify, g
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
    verify_jwt_in_request,
)
from src.api.models import db, User
from src.api.utils.constants import Msg
from src.api.utils.logger import get_daily_logger

daily_logger = get_daily_logger()


class JWTService:
    _instance = None
    _jwt_manager = None
    _blocklist = set()

    @classmethod
    def init(cls, app):
        cls._jwt_manager = JWTManager(app)
        cls._register_callbacks()
        cls._register_error_handlers(app)
        daily_logger.debug("JWTService | initialized")

    @classmethod
    def _register_callbacks(cls):
        @cls._jwt_manager.token_in_blocklist_loader
        def check_if_token_revoked(jwt_header, jwt_payload):
            return jwt_payload["jti"] in cls._blocklist

        @cls._jwt_manager.expired_token_loader
        def expired_token_callback(jwt_header, jwt_payload):
            return jsonify({"error": Msg.General.TOKEN_EXPIRED}), 401

        @cls._jwt_manager.invalid_token_loader
        def invalid_token_callback(error):
            return jsonify({"error": Msg.General.INVALID_TOKEN}), 401

        @cls._jwt_manager.unauthorized_loader
        def missing_token_callback(error):
            return jsonify({"error": Msg.General.AUTH_REQUIRED}), 401

        @cls._jwt_manager.revoked_token_loader
        def revoked_token_callback(jwt_header, jwt_payload):
            return jsonify({"error": Msg.General.TOKEN_REVOKED}), 401

        @cls._jwt_manager.needs_fresh_token_loader
        def needs_fresh_callback(jwt_header, jwt_payload):
            return jsonify({"error": Msg.General.FRESH_TOKEN_REQUIRED}), 401

    @classmethod
    def _register_error_handlers(cls, app):
        @app.errorhandler(422)
        def handle_unprocessable_entity(error):
            return jsonify({"error": "Unprocessable request"}), 422

    # --- Token Creation ---

    @classmethod
    def create_tokens(cls, user):
        identity = str(user.id)
        additional_claims = {"role": user.role.name if user.role else None}
        access_token = create_access_token(
            identity=identity,
            additional_claims=additional_claims,
        )
        refresh_token = create_refresh_token(
            identity=identity,
            additional_claims=additional_claims,
        )
        daily_logger.debug(
            f"JWTService.create_tokens | user_id={user.id} | role={user.role.name if user.role else None}"
        )
        return access_token, refresh_token

    @classmethod
    def refresh_access_token(cls):
        identity = get_jwt_identity()
        claims = get_jwt()
        role = claims.get("role")
        access_token = create_access_token(
            identity=identity,
            additional_claims={"role": role},
        )
        daily_logger.debug(f"JWTService.refresh_access_token | user_id={identity}")
        return access_token

    # --- Token Revocation ---

    @classmethod
    def revoke_token(cls):
        claims = get_jwt()
        jti = claims["jti"]
        cls._blocklist.add(jti)
        daily_logger.debug(f"JWTService.revoke_token | jti={jti}")

    # --- Identity Extraction ---

    @classmethod
    def get_current_identity(cls):
        identity = get_jwt_identity()
        claims = get_jwt()
        return {
            "id": int(identity),
            "role": claims.get("role"),
        }

    @classmethod
    def get_current_user(cls):
        identity = cls.get_current_identity()
        user = db.session.get(User, identity["id"])
        if user:
            g.current_user = user
        return user

    # --- Auth Verification ---

    @classmethod
    def verify_access(cls, optional=False):
        try:
            verify_jwt_in_request(optional=optional)
            return True
        except Exception as e:
            daily_logger.debug(
                f"JWTService.verify_access | FAILED | {type(e).__name__}: {e}"
            )
            return False
