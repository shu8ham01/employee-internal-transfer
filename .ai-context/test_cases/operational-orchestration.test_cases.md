# Test Cases: Downstream Operational Task Orchestration

## Derived From Spec
.ai-context/specs/operational-orchestration.spec.md

## Acceptance Test Scenarios

### operational-orchestration.TC01 — Auto-generate Operational Tasks for Fulfillment
- **Maps to AC:** `operational-orchestration`.AC1 / UT01
- **Given:** A transfer request transitioning to the `FULFILLMENT` stage.
- **When:** Operational fulfillment is initialized for the transfer.
- **Then:** System automatically spawns 3 fulfillment tasks (`IT`, `FACILITIES`, `PAYROLL`) in state `PENDING` with designated fulfillment teams.
- **Automated Test File:** `tests/backend/modules/operations/operations.service.test.ts`

### operational-orchestration.TC02 — Operational Team Marks Task as Completed
- **Maps to AC:** `operational-orchestration`.AC2 / UT02
- **Given:** An active operational task (e.g. `PAYROLL`).
- **When:** PATCH `/api/v1/transfers/:id/operational-tasks/:taskId` is called with status `COMPLETED` and notes.
- **Then:** System updates task status to `COMPLETED`, records completion timestamp, completedBy operator email, and returns updated remaining pending tasks count.
- **Automated Test File:** `tests/backend/modules/operations/operations.service.test.ts`

### operational-orchestration.TC03 — Reject Transfer Completion When Tasks Are Pending
- **Maps to AC:** `operational-orchestration`.AC3 / UT03
- **Given:** An approved transfer with 1 or more operational tasks still in `PENDING` or `IN_PROGRESS` status.
- **When:** POST `/api/v1/transfers/:id/complete` is called by an HR administrator.
- **Then:** System rejects request with HTTP 400 IncompleteTasks, returns descriptive error message, and preserves transfer state.
- **Automated Test File:** `tests/backend/modules/operations/operations.service.test.ts`

### operational-orchestration.TC04 — Successfully Close Transfer When All Tasks Completed
- **Maps to AC:** `operational-orchestration`.AC4 / UT04
- **Given:** An approved transfer where 100% of operational tasks (`IT`, `FACILITIES`, `PAYROLL`) are in status `COMPLETED`.
- **When:** POST `/api/v1/transfers/:id/complete` is called by an HR administrator.
- **Then:** System transitions transfer status to `COMPLETED`, records completion timestamp, and returns HTTP 200 OK.
- **Automated Test File:** `tests/backend/modules/operations/operations.service.test.ts`

### operational-orchestration.TC05 — Atomic Employee Profile Update on Completion
- **Maps to AC:** `operational-orchestration`.AC5 / UT05
- **Given:** A transfer undergoing final completion.
- **When:** The transfer status updates to `COMPLETED`.
- **Then:** System atomically updates the employee's active profile (`departmentId`, `locationId`, `roleId`) to match the proposed transfer values within a database transaction.
- **Automated Test File:** `tests/backend/modules/operations/operations.service.test.ts`
