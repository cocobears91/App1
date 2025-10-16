from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class NotionMapping(Base):
    __tablename__ = "notion_mappings"

    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, ForeignKey("ideas.id", ondelete="CASCADE"), nullable=False)
    notion_page_id = Column(String, unique=True, nullable=False)
    notion_database_id = Column(String, nullable=True)
    sync_status = Column(String, default="pending", nullable=False)
    last_synced_at = Column(DateTime(timezone=True), nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    idea = relationship("Idea", back_populates="notion_mappings")
