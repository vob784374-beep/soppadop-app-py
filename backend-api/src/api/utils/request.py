from flask import request


def get_json_body():
    data = request.get_json(silent=True)
    if not data:
        return None, "No data provided"
    return data, None


def get_json_fields(*fields):
    data, err = get_json_body()
    if err:
        return None, err

    missing = [f for f in fields if not data.get(f)]
    if missing:
        return None, f"{', '.join(missing)} are required"

    return data, None


def get_pagination():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    return page, per_page
