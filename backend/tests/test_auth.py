from fastapi.testclient import TestClient
from fastapi.routing import APIRoute

from app.db import SessionLocal
from app.main import app
from app.models import User
from app.security import hash_password


client = TestClient(app)


def auth(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def create_user(email: str, role: str = "reporter") -> None:
    with SessionLocal() as db:
        db.add(User(
            email=email,
            full_name=role.title(),
            password_hash=hash_password("secure-password"),
            role=role,
        ))
        db.commit()


def login(email: str) -> str:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "secure-password"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_registration_forces_public_reporter_role_and_duplicate_is_rejected():
    payload = {
        "email": "new-user@example.com",
        "full_name": "New User",
        "password": "secure-password",
        "role": "coordinator",
    }
    created = client.post("/api/v1/auth/register", json=payload)
    assert created.status_code == 201
    assert created.json()["role"] == "reporter"

    duplicate = client.post("/api/v1/auth/register", json=payload)
    assert duplicate.status_code == 409


def test_private_endpoint_requires_valid_authentication():
    assert client.get("/api/v1/auth/me").status_code == 401
    assert client.get("/api/v1/auth/me", headers=auth("invalid-token")).status_code == 401


def test_current_user_and_role_authorization():
    create_user("resident@example.com")
    create_user("coordinator@example.com", "coordinator")

    resident_token = login("resident@example.com")
    coordinator_token = login("coordinator@example.com")

    current = client.get("/api/v1/auth/me", headers=auth(resident_token))
    assert current.status_code == 200
    assert current.json()["email"] == "resident@example.com"

    forbidden = client.post(
        "/api/v1/intelligence/clusters",
        headers=auth(resident_token),
    )
    assert forbidden.status_code == 403

    permitted = client.post(
        "/api/v1/intelligence/clusters",
        headers=auth(coordinator_token),
    )
    assert permitted.status_code == 200


def test_route_inspection_uses_public_route_type():
    paths = {
        route.path
        for route in app.routes
        if isinstance(route, APIRoute)
    }
    assert "/api/v1/health" in paths


def test_chatroom_membership_and_authenticated_sender():
    create_user("resident@example.com")
    token = login("resident@example.com")
    rooms = client.get("/api/v1/chat/rooms", headers=auth(token))
    assert rooms.status_code == 200
    community = next(room for room in rooms.json() if room["room_type"] == "community")

    sent = client.post(
        f"/api/v1/chat/rooms/{community['id']}/messages",
        headers=auth(token),
        json={"text": "A real authenticated message"},
    )
    assert sent.status_code == 201
    assert sent.json()["sender_id"] > 0
    assert sent.json()["sender_name"] == "Reporter"

    history = client.get(
        f"/api/v1/chat/rooms/{community['id']}/messages",
        headers=auth(token),
    )
    assert history.status_code == 200
    assert history.json()[0]["text"] == "A real authenticated message"
