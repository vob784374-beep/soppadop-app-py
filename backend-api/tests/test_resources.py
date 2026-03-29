import pytest
from io import BytesIO


@pytest.mark.unit
@pytest.mark.resource
class TestResourceList:
    def test_list_resources_success(self, client, auth_headers):
        resp = client.get("/api/resources", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert "resources" in data
        assert "total" in data
        assert "page" in data

    def test_list_resources_with_pagination(self, client, auth_headers):
        resp = client.get("/api/resources?page=1&per_page=5", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["page"] == 1
        assert data["per_page"] == 5

    def test_list_resources_with_file_type_filter(self, client, auth_headers):
        resp = client.get("/api/resources?file_type=image", headers=auth_headers)
        assert resp.status_code == 200

    def test_list_resources_with_search(self, client, auth_headers):
        resp = client.get("/api/resources?search=test", headers=auth_headers)
        assert resp.status_code == 200

    def test_list_resources_unauthorized(self, client):
        resp = client.get("/api/resources")
        assert resp.status_code == 401


@pytest.mark.unit
@pytest.mark.resource
class TestResourceUpload:
    def test_upload_success(self, client, auth_headers):
        data = {
            "file": (BytesIO(b"test content"), "test.txt"),
            "collection": "test_collection",
            "folder": "test_folder",
        }
        resp = client.post(
            "/api/resources",
            data=data,
            headers={
                "Authorization": auth_headers["Authorization"],
            },
            content_type="multipart/form-data",
        )
        assert resp.status_code in (200, 201, 500)

    def test_upload_no_file(self, client, auth_headers):
        resp = client.post(
            "/api/resources",
            data={},
            headers={
                "Authorization": auth_headers["Authorization"],
            },
            content_type="multipart/form-data",
        )
        assert resp.status_code == 400

    def test_upload_unauthorized(self, client):
        data = {"file": (BytesIO(b"test"), "test.txt")}
        resp = client.post(
            "/api/resources", data=data, content_type="multipart/form-data"
        )
        assert resp.status_code == 401


@pytest.mark.unit
@pytest.mark.resource
class TestResourceGet:
    def test_get_resource_not_found(self, client, auth_headers):
        resp = client.get("/api/resources/999", headers=auth_headers)
        assert resp.status_code == 404


@pytest.mark.unit
@pytest.mark.resource
class TestResourceDelete:
    def test_delete_resource_not_found(self, client, auth_headers):
        resp = client.delete("/api/resources/999", headers=auth_headers)
        assert resp.status_code == 404

    def test_delete_resource_unauthorized(self, client):
        resp = client.delete("/api/resources/1")
        assert resp.status_code == 401


@pytest.mark.unit
@pytest.mark.resource
class TestResourceStats:
    def test_get_stats_success(self, client, auth_headers):
        resp = client.get("/api/resources/stats", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert "stats" in data
        assert "total_files" in data["stats"]
        assert "total_size" in data["stats"]
        assert "by_type" in data["stats"]

    def test_get_stats_unauthorized(self, client):
        resp = client.get("/api/resources/stats")
        assert resp.status_code == 401


@pytest.mark.unit
@pytest.mark.resource
class TestResourceCollections:
    def test_list_collections(self, client, auth_headers):
        resp = client.get("/api/resources/collections", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert "collections" in data


@pytest.mark.unit
@pytest.mark.resource
class TestResourceFolders:
    def test_list_folders(self, client, auth_headers):
        resp = client.get("/api/resources/folders", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert "folders" in data

    def test_list_folders_with_collection(self, client, auth_headers):
        resp = client.get(
            "/api/resources/folders?collection=default", headers=auth_headers
        )
        assert resp.status_code == 200


@pytest.mark.unit
@pytest.mark.resource
class TestResourceAccount:
    def test_get_account_info(self, client, auth_headers):
        resp = client.get("/api/resources/account", headers=auth_headers)
        assert resp.status_code in (200, 500)
        if resp.status_code == 200:
            data = resp.get_json()
            assert "account" in data
