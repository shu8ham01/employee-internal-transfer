# Spec: Transfer Request Initiation & Submission

## Spec ID
transfer-request-initiation

## Status
Completed (Gate 2 Approved)

## Roles & Assignments
- **Developer:** Developer (`developer@intglobal.com`)
- **Gate 1 Reviewer(s):** Tech Lead (`supratim.jetty@intglobal.com`)
- **Gate 2 Reviewer(s):** Tech Lead (`supratim.jetty@intglobal.com`)

## Linked BRD
.ai-context/BRD.md#BRD-001

## Gate Approvals & History
| Gate | Approver Name | Approver Email/ID | Date/Time | Outcome | Approval Comment / Summary |
|---|---|---|---|---|---|
| Gate 1 (Spec Review) | Tech Lead | supratim.jetty@intglobal.com | 2026-09-15 11:51:41 | Approved | Approved by Tech Lead (.ai-context/pr_reviews/GATE1-transfer-request-initiation-20260915-115141.md) |
| Gate 2 (Code Review) | Tech Lead | supratim.jetty@intglobal.com | 2026-09-15 13:39:25 | Approved | Approved by Tech Lead (.ai-context/pr_reviews/GATE2-transfer-request-initiation-20260915-133925.md - 15/15 PASS) |


## Intent
Enables eligible employees to discover internal transfer opportunities, select target department, target office location, and target role, set a requested future effective date, provide justification notes, upload optional supporting documents, and submit their transfer request into the approval orchestration pipeline. The system enforces business rules preventing concurrent active requests and disallowing requests to an employee's existing department/role.

## Context
- Builds on: `.ai-context/architecture.md` (Section 2 & 3: Modular Monolith, `src/backend/modules/transfers` & `src/frontend/modules/transfers`)
- Related: `.ai-context/specs/workflow-orchestration.spec.md`
- Data Model: Prisma entities `TransferRequest`, `Department`, `Location`, `Role`, `Employee`

## API Contract (Mandatory if API surface exists)

### transfer-request-initiation.API01 — GET /api/v1/transfers/eligibility
Retrieves employee transfer eligibility status and active transfer flag.

**Success response (`200 OK`):**
```json
{
  "isEligible": true,
  "hasActiveTransfer": false,
  "activeTransferId": null,
  "currentDepartment": {
    "id": "dept-101",
    "name": "Frontend Engineering"
  },
  "currentRole": {
    "id": "role-201",
    "title": "Software Engineer"
  },
  "currentLocation": {
    "id": "loc-301",
    "name": "Kolkata HQ"
  },
  "tenureMonths": 18
}
```

**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 401 | Unauthenticated session | `{"error": "Unauthorized", "message": "Valid JWT token required"}` |
| 404 | Employee record not found | `{"error": "NotFound", "message": "Employee profile could not be located"}` |

---

### transfer-request-initiation.API02 — GET /api/v1/transfers/lookup-data
Returns available departments, locations, and roles for transfer target selection.

**Success response (`200 OK`):**
```json
{
  "departments": [
    { "id": "dept-102", "name": "Cloud Infrastructure" },
    { "id": "dept-103", "name": "AI & Analytics" }
  ],
  "locations": [
    { "id": "loc-301", "name": "Kolkata HQ" },
    { "id": "loc-302", "name": "Bengaluru Office" }
  ],
  "roles": [
    { "id": "role-202", "title": "DevOps Engineer", "departmentId": "dept-102" },
    { "id": "role-203", "title": "AI Engineer", "departmentId": "dept-103" }
  ]
}
```

---

### transfer-request-initiation.API03 — POST /api/v1/transfers
Creates and submits a new internal transfer request.

**Request payload:**
```json
{
  "proposedDepartmentId": "dept-102",
  "proposedLocationId": "loc-302",
  "proposedRoleId": "role-202",
  "effectiveDate": "2026-11-01T00:00:00.000Z",
  "transferReason": "Career advancement and relocation to Bengaluru Cloud Infrastructure unit",
  "supportingDocumentUrls": [
    "https://storage.internal.intglobal.com/docs/cert-aws-devops.pdf"
  ]
}
```

**Success response (`201 Created`):**
```json
{
  "id": "tr-9001",
  "employeeId": "emp-001",
  "proposedDepartmentId": "dept-102",
  "proposedLocationId": "loc-302",
  "proposedRoleId": "role-202",
  "effectiveDate": "2026-11-01T00:00:00.000Z",
  "transferReason": "Career advancement and relocation to Bengaluru Cloud Infrastructure unit",
  "status": "SUBMITTED",
  "currentStage": "CURRENT_MANAGER_REVIEW",
  "createdAt": "2026-09-15T11:30:00.000Z",
  "updatedAt": "2026-09-15T11:30:00.000Z"
}
```

**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 400 | Validation error (e.g. effectiveDate in the past, missing fields) | `{"error": "ValidationError", "details": ["effectiveDate must be in the future"]}` |
| 409 | Duplicate active request exists | `{"error": "Conflict", "message": "An active transfer request is already in progress for this employee"}` |
| 422 | Target role/department identical to current | `{"error": "UnprocessableEntity", "message": "Proposed department and role cannot match current active department and role"}` |

---

## Acceptance Criteria
1. `transfer-request-initiation`.AC1 — Given an authenticated employee with no active transfers, when they request eligibility, then `isEligible` is true and `hasActiveTransfer` is false with their current org profile.
2. `transfer-request-initiation`.AC2 — Given valid target department, location, role, and a future effective date, when submitted, then a new transfer request record is created with status `SUBMITTED` and assigned to stage `CURRENT_MANAGER_REVIEW`.
3. `transfer-request-initiation`.AC3 — Given an employee with an existing pending transfer request, when submitting a new request, then the system returns HTTP 409 Conflict with a descriptive rejection message.
4. `transfer-request-initiation`.AC4 — Given a submission where `proposedDepartmentId` and `proposedRoleId` match the employee's current active role and department, then the system rejects submission with HTTP 422 Unprocessable Entity.
5. `transfer-request-initiation`.AC5 — Given an effective date set in the past or invalid payload types, then the system rejects submission with HTTP 400 Validation Error.

## Unit Test Cases (spec-derived)
| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| `transfer-request-initiation`.UT01 | AC1 | GET eligibility for employee without open transfers | Return 200 OK with `isEligible: true`, `hasActiveTransfer: false` |
| `transfer-request-initiation`.UT02 | AC2 | POST transfer with valid future date and distinct target | Return 201 Created with status `SUBMITTED` and initial stage |
| `transfer-request-initiation`.UT03 | AC3 | POST transfer when employee already has active transfer | Return 409 Conflict and do not persist duplicate record |
| `transfer-request-initiation`.UT04 | AC4 | POST transfer targeting current department and role | Return 422 Unprocessable Entity with error message |
| `transfer-request-initiation`.UT05 | AC5 | POST transfer with past effective date or missing required fields | Return 400 Validation Error with field failure details |

## Explicitly Out of Scope
- Approval decision recording and stage transition orchestration (covered in `workflow-orchestration.spec.md`).
- Downstream IT, Facilities, and Payroll task assignment (covered in `operational-orchestration.spec.md`).
- Direct file upload multipart parsing (assumes pre-signed document URLs or shared upload service).

## Non-Functional Constraints (from constitution.md)
- Response time for eligibility and submission endpoints must be p95 < 300 ms.
- Sensitive justification comments and notes encrypted at rest.
- Role-based authorization verifying caller identity via JWT.
