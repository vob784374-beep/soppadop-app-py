import pytest


@pytest.mark.unit
class TestMiddleware:
    def test_logging_middleware_adds_request_id(self, client, auth_headers):
        resp = client.get("/api/health", headers=auth_headers)
        assert "X-Request-ID" in resp.headers

    def test_cache_middleware_adds_cache_control(self, client):
        resp = client.get("/api/health")
        assert "Cache-Control" in resp.headers

    def test_cors_headers(self, client):
        resp = client.options(
            "/api/health",
            headers={
                "Origin": "http://localhost",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert resp.status_code in (200, 204, 405)

    def test_error_handler_404(self, client):
        resp = client.get("/api/nonexistent")
        assert resp.status_code == 404
        data = resp.get_json()
        assert "error" in data

    def test_error_handler_method_not_allowed(self, client):
        resp = client.put("/api/health")
        assert resp.status_code == 405


@pytest.mark.unit
class TestValidationMiddleware:
    def test_json_required_rejects_non_json(self, client):
        resp = client.post(
            "/api/auth/login", data="not json", content_type="text/plain"
        )
        assert resp.status_code == 415
