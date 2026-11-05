from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str = Field(min_length=8)
    role: str = "reporter"
class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; email: str; full_name: str; role: str
class Token(BaseModel):
    access_token: str; token_type: str = "bearer"
class Login(BaseModel):
    email: str; password: str
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
