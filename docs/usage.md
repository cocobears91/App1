## Running the Senior-Care Billing Validator Agent

### 1. Environment Setup
- Python 3.11+ recommended.
- Install dependencies:
  - `python -m venv .venv && source .venv/bin/activate`
  - `pip install -r requirements.txt`

### 2. Train the Risk Model
- Default synthetic training run:
  - `python scripts/train.py`
- Override sample size/seed:
  - `python scripts/train.py --samples 10000 --seed 123`
- Outputs:
  - Model pipeline: `models/xgboost_risk_model.joblib`
  - Metrics JSON: `artifacts/training_metrics.json`

### 3. Validate Claims
```python
from validator_agent.inference import validate_claim_batch
from validator_agent.synthetic_data import build_synthetic_batch

batch = build_synthetic_batch(n=5)
results = validate_claim_batch(batch)

for result in results:
    print(result.claim_id, result.risk_score)
    for finding in result.rule_findings:
        print(f" - {finding.severity.upper()}: {finding.message}")
```

### 4. Updating Rules
- Edit or extend YAML files in `knowledge_base/rules/`.
- Use descriptive `id`, `scope` (`claim` or `line`), and `conditions` with supported operators (`equals`, `in`, `lt`, `lte`, `gte`, `gt`, `contains`, `not_contains`, `exists`, `missing`, `regex`).
- Add unit tests (future work) to guard regressions.

### 5. Integrating with Real Data
- Map incoming claim payloads to the canonical schema (`schema/canonical_claim_schema.yaml`).
- Populate `Claim` / `ClaimBatch` Pydantic models to leverage the existing pipeline.
- Replace synthetic generation in `TrainingPipeline` with ETL loading from secure data stores.

