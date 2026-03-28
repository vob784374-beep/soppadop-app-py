from flask import Blueprint, request, g
from src.api.services.resource_service import ResourceService
from src.api.utils.decorators import auth_required
from src.api.utils.response import success, error
from src.api.utils.request import get_json_body
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()
resource_bp = Blueprint("resource", __name__, url_prefix="/api/resources")


def _uid():
    return g.current_user.id if hasattr(g, "current_user") else None


# ───────────────────── Upload ─────────────────────
@resource_bp.route("", methods=["POST"])
@auth_required
def upload_resource():
    if "file" not in request.files:
        return error("No file provided", 400)

    file = request.files["file"]
    if file.filename == "" or file.filename is None:
        return error("No file selected", 400)

    collection = request.form.get("collection", "default")
    folder = request.form.get("folder", "general")
    display_name = request.form.get("display_name")
    description = request.form.get("description")
    tags = request.form.get("tags")

    resource, err = ResourceService.upload(
        file=file,
        user_id=_uid(),
        collection=collection,
        folder=folder,
        display_name=display_name,
        description=description,
        tags=tags,
    )
    if err:
        return error(err, 400)

    return success(
        {"resource": resource.to_dict()}, "Resource uploaded successfully", 201
    )


# ───────────────────── List ─────────────────────
@resource_bp.route("", methods=["GET"])
@auth_required
def list_resources():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    file_type = request.args.get("file_type")
    collection = request.args.get("collection")
    folder = request.args.get("folder")
    search = request.args.get("search")

    result, err = ResourceService.get_list(
        page=page,
        per_page=per_page,
        file_type=file_type,
        collection=collection,
        folder=folder,
        search=search,
    )
    if err:
        return error(err, 500)
    return success(result)


# ───────────────────── Get ─────────────────────
@resource_bp.route("/<int:resource_id>", methods=["GET"])
@auth_required
def get_resource(resource_id):
    resource, err = ResourceService.get_by_id(resource_id)
    if err:
        return error(err, 404)
    return success({"resource": resource.to_dict()})


# ───────────────────── Update ─────────────────────
@resource_bp.route("/<int:resource_id>", methods=["PATCH"])
@auth_required
def update_resource(resource_id):
    data, err = get_json_body()
    if err:
        return error(err, 400)

    resource, err = ResourceService.update(
        resource_id,
        user_id=_uid(),
        display_name=data.get("display_name"),
        description=data.get("description"),
        tags=data.get("tags"),
        collection=data.get("collection"),
        folder=data.get("folder"),
    )
    if err:
        return error(err, 404)
    return success({"resource": resource.to_dict()}, "Resource updated")


# ───────────────────── Delete ─────────────────────
@resource_bp.route("/<int:resource_id>", methods=["DELETE"])
@auth_required
def delete_resource(resource_id):
    ok, err = ResourceService.delete(resource_id, user_id=_uid())
    if err:
        status = 404 if "not found" in err.lower() else 500
        return error(err, status)
    return success(message="Resource deleted successfully")


# ───────────────────── Download ─────────────────────
@resource_bp.route("/<int:resource_id>/download", methods=["GET"])
@auth_required
def download_resource(resource_id):
    url, err = ResourceService.download(resource_id)
    if err:
        return error(err, 404)
    return success({"download_url": url})


# ───────────────────── Collections (from DB) ─────────────────────
@resource_bp.route("/collections", methods=["GET"])
@auth_required
def list_collections():
    collections, err = ResourceService.get_collections()
    if err:
        return error(err, 500)
    return success({"collections": collections})


# ───────────────────── Folders ─────────────────────
@resource_bp.route("/folders", methods=["GET"])
@auth_required
def list_folders():
    collection = request.args.get("collection")
    folders, err = ResourceService.get_folders(collection)
    if err:
        return error(err, 500)
    return success({"folders": folders})


# ───────────────────── Cloudinary Folders ─────────────────────
@resource_bp.route("/cloudinary-folders", methods=["GET"])
@auth_required
def list_cloudinary_folders():
    path = request.args.get("path", "soppadop")
    folders, err = ResourceService.list_cloudinary_folders(path)
    if err:
        return error(err, 500)
    return success({"folders": folders})


@resource_bp.route("/cloudinary-folders", methods=["POST"])
@auth_required
def create_cloudinary_folder():
    data, err = get_json_body()
    if err:
        return error(err, 400)
    path = data.get("path")
    if not path:
        return error("path is required", 400)

    ok, err = ResourceService.create_cloudinary_folder(path)
    if err:
        return error(err, 400)
    return success(message="Folder created successfully")


# ───────────────────── Stats ─────────────────────
@resource_bp.route("/stats", methods=["GET"])
@auth_required
def resource_stats():
    stats, err = ResourceService.get_stats()
    if err:
        return error(err, 500)
    return success({"stats": stats})


# ───────────────────── Cloudinary Account ─────────────────────
@resource_bp.route("/account", methods=["GET"])
@auth_required
def cloudinary_account():
    from src.api.services.cloudinary_service import get_account_info

    info, err = get_account_info()
    if err:
        return error(err, 500)
    return success({"account": info})
