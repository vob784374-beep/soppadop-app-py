import pytest


@pytest.mark.unit
@pytest.mark.user
class TestUserList:
    def test_list_users_success(self, client, admin_headers):
        resp = client.get("/api/users", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert "users" in data
        assert len(data["users"]) >= 5

    def test_list_users_with_pagination(self, client, admin_headers):
        resp = client.get("/api/users?page=1&per_page=2", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert len(data["users"]) == 2
        assert data["page"] == 1

    def test_list_users_with_search(self, client, admin_headers):
        resp = client.get("/api/users?search=owner", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert any(u["username"] == "owner" for u in data["users"])

    def test_list_users_unauthorized(self, client):
        resp = client.get("/api/users")
        assert resp.status_code == 401

    def test_list_users_forbidden_for_client(self, client, client_headers):
        resp = client.get("/api/users", headers=client_headers)
        assert resp.status_code == 403


@pytest.mark.unit
@pytest.mark.user
class TestUserGet:
    def test_get_user_success(self, client, admin_headers):
        resp = client.get("/api/users/1", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["user"]["email"] == "owner@test.com"

    def test_get_user_not_found(self, client, admin_headers):
        resp = client.get("/api/users/999", headers=admin_headers)
        assert resp.status_code == 404


@pytest.mark.unit
@pytest.mark.user
class TestUserUpdate:
    def test_update_user_success(self, client, admin_headers):
        resp = client.patch(
            "/api/users/2",
            json={
                "username": "admin_updated",
            },
            headers=admin_headers,
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["user"]["username"] == "admin_updated"

    def test_update_user_not_found(self, client, admin_headers):
        resp = client.patch(
            "/api/users/999",
            json={
                "username": "ghost",
            },
            headers=admin_headers,
        )
        assert resp.status_code == 404


@pytest.mark.unit
@pytest.mark.user
class TestUserDelete:
    def test_delete_user_success(self, client, owner_token):
        resp = client.delete(
            "/api/users/5",
            headers={
                "Authorization": f"Bearer {owner_token}",
            },
        )
        assert resp.status_code == 200

    def test_delete_user_not_found(self, client, owner_token):
        resp = client.delete(
            "/api/users/999",
            headers={
                "Authorization": f"Bearer {owner_token}",
            },
        )
        assert resp.status_code == 404

    def test_delete_user_forbidden_for_admin(self, client, admin_token):
        resp = client.delete(
            "/api/users/3",
            headers={
                "Authorization": f"Bearer {admin_token}",
            },
        )
        assert resp.status_code == 403


@pytest.mark.unit
@pytest.mark.user
class TestUserProfile:
    def test_get_own_profile(self, client, auth_headers):
        resp = client.get("/api/auth/me", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["user"]["email"] == "owner@test.com"

    def test_update_own_username(self, client, auth_headers):
        resp = client.patch(
            "/api/auth/me/username",
            json={
                "username": "owner_new",
                "password": "Test@123",
                "verification_code": "123456",
            },
            headers=auth_headers,
        )
        assert resp.status_code in (200, 400)
