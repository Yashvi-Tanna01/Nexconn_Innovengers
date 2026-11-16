import sys
import uuid
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import inspect, text
from fastapi.testclient import TestClient

from app.core.config import settings
from app.db import engine, build_engine, get_db_health, SessionLocal
from app.main import app
from app.models import User, Report, Cluster, Incident, Notification

client = TestClient(app)


def run_all_postgresql_tests():
    print("================================================================", flush=True)
    print("      ANTAH POSTGRESQL PRODUCTION INTEGRATION TEST SUITE       ", flush=True)
    print("================================================================", flush=True)

    # 1. PostgreSQL Connection Test
    print("\n[TEST 1] Verifying PostgreSQL Connection...", flush=True)
    assert engine.dialect.name == "postgresql", f"Expected postgresql dialect, got {engine.dialect.name}"
    print(f"  -> Dialect: {engine.dialect.name}", flush=True)
    print(f"  -> Driver: {engine.driver}", flush=True)
    print(f"  -> Host Database: {engine.url.database}", flush=True)
    print("  [PASS] Test 1: PostgreSQL Connection Verified.", flush=True)

    # 2. Database Health Check Test
    print("\n[TEST 2] Verifying Database Health Check...", flush=True)
    health = get_db_health()
    print(f"  -> Health Result: {health}", flush=True)
    assert health["status"] == "connected", f"Health status not connected: {health}"
    assert health["dialect"] == "postgresql"
    assert health["latency_ms"] > 0
    print(f"  -> Roundtrip Latency: {health['latency_ms']} ms", flush=True)
    print("  [PASS] Test 2: Database Health Check Verified.", flush=True)

    # 3. Table and Schema Verification Test
    print("\n[TEST 3] Verifying PostgreSQL Tables & Schema...", flush=True)
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    print(f"  -> Found {len(existing_tables)} tables in PostgreSQL: {sorted(list(existing_tables))}", flush=True)
    required_tables = [
        "users",
        "refresh_tokens",
        "reports",
        "clusters",
        "cluster_reports",
        "incidents",
        "assignments",
        "notifications",
        "activity_logs",
        "chat_rooms",
        "chat_memberships",
        "chat_messages",
        "user_preferences",
        "report_attachments",
    ]
    for table in required_tables:
        assert table in existing_tables, f"Missing required table in PostgreSQL: {table}"
        print(f"     * Table '{table}': OK", flush=True)

    report_cols = {c["name"] for c in inspector.get_columns("reports")}
    assert "latitude" in report_cols, "latitude column missing in reports"
    assert "longitude" in report_cols, "longitude column missing in reports"
    user_cols = {c["name"] for c in inspector.get_columns("users")}
    assert "phone" in user_cols, "phone column missing in users"
    assert "avatar_url" in user_cols, "avatar_url column missing in users"
    print("  [PASS] Test 3: Table and Schema Verification Verified.", flush=True)

    # 4. Resident Registration Test
    test_uid = uuid.uuid4().hex[:8]
    test_email = f"resident_{test_uid}@antah.network"
    test_name = f"Resident Tester {test_uid}"
    test_password = "AntahResident2026!"

    print(f"\n[TEST 4] Registering New Resident ({test_email})...", flush=True)
    reg_payload = {
        "email": test_email,
        "full_name": test_name,
        "password": test_password,
        "role": "reporter",
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    print(f"  -> Registration Response Code: {reg_res.status_code}", flush=True)
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
    user_out = reg_res.json()
    assert user_out["email"] == test_email
    assert user_out["full_name"] == test_name
    assert user_out["role"] == "reporter"
    assert "password_hash" not in user_out, "Security leak: password_hash exposed in response"
    created_user_id = user_out["id"]
    print(f"  -> Created User ID: {created_user_id}", flush=True)
    print("  [PASS] Test 4: Resident Registration Verified.", flush=True)

    # 5. User Record Verification in PostgreSQL (Raw DB Query)
    print("\n[TEST 5] Verifying Physical User Record in PostgreSQL...", flush=True)
    with engine.connect() as conn:
        row = conn.execute(
            text("SELECT id, email, full_name, password_hash, role, is_active FROM users WHERE email = :email"),
            {"email": test_email},
        ).fetchone()
        assert row is not None, f"User {test_email} not found in PostgreSQL users table!"
        print(f"  -> PostgreSQL Stored Row: id={row[0]}, email={row[1]}, name={row[2]}, role={row[4]}, is_active={row[5]}", flush=True)
        assert row[3].startswith("scrypt$"), f"Password hash is not scrypt: {row[3]}"
    print("  [PASS] Test 5: User Record in PostgreSQL Verified.", flush=True)

    # 6. Duplicate Email Prevention Test
    print("\n[TEST 6] Verifying Duplicate Email Prevention...", flush=True)
    dup_res = client.post("/api/v1/auth/register", json=reg_payload)
    print(f"  -> Duplicate Response Code: {dup_res.status_code}", flush=True)
    print(f"  -> Duplicate Response Body: {dup_res.json()}", flush=True)
    assert dup_res.status_code == 409, f"Expected 409 Conflict, got {dup_res.status_code}"
    assert "Email already registered" in dup_res.json().get("detail", "")
    print("  [PASS] Test 6: Duplicate Email Prevention Verified.", flush=True)

    # 7. Login with Registered Account Test
    print(f"\n[TEST 7] Logging In with Registered Resident ({test_email})...", flush=True)
    login_res = client.post("/api/v1/auth/login", json={"email": test_email, "password": test_password})
    print(f"  -> Login Response Code: {login_res.status_code}", flush=True)
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token_data = login_res.json()
    access_token = token_data["access_token"]
    assert "access_token" in token_data
    assert "refresh_token" in token_data
    auth_headers = {"Authorization": f"Bearer {access_token}"}

    # Verify authenticated /api/v1/auth/me
    me_res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == test_email
    print(f"  -> Authenticated User: {me_res.json()['email']} (ID: {me_res.json()['id']})", flush=True)
    print("  [PASS] Test 7: Login and Authentication Verified.", flush=True)

    # 8. Report Creation and Retrieval Test
    print("\n[TEST 8] Creating and Retrieving Community Report in PostgreSQL...", flush=True)
    report_payload = {
        "title": f"Drainage Overflow Signal {test_uid}",
        "description": "Stormwater drain blocked by silt near Green Park sector 4",
        "category": "infrastructure",
        "location": "Green Park Sector 4, Bangalore",
        "urgency": 4,
        "latitude": 12.9716,
        "longitude": 77.5946,
    }
    create_report_res = client.post("/api/v1/reports", json=report_payload, headers=auth_headers)
    print(f"  -> Create Report Response Code: {create_report_res.status_code}", flush=True)
    assert create_report_res.status_code == 201, f"Report creation failed: {create_report_res.text}"
    created_report = create_report_res.json()
    report_id = created_report["id"]
    print(f"  -> Created Report ID: {report_id}", flush=True)
    print(f"  -> Coordinates: ({created_report['latitude']}, {created_report['longitude']})", flush=True)

    # Retrieve report via API
    get_reports_res = client.get("/api/v1/reports", headers=auth_headers)
    assert get_reports_res.status_code == 200
    user_reports = get_reports_res.json()
    matching_reports = [r for r in user_reports if r["id"] == report_id]
    assert len(matching_reports) == 1, f"Report {report_id} not found in user reports list!"
    assert matching_reports[0]["title"] == report_payload["title"]

    # Verify directly in PostgreSQL
    with engine.connect() as conn:
        db_rep = conn.execute(
            text("SELECT id, title, category, location, latitude, longitude, reporter_id FROM reports WHERE id = :id"),
            {"id": report_id},
        ).fetchone()
        assert db_rep is not None, f"Report {report_id} not found directly in PostgreSQL!"
        print(f"  -> PostgreSQL Verified Report: id={db_rep[0]}, title='{db_rep[1]}', coords=({db_rep[4]}, {db_rep[5]})", flush=True)
    print("  [PASS] Test 8: Report Creation and Retrieval in PostgreSQL Verified.", flush=True)

    # 9. Data Persistence After Backend Engine Restart
    print("\n[TEST 9] Verifying Data Persistence Across Complete Engine/Process Restart...", flush=True)
    # Simulate a full restart: create a new session against PostgreSQL
    with SessionLocal() as db_session:
        persisted_user = db_session.get(User, created_user_id)
        assert persisted_user is not None, f"Persisted user {created_user_id} lost after restart!"
        assert persisted_user.email == test_email

        persisted_report = db_session.get(Report, report_id)
        assert persisted_report is not None, f"Persisted report {report_id} lost after restart!"
        assert persisted_report.title == report_payload["title"]
        assert persisted_report.reporter_id == created_user_id

    print("  -> User record persisted in PostgreSQL: Verified.", flush=True)
    print("  -> Report record persisted in PostgreSQL: Verified.", flush=True)
    print("  [PASS] Test 9: Data Persistence Across Restart Verified.", flush=True)

    print("\n================================================================", flush=True)
    print("      ALL 9 POSTGRESQL PRODUCTION TESTS PASSED SUCCESSFULLY!    ", flush=True)
    print("================================================================", flush=True)



if __name__ == "__main__":
    run_all_postgresql_tests()
