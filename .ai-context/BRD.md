# Business Requirements Document (BRD) — Employee Internal Transfer Digital Journey

## Document Metadata
- **Project Name:** Employee Internal Transfer
- **Document Source:** `docs/Requirement for SDD (2).docx`
- **Document Version:** v1.0
- **Ingested Date:** 2026-09-13
- **Status:** Pending Review (Gate 0)
- **Assigned Gate 0 Reviewer:** Tech Lead (`supratim.jetty@intglobal.com`)

---

## 1. Business Objective & Context

### 1.1 Objective
Evaluate and implement the **Employee Internal Transfer Digital Journey** using the INT Specification-Driven Delivery (SDD) methodology. The goal is to replace a manual, disjointed, multi-team internal transfer procedure with a single, end-to-end digital experience hosted inside the enterprise **One-Point Employee Portal**.

### 1.2 Current State (The Problem)
Currently, an employee seeking an internal transfer must navigate fragmented interactions across multiple siloed teams and legacy systems:
1. Employee discusses the transfer manually with their current manager.
2. Manager confirms the transfer via email or ad-hoc communication.
3. HR manually verifies transfer eligibility and policy compliance.
4. Employee organizational master records are manually updated.
5. Payroll operations must be notified for cost-center and compensation updates.
6. IT teams manually handle system access provisioning/deprovisioning.
7. Facilities management arranges new desk/location allocations.
8. Employee receives confirmation across disjointed channels with zero real-time visibility.

### 1.3 Target State (The Solution)
A unified self-service transfer experience on the One-Point Employee Portal that:
- Allows eligible employees to discover, configure, and submit transfer requests.
- Orchestrates sequential and parallel downstream stakeholder approvals (Current Manager, Hiring Manager, HR, IT, Facilities, Payroll).
- Provides a centralized, real-time dashboard displaying transfer status and pending stakeholder actions.
- Maintains a tamper-proof audit trail for enterprise governance.

---

## 2. Actors & Primary Personas

| Actor | Role & Responsibilities | System Access Level |
|---|---|---|
| **Employee (Applicant)** | Initiates transfer request, selects proposed department, role, location, and effective date, tracks real-time progress. | Portal User (Self) |
| **Current Manager** | Reviews transfer request, evaluates team impact, provides release approval and handover timeline. | Managerial Approval Tier |
| **Hiring Manager** | Reviews incoming candidate profile, accepts transfer into target department, confirms role match. | Hiring Approval Tier |
| **HR Administrator** | Validates employee tenure/eligibility, policy compliance, department headcount, and triggers organizational updates. | Administrative & Governance Tier |
| **Downstream Orchestrators (IT / Facilities / Payroll)** | Receive automated action items upon approval for access provisioning, desk allocation, and payroll adjustments. | Integration / Operational Tier |

---

## 3. Journey Stages & Workflow Pipeline

```text
[ Stage 1: Initiation ] 
  Employee configures & submits transfer request via One-Point Portal
            │
            ▼
[ Stage 2: Current Manager Review ] 
  Current Manager approves release timeline or requests revision
            │
            ▼
[ Stage 3: Hiring Manager & Department Review ] 
  Receiving department confirms role fit & accepts candidate
            │
            ▼
[ Stage 4: HR Validation & Policy Sign-Off ] 
  HR confirms eligibility, headcount, and authorizes transfer
            │
            ▼
[ Stage 5: Downstream Fulfillment & Provisioning ] 
  Orchestrates IT access, Facilities desk allocation, Payroll cost-center update
            │
            ▼
[ Stage 6: Completion & Handover ] 
  Org master updated, transfer closed, employee notified of completion
```

---

## 4. Functional Requirements

### BRD-001: Transfer Request Initiation & Submission
- **Description:** Employees must be able to initiate and submit an internal transfer request directly from the One-Point Employee Portal.
- **Fields & Parameters:**
  - `proposedDepartmentId`: Target department/business unit (Required dropdown).
  - `proposedLocationId`: Target office/geographic location (Required dropdown).
  - `proposedRoleId`: Proposed job position/title (Required dropdown).
  - `effectiveDate`: Requested effective date for transfer (Required date picker; must be in future).
  - `transferReason`: Optional justification statement (Max 1000 characters).
  - `supportingDocuments`: Optional file attachment (Resume, certifications, portfolio).
- **Validation Rules:**
  - Employee cannot submit a new request if an active transfer request is already pending review.
  - Target department/role cannot be identical to employee's current active department/role.

### BRD-002: Downstream Stakeholder Workflow Orchestration
- **Description:** The system must automatically route the submitted transfer request through sequential stakeholder approval gates.
- **Approval Flow:**
  1. **Current Manager Approval:** Evaluates release timeline (Approve with target release date, Reject with feedback, or Request Info).
  2. **Hiring Manager Approval:** Validates role acceptance (Approve, Reject).
  3. **HR Administrator Review:** Validates policy compliance, background checks, and organizational alignment.
