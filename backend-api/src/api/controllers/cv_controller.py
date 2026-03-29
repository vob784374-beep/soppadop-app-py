from flask import Blueprint, request, g
from src.api.services.cv_service import CVService
from src.api.utils.decorators import auth_required
from src.api.utils.response import success, error
from src.api.utils.request import get_json_body
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()
cv_bp = Blueprint("cv", __name__, url_prefix="/api/cvs")


def _uid():
    return g.current_user.id if hasattr(g, "current_user") else None


# ───────────────────── CV CRUD ─────────────────────
@cv_bp.route("", methods=["POST"])
@auth_required
def create_cv():
    data, err = get_json_body()
    if err:
        return error(err, 400)
    if not data.get("title") or not data.get("full_name"):
        return error("title and full_name are required", 400)

    cv, err = CVService.create(_uid(), data)
    if err:
        return error(err, 400)
    return success({"cv": cv.to_dict()}, "CV created", 201)


@cv_bp.route("", methods=["GET"])
@auth_required
def list_cvs():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    result, err = CVService.get_list(_uid(), page, per_page)
    if err:
        return error(err, 500)
    return success(result)


@cv_bp.route("/<int:cv_id>", methods=["GET"])
@auth_required
def get_cv(cv_id):
    cv, err = CVService.get_by_id(cv_id, _uid())
    if err:
        return error(err, 404)
    return success({"cv": cv.to_dict()})


@cv_bp.route("/<int:cv_id>", methods=["PATCH"])
@auth_required
def update_cv(cv_id):
    data, err = get_json_body()
    if err:
        return error(err, 400)
    cv, err = CVService.update(cv_id, _uid(), data)
    if err:
        return error(err, 404)
    return success({"cv": cv.to_dict()}, "CV updated")


@cv_bp.route("/<int:cv_id>", methods=["DELETE"])
@auth_required
def delete_cv(cv_id):
    ok, err = CVService.delete(cv_id, _uid())
    if err:
        return error(err, 404)
    return success(message="CV deleted")


@cv_bp.route("/<int:cv_id>/default", methods=["PUT"])
@auth_required
def set_default(cv_id):
    cv, err = CVService.set_default(cv_id, _uid())
    if err:
        return error(err, 404)
    return success({"cv": cv.to_dict()}, "Default CV set")


# ───────────────────── Education ─────────────────────
@cv_bp.route("/<int:cv_id>/educations", methods=["POST"])
@auth_required
def add_education(cv_id):
    data, err = get_json_body()
    if err:
        return error(err, 400)
    if not data.get("school"):
        return error("school is required", 400)

    edu, err = CVService.add_education(cv_id, _uid(), data)
    if err:
        return error(err, 404)
    return success({"education": edu.to_dict()}, "Education added", 201)


@cv_bp.route("/<int:cv_id>/educations/<int:edu_id>", methods=["PATCH"])
@auth_required
def update_education(cv_id, edu_id):
    data, err = get_json_body()
    if err:
        return error(err, 400)
    edu, err = CVService.update_education(edu_id, cv_id, _uid(), data)
    if err:
        return error(err, 404)
    return success({"education": edu.to_dict()}, "Education updated")


@cv_bp.route("/<int:cv_id>/educations/<int:edu_id>", methods=["DELETE"])
@auth_required
def delete_education(cv_id, edu_id):
    ok, err = CVService.delete_education(edu_id, cv_id, _uid())
    if err:
        return error(err, 404)
    return success(message="Education deleted")


# ───────────────────── Experience ─────────────────────
@cv_bp.route("/<int:cv_id>/experiences", methods=["POST"])
@auth_required
def add_experience(cv_id):
    data, err = get_json_body()
    if err:
        return error(err, 400)
    if not data.get("company") or not data.get("position"):
        return error("company and position are required", 400)

    exp, err = CVService.add_experience(cv_id, _uid(), data)
    if err:
        return error(err, 404)
    return success({"experience": exp.to_dict()}, "Experience added", 201)


