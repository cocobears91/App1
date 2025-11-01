## Senior-Care Billing & Coding Validator: Requirements Draft

### Objective
Create an automated validator ("agent") that flags billing and coding issues for senior-care services (e.g., skilled nursing, home health, assisted living). The agent should align with CMS guidelines, payer-specific policies, and industry best practices to minimize claim denials and compliance risk.

### Target Users
- Revenue cycle teams in senior-care provider organizations
- Clinical documentation improvement (CDI) specialists
- Medical billers/coders focused on geriatric care

### Core Capabilities
- **Claim Intake**: Accept structured claim payloads, including patient demographics, encounter details, CPT/HCPCS/ICD-10 codes, modifiers, units, and payer info.
- **Validation**: Evaluate claims for coverage requirements, code-pair compatibility, medical necessity, documentation sufficiency, and bundling/unbundling rules.
- **Feedback**: Return actionable findings with severity, rationale, and recommended remediation.
- **Learning Loop**: Continuously improve via curated rule updates, supervised feedback, and model fine-tuning.

### Senior-Care Specific Focus
- Skilled Nursing Facility (SNF) stays, including PDPM components and consolidated billing requirements.
- Home health episodes (HH PPS), including OASIS-driven diagnoses and visit frequency limits.
- Durable medical equipment (DME) commonly used in geriatric care.
- Chronic care management (CCM), transitional care management (TCM), and preventive services for seniors (e.g., AWV, vaccinations).
- Frequent comorbidities: dementia, CHF, COPD, diabetes, fall-related injuries.

### Data Inputs
1. **Structured Claims Data**
   - Required: Claim headers, line items, diagnosis codes, procedure codes, modifiers, revenue codes, service dates, POS.
   - Optional: OASIS, MDS assessments, visit notes metadata.
2. **Reference Knowledge Base**
   - CMS billing manuals (e.g., Medicare Claims Processing, Benefit Policy).
   - National Correct Coding Initiative (NCCI) edits and Medically Unlikely Edits (MUEs).
   - Local Coverage Determinations (LCDs) pertinent to senior-care services.
   - PDPM/PDGM crosswalks.
3. **Feedback Signals**
   - Historical denials with denial reason codes.
   - Auditor-reviewed training labels indicating claim issues.

### Non-Functional Requirements
- **Explainability**: Each finding must cite the rule/model feature that triggered it.
- **Performance**: Validate a batch of 1,000 claims in < 5 minutes on commodity hardware.
- **Security & Privacy**: Ensure HIPAA-compliant handling of PHI (encryption, auditing, access controls).
- **Versioning**: Track rule/model versions tied to regulatory effective dates.

### Out of Scope (Initial Release)
- Direct EHR integration (interface specs TBD).
- Automated appeals submission.
- Real-time streaming validation; focus on batch/near-real-time.

### Open Questions
- Preferred deployment environment (cloud vendor, on-prem)?
- Available labeled datasets for supervised learning?
- Need for payer-specific rule overrides beyond Medicare?
- SLA requirements for support and updates?

