# Tasks: Transfer Request Initiation & Submission

## Derived From
.ai-context/plans/transfer-request-initiation.plan.md

## Sequence
- [x] `transfer-request-initiation`.T01 — Create automated failing unit test suite covering AC1 to AC5 / UT01 to UT05 (TDD RED) — Acceptance: `transfer-request-initiation`.AC1, `transfer-request-initiation`.AC2, `transfer-request-initiation`.AC3, `transfer-request-initiation`.AC4, `transfer-request-initiation`.AC5
- [x] `transfer-request-initiation`.T02 — Implement request validation schemas using Zod in `src/backend/modules/transfers/validators/` — Acceptance: `transfer-request-initiation`.AC5
- [x] `transfer-request-initiation`.T03 — Implement data repository queries and Prisma model mappings in `src/backend/modules/transfers/repositories/` — Acceptance: `transfer-request-initiation`.AC1, `transfer-request-initiation`.AC2
- [x] `transfer-request-initiation`.T04 — Implement core business logic in `src/backend/modules/transfers/services/` (eligibility check, conflict detection, role mismatch check) — Acceptance: `transfer-request-initiation`.AC1, `transfer-request-initiation`.AC2, `transfer-request-initiation`.AC3, `transfer-request-initiation`.AC4
- [x] `transfer-request-initiation`.T05 — Implement HTTP controller handlers and route registration under `/api/v1/transfers` in `src/backend/modules/transfers/controllers/` and `routes/` — Acceptance: `transfer-request-initiation`.AC1, `transfer-request-initiation`.AC2, `transfer-request-initiation`.AC3, `transfer-request-initiation`.AC4, `transfer-request-initiation`.AC5
- [x] `transfer-request-initiation`.T06 — Implement frontend API service and custom React state hook in `src/frontend/modules/transfers/services/` and `hooks/` — Acceptance: `transfer-request-initiation`.AC1, `transfer-request-initiation`.AC2
- [x] `transfer-request-initiation`.T07 — Implement frontend UI components (`EligibilityBanner`, `TransferRequestForm`, `TransferInitiationPage`) with responsive layout — Acceptance: `transfer-request-initiation`.AC1, `transfer-request-initiation`.AC2, `transfer-request-initiation`.AC3, `transfer-request-initiation`.AC4, `transfer-request-initiation`.AC5
- [x] `transfer-request-initiation`.T08 — Run full test suite across backend and frontend to achieve 100% GREEN and verify code quality — Acceptance: Full Suite Verification
