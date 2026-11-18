import base64, hashlib, hmac, os, secrets
from datetime import datetime, timedelta, timezone
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db import get_db
from app.models import User

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=16384, r=8, p=1)
    return "scrypt$" + base64.urlsafe_b64encode(salt).decode() + "$" + base64.urlsafe_b64encode(digest).decode()
def verify_password(password: str, encoded: str) -> bool:
    try:
        _, salt, digest = encoded.split("$")
        actual = hashlib.scrypt(password.encode(), salt=base64.urlsafe_b64decode(salt), n=16384, r=8, p=1)
        return hmac.compare_digest(actual, base64.urlsafe_b64decode(digest))
    except (ValueError, TypeError):
        return False
def create_token(user: User) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": str(user.id), "role": user.role, "exp": exp}, settings.JWT_SECRET, algorithm="HS256")

def create_refresh_token() -> str:
    return secrets.token_urlsafe(48)

def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

bearer = HTTPBearer(auto_error=False)
def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, settings.JWT_SECRET, algorithms=["HS256"])
        user_id = int(payload["sub"])
        user = db.get(User, user_id)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Your session has expired. Please sign in again.")
    except (jwt.PyJWTError, KeyError, ValueError, TypeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token. Please sign in again.")
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account not found.")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled.")
    return user
def require_roles(*roles):
    def dependency(user: User = Depends(current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient role")
        return user
    return dependency
