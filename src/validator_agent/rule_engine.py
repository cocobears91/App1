"""Simple rule engine for deterministic senior-care billing checks."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

import yaml

from .config import settings
from .data_models import Claim


@dataclass
class ValidationFinding:
    rule_id: str
    message: str
    severity: str
    rationale: str
    scope: str
    context: Dict[str, Any]


class RuleEngine:
    """Loads YAML rules and executes them against claims."""

    def __init__(self, kb_dir: Optional[Path] = None, rules_glob: Optional[str] = None) -> None:
        self.kb_dir = kb_dir or settings.knowledge_base_dir
        self.rules_glob = rules_glob or settings.rules_glob
        self.rules = self._load_rules()

    def _load_rules(self) -> List[Dict[str, Any]]:
        pattern = f"{self.kb_dir}/{self.rules_glob}"
        rule_files = list(Path(self.kb_dir).glob(self.rules_glob))
        if not rule_files:
            raise FileNotFoundError(f"No rule files found using glob '{pattern}'")
        rules: List[Dict[str, Any]] = []
        for path in rule_files:
            with path.open("r", encoding="utf-8") as fh:
                payload = yaml.safe_load(fh)
                if not payload or "rules" not in payload:
                    continue
                for rule in payload["rules"]:
                    rule["_source"] = str(path)
                    rules.append(rule)
        return rules

    def evaluate(self, claim: Claim) -> List[ValidationFinding]:
        findings: List[ValidationFinding] = []
        for rule in self.rules:
            scope = rule.get("scope", "claim")
            if scope == "claim":
                if self._rule_applies(rule, claim=claim):
                    result = self._evaluate_conditions(rule, claim=claim, context={})
                    if result:
                        findings.append(result)
            elif scope == "line":
                for line in claim.lines:
                    if self._rule_applies(rule, claim=claim, line=line):
                        context = {"line_number": line.line_number, "hcpcs_cpt": line.hcpcs_cpt}
                        result = self._evaluate_conditions(rule, claim=claim, line=line, context=context)
                        if result:
                            findings.append(result)
        return findings

    def _rule_applies(self, rule: Dict[str, Any], claim: Claim, line: Optional[Any] = None) -> bool:
        applies_to = rule.get("applies_to", {})
        if not applies_to:
            return True
        for key, expected in applies_to.items():
            if key == "facility_type":
                facility_type = claim.metadata.get("facility_type") or claim.metadata.get("facilityType") or claim.metadata.get("FacilityType")
                if facility_type not in expected:
                    return False
            elif key == "coverage_type":
                if claim.coverage_type not in expected:
                    return False
            elif key == "hcpcs_cpt" and line is not None:
                if line.hcpcs_cpt not in expected:
                    return False
        return True

    def _evaluate_conditions(
        self,
        rule: Dict[str, Any],
        *,
        claim: Claim,
        line: Optional[Any] = None,
        context: Dict[str, Any],
    ) -> Optional[ValidationFinding]:
        condition_block = rule.get("conditions", {})
        if not condition_block:
            return None
        outcome = self._eval_block(condition_block, claim=claim, line=line)
        if outcome:
            findings_payload = rule.get("finding", {})
            return ValidationFinding(
                rule_id=rule["id"],
                message=findings_payload.get("message", "Rule violation detected"),
                severity=findings_payload.get("severity", "medium"),
                rationale=findings_payload.get("rationale", rule.get("description", "")),
                scope=rule.get("scope", "claim"),
                context={**context, "rule_source": rule.get("_source")},
            )
        return None

    def _eval_block(self, block: Dict[str, Any], *, claim: Claim, line: Optional[Any]) -> bool:
        if "all" in block:
            return all(self._eval_block(item, claim=claim, line=line) for item in block["all"])
        if "any" in block:
            return any(self._eval_block(item, claim=claim, line=line) for item in block["any"])
        if "not" in block:
            return not self._eval_block(block["not"], claim=claim, line=line)
        # leaf condition
        field = block.get("field")
        operator = block.get("operator", "equals")
        value = block.get("value")
        actual = self._get_field_value(field, claim=claim, line=line)
        return self._apply_operator(operator, actual, value)

    def _get_field_value(self, field: str, *, claim: Claim, line: Optional[Any]) -> Any:
        target = claim
        if field.startswith("line."):
            target = line
            field = field.split("line.", 1)[1]
        elif field.startswith("claim."):
            field = field.split("claim.", 1)[1]
        elif field.startswith("patient."):
            target = claim.patient
            field = field.split("patient.", 1)[1]
        elif field.startswith("header."):
            target = claim.header
            field = field.split("header.", 1)[1]
        elif field.startswith("metadata."):
            target = claim.metadata
            field = field.split("metadata.", 1)[1]
        if target is None:
            return None
        value = getattr(target, field, None)
        if isinstance(target, dict):
            value = target.get(field)
        return value

    def _apply_operator(self, operator: str, actual: Any, expected: Any) -> bool:
        if operator == "equals":
            return actual == expected
        if operator == "not_equals":
            return actual != expected
        if operator == "in":
            return actual in (expected or [])
        if operator == "not_in":
            return actual not in (expected or [])
        if operator == "contains":
            if isinstance(actual, (list, tuple, set)):
                return expected in actual
            if isinstance(actual, str) and isinstance(expected, str):
                return expected in actual
            return False
        if operator == "not_contains":
            if isinstance(actual, (list, tuple, set)):
                return expected not in actual
            if isinstance(actual, str) and isinstance(expected, str):
                return expected not in actual
            return True
        if operator == "gte":
            return actual is not None and actual >= expected
        if operator == "lte":
            return actual is not None and actual <= expected
        if operator == "gt":
            return actual is not None and actual > expected
        if operator == "lt":
            return actual is not None and actual < expected
        if operator == "regex":
            if actual is None:
                return False
            return bool(re.search(expected, str(actual)))
        if operator == "exists":
            return actual is not None
        if operator == "missing":
            return actual in (None, "", [], {})
        raise ValueError(f"Unsupported operator '{operator}'")


def evaluate_claims(claims: Iterable[Claim], engine: Optional[RuleEngine] = None) -> List[ValidationFinding]:
    engine = engine or RuleEngine()
    findings: List[ValidationFinding] = []
    for claim in claims:
        findings.extend(engine.evaluate(claim))
    return findings

