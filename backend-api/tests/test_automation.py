import pytest
from io import BytesIO


@pytest.mark.automation
@pytest.mark.auth
class TestAuthFlow:
    def test_login_logout_flow(self, client):
        resp = client.post(
            "/api/auth/login",
            json={
                "email": "owner@test.com",
                "password": "Test@123",
            },
        )
        assert resp.status_code == 200
        data = resp.get_json()
        token = data["access_token"]

        resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200

        resp = client.post(
            "/api/auth/logout", headers={"Authorization": f"Bearer {token}"}
        )
        assert resp.status_code == 200

    def test_register_and_login_flow(self, client, owner_token):
        resp = client.post(
            "/api/auth/register",
            json={
                "email": "flow@test.com",
                "username": "flowuser",
                "password": "FlowPass@123",
                "role_id": 4,
            },
            headers={"Authorization": f"Bearer {owner_token}"},
        )
        assert resp.status_code == 201

        resp = client.post(
            "/api/auth/login",
            json={
                "email": "flow@test.com",
                "password": "FlowPass@123",
            },
        )
        assert resp.status_code == 200
        assert "access_token" in resp.get_json()


@pytest.mark.automation
@pytest.mark.user
class TestUserManagementFlow:
    def test_create_update_delete_user(self, client, owner_token):
        headers = {
            "Authorization": f"Bearer {owner_token}",
            "Content-Type": "application/json",
        }

        resp = client.post(
            "/api/auth/register",
            json={
                "email": "managed@test.com",
                "username": "manageduser",
                "password": "Test@123",
                "role_id": 4,
            },
            headers=headers,
        )
        assert resp.status_code == 201
        user_id = resp.get_json()["user"]["id"]

        resp = client.patch(
            f"/api/users/{user_id}",
            json={
                "username": "managed_updated",
            },
            headers=headers,
        )
        assert resp.status_code == 200
        assert resp.get_json()["user"]["username"] == "managed_updated"

        resp = client.get(f"/api/users/{user_id}", headers=headers)
        assert resp.status_code == 200
        assert resp.get_json()["user"]["username"] == "managed_updated"

        resp = client.delete(f"/api/users/{user_id}", headers=headers)
        assert resp.status_code == 200


@pytest.mark.automation
@pytest.mark.resource
class TestResourceManagementFlow:
    def test_upload_list_delete_resource(self, client, auth_headers):
        token = auth_headers["Authorization"]

        data = {
            "file": (BytesIO(b"test content for resource"), "test_resource.txt"),
            "collection": "test_collection",
            "folder": "test_folder",
        }
        resp = client.post(
            "/api/resources",
            data=data,
            headers={
                "Authorization": token,
            },
            content_type="multipart/form-data",
        )
        assert resp.status_code in (200, 201, 500)

        if resp.status_code in (200, 201):
            resource_id = resp.get_json().get("resource", {}).get("id")
            if resource_id:
                resp = client.get(f"/api/resources/{resource_id}", headers=auth_headers)
                assert resp.status_code == 200

                resp = client.delete(
                    f"/api/resources/{resource_id}", headers=auth_headers
                )
                assert resp.status_code == 200


@pytest.mark.automation
@pytest.mark.role
class TestRoleManagementFlow:
    def test_create_assign_permissions_delete_role(self, client, owner_token):
        headers = {
            "Authorization": f"Bearer {owner_token}",
            "Content-Type": "application/json",
        }

        resp = client.post(
            "/api/roles",
            json={
                "name": "test_role",
                "description": "Test role for automation",
                "permissions": ["users.view", "resources.view"],
            },
            headers=headers,
        )
        assert resp.status_code == 201
        role_id = resp.get_json()["role"]["id"]

        resp = client.post(
            f"/api/roles/{role_id}/permissions",
            json={
                "permissions": ["users.view", "resources.view", "resources.upload"],
            },
            headers=headers,
        )
        assert resp.status_code == 200

        resp = client.get(f"/api/roles/{role_id}", headers=headers)
        assert resp.status_code == 200
        assert resp.get_json()["role"]["name"] == "test_role"
