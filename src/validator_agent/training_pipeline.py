"""End-to-end training pipeline orchestrating data, features, and model."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Tuple

import pandas as pd

from .config import Settings, settings
from .feature_engineering import build_feature_frame
from .model_training import RiskModelTrainer
from .synthetic_data import generate_synthetic_claims


@dataclass
class PipelineArtifacts:
    model_path: Path
    metrics_path: Path
    metrics: Dict[str, float]


class TrainingPipeline:
    """Coordinates synthetic data generation, model fitting, and artifact storage."""

    def __init__(self, cfg: Settings | None = None) -> None:
        self.cfg = cfg or settings

    def _prepare_training_data(self) -> Tuple[pd.DataFrame, pd.Series]:
        claims, labels = generate_synthetic_claims(
            n=self.cfg.training_sample_size,
            seed=self.cfg.training_seed,
        )
        features = build_feature_frame(claims)
        features = features.fillna(0).astype(float)
        target = pd.Series(labels).loc[features.index]
        return features, target

    def run(self) -> PipelineArtifacts:
        features, target = self._prepare_training_data()

        trainer = RiskModelTrainer(random_state=self.cfg.training_seed)
        pipeline, metrics = trainer.train(features, target, validation_split=self.cfg.validation_split)

        model_dir = self.cfg.model_dir
        model_dir.mkdir(parents=True, exist_ok=True)
        model_path = trainer.save(model_dir / self.cfg.model_name)

        metrics_payload = {
            "roc_auc": metrics["roc_auc"],
            "classification_report": metrics["report"],
            "training_sample_size": len(features),
            "validation_split": self.cfg.validation_split,
        }

        artifacts_dir = self.cfg.artifacts_dir
        artifacts_dir.mkdir(parents=True, exist_ok=True)
        metrics_path = artifacts_dir / "training_metrics.json"
        metrics_path.write_text(json.dumps(metrics_payload, indent=2), encoding="utf-8")

        return PipelineArtifacts(model_path=model_path, metrics_path=metrics_path, metrics=metrics_payload)

