from src.api.models import db, Resource
from sqlalchemy import func
from src.api.utils.query_builder import QueryBuilder
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()


class ResourceRepository:
    @staticmethod
    def create(data):
        resource = Resource(**data)
        db.session.add(resource)
        db.session.commit()
        log.debug(
            f"ResourceRepository.create | id={resource.id} | file={resource.original_name}"
        )
        return resource

    @staticmethod
    def find_by_id(resource_id):
        return db.session.get(Resource, resource_id)

    @staticmethod
    def find_by_public_id(public_id):
        return Resource.query.filter_by(cloudinary_public_id=public_id).first()

    @staticmethod
    def find_all(
        page=1,
        per_page=20,
        filters=None,
        search=None,
        sorts=None,
        file_type=None,
        collection=None,
        folder=None,
        uploaded_by=None,
    ):
        qb = QueryBuilder(Resource)

        # Legacy params support
        if file_type:
            qb.filter("file_type", file_type)
        if collection:
            qb.filter("collection", collection)
        if folder:
            qb.filter("folder", folder)
        if uploaded_by:
            qb.filter("uploaded_by", uploaded_by)

        # New flexible filters
        if filters:
            qb.filter_many(filters)

        # Search
        if search and search.get("keyword"):
            qb.search(
                search.get("fields", ["original_name", "display_name", "description"]),
                search["keyword"],
            )

        # Sorts
        if sorts:
            qb.sort_by(sorts)
        else:
            qb.sort("created_at", "desc")

        return qb.paginate(page, per_page).execute()

    @staticmethod
    def delete(resource):
        db.session.delete(resource)
        db.session.commit()
        log.debug(f"ResourceRepository.delete | id={resource.id}")

    @staticmethod
    def update(resource_id, data):
        resource = db.session.get(Resource, resource_id)
        if not resource:
            return None
        for key, value in data.items():
            if hasattr(resource, key) and value is not None:
                setattr(resource, key, value)
        db.session.commit()
        return resource

    @staticmethod
    def increment_download(resource_id):
        resource = db.session.get(Resource, resource_id)
        if resource:
            resource.download_count += 1
            db.session.commit()

    @staticmethod
    def get_collections():
        results = (
            db.session.query(Resource.collection, func.count(Resource.id))
            .group_by(Resource.collection)
            .all()
        )
        return [{"name": r[0] or "default", "count": r[1]} for r in results]

    @staticmethod
    def get_folders(collection=None):
        query = db.session.query(
            Resource.folder, func.count(Resource.id), func.sum(Resource.size)
        )
        if collection:
            query = query.filter(Resource.collection == collection)
        results = query.group_by(Resource.folder).all()
        return [
            {
                "name": r[0] or "general",
                "file_count": r[1],
                "total_size": r[2] or 0,
            }
            for r in results
        ]

    @staticmethod
    def get_stats():
        total = Resource.query.count()
        total_size = db.session.query(func.sum(Resource.size)).scalar() or 0
        type_counts = (
            db.session.query(Resource.file_type, func.count(Resource.id))
            .group_by(Resource.file_type)
            .all()
        )
        collection_counts = (
            db.session.query(Resource.collection, func.count(Resource.id))
            .group_by(Resource.collection)
            .all()
        )
        return {
            "total_files": total,
            "total_size": total_size,
            "by_type": {t: c for t, c in type_counts},
            "by_collection": {c or "default": n for c, n in collection_counts},
        }
