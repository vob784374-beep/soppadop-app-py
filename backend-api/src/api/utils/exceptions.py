import traceback
from flask import jsonify, request
from werkzeug.exceptions import HTTPException
from src.api.utils.constants import Msg
from src.api.utils.logger import get_daily_logger


class AppException(Exception):
    def __init__(self, message, status_code=400, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv["error"] = self.message
        return rv


class NotFoundException(AppException):
    def __init__(self, message=None):
        super().__init__(message or Msg.User.NOT_FOUND, status_code=404)


class UnauthorizedException(AppException):
    def __init__(self, message=None):
        super().__init__(message or Msg.General.AUTH_REQUIRED, status_code=401)


class ForbiddenException(AppException):
    def __init__(self, message=None):
        super().__init__(message or Msg.Permission.FORBIDDEN, status_code=403)


class ConflictException(AppException):
    def __init__(self, message=None):
        super().__init__(message or Msg.User.EMAIL_EXISTS, status_code=409)


def register_error_handlers(app):
    log = get_daily_logger()

    @app.errorhandler(AppException)
    def handle_app_exception(e):
        log.error(
            f"AppException | {request.method} {request.path} | {e.message} | {e.status_code}"
        )
        return jsonify(e.to_dict()), e.status_code

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify(
            {"error": str(e.description) if e.description else "Bad request"}
        ), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "Method not allowed"}), 405

    @app.errorhandler(415)
    def unsupported_media_type(e):
        return jsonify({"error": "Content-Type must be application/json"}), 415

    @app.errorhandler(422)
    def unprocessable(e):
        return jsonify({"error": "Unprocessable request"}), 422

    @app.errorhandler(429)
    def too_many_requests(e):
        return jsonify(
            {"error": str(e.description) if e.description else "Too many requests"}
        ), 429

    @app.errorhandler(500)
    def internal_error(e):
        log.error(f"500 | {request.method} {request.path} | {type(e).__name__}: {e}")
        log.error(f"Traceback:\n{traceback.format_exc()}")
        return jsonify({"error": Msg.General.INTERNAL_ERROR}), 500

    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        return jsonify({"error": e.description or str(e)}), e.code

    @app.errorhandler(Exception)
    def handle_unexpected(e):
        log.error(
            f"Unhandled | {request.method} {request.path} | {type(e).__name__}: {e}"
        )
        log.error(f"Traceback:\n{traceback.format_exc()}")
        return jsonify({"error": Msg.General.INTERNAL_ERROR}), 500
