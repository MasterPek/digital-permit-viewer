from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FileResponse(BaseModel):
    objectid: int
    filename: str
    file_path: str
    mime_type: str
    size: int
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True