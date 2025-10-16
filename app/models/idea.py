from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Idea(Base):
    __tablename__ = "ideas"

    id = Column(Integer, primary_key=True, index=True)
    raw_idea_id = Column(Integer, ForeignKey("raw_ideas.id", ondelete="CASCADE"), nullable=False)
    cluster_id = Column(Integer, ForeignKey("idea_clusters.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    processed_text = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    raw_idea = relationship("RawIdea", back_populates="ideas")
    cluster = relationship("IdeaCluster", back_populates="ideas")
    market_analyses = relationship("MarketAnalysis", back_populates="idea", cascade="all, delete-orphan")
    notion_mappings = relationship("NotionMapping", back_populates="idea", cascade="all, delete-orphan")
