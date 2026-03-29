from src.api.models import (
    db,
    CV,
    CVEducation,
    CVExperience,
    CVSkill,
    CVProject,
    CVCertification,
)
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()


class CVRepository:
    @staticmethod
    def create(data):
        cv = CV(**data)
        db.session.add(cv)
        db.session.commit()
        log.debug(f"CVRepository.create | id={cv.id} | title={cv.title}")
        return cv

    @staticmethod
    def find_by_id(cv_id):
        return db.session.get(CV, cv_id)

    @staticmethod
    def find_by_user(user_id, page=1, per_page=20):
        query = CV.query.filter_by(user_id=user_id).order_by(CV.updated_at.desc())
        return query.paginate(page=page, per_page=per_page, error_out=False)

    @staticmethod
    def find_default(user_id):
        return CV.query.filter_by(user_id=user_id, is_default=True).first()

    @staticmethod
    def update(cv_id, data):
        cv = db.session.get(CV, cv_id)
        if not cv:
            return None
        for key, value in data.items():
            if hasattr(cv, key) and value is not None:
                setattr(cv, key, value)
        db.session.commit()
        return cv

    @staticmethod
    def delete(cv_id):
        cv = db.session.get(CV, cv_id)
        if cv:
            db.session.delete(cv)
            db.session.commit()
            log.debug(f"CVRepository.delete | id={cv_id}")

    @staticmethod
    def set_default(cv_id, user_id):
        CV.query.filter_by(user_id=user_id, is_default=True).update(
            {"is_default": False}
        )
        cv = db.session.get(CV, cv_id)
        if cv:
            cv.is_default = True
            db.session.commit()
        return cv

    @staticmethod
    def add_education(cv_id, data):
        edu = CVEducation(cv_id=cv_id, **data)
        db.session.add(edu)
        db.session.commit()
        return edu

    @staticmethod
    def update_education(edu_id, data):
        edu = db.session.get(CVEducation, edu_id)
        if not edu:
            return None
        for key, value in data.items():
            if hasattr(edu, key) and value is not None:
                setattr(edu, key, value)
        db.session.commit()
        return edu

    @staticmethod
    def delete_education(edu_id):
        edu = db.session.get(CVEducation, edu_id)
        if edu:
            db.session.delete(edu)
            db.session.commit()

    @staticmethod
    def add_experience(cv_id, data):
        exp = CVExperience(cv_id=cv_id, **data)
        db.session.add(exp)
        db.session.commit()
        return exp

    @staticmethod
    def update_experience(exp_id, data):
        exp = db.session.get(CVExperience, exp_id)
        if not exp:
            return None
        for key, value in data.items():
            if hasattr(exp, key) and value is not None:
                setattr(exp, key, value)
        db.session.commit()
        return exp

    @staticmethod
    def delete_experience(exp_id):
        exp = db.session.get(CVExperience, exp_id)
        if exp:
            db.session.delete(exp)
            db.session.commit()

    @staticmethod
    def add_skill(cv_id, data):
        skill = CVSkill(cv_id=cv_id, **data)
        db.session.add(skill)
        db.session.commit()
        return skill

    @staticmethod
    def update_skill(skill_id, data):
        skill = db.session.get(CVSkill, skill_id)
        if not skill:
            return None
        for key, value in data.items():
            if hasattr(skill, key) and value is not None:
                setattr(skill, key, value)
        db.session.commit()
        return skill

    @staticmethod
    def delete_skill(skill_id):
        skill = db.session.get(CVSkill, skill_id)
        if skill:
            db.session.delete(skill)
            db.session.commit()

    @staticmethod
    def add_project(cv_id, data):
        project = CVProject(cv_id=cv_id, **data)
        db.session.add(project)
        db.session.commit()
        return project

    @staticmethod
    def update_project(project_id, data):
        project = db.session.get(CVProject, project_id)
        if not project:
            return None
        for key, value in data.items():
            if hasattr(project, key) and value is not None:
                setattr(project, key, value)
        db.session.commit()
        return project

    @staticmethod
    def delete_project(project_id):
        project = db.session.get(CVProject, project_id)
        if project:
            db.session.delete(project)
            db.session.commit()

    @staticmethod
    def add_certification(cv_id, data):
        cert = CVCertification(cv_id=cv_id, **data)
        db.session.add(cert)
        db.session.commit()
        return cert

    @staticmethod
    def update_certification(cert_id, data):
        cert = db.session.get(CVCertification, cert_id)
        if not cert:
            return None
        for key, value in data.items():
            if hasattr(cert, key) and value is not None:
                setattr(cert, key, value)
        db.session.commit()
        return cert

    @staticmethod
    def delete_certification(cert_id):
        cert = db.session.get(CVCertification, cert_id)
        if cert:
            db.session.delete(cert)
            db.session.commit()
