# Plan: Downstream Stakeholder Workflow Orchestration

## Derived From
.ai-context/specs/workflow-orchestration.spec.md

## Pre-Development PR Review Findings & Guidance
- **Review Status:** Gate 1 `Approved` on 2026-09-15 by Tech Lead (`supratim.jetty@intglobal.com`)
- **Review Record:** `.ai-context/pr_reviews/GATE1-workflow-orchestration-20260915-151043.md`
- **Key Reviewer Guidance:**
  1. Ensure database transactions wrap decision processing and stage progression to guarantee atomicity.
  2. Verify that submitting `REJECT` immediately transitions the workflow instance to a terminal `REJECTED` state and blocks subsequent decisions.
  3. Validate that non-assigned users attempting to submit decisions receive HTTP 403 Forbidden.
  4. Ensure unit tests written during the TDD RED phase cover all 5 specified test cases (`UT01` to `UT05`).

## Architecture Approach
Follows the INT Modular Monolith pattern defined in `.ai-context/architecture.md`:

### Backend Layering (`src/backend/modules/workflow/`)
- `validators/workflow.validator.ts`: Schema validation rules using Zod (decision actions `APPROVE`, `REJECT`, `REQUEST_REVISION`, mandatory remarks on decisions, target release date validation).
- `services/workflow.service.ts`: Core business logic:
  - `getWorkflowState(transferId, currentUserId)`: Retrieves workflow instance, active stage, assigned reviewer, completed stages, and audit history. Validates that the caller is a workflow participant (applicant, assigned reviewer, or HR admin; returns 403 Forbidden if unauthorized, 404 NotFound if transfer does not exist).
  - `submitDecision(transferId, actorId, payload)`:
    - Verifies active transfer request existence (404 NotFound).
    - Verifies transfer is not in a terminal state (`REJECTED`, `COMPLETED` - rejects with 409 Conflict).
    - Verifies actor is the assigned reviewer for the active stage (rejects with 403 Forbidden).
    - Atomic state transition:
      - `CURRENT_MANAGER_REVIEW` + `APPROVE` -> advances to `HIRING_MANAGER_REVIEW`, status remains `IN_REVIEW`.
      - `HIRING_MANAGER_REVIEW` + `APPROVE` -> advances to `HR_VALIDATION`, status remains `IN_REVIEW`.
      - `HR_VALIDATION` + `APPROVE` -> advances to `FULFILLMENT`, status transitions to `APPROVED`.
      - Any reviewer + `REJECT` -> immediate transition to terminal `REJECTED` status.
      - Any reviewer + `REQUEST_REVISION` -> status transitions to `CHANGES_REQUESTED`.
    - Logs immutable decision history record on every decision.
- `controllers/workflow.controller.ts`: HTTP handlers mapping route params, body payloads, and HTTP status codes (`200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`).
- `repositories/workflow.repository.ts`: Data access operations via Prisma Client / in-memory store for `WorkflowInstance`, `WorkflowStage`, and `WorkflowDecision`.
- `routes/workflow.routes.ts`: Express router definitions mounted at `/api/v1/transfers/:id/workflow` and `/api/v1/transfers/:id/decisions`.

### Frontend Layering (`src/frontend/modules/workflow/`)
- `services/workflow.api.ts`: API client connecting to `/api/v1/transfers/:id/workflow` and `/api/v1/transfers/:id/decisions`.
- `hooks/useWorkflow.ts`: State management hook for workflow data, stage transitions, active reviewer permission checking, and decision execution.
- `components/StageStepper.tsx`: Visual approval pipeline component displaying all review gates (`CURRENT_MANAGER_REVIEW`, `HIRING_MANAGER_REVIEW`, `HR_VALIDATION`, `FULFILLMENT`) with their current states, reviewers, and timestamps.
- `components/DecisionActionPanel.tsx`: Interactive action panel allowing authorized reviewers to submit `APPROVE`, `REJECT`, or `REQUEST_REVISION` with required remarks.
- `pages/WorkflowDetailPage.tsx`: Consolidated workflow review page displaying transfer details, live approval progress, audit history, and the decision action panel.

## Data Model
Prisma entities in `prisma/schema.prisma`:
- `WorkflowInstance`: `id`, `transferId`, `status` (`IN_REVIEW`, `CHANGES_REQUESTED`, `APPROVED`, `REJECTED`, `COMPLETED`), `currentStageId`, `createdAt`, `updatedAt`.
- `WorkflowStage`: `id`, `workflowId`, `stageName` (`CURRENT_MANAGER_REVIEW`, `HIRING_MANAGER_REVIEW`, `HR_VALIDATION`, `FULFILLMENT`), `stageOrder`, `assignedReviewerId`, `status` (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `SKIPPED`), `enteredAt`, `completedAt`.
- `WorkflowDecision`: `id`, `stageId`, `actorId`, `action` (`APPROVE`, `REJECT`, `REQUEST_REVISION`), `remarks`, `targetReleaseDate`, `createdAt`.

## Constitution Check
- [x] No new datastore introduced without ADR (PostgreSQL + Prisma)
- [x] Testing discipline matches constitution.md (TDD RED -> GREEN; backend service and route unit tests)
- [x] Security posture matches constitution.md (JWT authentication middleware, strict role/actor stage verification, immutable audit log)

## Explicitly Deferred
- Automated provisioning of IT assets and badge access (deferred to `operational-orchestration.spec.md`).
- Real-time email and Slack webhook dispatching (deferred to `notifications-and-audit.spec.md`).

## Sequencing
1. **Plan & Tasks Sign-Off**: Verification of Plan, Tasks, and Test Cases specifications.
2. **TDD RED Phase**: Author failing automated unit tests in `tests/backend/modules/workflow/` covering AC1-AC5 / UT01-UT05.
3. **Backend GREEN Implementation**: Build validators, repositories, domain service logic, controllers, and Express route bindings.
4. **Frontend GREEN Implementation**: Build API service, state hook, `StageStepper`, `DecisionActionPanel`, and `WorkflowDetailPage`.
5. **Full Suite Verification**: Verify 100% test pass rate across all existing modules and workflow module.
6. **Gate 2 Code PR Review**: Submit for Tech Lead Gate 2 review sign-off.
