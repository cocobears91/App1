"""Feature engineering utilities for claim-level ML model."""

from __future__ import annotations

from collections import Counter
from datetime import date
from typing import Dict

import pandas as pd

from .data_models import Claim


THERAPY_CODES = {"97110", "97112", "97116", "97530"}
CCM_CODES = {"99490", "99439", "99487", "99489"}
DME_CODES = {"E0260", "E0261", "E1390"}


def _days_between(start: date, end: date) -> int:
    if not start or not end:
        return 0
    return max(0, (end - start).days + 1)


def build_features(claim: Claim) -> Dict[str, float]:
    header = claim.header
    metadata = claim.metadata or {}
    billed_amount = header.billed_amount or sum(line.billed_amount for line in claim.lines)
    total_units = sum(line.units for line in claim.lines)
    code_counter = Counter(line.hcpcs_cpt for line in claim.lines)

    therapy_units = sum(line.units for line in claim.lines if line.hcpcs_cpt in THERAPY_CODES)
    ccm_units = sum(line.units for line in claim.lines if line.hcpcs_cpt in CCM_CODES)
    dme_units = sum(line.units for line in claim.lines if line.hcpcs_cpt in DME_CODES)

    service_days = _days_between(header.service_from, header.service_to)

    features = {
        "num_lines": len(claim.lines),
        "total_billed_amount": billed_amount,
        "total_units": total_units,
        "service_days": service_days,
        "therapy_units": therapy_units,
        "ccm_units": ccm_units,
        "dme_units": dme_units,
        "num_unique_codes": len(code_counter),
        "max_units_single_line": max((line.units for line in claim.lines), default=0),
        "avg_units_per_line": (total_units / len(claim.lines)) if claim.lines else 0,
        "document_count": len(claim.documents),
        "face_to_face_documented": 1 if metadata.get("face_to_face_date") else 0,
        "therapy_minutes": metadata.get("total_therapy_minutes", 0),
        "avg_daily_therapy_minutes": metadata.get("average_daily_therapy_minutes", 0),
        "ccm_minutes": metadata.get("ccm_minutes", 0),
        "consolidated_billing_exempt": 1 if metadata.get("consolidated_billing_exempt") else 0,
        "is_dual_eligible": 1 if claim.patient.dual_eligible else 0,
        "has_hospice_election": 1 if claim.patient.hospice_election else 0,
        "hcc_risk_score": (claim.patient.risk_scores.hcc if claim.patient.risk_scores else 0) or 0,
        "frailty_index": (claim.patient.risk_scores.frailty_index if claim.patient.risk_scores else 0) or 0,
        "num_chronic_conditions": len(claim.patient.chronic_conditions),
    }

    # One-hot for facility type and coverage
    facility = (claim.metadata or {}).get("facility_type") if claim.metadata else None
    coverage = claim.coverage_type or "Unknown"
    facility_key = f"facility_type_{facility or 'Unknown'}"
    coverage_key = f"coverage_{coverage}"
    features[facility_key] = 1
    features[coverage_key] = 1

    return features


def build_feature_frame(claims: Dict[str, Claim]) -> pd.DataFrame:
    rows = []
    for claim_id, claim in claims.items():
        feature_row = build_features(claim)
        feature_row["claim_id"] = claim_id
        rows.append(feature_row)
    df = pd.DataFrame(rows)
    return df.set_index("claim_id")

