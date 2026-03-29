import hashlib
from functools import wraps
from flask import request, make_response


class CacheMiddleware:
    @staticmethod
    def cache_control(
        max_age=60, public=False, private=False, no_cache=False, no_store=False
    ):
        def decorator(f):
            @wraps(f)
            def wrapper(*args, **kwargs):
                response = f(*args, **kwargs)
                if hasattr(response, "headers"):
                    parts = []
                    if no_store:
                        parts.append("no-store")
                    elif no_cache:
                        parts.append("no-cache")
                    else:
                        if public:
                            parts.append("public")
                        elif private:
                            parts.append("private")
                        parts.append(f"max-age={max_age}")
                    response.headers["Cache-Control"] = ", ".join(parts)
                    response.headers["Vary"] = "Authorization, Accept"
                return response

            return wrapper

        return decorator

    @staticmethod
    def etag_required(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            response = f(*args, **kwargs)
            if hasattr(response, "get_data"):
                data = response.get_data()
                etag = hashlib.md5(data).hexdigest()
                if_none_match = request.headers.get("If-None-Match")
                if if_none_match == etag:
                    resp = make_response("", 304)
                    resp.headers["ETag"] = etag
                    return resp
                response.headers["ETag"] = etag
            return response

        return wrapper

    @staticmethod
    def after_request(response):
        if request.method == "GET" and response.status_code == 200:
            if "Cache-Control" not in response.headers:
                response.headers["Cache-Control"] = "private, max-age=30"
        return response
