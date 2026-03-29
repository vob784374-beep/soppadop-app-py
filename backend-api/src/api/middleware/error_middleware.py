from flask import jsonify
from werkzeug.exceptions import HTTPException
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()


class ErrorMiddleware:
    @staticmethod
    def handle_http_error(e):
        log.warning(f"HTTP Error | {e.code} | {e.description}")
        return jsonify({"error": e.description}), e.code

    @staticmethod
    def handle_generic_error(e):
        log.error(f"Unhandled Exception | {type(e).__name__}: {e}")
        return jsonify({"error": "Internal server error"}), 500

    @staticmethod
    def register_handlers(app):
        app.register_error_handler(HTTPException, ErrorMiddleware.handle_http_error)
        app.register_error_handler(Exception, ErrorMiddleware.handle_generic_error)
