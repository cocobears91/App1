"""Model training utilities for the risk scorer."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Tuple

import joblib
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingClassifier


@dataclass
class TrainingResult:
    model_path: Path
    roc_auc: float
    report: Dict[str, Dict[str, float]]


class RiskModelTrainer:
    """Handles model training, evaluation, and persistence."""

    def __init__(self, *, random_state: int = 42) -> None:
        self.random_state = random_state
        self.pipeline: Pipeline | None = None

    def train(self, features, labels, validation_split: float = 0.2) -> Tuple[Pipeline, Dict[str, float]]:
        X_train, X_test, y_train, y_test = train_test_split(
            features,
            labels,
            test_size=validation_split,
            random_state=self.random_state,
            stratify=labels,
        )

        numeric_features = list(features.columns)
        preprocessor = ColumnTransformer(
            transformers=[
                (
                    "num",
                    Pipeline(
                        steps=[
                            ("imputer", SimpleImputer(strategy="median")),
                            ("scaler", StandardScaler()),
                        ]
                    ),
                    numeric_features,
                )
            ],
            remainder="drop",
        )

        model = GradientBoostingClassifier(random_state=self.random_state)

        pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("model", model)])
        pipeline.fit(X_train, y_train)

        preds_proba = pipeline.predict_proba(X_test)[:, 1]
        preds = (preds_proba >= 0.5).astype(int)
        roc = roc_auc_score(y_test, preds_proba)
        report = classification_report(y_test, preds, output_dict=True)

        self.pipeline = pipeline
        return pipeline, {"roc_auc": roc, "report": report}

    def save(self, output_path: Path) -> Path:
        if self.pipeline is None:
            raise ValueError("Model not trained yet")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.pipeline, output_path)
        return output_path

