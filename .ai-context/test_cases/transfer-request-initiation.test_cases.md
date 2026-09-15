# Test Cases: Transfer Request Initiation & Submission

## Derived From Spec
.ai-context/specs/transfer-request-initiation.spec.md

## Acceptance Test Scenarios

### transfer-request-initiation.TC01 — Check Employee Transfer Eligibility
- **Maps to AC:** `transfer-request-initiation`.AC1
- **Given:** An authenticated employee with no open transfer requests.
- **When:** GET `/api/v1/transfers/eligibility` is invoked.
- **Then:** System returns HTTP 200 OK with `isEligible: true`, `hasActiveTransfer: false`, and current employee profile.
- **Automated Test File:** `tests/backend/modules/transfers/transfer.service.test.ts`

### transfer-request-initiation.TC02 — Successfully Submit Valid Transfer Request
- **Maps to AC:** `transfer-request-initiation`.AC2
- **Given:** An eligible employee targeting a new department, location, role, and a future effective date.
- **When:** POST `/api/v1/transfers` is called with valid payload.
- **Then:** System returns HTTP 201 Created with status `SUBMITTED` and stage `CURRENT_MANAGER_REVIEW`.
- **Automated Test File:** `tests/backend/modules/transfers/transfer.service.test.ts`

### transfer-request-initiation.TC03 — Reject Duplicate Active Transfer Submission
- **Maps to AC:** `transfer-request-initiation`.AC3
- **Given:** An employee who already has a transfer request in progress (`SUBMITTED` or `IN_REVIEW`).
- **When:** POST `/api/v1/transfers` is called.
- **Then:** System rejects with HTTP 409 Conflict and descriptive error message.
- **Automated Test File:** `tests/backend/modules/transfers/transfer.service.test.ts`

### transfer-request-initiation.TC04 — Reject Submission Targeting Current Role and Department
- **Maps to AC:** `transfer-request-initiation`.AC4
- **Given:** An employee attempting to submit a transfer targeting their current department and role.
- **When:** POST `/api/v1/transfers` is called.
- **Then:** System rejects with HTTP 422 Unprocessable Entity.
- **Automated Test File:** `tests/backend/modules/transfers/transfer.service.test.ts`

### transfer-request-initiation.TC05 — Reject Invalid Payload (Past Date / Missing Fields)
- **Maps to AC:** `transfer-request-initiation`.AC5
- **Given:** A request payload containing an effective date in the past or missing required fields.
- **When:** POST `/api/v1/transfers` is validated.
- **Then:** System rejects with HTTP 400 Validation Error listing field constraint violations.
- **Automated Test File:** `tests/backend/modules/transfers/transfer.validator.test.ts`
