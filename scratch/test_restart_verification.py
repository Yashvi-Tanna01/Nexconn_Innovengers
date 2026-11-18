import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"
STATIC_URL = "http://127.0.0.1:8000/uploads/reports/rep_3_0d313af2b6b9_1794985178.jpg"

def verify_restart():
    print("=== RUNNING TEST 8: POST-RESTART VERIFICATION ===")
    
    # 1. Direct static photo fetch
    resp = requests.get(STATIC_URL)
    assert resp.status_code == 200, f"Expected 200 OK after restart, got {resp.status_code}"
    assert len(resp.content) == 1828, f"Expected 1828 bytes, got {len(resp.content)}"
    print(f"TEST 8 PART 1 PASS: Image re-fetched successfully after backend restart! (HTTP 200, {len(resp.content)} bytes)")

    # 2. Database association check
    login_resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "rajbusa5435@gmail.com",
        "password": "Password123!"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    
    report_resp = requests.get(f"{BASE_URL}/reports/3", headers={"Authorization": f"Bearer {token}"})
    assert report_resp.status_code == 200
    data = report_resp.json()
    assert len(data.get("attachments", [])) >= 2
    print(f"TEST 8 PART 2 PASS: PostgreSQL report record retained all attachment linkages across server reboot!")
    print("=== TEST 8 FULLY PASSED! ===")

if __name__ == "__main__":
    verify_restart()
