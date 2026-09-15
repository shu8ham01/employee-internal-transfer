# Release v0.1.0

## Release Date
2026-09-15

## Target Version
v0.1.0

## Included Features & Specs
| Spec ID | Feature Title | Spec Link | Status |
|---|---|---|---|
| `transfer-request-initiation` | Transfer Request Initiation & Submission | [.ai-context/specs/transfer-request-initiation.spec.md](file:///e:/Employee%20Internal%20Transfer/.ai-context/specs/transfer-request-initiation.spec.md) | Released (v0.1.0) |

## High-Level Summary
Initial release establishing the core **Transfer Request Initiation & Submission** experience on the enterprise One-Point Employee Portal. Introduces self-service eligibility checking, dynamic enterprise lookups for departments, locations, and open roles, and a guided submission workflow with strict validation guardrails (preventing concurrent active transfers and redundant role submissions).

## Change Log (Spec-Derived)

### Features
- **transfer-request-initiation (BRD-001)**:
  - **Employee Eligibility API & Status**: Query real-time transfer eligibility, active transfer indicators, and current organizational profile (`GET /api/v1/transfers/eligibility`).
  - **Enterprise Lookups**: Retrieve active departments, office locations, and open role listings (`GET /api/v1/transfers/lookup-data`).
  - **Transfer Submission & Workflow Injection**: Submit transfer requests with target assignment, future effective date, justification remarks, and supporting document links (`POST /api/v1/transfers`).
  - **Business Guardrails**: Enforces HTTP 409 Conflict rejection on existing active transfers and HTTP 422 Unprocessable Entity rejection on matching current role/department assignments.
  - **Self-Service React UI**: Responsive `TransferInitiationPage`, `EligibilityBanner`, and `TransferRequestForm` components with real-time field validation and submission state tracking.

### Bug Fixes / Hotfixes
- None (Initial Baseline Release).

## Gate 2 & Verification Sign-Off
- [x] All feature unit and integration tests GREEN (15/15 automated tests passing across 3 test suites)
- [x] Gate 2 code PR review passed and signed off by Tech Lead (`.ai-context/pr_reviews/GATE2-transfer-request-initiation-20260915-133925.md`)
- [x] Zero open Sev-1 / Sev-2 production incidents
- [x] TypeScript type checking verified with 0 errors (`npx tsc --noEmit`)
