import pytest


@pytest.mark.unit
@pytest.mark.health
class TestHealthCheck:
    def test_health_check_success(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["status"] == "healthy"
        assert data["service"] == "backend-api"

    def test_health_check_ready(self, client):
        resp = client.get("/api/health/ready")
        assert resp.status_code == 200


@pytest.mark.unit
@pytest.mark.cache
class TestCacheService:
    def test_cache_set_and_get(self, app):
        from src.api.services.cache_service import cache

        cache.set("test_key", {"data": "value"}, ttl=60)
        result = cache.get("test_key")
        assert result == {"data": "value"}

    def test_cache_miss(self, app):
        from src.api.services.cache_service import cache

        result = cache.get("nonexistent_key")
        assert result is None

    def test_cache_delete(self, app):
        from src.api.services.cache_service import cache

        cache.set("delete_key", "value", ttl=60)
        cache.delete("delete_key")
        result = cache.get("delete_key")
        assert result is None

    def test_cache_clear(self, app):
        from src.api.services.cache_service import cache

        cache.set("key1", "value1", ttl=60)
        cache.set("key2", "value2", ttl=60)
        cache.clear()
        assert cache.get("key1") is None
        assert cache.get("key2") is None

    def test_cache_stats(self, app):
        from src.api.services.cache_service import cache

        cache.clear()
        cache.set("stat_key", "value", ttl=60)
        stats = cache.stats()
        assert stats["size"] >= 1
        assert stats["max_size"] > 0

    def test_cache_delete_pattern(self, app):
        from src.api.services.cache_service import cache

        cache.clear()
        cache.set("prefix:key1", "value1", ttl=60)
        cache.set("prefix:key2", "value2", ttl=60)
        cache.set("other:key3", "value3", ttl=60)
        cache.delete_pattern("prefix")
        assert cache.get("prefix:key1") is None
        assert cache.get("prefix:key2") is None
        assert cache.get("other:key3") == "value3"
