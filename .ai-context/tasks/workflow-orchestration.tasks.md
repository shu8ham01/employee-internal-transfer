# Tasks: Downstream Stakeholder Workflow Orchestration

## Derived From
.ai-context/plans/workflow-orchestration.plan.md

## Sequence
- [x] `workflow-orchestration`.T01 — Create automated failing unit test suite covering AC1 to AC5 / UT01 to UT05 (TDD RED) in `tests/backend/modules/workflow/` — Acceptance: `workflow-orchestration`.AC1, `workflow-orchestration`.AC2, `workflow-orchestration`.AC3, `workflow-orchestration`.AC4, `workflow-orchestration`.AC5
- [x] `workflow-orchestration`.T02 — Implement workflow schema validation rules using Zod in `src/backend/modules/workflow/validators/` — Acceptance: `workflow-orchestration`.AC4, `workflow-orchestration`.AC5
- [x] `workflow-orchestration`.T03 — Implement repository layer and database model bindings for `WorkflowInstance`, `WorkflowStage`, and `WorkflowDecision` in `src/backend/modules/workflow/repositories/` — Acceptance: `workflow-orchestration`.AC1, `workflow-orchestration`.AC2, `workflow-orchestration`.AC3
- [x] `workflow-orchestration`.T04 — Implement core workflow domain service logic (`getWorkflowState`, `submitDecision`, stage progression, authorization verification, atomic state transitions) in `src/backend/modules/workflow/services/` — Acceptance: `workflow-orchestration`.AC1, `workflow-orchestration`.AC2, `workflow-orchestration`.AC3, `workflow-orchestration`.AC4, `workflow-orchestration`.AC5
- [x] `workflow-orchestration`.T05 — Implement HTTP controllers and route endpoints under `/api/v1/transfers/:id/workflow` and `/api/v1/transfers/:id/decisions` in `src/backend/modules/workflow/controllers/` and `routes/` — Acceptance: `workflow-orchestration`.AC1, `workflow-orchestration`.AC2, `workflow-orchestration`.AC3, `workflow-orchestration`.AC4, `workflow-orchestration`.AC5
- [x] `workflow-orchestration`.T06 — Implement frontend API client service and custom React state hook in `src/frontend/modules/workflow/services/` and `hooks/` — Acceptance: `workflow-orchestration`.AC1, `workflow-orchestration`.AC2
- [x] `workflow-orchestration`.T07 — Implement frontend UI components (`StageStepper`, `DecisionActionPanel`, `WorkflowDetailPage`) with responsive design — Acceptance: `workflow-orchestration`.AC1, `workflow-orchestration`.AC2, `workflow-orchestration`.AC3, `workflow-orchestration`.AC4, `workflow-orchestration`.AC5
- [x] `workflow-orchestration`.T08 — Run full test suite across all modules to achieve 100% GREEN pass rate and verify code quality — Acceptance: Full Suite Verification
