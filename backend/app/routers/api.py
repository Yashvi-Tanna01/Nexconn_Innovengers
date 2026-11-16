from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import *
from app.schemas import *
from app.security import *
from app.core.config import settings
from app.services.nexconn import (
    NexconnApiError,
    NexconnConfigurationError,
    issue_access_token,
    create_group,
    get_group_profile,
    stable_user_id,
)

router = APIRouter(prefix="/api/v1")

def log(db, actor, action, entity, entity_id, details=""):
    db.add(ActivityLog(actor_id=actor.id, action=action, entity_type=entity, entity_id=entity_id, details=details))

def ensure_chat_room(db, room_key, title, room_type, incident_id=None):
    room = db.query(ChatRoom).filter(ChatRoom.room_key == room_key).first()
    if not room:
        room = ChatRoom(room_key=room_key, title=title, room_type=room_type, incident_id=incident_id)
        db.add(room); db.flush()
    return room

def ensure_chat_membership(db, room_id, user_id):
    pending = any(
        membership.room_id == room_id and membership.user_id == user_id
        for membership in db.new if isinstance(membership, ChatMembership)
    )
    if not pending and not db.query(ChatMembership).filter(
        ChatMembership.room_id == room_id, ChatMembership.user_id == user_id
    ).first():
        db.add(ChatMembership(room_id=room_id, user_id=user_id))

def user_can_access_room(db, room, user):
    if room.room_type == "community":
        return True
    if room.room_type == "coordination":
        return user.role in {"coordinator", "admin", "responder"}
    return db.query(ChatMembership).filter(
        ChatMembership.room_id == room.id, ChatMembership.user_id == user.id
    ).first() is not None

@router.post("/auth/register", response_model=UserOut, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    clean_email = data.email.lower().strip()
    clean_name = data.full_name.strip()
    if not clean_email or not clean_name:
        raise HTTPException(400, "Full name and email are required")
    if db.query(User).filter(User.email == clean_email).first():
        raise HTTPException(409, "Email already registered")
    user = User(
        email=clean_email,
        full_name=clean_name,
        password_hash=hash_password(data.password),
        role="reporter",
    )
    db.add(user); db.commit(); db.refresh(user)
    return user

@router.post("/auth/login", response_model=Token)
def login(data: Login, db: Session = Depends(get_db)):
    clean_email = data.email.lower().strip()
    user = db.query(User).filter(User.email == clean_email).first()
    if not user or not user.is_active or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    token = create_token(user)
    refresh_token = create_refresh_token()
    db.add(RefreshToken(
        user_id=user.id,
        token_hash=hash_refresh_token(refresh_token),
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    ))
    db.add(ActivityLog(actor_id=user.id, action="login", entity_type="user", entity_id=user.id))
    db.commit()
    return Token(access_token=token, refresh_token=refresh_token)

@router.post("/auth/refresh", response_model=Token)
def refresh(data: RefreshRequest, db: Session = Depends(get_db)):
    stored = db.query(RefreshToken).filter(
        RefreshToken.token_hash == hash_refresh_token(data.refresh_token),
        RefreshToken.revoked_at.is_(None),
    ).first()
    expires_at = stored.expires_at.replace(tzinfo=timezone.utc) if stored and stored.expires_at.tzinfo is None else stored.expires_at if stored else None
    if not stored or expires_at <= datetime.now(timezone.utc):
        raise HTTPException(401, "Invalid or expired refresh token")
    user = db.get(User, stored.user_id)
    if not user or not user.is_active:
        raise HTTPException(401, "Invalid or inactive account")
    stored.revoked_at = datetime.now(timezone.utc)
    replacement = create_refresh_token()
    db.add(RefreshToken(
        user_id=user.id,
        token_hash=hash_refresh_token(replacement),
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    ))
    db.commit()
    return Token(access_token=create_token(user), refresh_token=replacement)

@router.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(current_user)): return user

