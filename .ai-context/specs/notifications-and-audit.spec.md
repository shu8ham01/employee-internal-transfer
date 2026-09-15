# Spec: Notifications & Audit Logging

## Spec ID
notifications-and-audit

## Status
Draft

## Roles & Assignments
- **Developer:** Developer (`developer@intglobal.com`)
- **Gate 1 Reviewer(s):** Tech Lead (`supratim.jetty@intglobal.com`)
- **Gate 2 Reviewer(s):** Tech Lead (`supratim.jetty@intglobal.com`)

## Linked BRD
.ai-context/BRD.md#BRD-005

## Gate Approvals & History
| Gate | Approver Name | Approver Email/ID | Date/Time | Outcome | Approval Comment / Summary |
|---|---|---|---|---|---|
| Gate 1 (Spec Review) | Tech Lead | supratim.jetty@intglobal.com | Pending Review | Pending | Awaiting Gate 1 PR review submission |
| Gate 2 (Code Review) | Tech Lead | supratim.jetty@intglobal.com | Pending Review | Pending | Awaiting development completion & TDD green |

## Intent
Provides automated notifications for workflow events (submission, manager approval, revisions requested, HR sign-off, fulfillment completion) and records an immutable, append-only audit trail capturing actor identity, action type, previous and new states, timestamp, IP address, and comments for enterprise governance.

## Context
- Builds on: `.ai-context/architecture.md` (Section 3 shared infra: `src/backend/shared/logger`, `src/backend/modules/audit`, `src/backend/modules/notifications`) & `.ai-context/constitution.md` (Security & Audit standards)
- Related: All specs (`transfer-request-initiation`, `workflow-orchestration`, `transparency-dashboard`, `operational-orchestration`)
- Data Model: Prisma entities `AuditLog`, `Notification`

## API Contract (Mandatory if API surface exists)

### notifications-and-audit.API01 — GET /api/v1/transfers/:id/audit-trail
Retrieves the complete immutable audit trail of a transfer request.

**Success response (`200 OK`):**
```json
{
  "transferId": "tr-9001",
  "auditEvents": [
    {
      "id": "audit-001",
      "action": "TRANSFER_SUBMITTED",
      "actorId": "emp-001",
      "actorRole": "APPLICANT",
      "fromState": null,
      "toState": "SUBMITTED",
      "ipAddress": "192.168.1.50",
      "timestamp": "2026-09-15T11:30:00.000Z",
      "metadata": {
        "proposedDepartmentId": "dept-102",
        "proposedRoleId": "role-202"
      }
    },
    {
      "id": "audit-002",
      "action": "STAGE_APPROVED",
      "actorId": "mgr-101",
      "actorRole": "CURRENT_MANAGER",
      "fromState": "CURRENT_MANAGER_REVIEW",
      "toState": "HIRING_MANAGER_REVIEW",
      "ipAddress": "192.168.1.80",
      "timestamp": "2026-09-15T12:00:00.000Z",
      "metadata": {
        "remarks": "Release approved effective 2026-11-01"
      }
    }
  ]
}
```

---

### notifications-and-audit.API02 — GET /api/v1/notifications
Retrieves in-app notifications for the authenticated user.

**Success response (`200 OK`):**
```json
{
  "unreadCount": 1,
  "notifications": [
    {
      "id": "notif-501",
      "type": "WORKFLOW_UPDATE",
      "title": "Transfer Request Approved by Current Manager",
      "message": "Your transfer request tr-9001 has been approved by Jane Doe and moved to Hiring Manager review.",
      "isRead": false,
      "createdAt": "2026-09-15T12:00:00.000Z",
      "actionUrl": "/transfers/tr-9001"
    }
  ]
}
```

---

### notifications-and-audit.API03 — PATCH /api/v1/notifications/:id/read
Marks a notification as read.

**Success response (`200 OK`):**
```json
{
  "id": "notif-501",
  "isRead": true,
  "readAt": "2026-09-15T12:15:00.000Z"
}
```

---

## Acceptance Criteria
1. `notifications-and-audit`.AC1 — Given any status transition or decision on a transfer, when the event occurs, an immutable `AuditLog` row is created.
2. `notifications-and-audit`.AC2 — Given an audit entry, the actor ID, timestamp, IP address, previous state, and new state are recorded accurately without storing unmasked PII.
3. `notifications-and-audit`.AC3 — Given a workflow stage transition, when entering a new stage, an in-app and email notification event is dispatched to the incoming reviewer.
4. `notifications-and-audit`.AC4 — Given a decision made on a transfer (approved, revision requested, rejected), a notification is dispatched to the applicant.
5. `notifications-and-audit`.AC5 — Given an authenticated user with unread notifications, when calling `/notifications/:id/read`, the notification is marked read and unread count decrements.

## Unit Test Cases (spec-derived)
| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| `notifications-and-audit`.UT01 | AC1 | Trigger transfer state change | Create corresponding `AuditLog` record |
| `notifications-and-audit`.UT02 | AC2 | Verify audit log properties | No unmasked PII logged, IP and actor captured |
| `notifications-and-audit`.UT03 | AC3 | Move transfer to new stage | Dispatch notification to assigned reviewer |
| `notifications-and-audit`.UT04 | AC4 | Reviewer submits decision | Dispatch notification to applicant |
| `notifications-and-audit`.UT05 | AC5 | User marks notification as read | Mark `isRead: true` and decrement unread counter |

## Explicitly Out of Scope
- Custom notification preferences matrix (e.g. digest mode, quiet hours).
- External transactional email provider configuration (uses mock/internal dispatch interface).

## Non-Functional Constraints (from constitution.md)
- Audit log operations must be non-blocking and fail-safe.
- Zero PII in plain text application log streams.
- Retention of audit records complies with enterprise data retention rules.
