"""Utilities to load de-identified claims datasets for training/inference."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Tuple

from .data_models import Claim


def load_claims_from_jsonl(path: Path) -> Dict[str, Claim]:
    """Load claims from a JSONL file.

    Each line should be a JSON object with either:
      - a top-level `claim` key containing an object compatible with `Claim`
      - or the full claim structure itself.

    Optionally include `claim_id` alongside the nested payload to override IDs.
    """

    claims: Dict[str, Claim] = {}
    with path.open("r", encoding="utf-8") as fh:
        for line in fh:
            if not line.strip():
                continue
            record = json.loads(line)
            if "claim" in record:
                claim_payload = record["claim"]
                claim_id = record.get("claim_id") or claim_payload.get("claim_id")
            else:
                claim_payload = record
                claim_id = claim_payload.get("claim_id")
            if not claim_id:
                raise ValueError("Claim record missing 'claim_id'")
            claim = Claim.model_validate(claim_payload)
            claims[claim.claim_id] = claim
    return claims


def load_labels_from_jsonl(path: Path) -> Dict[str, int]:
    """Load claim labels from a JSONL file (expecting `claim_id` and `label`)."""

    labels: Dict[str, int] = {}
    with path.open("r", encoding="utf-8") as fh:
        for line in fh:
            if not line.strip():
                continue
            record = json.loads(line)
            claim_id = record.get("claim_id")
            if claim_id is None:
                raise ValueError("Label record missing 'claim_id'")
            labels[claim_id] = int(record.get("label", 0))
    return labels


def load_dataset(
    *,
    claims_path: Path,
    labels_path: Path | None = None,
) -> Tuple[Dict[str, Claim], Dict[str, int]]:
    """Load claims and labels from configured sources."""

    claims = load_claims_from_jsonl(claims_path)
    if labels_path and labels_path.exists():
        labels = load_labels_from_jsonl(labels_path)
    else:
        # Attempt to infer labels embedded in claims file
        labels = {}
        with claims_path.open("r", encoding="utf-8") as fh:
            for line in fh:
                if not line.strip():
                    continue
                record = json.loads(line)
                label = record.get("label")
                if label is not None:
                    claim_id = record.get("claim_id") or record.get("claim", {}).get("claim_id")
                    if claim_id:
                        labels[str(claim_id)] = int(label)
    return claims, labels

