# Test Cases: Downstream Stakeholder Workflow Orchestration

## Derived From Spec
.ai-context/specs/workflow-orchestration.spec.md

## Acceptance Test Scenarios

### workflow-orchestration.TC01 — Current Manager Approval Advances Stage
- **Maps to AC:** `workflow-orchestration`.AC1 / UT01
- **Given:** A transfer request currently in `CURRENT_MANAGER_REVIEW` stage.
- **When:** The assigned Current Manager invokes POST `/api/v1/transfers/:id/decisions` with action `APPROVE`, remarks, and target release date.
- **Then:** System records the approval decision, advances the stage to `HIRING_MANAGER_REVIEW`, status remains `IN_REVIEW`, and returns HTTP 200 OK.
- **Automated Test File:** `tests/backend/modules/workflow/workflow.service.test.ts`

### workflow-orchestration.TC02 — Hiring Manager Approval Advances to HR Validation
- **Maps to AC:** `workflow-orchestration`.AC2 / UT02
- **Given:** A transfer request currently in `HIRING_MANAGER_REVIEW` stage.
- **When:** The assigned Hiring Manager invokes POST `/api/v1/transfers/:id/decisions` with action `APPROVE` and acceptance remarks.
- **Then:** System records the decision, advances the stage to `HR_VALIDATION`, status remains `IN_REVIEW`, and returns HTTP 200 OK.
- **Automated Test File:** `tests/backend/modules/workflow/workflow.service.test.ts`

### workflow-orchestration.TC03 — HR Administrator Approval Transitions to Fulfillment & Approved
- **Maps to AC:** `workflow-orchestration`.AC3 / UT03
- **Given:** A transfer request currently in `HR_VALIDATION` stage.
- **When:** The HR Administrator invokes POST `/api/v1/transfers/:id/decisions` with action `APPROVE` and policy sign-off remarks.
- **Then:** System records the decision, advances the workflow to `FULFILLMENT` stage, transitions overall status to `APPROVED`, and returns HTTP 200 OK.
- **Automated Test File:** `tests/backend/modules/workflow/workflow.service.test.ts`

### workflow-orchestration.TC04 — Reviewer Rejection Immediately Terminates Workflow
- **Maps to AC:** `workflow-orchestration`.AC4 / UT04
- **Given:** A transfer request in an active review stage (`CURRENT_MANAGER_REVIEW`, `HIRING_MANAGER_REVIEW`, or `HR_VALIDATION`).
- **When:** The assigned reviewer invokes POST `/api/v1/transfers/:id/decisions` with action `REJECT` and mandatory reason.
- **Then:** System immediately transitions the workflow to terminal status `REJECTED`, blocks all subsequent decision submissions with HTTP 409 Conflict, and returns HTTP 200 OK.
- **Automated Test File:** `tests/backend/modules/workflow/workflow.service.test.ts`

### workflow-orchestration.TC05 — Non-Assigned User Decision Submission Is Rejected (HTTP 403)
- **Maps to AC:** `workflow-orchestration`.AC5 / UT05
- **Given:** A transfer request in `CURRENT_MANAGER_REVIEW`.
- **When:** An unauthorized user (not the assigned reviewer, applicant, or HR Admin) attempts to submit a decision via POST `/api/v1/transfers/:id/decisions`.
- **Then:** System rejects with HTTP 403 Forbidden without altering workflow stage or decision state.
- **Automated Test File:** `tests/backend/modules/workflow/workflow.service.test.ts`
