import pytest


@pytest.mark.unit
@pytest.mark.role
class TestRoleList:
    def test_list_roles_success(self, client, admin_headers):
        resp = client.get("/api/roles", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert "roles" in data
        assert len(data["roles"]) >= 4

    def test_list_roles_unauthorized(self, client):
        resp = client.get("/api/roles")
        assert resp.status_code == 401


@pytest.mark.unit
@pytest.mark.role
class TestRoleGet:
    def test_get_role_success(self, client, admin_headers):
        resp = client.get("/api/roles/1", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["role"]["name"] == "super_admin"

    def test_get_role_not_found(self, client, admin_headers):
        resp = client.get("/api/roles/999", headers=admin_headers)
        assert resp.status_code == 404


@pytest.mark.unit
@pytest.mark.role
class TestRoleCreate:
    def test_create_role_success(self, client, owner_token):
        resp = client.post(
            "/api/roles",
            json={
                "name": "custom_role",
                "description": "Custom role for testing",
                "permissions": ["users.view", "resources.view"],
            },
            headers={"Authorization": f"Bearer {owner_token}"},
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["role"]["name"] == "custom_role"

    def test_create_role_duplicate_name(self, client, owner_token):
        resp = client.post(
            "/api/roles",
            json={
                "name": "admin",
                "description": "Duplicate admin",
            },
            headers={"Authorization": f"Bearer {owner_token}"},
        )
        assert resp.status_code == 409

    def test_create_role_forbidden_for_admin(self, client, admin_token):
        resp = client.post(
            "/api/roles",
            json={
                "name": "forbidden_role",
                "description": "Should not create",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 403


@pytest.mark.unit
@pytest.mark.role
class TestRoleUpdate:
    def test_update_role_success(self, client, owner_token):
        resp = client.put(
            "/api/roles/2",
            json={
                "description": "Updated admin description",
            },
            headers={"Authorization": f"Bearer {owner_token}"},
        )
        assert resp.status_code == 200

    def test_update_system_role_name_forbidden(self, client, owner_token):
        resp = client.put(
            "/api/roles/1",
            json={
                "name": "renamed_admin",
            },
            headers={"Authorization": f"Bearer {owner_token}"},
        )
        assert resp.status_code in (400, 403)


@pytest.mark.unit
@pytest.mark.role
class TestRolePermissions:
    def test_list_permissions(self, client, admin_headers):
        resp = client.get("/api/permissions", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert "permissions" in data

    def test_assign_permissions(self, client, owner_token):
        resp = client.post(
            "/api/roles/2/permissions",
            json={
                "permission_ids": [1, 7, 9],
            },
            headers={"Authorization": f"Bearer {owner_token}"},
        )
        assert resp.status_code == 200
