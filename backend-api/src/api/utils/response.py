from flask import jsonify


def success(data=None, message=None, status=200):
    resp = {}
    if message:
        resp["message"] = message
    if data:
        resp.update(data)
    return jsonify(resp), status


def error(message, status=400):
    return jsonify({"error": message}), status


def paginate(pagination, key="items"):
    return {
        key: [item.to_dict() for item in pagination.items],
        "total": pagination.total,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "pages": pagination.pages,
    }
