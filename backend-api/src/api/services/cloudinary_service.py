import os
import re
import uuid
import cloudinary
import cloudinary.uploader
import cloudinary.api
from flask import current_app
from datetime import datetime, timezone
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()

ALLOWED_EXTENSIONS = {
    "image": {"jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "tiff"},
    "video": {"mp4", "avi", "mov", "wmv", "flv", "mkv", "webm", "m4v", "3gp"},
    "document": {
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "csv",
        "ppt",
        "pptx",
        "txt",
        "rtf",
        "odt",
        "ods",
    },
    "archive": {"zip", "rar", "7z", "tar", "gz", "bz2"},
}

MAX_FILE_SIZE = 100 * 1024 * 1024


def _get_resource_type(ext):
    if ext in ALLOWED_EXTENSIONS["image"]:
        return "image"
    if ext in ALLOWED_EXTENSIONS["video"]:
        return "video"
    return "raw"


def _get_file_type(ext):
    for ftype, exts in ALLOWED_EXTENSIONS.items():
        if ext in exts:
            return ftype
    return "other"


def _sanitize_folder_name(name):
    name = name.strip().lower()
    name = re.sub(r"[^a-z0-9\-_/]", "-", name)
    name = re.sub(r"-+", "-", name)
    return name.strip("-")


def _build_cloudinary_path(collection, folder, filename):
    parts = ["soppadop"]
    if collection and collection != "default":
        parts.append(_sanitize_folder_name(collection))
    if folder:
        parts.append(_sanitize_folder_name(folder))
    safe_name = re.sub(r"[^a-zA-Z0-9._-]", "_", filename)
    uid = uuid.uuid4().hex[:8]
    name, ext = os.path.splitext(safe_name)
    return "/".join(parts), f"{name}_{uid}{ext}"


def init_cloudinary():
    cloudinary.config(
        cloud_name=current_app.config.get("CLOUDINARY_CLOUD_NAME", ""),
        api_key=current_app.config.get("CLOUDINARY_API_KEY", ""),
        api_secret=current_app.config.get("CLOUDINARY_API_SECRET", ""),
        secure=True,
    )


def upload_file(file, collection="default", folder="general"):
    init_cloudinary()
    original_name = file.filename or "unnamed"
    ext = original_name.rsplit(".", 1)[-1].lower() if "." in original_name else ""

    if not ext:
        return None, "File has no extension"

    resource_type = _get_resource_type(ext)
    file_type = _get_file_type(ext)
    cloudinary_folder, safe_filename = _build_cloudinary_path(
        collection, folder, original_name
    )

    try:
        result = cloudinary.uploader.upload(
            file,
            folder=cloudinary_folder,
            public_id=os.path.splitext(safe_filename)[0],
            resource_type=resource_type,
            use_filename=False,
            unique_filename=False,
            overwrite=False,
        )
        log.info(
            f"Cloudinary upload | public_id={result['public_id']} | folder={cloudinary_folder}"
        )
        return {
            "cloudinary_url": result["secure_url"],
            "cloudinary_public_id": result["public_id"],
            "resource_type": resource_type,
            "file_type": file_type,
            "size": result.get("bytes", 0),
            "format": result.get("format", ext),
            "width": result.get("width"),
            "height": result.get("height"),
            "version": result.get("version"),
            "filename": safe_filename,
            "cloudinary_folder": cloudinary_folder,
        }, None
    except Exception as e:
        log.error(f"Cloudinary upload failed | error={e}")
        return None, f"Upload failed: {str(e)}"


def delete_file(public_id, resource_type="raw"):
    init_cloudinary()
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        log.info(f"Cloudinary delete | public_id={public_id} | result={result}")
        return result.get("result") == "ok", None
    except Exception as e:
        log.error(f"Cloudinary delete failed | public_id={public_id} | error={e}")
        return None, f"Delete failed: {str(e)}"


def list_folders(path="soppadop"):
    init_cloudinary()
    try:
        result = cloudinary.api.subfolders(path)
        folders = []
        for f in result.get("subfolders", []):
            folders.append(
                {
                    "name": os.path.basename(f["path"]),
                    "path": f["path"],
                }
            )
        return folders, None
    except Exception as e:
        if "not found" in str(e).lower():
            return [], None
        log.error(f"Cloudinary list_folders failed | path={path} | error={e}")
        return None, f"List folders failed: {str(e)}"


def create_folder(path):
    init_cloudinary()
    try:
        cloudinary.api.create_folder(path)
        log.info(f"Cloudinary create_folder | path={path}")
        return True, None
    except Exception as e:
        log.error(f"Cloudinary create_folder failed | path={path} | error={e}")
        return None, f"Create folder failed: {str(e)}"


def rename_file(public_id, new_public_id, resource_type="raw"):
    init_cloudinary()
    try:
        result = cloudinary.uploader.rename(
            public_id, new_public_id, resource_type=resource_type
        )
        log.info(f"Cloudinary rename | {public_id} -> {new_public_id}")
        return {
            "cloudinary_url": result["secure_url"],
            "cloudinary_public_id": result["public_id"],
        }, None
    except Exception as e:
        log.error(f"Cloudinary rename failed | error={e}")
        return None, f"Rename failed: {str(e)}"


def list_resources_in_folder(path="soppadop", resource_type="image", max_results=50):
    init_cloudinary()
    try:
        result = cloudinary.api.resources(
            type="upload",
            prefix=path,
            resource_type=resource_type,
            max_results=max_results,
        )
        return result.get("resources", []), None
    except Exception as e:
        log.error(f"Cloudinary list_resources | error={e}")
        return None, str(e)


# ───────────── Cloudinary Collections API ─────────────


def create_collection(name):
    init_cloudinary()
    try:
        result = cloudinary.api.create_collection(name)
        log.info(f"Cloudinary create_collection | name={name}")
        return result, None
    except Exception as e:
        if "already exists" in str(e).lower():
            return {"name": name}, None
        log.error(f"Cloudinary create_collection failed | name={name} | error={e}")
        return None, f"Create collection failed: {str(e)}"


def list_collections():
    init_cloudinary()
    try:
        result = cloudinary.api.collections(max_results=100)
        collections = []
        for c in result.get("collections", []):
            collections.append(
                {
                    "name": c.get("name"),
                    "total_count": c.get("total_count", 0),
                }
            )
        return collections, None
    except Exception as e:
        log.error(f"Cloudinary list_collections failed | error={e}")
        return None, f"List collections failed: {str(e)}"


def add_to_collection(collection_name, public_ids):
    init_cloudinary()
    if not public_ids:
        return True, None
    try:
        result = cloudinary.api.add_assets_to_collection(collection_name, public_ids)
        log.info(
            f"Cloudinary add_to_collection | collection={collection_name} | count={len(public_ids)}"
        )
        return result, None
    except Exception as e:
        log.error(f"Cloudinary add_to_collection failed | error={e}")
        return None, f"Add to collection failed: {str(e)}"


# ───────────── Cloudinary Account & Usage ─────────────


def get_account_info():
    init_cloudinary()
    try:
        result = cloudinary.api.usage()
        plan = result.get("plan", "Free")
        credits = result.get("credits", {})
        storage = result.get("storage", {})
        bandwidth = result.get("bandwidth", {})
        requests = result.get("requests", 0)
        resources = result.get("resources", 0)
        transformations = result.get("transformations", {})
        objects = result.get("objects", {})

        return {
            "plan": plan,
            "cloud_name": current_app.config.get("CLOUDINARY_CLOUD_NAME", ""),
            "credits": {
                "used": credits.get("usage", 0),
                "limit": credits.get("limit", 0),
                "used_percent": round(
                    credits.get("usage", 0) / max(credits.get("limit", 1), 1) * 100, 1
                )
                if credits.get("limit")
                else 0,
            },
            "storage": {
                "used_bytes": storage.get("usage", 0),
                "limit_bytes": storage.get("limit", 0),
                "used_percent": round(
                    storage.get("usage", 0) / max(storage.get("limit", 1), 1) * 100, 1
                )
                if storage.get("limit")
                else 0,
            },
            "bandwidth": {
                "used_bytes": bandwidth.get("usage", 0),
                "limit_bytes": bandwidth.get("limit", 0),
                "used_percent": round(
                    bandwidth.get("usage", 0) / max(bandwidth.get("limit", 1), 1) * 100,
                    1,
                )
                if bandwidth.get("limit")
                else 0,
            },
            "transformations": {
                "used": transformations.get("usage", 0),
                "limit": transformations.get("limit", 0),
                "used_percent": round(
                    transformations.get("usage", 0)
                    / max(transformations.get("limit", 1), 1)
                    * 100,
                    1,
                )
                if transformations.get("limit")
                else 0,
            },
            "objects": {
                "used": objects.get("usage", 0),
                "limit": objects.get("limit", 0),
            },
            "requests": requests,
            "resources": resources,
        }, None
    except Exception as e:
        log.error(f"Cloudinary get_account_info failed | error={e}")
        return None, f"Get account info failed: {str(e)}"
