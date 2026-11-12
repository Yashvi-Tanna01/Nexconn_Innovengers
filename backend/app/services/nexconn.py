import hashlib
import secrets
import time
import uuid

import httpx

from app.core.config import settings


class NexconnConfigurationError(RuntimeError):
    pass


class NexconnApiError(RuntimeError):
    pass


def stable_user_id(user_id: int) -> str:
    return f"antah{user_id}"


async def issue_access_token(user_id: int, name: str) -> tuple[str, str]:
    if not settings.NEXCONN_APP_KEY or not settings.NEXCONN_APP_SECRET:
        raise NexconnConfigurationError("Nexconn App Key and App Secret must be configured on the backend.")

    body = await signed_request(
        "/v4/auth/access-token/issue",
        {"userId": stable_user_id(user_id), "name": name[:64]},
    )
    if body.get("code") != 0 or not body.get("result", {}).get("accessToken"):
        raise NexconnApiError("Nexconn token service returned an invalid response.")
    return body["result"]["accessToken"], body["result"]["userId"]


async def signed_request(path: str, payload: dict) -> dict:
    if not settings.NEXCONN_APP_KEY or not settings.NEXCONN_APP_SECRET:
        raise NexconnConfigurationError("Nexconn App Key and App Secret must be configured on the backend.")
    nonce = secrets.token_hex(9)
    timestamp = str(int(time.time() * 1000))
    signature = hashlib.sha1(
        f"{settings.NEXCONN_APP_SECRET}{nonce}{timestamp}".encode("utf-8")
    ).hexdigest()
    headers = {
        "App-Key": settings.NEXCONN_APP_KEY,
        "Nonce": nonce,
        "Timestamp": timestamp,
        "Signature": signature,
        "X-Request-ID": str(uuid.uuid4()),
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"{settings.NEXCONN_API_BASE_URL}{path}",
                headers=headers,
                json=payload,
            )
    except httpx.HTTPError as exc:
        raise NexconnApiError("Nexconn API is unreachable.") from exc
    if response.status_code != 200:
        raise NexconnApiError(f"Nexconn API rejected the request ({response.status_code}).")
    body = response.json()
    if body.get("code") != 0:
        raise NexconnApiError(f"Nexconn API returned code {body.get('code')}.")
    return body


async def get_group_profile(channel_id: str) -> dict | None:
    body = await signed_request("/v4/group-channel/profile/list", {"channelIds": [channel_id]})
    profiles = body.get("result", {}).get("profiles", [])
    return profiles[0] if profiles else None


async def create_group(channel_id: str, name: str, owner: str, user_ids: list[str]) -> dict:
    return await signed_request(
        "/v4/group-channel/create",
        {"channelId": channel_id, "name": name, "owner": owner, "userIds": user_ids[:30]},
    )
