import traceback
from flask import jsonify, request
from src.api.utils.logger import get_daily_logger

daily_logger = get_daily_logger()


def health_check():
    """Health check endpoint."""
    daily_logger.debug(f"health_check | path={request.path} | method={request.method}")
    daily_logger.info("health_check | status=healthy | status=200")
    return jsonify({"status": "healthy", "service": "backend-api"}), 200


def readiness_check():
    """Readiness check endpoint."""
    daily_logger.debug(
        f"readiness_check | path={request.path} | method={request.method}"
    )
    from src.api.models import db

    try:
        db.session.execute(db.text("SELECT 1"))
        daily_logger.info("readiness_check | DB query OK | status=ready | status=200")
        return jsonify({"status": "ready"}), 200
    except Exception as e:
        daily_logger.error(
            f"readiness_check | DB query FAILED | exception={type(e).__name__}: {e} | status=503"
        )
        daily_logger.error(f"Traceback:\n{traceback.format_exc()}")
        return jsonify({"status": "not ready"}), 503


def register_health_routes(app):
    daily_logger.debug(
        "register_health_routes | registering /api/health and /api/health/ready"
    )
    app.add_url_rule("/api/health", view_func=health_check)
    app.add_url_rule("/api/health/ready", view_func=readiness_check)
    daily_logger.debug("register_health_routes | registered successfully")
