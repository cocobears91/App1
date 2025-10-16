from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.idea_batch import BatchStatus


class IdeaBatchBase(BaseModel):
    name: str
    description: Optional[str] = None


class IdeaBatchCreate(IdeaBatchBase):
    pass


class IdeaBatch(IdeaBatchBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    user_id: Optional[int] = None
    file_path: str
    storage_key: str
    status: BatchStatus
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None


class IdeaBatchList(BaseModel):
    total: int
    batches: List[IdeaBatch]


class BatchStatusResponse(BaseModel):
    batch_id: int
    status: BatchStatus
    progress: int
    total_raw_ideas: int
    total_ideas: int
    error_message: Optional[str] = None
