# Plan: Single View of Progress & Transparency Dashboard

## Derived From
.ai-context/specs/transparency-dashboard.spec.md

## Pre-Development PR Review Findings & Guidance
- **Review Status:** Gate 1 `Approved` on 2026-09-15 by Tech Lead (`supratim.jetty@intglobal.com`)
- **Review Record:** `.ai-context/pr_reviews/GATE1-transparency-dashboard-20260915-151158.md`
- **Key Reviewer Guidance:**
  1. Ensure the pending approvals queue (`/dashboard/approvals/pending`) strictly filters by the authenticated reviewer's current active stage assignments.
  2. Ensure SLA bottleneck calculation correctly flags stages exceeding 72 hours with `isBlocked: true` and visible warning indicators.
  3. Validate empty state rendering for employees with 0 transfer records.
  4. Ensure unit tests written during the TDD RED phase cover all 5 specified test cases (`UT01` to `UT05`).

## Architecture Approach
Follows the INT Modular Monolith pattern defined in `.ai-context/architecture.md`:

### Backend Layering (`src/backend/modules/dashboard/`)
- `services/dashboard.service.ts`: Core dashboard aggregation logic:
  - `getUserTransfers(userId, role)`: Aggregates transfer summaries, active stages, pending reviewer details, and days in current stage.
  - `getTransferTimeline(transferId)`: Assembles 5 ordered milestones (Initiation & Submission, Current Manager Review, Hiring Manager Review, HR Policy Sign-Off, Downstream Fulfillment), computes elapsed hours against 72-hour SLA, and evaluates bottleneck state (`isBlocked: elapsedHours > slaHours`).
  - `getPendingApprovals(reviewerId)`: Queries transfer requests where `currentStage` matches reviewer's active assignment (`mgr-101` for Current Manager, `hm-201` for Hiring Manager, `hr-301` for HR Admin), returning SLA remaining hours.
- `repositories/dashboard.repository.ts`: Aggregation repository interfacing with transfer records and workflow stage stores.
- `controllers/dashboard.controller.ts`: HTTP request handlers mapping query/path parameters and status codes (`200 OK`, `401 Unauthorized`, `404 Not Found`).
- `routes/dashboard.routes.ts`: Express router definitions mounted at `/api/v1/dashboard`.

### Frontend Layering (`src/frontend/modules/dashboard/`)
- `services/dashboard.api.ts`: API client connecting to `/api/v1/dashboard/*`.
- `hooks/useDashboard.ts`: Custom React hook managing dashboard data fetching, active transfer selection, timeline loading, and pending approval queues.
- `components/BottleneckCallout.tsx`: Visual alert card highlighting who holds the pending review, elapsed hours, and SLA breach warnings.
- `components/MilestoneTimeline.tsx`: Detailed milestone stepper displaying all 5 journey stages with completed timestamps and actor tags.
- `components/PendingApprovalsQueue.tsx`: Actionable list of transfer requests awaiting the authenticated reviewer's decision.
- `components/EmptyTransferState.tsx`: Friendly zero-state component prompting transfer initiation when no requests exist.
- `pages/TransparencyDashboardPage.tsx`: Unified portal page assembling summary cards, bottleneck banner, milestone timeline, and approvals queue.

## Data Model & Aggregation
Interfaces in `src/backend/modules/dashboard/`:
- `DashboardTransferItem`: `id`, `employeeName`, `employeeId`, `proposedDepartment`, `proposedRole`, `status`, `currentStage`, `pendingWith`, `daysInCurrentStage`, `submittedDate`, `effectiveDate`.
- `TimelineResponse`: `transferId`, `overallStatus`, `bottleneck` (`isBlocked`, `pendingReviewerName`, `pendingReviewerRole`, `pendingSince`, `elapsedHours`, `slaHours`), `milestones` array (`step`, `name`, `state`, `completedAt`, `actor`).
- `PendingApprovalItem`: `transferId`, `applicantName`, `applicantRole`, `targetRole`, `targetDepartment`, `stage`, `submittedDate`, `slaRemainingHours`.

## Constitution Check
- [x] No new datastore introduced without ADR (Aggregates existing in-memory/Prisma entities)
- [x] Testing discipline matches constitution.md (TDD RED -> GREEN; unit and integration tests)
- [x] Security posture matches constitution.md (JWT authentication middleware, role-scoped data isolation, zero PII logging)

## Explicitly Deferred
- Executing approval decisions (handled in `workflow-orchestration.spec.md`).
- Re-assigning or delegating manager review roles.

## Sequencing
1. **Plan & Tasks Sign-Off**: Verification of Plan, Tasks, and Test Cases specifications.
2. **TDD RED Phase**: Author failing automated unit tests in `tests/backend/modules/dashboard/` covering AC1-AC5 / UT01-UT05.
3. **Backend GREEN Implementation**: Build aggregation repository, dashboard service, controllers, and Express route bindings.
4. **Frontend GREEN Implementation**: Build API service, state hook, `BottleneckCallout`, `MilestoneTimeline`, `PendingApprovalsQueue`, `EmptyTransferState`, and `TransparencyDashboardPage`.
5. **Full Suite Verification**: Verify 100% test pass rate across all modules.
6. **Gate 2 Code PR Review**: Submit for Tech Lead Gate 2 review sign-off.
