"""Pydantic models aligned with the canonical claim schema."""

from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class DocumentReference(BaseModel):
    document_id: str
    document_type: str
    source_uri: Optional[str] = None
    signed_ts: Optional[datetime] = None
    attestation: Optional[str] = None


class ClaimLine(BaseModel):
    line_number: int
    hcpcs_cpt: str
    icd10_pcs: Optional[str] = None
    modifiers: List[str] = Field(default_factory=list)
    revenue_code: str
    service_date: Optional[date] = None
    units: float
    billed_amount: float
    rendering_npi: Optional[str] = None
    diagnosis_pointers: List[int] = Field(default_factory=list)
    notes_ref: List[str] = Field(default_factory=list)


class ClaimHeader(BaseModel):
    facility_npi: str
    attending_npi: str
    rendering_npi: Optional[str] = None
    billed_amount: Optional[float] = None
    expected_reimbursement: Optional[float] = None
    admission_type: Optional[str] = None
    discharge_status: Optional[str] = None
    service_from: date
    service_to: date
    place_of_service: str
    diagnosis_codes: List[str] = Field(default_factory=list)
    value_codes: List[str] = Field(default_factory=list)
    occurrence_codes: List[str] = Field(default_factory=list)


class PatientRiskScores(BaseModel):
    hcc: Optional[float] = None
    pdpm: Optional[dict] = None
    frailty_index: Optional[float] = None


class PatientContext(BaseModel):
    patient_id: str
    dob: date
    gender: str
    dual_eligible: Optional[bool] = None
    hospice_election: Optional[bool] = None
    risk_scores: Optional[PatientRiskScores] = None
    chronic_conditions: List[str] = Field(default_factory=list)


class Claim(BaseModel):
    claim_id: str
    payer: Optional[str] = None
    coverage_type: Optional[str] = None
    submission_ts: Optional[datetime] = None
    header: ClaimHeader
    patient: PatientContext
    lines: List[ClaimLine]
    documents: List[DocumentReference] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)


class ClaimBatch(BaseModel):
    batch_id: str
    ingestion_ts: datetime
    source_system: Optional[str] = None
    facility_type: Optional[str] = None
    claims: List[Claim]

