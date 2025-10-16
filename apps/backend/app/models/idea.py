from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship

from app.core.database import Base


class Idea(Base):
    """Model representing an extracted text snippet that may contain an idea."""

    __tablename__ = "ideas"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    source = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    classification = relationship("IdeaClassification", back_populates="idea", uselist=False, cascade="all, delete-orphan")
    embedding = relationship("IdeaEmbedding", back_populates="idea", uselist=False, cascade="all, delete-orphan")
    cluster_assignments = relationship("ClusterIdea", back_populates="idea", cascade="all, delete-orphan")
