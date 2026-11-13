from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str = Field(min_length=8)
    role: str = "reporter"
class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; email: str; full_name: str; role: str; is_active: bool
class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
class ProfileUpdate(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
class Login(BaseModel):
    email: str; password: str
class RefreshRequest(BaseModel):
    refresh_token: str = Field(min_length=20)
class ReportCreate(BaseModel):
    title: str; description: str; category: str; location: str; urgency: int = Field(3, ge=1, le=5)
class ReportOut(ReportCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int; status: str; reporter_id: int
class ClusterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; title: str; explanation: str; score: float; status: str
class ReviewRequest(BaseModel):
    decision: str
    note: str = ""
class AssignmentCreate(BaseModel):
    responder_id: int
class ProgressUpdate(BaseModel):
    progress: int = Field(ge=0, le=100)
    note: str = ""
class ChatRoomOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; room_key: str; title: str; room_type: str; incident_id: Optional[int] = None
class ChatMessageCreate(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; room_id: int; sender_id: int; sender_name: str; text: str; created_at: datetime
class ChatTokenRequest(BaseModel):
    room_id: int
class ChatTokenOut(BaseModel):
    access_token: str
    nexconn_user_id: str
    channel_id: str
    channel_type: str
    area_code: int
class NexconnGroupCreate(BaseModel):
    channel_id: str = Field(default="antah-community", min_length=1, max_length=64)
    name: str = Field(default="ANTAH Community", min_length=1, max_length=64)
class NexconnGroupOut(BaseModel):
    group_id: str
    created: bool
    response: dict
