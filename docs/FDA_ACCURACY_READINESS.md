# FDA/Accuracy Readiness Notes (Worksheet + Findings Engine)

## Important framing

This update improves clinical rule coverage, validation, and traceability, but does not by itself establish "99% accuracy" or FDA clearance. FDA clearance requires intended-use definition, clinical validation, risk management, quality system controls, human factors work, and regulatory submission strategy.

## Primary guidance reviewed

- FDA Software as a Medical Device (SaMD):
  - https://www.fda.gov/medical-devices/digital-health-center-excellence/software-medical-device-samd
- FDA Clinical Decision Support Software Guidance (Jan 2026):
  - https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software
- FDA/HC/MHRA Good Machine Learning Practice (GMLP):
  - https://www.fda.gov/medical-devices/software-medical-device-samd/good-machine-learning-practice-medical-device-development-guiding-principles
- FDA transparency principles for ML-enabled devices:
  - https://www.fda.gov/medical-devices/software-medical-device-samd/transparency-machine-learning-enabled-medical-devices-guiding-principles
- ACR TI-RADS program page:
  - https://www.acr.org/Clinical-Resources/Clinical-Tools-and-Reference/Reporting-and-Data-Systems/TI-RADS
- ACR TI-RADS white paper citation (2017):
  - https://pubmed.ncbi.nlm.nih.gov/?term=28372962
- AIUM abdomen/retroperitoneum practice parameter:
  - https://www.aium.org/resources/practice-parameters/abdomen-or-retroperitoneum

## Changes implemented in this pass

1. Deterministic rule constants and threshold use
- Centralized thresholds used in findings logic:
  - gallbladder wall, CBD, pancreatic duct, spleen size, portal vein, aorta ectasia/aneurysm cutoffs.

2. Validation engine for edge-case and completeness checks
- Added `ValidationIssue` model (`error` or `warning`).
- Added `validateAbdomenWorksheet(...)`:
  - missing critical measurements warnings
  - invalid numeric values (negative/invalid) as blocking errors
  - pancreas duct missing warning when pancreas visualized
- Added `validateThyroidWorksheet(...)`:
  - incomplete lobe dimensions warnings
  - missing isthmus warning
  - nodule size missing/invalid as blocking errors

3. Signing guardrails
- Report transmission is blocked when any validation `error` exists.
- Warnings are surfaced before transmission for operator review.

4. Guideline-anchored thyroid recommendations
- Added per-nodule ACR TI-RADS recommendation logic based on TI-RADS category + size:
  - TR3: follow-up >= 1.5 cm; FNA >= 2.5 cm
  - TR4: follow-up >= 1.0 cm; FNA >= 1.5 cm
  - TR5: follow-up >= 0.5 cm; FNA >= 1.0 cm
- Recommendations are shown in preview and included in report text output.

5. Preview transparency
- Added validation section in report preview:
  - explicit ERROR/WARNING visibility before sign/send
- Added recommendations section in report preview.

## Files changed for this safety pass

- `src/lib/report-engine.ts`
- `app/page.tsx`
- `src/components/sonoflow/ReportPreview.tsx`

## Remaining gaps before any FDA-clearance claim

1. Clinical validation dataset and protocol
- Need locked test set(s), ground truth process, inter-reader variability controls, and pre-specified metrics.

2. Risk management file
- Need ISO 14971-style hazard analysis, mitigations, verification evidence, and residual risk acceptance.

3. Software lifecycle quality controls
- Need design controls, traceability matrix (requirements -> implementation -> verification), and change control.

4. Human factors/usability engineering
- Need formal usability studies for intended users/environments and critical task analysis.

5. Performance monitoring and post-market plan
- Need drift/error monitoring, complaint handling, CAPA workflow, and update governance.

6. Regulatory strategy
- Need determination of product category, predicate/de novo pathway as applicable, and formal FDA interaction strategy.

## Practical next implementation steps

1. Add automated unit test matrix for all findings/threshold branches and contradiction checks.
2. Add structured "reason codes" per generated impression line for full traceability.
3. Add mandatory exam completeness checklist with configurable site policy.
4. Add review/attestation step requiring sonographer sign-off on unresolved warnings.
