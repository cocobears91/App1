## Evaluation & Next Steps

### Current Automated Checks
- **Rule Coverage**: Deterministic rules derived from CMS guidance and common senior-care denial patterns (see `knowledge_base/rules/core.yaml`).
- **ML Metrics**: `artifacts/training_metrics.json` captures ROC-AUC and precision/recall using synthetic labels engineered to mimic denial risk.
- **Explainability**: Each rule finding surfaces message + rationale, and the ML model can expose feature importances via `pipeline['model'].feature_importances_`.

### Recommended Enhancements
- **Expand Rule Library**: Collaborate with SMEs to encode payer-specific LCDs, PDPM component checks, MUE/NCCI tables, and hospice modifiers.
- **Data Integration**: Replace synthetic generator with de-identified historical claims + denial outcomes. Ensure PHI governance and audit logging.
- **Model Validation**:
  - Perform cross-validation with stratified folds by facility type.
  - Track calibration curves and confusion matrices per payer.
  - Add fairness assessment buckets (age bands, gender, dual-eligibility).
- **Testing**:
  - Unit tests for rule engine edge cases and DSL parsing.
  - Regression suite of golden claims with expected findings.
  - Integration test for `validate_claim_batch` including missing model scenario.
- **LLM Reasoning (Optional)**:
  - Introduce retrieval index over CMS manuals (FAISS/pgvector) and prompt templating for contextual explanations.
  - Apply guardrails to ensure generative output aligns with deterministic findings.

### Deployment Readiness Checklist
- Containerize pipeline (Dockerfile) and configure CI to run `scripts/train.py --samples 2000` smoke test.
- Set up model registry (MLflow) and rule version tagging.
- Establish monitoring on production denial rates, false positives, and rule hit frequency.
- Document incident response workflow for regulatory updates.

