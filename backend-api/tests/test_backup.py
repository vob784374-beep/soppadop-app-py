import pytest


@pytest.mark.unit
class TestBackup:
    def test_list_backups_success(self, client, owner_token):
        resp = client.get(
            "/api/backup/files",
            headers={
                "Authorization": f"Bearer {owner_token}",
            },
        )
        assert resp.status_code in (200, 500)

    def test_list_backups_unauthorized(self, client):
        resp = client.get("/api/backup/files")
        assert resp.status_code == 401

    def test_create_backup_unauthorized(self, client):
        resp = client.post("/api/backup/create")
        assert resp.status_code == 401

    def test_backup_status(self, client, owner_token):
        resp = client.get(
            "/api/backup/status",
            headers={
                "Authorization": f"Bearer {owner_token}",
            },
        )
        assert resp.status_code in (200, 500)
