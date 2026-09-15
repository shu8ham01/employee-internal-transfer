# Tasks: Downstream Operational Task Orchestration

## Derived From
.ai-context/plans/operational-orchestration.plan.md

## Sequence
- [x] `operational-orchestration`.T01 — Create automated failing unit test suite covering AC1 to AC5 / UT01 to UT05 (TDD RED) in `tests/backend/modules/operations/` — Acceptance: `operational-orchestration`.AC1, `operational-orchestration`.AC2, `operational-orchestration`.AC3, `operational-orchestration`.AC4, `operational-orchestration`.AC5
- [x] `operational-orchestration`.T02 — Implement task update validation schemas using Zod in `src/backend/modules/operations/validators/` — Acceptance: `operational-orchestration`.AC2
- [x] `operational-orchestration`.T03 — Implement repository layer for `OperationalTask` entities and employee profile updates in `src/backend/modules/operations/repositories/` — Acceptance: `operational-orchestration`.AC1, `operational-orchestration`.AC2, `operational-orchestration`.AC5
- [x] `operational-orchestration`.T04 — Implement core operations fulfillment domain service logic (`getOperationalTasks`, `spawnInitialTasks`, `updateTask`, `completeTransfer`) in `src/backend/modules/operations/services/` — Acceptance: `operational-orchestration`.AC1, `operational-orchestration`.AC2, `operational-orchestration`.AC3, `operational-orchestration`.AC4, `operational-orchestration`.AC5
- [x] `operational-orchestration`.T05 — Implement HTTP controllers and route endpoints under `/api/v1/transfers/:id/operational-tasks` and `/complete` in `src/backend/modules/operations/controllers/` and `routes/` — Acceptance: `operational-orchestration`.AC1, `operational-orchestration`.AC2, `operational-orchestration`.AC3, `operational-orchestration`.AC4, `operational-orchestration`.AC5
- [x] `operational-orchestration`.T06 — Implement frontend API client service and custom React state hook in `src/frontend/modules/operations/services/` and `hooks/` — Acceptance: `operational-orchestration`.AC1, `operational-orchestration`.AC2
- [x] `operational-orchestration`.T07 — Implement frontend UI components (`OperationalTaskCard`, `CompletionGateBanner`, `OperationalFulfillmentPage`) with responsive design — Acceptance: `operational-orchestration`.AC1, `operational-orchestration`.AC2, `operational-orchestration`.AC3, `operational-orchestration`.AC4, `operational-orchestration`.AC5
- [x] `operational-orchestration`.T08 — Run full test suite across all modules to achieve 100% GREEN pass rate and verify code quality — Acceptance: Full Suite Verification