@cv_bp.route("/<int:cv_id>/experiences/<int:exp_id>", methods=["PATCH"])
@auth_required
def update_experience(cv_id, exp_id):
    data, err = get_json_body()
    if err:
        return error(err, 400)
    exp, err = CVService.update_experience(exp_id, cv_id, _uid(), data)
    if err:
        return error(err, 404)
    return success({"experience": exp.to_dict()}, "Experience updated")


@cv_bp.route("/<int:cv_id>/experiences/<int:exp_id>", methods=["DELETE"])
@auth_required
def delete_experience(cv_id, exp_id):
    ok, err = CVService.delete_experience(exp_id, cv_id, _uid())
    if err:
        return error(err, 404)
    return success(message="Experience deleted")


# ───────────────────── Skills ─────────────────────
@cv_bp.route("/<int:cv_id>/skills", methods=["POST"])
@auth_required
def add_skill(cv_id):
    data, err = get_json_body()
    if err:
        return error(err, 400)
    if not data.get("name"):
        return error("name is required", 400)

    skill, err = CVService.add_skill(cv_id, _uid(), data)
    if err:
        return error(err, 404)
    return success({"skill": skill.to_dict()}, "Skill added", 201)


@cv_bp.route("/<int:cv_id>/skills/<int:skill_id>", methods=["PATCH"])
@auth_required
def update_skill(cv_id, skill_id):
    data, err = get_json_body()
    if err:
        return error(err, 400)
    skill, err = CVService.update_skill(skill_id, cv_id, _uid(), data)
    if err:
        return error(err, 404)
    return success({"skill": skill.to_dict()}, "Skill updated")


@cv_bp.route("/<int:cv_id>/skills/<int:skill_id>", methods=["DELETE"])
@auth_required
def delete_skill(cv_id, skill_id):
    ok, err = CVService.delete_skill(skill_id, cv_id, _uid())
    if err:
        return error(err, 404)
    return success(message="Skill deleted")


# ───────────────────── Projects ─────────────────────
@cv_bp.route("/<int:cv_id>/projects", methods=["POST"])
@auth_required
def add_project(cv_id):
    data, err = get_json_body()
    if err:
        return error(err, 400)
    if not data.get("name"):
        return error("name is required", 400)

    project, err = CVService.add_project(cv_id, _uid(), data)
    if err:
        return error(err, 404)
    return success({"project": project.to_dict()}, "Project added", 201)


@cv_bp.route("/<int:cv_id>/projects/<int:project_id>", methods=["PATCH"])
@auth_required
def update_project(cv_id, project_id):
    data, err = get_json_body()
    if err:
        return error(err, 400)
    project, err = CVService.update_project(project_id, cv_id, _uid(), data)
    if err:
        return error(err, 404)
    return success({"project": project.to_dict()}, "Project updated")


@cv_bp.route("/<int:cv_id>/projects/<int:project_id>", methods=["DELETE"])
@auth_required
def delete_project(cv_id, project_id):
    ok, err = CVService.delete_project(project_id, cv_id, _uid())
    if err:
        return error(err, 404)
    return success(message="Project deleted")


# ───────────────────── Certifications ─────────────────────
@cv_bp.route("/<int:cv_id>/certifications", methods=["POST"])
@auth_required
def add_certification(cv_id):
    data, err = get_json_body()
    if err:
        return error(err, 400)
    if not data.get("name"):
        return error("name is required", 400)

    cert, err = CVService.add_certification(cv_id, _uid(), data)
    if err:
        return error(err, 404)
    return success({"certification": cert.to_dict()}, "Certification added", 201)


@cv_bp.route("/<int:cv_id>/certifications/<int:cert_id>", methods=["PATCH"])
@auth_required
def update_certification(cv_id, cert_id):
    data, err = get_json_body()
    if err:
        return error(err, 400)
    cert, err = CVService.update_certification(cert_id, cv_id, _uid(), data)
    if err:
        return error(err, 404)
    return success({"certification": cert.to_dict()}, "Certification updated")


@cv_bp.route("/<int:cv_id>/certifications/<int:cert_id>", methods=["DELETE"])
@auth_required
def delete_certification(cv_id, cert_id):
    ok, err = CVService.delete_certification(cert_id, cv_id, _uid())
    if err:
        return error(err, 404)
    return success(message="Certification deleted")
