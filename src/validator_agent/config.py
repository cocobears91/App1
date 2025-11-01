"""Configuration settings for the validator agent."""

from pathlib import Path
from typing import Literal, Optional

from pydantic import BaseModel, Field


class Settings(BaseModel):
    """Application configuration with sensible defaults."""

    project_root: Path = Field(default_factory=lambda: Path(__file__).resolve().parents[2])
    knowledge_base_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parents[2] / "knowledge_base")
    model_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parents[2] / "models")
    artifacts_dir: Path = Field(default_factory=lambda: Path(__file__).resolve().parents[2] / "artifacts")
    rules_glob: str = Field(default="rules/*.yaml")
    data_source: Literal["synthetic", "jsonl"] = "synthetic"
    dataset_format: Literal["jsonl"] = "jsonl"
    claims_dataset_path: Optional[Path] = None
    labels_dataset_path: Optional[Path] = None
    training_seed: int = 42
    training_sample_size: int = 5000
    validation_split: float = 0.2
    model_name: str = "xgboost_risk_model.joblib"

    class Config:
        arbitrary_types_allowed = True


settings = Settings()

