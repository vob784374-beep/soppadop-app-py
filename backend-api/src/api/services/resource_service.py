from src.api.repositories.resource_repository import ResourceRepository
from src.api.services.cloudinary_service import (
    upload_file,
    delete_file,
    list_folders as cloudinary_list_folders,
    create_folder as cloudinary_create_folder,
    rename_file as cloudinary_rename,
    create_collection as cloudinary_create_collection,
    list_collections as cloudinary_list_collections,
    add_to_collection as cloudinary_add_to_collection,
)
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()

ALLOWED_EXTENSIONS = {
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "svg",
    "bmp",
    "ico",
    "tiff",
    "mp4",
    "avi",
    "mov",
    "wmv",
    "flv",
    "mkv",
    "webm",
    "m4v",
    "3gp",
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
    "zip",
    "rar",
    "7z",
    "tar",
    "gz",
    "bz2",
}


class ResourceService:
    @staticmethod
    def upload(
        file,
        user_id,
        collection="default",
        folder="general",
        display_name=None,
        description=None,
        tags=None,
    ):
        original_name = file.filename or "unnamed"
        ext = original_name.rsplit(".", 1)[-1].lower() if "." in original_name else ""

        if ext not in ALLOWED_EXTENSIONS:
            return None, f"File type '.{ext}' is not allowed"

        cloud_data, err = upload_file(file, collection=collection, folder=folder)
        if err:
            return None, err

        name = display_name or original_name.rsplit(".", 1)[0]

        resource = ResourceRepository.create(
            {
                "display_name": name,
                "filename": cloud_data["filename"],
                "original_name": original_name,
                "file_type": cloud_data["file_type"],
                "mime_type": file.content_type or "application/octet-stream",
                "size": cloud_data["size"],
                "cloudinary_url": cloud_data["cloudinary_url"],
                "cloudinary_public_id": cloud_data["cloudinary_public_id"],
                "resource_type": cloud_data["resource_type"],
                "collection": collection,
                "folder": folder,
                "format": cloud_data.get("format"),
                "width": cloud_data.get("width"),
                "height": cloud_data.get("height"),
                "version": cloud_data.get("version"),
                "description": description,
                "tags": tags,
                "uploaded_by": user_id,
            }
        )

        if collection and collection != "default":
            cloudinary_create_collection(collection)
            cloudinary_add_to_collection(
                collection, [cloud_data["cloudinary_public_id"]]
            )

        log.info(
            f"ResourceService.upload | id={resource.id} | file={original_name} | collection={collection} | folder={folder}"
        )
        return resource, None

    @staticmethod
    def get_list(
        page=1,
        per_page=20,
        file_type=None,
        collection=None,
        folder=None,
        search=None,
        uploaded_by=None,
    ):
        pagination = ResourceRepository.find_all(
            page=page,
            per_page=per_page,
            file_type=file_type,
            collection=collection,
            folder=folder,
            search=search,
            uploaded_by=uploaded_by,
        )
        return {
            "resources": [r.to_dict() for r in pagination.items],
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }, None

    @staticmethod
    def get_by_id(resource_id):
        resource = ResourceRepository.find_by_id(resource_id)
        if not resource:
            return None, "Resource not found"
        return resource, None

    @staticmethod
    def update(
        resource_id,
        user_id,
        display_name=None,
        description=None,
        tags=None,
        collection=None,
        folder=None,
    ):
        resource = ResourceRepository.find_by_id(resource_id)
        if not resource:
            return None, "Resource not found"

        data = {}
        if display_name is not None:
            data["display_name"] = display_name
        if description is not None:
            data["description"] = description
        if tags is not None:
            data["tags"] = tags
        if collection is not None:
            data["collection"] = collection
        if folder is not None:
            data["folder"] = folder

        updated = ResourceRepository.update(resource_id, data)
        log.info(f"ResourceService.update | id={resource_id} | by={user_id}")
        return updated, None

    @staticmethod
    def delete(resource_id, user_id):
        resource = ResourceRepository.find_by_id(resource_id)
        if not resource:
            return None, "Resource not found"

        ok, err = delete_file(
            resource.cloudinary_public_id,
            resource_type=resource.resource_type,
        )
        if err:
            log.warning(f"ResourceService.delete | cloudinary error | {err}")

        ResourceRepository.delete(resource)
        log.info(
            f"ResourceService.delete | id={resource_id} | file={resource.original_name} | by={user_id}"
        )
        return True, None

    @staticmethod
    def download(resource_id):
        resource = ResourceRepository.find_by_id(resource_id)
        if not resource:
            return None, "Resource not found"
        ResourceRepository.increment_download(resource_id)
        return resource.cloudinary_url, None

    @staticmethod
    def get_collections():
        return ResourceRepository.get_collections(), None

    @staticmethod
    def get_folders(collection=None):
        return ResourceRepository.get_folders(collection), None

    @staticmethod
    def list_cloudinary_folders(path="soppadop"):
        return cloudinary_list_folders(path)

    @staticmethod
    def create_cloudinary_folder(path):
        return cloudinary_create_folder(path)

    @staticmethod
    def get_stats():
        return ResourceRepository.get_stats(), None

    @staticmethod
    def list_cloudinary_collections():
        return cloudinary_list_collections()

    @staticmethod
    def create_cloudinary_collection(name):
        return cloudinary_create_collection(name)

    @staticmethod
    def add_to_cloudinary_collection(collection_name, public_ids):
        return cloudinary_add_to_collection(collection_name, public_ids)

    @staticmethod
    def format_size(bytes_val):
        if bytes_val < 1024:
            return f"{bytes_val} B"
        if bytes_val < 1024 * 1024:
            return f"{bytes_val / 1024:.1f} KB"
        if bytes_val < 1024 * 1024 * 1024:
            return f"{bytes_val / (1024 * 1024):.1f} MB"
        return f"{bytes_val / (1024 * 1024 * 1024):.1f} GB"
