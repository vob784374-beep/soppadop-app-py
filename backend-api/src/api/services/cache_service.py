import time
import hashlib
import json
from functools import wraps
from flask import request
from src.api.utils.logger import get_daily_logger

log = get_daily_logger()


class MemoryCache:
    def __init__(self, default_ttl=300, max_size=1000):
        self._cache = {}
        self._default_ttl = default_ttl
        self._max_size = max_size

    def _make_key(self, *args, **kwargs):
        data = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True, default=str)
        return hashlib.md5(data.encode()).hexdigest()

    def get(self, key):
        if key in self._cache:
            entry = self._cache[key]
            if entry["expires_at"] > time.time():
                log.debug(f"Cache HIT | key={key[:16]}")
                return entry["value"]
            else:
                del self._cache[key]
                log.debug(f"Cache EXPIRED | key={key[:16]}")
        log.debug(f"Cache MISS | key={key[:16]}")
        return None

    def set(self, key, value, ttl=None):
        if len(self._cache) >= self._max_size:
            self._evict_oldest()
        self._cache[key] = {
            "value": value,
            "expires_at": time.time() + (ttl or self._default_ttl),
            "created_at": time.time(),
        }

    def delete(self, key):
        self._cache.pop(key, None)

    def delete_pattern(self, pattern):
        keys_to_delete = [k for k in self._cache if pattern in k]
        for k in keys_to_delete:
            del self._cache[k]
        if keys_to_delete:
            log.debug(f"Cache CLEAR pattern={pattern} | deleted={len(keys_to_delete)}")

    def clear(self):
        count = len(self._cache)
        self._cache.clear()
        log.debug(f"Cache CLEAR ALL | deleted={count}")

    def _evict_oldest(self):
        if not self._cache:
            return
        oldest_key = min(self._cache, key=lambda k: self._cache[k]["created_at"])
        del self._cache[oldest_key]

    def stats(self):
        return {
            "size": len(self._cache),
            "max_size": self._max_size,
            "default_ttl": self._default_ttl,
        }


cache = MemoryCache(default_ttl=300)


def cached(ttl=300, key_prefix=""):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            cache_key = f"{key_prefix}:{f.__name__}:{cache._make_key(*args, **kwargs)}"
            result = cache.get(cache_key)
            if result is not None:
                return result
            result = f(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            return result

        return wrapper

    return decorator


def cache_response(ttl=60, key_prefix="api"):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            if request.method != "GET":
                return f(*args, **kwargs)
            cache_key = f"{key_prefix}:{request.path}:{request.query_string.decode()}"
            result = cache.get(cache_key)
            if result is not None:
                return result
            result = f(*args, **kwargs)
            from flask import jsonify

            if hasattr(result, "get_json"):
                cache.set(cache_key, result, ttl)
            return result

        return wrapper

    return decorator


def invalidate_on_change(prefixes):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            result = f(*args, **kwargs)
            for prefix in prefixes:
                cache.delete_pattern(prefix)
            return result

        return wrapper

    return decorator
