# Spec: Single View of Progress & Transparency Dashboard

## Spec ID
transparency-dashboard

## Status
In QA

## Roles & Assignments
- **Developer:** Developer (`developer@intglobal.com`)
- **Gate 1 Reviewer(s):** Tech Lead (`supratim.jetty@intglobal.com`)
- **Gate 2 Reviewer(s):** Tech Lead (`supratim.jetty@intglobal.com`)

## Linked BRD
.ai-context/BRD.md#BRD-003

## Gate Approvals & History
| Gate | Approver Name | Approver Email/ID | Date/Time | Outcome | Approval Comment / Summary |
|---|---|---|---|---|---|
| Gate 1 (Spec Review) | Tech Lead | supratim.jetty@intglobal.com | 2026-09-15 15:11:58 | Approved | Approved by Tech Lead (.ai-context/pr_reviews/GATE1-transparency-dashboard-20260915-151158.md) |
| Gate 2 (Code Review) | Tech Lead | supratim.jetty@intglobal.com | Pending Review | Pending | Awaiting development completion & TDD green |


## Intent
Provides a unified, real-time One-Point Employee Portal dashboard displaying transfer progression, an interactive visual stage tracker, explicit stakeholder bottleneck indicators (identifying who holds the pending action item and elapsed duration), and an actionable queue for managers and HR admins to view and action pending reviews.

## Context
- Builds on: `.ai-context/architecture.md` (Section 4: Frontend Modular Monolith, `src/frontend/modules/dashboard`, and `src/backend/modules/dashboard`)
- Related: `.ai-context/specs/transfer-request-initiation.spec.md`, `.ai-context/specs/workflow-orchestration.spec.md`

## API Contract (Mandatory if API surface exists)

### transparency-dashboard.API01 — GET /api/v1/dashboard/transfers
Fetches the transfer requests summary list visible to the authenticated user (applicant or stakeholder).

**Success response (`200 OK`):**
```json
{
  "transfers": [
    {
      "id": "tr-9001",
      "employeeName": "Alex Chen",
      "employeeId": "emp-001",
      "proposedDepartment": "Cloud Infrastructure",
      "proposedRole": "DevOps Engineer",
      "status": "IN_REVIEW",
      "currentStage": "CURRENT_MANAGER_REVIEW",
      "pendingWith": "Jane Doe (Current Manager)",
      "daysInCurrentStage": 2,
      "submittedDate": "2026-09-13T10:00:00.000Z",
      "effectiveDate": "2026-11-01T00:00:00.000Z"
    }
  ],
  "totalCount": 1
}
```

---

### transparency-dashboard.API02 — GET /api/v1/dashboard/transfers/:id/timeline
Retrieves the detailed visual milestone tracker and bottleneck status for a specific transfer request.

**Success response (`200 OK`):**
```json
{
  "transferId": "tr-9001",
  "overallStatus": "IN_REVIEW",
  "bottleneck": {
    "isBlocked": false,
    "pendingReviewerName": "Jane Doe",
    "pendingReviewerRole": "Current Manager",
    "pendingSince": "2026-09-13T10:00:00.000Z",
    "elapsedHours": 49.5,
    "slaHours": 72
  },
  "milestones": [
    {
      "step": 1,
      "name": "Initiation & Submission",
      "state": "COMPLETED",
      "completedAt": "2026-09-13T10:00:00.000Z",
      "actor": "Alex Chen"
    },
    {
      "step": 2,
      "name": "Current Manager Review",
      "state": "IN_PROGRESS",
      "completedAt": null,
      "actor": "Jane Doe"
    },
    {
      "step": 3,
      "name": "Hiring Manager Review",
      "state": "NOT_STARTED",
      "completedAt": null,
      "actor": null
    },
    {
      "step": 4,
      "name": "HR Policy & Headcount Sign-Off",
      "state": "NOT_STARTED",
      "completedAt": null,
      "actor": null
    },
    {
      "step": 5,
      "name": "Downstream Fulfillment",
      "state": "NOT_STARTED",
      "completedAt": null,
      "actor": null
    }
  ]
}
```

---

### transparency-dashboard.API03 — GET /api/v1/dashboard/approvals/pending
Returns the queue of transfer requests requiring review by the authenticated manager or HR administrator.

**Success response (`200 OK`):**
```json
{
  "pendingApprovals": [
    {
      "transferId": "tr-9001",
      "applicantName": "Alex Chen",
      "applicantRole": "Software Engineer",
      "targetRole": "DevOps Engineer",
      "targetDepartment": "Cloud Infrastructure",
      "stage": "CURRENT_MANAGER_REVIEW",
      "submittedDate": "2026-09-13T10:00:00.000Z",
      "slaRemainingHours": 22.5
    }
  ]
}
```

---

## Acceptance Criteria
1. `transparency-dashboard`.AC1 — Given an applicant viewing the dashboard, when accessing their active transfer, then the dashboard renders the active stage, progress percentage, and clear bottleneck callout.
2. `transparency-dashboard`.AC2 — Given a stakeholder viewing a transfer timeline, when inspecting milestones, completed milestones show green timestamps and pending milestones show waiting status.
3. `transparency-dashboard`.AC3 — Given a manager or HR admin with pending review assignments, when accessing `/dashboard/approvals/pending`, then only transfers matching their reviewer stage are displayed.
4. `transparency-dashboard`.AC4 — Given an SLA threshold of 72 hours, when a transfer exceeds 72 hours in a stage, then the bottleneck indicator highlights with a warning status.
5. `transparency-dashboard`.AC5 — Given an employee with no transfer records, when opening the dashboard, then a friendly empty state prompting transfer initiation is rendered.

## Unit Test Cases (spec-derived)
| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| `transparency-dashboard`.UT01 | AC1 | Fetch dashboard summary for applicant | Return active transfer list with bottleneck metadata |
| `transparency-dashboard`.UT02 | AC2 | Fetch milestone timeline for active transfer | Return 5 ordered stages with accurate completion flags |
| `transparency-dashboard`.UT03 | AC3 | Fetch pending approvals for assigned manager | Return only transfers where manager is the current reviewer |
| `transparency-dashboard`.UT04 | AC4 | Calculate bottleneck duration for overdue stage | Flag `isBlocked: true` or warning when elapsed > SLA |
| `transparency-dashboard`.UT05 | AC5 | Fetch dashboard for employee with 0 transfers | Return empty list (`transfers: []`, `totalCount: 0`) |

## Explicitly Out of Scope
- Executing approval decisions (handled in `workflow-orchestration`).
- Re-assigning or delegating manager review roles.

## Non-Functional Constraints (from constitution.md)
- Dashboard aggregation API response p95 < 500 ms.
- Responsive design across desktop, tablet, and mobile browsers.
- No PII exposure in dashboard metrics.