- **Automated Routing:** Dynamic assignment based on employee department and target department hierarchies.

### BRD-003: Single View of Progress & Transparency Dashboard
- **Description:** Provide the employee and involved stakeholders with a unified, real-time dashboard reflecting transfer progression.
- **Capabilities:**
  - View overall request status (`Submitted`, `Manager Review`, `Hiring Manager Review`, `HR Validation`, `Fulfillment`, `Completed`, `Rejected`).
  - View explicit stakeholder bottlenecks (e.g. "Pending action with: Current Manager - Jane Doe since 2026-09-15").
  - Visual stage tracker showing completed steps and upcoming milestones.
  - History log showing timestamps, comments, and decisions.

### BRD-004: Downstream Operational Task Orchestration (IT, Facilities, Payroll)
- **Description:** Upon final HR approval, the portal must orchestrate downstream activity notifications and status updates across operational teams.
- **Capabilities:**
  - **IT Provisioning:** Generates task for access permissions update and hardware reconfiguration.
  - **Facilities Allocation:** Generates task for office seating and physical site access.
  - **Payroll & Comp Update:** Generates notification for cost-center and compensation re-indexing.
  - Aggregates operational checklist completion before marking transfer `Completed`.

### BRD-005: Notifications & Audit Logging
- **Description:** Automated communication and strict compliance audit tracking.
- **Capabilities:**
  - Trigger email and portal notifications on every status change.
  - Immutable audit trail recording every state change, actor ID, IP/timestamp, and decision remarks.

---

## 5. Non-Functional Requirements (NFRs)

- **Security & PII Protection:** Employee compensation, transfer reasons, and evaluation comments must be encrypted at rest and in transit. Access restricted strictly via RBAC.
- **Performance & Latency:** Portal dashboard load time p95 < 500 ms; transfer submission API response < 300 ms.
- **Auditability:** Complete chronological event sourcing for transfer workflow state transitions.
- **Reliability & Availability:** 99.5% uptime baseline.

---

## 6. Business Decisions vs. Technical Decisions

| Dimension | Business Decision (Stakeholder Owned) | Technical Decision (Architecture Owned) |
|---|---|---|
| **Eligibility Window** | Minimum tenure required before internal transfer eligibility (e.g. 12 months in current role). | Database validation schema and business rule service check on submission. |
| **Approval Chain** | Required approval order (Current Manager ➔ Hiring Manager ➔ HR Admin). | State machine workflow pattern in backend services. |
| **Rejection Appeal** | Whether a rejected transfer can be re-appealed or subject to cooldown. | Cooldown timestamp flag in database schema (`cooldownUntil`). |
| **Downstream Automation** | Whether IT/Facilities updates are automated API calls or manual task tickets. | Adapter interface design allowing manual task sign-off now, REST webhooks later. |

---

## 7. Open Questions & Assumptions

### 7.1 Open Questions for Stakeholders
1. **Tenure Rule:** Is there a mandatory minimum tenure (e.g., 6 months or 1 year) in the employee's current role before an internal transfer request can be filed?
2. **Current Manager Veto Power:** Can a current manager unconditionally block a transfer, or can HR override in exceptional business circumstances?
3. **Compensation Re-negotiation:** Does the transfer journey incorporate salary adjustments, or is compensation handled in a separate HR compensation cycle?

### 7.2 Assumptions for Baseline
- All active employees, departments, and job titles exist in the enterprise directory.
- The One-Point Portal provides authenticated session context with employee profile data.
- Initial downstream fulfillment (IT, Facilities, Payroll) will operate via structured sign-off tasks within the portal before external system API integrations are introduced.

---

## 8. Out-of-Scope Items
- External candidate hiring, public job postings, and external job board syndication.
- Physical badge issuance hardware integrations.
- Comprehensive annual performance appraisal scoring (only eligibility status is consumed).

---

## 9. Baseline Acceptance Criteria

1. **BRD.AC1 (Submission):** Given an authenticated eligible employee, when they select target department, location, role, effective date, and submit, then a new transfer request record is created with status `Under Manager Review` and an audit entry is logged.
2. **BRD.AC2 (Duplicate Prevention):** Given an employee with an active pending transfer request, when they attempt to initiate another transfer, then the portal blocks submission with an informative message and directs them to the active tracker.
3. **BRD.AC3 (Manager Workflow):** Given a pending transfer request, when the current manager approves with a release date, then the status transitions to `Under Hiring Manager Review` and notifications are dispatched.
4. **BRD.AC4 (Real-Time Tracker):** Given any active transfer request, when the employee views the portal transfer page, then the system renders the exact current stage, the specific stakeholder with whom action is pending, and the elapsed time.
5. **BRD.AC5 (Fulfillment Checklist):** Given an HR-approved transfer request, when IT, Facilities, and Payroll complete their respective checklist tasks, then the transfer automatically transitions to `Completed`.