@router.patch("/users/me", response_model=UserOut)
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db), user: User = Depends(current_user)):
    if data.full_name is not None:
        user.full_name = data.full_name.strip()
    if data.phone is not None:
        user.phone = data.phone.strip()
    if data.avatar_url is not None:
        user.avatar_url = data.avatar_url.strip()
    if data.organization is not None:
        user.organization = data.organization.strip()
    log(db, user, "updated", "profile", user.id)
    db.commit()
    db.refresh(user)
    return user

@router.get("/users/me/preferences", response_model=UserPreferenceOut)
def get_preferences(db: Session = Depends(get_db), user: User = Depends(current_user)):
    pref = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    if not pref:
        pref = UserPreference(user_id=user.id, theme="system", notifications_enabled=True, email_alerts=True, language="en")
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

@router.patch("/users/me/preferences", response_model=UserPreferenceOut)
def update_preferences(data: UserPreferenceUpdate, db: Session = Depends(get_db), user: User = Depends(current_user)):
    pref = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    if not pref:
        pref = UserPreference(user_id=user.id)
        db.add(pref)
    if data.theme is not None:
        pref.theme = data.theme
    if data.notifications_enabled is not None:
        pref.notifications_enabled = data.notifications_enabled
    if data.email_alerts is not None:
        pref.email_alerts = data.email_alerts
    if data.language is not None:
        pref.language = data.language
    db.commit()
    db.refresh(pref)
    return pref

@router.post("/auth/logout", status_code=204)
def logout(db: Session = Depends(get_db), user: User = Depends(current_user)):
    log(db, user, "logout", "user", user.id)
    db.commit()

@router.get("/admin/users", response_model=list[UserOut])
def admin_users(db: Session = Depends(get_db), user: User = Depends(require_roles("admin"))):
    return db.query(User).order_by(User.created_at.desc()).all()

@router.patch("/admin/users/{user_id}", response_model=UserOut)
def admin_update_user(
    user_id: int,
    data: AdminUserUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("admin")),
):
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(404, "User not found")
    valid_roles = {"admin", "reporter", "coordinator", "responder"}
    if data.role is not None and data.role not in valid_roles:
        raise HTTPException(422, "Invalid role")
    if target.id == user.id and data.is_active is False:
        raise HTTPException(400, "You cannot deactivate your own account")
    if target.role == "admin" and (data.role == "reporter" or data.is_active is False):
        active_admins = db.query(User).filter(User.role == "admin", User.is_active.is_(True)).count()
        if active_admins <= 1:
            raise HTTPException(400, "The last active admin cannot be removed")
    before = f"role={target.role},active={target.is_active}"
    if data.full_name is not None:
        target.full_name = data.full_name.strip()
    if data.role is not None:
        target.role = data.role
    if data.is_active is not None:
        target.is_active = data.is_active
    log(db, user, "updated", "user", target.id, f"{before}; role={target.role},active={target.is_active}")
    db.commit()
    db.refresh(target)
    return target

@router.get("/admin/audit", response_model=list[dict])
def admin_audit(db: Session = Depends(get_db), user: User = Depends(require_roles("admin"))):
    rows = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(200).all()
    return [
        {
            "id": row.id,
            "actor_id": row.actor_id,
            "action": row.action,
            "entity_type": row.entity_type,
            "entity_id": row.entity_id,
            "details": row.details,
            "created_at": row.created_at,
        }
        for row in rows
    ]

@router.post("/reports", response_model=ReportOut, status_code=201)
def create_report(data: ReportCreate, db: Session = Depends(get_db), user: User = Depends(current_user)):
    report = Report(**data.model_dump(), reporter_id=user.id)
    db.add(report); db.commit(); db.refresh(report); log(db, user, "created", "report", report.id); db.commit()
    return report

@router.get("/reports", response_model=list[ReportOut])
def reports(db: Session = Depends(get_db), user: User = Depends(current_user)):
    q = db.query(Report)
    return q.filter(Report.reporter_id == user.id).all() if user.role == "reporter" else q.order_by(Report.created_at.desc()).all()

