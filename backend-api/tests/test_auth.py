import pytest
import json


@pytest.mark.unit
@pytest.mark.auth
class TestAuthLogin:
    def test_login_success(self, client):
        resp = client.post(
            "/api/auth/login",
            json={
                "email": "owner@test.com",
                "password": "Test@123",
            },
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["email"] == "owner@test.com"

    def test_login_wrong_password(self, client):
        resp = client.post(
            "/api/auth/login",
            json={
                "email": "owner@test.com",
                "password": "WrongPassword",
            },
        )
        assert resp.status_code == 401

    def test_login_nonexistent_user(self, client):
        resp = client.post(
            "/api/auth/login",
            json={
                "email": "nobody@test.com",
                "password": "Test@123",
            },
        )
        assert resp.status_code == 401

    def test_login_inactive_user(self, client):
        resp = client.post(
            "/api/auth/login",
            json={
                "email": "inactive@test.com",
                "password": "Test@123",
            },
        )
        assert resp.status_code == 401

    def test_login_missing_email(self, client):
        resp = client.post("/api/auth/login", json={"password": "Test@123"})
        assert resp.status_code == 400

    def test_login_missing_password(self, client):
        resp = client.post("/api/auth/login", json={"email": "owner@test.com"})
        assert resp.status_code == 400

    def test_login_empty_body(self, client):
        resp = client.post("/api/auth/login", json={})
        assert resp.status_code == 400


@pytest.mark.unit
@pytest.mark.auth
class TestAuthRegister:
    def test_register_success(self, client, owner_token):
        resp = client.post(
            "/api/auth/register",
            json={
                "email": "new@test.com",
                "username": "newuser",
                "password": "NewPass@123",
                "role_id": 4,
            },
            headers={"Authorization": f"Bearer {owner_token}"},
        )
        assert resp.status_code == 201

    def test_register_duplicate_email(self, client, owner_token):
        resp = client.post(
            "/api/auth/register",
            json={
                "email": "owner@test.com",
                "username": "duplicate",
                "password": "Test@123",
                "role_id": 4,
            },
            headers={"Authorization": f"Bearer {owner_token}"},
        )
        assert resp.status_code == 409

    def test_register_unauthorized(self, client):
        resp = client.post(
            "/api/auth/register",
            json={
                "email": "test@test.com",
                "username": "test",
                "password": "Test@123",
                "role_id": 4,
            },
        )
        assert resp.status_code == 401


@pytest.mark.unit
@pytest.mark.auth
class TestAuthMe:
    def test_get_current_user(self, client, auth_headers):
        resp = client.get("/api/auth/me", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["user"]["email"] == "owner@test.com"

    def test_get_current_user_unauthorized(self, client):
        resp = client.get("/api/auth/me")
        assert resp.status_code == 401
