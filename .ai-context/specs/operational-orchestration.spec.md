# Spec: Downstream Operational Task Orchestration

## Spec ID
operational-orchestration

## Status
Approved

## Roles & Assignments
- **Developer:** Developer (`developer@intglobal.com`)
- **Gate 1 Reviewer(s):** Tech Lead (`supratim.jetty@intglobal.com`)
- **Gate 2 Reviewer(s):** Tech Lead (`supratim.jetty@intglobal.com`)

## Linked BRD
.ai-context/BRD.md#BRD-004

## Gate Approvals & History
| Gate | Approver Name | Approver Email/ID | Date/Time | Outcome | Approval Comment / Summary |
|---|---|---|---|---|---|
| Gate 1 (Spec Review) | Tech Lead | supratim.jetty@intglobal.com | 2026-09-15 15:13:10 | Approved | Approved by Tech Lead (.ai-context/pr_reviews/GATE1-operational-orchestration-20260915-151310.md) |
| Gate 2 (Code Review) | Tech Lead | supratim.jetty@intglobal.com | Pending Review | Pending | Awaiting development completion & TDD green |


## Intent
Coordinates downstream operational task fulfillment across IT (system access provisioning & hardware), Facilities (desk allocation & physical site access), and Payroll (cost-center & compensation re-indexing). Upon final HR approval of a transfer, the system automatically spawns operational tasks and gates final transfer completion until all three operational streams mark their tasks as completed.

## Context
- Builds on: `.ai-context/architecture.md` (Section 3: Backend Modular Monolith, `src/backend/modules/operations`)
- Related: `.ai-context/specs/workflow-orchestration.spec.md`, `.ai-context/specs/notifications-and-audit.spec.md`
- Data Model: Prisma entities `OperationalTask`, `TaskCategory` (IT, FACILITIES, PAYROLL), `TaskStatus`

## API Contract (Mandatory if API surface exists)

### operational-orchestration.API01 — GET /api/v1/transfers/:id/operational-tasks
Retrieves all downstream fulfillment tasks for an approved transfer request.

**Success response (`200 OK`):**
```json
{
  "transferId": "tr-9001",
  "isAllCompleted": false,
  "tasks": [
    {
      "id": "task-it-01",
      "category": "IT",
      "title": "Provision Cloud Infrastructure Access & Laptop Reprovisioning",
      "status": "PENDING",
      "assignedTeam": "IT-Support-Bengaluru",
      "completedAt": null
    },
    {
      "id": "task-fac-01",
      "category": "FACILITIES",
      "title": "Allocate Bengaluru Desk Seating & Campus Access Badge",
      "status": "COMPLETED",
      "assignedTeam": "Facilities-Bengaluru",
      "completedAt": "2026-09-15T12:30:00.000Z"
    },
    {
      "id": "task-pay-01",
      "category": "PAYROLL",
      "title": "Update Department Cost Center & Compensation Record",
      "status": "PENDING",
      "assignedTeam": "Finance-Payroll",
      "completedAt": null
    }
  ]
}
```

---

### operational-orchestration.API02 — PATCH /api/v1/transfers/:id/operational-tasks/:taskId
Updates an operational task status (e.g. `IN_PROGRESS`, `COMPLETED`).

**Request payload:**
```json
{
  "status": "COMPLETED",
  "notes": "Cost center updated to CC-9022 in Oracle Financials.",
  "completedBy": "payroll.officer@intglobal.com"
}
```

**Success response (`200 OK`):**
```json
{
  "taskId": "task-pay-01",
  "category": "PAYROLL",
  "status": "COMPLETED",
  "completedAt": "2026-09-15T13:00:00.000Z",
  "notes": "Cost center updated to CC-9022 in Oracle Financials.",
  "remainingPendingTasksCount": 1
}
```

---

### operational-orchestration.API03 — POST /api/v1/transfers/:id/complete
Finalizes the internal transfer once all operational tasks have been marked completed.

**Success response (`200 OK`):**
```json
{
  "transferId": "tr-9001",
  "status": "COMPLETED",
  "completedAt": "2026-09-15T13:05:00.000Z",
  "message": "Transfer closed successfully. Employee profile updated to target department and role."
}
```

**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 400 | Attempt to complete transfer when tasks are still pending | `{"error": "IncompleteTasks", "message": "Cannot finalize transfer: 1 operational task(s) remain pending"}` |
| 403 | User lacks HR administrator privileges | `{"error": "Forbidden", "message": "Only HR Administrators can close transfers"}` |

---

## Acceptance Criteria
1. `operational-orchestration`.AC1 — Given a transfer transitioning to `FULFILLMENT`, when entering the stage, then three operational tasks (`IT`, `FACILITIES`, `PAYROLL`) are automatically generated.
2. `operational-orchestration`.AC2 — Given an authorized operational team member, when updating their task status to `COMPLETED`, the task state is updated and timestamp recorded.
3. `operational-orchestration`.AC3 — Given a request to complete the transfer while any operational task is still `PENDING`, the system rejects the request with HTTP 400 IncompleteTasks.
4. `operational-orchestration`.AC4 — Given all operational tasks are `COMPLETED`, when an HR administrator calls the complete endpoint, the transfer status transitions to `COMPLETED`.
5. `operational-orchestration`.AC5 — When a transfer status transitions to `COMPLETED`, the employee's active department, location, and role are atomically updated to the proposed values.

## Unit Test Cases (spec-derived)
| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| `operational-orchestration`.UT01 | AC1 | Transition transfer to fulfillment stage | Auto-generate IT, Facilities, and Payroll tasks |
| `operational-orchestration`.UT02 | AC2 | PATCH operational task to COMPLETED | Record completion timestamp and operator note |
| `operational-orchestration`.UT03 | AC3 | POST complete transfer with 1 pending task | Return 400 IncompleteTasks and preserve stage |
| `operational-orchestration`.UT04 | AC4 | POST complete transfer when all tasks are COMPLETED | Return 200 OK and transition status to `COMPLETED` |
| `operational-orchestration`.UT05 | AC5 | Verify employee profile update on completion | Employee profile reflected with target department and role |

## Explicitly Out of Scope
- Direct bi-directional synchronization with external HRIS payroll software via REST webhook.
- Physical asset tracking and inventory management.

## Non-Functional Constraints (from constitution.md)
- Completion transaction must execute within a database transaction boundary.
- Audit trail entry created for every operational task update.
