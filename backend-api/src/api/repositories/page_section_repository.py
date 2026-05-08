from src.api.models import db, PageSection, SectionContent
from src.api.utils.query_builder import QueryBuilder
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()


class PageSectionRepository:
    @staticmethod
    def create(data):
        section = PageSection(**data)
        db.session.add(section)
        db.session.commit()
        log.debug(
            f"PageSectionRepository.create | id={section.id} | title={section.title}"
        )
        return section

    @staticmethod
    def find_by_id(section_id):
        return db.session.get(PageSection, section_id)

    @staticmethod
    def find_all(
        page=1,
        per_page=50,
        filters=None,
        search=None,
        sorts=None,
        visible_only=False,
        section_type=None,
    ):
        qb = QueryBuilder(PageSection)

        # Legacy params support
        if visible_only:
            qb.filter("is_visible", True)
        if section_type:
            qb.filter("section_type", section_type)

        # New flexible filters
        if filters:
            qb.filter_many(filters)

        # Search
        if search and search.get("keyword"):
            qb.search(search.get("fields", ["title", "description"]), search["keyword"])

        # Sorts
        if sorts:
            qb.sort_by(sorts)
        else:
            qb.sort("sort_order", "asc")
            qb.sort("id", "desc")

        return qb.paginate(page, per_page).execute()

    @staticmethod
    def find_all_visible():
        return (
            PageSection.query.filter_by(is_visible=True, status="published")
            .order_by(PageSection.sort_order.asc(), PageSection.id.desc())
            .all()
        )

    @staticmethod
    def update(section_id, data):
        section = db.session.get(PageSection, section_id)
        if not section:
            return None
        for key, value in data.items():
            if hasattr(section, key) and value is not None:
                setattr(section, key, value)
        db.session.commit()
        return section

    @staticmethod
    def delete(section):
        db.session.delete(section)
        db.session.commit()
        log.debug(f"PageSectionRepository.delete | id={section.id}")

    @staticmethod
    def update_sort_order(section_id, sort_order):
        section = db.session.get(PageSection, section_id)
        if section:
            section.sort_order = sort_order
            db.session.commit()


class SectionContentRepository:
    @staticmethod
    def create(data):
        content = SectionContent(**data)
        db.session.add(content)
        db.session.commit()
        log.debug(f"SectionContentRepository.create | id={content.id}")
        return content

    @staticmethod
    def find_by_id(content_id):
        return db.session.get(SectionContent, content_id)

    @staticmethod
    def find_by_section(
        section_id,
        page=1,
        per_page=50,
        filters=None,
        search=None,
        sorts=None,
        visible_only=False,
    ):
        qb = QueryBuilder(SectionContent)
        qb.filter("section_id", section_id)

        if visible_only:
            qb.filter("is_visible", True)

        if filters:
            qb.filter_many(filters)

        if search and search.get("keyword"):
            qb.search(
                search.get("fields", ["title", "subtitle", "body"]), search["keyword"]
            )

        if sorts:
            qb.sort_by(sorts)
        else:
            qb.sort("sort_order", "asc")

        return qb.paginate(page, per_page).execute()

    @staticmethod
    def find_all_by_section(section_id, visible_only=False):
        query = SectionContent.query.filter_by(section_id=section_id)
        if visible_only:
            query = query.filter_by(is_visible=True)
        return query.order_by(SectionContent.sort_order.asc()).all()

    @staticmethod
    def update(content_id, data):
        content = db.session.get(SectionContent, content_id)
        if not content:
            return None
        for key, value in data.items():
            if hasattr(content, key) and value is not None:
                if key == "content_date" and value == "":
                    value = None
                setattr(content, key, value)
        db.session.commit()
        return content

    @staticmethod
    def delete(content):
        db.session.delete(content)
        db.session.commit()
        log.debug(f"SectionContentRepository.delete | id={content.id}")

    @staticmethod
    def delete_by_section(section_id):
        SectionContent.query.filter_by(section_id=section_id).delete()
        db.session.commit()
