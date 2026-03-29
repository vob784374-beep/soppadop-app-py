from functools import wraps
from flask import request, jsonify


class ValidationMiddleware:
    @staticmethod
    def json_required(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if not request.is_json:
                return jsonify({"error": "Content-Type must be application/json"}), 415
            return fn(*args, **kwargs)

        return wrapper

    @staticmethod
    def require_fields(*fields):
        def decorator(fn):
            @wraps(fn)
            def wrapper(*args, **kwargs):
                data = request.get_json(silent=True) or {}
                missing = [f for f in fields if f not in data]
                if missing:
                    return jsonify(
                        {"error": f"Missing required fields: {', '.join(missing)}"}
                    ), 400
                return fn(*args, **kwargs)

            return wrapper

        return decorator
