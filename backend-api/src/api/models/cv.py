from src.api.models import db
from datetime import datetime, timezone


class CV(db.Model):
    __tablename__ = "cvs"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    address = db.Column(db.String(500), nullable=True)
    website = db.Column(db.String(255), nullable=True)
    linkedin = db.Column(db.String(255), nullable=True)
    github = db.Column(db.String(255), nullable=True)
    summary = db.Column(db.Text, nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    is_default = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default="draft")
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = db.relationship("User", foreign_keys=[user_id], backref="cvs")
    educations = db.relationship(
        "CVEducation",
        backref="cv",
        cascade="all, delete-orphan",
        order_by="CVEducation.order",
    )
    experiences = db.relationship(
        "CVExperience",
        backref="cv",
        cascade="all, delete-orphan",
        order_by="CVExperience.order",
    )
    skills = db.relationship(
        "CVSkill", backref="cv", cascade="all, delete-orphan", order_by="CVSkill.order"
    )
    projects = db.relationship(
        "CVProject",
        backref="cv",
        cascade="all, delete-orphan",
        order_by="CVProject.order",
    )
    certifications = db.relationship(
        "CVCertification",
        backref="cv",
        cascade="all, delete-orphan",
        order_by="CVCertification.order",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "website": self.website,
            "linkedin": self.linkedin,
            "github": self.github,
            "summary": self.summary,
            "avatar_url": self.avatar_url,
            "is_default": self.is_default,
            "status": self.status,
            "user_id": self.user_id,
            "educations": [e.to_dict() for e in self.educations],
            "experiences": [e.to_dict() for e in self.experiences],
            "skills": [s.to_dict() for s in self.skills],
            "projects": [p.to_dict() for p in self.projects],
            "certifications": [c.to_dict() for c in self.certifications],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_summary(self):
        return {
            "id": self.id,
            "title": self.title,
            "full_name": self.full_name,
            "email": self.email,
            "is_default": self.is_default,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class CVEducation(db.Model):
    __tablename__ = "cv_educations"

    id = db.Column(db.Integer, primary_key=True)
    cv_id = db.Column(db.Integer, db.ForeignKey("cvs.id"), nullable=False)
    school = db.Column(db.String(255), nullable=False)
    degree = db.Column(db.String(255), nullable=True)
    field_of_study = db.Column(db.String(255), nullable=True)
    start_date = db.Column(db.String(20), nullable=True)
    end_date = db.Column(db.String(20), nullable=True)
    description = db.Column(db.Text, nullable=True)
    order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "cv_id": self.cv_id,
            "school": self.school,
            "degree": self.degree,
            "field_of_study": self.field_of_study,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "description": self.description,
            "order": self.order,
        }


class CVExperience(db.Model):
    __tablename__ = "cv_experiences"

    id = db.Column(db.Integer, primary_key=True)
    cv_id = db.Column(db.Integer, db.ForeignKey("cvs.id"), nullable=False)
    company = db.Column(db.String(255), nullable=False)
    position = db.Column(db.String(255), nullable=False)
    start_date = db.Column(db.String(20), nullable=True)
    end_date = db.Column(db.String(20), nullable=True)
    is_current = db.Column(db.Boolean, default=False)
    description = db.Column(db.Text, nullable=True)
    order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "cv_id": self.cv_id,
            "company": self.company,
            "position": self.position,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "is_current": self.is_current,
            "description": self.description,
            "order": self.order,
        }


class CVSkill(db.Model):
    __tablename__ = "cv_skills"

    id = db.Column(db.Integer, primary_key=True)
    cv_id = db.Column(db.Integer, db.ForeignKey("cvs.id"), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    level = db.Column(db.String(20), nullable=True)
    category = db.Column(db.String(100), nullable=True)
    order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "cv_id": self.cv_id,
            "name": self.name,
            "level": self.level,
            "category": self.category,
            "order": self.order,
        }


class CVProject(db.Model):
    __tablename__ = "cv_projects"

    id = db.Column(db.Integer, primary_key=True)
    cv_id = db.Column(db.Integer, db.ForeignKey("cvs.id"), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    technologies = db.Column(db.String(500), nullable=True)
    url = db.Column(db.String(255), nullable=True)
    start_date = db.Column(db.String(20), nullable=True)
    end_date = db.Column(db.String(20), nullable=True)
    order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "cv_id": self.cv_id,
            "name": self.name,
            "description": self.description,
            "technologies": self.technologies,
            "url": self.url,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "order": self.order,
        }


class CVCertification(db.Model):
    __tablename__ = "cv_certifications"

    id = db.Column(db.Integer, primary_key=True)
    cv_id = db.Column(db.Integer, db.ForeignKey("cvs.id"), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    issuer = db.Column(db.String(255), nullable=True)
    date = db.Column(db.String(20), nullable=True)
    url = db.Column(db.String(255), nullable=True)
    order = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "cv_id": self.cv_id,
            "name": self.name,
            "issuer": self.issuer,
            "date": self.date,
            "url": self.url,
            "order": self.order,
        }
