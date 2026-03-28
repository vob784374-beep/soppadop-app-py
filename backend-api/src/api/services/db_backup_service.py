import os
import subprocess
import glob as glob_mod
from datetime import datetime, timezone
from flask import current_app
from src.api.utils.logger import get_daily_logger

daily_logger = get_daily_logger()


def _parse_db_url(url):
    from urllib.parse import urlparse

    parsed = urlparse(url)
    return {
        "host": parsed.hostname or "localhost",
        "port": parsed.port or 3306,
        "user": parsed.username or "root",
        "password": parsed.password or "",
        "database": parsed.path.lstrip("/") or "soppadop_db",
    }


def _log_action(filename, action, size, status, error, user_id):
    from src.api.models import db, BackupLog

    log = BackupLog(
        filename=filename,
        version=1,
        action=action,
        size=size or 0,
        status=status,
        error_message=error,
        created_by=user_id,
    )
    db.session.add(log)
    db.session.commit()
    return log


class DBBackupService:
    @classmethod
    def _ensure_dir(cls):
        backup_dir = current_app.config.get("BACKUP_DIR", "/app/backups")
        os.makedirs(backup_dir, exist_ok=True)
        return backup_dir

    @classmethod
    def create_backup(cls, user_id=None):
        backup_dir = cls._ensure_dir()
        db_cfg = _parse_db_url(current_app.config["SQLALCHEMY_DATABASE_URI"])
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"backup_{db_cfg['database']}_{timestamp}.sql"
        filepath = os.path.join(backup_dir, filename)

        cmd = [
            "mysqldump",
            f"--host={db_cfg['host']}",
            f"--port={db_cfg['port']}",
            f"--user={db_cfg['user']}",
            f"--password={db_cfg['password']}",
            "--skip-ssl",
            "--single-transaction",
            "--routines",
            "--triggers",
            db_cfg["database"],
        ]

        daily_logger.info(f"DBBackupService.create_backup | starting | file={filename}")

        try:
            with open(filepath, "w") as f:
                result = subprocess.run(
                    cmd, stdout=f, stderr=subprocess.PIPE, text=True, timeout=120
                )

            if result.returncode != 0:
                os.remove(filepath)
                err = result.stderr.strip()
                daily_logger.error(f"DBBackupService.create_backup | FAILED | {err}")
                _log_action(filename, "create", 0, "failed", err, user_id)
                return None, f"mysqldump failed: {err}"

            size = os.path.getsize(filepath)
            _log_action(filename, "create", size, "success", None, user_id)
            daily_logger.info(
                f"DBBackupService.create_backup | SUCCESS | file={filename} | size={size} bytes"
            )
            cls._cleanup_old(backup_dir, user_id)
            return {
                "filename": filename,
                "path": filepath,
                "size": size,
                "created_at": timestamp,
            }, None

        except subprocess.TimeoutExpired:
            if os.path.exists(filepath):
                os.remove(filepath)
            _log_action(filename, "create", 0, "failed", "Timeout 120s", user_id)
            return None, "Backup timed out after 120 seconds"
        except Exception as e:
            if os.path.exists(filepath):
                os.remove(filepath)
            _log_action(filename, "create", 0, "failed", str(e), user_id)
            daily_logger.error(
                f"DBBackupService.create_backup | EXCEPTION | {type(e).__name__}: {e}"
            )
            return None, str(e)

    @classmethod
    def list_backups(cls):
        from src.api.models import BackupLog

        backup_dir = cls._ensure_dir()
        files = sorted(
            glob_mod.glob(os.path.join(backup_dir, "backup_*.sql")), reverse=True
        )
        result = []
        for f in files:
            fname = os.path.basename(f)
            stat = os.stat(f)
            log_entry = (
                BackupLog.query.filter_by(
                    filename=fname, action="create", status="success"
                )
                .order_by(BackupLog.id.desc())
                .first()
            )
            result.append(
                {
                    "filename": fname,
                    "size": stat.st_size,
                    "created_at": datetime.fromtimestamp(stat.st_mtime).strftime(
                        "%Y-%m-%d %H:%M:%S"
                    ),
                    "created_by": log_entry.creator.username
                    if log_entry and log_entry.creator
                    else None,
                }
            )
        return result

    @classmethod
    def restore_backup(cls, filename, user_id=None):
        backup_dir = cls._ensure_dir()
        filepath = os.path.join(backup_dir, filename)

        if not os.path.exists(filepath):
            return None, "Backup file not found"
        if not filename.startswith("backup_") or not filename.endswith(".sql"):
            return None, "Invalid backup filename"

        db_cfg = _parse_db_url(current_app.config["SQLALCHEMY_DATABASE_URI"])
        cmd = [
            "mysql",
            f"--host={db_cfg['host']}",
            f"--port={db_cfg['port']}",
            f"--user={db_cfg['user']}",
            f"--password={db_cfg['password']}",
            "--skip-ssl",
            db_cfg["database"],
        ]

        daily_logger.info(
            f"DBBackupService.restore_backup | starting | file={filename}"
        )

        try:
            with open(filepath, "r") as f:
                result = subprocess.run(
                    cmd, stdin=f, stderr=subprocess.PIPE, text=True, timeout=300
                )

            if result.returncode != 0:
                err = result.stderr.strip()
                _log_action(
                    filename,
                    "restore",
                    os.path.getsize(filepath),
                    "failed",
                    err,
                    user_id,
                )
                daily_logger.error(f"DBBackupService.restore_backup | FAILED | {err}")
                return None, f"mysql restore failed: {err}"

            _log_action(
                filename, "restore", os.path.getsize(filepath), "success", None, user_id
            )
            daily_logger.info(
                f"DBBackupService.restore_backup | SUCCESS | file={filename}"
            )
            return {
                "filename": filename,
                "restored_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            }, None

        except subprocess.TimeoutExpired:
            _log_action(filename, "restore", 0, "failed", "Timeout 300s", user_id)
            return None, "Restore timed out after 300 seconds"
        except Exception as e:
            _log_action(filename, "restore", 0, "failed", str(e), user_id)
            daily_logger.error(
                f"DBBackupService.restore_backup | EXCEPTION | {type(e).__name__}: {e}"
            )
            return None, str(e)

    @classmethod
    def delete_backup(cls, filename, user_id=None):
        backup_dir = cls._ensure_dir()
        filepath = os.path.join(backup_dir, filename)

        if not os.path.exists(filepath):
            return False, "Backup file not found"
        if not filename.startswith("backup_") or not filename.endswith(".sql"):
            return False, "Invalid backup filename"

        size = os.path.getsize(filepath)
        os.remove(filepath)
        _log_action(filename, "delete", size, "success", None, user_id)
        daily_logger.info(f"DBBackupService.delete_backup | deleted | file={filename}")
        return True, None

    @classmethod
    def get_logs(cls):
        from src.api.models import BackupLog

        return BackupLog.query.order_by(BackupLog.id.desc()).all()

    @classmethod
    def _cleanup_old(cls, backup_dir, user_id=None):
        retention = current_app.config.get("BACKUP_RETENTION", 30)
        files = sorted(glob_mod.glob(os.path.join(backup_dir, "backup_*.sql")))
        if len(files) > retention:
            for f in files[: len(files) - retention]:
                fname = os.path.basename(f)
                size = os.path.getsize(f)
                os.remove(f)
                _log_action(
                    fname, "cleanup", size, "success", "retention limit", user_id
                )
                daily_logger.info(f"DBBackupService._cleanup_old | removed | {fname}")
