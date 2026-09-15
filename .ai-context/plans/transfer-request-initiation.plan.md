# Plan: Transfer Request Initiation & Submission

## Derived From
.ai-context/specs/transfer-request-initiation.spec.md

## Pre-Development PR Review Findings & Guidance
- **Review Status:** Gate 1 `Approved` on 2026-09-15 by Tech Lead (`supratim.jetty@intglobal.com`)
- **Review Record:** `.ai-context/pr_reviews/GATE1-transfer-request-initiation-20260915-115141.md`
- **Key Reviewer Guidance:**
  1. Ensure unit tests written during the TDD RED phase cover all 5 specified test cases (`UT01` to `UT05`).
  2. Validate that HTTP 409 Conflict is returned when an active transfer request already exists for the requesting employee.
  3. Validate HTTP 422 Unprocessable Entity when the requested target department and role match the employee's current active deployment.

## Architecture Approach
Follows the INT Modular Monolith pattern defined in `.ai-context/architecture.md`:

### Backend Layering (`src/backend/modules/transfers/`)
- `validators/transfer.validator.ts`: Schema validation rules using Zod (future date check, non-empty fields, reason length <= 1000).
- `services/transfer.service.ts`: Core business logic:
  - `checkEligibility(employeeId)`: Verifies active transfer status and returns employee current profile.
  - `getLookupData()`: Retrieves available target departments, locations, and open roles.
  - `createTransferRequest(employeeId, data)`:
    - Verifies no active pending request exists (rejects with 409 Conflict).
    - Verifies proposed role and department differ from current profile (rejects with 422 Unprocessable Entity).
    - Persists request with status `SUBMITTED` and stage `CURRENT_MANAGER_REVIEW`.
- `controllers/transfer.controller.ts`: HTTP request handlers mapping query/body parameters and status codes (`200 OK`, `201 Created`, `400`, `401`, `409`, `422`).
- `repositories/transfer.repository.ts`: Data access operations via Prisma Client.
- `routes/transfer.routes.ts`: Express router definitions mounted at `/api/v1/transfers`.

### Frontend Layering (`src/frontend/modules/transfers/`)
- `services/transfer.api.ts`: API client functions connecting to `/api/v1/transfers/*`.
- `hooks/useTransferInitiation.ts`: State management hook for eligibility check, dropdown loading, validation, and submission state.
- `components/EligibilityBanner.tsx`: UI banner displaying current employee deployment and eligibility badge.
- `components/TransferRequestForm.tsx`: Form component with department/role/location selectors, future date picker, justification text area, and validation feedback.
- `pages/TransferInitiationPage.tsx`: Top-level route page assembling banner and form into a unified user experience.

## Data Model
Prisma entities in `prisma/schema.prisma`:
- `Employee`: `id`, `name`, `email`, `departmentId`, `roleId`, `locationId`, `tenureMonths`.
- `Department`: `id`, `name`, `code`.
- `Location`: `id`, `name`, `city`.
- `Role`: `id`, `title`, `departmentId`.
- `TransferRequest`: `id`, `employeeId`, `proposedDepartmentId`, `proposedLocationId`, `proposedRoleId`, `effectiveDate`, `transferReason`, `supportingDocumentUrls`, `status`, `currentStage`, `createdAt`, `updatedAt`.

## Constitution Check
- [x] No new datastore introduced without ADR (PostgreSQL + Prisma)
- [x] Testing discipline matches constitution.md (TDD RED -> GREEN; backend and frontend unit tests)
- [x] Security posture matches constitution.md (JWT authentication middleware, encrypted sensitive justification at rest, zero PII logging)

## Explicitly Deferred
- Manager review stage approval execution (deferred to `workflow-orchestration.spec.md`).
- Multi-team operational provisioning tasks (deferred to `operational-orchestration.spec.md`).

## Sequencing
1. **Plan & Tasks Approval**: Developer sign-off on Plan, Tasks, and Test Cases.
2. **TDD RED Phase**: Write failing unit tests in `tests/backend/modules/transfers/` and `tests/frontend/modules/transfers/` covering AC1-AC5 / UT01-UT05.
3. **Backend GREEN Implementation**: Build validators, repository queries, service logic, controllers, and Express routes.
4. **Frontend GREEN Implementation**: Build API service, custom hooks, and React UI components.
5. **Full Suite Verification**: Verify 100% test pass rate, linting, and typecheck.
6. **Gate 2 Code PR Review**: Submit for Tech Lead Gate 2 review.
