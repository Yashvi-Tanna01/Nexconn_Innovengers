import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_registration_flow():
    test_id = uuid.uuid4().hex[:8]
    test_email = f"resident_{test_id}@antah.network"
    test_name = f"Resident Tester {test_id}"
    test_password = "SecurePassword2026!"

    print(f"\n--- 1. Testing Registration for {test_email} ---")
    reg_payload = {
        "email": test_email,
        "full_name": test_name,
        "password": test_password,
        "role": "reporter",
    }
    reg_resp = client.post("/api/v1/auth/register", json=reg_payload)
    print("Registration Status:", reg_resp.status_code)
    print("Registration Response:", reg_resp.json())
    assert reg_resp.status_code == 201, f"Expected 201, got {reg_resp.status_code}: {reg_resp.text}"
    user_data = reg_resp.json()
    assert user_data["email"] == test_email
    assert user_data["full_name"] == test_name
    assert user_data["role"] == "reporter"
    assert user_data["is_active"] is True
    assert "password_hash" not in user_data, "Security alert: password_hash must never be in UserOut response"

    print("\n--- 2. Testing Duplicate Registration Rejection ---")
    dup_resp = client.post("/api/v1/auth/register", json=reg_payload)
    print("Duplicate Status:", dup_resp.status_code)
    print("Duplicate Response:", dup_resp.json())
    assert dup_resp.status_code == 409, f"Expected 409, got {dup_resp.status_code}: {dup_resp.text}"
    assert "Email already registered" in dup_resp.json()["detail"]

    print("\n--- 3. Testing Short Password Validation (< 8 chars) ---")
    short_pw_resp = client.post("/api/v1/auth/register", json={
        "email": f"short_{test_id}@antah.network",
        "full_name": "Short Pw",
        "password": "123",
        "role": "reporter",
    })
    print("Short Password Status:", short_pw_resp.status_code)
    print("Short Password Response:", short_pw_resp.json())
    assert short_pw_resp.status_code == 422, f"Expected 422, got {short_pw_resp.status_code}"

    print("\n--- 4. Testing Login with Registered Resident ---")
    login_resp = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": test_password,
    })
    print("Login Status:", login_resp.status_code)
    assert login_resp.status_code == 200, f"Expected 200, got {login_resp.status_code}: {login_resp.text}"
    token_data = login_resp.json()
    assert "access_token" in token_data
    assert "refresh_token" in token_data
    access_token = token_data["access_token"]
    print("Access token generated successfully.")

    print("\n--- 5. Testing Authenticated /api/v1/auth/me ---")
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {access_token}"})
    print("Auth/me Status:", me_resp.status_code)
    print("Auth/me Response:", me_resp.json())
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == test_email
    assert me_resp.json()["id"] == user_data["id"]

    print("\n==========================================")
    print("ALL REGISTRATION & AUTH FLOW TESTS PASSED!")
    print("==========================================")

if __name__ == "__main__":
    test_full_registration_flow()

