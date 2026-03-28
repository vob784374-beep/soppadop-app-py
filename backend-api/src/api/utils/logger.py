import os
import glob
import time
import logging
from datetime import datetime
from logging.handlers import RotatingFileHandler
from flask import g


_daily_logger = None


def _ensure_dir(path):
    os.makedirs(path, exist_ok=True)


class RequestIDFilter(logging.Filter):
    def filter(self, record):
        try:
            record.request_id = getattr(g, "request_id", "-")
        except RuntimeError:
            record.request_id = "-"
        return True


class DailyFileHandler(logging.Handler):
    def __init__(
        self, log_dir, prefix="daily-log", retention_days=30, encoding="utf-8"
    ):
        super().__init__()
        self.log_dir = log_dir
        self.prefix = prefix
        self.retention_days = retention_days
        self.encoding = encoding
        self.current_date = None
        self.file_handler = None
        self._switch_file()

    def _get_filename(self, date_str):
        return os.path.join(self.log_dir, f"{self.prefix}-{date_str}.log")

    def _switch_file(self):
        today = datetime.now().strftime("%Y-%m-%d")
        if today == self.current_date:
            return
        if self.file_handler:
            self.file_handler.close()
        self.current_date = today
        filename = self._get_filename(today)
        self.file_handler = logging.FileHandler(filename, encoding=self.encoding)
        self.file_handler.setFormatter(self.formatter)
        self.file_handler.setLevel(self.level)
        self._cleanup_old_files()

    def _cleanup_old_files(self):
        pattern = os.path.join(self.log_dir, f"{self.prefix}-*.log")
        files = glob.glob(pattern)
        cutoff = datetime.now().timestamp() - (self.retention_days * 86400)
        for f in files:
            if os.path.getmtime(f) < cutoff:
                try:
                    os.remove(f)
                except OSError:
                    pass

    def emit(self, record):
        self._switch_file()
        self.file_handler.emit(record)

    def setFormatter(self, fmt):
        super().setFormatter(fmt)
        if self.file_handler:
            self.file_handler.setFormatter(fmt)

    def setLevel(self, level):
        super().setLevel(level)
        if self.file_handler:
            self.file_handler.setLevel(level)

    def close(self):
        if self.file_handler:
            self.file_handler.close()
        super().close()


def setup_logging(app):
    global _daily_logger

    log_level = getattr(logging, app.config.get("LOG_LEVEL", "INFO").upper())
    base_dir = os.environ.get("LOG_DIR", "/app/logs")
    _ensure_dir(base_dir)

    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s in %(module)s [%(request_id)s]: %(message)s"
    )

    # --- app.log: system / config level (RotatingFileHandler) ---
    app_log_max_bytes = app.config.get("LOG_FILE_MAX_BYTES", 10 * 1024 * 1024)
    app_log_backup = app.config.get("LOG_FILE_BACKUP_COUNT", 10)

    file_handler = RotatingFileHandler(
        os.path.join(base_dir, "app.log"),
        maxBytes=app_log_max_bytes,
        backupCount=app_log_backup,
        encoding="utf-8",
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(log_level)

    # --- console handler ---
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)

    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    app.logger.setLevel(log_level)

    request_id_filter = RequestIDFilter()
    file_handler.addFilter(request_id_filter)
    console_handler.addFilter(request_id_filter)

    # --- daily logs: one file per day (e.g. daily-log-2026-03-27.log) ---
    daily_dir = os.path.join(base_dir, "daily")
    _ensure_dir(daily_dir)

    daily_retention = app.config.get("LOG_DAILY_RETENTION_DAYS", 30)

    daily_formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s | %(name)s | %(module)s.%(funcName)s:%(lineno)d | rid=%(request_id)s | %(message)s"
    )

    daily_handler = DailyFileHandler(
        log_dir=daily_dir,
        prefix="daily-log",
        retention_days=daily_retention,
        encoding="utf-8",
    )
    daily_handler.setFormatter(daily_formatter)
    daily_handler.setLevel(logging.DEBUG)
    daily_handler.addFilter(request_id_filter)

    _daily_logger = logging.getLogger("daily")
    _daily_logger.setLevel(logging.DEBUG)
    _daily_logger.addHandler(daily_handler)
    _daily_logger.propagate = False

    return app.logger


def get_daily_logger():
    logger = logging.getLogger("daily")
    if not logger.handlers:
        logger.setLevel(logging.DEBUG)
        handler = logging.StreamHandler()
        handler.setFormatter(
            logging.Formatter("[%(asctime)s] %(levelname)s | %(name)s | %(message)s")
        )
        logger.addHandler(handler)
    return logger
