# Tasks: Notifications & Audit Logging

## Derived From
.ai-context/plans/notifications-and-audit.plan.md

## Sequence
- [x] `notifications-and-audit`.T01 — Create automated failing unit test suite covering AC1 to AC5 / UT01 to UT05 (TDD RED) in `tests/backend/modules/notifications/` — Acceptance: `notifications-and-audit`.AC1, `notifications-and-audit`.AC2, `notifications-and-audit`.AC3, `notifications-and-audit`.AC4, `notifications-and-audit`.AC5
- [x] `notifications-and-audit`.T02 — Implement repository layer for `AuditLog` and `Notification` entities in `src/backend/modules/audit/repositories/` and `src/backend/modules/notifications/repositories/` — Acceptance: `notifications-and-audit`.AC1, `notifications-and-audit`.AC5
- [x] `notifications-and-audit`.T03 — Implement fail-safe non-blocking audit logging domain service (`recordEvent`, `getAuditTrail`) with zero PII sanitization in `src/backend/modules/audit/services/` — Acceptance: `notifications-and-audit`.AC1, `notifications-and-audit`.AC2
- [x] `notifications-and-audit`.T04 — Implement notification domain service (`dispatchStageTransitionNotification`, `dispatchDecisionNotification`, `getUserNotifications`, `markAsRead`) in `src/backend/modules/notifications/services/` — Acceptance: `notifications-and-audit`.AC3, `notifications-and-audit`.AC4, `notifications-and-audit`.AC5
- [x] `notifications-and-audit`.T05 — Implement HTTP controllers and route endpoints for `GET /api/v1/transfers/:id/audit-trail`, `GET /api/v1/notifications`, and `PATCH /api/v1/notifications/:id/read` in `src/backend/` and mount in `server.ts` — Acceptance: `notifications-and-audit`.AC1, `notifications-and-audit`.AC5
- [x] `notifications-and-audit`.T06 — Implement frontend API client service and custom React state hook in `src/frontend/modules/notifications/` — Acceptance: `notifications-and-audit`.AC5
- [x] `notifications-and-audit`.T07 — Implement frontend UI components (`NotificationBell`, `AuditTrailDrawer`, `NotificationsAuditDemoPage`) with responsive styling — Acceptance: `notifications-and-audit`.AC1, `notifications-and-audit`.AC5
- [x] `notifications-and-audit`.T08 — Run full test suite across all modules to achieve 100% GREEN pass rate and verify code quality — Acceptance: Full Suite Verification
