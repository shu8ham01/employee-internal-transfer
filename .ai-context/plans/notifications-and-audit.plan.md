# Plan: Notifications & Audit Logging

## Derived From
.ai-context/specs/notifications-and-audit.spec.md

## Pre-Development PR Review Findings & Guidance
- **Review Status:** Gate 1 `Approved` on 2026-09-15 by Tech Lead (`supratim.jetty@intglobal.com`)
- **Review Record:** `.ai-context/pr_reviews/GATE1-notifications-and-audit-20260915-151438.md`
- **Key Reviewer Guidance:**
  1. Ensure audit log insertions execute non-blocking so business operations are never failed by logging latency or external dependencies.
  2. Verify zero unmasked PII appears in application logs or audit payload metadata (mask sensitive identifiers, capture actorId and IP cleanly).
  3. Validate in-app unread count decrementing on calling `PATCH /api/v1/notifications/:id/read`.
  4. Ensure unit tests written during the TDD RED phase cover all 5 specified test cases (`UT01` to `UT05`).

## Architecture Approach
Follows the INT Modular Monolith pattern defined in `.ai-context/architecture.md`:

### Backend Layering (`src/backend/modules/notifications/` and `src/backend/modules/audit/`)
- `src/backend/modules/audit/`:
  - `repositories/audit.repository.ts`: In-memory and Prisma repository for immutable append-only `AuditLog` records.
  - `services/audit.service.ts`: Fail-safe, non-blocking audit logging service recording `action`, `actorId`, `actorRole`, `fromState`, `toState`, `ipAddress`, `timestamp`, and sanitized `metadata`.
  - `controllers/audit.controller.ts`: Express controller for `GET /api/v1/transfers/:id/audit-trail`.
  - `routes/audit.routes.ts`: Router mounted at `/api/v1/transfers/:id/audit-trail`.
- `src/backend/modules/notifications/`:
  - `validators/notification.validator.ts`: Schema validation for notification parameters.
  - `repositories/notification.repository.ts`: Repository for querying user notifications, unread counts, and updating read status.
  - `services/notification.service.ts`: Notification service dispatching in-app alerts and simulated email dispatches for stage transitions and reviewer decisions.
  - `controllers/notification.controller.ts`: Express controller for `GET /api/v1/notifications` and `PATCH /api/v1/notifications/:id/read`.
  - `routes/notification.routes.ts`: Router mounted at `/api/v1/notifications`.

### Frontend Layering (`src/frontend/modules/notifications/`)
- `services/notifications.api.ts`: API client connecting to `/api/v1/notifications`, `/api/v1/notifications/:id/read`, and `/api/v1/transfers/:id/audit-trail`.
- `hooks/useNotifications.ts`: Custom React hook managing unread count, notification polling, and mark-as-read transitions.
- `components/NotificationBell.tsx`: Interactive notification bell with unread badge counter and dropdown popover.
- `components/AuditTrailDrawer.tsx`: Expandable drawer / timeline displaying immutable audit events with actor, action, timestamp, and metadata.
- `pages/NotificationsAuditDemoPage.tsx`: Interactive demo page showcasing the bell, unread state updates, and audit trail drawer.

## Data Model
Prisma entities in `prisma/schema.prisma`:
- `AuditLog`: `id`, `transferId`, `action`, `actorId`, `actorRole`, `fromState`, `toState`, `ipAddress`, `timestamp`, `metadata`.
- `Notification`: `id`, `userId`, `type`, `title`, `message`, `isRead`, `readAt`, `createdAt`, `actionUrl`.

## Constitution Check
- [x] No new datastore introduced without ADR (PostgreSQL + Prisma)
- [x] Testing discipline matches constitution.md (TDD RED -> GREEN; backend and frontend unit tests)
- [x] Security posture matches constitution.md (Zero unmasked PII, fail-safe non-blocking audit execution)

## Explicitly Deferred
- Custom notification preferences matrix (e.g. quiet hours, digests).
- External transactional email gateway integration (simulated via in-memory logger/dispatcher).

## Sequencing
1. **Plan & Tasks Sign-Off**: Verification of Plan, Tasks, and Test Cases specifications.
2. **TDD RED Phase**: Author failing automated unit tests in `tests/backend/modules/notifications/` covering AC1-AC5 / UT01-UT05.
3. **Backend GREEN Implementation**: Build repositories, services, controllers, and Express route bindings for audit and notifications.
4. **Frontend GREEN Implementation**: Build API service, hook, `NotificationBell`, `AuditTrailDrawer`, and demo integration.
5. **Full Suite Verification**: Verify 100% test pass rate across all 5 modules.
6. **Gate 2 Code PR Review**: Submit for Tech Lead Gate 2 review sign-off.
