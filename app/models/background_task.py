from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TaskType(str, enum.Enum):
    EXTRACT_FILES = "extract_files"
    PROCESS_IDEAS = "process_ideas"
    CLUSTER_IDEAS = "cluster_ideas"
    MARKET_ANALYSIS = "market_analysis"
    NOTION_SYNC = "notion_sync"


class BackgroundTask(Base):
    __tablename__ = "background_tasks"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("idea_batches.id", ondelete="CASCADE"), nullable=True)
    task_type = Column(SQLEnum(TaskType), nullable=False)
    task_id = Column(String, unique=True, nullable=True)
    status = Column(SQLEnum(TaskStatus), default=TaskStatus.PENDING, nullable=False)
    progress = Column(Integer, default=0)
    result = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    batch = relationship("IdeaBatch", back_populates="background_tasks")
