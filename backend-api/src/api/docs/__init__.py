import os
import glob as glob_mod
import yaml
from flask import jsonify
from flask_swagger_ui import get_swaggerui_blueprint

SWAGGER_URL = "/api/docs"
API_URL = "/api/openapi.json"

DOCS_DIR = os.path.dirname(__file__)


def _load_yaml(filename):
    filepath = os.path.join(DOCS_DIR, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def _load_openapi_spec():
    spec = _load_yaml("openapi.yaml")

    schemas = _load_yaml("schemas.yaml")
    if schemas:
        spec.setdefault("components", {})["schemas"] = schemas

    paths_dir = os.path.join(DOCS_DIR, "paths")
    for path_file in sorted(glob_mod.glob(os.path.join(paths_dir, "*.yaml"))):
        with open(path_file, "r", encoding="utf-8") as f:
            paths = yaml.safe_load(f)
        if paths:
            spec.setdefault("paths", {}).update(paths)

    return spec


def register_docs(app):
    swaggerui_blueprint = get_swaggerui_blueprint(
        SWAGGER_URL,
        API_URL,
        config={
            "app_name": "Soppadop API",
            "persistAuthorization": True,
            "docExpansion": "list",
            "filter": True,
            "tryItOutEnabled": True,
        },
    )

    app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

    @app.route(API_URL)
    def openapi_json():
        spec = _load_openapi_spec()
        return jsonify(spec)
