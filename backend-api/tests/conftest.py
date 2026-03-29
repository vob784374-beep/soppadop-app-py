import os
import pytest
import tempfile
from io import BytesIO
from src.app import create_app
from src.api.models import db, User, Role, Permission, Resource


@pytest.fixture(scope="session")
def app():
    os.environ["FLASK_ENV"] = "testing"
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    os.environ["SECRET_KEY"] = "test-secret-key"
    os.environ["JWT_SECRET_KEY"] = "test-jwt-secret"
    os.environ["CORS_ORIGINS"] = "*"

    app = create_app("testing")
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    app.config["WTF_CSRF_ENABLED"] = False

    with app.app_context():
        db.create_all()
        _seed_test_data()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope="function")
def client(app):
    return app.test_client()


@pytest.fixture(scope="function")
def db_session(app):
    with app.app_context():
        yield db.session
        db.session.rollback()


def _seed_test_data():
    owner_role = Role(
        name="super_admin",
        description="Super Admin",
        is_system=True,
        is_super_admin=True,
    )
    admin_role = Role(
        name="admin",
        description="Admin",
        is_system=True,
        is_super_admin=False,
    )
    manager_role = Role(
        name="manager",
        description="Manager",
        is_system=True,
        is_super_admin=False,
    )
    client_role = Role(
        name="client",
        description="Client",
        is_system=True,
        is_super_admin=False,
    )
    db.session.add_all([owner_role, admin_role, manager_role, client_role])
    db.session.flush()

    perms = [
        Permission(name="users.view", resource="users", action="view"),
        Permission(name="users.create", resource="users", action="create"),
        Permission(name="users.update", resource="users", action="update"),
        Permission(name="users.delete", resource="users", action="delete"),
        Permission(name="resources.view", resource="resources", action="view"),
        Permission(name="resources.upload", resource="resources", action="upload"),
        Permission(name="resources.delete", resource="resources", action="delete"),
        Permission(name="system.health", resource="system", action="health"),
    ]
    db.session.add_all(perms)
    db.session.flush()

    for p in perms:
        owner_role.permissions.append(p)
    for p in perms:
        if "delete" not in p.name:
            admin_role.permissions.append(p)
    for p in perms:
        if p.resource in ("users", "resources") and p.action in (
            "view",
            "create",
            "update",
            "upload",
        ):
            manager_role.permissions.append(p)
    for p in perms:
        if p.resource == "resources" and p.action in ("view", "upload"):
            client_role.permissions.append(p)

    from werkzeug.security import generate_password_hash

    owner = User(
        email="owner@test.com",
        username="owner",
        password_hash=generate_password_hash("Test@123"),
        role_id=owner_role.id,
        is_active=True,
        is_owner=True,
    )
    admin = User(
        email="admin@test.com",
        username="admin",
        password_hash=generate_password_hash("Test@123"),
        role_id=admin_role.id,
        is_active=True,
        is_owner=False,
    )
    manager = User(
        email="manager@test.com",
        username="manager",
        password_hash=generate_password_hash("Test@123"),
        role_id=manager_role.id,
        is_active=True,
        is_owner=False,
    )
    client_user = User(
        email="client@test.com",
        username="client",
        password_hash=generate_password_hash("Test@123"),
        role_id=client_role.id,
        is_active=True,
        is_owner=False,
    )
    inactive = User(
        email="inactive@test.com",
        username="inactive",
        password_hash=generate_password_hash("Test@123"),
        role_id=client_role.id,
        is_active=False,
        is_owner=False,
    )
    db.session.add_all([owner, admin, manager, client_user, inactive])
    db.session.commit()


@pytest.fixture
def owner_token(client):
    resp = client.post(
        "/api/auth/login",
        json={
            "email": "owner@test.com",
            "password": "Test@123",
        },
    )
    return resp.get_json()["access_token"]


@pytest.fixture
def admin_token(client):
    resp = client.post(
        "/api/auth/login",
        json={
            "email": "admin@test.com",
            "password": "Test@123",
        },
    )
    return resp.get_json()["access_token"]


@pytest.fixture
def manager_token(client):
    resp = client.post(
        "/api/auth/login",
        json={
            "email": "manager@test.com",
            "password": "Test@123",
        },
    )
    return resp.get_json()["access_token"]


@pytest.fixture
def client_token(client):
    resp = client.post(
        "/api/auth/login",
        json={
            "email": "client@test.com",
            "password": "Test@123",
        },
    )
    return resp.get_json()["access_token"]


@pytest.fixture
def auth_headers(owner_token):
    return {
        "Authorization": f"Bearer {owner_token}",
        "Content-Type": "application/json",
    }


@pytest.fixture
def admin_headers(admin_token):
    return {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json",
    }


@pytest.fixture
def client_headers(client_token):
    return {
        "Authorization": f"Bearer {client_token}",
        "Content-Type": "application/json",
    }


@pytest.fixture
def sample_file():
    return (BytesIO(b"test file content"), "test.txt")


@pytest.fixture
def sample_image():
    return (BytesIO(b"fake image data"), "test.png", "image/png")
