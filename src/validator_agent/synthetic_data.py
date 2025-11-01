"""Synthetic data generator for training and testing."""

from __future__ import annotations

import random
from datetime import datetime, timedelta
from typing import Dict, List, Tuple

from .data_models import Claim, ClaimBatch, ClaimHeader, ClaimLine, DocumentReference, PatientContext, PatientRiskScores


FACILITY_TYPES = ["SNF", "HomeHealth", "AssistedLiving"]
COVERAGE_TYPES = ["MedicareA", "MedicareB", "MedicareAdvantage", "Medicaid"]


def _random_date(start: datetime, end: datetime) -> datetime:
    delta = end - start
    return start + timedelta(days=random.randint(0, delta.days))


def _create_claim(claim_id: str, facility_type: str, coverage_type: str, seed: int) -> Tuple[Claim, int]:
    random.seed(seed)
    service_from = datetime(2025, 1, 1) + timedelta(days=random.randint(0, 120))
    length_of_stay = random.randint(3, 21)
    service_to = service_from + timedelta(days=length_of_stay)

    base_header = ClaimHeader(
        facility_npi=f"{random.randint(1000000000, 1999999999)}",
        attending_npi=f"{random.randint(1000000000, 1999999999)}",
        rendering_npi=f"{random.randint(1000000000, 1999999999)}",
        billed_amount=round(random.uniform(500, 20000), 2),
        expected_reimbursement=round(random.uniform(400, 15000), 2),
        admission_type="elective",
        discharge_status="home",
        service_from=service_from.date(),
        service_to=service_to.date(),
        place_of_service="31" if facility_type == "SNF" else "12",
        diagnosis_codes=[random.choice(["M62.81", "Z47.89", "E11.9", "I50.9"]), "R53.1"],
    )

    patient = PatientContext(
        patient_id=f"P{random.randint(10000, 99999)}",
        dob=datetime(1940, 1, 1).date() + timedelta(days=random.randint(0, 365 * 40)),
        gender=random.choice(["F", "M"]),
        dual_eligible=random.choice([True, False]),
        hospice_election=random.choice([False, False, True]),
        risk_scores=PatientRiskScores(
            hcc=round(random.uniform(0.5, 3.5), 2),
            frailty_index=round(random.uniform(0.2, 0.7), 2),
        ),
        chronic_conditions=[random.choice(["CHF", "COPD", "Diabetes", "Dementia"]), "Hypertension"],
    )

    lines: List[ClaimLine] = []
    findings_risk = 0

    if facility_type == "SNF":
        lines.append(
            ClaimLine(
                line_number=1,
                hcpcs_cpt=random.choice(["97110", "97112", "97530"]),
                revenue_code="0420",
                units=random.randint(1, 6),
                billed_amount=round(random.uniform(80, 200), 2),
            )
        )
        if random.random() < 0.4:
            # DME line capturing consolidated billing scenario
            exempt = random.random() < 0.5
            lines.append(
                ClaimLine(
                    line_number=2,
                    hcpcs_cpt=random.choice(["E0260", "E0261", "E1390"]),
                    revenue_code="0270",
                    units=1,
                    billed_amount=round(random.uniform(150, 400), 2),
                )
            )
            if not exempt:
                findings_risk = max(findings_risk, 1)
            metadata = {
                "facility_type": facility_type,
                "total_therapy_minutes": random.randint(30, 120),
                "average_daily_therapy_minutes": random.randint(10, 45),
                "consolidated_billing_exempt": exempt,
                "physician_order_present": random.random() < 0.85,
            }
        else:
            metadata = {
                "facility_type": facility_type,
                "total_therapy_minutes": random.randint(30, 120),
                "average_daily_therapy_minutes": random.randint(10, 45),
                "physician_order_present": random.random() < 0.9,
            }
            if metadata["total_therapy_minutes"] < 60:
                findings_risk = max(findings_risk, 1)
        metadata.setdefault("hospice_election_documented", True)
        if patient.hospice_election and any(line.hcpcs_cpt in {"97110", "97112", "97530"} for line in lines):
            metadata["hospice_election_documented"] = False
            findings_risk = max(findings_risk, 1)
        metadata["visits_per_week"] = random.randint(3, 9)
    elif facility_type == "HomeHealth":
        lines.append(
            ClaimLine(
                line_number=1,
                hcpcs_cpt=random.choice(["G0151", "G0152", "G0155"]),
                revenue_code="0421",
                units=random.randint(1, 4),
                billed_amount=round(random.uniform(150, 300), 2),
            )
        )
        face_to_face = random.random() < 0.7
        metadata = {
            "facility_type": facility_type,
            "face_to_face_date": (_random_date(service_from - timedelta(days=60), service_from + timedelta(days=20))).date() if face_to_face else None,
            "visits_per_week": random.randint(4, 12),
            "physician_order_present": random.random() < 0.8,
        }
        if not metadata["face_to_face_date"]:
            findings_risk = max(findings_risk, 1)
    else:
        lines.append(
            ClaimLine(
                line_number=1,
                hcpcs_cpt=random.choice(["99490", "99439", "G2058"]),
                revenue_code="0510",
                units=random.randint(1, 2),
                billed_amount=round(random.uniform(60, 120), 2),
            )
        )
        metadata = {
            "facility_type": facility_type,
            "ccm_minutes": random.randint(10, 40),
            "visits_per_week": random.randint(2, 8),
            "physician_order_present": random.random() < 0.75,
        }
        if metadata["ccm_minutes"] < 20 and lines[0].hcpcs_cpt in {"99490", "99439"} and coverage_type in {"MedicareB", "MedicareAdvantage"}:
            findings_risk = max(findings_risk, 1)

    documents = [
        DocumentReference(
            document_id=f"DOC{random.randint(1000, 9999)}",
            document_type="PlanOfCare",
            signed_ts=service_from,
        )
    ]

    claim = Claim(
        claim_id=claim_id,
        payer=random.choice(["Humana", "UHC", "CMS"]),
        coverage_type=coverage_type,
        submission_ts=service_to + timedelta(days=5),
        header=base_header,
        patient=patient,
        lines=lines,
        documents=documents,
        metadata=metadata,
    )

    label = 1 if findings_risk else (1 if random.random() < 0.05 else 0)
    return claim, label


def generate_synthetic_claims(n: int = 5000, seed: int = 42) -> Tuple[Dict[str, Claim], Dict[str, int]]:
    random.seed(seed)
    claims: Dict[str, Claim] = {}
    labels: Dict[str, int] = {}
    for idx in range(n):
        facility_type = random.choice(FACILITY_TYPES)
        coverage_type = random.choice(COVERAGE_TYPES)
        claim_id = f"CL{seed}{idx:05d}"
        claim, label = _create_claim(claim_id, facility_type, coverage_type, seed + idx)
        claims[claim_id] = claim
        labels[claim_id] = label
    return claims, labels


def build_synthetic_batch(n: int = 25, seed: int = 999) -> ClaimBatch:
    claims, _ = generate_synthetic_claims(n=n, seed=seed)
    batch = ClaimBatch(
        batch_id=f"BATCH-{seed}",
        ingestion_ts=datetime.utcnow(),
        source_system="synthetic",
        facility_type="mixed",
        claims=list(claims.values()),
    )
    return batch

