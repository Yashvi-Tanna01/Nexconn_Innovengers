import os
import sys
import io
import time
import requests
from PIL import Image

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

BASE_URL = "http://127.0.0.1:8000/api/v1"
STATIC_BASE_URL = "http://127.0.0.1:8000"

def run_tests():
    print("=== STARTING FULL REPORT PHOTO ATTACHMENT VERIFICATION SUITE ===")

    # 1. Authenticate user
    print("\n--- 1. Authenticate Resident Account ---")
    login_resp = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "rajbusa5435@gmail.com",
        "password": "Password123!"
    })
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}
    print("Resident Authenticated successfully!")

    # 2. TEST 1: Create real JPG photograph & test upload
    print("\n--- TEST 1: Select and Upload JPG Photograph ---")
    jpg_buffer = io.BytesIO()
    img_jpg = Image.new("RGB", (320, 240), color=(8, 123, 86))
    img_jpg.save(jpg_buffer, format="JPEG")
    jpg_bytes = jpg_buffer.getvalue()

    # Create a test report first
    report_data = {
        "title": "Water Pipe Rupture on 4th Main",
        "description": "Subterranean pressure pipe bursting onto street with visible erosion.",
        "category": "water_leakage",
        "location": "4th Main Road, Sector 3 Quad (GPS: 12.9782, 77.6398)",
        "urgency": 4
    }
    create_report_resp = requests.post(f"{BASE_URL}/reports", json=report_data, headers=auth_headers)
    assert create_report_resp.status_code == 201, f"Create report failed: {create_report_resp.text}"
    report_id = create_report_resp.json()["id"]
    print(f"Report created with ID: {report_id}")

    # Upload JPG photo
    files = {"file": ("pipe_leak_evidence.jpg", jpg_bytes, "image/jpeg")}
    upload_resp = requests.post(f"{BASE_URL}/reports/{report_id}/attachments", files=files, headers=auth_headers)
    assert upload_resp.status_code == 201, f"JPG Upload failed: {upload_resp.text}"
    attachment_jpg = upload_resp.json()
    print(f"TEST 1 PASS: Uploaded JPG Attachment ID: {attachment_jpg['id']}, URL: {attachment_jpg['file_url']}")

    # 3. TEST 2: Select and Upload PNG Photograph
    print("\n--- TEST 2: Select and Upload PNG Photograph ---")
    png_buffer = io.BytesIO()
    img_png = Image.new("RGBA", (200, 200), color=(40, 107, 86, 255))
    img_png.save(png_buffer, format="PNG")
    png_bytes = png_buffer.getvalue()

    files = {"file": ("structural_crack.png", png_bytes, "image/png")}
    upload_png_resp = requests.post(f"{BASE_URL}/reports/{report_id}/attachments", files=files, headers=auth_headers)
    assert upload_png_resp.status_code == 201, f"PNG Upload failed: {upload_png_resp.text}"
    attachment_png = upload_png_resp.json()
    print(f"TEST 2 PASS: Uploaded PNG Attachment ID: {attachment_png['id']}, URL: {attachment_png['file_url']}")

    # 4. TEST 3: Remove and Replace Attachment
    print("\n--- TEST 3: Remove and Replace an Attachment ---")
    del_resp = requests.delete(f"{BASE_URL}/reports/{report_id}/attachments/{attachment_png['id']}", headers=auth_headers)
    assert del_resp.status_code == 204, f"Delete failed: {del_resp.text}"
    print(f"Deleted attachment {attachment_png['id']} successfully.")

    # Replace with a WEBP photo
    webp_buffer = io.BytesIO()
    img_webp = Image.new("RGB", (250, 250), color=(217, 154, 69))
    img_webp.save(webp_buffer, format="WEBP")
    webp_bytes = webp_buffer.getvalue()

    files = {"file": ("replacement_site_view.webp", webp_bytes, "image/webp")}
    replace_resp = requests.post(f"{BASE_URL}/reports/{report_id}/attachments", files=files, headers=auth_headers)
    assert replace_resp.status_code == 201, f"Replace upload failed: {replace_resp.text}"
    attachment_webp = replace_resp.json()
    print(f"TEST 3 PASS: Replaced with WEBP Attachment ID: {attachment_webp['id']}, URL: {attachment_webp['file_url']}")

    # 5. TEST 4 & 5: Verify Persistent Storage on Disk
    print("\n--- TEST 4 & 5: Verify Image Exists in Persistent Disk Storage ---")
    relative_path = attachment_jpg["file_url"].replace("/uploads/", "")
    backend_upload_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "uploads"))
    saved_file_path = os.path.join(backend_upload_dir, relative_path.replace("/", os.sep))
    assert os.path.exists(saved_file_path), f"File does not exist on disk at: {saved_file_path}"
    file_disk_size = os.path.getsize(saved_file_path)
    assert file_disk_size == len(jpg_bytes), f"Disk size {file_disk_size} does not match uploaded size {len(jpg_bytes)}"
    print(f"TEST 5 PASS: Verified file exists in persistent storage: {saved_file_path} (Size: {file_disk_size} bytes)")

    # 6. TEST 6: Verify PostgreSQL Relationship & Association
    print("\n--- TEST 6: Verify PostgreSQL Report & Attachment Association ---")
    get_report_resp = requests.get(f"{BASE_URL}/reports/{report_id}", headers=auth_headers)
    assert get_report_resp.status_code == 200, f"Get report failed: {get_report_resp.text}"
    report_details = get_report_resp.json()
    attachments = report_details.get("attachments", [])
    print(f"Retrieved report #{report_id} with {len(attachments)} attachments from PostgreSQL:")
    for att in attachments:
        print(f"  - ID: {att['id']}, File: {att['file_name']}, Type: {att['file_type']}, Size: {att['file_size']} bytes, URL: {att['file_url']}")
    assert any(a["id"] == attachment_jpg["id"] for a in attachments), "JPG attachment not found in DB!"
    assert any(a["id"] == attachment_webp["id"] for a in attachments), "WEBP attachment not found in DB!"
    print("TEST 6 PASS: PostgreSQL database records verified with active foreign key association!")

    # 7. TEST 7: Test Image Retrieval via HTTP (Static Serving)
    print("\n--- TEST 7: Verify Image Retrieval via HTTP Serving ---")
    file_url = f"{STATIC_BASE_URL}{attachment_jpg['file_url']}"
    fetch_resp = requests.get(file_url)
    assert fetch_resp.status_code == 200, f"Failed to retrieve image via {file_url}: {fetch_resp.status_code}"
    assert len(fetch_resp.content) == len(jpg_bytes), "Retrieved image bytes do not match uploaded bytes!"
    print(f"TEST 7 PASS: Retrieved image from {file_url} (HTTP 200 OK, {len(fetch_resp.content)} bytes received)")

    # 8. TEST 9: Test Unsupported File Format
    print("\n--- TEST 9: Test Unsupported File Format (Text / Shell Script / SVG) ---")
    bad_files = {"file": ("malicious_payload.sh", b"#!/bin/bash\necho hacked", "text/x-shellscript")}
    bad_resp = requests.post(f"{BASE_URL}/reports/{report_id}/attachments", files=bad_files, headers=auth_headers)
    print(f"Rejected unsupported format: Status {bad_resp.status_code}, Detail: {bad_resp.json().get('detail')}")
    assert bad_resp.status_code == 400, f"Expected 400 for bad format, got {bad_resp.status_code}"

    # Forged file (fake jpg extension but text content)
    forged_files = {"file": ("forged_photo.jpg", b"This is not a real jpeg binary data", "image/jpeg")}
    forged_resp = requests.post(f"{BASE_URL}/reports/{report_id}/attachments", files=forged_files, headers=auth_headers)
    print(f"Rejected forged JPEG header: Status {forged_resp.status_code}, Detail: {forged_resp.json().get('detail')}")
    assert forged_resp.status_code == 400, f"Expected 400 for forged image, got {forged_resp.status_code}"
    print("TEST 9 PASS: Server rejected unsupported format and forged extension.")

    # 9. TEST 10: Test Photograph Exceeding Size Limit (>10MB)
    print("\n--- TEST 10: Test Photograph Exceeding Size Limit (>10MB) ---")
    large_bytes = b"\xff\xd8\xff" + b"0" * (11 * 1024 * 1024) # 11MB fake jpg
    large_files = {"file": ("huge_photo.jpg", large_bytes, "image/jpeg")}
    large_resp = requests.post(f"{BASE_URL}/reports/{report_id}/attachments", files=large_files, headers=auth_headers)
    print(f"Rejected oversized file: Status {large_resp.status_code}, Detail: {large_resp.json().get('detail')}")
    assert large_resp.status_code == 400, f"Expected 400 for oversized image, got {large_resp.status_code}"
    print("TEST 10 PASS: File exceeding 10MB limit was rejected with descriptive error.")

    # 10. Clean-up test report (optional, or leave for persistence check)
    print(f"\nReport ID {report_id} and its evidence photographs are preserved.")
    print("\n=== ALL PHOTO ATTACHMENT SUITE TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_tests()
