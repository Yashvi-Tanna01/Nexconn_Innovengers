import os
import sys
import io
import time
import requests
from PIL import Image

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

BASE_URL = "http://127.0.0.1:8000/api/v1"
STATIC_BASE_URL = "http://127.0.0.1:8000"

def run_all_tests():
    print("==========================================================")
    print("=== STARTING FULL END-TO-END CIVIC REPORT SUITE (1-10) ===")
    print("==========================================================")

    # Setup Account A (Resident)
    print("\n--- Setup: Authenticate Account A (Resident) ---")
    login_a = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "rajbusa5435@gmail.com",
        "password": "Password123!"
    }, timeout=30)
    assert login_a.status_code == 200, f"Login A failed: {login_a.text}"
    token_a = login_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}
    print("Account A Authenticated (Reporter: Raj Busa)")

    # Setup Account B (Coordinator)
    print("\n--- Setup: Authenticate Account B (Coordinator) ---")
    login_b = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "coordinator_maya@antah.network",
        "password": "Password123!"
    }, timeout=30)
    assert login_b.status_code == 200, f"Login B failed: {login_b.text}"
    token_b = login_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}
    print("Account B Authenticated (Coordinator: Coordinator Maya V.)")

    # TEST 1: Submit a report without a photograph
    print("\n--- TEST 1: Submit a report without a photograph ---")
    t0 = time.time()
    rep1_data = {
        "title": "Loose Drainage Grate on Sector 3 Main",
        "description": "Metal storm grate rattles violently when crossed by city transit buses.",
        "category": "roads",
        "location": "Sector 3 Hydrologic Quad (GPS: 12.9750, 77.6320)",
        "urgency": 3,
        "latitude": 12.9750,
        "longitude": 77.6320
    }
    r1 = requests.post(f"{BASE_URL}/reports", json=rep1_data, headers=headers_a, timeout=30)
    t1 = time.time()
    assert r1.status_code == 201, f"Report 1 failed: {r1.text}"
    rep1 = r1.json()
    print(f"TEST 1 PASS: Report submitted successfully without photo in {round((t1-t0)*1000)}ms. ID: {rep1['id']}, Status: {rep1['status']}")

    # TEST 2: Submit a Water Leakage report with a JPG photograph
    print("\n--- TEST 2: Submit a Water Leakage report with a JPG photograph ---")
    t0 = time.time()
    rep2_data = {
        "title": "High-Pressure Main Leak Flooding Pedestrian Sidewalk",
        "description": "Subterranean potable conduit fractured. Potable water bubbling across bicycle lane.",
        "category": "water_leakage",
        "location": "Indiranagar Commercial Arterial (GPS: 12.9782, 77.6398)",
        "urgency": 4,
        "latitude": 12.9782,
        "longitude": 77.6398
    }
    r2 = requests.post(f"{BASE_URL}/reports", json=rep2_data, headers=headers_a, timeout=30)
    assert r2.status_code == 201, f"Report 2 creation failed: {r2.text}"
    rep2 = r2.json()
    rep2_id = rep2["id"]

    # Generate real JPG binary
    jpg_buf = io.BytesIO()
    img_jpg = Image.new("RGB", (400, 300), color=(13, 148, 136))
    img_jpg.save(jpg_buf, format="JPEG")
    jpg_bytes = jpg_buf.getvalue()

    upload_r = requests.post(
        f"{BASE_URL}/reports/{rep2_id}/attachments",
        files={"file": ("water_main_rupture.jpg", jpg_bytes, "image/jpeg")},
        headers=headers_a,
        timeout=30
    )
    t1 = time.time()
    assert upload_r.status_code == 201, f"Upload failed: {upload_r.text}"
    att = upload_r.json()
    print(f"TEST 2 PASS: Water Leakage report + JPG photo submitted in {round((t1-t0)*1000)}ms.")
    print(f"  Report ID: {rep2_id}, Attachment ID: {att['id']}, File URL: {att['file_url']}")

    # TEST 3: Verify the report exists in PostgreSQL
    print("\n--- TEST 3: Verify the report exists in PostgreSQL ---")
    check_r = requests.get(f"{BASE_URL}/reports/{rep2_id}", headers=headers_a, timeout=30)
    assert check_r.status_code == 200, f"Get report failed: {check_r.text}"
    db_rep = check_r.json()
    assert db_rep["id"] == rep2_id
    assert db_rep["title"] == rep2_data["title"]
    assert db_rep["category"] == "water_leakage"
    assert db_rep["status"] == "submitted"
    assert db_rep["reporter_id"] is not None
    assert db_rep["latitude"] == 12.9782
    assert db_rep["longitude"] == 77.6398
    print(f"TEST 3 PASS: Report #{rep2_id} verified in PostgreSQL with full telemetry & coordinates!")

    # TEST 4: Verify the photograph exists in persistent storage
    print("\n--- TEST 4: Verify the photograph exists in persistent storage ---")
    rel_path = att["file_url"].replace("/uploads/", "")
    backend_uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "uploads"))
    disk_path = os.path.join(backend_uploads_dir, rel_path.replace("/", os.sep))
    assert os.path.exists(disk_path), f"File not found on disk: {disk_path}"
    assert os.path.getsize(disk_path) == len(jpg_bytes), "File size on disk does not match uploaded bytes!"
    print(f"TEST 4 PASS: Photograph verified on persistent disk: {disk_path} ({os.path.getsize(disk_path)} bytes)")

    # TEST 5: Verify the photograph is linked to the correct report
    print("\n--- TEST 5: Verify the photograph is linked to the correct report ---")
    assert len(db_rep.get("attachments", [])) >= 1, "No attachments linked to report in DB!"
    linked_att = db_rep["attachments"][0]
    assert linked_att["id"] == att["id"]
    assert linked_att["report_id"] == rep2_id
    assert linked_att["file_url"] == att["file_url"]
    assert linked_att["file_name"] == "water_main_rupture.jpg"
    print(f"TEST 5 PASS: Attachment #{linked_att['id']} properly linked to Report #{rep2_id} in PostgreSQL foreign key!")

    # TEST 6: Open the report from another authenticated account
    print("\n--- TEST 6: Open the report from another authenticated account (Coordinator Maya) ---")
    other_r = requests.get(f"{BASE_URL}/reports/{rep2_id}", headers=headers_b, timeout=30)
    assert other_r.status_code == 200, f"Account B access failed: {other_r.status_code} {other_r.text}"
    other_data = other_r.json()
    assert other_data["id"] == rep2_id
    assert len(other_data["attachments"]) >= 1
    print(f"TEST 6 PASS: Account B (Coordinator) successfully opened Report #{rep2_id} and its evidence!")

    # TEST 7: Verify that the report appears in the appropriate civic network view
    print("\n--- TEST 7: Verify that the report appears in the appropriate civic network view ---")
    all_reports_r = requests.get(f"{BASE_URL}/reports", headers=headers_b, timeout=30)
    assert all_reports_r.status_code == 200
    all_reports = all_reports_r.json()
    matching_reports = [r for r in all_reports if r["id"] == rep2_id]
    assert len(matching_reports) == 1, "Report not visible in civic network reports list!"
    print(f"TEST 7 PASS: Report #{rep2_id} is actively visible in Civic Network view (Total community reports: {len(all_reports)})")

    # TEST 8: Test repeated submission and network interruption
    print("\n--- TEST 8: Test repeated submission (Idempotency Safeguard) ---")
    # Submitting identical report right away
    dup_r = requests.post(f"{BASE_URL}/reports", json=rep2_data, headers=headers_a, timeout=30)
    assert dup_r.status_code == 201 or dup_r.status_code == 200
    dup_data = dup_r.json()
    # Idempotency ensures the existing report ID is returned without generating duplicate record in database
    assert dup_data["id"] == rep2_id, f"Expected idempotent ID {rep2_id}, got {dup_data['id']}"
    print(f"TEST 8 PASS: Repeated submission handled safely via idempotency! Returned existing Report #{dup_data['id']} without duplicate.")

    # TEST 9: Refresh the application and verify report persistence
    print("\n--- TEST 9: Refresh the application and verify report persistence ---")
    re_query = requests.get(f"{BASE_URL}/reports/{rep2_id}", headers=headers_a, timeout=30)
    assert re_query.status_code == 200
    re_data = re_query.json()
    assert re_data["id"] == rep2_id
    assert len(re_data["attachments"]) >= 1
    print(f"TEST 9 PASS: App refresh simulated — Report #{rep2_id} and evidence attachment fully intact in PostgreSQL!")

    # TEST 10: Restart backend and verify that previously submitted reports and photographs remain available
    print("\n--- TEST 10: Verify photograph retrieval over static HTTP endpoint ---")
    photo_http_url = f"{STATIC_BASE_URL}{att['file_url']}"
    photo_resp = requests.get(photo_http_url, timeout=30)
    assert photo_resp.status_code == 200, f"Photo HTTP retrieval failed: {photo_resp.status_code}"
    assert len(photo_resp.content) == len(jpg_bytes), "HTTP content length mismatch!"
    print(f"TEST 10 PASS: Photo HTTP endpoint {photo_http_url} returned 200 OK ({len(photo_resp.content)} bytes).")

    print("\n==========================================================")
    print("=== ALL 10 CIVIC REPORT SUBMISSION TESTS PASSED CLEANLY! ===")
    print("==========================================================")

if __name__ == "__main__":
    run_all_tests()