@router.post("/reports/{report_id}/attachments", response_model=ReportAttachmentOut, status_code=201)
def add_report_attachment(
    report_id: int,
    file_url: str,
    file_name: str,
    file_type: str = "image/jpeg",
    file_size: int = 0,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    report = db.get(Report, report_id)
    if not report:
        raise HTTPException(404, "Report not found")
    if user.role == "reporter" and report.reporter_id != user.id:
        raise HTTPException(403, "Not authorized to modify this report")
    attachment = ReportAttachment(
        report_id=report.id,
        file_url=file_url,
        file_name=file_name,
        file_type=file_type,
        file_size=file_size,
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment

@router.get("/reports/{report_id}/attachments", response_model=list[ReportAttachmentOut])
def list_report_attachments(
    report_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    report = db.get(Report, report_id)
    if not report:
        raise HTTPException(404, "Report not found")
    return db.query(ReportAttachment).filter(ReportAttachment.report_id == report.id).all()


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
        room = ensure_chat_room(db, f"incident:{incident.id}", incident.title, "incident", incident.id)
        ensure_chat_membership(db, room.id, user.id)
        reporters = db.query(Report).join(ClusterReport, Report.id == ClusterReport.report_id).filter(ClusterReport.cluster_id == cluster.id).all()
        for report in reporters:
            report.status = "clustered"
            ensure_chat_membership(db, room.id, report.reporter_id)
    db.commit(); db.refresh(cluster)
    return cluster

@router.post("/incidents/{incident_id}/assign", status_code=201)
def assign(incident_id: int, data: AssignmentCreate, db: Session = Depends(get_db), user: User = Depends(require_roles("coordinator", "admin"))):
    incident = db.get(Incident, incident_id); responder = db.get(User, data.responder_id)
    if not incident or not responder or responder.role != "responder": raise HTTPException(404, "Incident or responder not found")
    assignment = Assignment(incident_id=incident_id, responder_id=responder.id)
    room = ensure_chat_room(db, f"incident:{incident.id}", incident.title, "incident", incident.id)
    ensure_chat_membership(db, room.id, responder.id)
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
def analytics(db: Session = Depends(get_db), user: User = Depends(current_user)):
    reports = db.query(Report)
    incidents = db.query(Incident)
    if user.role == "reporter":
        reports = reports.filter(Report.reporter_id == user.id)
        incident_ids = db.query(Assignment.incident_id).filter(Assignment.responder_id == user.id)
        incidents = incidents.filter(Incident.id.in_(incident_ids))
    elif user.role == "responder":
        incident_ids = db.query(Assignment.incident_id).filter(Assignment.responder_id == user.id)
        incidents = incidents.filter(Incident.id.in_(incident_ids))
    elif user.role not in {"coordinator", "admin"}:
        raise HTTPException(403, "Analytics access denied")

    report_count = reports.count()
    incident_count = incidents.count()
    return {
        "reports": report_count,
        "clusters": db.query(func.count(Cluster.id)).scalar() if user.role in {"coordinator", "admin"} else 0,
        "approved_clusters": db.query(func.count(Cluster.id)).filter(Cluster.status == "approved").scalar() if user.role in {"coordinator", "admin"} else 0,
        "incidents": incident_count,
        "resolved_incidents": incidents.filter(Incident.status == "resolved").count(),
    }

@router.get("/chat/rooms", response_model=list[ChatRoomOut])
def chat_rooms(db: Session = Depends(get_db), user: User = Depends(current_user)):
    community = ensure_chat_room(db, "community:general", "ANTAH Community", "community")
    ensure_chat_membership(db, community.id, user.id)
    rooms = [community]
    if user.role in {"coordinator", "admin", "responder"}:
        coordination = ensure_chat_room(db, "coordination:operations", "Operations Coordination", "coordination")
        ensure_chat_membership(db, coordination.id, user.id)
        rooms.append(coordination)
    incident_rooms = db.query(ChatRoom).join(
        ChatMembership, ChatMembership.room_id == ChatRoom.id
    ).filter(ChatMembership.user_id == user.id, ChatRoom.room_type == "incident").all()
    rooms.extend(incident_rooms)
    db.commit()
    return rooms

@router.post("/chat/token", response_model=ChatTokenOut)
async def chat_token(
    data: ChatTokenRequest,
    db: Session = Depends(get_db),
    user: User = Depends(current_user),
):
    room = db.get(ChatRoom, data.room_id)
    if not room:
        raise HTTPException(404, "Chatroom not found")
    if not user_can_access_room(db, room, user):
        raise HTTPException(403, "Chatroom access denied")
    try:
        access_token, nexconn_user_id = await issue_access_token(user.id, user.full_name)
    except NexconnConfigurationError as exc:
        raise HTTPException(503, str(exc)) from exc
    except NexconnApiError as exc:
        raise HTTPException(502, str(exc)) from exc
    channel_type = "group" if room.nexconn_channel_id else ("community" if room.room_type == "community" else "group")
    channel_id = room.nexconn_channel_id or (room.room_key.split(":", 1)[1] if ":" in room.room_key else room.room_key)
    return ChatTokenOut(
        access_token=access_token,
        nexconn_user_id=nexconn_user_id,
        channel_id=channel_id,
        channel_type=channel_type,
        area_code=settings.NEXCONN_AREA_CODE,
    )

@router.post("/chat/groups", response_model=NexconnGroupOut)
async def create_nexconn_group(
    data: NexconnGroupCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("coordinator", "admin")),
):
    room = db.query(ChatRoom).filter(ChatRoom.room_key == "community:general").first()
    if not room:
        room = ensure_chat_room(db, "community:general", data.name, "group")
    try:
        if room.nexconn_channel_id:
            profile = await get_group_profile(room.nexconn_channel_id)
            if profile:
                return NexconnGroupOut(group_id=room.nexconn_channel_id, created=False, response={"code": 0, "result": {"profiles": [profile]}})
        profile = await get_group_profile(data.channel_id)
        if profile:
            room.nexconn_channel_id = data.channel_id
            room.room_type = "group"
            db.commit()
            return NexconnGroupOut(group_id=data.channel_id, created=False, response={"code": 0, "result": {"profiles": [profile]}})

        members = db.query(ChatMembership).filter(ChatMembership.room_id == room.id).all()
        member_ids = [stable_user_id(member.user_id) for member in members if member.user_id != user.id]
        for member in members:
            member_user = db.get(User, member.user_id)
            if member_user:
                await issue_access_token(member.user_id, member_user.full_name)
        response = await create_group(data.channel_id, data.name, stable_user_id(user.id), member_ids)
        room.nexconn_channel_id = data.channel_id
        room.room_type = "group"
        db.commit()
        return NexconnGroupOut(group_id=data.channel_id, created=True, response=response)
    except NexconnConfigurationError as exc:
        raise HTTPException(503, str(exc)) from exc
    except NexconnApiError as exc:
        raise HTTPException(502, str(exc)) from exc

@router.get("/chat/rooms/{room_id}/messages", response_model=list[ChatMessageOut])
def chat_messages(room_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    room = db.get(ChatRoom, room_id)
    if not room: raise HTTPException(404, "Chatroom not found")
    if not user_can_access_room(db, room, user): raise HTTPException(403, "Chatroom access denied")
    messages = db.query(ChatMessage).filter(ChatMessage.room_id == room.id).order_by(ChatMessage.created_at.asc()).all()
    return [
        {**message.__dict__, "sender_name": db.get(User, message.sender_id).full_name}
        for message in messages
    ]

@router.post("/chat/rooms/{room_id}/messages", response_model=ChatMessageOut, status_code=201)
def send_chat_message(room_id: int, data: ChatMessageCreate, db: Session = Depends(get_db), user: User = Depends(current_user)):
    room = db.get(ChatRoom, room_id)
    if not room: raise HTTPException(404, "Chatroom not found")
    if not user_can_access_room(db, room, user): raise HTTPException(403, "Chatroom access denied")
    message = ChatMessage(room_id=room.id, sender_id=user.id, text=data.text.strip())
    db.add(message); db.commit(); db.refresh(message)
    return {**message.__dict__, "sender_name": user.full_name}
