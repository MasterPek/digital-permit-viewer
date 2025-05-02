from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Pydantic model for request/response validation
class PolygonSchema(BaseModel):
    globalid: str
    formid: Optional[str] = None
    templateid: Optional[str] = None
    projectid: Optional[str] = None
    approval_status: Optional[int] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    created_at: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None
    shape: str  # WKT format for geometry

class PolygonResponse(BaseModel):
    objectid: int
    globalid: str
    formid: Optional[str] = None
    templateid: Optional[str] = None
    projectid: Optional[str] = None
    approval_status: Optional[int] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    created_at: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None
    shape: str  # WKT format for geometry

# Pydantic model for request/response validation
class PointSchema(BaseModel):
    globalid: str
    projectid: Optional[str] = None
    templateid: Optional[str] = None
    formid: Optional[str] = None
    approval_status: Optional[int] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    created_at: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None
    shape: str  # WKT format for geometry (e.g., "POINT (x y)")

class PointResponse(BaseModel):
    objectid: int
    globalid: str
    projectid: Optional[str] = None
    templateid: Optional[str] = None
    formid: Optional[str] = None
    approval_status: Optional[int] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    created_at: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None
    shape: str  # WKT format for geometry

# Pydantic model for request/response validation
class AnnotationSchema(BaseModel):
    globalid: str
    formid: Optional[str] = None
    templateid: Optional[str] = None
    projectid: Optional[str] = None
    annotation: Optional[str] = None
    approval_status: Optional[int] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    created_at: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None
    shape: str  # WKT format for geometry (e.g., "POINT (x y)")

class AnnotationResponse(BaseModel):
    objectid: int
    globalid: str
    formid: Optional[str] = None
    templateid: Optional[str] = None
    projectid: Optional[str] = None
    annotation: Optional[str] = None
    approval_status: Optional[int] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    created_at: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None
    shape: str  # WKT format for geometry

class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    is_active: bool
    role: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    last_login_attempt: Optional[datetime] = None

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int

class UserUpdate(UserBase):
    pass

class ProviderBase(BaseModel):
    provider: str
    provider_id: str
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class ProviderCreate(ProviderBase):
    pass

class ProviderResponse(ProviderBase):
    id: int

class ProviderUpdate(ProviderBase):
    pass