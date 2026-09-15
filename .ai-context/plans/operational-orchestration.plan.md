# Plan: Downstream Operational Task Orchestration

## Derived From
.ai-context/specs/operational-orchestration.spec.md

## Pre-Development PR Review Findings & Guidance
- **Review Status:** Gate 1 `Approved` on 2026-09-15 by Tech Lead (`supratim.jetty@intglobal.com`)
- **Review Record:** `.ai-context/pr_reviews/GATE1-operational-orchestration-20260915-151310.md`
- **Key Reviewer Guidance:**
  1. Ensure the transfer closure endpoint (`POST /api/v1/transfers/:id/complete`) checks that 100% of operational tasks are in state `COMPLETED` before allowing transition.
  2. Ensure employee profile department, location, and role updates execute within an atomic database transaction boundary on completion.
  3. Validate HTTP 400 IncompleteTasks response when attempting to close a transfer with pending tasks.
  4. Ensure unit tests written during the TDD RED phase cover all 5 specified test cases (`UT01` to `UT05`).

## Architecture Approach
Follows the INT Modular Monolith pattern defined in `.ai-context/architecture.md`:

### Backend Layering (`src/backend/modules/operations/`)
- `validators/operations.validator.ts`: Schema validation rules using Zod (task status `IN_PROGRESS` | `COMPLETED`, notes length <= 1000).
- `services/operations.service.ts`: Core fulfillment orchestration domain logic:
  - `getOperationalTasks(transferId)`: Retrieves all fulfillment tasks for a transfer, computing `isAllCompleted`.
  - `spawnInitialTasks(transferId)`: Automatically provisions the 3 core tasks (`IT`, `FACILITIES`, `PAYROLL`) when a transfer reaches fulfillment.
  - `updateTask(transferId, taskId, payload)`: Updates task status, operator notes, and completion timestamp.
  - `completeTransfer(transferId, currentUserId, userRole)`:
    - Enforces HR Administrator authorization (403 Forbidden for unauthorized callers).
    - Verifies all operational tasks are `COMPLETED` (rejects with 400 IncompleteTasks if any tasks remain pending).
    - Transitions transfer status to `COMPLETED`.
    - Atomically updates the employee's active deployment profile (department, location, role) within a database transaction boundary.
- `repositories/operations.repository.ts`: Data access operations interfacing with operational task entities and employee profiles.
- `controllers/operations.controller.ts`: Express controllers mapping routes to service logic (`200 OK`, `400 IncompleteTasks`, `403 Forbidden`, `404 Not Found`).
- `routes/operations.routes.ts`: Express router mounted at `/api/v1/transfers`.

### Frontend Layering (`src/frontend/modules/operations/`)
- `services/operations.api.ts`: API client connecting to `/api/v1/transfers/:id/operational-tasks` and `/complete`.
- `hooks/useOperations.ts`: Custom React hook managing task lists, completion toggles, note submission, and HR closure action.
- `components/OperationalTaskCard.tsx`: Interactive task card with team badges (`IT`, `FACILITIES`, `PAYROLL`), status chips, and update controls.
- `components/CompletionGateBanner.tsx`: High-visibility HR banner summarizing task completion progress and gating final transfer sign-off.
- `pages/OperationalFulfillmentPage.tsx`: Dedicated operations portal page assembling task cards, progress stats, and closure actions.

## Data Model
Prisma entities in `prisma/schema.prisma`:
- `OperationalTask`: `id`, `transferId`, `category` (`IT`, `FACILITIES`, `PAYROLL`), `title`, `status` (`PENDING`, `IN_PROGRESS`, `COMPLETED`), `assignedTeam`, `completedAt`, `notes`, `completedBy`, `createdAt`, `updatedAt`.
- `Employee`: Updated with target `departmentId`, `locationId`, `roleId` upon completion.

## Constitution Check
- [x] No new datastore introduced without ADR (PostgreSQL + Prisma)
- [x] Testing discipline matches constitution.md (TDD RED -> GREEN; backend and frontend unit tests)
- [x] Security posture matches constitution.md (HR Administrator role enforcement for closure, audit logging on task state transitions)

## Explicitly Deferred
- Direct bi-directional integration with external third-party HRIS/payroll APIs.
- Physical asset barcode scanners / inventory hardware.

## Sequencing
1. **Plan & Tasks Sign-Off**: Verification of Plan, Tasks, and Test Cases specifications.
2. **TDD RED Phase**: Author failing automated unit tests in `tests/backend/modules/operations/` covering AC1-AC5 / UT01-UT05.
3. **Backend GREEN Implementation**: Build validators, repositories, operations service, controllers, and Express route bindings.
4. **Frontend GREEN Implementation**: Build API service, state hook, `OperationalTaskCard`, `CompletionGateBanner`, and `OperationalFulfillmentPage`.
5. **Full Suite Verification**: Verify 100% test pass rate across all modules.
6. **Gate 2 Code PR Review**: Submit for Tech Lead Gate 2 review sign-off.
