# Test Cases: Notifications & Audit Logging

## Derived From Spec
.ai-context/specs/notifications-and-audit.spec.md

## Acceptance Test Scenarios

### notifications-and-audit.TC01 — Trigger Transfer State Change Creates Audit Log
- **Maps to AC:** `notifications-and-audit`.AC1 / UT01
- **Given:** Any status transition or decision on a transfer (e.g. SUBMITTED, STAGE_APPROVED).
- **When:** The event occurs.
- **Then:** An immutable `AuditLog` row is created capturing `transferId`, `action`, `fromState`, `toState`, `actorId`, `actorRole`, and `timestamp`.
- **Automated Test File:** `tests/backend/modules/notifications/audit_and_notifications.service.test.ts`

### notifications-and-audit.TC02 — Verify Audit Log Captures IP & Zero Unmasked PII
- **Maps to AC:** `notifications-and-audit`.AC2 / UT02
- **Given:** An audit entry generated from a user action with metadata.
- **When:** The audit entry is verified.
- **Then:** The actor ID, timestamp, and IP address are accurately recorded, while unmasked PII (e.g., SSN, passwords, raw salary) is sanitized/excluded from the log payload.
- **Automated Test File:** `tests/backend/modules/notifications/audit_and_notifications.service.test.ts`

### notifications-and-audit.TC03 — Move Transfer to New Stage Dispatches Reviewer Notification
- **Maps to AC:** `notifications-and-audit`.AC3 / UT03
- **Given:** A transfer request transitioning to a new workflow stage.
- **When:** The stage transition executes.
- **Then:** In-app and simulated email notifications are dispatched to the assigned reviewer of the incoming stage.
- **Automated Test File:** `tests/backend/modules/notifications/audit_and_notifications.service.test.ts`

### notifications-and-audit.TC04 — Reviewer Submits Decision Dispatches Applicant Notification
- **Maps to AC:** `notifications-and-audit`.AC4 / UT04
- **Given:** A reviewer approves, rejects, or requests revision on a transfer request.
- **When:** The decision is processed.
- **Then:** An in-app and simulated email notification is dispatched to the transfer applicant detailing the outcome.
- **Automated Test File:** `tests/backend/modules/notifications/audit_and_notifications.service.test.ts`

### notifications-and-audit.TC05 — User Marks Notification Read Decrements Unread Counter
- **Maps to AC:** `notifications-and-audit`.AC5 / UT05
- **Given:** An authenticated user with unread notifications.
- **When:** `PATCH /api/v1/notifications/:id/read` is invoked.
- **Then:** The notification is marked as `isRead: true` with `readAt` timestamp, and unread count decrements by 1.
- **Automated Test File:** `tests/backend/modules/notifications/audit_and_notifications.service.test.ts`
