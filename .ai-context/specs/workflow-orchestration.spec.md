# Spec: Downstream Stakeholder Workflow Orchestration

## Spec ID
workflow-orchestration

## Status
Draft

## Roles & Assignments
- **Developer:** Developer (`developer@intglobal.com`)
- **Gate 1 Reviewer(s):** Tech Lead (`supratim.jetty@intglobal.com`)
- **Gate 2 Reviewer(s):** Tech Lead (`supratim.jetty@intglobal.com`)

## Linked BRD
.ai-context/BRD.md#BRD-002

## Gate Approvals & History
| Gate | Approver Name | Approver Email/ID | Date/Time | Outcome | Approval Comment / Summary |
|---|---|---|---|---|---|
| Gate 1 (Spec Review) | Tech Lead | supratim.jetty@intglobal.com | Pending Review | Pending | Awaiting Gate 1 PR review submission |
| Gate 2 (Code Review) | Tech Lead | supratim.jetty@intglobal.com | Pending Review | Pending | Awaiting development completion & TDD green |

## Intent
Coordinates the sequential approval lifecycle of a submitted transfer request across three mandatory review gates: Current Manager Review (release timeline & handover confirmation), Hiring Manager Review (receiving department role fit & candidate acceptance), and HR Administrator Review (eligibility verification, compensation band check, and policy sign-off). Supports three explicit reviewer actions: `APPROVE`, `REJECT`, and `REQUEST_REVISION`.

## Context
- Builds on: `.ai-context/architecture.md` (Section 3: Backend Modular Monolith, `src/backend/modules/workflow`)
- Related: `.ai-context/specs/transfer-request-initiation.spec.md`, `.ai-context/specs/transparency-dashboard.spec.md`, `.ai-context/specs/operational-orchestration.spec.md`
- Data Model: Prisma entities `WorkflowInstance`, `WorkflowStage`, `WorkflowDecision`

## API Contract (Mandatory if API surface exists)

### workflow-orchestration.API01 — GET /api/v1/transfers/:id/workflow
Retrieves the active workflow execution state, current stage, assigned reviewer, and decision history.

**Success response (`200 OK`):**
```json
{
  "transferId": "tr-9001",
  "status": "IN_REVIEW",
  "currentStage": {
    "stageName": "CURRENT_MANAGER_REVIEW",
    "stageOrder": 1,
    "assignedReviewer": {
      "id": "mgr-101",
      "name": "Jane Doe",
      "role": "CURRENT_MANAGER",
      "email": "jane.doe@intglobal.com"
    },
    "enteredAt": "2026-09-15T11:30:00.000Z"
  },
  "completedStages": [],
  "history": [
    {
      "stage": "INITIATION",
      "actor": "emp-001",
      "action": "SUBMIT",
      "timestamp": "2026-09-15T11:30:00.000Z",
      "remarks": "Transfer initiated"
    }
  ]
}
```

**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 401 | Unauthenticated session | `{"error": "Unauthorized"}` |
| 403 | User is not applicant, assigned reviewer, or HR admin | `{"error": "Forbidden", "message": "Access restricted to workflow participants"}` |
| 404 | Transfer request not found | `{"error": "NotFound", "message": "Transfer request does not exist"}` |

---

### workflow-orchestration.API02 — POST /api/v1/transfers/:id/decisions
Submits an approval decision (`APPROVE`, `REJECT`, or `REQUEST_REVISION`) by the assigned stage reviewer.

**Request payload:**
```json
{
  "action": "APPROVE",
  "remarks": "Release approved effective 2026-11-01. Handover planned for sprint 22.",
  "targetReleaseDate": "2026-11-01T00:00:00.000Z"
}
```

**Success response (`200 OK`):**
```json
{
  "transferId": "tr-9001",
  "previousStage": "CURRENT_MANAGER_REVIEW",
  "currentStage": "HIRING_MANAGER_REVIEW",
  "status": "IN_REVIEW",
  "decision": {
    "actorId": "mgr-101",
    "action": "APPROVE",
    "remarks": "Release approved effective 2026-11-01. Handover planned for sprint 22.",
    "timestamp": "2026-09-15T12:00:00.000Z"
  }
}
```

**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 400 | Invalid decision action or missing mandatory rejection remarks | `{"error": "ValidationError", "details": ["remarks are mandatory for decisions"]}` |
| 403 | Caller is not the assigned reviewer for the active stage | `{"error": "Forbidden", "message": "You are not authorized to submit decisions for this stage"}` |
| 409 | Transfer is in a terminal state (REJECTED, COMPLETED) | `{"error": "Conflict", "message": "Workflow is closed and cannot receive decisions"}` |

---

## Acceptance Criteria
1. `workflow-orchestration`.AC1 — Given a transfer in `CURRENT_MANAGER_REVIEW`, when the current manager submits `APPROVE`, then the stage advances to `HIRING_MANAGER_REVIEW` and current status remains `IN_REVIEW`.
2. `workflow-orchestration`.AC2 — Given a transfer in `HIRING_MANAGER_REVIEW`, when the hiring manager submits `APPROVE`, then the stage advances to `HR_VALIDATION`.
3. `workflow-orchestration`.AC3 — Given a transfer in `HR_VALIDATION`, when the HR Admin submits `APPROVE`, then the workflow transitions to `FULFILLMENT` (triggering downstream operational tasks) and sets status to `APPROVED`.
4. `workflow-orchestration`.AC4 — Given any reviewer submitting `REJECT` with reason, then the transfer immediately transitions to terminal status `REJECTED` and prevents further decisions.
5. `workflow-orchestration`.AC5 — Given any reviewer submitting `REQUEST_REVISION`, then the transfer status updates to `CHANGES_REQUESTED`, routing feedback back to the applicant.

## Unit Test Cases (spec-derived)
| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| `workflow-orchestration`.UT01 | AC1 | Current Manager approves with release date | Advances stage to `HIRING_MANAGER_REVIEW` |
| `workflow-orchestration`.UT02 | AC2 | Hiring Manager approves candidate | Advances stage to `HR_VALIDATION` |
| `workflow-orchestration`.UT03 | AC3 | HR Administrator approves transfer | Advances to `FULFILLMENT` stage with status `APPROVED` |
| `workflow-orchestration`.UT04 | AC4 | Reviewer submits `REJECT` decision | Immediately terminates workflow as `REJECTED` |
| `workflow-orchestration`.UT05 | AC5 | Non-assigned user attempts to submit decision | Returns HTTP 403 Forbidden without modifying workflow state |

## Explicitly Out of Scope
- Direct modification of employee payroll records in third-party payroll engines.
- Physical IT badge issuance hardware integration.
- Sending external SMS notifications.

## Non-Functional Constraints (from constitution.md)
- Decision transactions must be atomic (database transaction rollbacks on failure).
- Response time for decision processing p95 < 300 ms.
- Immutable decision audit history logged on every stage change.
