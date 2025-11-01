## Validator Agent Architecture

### High-Level Components
1. **Ingestion Layer**
   - Accepts claim batches via REST API or SFTP drop (CSV/JSON).
   - Normalizes payloads into canonical schema (`ClaimHeader`, `ClaimLine`, `PatientContext`).
2. **Knowledge Orchestrator**
   - Consolidates deterministic rule sets (NCCI, LCD, facility policies).
   - Manages embeddings-backed semantic search over textual guidance (CMS manuals, payer bulletins).
3. **Validation Engine**
   - **Rule Evaluator**: Deterministic rules executed in priority order (hard stops vs soft warnings).
   - **ML Risk Scorer**: Gradient boosted trees or transformer-based classifier predicting denial likelihood per line and claim.
   - **LLM Reasoner (optional)**: Generates human-readable rationales, leveraging retrieved context.
4. **Feedback Service**
   - Persists findings with severity, rationale, recommended actions.
   - Exposes remediation API/UI hooks.
5. **Learning Loop**
   - Curates auditor feedback, updates rule set, fine-tunes ML/LLM models on labeled denials.

### Data Flow
1. **Ingest** claim batch.
2. **Normalize** to canonical schema.
3. **Lookup** relevant rules/coverage policies via knowledge orchestrator.
4. **Apply** deterministic rules (hard failures short-circuit).
5. **Score** claim via ML model for nuanced risk (e.g., medical necessity, documentation sufficiency).
6. **Generate** explanations and recommended fixes.
7. **Log** results, update feedback store, and optionally trigger re-training if new labels exceed threshold.

### Data Schema (Canonical)

```startLine:50:endLine:/workspace/schema/canonical_claim_schema.yaml
# ... existing code ...
```

> Schema defined in `schema/canonical_claim_schema.yaml` (see file for details).

### Knowledge Sources & Storage
- **Rules Database**: Versioned JSON/YAML rules, keyed by effective date and payer.
- **LLM Retrieval Index**: FAISS/pgvector store containing embeddings of regulatory text.
- **Feature Store**: Aggregated claim-level features (historical utilization, comorbidity scores).
- **Feedback Store**: Denial outcomes, auditor annotations, human-in-the-loop corrections.

### Training Strategy
- **Rule Layer**: Authored by SMEs, validated via unit tests and synthetic claim scenarios.
- **ML Risk Model**:
  - Input features: service mix, diagnosis clusters, prior denials, documentation tags.
  - Labels: binary/ordinal denial outcomes, severity categories.
  - Algorithms: XGBoost (baseline), optionally fine-tuned domain-specific transformer.
  - Training cadence: monthly or upon significant policy updates.
  - Evaluation: precision/recall on critical denial categories, calibration plots, fairness by demographic attributes.
- **LLM Reasoner** (if used):
  - Base model: domain-tuned LLM (e.g., `medllama`, `gpt-4o mini`) via RAG.
  - Prompts include claim context + retrieved policy snippets.
  - Guardrails: ensure deterministic rule violations override generative suggestions.

### Deployment
- Containerized microservices (FastAPI for ingestion, Celery for batch processing).
- Rule engine and ML model exposed via gRPC/REST.
- CI/CD with automated regression suite on reference claims.
- Compliance: logging, audit trails, PHI encryption.

### MLOps & Governance
- Model registry (e.g., MLflow) tracking training data provenance and performance.
- Policy versioning: maintain mapping between rules/models and effective regulation dates.
- Monitoring: drift detection on code utilization and denial rates; alert SMEs for review.

