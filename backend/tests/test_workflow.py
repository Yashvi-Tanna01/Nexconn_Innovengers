import os
os.environ["DATABASE_URL"] = "sqlite:///./test_antah_workflow.db"

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def register(email, role="reporter"):
    response = client.post("/api/v1/auth/register", json={
        "email": email, "full_name": role.title(), "password": "secure-password", "role": role
    })
    assert response.status_code == 201, response.text
    return response.json()

def token(email):
    response = client.post("/api/v1/auth/login", json={"email": email, "password": "secure-password"})
    assert response.status_code == 200
    return response.json()["access_token"]

def auth(value): return {"Authorization": f"Bearer {value}"}

def test_report_cluster_approval_assignment_completion():
    suffix = "workflow@example.com"
    reporter = register(suffix)
    reporter_token = token(suffix)
    for title in ("Broken streetlight", "Streetlight outage"):
        response = client.post("/api/v1/reports", headers=auth(reporter_token), json={
            "title": title, "description": "Light is out near the crossing",
            "category": "lighting", "location": "Ward 7", "urgency": 4
        })
        assert response.status_code == 201

    coordinator_email = "coordinator-workflow@example.com"
    register(coordinator_email, "coordinator")
    coordinator_token = token(coordinator_email)
    clusters = client.post("/api/v1/intelligence/clusters", headers=auth(coordinator_token))
    assert clusters.status_code == 200
    cluster = clusters.json()[0]
    assert "category" in cluster["explanation"]
    reviewed = client.post(f"/api/v1/clusters/{cluster['id']}/review", headers=auth(coordinator_token),
                           json={"decision": "approved"})
    assert reviewed.status_code == 200

    responder_email = "responder-workflow@example.com"
    responder = register(responder_email, "responder")
    incident_id = client.get("/api/v1/analytics", headers=auth(coordinator_token)).json()["incidents"]
    assigned = client.post(f"/api/v1/incidents/{incident_id}/assign", headers=auth(coordinator_token),
                           json={"responder_id": responder["id"]})
    assert assigned.status_code == 201
    responder_token = token(responder_email)
    complete = client.patch(f"/api/v1/assignments/{assigned.json()['id']}", headers=auth(responder_token),
                            json={"progress": 100, "note": "Replaced bulb"})
    assert complete.status_code == 200
    assert complete.json()["status"] == "completed"
    assert client.get("/api/v1/notifications", headers=auth(responder_token)).json()
