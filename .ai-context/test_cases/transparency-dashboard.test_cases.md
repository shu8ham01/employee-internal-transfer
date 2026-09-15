# Test Cases: Single View of Progress & Transparency Dashboard

## Derived From Spec
.ai-context/specs/transparency-dashboard.spec.md

## Acceptance Test Scenarios

### transparency-dashboard.TC01 — Fetch Dashboard Summary for Applicant
- **Maps to AC:** `transparency-dashboard`.AC1 / UT01
- **Given:** An authenticated employee with an active transfer request in progress.
- **When:** GET `/api/v1/dashboard/transfers` is invoked.
- **Then:** System returns HTTP 200 OK with list of transfers, active stage (`CURRENT_MANAGER_REVIEW`), pending reviewer (`Jane Doe`), days in stage, and totalCount.
- **Automated Test File:** `tests/backend/modules/dashboard/dashboard.service.test.ts`

### transparency-dashboard.TC02 — Fetch Milestone Timeline for Active Transfer
- **Maps to AC:** `transparency-dashboard`.AC2 / UT02
- **Given:** A valid transfer request ID.
- **When:** GET `/api/v1/dashboard/transfers/:id/timeline` is invoked.
- **Then:** System returns HTTP 200 OK containing 5 ordered milestone steps with their states (`COMPLETED`, `IN_PROGRESS`, `NOT_STARTED`), completion timestamps, and actor tags.
- **Automated Test File:** `tests/backend/modules/dashboard/dashboard.service.test.ts`

### transparency-dashboard.TC03 — Filter Pending Approvals by Assigned Manager Stage
- **Maps to AC:** `transparency-dashboard`.AC3 / UT03
- **Given:** An authenticated reviewer (e.g. Current Manager `mgr-101`).
- **When:** GET `/api/v1/dashboard/approvals/pending` is invoked.
- **Then:** System returns HTTP 200 OK containing only transfers awaiting review at `CURRENT_MANAGER_REVIEW` assigned to `mgr-101`.
- **Automated Test File:** `tests/backend/modules/dashboard/dashboard.service.test.ts`

### transparency-dashboard.TC04 — SLA Bottleneck Calculation Exceeding 72 Hours
- **Maps to AC:** `transparency-dashboard`.AC4 / UT04
- **Given:** A transfer request that has remained in its current review stage for more than 72 hours (e.g. 75 hours).
- **When:** GET `/api/v1/dashboard/transfers/:id/timeline` is evaluated.
- **Then:** System flags `bottleneck.isBlocked: true` with `elapsedHours > 72`, triggering warning indicators.
- **Automated Test File:** `tests/backend/modules/dashboard/dashboard.service.test.ts`

### transparency-dashboard.TC05 — Zero Transfer Records Renders Empty State
- **Maps to AC:** `transparency-dashboard`.AC5 / UT05
- **Given:** An employee with zero initiated transfer requests.
- **When:** GET `/api/v1/dashboard/transfers` is invoked.
- **Then:** System returns HTTP 200 OK with `transfers: []` and `totalCount: 0`, prompting transfer initiation in the UI.
- **Automated Test File:** `tests/backend/modules/dashboard/dashboard.service.test.ts`
