import time
import uuid
from flask import g, request
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()

SENSITIVE_FIELDS = {
    "password",
    "password_hash",
    "token",
    "access_token",
    "refresh_token",
    "secret",
}


class LoggingMiddleware:
    @staticmethod
    def before_request():
        g.request_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
        g.request_start_time = time.time()
        body = None
        if request.is_json:
            raw = request.get_json(silent=True)
            if isinstance(raw, dict):
                body = {
                    k: ("***" if k in SENSITIVE_FIELDS else v) for k, v in raw.items()
                }
            else:
                body = raw
        log.debug(
            f"REQUEST START | {request.method} {request.path} | "
            f"remote={request.remote_addr} | content_type={request.content_type} | "
            f"body={body}"
        )

    @staticmethod
    def after_request(response):
        duration = (time.time() - g.get("request_start_time", time.time())) * 1000
        rid = g.get("request_id", "-")
        log.info(
            f"REQUEST END | {request.method} {request.path} | "
            f"status={response.status_code} | duration={duration:.2f}ms | "
            f"content_length={response.content_length}"
        )
        response.headers["X-Request-ID"] = rid
        response.headers["X-Response-Time"] = f"{duration:.2f}ms"
        return response
