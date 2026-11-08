from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import *
from app.schemas import *
from app.security import *

router = APIRouter(prefix="/api/v1")

def log(db, actor, action, entity, entity_id, details=""):
    db.add(ActivityLog(actor_id=actor.id, action=action, entity_type=entity, entity_id=entity_id, details=details))

@router.post("/auth/register", response_model=UserOut, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email.lower()).first():
        raise HTTPException(409, "Email already registered")
    user = User(
        email=data.email.lower(),
        full_name=data.full_name,
        password_hash=hash_password(data.password),
        role="reporter",
    )
    db.add(user); db.commit(); db.refresh(user)
    return user

@router.post("/auth/login", response_model=Token)
def login(data: Login, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return Token(access_token=create_token(user))

@router.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(current_user)): return user

@router.post("/reports", response_model=ReportOut, status_code=201)
def create_report(data: ReportCreate, db: Session = Depends(get_db), user: User = Depends(current_user)):
    report = Report(**data.model_dump(), reporter_id=user.id)
    db.add(report); db.commit(); db.refresh(report); log(db, user, "created", "report", report.id); db.commit()
    return report

@router.get("/reports", response_model=list[ReportOut])
def reports(db: Session = Depends(get_db), user: User = Depends(current_user)):
    q = db.query(Report)
    return q.filter(Report.reporter_id == user.id).all() if user.role == "reporter" else q.order_by(Report.created_at.desc()).all()

@router.post("/intelligence/clusters", response_model=list[ClusterOut])
def generate_clusters(db: Session = Depends(get_db), user: User = Depends(require_roles("coordinator", "admin"))):
    reports = db.query(Report).filter(Report.status == "submitted").all()
    groups = {}
    for report in reports:
        key = (report.category.lower(), report.location.lower())
        groups.setdefault(key, []).append(report)
    result = []
    for (category, location), items in groups.items():
        if len(items) < 2: continue
        score = min(1.0, 0.45 + 0.2 * min(len(items), 3) + 0.1 * (sum(r.urgency for r in items) / len(items) / 5))
        explanation = f"Matched category '{category}' (40%), location '{location}' (40%), and urgency similarity ({round(score * 20)}%)."
        cluster = Cluster(title=f"{category.title()} reports near {location.title()}", explanation=explanation, score=score, created_by_id=user.id)
        db.add(cluster); db.flush()
        for report in items:
            db.add(ClusterReport(cluster_id=cluster.id, report_id=report.id))
        result.append(cluster)
    db.commit()
    return result

@router.get("/clusters", response_model=list[ClusterOut])
def clusters(db: Session = Depends(get_db), user: User = Depends(current_user)):
    return db.query(Cluster).order_by(Cluster.created_at.desc()).all()

@router.post("/clusters/{cluster_id}/review", response_model=ClusterOut)
def review_cluster(cluster_id: int, data: ReviewRequest, db: Session = Depends(get_db), user: User = Depends(require_roles("coordinator", "admin"))):
    cluster = db.get(Cluster, cluster_id)
    if not cluster: raise HTTPException(404, "Cluster not found")
    if data.decision not in {"approved", "rejected", "needs_info"}: raise HTTPException(400, "Invalid decision")
    cluster.status, cluster.reviewed_by_id = data.decision, user.id
    log(db, user, data.decision, "cluster", cluster.id, data.note)
    if data.decision == "approved":
        incident = Incident(cluster_id=cluster.id, title=cluster.title, priority=1 if cluster.score >= .8 else 2)
        db.add(incident); db.flush()
        reporters = db.query(Report).join(ClusterReport, Report.id == ClusterReport.report_id).filter(ClusterReport.cluster_id == cluster.id).all()
        for report in reporters:
            report.status = "clustered"
    db.commit(); db.refresh(cluster)
    return cluster

@router.post("/incidents/{incident_id}/assign", status_code=201)
def assign(incident_id: int, data: AssignmentCreate, db: Session = Depends(get_db), user: User = Depends(require_roles("coordinator", "admin"))):
    incident = db.get(Incident, incident_id); responder = db.get(User, data.responder_id)
    if not incident or not responder or responder.role != "responder": raise HTTPException(404, "Incident or responder not found")
    assignment = Assignment(incident_id=incident_id, responder_id=responder.id)
    db.add(assignment); db.add(Notification(user_id=responder.id, message=f"You were assigned incident #{incident_id}"))
    log(db, user, "assigned", "incident", incident_id, f"responder={responder.id}"); db.commit(); db.refresh(assignment)
    return assignment

@router.patch("/assignments/{assignment_id}", response_model=dict)
def update_assignment(assignment_id: int, data: ProgressUpdate, db: Session = Depends(get_db), user: User = Depends(require_roles("responder"))):
    assignment = db.get(Assignment, assignment_id)
    if not assignment or assignment.responder_id != user.id: raise HTTPException(404, "Assignment not found")
    assignment.progress = data.progress; assignment.note = data.note
    assignment.status = "completed" if data.progress == 100 else "in_progress"
    if assignment.status == "completed":
        db.get(Incident, assignment.incident_id).status = "resolved"
    log(db, user, assignment.status, "assignment", assignment.id, data.note); db.commit()
    return {"id": assignment.id, "status": assignment.status, "progress": assignment.progress}

@router.get("/notifications")
def notifications(db: Session = Depends(get_db), user: User = Depends(current_user)):
    return db.query(Notification).filter(Notification.user_id == user.id).order_by(Notification.created_at.desc()).all()

@router.get("/activity")
def activity(db: Session = Depends(get_db), user: User = Depends(require_roles("coordinator", "admin"))):
    return db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(100).all()

@router.get("/analytics")
def analytics(db: Session = Depends(get_db), user: User = Depends(require_roles("coordinator", "admin"))):
    return {"reports": db.query(func.count(Report.id)).scalar(), "clusters": db.query(func.count(Cluster.id)).scalar(),
            "approved_clusters": db.query(func.count(Cluster.id)).filter(Cluster.status == "approved").scalar(),
            "incidents": db.query(func.count(Incident.id)).scalar(),
            "resolved_incidents": db.query(func.count(Incident.id)).filter(Incident.status == "resolved").scalar()}
