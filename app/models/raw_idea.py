from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class RawIdea(Base):
    __tablename__ = "raw_ideas"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("idea_batches.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String, nullable=False)
    original_format = Column(String, nullable=False)
    raw_text = Column(Text, nullable=False)
    encoding = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    batch = relationship("IdeaBatch", back_populates="raw_ideas")
    ideas = relationship("Idea", back_populates="raw_idea", cascade="all, delete-orphan")
