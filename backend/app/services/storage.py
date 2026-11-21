"""
ANTAH — Unified Storage Service
Provides persistent storage for uploaded civic evidence photographs.
Supports:
1. Production Cloud Storage (AWS S3, Cloudflare R2, Supabase Storage, Backblaze B2, MinIO)
2. Local Persistent Filesystem Storage (Development or dedicated persistent volume)
"""

import logging
import os
import re
import secrets
import time
from pathlib import Path
from typing import Optional, Tuple
from app.core.config import settings

logger = logging.getLogger("antah.storage")

# Cloud Storage Configuration (read from environment)
S3_BUCKET = os.getenv("AWS_STORAGE_BUCKET_NAME") or os.getenv("S3_BUCKET") or os.getenv("CLOUDFLARE_R2_BUCKET")
S3_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID") or os.getenv("S3_ACCESS_KEY")
S3_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY") or os.getenv("S3_SECRET_KEY")
S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL") or os.getenv("AWS_S3_ENDPOINT_URL")
S3_REGION = os.getenv("AWS_REGION") or os.getenv("S3_REGION_NAME") or "us-east-1"
STORAGE_PUBLIC_URL = os.getenv("STORAGE_PUBLIC_URL", "").rstrip("/")


def is_cloud_storage_configured() -> bool:
    """Returns True if S3/R2 cloud bucket configuration is present."""
    return bool(S3_BUCKET and S3_ACCESS_KEY and S3_SECRET_KEY)


def sanitize_filename(name: str, fallback_ext: str = ".jpg") -> str:
    original = Path(name or f"photo{fallback_ext}").name
    clean = re.sub(r'[^a-zA-Z0-9_.-]', '_', original)
    return clean[:200]


def save_attachment_file(
    content: bytes,
    report_id: int,
    original_filename: str,
    content_type: str,
    file_extension: str,
) -> Tuple[str, str, int]:
    """
    Saves evidence photograph content to cloud object storage or local filesystem.
    Returns:
        tuple (file_url, sanitized_filename, file_size_bytes)
    """
    file_size = len(content)
    clean_original_name = sanitize_filename(original_filename, file_extension)
    safe_filename = f"rep_{report_id}_{secrets.token_hex(6)}_{int(time.time())}{file_extension}"
    object_key = f"reports/{safe_filename}"

    # 1. Cloud Storage Path (AWS S3, Cloudflare R2, MinIO, etc.)
    if is_cloud_storage_configured():
        try:
            import boto3
            from botocore.config import Config

            s3_client = boto3.client(
                "s3",
                aws_access_key_id=S3_ACCESS_KEY,
                aws_secret_access_key=S3_SECRET_KEY,
                endpoint_url=S3_ENDPOINT_URL,
                region_name=S3_REGION,
                config=Config(signature_version="s3v4"),
            )

            s3_client.put_object(
                Bucket=S3_BUCKET,
                Key=object_key,
                Body=content,
                ContentType=content_type,
            )

            if STORAGE_PUBLIC_URL:
                public_url = f"{STORAGE_PUBLIC_URL}/{object_key}"
            elif S3_ENDPOINT_URL and "r2.cloudflarestorage.com" not in S3_ENDPOINT_URL:
                public_url = f"{S3_ENDPOINT_URL.rstrip('/')}/{S3_BUCKET}/{object_key}"
            else:
                public_url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{object_key}"

            logger.info("Successfully uploaded evidence %s to cloud bucket %s", object_key, S3_BUCKET)
            return public_url, clean_original_name, file_size
        except Exception as exc:
            logger.error("Cloud storage upload failed (%s). Falling back to persistent local storage.", exc)

    # 2. Local Filesystem Storage (Default / Persistent Disk mount)
    dest_path = settings.UPLOAD_DIR / "reports" / safe_filename
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    dest_path.write_bytes(content)

    relative_url = f"/uploads/reports/{safe_filename}"
    return relative_url, clean_original_name, file_size


def delete_attachment_file(file_url: str) -> None:
    """Deletes evidence photograph from cloud storage or local disk."""
    if not file_url:
        return

    # 1. Cloud Storage Delete
    if is_cloud_storage_configured() and file_url.startswith("http"):
        try:
            import boto3
            from botocore.config import Config

            # Extract object key from URL (after reports/ or after bucket)
            match = re.search(r"reports/([^/?#]+)", file_url)
            if match:
                object_key = f"reports/{match.group(1)}"
                s3_client = boto3.client(
                    "s3",
                    aws_access_key_id=S3_ACCESS_KEY,
                    aws_secret_access_key=S3_SECRET_KEY,
                    endpoint_url=S3_ENDPOINT_URL,
                    region_name=S3_REGION,
                    config=Config(signature_version="s3v4"),
                )
                s3_client.delete_object(Bucket=S3_BUCKET, Key=object_key)
                logger.info("Deleted cloud evidence object: %s", object_key)
                return
        except Exception as exc:
            logger.warning("Failed to delete cloud attachment (%s): %s", file_url, exc)

    # 2. Local Filesystem Delete
    if file_url.startswith("/uploads/"):
        relative_path = file_url.removeprefix("/uploads/")
        file_path = settings.UPLOAD_DIR / relative_path
        if file_path.exists():
            file_path.unlink(missing_ok=True)
