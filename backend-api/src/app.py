import time
import uuid
import traceback
from flask import Flask, request, g
from flask_cors import CORS
from src.config import config
from src.api.models import db
from src.api.extensions import limiter
from src.api.services.jwt_service import JWTService
from src.api.utils.logger import setup_logging, get_daily_logger
from src.api.utils.exceptions import register_error_handlers
from src.api.routes.health import register_health_routes
from src.api.docs import register_docs
import os


def _init_database(app):
    log = get_daily_logger()
    daily_logger = get_daily_logger()

    inspector = db.inspect(db.engine)
    existing_tables = inspector.get_table_names()

    if not existing_tables:
        daily_logger.info("First run detected | creating tables + seeding")
        db.create_all()
        from src.api.seeds import run_all_seeds

        run_all_seeds()
        daily_logger.info("Database initialized with fresh data")
        return

    backup_dir = app.config.get("BACKUP_DIR", "/app/backups")
    if not os.path.isdir(backup_dir):
        daily_logger.info("No backup directory | using existing data")
        return

    import glob

    backups = sorted(glob.glob(os.path.join(backup_dir, "backup_*.sql")), reverse=True)
    if not backups:
        daily_logger.info("No backup files found | using existing data")
        return

    latest = os.path.basename(backups[0])
    daily_logger.info(f"Restoring from latest backup | file={latest}")

    from src.api.services.db_backup_service import DBBackupService

    result, err = DBBackupService.restore_backup(latest)
    if err:
        daily_logger.error(f"Backup restore failed | {err} | using existing data")
    else:
        daily_logger.info(f"Backup restored successfully | file={latest}")


def create_app(config_name=None):
    if config_name is None:
        flask_debug = os.environ.get("FLASK_DEBUG", "").lower()
        if flask_debug in ("1", "true", "yes"):
            config_name = "development"
        elif os.environ.get("FLASK_ENV") == "testing":
            config_name = "testing"
        else:
            config_name = os.environ.get("FLASK_ENV", "production")

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
    )

    JWTService.init(app)

    limiter.init_app(app)

    db.init_app(app)

    setup_logging(app)
    app.logger.info(f"App starting | environment={config_name}")

    daily_logger = get_daily_logger()

    SENSITIVE_FIELDS = {
        "password",
        "password_hash",
        "token",
        "access_token",
        "refresh_token",
        "secret",
    }

    @app.before_request
    def log_request_start():
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
        daily_logger.debug(
            f"REQUEST START | {request.method} {request.path} | remote={request.remote_addr} | content_type={request.content_type} | body={body}"
        )

    @app.after_request
    def log_request_end(response):
        duration = time.time() - g.get("request_start_time", time.time())
        duration_ms = round(duration * 1000, 2)
        level = "info" if response.status_code < 400 else "warning"
        response.headers["X-Request-ID"] = g.get("request_id", "-")
        getattr(daily_logger, level)(
            f"REQUEST END | {request.method} {request.path} | status={response.status_code} | duration={duration_ms}ms | content_length={response.content_length}"
        )
        return response

    @app.teardown_request
    def log_request_teardown(exc):
        if exc is not None:
            daily_logger.error(
                f"REQUEST TEARDOWN | {request.method} {request.path} | exception={type(exc).__name__}: {exc}"
            )
            daily_logger.error(f"Traceback:\n{traceback.format_exc()}")

    register_error_handlers(app)
    register_health_routes(app)

    with app.app_context():
        from src.api.controllers import (
            auth_bp,
            verify_bp,
            role_bp,
            backup_bp,
            resource_bp,
            cv_bp,
        )

        app.register_blueprint(auth_bp)
        app.register_blueprint(verify_bp)
        app.register_blueprint(role_bp)
        app.register_blueprint(backup_bp)
        app.register_blueprint(resource_bp)
        app.register_blueprint(cv_bp)

        _init_database(app)

    register_docs(app)

    return app


if __name__ == "__main__":
    app = create_app()
    debug_mode = os.environ.get("FLASK_DEBUG", "").lower() in ("1", "true", "yes")
    app.run(host="0.0.0.0", port=5000, debug=debug_mode)
