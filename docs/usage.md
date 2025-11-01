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
- Bring your own dataset (JSONL aligned to `Claim` schema):
  - `python scripts/train.py --config configs/jsonl_training.json`
  - Example config payload:
    ```json
    {
      "data_source": "jsonl",
      "claims_dataset_path": "data/sample_claims.jsonl",
      "training_seed": 123,
      "validation_split": 0.3
    }
    ```
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
- Produce JSONL exports where each line mirrors a `Claim` structure; optionally include `label` for known denials.
- Update the config to point at the dataset paths (`claims_dataset_path`, `labels_dataset_path`).
- Replace synthetic generation in `TrainingPipeline` with ETL loading from secure data stores.

### 6. Containerized Execution
- Build image: `docker build -t senior-care-validator .`
- Run training (synthetic): `docker run --rm -v $(pwd)/artifacts:/app/artifacts -v $(pwd)/models:/app/models senior-care-validator`
- Run with external dataset:
  - `docker run --rm -v $(pwd):/app -e CONFIG_PATH=configs/jsonl_training.json senior-care-validator python scripts/train.py --config $CONFIG_PATH`

