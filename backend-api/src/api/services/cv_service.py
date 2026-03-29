from src.api.repositories.cv_repository import CVRepository
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()


class CVService:
    @staticmethod
    def create(user_id, data):
        data["user_id"] = user_id
        cv = CVRepository.create(data)
        log.info(f"CVService.create | id={cv.id} | user={user_id}")
        return cv, None

    @staticmethod
    def get_list(user_id, page=1, per_page=20):
        pagination = CVRepository.find_by_user(user_id, page, per_page)
        return {
            "cvs": [cv.to_summary() for cv in pagination.items],
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages,
        }, None

    @staticmethod
    def get_by_id(cv_id, user_id):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        return cv, None

    @staticmethod
    def update(cv_id, user_id, data):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        updated = CVRepository.update(cv_id, data)
        log.info(f"CVService.update | id={cv_id} | user={user_id}")
        return updated, None

    @staticmethod
    def delete(cv_id, user_id):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        CVRepository.delete(cv_id)
        log.info(f"CVService.delete | id={cv_id} | user={user_id}")
        return True, None

    @staticmethod
    def set_default(cv_id, user_id):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        CVRepository.set_default(cv_id, user_id)
        return cv, None

    @staticmethod
    def add_education(cv_id, user_id, data):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        edu = CVRepository.add_education(cv_id, data)
        return edu, None

    @staticmethod
    def update_education(edu_id, cv_id, user_id, data):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        edu = CVRepository.update_education(edu_id, data)
        return edu, None

    @staticmethod
    def delete_education(edu_id, cv_id, user_id):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        CVRepository.delete_education(edu_id)
        return True, None

    @staticmethod
    def add_experience(cv_id, user_id, data):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        exp = CVRepository.add_experience(cv_id, data)
        return exp, None

    @staticmethod
    def update_experience(exp_id, cv_id, user_id, data):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        exp = CVRepository.update_experience(exp_id, data)
        return exp, None

    @staticmethod
    def delete_experience(exp_id, cv_id, user_id):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        CVRepository.delete_experience(exp_id)
        return True, None

    @staticmethod
    def add_skill(cv_id, user_id, data):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        skill = CVRepository.add_skill(cv_id, data)
        return skill, None

    @staticmethod
    def update_skill(skill_id, cv_id, user_id, data):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        skill = CVRepository.update_skill(skill_id, data)
        return skill, None

    @staticmethod
    def delete_skill(skill_id, cv_id, user_id):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        CVRepository.delete_skill(skill_id)
        return True, None

    @staticmethod
    def add_project(cv_id, user_id, data):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        project = CVRepository.add_project(cv_id, data)
        return project, None

    @staticmethod
    def update_project(project_id, cv_id, user_id, data):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        project = CVRepository.update_project(project_id, data)
        return project, None

    @staticmethod
    def delete_project(project_id, cv_id, user_id):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        CVRepository.delete_project(project_id)
        return True, None

    @staticmethod
    def add_certification(cv_id, user_id, data):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        cert = CVRepository.add_certification(cv_id, data)
        return cert, None

    @staticmethod
    def update_certification(cert_id, cv_id, user_id, data):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        cert = CVRepository.update_certification(cert_id, data)
        return cert, None

    @staticmethod
    def delete_certification(cert_id, cv_id, user_id):
        cv = CVRepository.find_by_id(cv_id)
        if not cv or cv.user_id != user_id:
            return None, "CV not found"
        CVRepository.delete_certification(cert_id)
        return True, None
