# Tasks: Single View of Progress & Transparency Dashboard

## Derived From
.ai-context/plans/transparency-dashboard.plan.md

## Sequence
- [x] `transparency-dashboard`.T01 — Create automated failing unit test suite covering AC1 to AC5 / UT01 to UT05 (TDD RED) in `tests/backend/modules/dashboard/` — Acceptance: `transparency-dashboard`.AC1, `transparency-dashboard`.AC2, `transparency-dashboard`.AC3, `transparency-dashboard`.AC4, `transparency-dashboard`.AC5
- [x] `transparency-dashboard`.T02 — Implement dashboard repository interface and data aggregation queries in `src/backend/modules/dashboard/repositories/` — Acceptance: `transparency-dashboard`.AC1, `transparency-dashboard`.AC2, `transparency-dashboard`.AC3
- [x] `transparency-dashboard`.T03 — Implement core dashboard domain service logic (`getUserTransfers`, `getTransferTimeline`, SLA bottleneck evaluation, `getPendingApprovals`) in `src/backend/modules/dashboard/services/` — Acceptance: `transparency-dashboard`.AC1, `transparency-dashboard`.AC2, `transparency-dashboard`.AC3, `transparency-dashboard`.AC4, `transparency-dashboard`.AC5
- [x] `transparency-dashboard`.T04 — Implement HTTP controllers and route endpoints under `/api/v1/dashboard/transfers`, `/api/v1/dashboard/transfers/:id/timeline`, and `/api/v1/dashboard/approvals/pending` in `src/backend/modules/dashboard/controllers/` and `routes/` — Acceptance: `transparency-dashboard`.AC1, `transparency-dashboard`.AC2, `transparency-dashboard`.AC3, `transparency-dashboard`.AC4, `transparency-dashboard`.AC5
- [x] `transparency-dashboard`.T05 — Implement frontend API client service and custom React state hook in `src/frontend/modules/dashboard/services/` and `hooks/` — Acceptance: `transparency-dashboard`.AC1, `transparency-dashboard`.AC2, `transparency-dashboard`.AC3
- [x] `transparency-dashboard`.T06 — Implement frontend UI components (`BottleneckCallout`, `MilestoneTimeline`, `PendingApprovalsQueue`, `EmptyTransferState`, `TransparencyDashboardPage`) with responsive design — Acceptance: `transparency-dashboard`.AC1, `transparency-dashboard`.AC2, `transparency-dashboard`.AC3, `transparency-dashboard`.AC4, `transparency-dashboard`.AC5
- [x] `transparency-dashboard`.T07 — Run full test suite across all modules to achieve 100% GREEN pass rate and verify code quality — Acceptance: Full Suite Verification
