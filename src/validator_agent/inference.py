"""Inference utilities combining deterministic rules and ML risk scoring."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import List

import joblib
import pandas as pd

from .config import settings
from .data_models import Claim, ClaimBatch
from .feature_engineering import build_features
from .rule_engine import RuleEngine, ValidationFinding


@dataclass
class RiskScore:
    claim_id: str
    probability: float


class RiskScorer:
    """Loads the trained pipeline and produces risk scores."""

    def __init__(self, model_path: Path | None = None) -> None:
        model_path = model_path or (settings.model_dir / settings.model_name)
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found at {model_path}. Train the model first.")
        self.pipeline = joblib.load(model_path)

    def score_claim(self, claim: Claim) -> RiskScore:
        features = build_features(claim)
        df = pd.DataFrame([features])
        df = df.reindex(columns=self.pipeline["preprocessor"].feature_names_in_, fill_value=0)
        proba = float(self.pipeline.predict_proba(df)[:, 1][0])
        return RiskScore(claim_id=claim.claim_id, probability=proba)

    def score_batch(self, claims: List[Claim]) -> List[RiskScore]:
        return [self.score_claim(claim) for claim in claims]


@dataclass
class ValidationResult:
    claim_id: str
    rule_findings: List[ValidationFinding]
    risk_score: RiskScore | None


def validate_claim_batch(
    batch: ClaimBatch,
    *,
    rule_engine: RuleEngine | None = None,
    risk_scorer: RiskScorer | None = None,
) -> List[ValidationResult]:
    engine = rule_engine or RuleEngine()
    scorer = risk_scorer
    if scorer is None:
        try:
            scorer = RiskScorer()
        except FileNotFoundError:
            scorer = None

    results: List[ValidationResult] = []
    for claim in batch.claims:
        findings = engine.evaluate(claim)
        risk = scorer.score_claim(claim) if scorer else None
        results.append(ValidationResult(claim_id=claim.claim_id, rule_findings=findings, risk_score=risk))
    return results

