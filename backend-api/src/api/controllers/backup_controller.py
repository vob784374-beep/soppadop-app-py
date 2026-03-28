from flask import Blueprint, send_file, current_app
from src.api.services.db_backup_service import DBBackupService
from src.api.utils.decorators import owner_required
from src.api.utils.response import success, error
from src.api.utils.request import get_json_fields
from src.api.utils.logger import get_daily_logger
from flask import g
import os

log = get_daily_logger()
backup_bp = Blueprint("backup", __name__, url_prefix="/api/backup")


def _uid():
    return g.current_user.id if hasattr(g, "current_user") else None


@backup_bp.route("/create", methods=["POST"])
@owner_required
def create_backup():
    result, err = DBBackupService.create_backup(user_id=_uid())
    if err:
        return error(err, 500)
    log.info(f"Backup created | file={result['filename']} | by={_uid()}")
    return success({"backup": result}, "Backup created successfully", 201)


@backup_bp.route("/list", methods=["GET"])
@owner_required
def list_backups():
    backups = DBBackupService.list_backups()
    return success({"backups": backups, "total": len(backups)})


@backup_bp.route("/restore", methods=["POST"])
@owner_required
def restore_backup():
    data, err = get_json_fields("filename")
    if err:
        return error(err)
    result, err = DBBackupService.restore_backup(data["filename"], user_id=_uid())
    if err:
        return error(err, 500)
    log.info(f"Backup restored | file={data['filename']} | by={_uid()}")
    return success({"restore": result}, "Database restored successfully")


@backup_bp.route("/delete", methods=["DELETE"])
@owner_required
def delete_backup():
    data, err = get_json_fields("filename")
    if err:
        return error(err)
    ok, err = DBBackupService.delete_backup(data["filename"], user_id=_uid())
    if not ok:
        return error(err, 404)
    log.info(f"Backup deleted | file={data['filename']} | by={_uid()}")
    return success(message="Backup deleted successfully")


@backup_bp.route("/download/<filename>", methods=["GET"])
@owner_required
def download_backup(filename):
    backup_dir = current_app.config.get("BACKUP_DIR", "/app/backups")
    filepath = os.path.join(backup_dir, filename)
    if not os.path.exists(filepath):
        return error("Backup file not found", 404)
    if not filename.startswith("backup_") or not filename.endswith(".sql"):
        return error("Invalid filename", 400)
    return send_file(filepath, as_attachment=True, download_name=filename)


@backup_bp.route("/logs", methods=["GET"])
@owner_required
def backup_logs():
    """List all backup/restore/delete history."""
    logs = DBBackupService.get_logs()
    return success({"logs": [l.to_dict() for l in logs], "total": len(logs)})
