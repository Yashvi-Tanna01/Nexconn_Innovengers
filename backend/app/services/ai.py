import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Optional
import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import ChatMessage, ChatRoom, Cluster, Incident, Report, User

logger = logging.getLogger("antah.ai")

AI_SYSTEM_EMAIL = "ai@antah.network"
AI_SYSTEM_NAME = "ANTAH Civic AI"
AI_SYSTEM_ROLE = "ai"

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODELS = [
    os.getenv("AI_MODEL", "openrouter/auto"),
    "meta-llama/llama-3.3-70b-instruct",
    "openrouter/auto",
]


def get_or_create_ai_user(db: Session) -> User:
    """Ensure the system AI user exists in PostgreSQL for message attribution."""
    ai_user = db.query(User).filter(User.email == AI_SYSTEM_EMAIL).first()
    if not ai_user:
        try:
            ai_user = User(
                email=AI_SYSTEM_EMAIL,
                full_name=AI_SYSTEM_NAME,
                role=AI_SYSTEM_ROLE,
                password_hash="!system_service_no_login!",
                is_active=True,
            )
            db.add(ai_user)
            db.commit()
            db.refresh(ai_user)
        except Exception as exc:
            db.rollback()
            ai_user = db.query(User).filter(User.email == AI_SYSTEM_EMAIL).first()
            if not ai_user:
                raise RuntimeError(f"Failed to create AI system user: {exc}") from exc
    return ai_user


def get_antah_live_context(db: Session) -> str:
    """Gathers real, sanitized ANTAH platform data for contextual AI answers without privacy leaks."""
    try:
        total_reports = db.query(Report).count()
        recent_reports = (
            db.query(Report)
            .order_by(Report.created_at.desc())
            .limit(5)
            .all()
        )
        total_incidents = db.query(Incident).count()
        active_incidents = (
            db.query(Incident)
            .filter(Incident.status != "resolved")
            .order_by(Incident.created_at.desc())
            .limit(5)
            .all()
        )
        total_clusters = db.query(Cluster).count()
        active_clusters = (
            db.query(Cluster)
            .order_by(Cluster.created_at.desc())
            .limit(3)
            .all()
        )

        lines = [
            "=== CURRENT ANTAH PLATFORM LIVE DATA ===",
            f"- Total Community Reports in Database: {total_reports}",
            f"- Verified Active Incidents: {len(active_incidents)} (Total recorded: {total_incidents})",
            f"- Candidate Signal Clusters: {total_clusters}",
        ]

        if recent_reports:
            lines.append("\nRecent Community Reports (Sanitized):")
            for r in recent_reports:
                lines.append(f"  * [Category: {r.category}] \"{r.title}\" | Location: {r.location} | Status: {r.status}")
        else:
            lines.append("\nRecent Community Reports: None logged yet.")

        if active_incidents:
            lines.append("\nVerified Incidents Active in Field:")
            for inc in active_incidents:
                lines.append(f"  * Incident #{inc.id}: \"{inc.title}\" (Priority {inc.priority}, Status: {inc.status})")
        else:
            lines.append("\nVerified Incidents Active in Field: None currently active.")

        if active_clusters:
            lines.append("\nActive AI Pattern Clusters:")
            for cl in active_clusters:
                lines.append(f"  * Cluster #{cl.id}: \"{cl.title}\" (Confidence Score: {cl.score:.2f}, Status: {cl.status})")

        return "\n".join(lines)
    except Exception as exc:
        logger.warning("Error fetching live ANTAH context: %s", exc)
        return "=== LIVE ANTAH PLATFORM DATA ===\n[Database context temporarily unavailable]"


def build_system_prompt(live_context: str) -> str:
    return f"""You are ANTAH Civic Intelligence, the embedded AI Assistant for the ANTAH Civic Safety and Unheard Signals Network.
ANTAH connects residents, municipal coordinators, and emergency responders to detect, cluster, and resolve civic hazards.

CORE EXPERTISE:
1. Practical citizen guidance for infrastructure failures: water leakage, main line bursts, drainage overflow, blocked sewers, road potholes/sinkholes, non-functional streetlights, urban flooding, and electrical hazards.
2. Public safety and hazard mitigation protocols: keeping safe distances, avoiding contaminated water, safe navigation, reporting procedures.
3. ANTAH platform mechanics: explaining community reporting, photo evidence attachments, AI signal clustering, spatial-temporal pattern detection, and municipal dispatch.

GROUND TRUTH RULES:
- Use the provided ANTAH LIVE DATA below to answer questions about current reports or verified incidents.
- NEVER invent or hallucinate incident counts, report numbers, or fake verified incidents.
- If asked about current incidents and none exist in the data, explicitly state that no verified incidents are currently active in the platform, and mention any related community reports if present.
- Never expose resident names, phone numbers, or private user credentials.
- Format responses cleanly with concise bullet points, clear headings, and actionable recommendations.

{live_context}"""


async def call_ai_model(
    messages: list[dict],
    api_key: Optional[str] = None,
) -> str:
    key = api_key or settings.AI_API_KEY
    if not key or not key.strip():
        raise RuntimeError("AI API Key is not configured on the backend (AI_API_KEY).")

    headers = {
        "Authorization": f"Bearer {key.strip()}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://antah.network",
        "X-Title": "ANTAH Civic Intelligence",
    }

    last_error = None
    for model_name in DEFAULT_MODELS:
        payload = {
            "model": model_name,
            "messages": messages,
            "temperature": 0.3,
            "max_tokens": 1200,
        }
        try:
            async with httpx.AsyncClient(timeout=25.0) as client:
                response = await client.post(
                    OPENROUTER_API_URL,
                    headers=headers,
                    json=payload,
                )
            if response.status_code == 200:
                data = response.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                if content:
                    return content.strip()
            else:
                last_error = f"Model {model_name} returned HTTP {response.status_code}: {response.text[:200]}"
                logger.warning("AI call failed with %s: %s", model_name, last_error)
        except Exception as exc:
            last_error = str(exc)
            logger.warning("Exception calling AI model %s: %s", model_name, exc)

    raise RuntimeError(f"All AI model endpoints failed. Last error: {last_error}")


async def ask_civic_ai(
    db: Session,
    question: str,
    conversation_history: Optional[list[dict]] = None,
) -> str:
    """Answers a civic intelligence query with live ANTAH database context and multi-turn history."""
    clean_q = question.strip()
    if not clean_q:
        raise ValueError("Question cannot be empty.")

    live_context = get_antah_live_context(db)
    system_prompt = build_system_prompt(live_context)

    messages = [{"role": "system", "content": system_prompt}]
    if conversation_history:
        for item in conversation_history[-8:]:  # Keep up to last 8 turns for context
            role = item.get("role", "user")
            content = item.get("content", "")
            if role in {"user", "assistant"} and content:
                messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": clean_q})
    return await call_ai_model(messages)
