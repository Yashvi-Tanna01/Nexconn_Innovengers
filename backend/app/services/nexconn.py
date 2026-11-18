import hashlib
import logging
import secrets
import time
import uuid

import httpx

from app.core.config import settings

logger = logging.getLogger("antah.nexconn")


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
        "Content-Type": "application/json",
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
        raise NexconnApiError(f"Nexconn API rejected the request ({response.status_code}). Response: {response.text}")
    body = response.json()
    if body.get("code") != 0:
        raise NexconnApiError(f"Nexconn API returned code {body.get('code')}: {body.get('errorMessage')}")
    return body


async def get_group_profile(channel_id: str) -> dict | None:
    try:
        body = await signed_request("/v4/group-channel/profile/list", {"channelIds": [channel_id]})
        profiles = body.get("result", {}).get("profiles", [])
        return profiles[0] if profiles else None
    except Exception as exc:
        logger.debug("Group profile query exception for %s: %s", channel_id, exc)
        return None


async def create_group(channel_id: str, name: str, owner: str, user_ids: list[str]) -> dict:
    return await signed_request(
        "/v4/group-channel/create",
        {"channelId": channel_id, "name": name, "owner": owner, "userIds": user_ids[:30]},
    )


async def join_group(channel_id: str, user_id: str) -> dict:
    return await signed_request(
        "/v4/group-channel/join",
        {"channelId": channel_id, "userIds": [user_id]},
    )


async def ensure_group(channel_id: str, name: str, user_id: str) -> dict:
    profile = await get_group_profile(channel_id)
    if not profile:
        try:
            return await create_group(channel_id, name, user_id, [user_id])
        except Exception as exc:
            logger.debug("Group creation fallback: %s", exc)
    return await join_group(channel_id, user_id)


async def ensure_community_channel(channel_id: str, name: str, user_id: str) -> dict:
    return await signed_request(
        "/v4/community-channel/create",
        {"channelId": channel_id, "name": name, "userId": user_id},
    )


async def ensure_community_subchannel(channel_id: str, subchannel_id: str) -> dict:
    return await signed_request(
        "/v4/community-channel/subchannel/create",
        {"channelId": channel_id, "subchannelId": subchannel_id},
    )


async def join_community(channel_id: str, user_id: str) -> dict:
    return await signed_request(
        "/v4/community-channel/join",
        {"channelId": channel_id, "userId": user_id},
    )
