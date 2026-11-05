"""Seed a repeatable Greenfield Community dataset for local development.

This script intentionally uses the application's SQLAlchemy models and password
hashing implementation. It only replaces rows belonging to the demo accounts;
other data in the database is left untouched.

Example:
    python scripts/seed_demo.py --database-url sqlite:///./demo_antah.db
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--database-url",
        default="sqlite:///./antah.db",
        help="SQLAlchemy URL (default: sqlite:///./antah.db)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    # The settings and engine are created at import time, so set this first.
    os.environ["DATABASE_URL"] = args.database_url
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

    from app.db import Base, SessionLocal, engine
    from app.models import (
        ActivityLog,
        Assignment,
        Cluster,
        ClusterReport,
        Incident,
        Notification,
        Report,
        User,
    )
    from app.security import hash_password

    Base.metadata.create_all(bind=engine)
    password = "antah-demo-2026"
    residents = [
        (f"resident{i:02d}@greenfield.antah.local", f"Greenfield Resident {i:02d}")
        for i in range(1, 9)
    ]
    coordinators = [
        ("coordinator01@greenfield.antah.local", "Asha Coordinator"),
        ("coordinator02@greenfield.antah.local", "Mateo Coordinator"),
    ]
    responders = [
        ("responder01@greenfield.antah.local", "Nia Responder"),
        ("responder02@greenfield.antah.local", "Owen Responder"),
        ("responder03@greenfield.antah.local", "Priya Responder"),
    ]
    credentials = residents + coordinators + responders
    demo_emails = [email for email, _ in credentials]

    with SessionLocal.begin() as db:
        old_users = db.query(User).filter(User.email.in_(demo_emails)).all()
        old_ids = [user.id for user in old_users]
        if old_ids:
            old_reports = db.query(Report).filter(Report.reporter_id.in_(old_ids)).all()
            old_report_ids = [report.id for report in old_reports]
            old_clusters = db.query(Cluster).filter(
                Cluster.created_by_id.in_(old_ids)
            ).all()
            old_cluster_ids = [cluster.id for cluster in old_clusters]
            old_incidents = db.query(Incident).filter(
                Incident.cluster_id.in_(old_cluster_ids or [-1])
            ).all()
            old_incident_ids = [incident.id for incident in old_incidents]
            old_assignments = db.query(Assignment).filter(
                Assignment.responder_id.in_(old_ids)
            ).all()
            old_assignment_ids = [assignment.id for assignment in old_assignments]

            db.query(Notification).filter(Notification.user_id.in_(old_ids)).delete(
                synchronize_session=False
            )
            db.query(ActivityLog).filter(ActivityLog.actor_id.in_(old_ids)).delete(
                synchronize_session=False
            )
            if old_assignment_ids:
                db.query(ActivityLog).filter(
                    ActivityLog.entity_type == "assignment",
                    ActivityLog.entity_id.in_(old_assignment_ids),
                ).delete(synchronize_session=False)
            if old_incident_ids:
                db.query(Assignment).filter(
                    Assignment.incident_id.in_(old_incident_ids)
                ).delete(synchronize_session=False)
            if old_cluster_ids:
                db.query(ClusterReport).filter(
                    ClusterReport.cluster_id.in_(old_cluster_ids)
                ).delete(synchronize_session=False)
                db.query(Incident).filter(Incident.id.in_(old_incident_ids)).delete(
                    synchronize_session=False
                )
                db.query(Cluster).filter(Cluster.id.in_(old_cluster_ids)).delete(
                    synchronize_session=False
                )
            if old_report_ids:
                db.query(ClusterReport).filter(
                    ClusterReport.report_id.in_(old_report_ids)
                ).delete(synchronize_session=False)
                db.query(Report).filter(Report.id.in_(old_report_ids)).delete(
                    synchronize_session=False
                )
            db.query(User).filter(User.id.in_(old_ids)).delete(synchronize_session=False)
            # Bulk deletes bypass the identity map; clear it before replacing rows
            # so SQLite primary-key reuse does not produce stale ORM instances.
            db.expunge_all()

        users = {}
        for email, name in credentials:
            role = (
                "reporter"
                if email.startswith("resident")
                else "coordinator"
                if email.startswith("coordinator")
                else "responder"
            )
            user = User(
                email=email,
                full_name=name,
                password_hash=hash_password(password),
                role=role,
            )
            db.add(user)
            users[email] = user
        db.flush()

        resident_ids = [users[email].id for email, _ in residents]
        coordinator = users[coordinators[0][0]]
        coordinator_two = users[coordinators[1][0]]
        responder_users = [users[email] for email, _ in responders]
        report_data = [
            ("Broken streetlight at south gate", "The light has been out for three nights.", "lighting", "Greenfield South Gate", 4, "clustered"),
            ("Dark crossing near market", "Children and cyclists cannot see the crossing after sunset.", "lighting", "Greenfield South Gate", 5, "clustered"),
            ("Overflowing bin by park", "Waste is blocking the park entrance.", "waste", "Greenfield Central Park", 3, "clustered"),
            ("Missed collection on Cedar Lane", "The weekly collection did not happen.", "waste", "Greenfield Central Park", 4, "clustered"),
            ("Pothole outside clinic", "A deep pothole is dangerous for wheelchairs.", "roads", "Greenfield Clinic", 5, "clustered"),
            ("Water leak by bus stop", "Clean water is pooling beside the bus stop.", "water", "Greenfield Bus Stop", 4, "submitted"),
            ("Graffiti on library wall", "Fresh graffiti is visible on the public library wall.", "public space", "Greenfield Library", 2, "submitted"),
            ("Loose drain cover", "The drain cover rocks when vehicles pass over it.", "roads", "Greenfield Clinic", 4, "clustered"),
            ("Noisy generator at night", "A generator is disturbing residents after midnight.", "noise", "Greenfield East Block", 2, "submitted"),
            ("Damaged park bench", "A sharp edge is exposed on the bench beside the playground.", "public space", "Greenfield Central Park", 3, "clustered"),
        ]
        reports = []
        for index, (title, description, category, location, urgency, status) in enumerate(report_data):
            report = Report(
                title=title,
                description=description,
                category=category,
                location=location,
                urgency=urgency,
                status=status,
                reporter_id=resident_ids[index % len(resident_ids)],
            )
            db.add(report)
            reports.append(report)
        db.flush()

        cluster_specs = [
            ("Lighting hazards near the south gate", "Two resident reports describe matching lighting failures at the south gate.", 0.91, "approved", [0, 1], coordinator.id),
            ("Waste collection around Central Park", "Reports match on waste collection and the Central Park location.", 0.84, "approved", [2, 3], coordinator.id),
            ("Road safety hazards by the clinic", "A pothole and loose drain cover create a combined access risk.", 0.79, "approved", [4, 7], coordinator_two.id),
            ("Park maintenance follow-up", "Reports indicate damage to a shared public amenity.", 0.62, "pending", [9], coordinator_two.id),
        ]
        clusters = []
        for title, explanation, score, status, report_indexes, creator_id in cluster_specs:
            cluster = Cluster(
                title=title,
                explanation=explanation,
                score=score,
                status=status,
                created_by_id=creator_id,
                reviewed_by_id=coordinator.id if status == "approved" else None,
            )
            db.add(cluster)
            db.flush()
            for report_index in report_indexes:
                db.add(ClusterReport(cluster_id=cluster.id, report_id=reports[report_index].id))
            clusters.append(cluster)

        incidents = []
        for cluster, priority, status in (
            (clusters[0], 1, "in_progress"),
            (clusters[1], 2, "open"),
            (clusters[2], 1, "resolved"),
        ):
            incident = Incident(
                cluster_id=cluster.id,
                title=cluster.title,
                priority=priority,
                status=status,
            )
            db.add(incident)
            incidents.append(incident)
        db.flush()

        assignments = [
            Assignment(incident_id=incidents[0].id, responder_id=responder_users[0].id, status="in_progress", progress=55, note="Survey completed; replacement parts requested."),
            Assignment(incident_id=incidents[1].id, responder_id=responder_users[1].id, status="assigned", progress=10, note="Scheduled with sanitation crew."),
            Assignment(incident_id=incidents[2].id, responder_id=responder_users[2].id, status="completed", progress=100, note="Drain cover secured and pothole filled."),
        ]
        db.add_all(assignments)
        db.flush()

        db.add_all(
            [
                Notification(user_id=responder_users[0].id, message=f"You were assigned incident #{incidents[0].id}"),
                Notification(user_id=responder_users[1].id, message=f"You were assigned incident #{incidents[1].id}"),
                Notification(user_id=responder_users[2].id, message=f"Incident #{incidents[2].id} was marked resolved."),
                Notification(user_id=coordinator.id, message="Three Greenfield clusters are ready for coordination."),
                Notification(user_id=users[residents[0][0]].id, message="Your streetlight report was linked to a community incident."),
            ]
        )
        db.add_all(
            [
                ActivityLog(actor_id=coordinator.id, action="approved", entity_type="cluster", entity_id=clusters[0].id, details="Confirmed matching south gate reports."),
                ActivityLog(actor_id=coordinator.id, action="assigned", entity_type="incident", entity_id=incidents[0].id, details=f"responder={responder_users[0].id}"),
                ActivityLog(actor_id=responder_users[2].id, action="completed", entity_type="assignment", entity_id=assignments[2].id, details="Drain cover secured and pothole filled."),
                ActivityLog(actor_id=coordinator_two.id, action="created", entity_type="cluster", entity_id=clusters[3].id, details="Awaiting more supporting reports."),
            ]
        )

    print("Seeded Greenfield Community demo data (repeatable replacement).")
    print(f"Database: {args.database_url}")
    print("Demo password for all accounts: antah-demo-2026")
    print("Residents: resident01..resident08@greenfield.antah.local")
    print("Coordinators: coordinator01..coordinator02@greenfield.antah.local")
    print("Responders: responder01..responder03@greenfield.antah.local")


if __name__ == "__main__":
    main()
