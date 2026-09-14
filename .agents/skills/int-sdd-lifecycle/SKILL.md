---
name: int-sdd-lifecycle
description: Manage the end-to-end INT SDD feature development lifecycle, including feature specs, status board updates, Gate 1 peer reviews, implementation plans, task breakdown, test-first TDD, Gate 2 code reviews, and Definitions of Ready & Done.
---

# INT SDD Feature Engineering Lifecycle

## Scope Boundary & Strict Non-Regression Guarantee
> [!IMPORTANT]
> **Strict Scope Restriction — PR Gate Workflow Enhancement**
> - **Before Spec Generation (🔒 NO CHANGE)**: BRD process, project setup, permissions, authentication, BRD ingestion, technology discovery, and pre-spec entry points remain 100% unchanged.
> - **Spec Generation → Gate 1 → Development → Gate 2 (✅ ENHANCEMENT ALLOWED)**: Non-blocking parallel specs, reviewer detection, decision prompts, work selection, standardized review templates, role validation, and dashboard synchronization.
> - **After Gate 2 Approval (🔒 NO CHANGE)**: Release Management, CR Management, Hot Fix Management, Deployment Management, Production Movement, Release Approvals, and downstream status transitions remain 100% unchanged. Handover to downstream workflows occurs exactly as it does today.

---

# Mandatory Lifecycle Flow

```text
1. BRD Ingestion / Authoring (.ai-context/BRD.md)
       ↓
2. Gate 0: BRD PR Review & Approval (Standardized BRD Review Template + 5-Artifact Sync)
       ↓
3. Spec Authoring (.ai-context/specs/<feature-slug>.spec.md) [Parallel & Non-Blocking]
       ↓
4. Reviewer Detection / Selection & Decision Prompt (Review Pending Specs vs Work on Approved Specs)
       ↓
5. Gate 1: Spec PR Review & Approval (Standardized Gate 1 Template + Git Identity Validation)
       ↓
6. Developer Work Selection ("Which approved spec would you like to start development on?")
       ↓
7. Pre-Development PR Review Check & Developer Notification
       ↓
8. Plan (.ai-context/plans/<slug>.plan.md), Tasks (.tasks.md), Test Cases (.test_cases.md) Breakdown
       ↓
9. Full Development Phase: Test-First (RED) ──► Implementation (GREEN) ──► Full Test Suite Verification (PASS)
       ↓
10. Gate 2: Code PR Review & Approval (Standardized Gate 2 Template + Git Identity Validation + Dashboard Sync)
       ↓
11. EXISTING DOWNSTREAM WORKFLOW (Release Management / Release Note / CR Management / Hot Fix Management)
```

## 1. Non-Blocking Parallel Spec Generation & State Machine

Currently, when one spec is waiting for Gate 1 approval, the system does not block or prevent developers from drafting, generating, or progressing other specs.

Multiple specs exist and progress **independently** in parallel. For example, the following spec states can exist simultaneously in `.ai-context/status.md` and `.ai-context/dashboard.html`:

| Spec ID | Spec Title | Gate 1 Status | Gate 2 Status | Spec Lifecycle Status |
|---|---|---|---|---|
| `spec-1` | User Authentication | `Pending Review` | `Not Started` | `In Peer Review` |
| `spec-2` | Product Catalog | `Pending Review` | `Not Started` | `In Peer Review` |
| `spec-3` | Cart & Checkout | `Approved` | `Not Started` | `Approved` |
| `spec-4` | Payment Gateway | `Approved` | `Not Started` | `Under Development` |
| `spec-5` | Order Management | `Approved` | `Pending Review` | `In QA` |

One spec being pending, blocked, or in review MUST NOT block creating, reviewing, or developing another spec.

```text
Draft → In Peer Review (Gate 1) → Changes Requested ↺
      → Approved → Plan Drafted → Plan Reviewed → Tasks Generated
      → Under Development → In QA → Ready for Release → Released (vX.Y.Z)
```

### Standardized Spec Statuses:
| Status | Lifecycle Stage & Definition |
|---|---|
| `Draft` | Spec is being authored; not yet ready for peer review. |
| `In Peer Review` | Spec submitted for Gate 1 peer review. |
| `Changes Requested` | Gate 1 or Gate 2 review requested updates before approval. |
| `Approved` | Spec passed Gate 1 review with reviewer identity & comments captured. |
| `Plan Drafted` | Implementation plan (`.plan.md`) created from approved spec. |
| `Plan Reviewed` | Implementation plan reviewed and approved. |
| `Tasks Generated` | Executable tasks (`.tasks.md`) derived and ready for TDD. |
| `Under Development` | Feature actively being implemented (TDD Red → Green cycle). |
| `In QA` | Implementation complete, tests GREEN, undergoing Gate 2 review. |
| `Ready for Release` | Passed Gate 2 review with code merged, pending release deployment. |
| `Released (vX.Y.Z)` | Deployed to production and released under tag `vX.Y.Z`. |

## Mandatory Lifecycle Rules
- **No implementation without an approved Spec**.
- **Gate 1 Approval Required for Development**: Development MUST NOT start for a spec that has not received Gate 1 approval.
- **Pre-Development PR Review Verification**: Before starting development on any spec, the system MUST inspect the existing PR Review record (`.ai-context/pr_reviews/GATE1-<slug>-*.md`) and notify the developer of the review findings.
- **Strict Rejection Blocking Rule**: If a spec was `Rejected` or marked `Changes Requested` at Gate 1, the user is **STRICTLY BLOCKED** from creating plans, tasks, test cases, or implementation code. The user MUST update the spec (`.ai-context/specs/<slug>.spec.md`) and re-submit for Gate 1 approval.
- **Developer Work Selection**: Once specs receive Gate 1 approval, present the eligible approved specs to the developer to select which one to work on.
- **Reviewer Detection on Git Pull**: Identify user Git credentials (`git config user.name`/`user.email` or configured User ID). If assigned as reviewer for pending specs, prompt with options: `Review Pending Specs` or `Work on Approved Specs`.
- **Git & Local Reviewer Validation**: Validate authenticated user matches assigned reviewer before official approval/rejection. In local-only mode, capture reviewer metadata without failing Git validation.
- **Plan, Tasks & Tests Generation**: Only after Gate 1 approval is granted, create `.plan.md`, `.tasks.md`, and `.test_cases.md`.
- **TDD RED before GREEN**: Write failing executable tests (`tests/`) first and confirm RED before writing implementation code (GREEN).
- **Complete Development Before Gate 2**: All feature development tasks must be executed and test suites run to confirm 100% PASS before triggering Gate 2 review.
- **Gate 2 HALT**: After development is complete and tests pass GREEN, halt and perform Gate 2 code review using the standardized Gate 2 template.
- **Dashboard & Spec Synchronization**: Gate 1 and Gate 2 approval/rejection updates both Dashboard HTML (complete record) and Spec (current status) simultaneously.
- **Handover to Downstream**: Upon Gate 2 approval, hand over cleanly to existing downstream Release Management / Deployment workflows without modifying post-Gate-2 processes.
- One task per agent execution. Prompt by stable artifact ID (`<feature-slug>`).

---

# 2. Gate 1 Approval & Pre-Development PR Review Verification Protocol

When a developer selects a spec or requests to start development, the system executes the **Pre-Development Verification Check**:

### Step 1: Pre-Development PR Review Check & Developer Notification
Before generating implementation artifacts or writing code, the system inspects `.ai-context/pr_reviews/GATE1-<feature-slug>-*.md` (and `.ai-context/specs/<feature-slug>.spec.md`) for the selected spec.

The system presents the **Gate 1 Review Notification** to the developer:

> 📋 **Gate 1 PR Review Reference Found**
> - **Spec ID**: `<feature-slug>` — `<Spec Name>`
> - **Gate 1 Review Status**: `Approved` | `Rejected` | `Changes Requested`
> - **Assigned Reviewer**: `<Reviewer Name>` (`<Reviewer Email>`)
> - **Review Date**: `<YYYY-MM-DD HH:MM:SS>`
> - **PR Review Record File**: `.ai-context/pr_reviews/GATE1-<feature-slug>-<timestamp>.md`
> - **Review Summary & Description**: `<Review Description>`
> - **Review Comments**: `<Review Comments & Feedback>`

---

### Step 2A: Workflow if Spec is APPROVED (`Approved`)

If Gate 1 Status is **`Approved`**:
1. The system notifies the developer of the reviewer's approval comments and feedback.
2. The developer is directed to execute the mandatory feature implementation sequence:
   - **Phase 1: Implementation Plan**: Create `.ai-context/plans/<feature-slug>.plan.md` from `.spec.md`.
   - **Phase 2: Task Breakdown**: Create `.ai-context/tasks/<feature-slug>.tasks.md` from `.plan.md`.
   - **Phase 3: Test Case Specifications**: Create `.ai-context/test_cases/<feature-slug>.test_cases.md` mapping 1-to-1 with Acceptance Criteria.
   - **Phase 4: Executable TDD RED**: Generate failing automated tests under `tests/frontend/` or `tests/backend/` and confirm RED failure.
   - **Phase 5: Implementation GREEN**: Implement feature code under `src/` until all tests pass GREEN (100% PASS).
   - **Phase 6: Gate 2 Submission**: Halt execution and wait for / trigger **Gate 2 Code Review** (`.ai-context/pr_reviews/GATE2-<slug>-*.md`).

---

### Step 2B: Workflow if Spec is REJECTED or CHANGES REQUESTED (`Rejected` / `Changes Requested`)

If Gate 1 Status is **`Rejected`** or **`Changes Requested`**:
1. **STRICT DEVELOPMENT BLOCK**: The system **STRICTLY BLOCKS** the user/developer from proceeding to planning (`.plan.md`), task generation (`.tasks.md`), test case drafting (`.test_cases.md`), or writing implementation code in `src/`!
2. The system displays a high-priority warning:
   > 🛑 **DEVELOPMENT BLOCKED — GATE 1 SPEC REJECTED**
   >
   > **Spec ID**: `<feature-slug>`
   > **Gate 1 Outcome**: `Rejected` / `Changes Requested`
   > **Reviewer**: `<Reviewer Name>` (`<Reviewer Email>`)
   > **Reviewer Feedback**:
   > - *Description*: `<Review Description>`
   > - *Comments*: `<Review Comments>`
   >
   > 🔒 **Enforcement Rule**: No planning or development is allowed for rejected specs.
   > **Next Required Action**: The author must update the spec (`.ai-context/specs/<feature-slug>.spec.md`) to resolve reviewer comments and re-submit it for **Gate 1 Approval** before development can begin.

---

### Step 3: Developer Work Selection Roster
When a developer requests to start work, the system lists ONLY specs that have passed Gate 1:
> **"Which approved spec would you like to start development on?"**

If no Gate 1 approved spec is available for development, the system displays:
> **"No approved spec is currently available for development. Please complete the PR Gate 1 approval process before proceeding."**

---

# 3. Reviewer Detection After Git Pull & Interactive PR Review Loop

When a user pulls code or triggers **`/pr-gate-workflow`**, the system identifies the user's Git/system identity (`git config user.name`, `git config user.email` or User ID).

If the system identifies that the user is an **assigned PR reviewer** for one or more pending specs, it presents the top-level Decision Prompt:

> **"You are assigned as a PR reviewer. What would you like to do?"**
- **[ Option 1 — Review Pending Specs ]**
- **[ Option 2 — Work on Approved Specs ]**

---

### Option 1 — Review Pending Specs (Role-Filtered Listing)

When the reviewer selects **Review Pending Specs**:

1. **Role-Based Spec Filtering**:
   The system queries `.ai-context/specs/*.spec.md` and `.ai-context/dashboard.html` to filter pending specs where the authenticated user matches the assigned reviewer roster:
   - **Gate 1 Approver**: Displays specs waiting for Gate 1 Spec Peer Review (`In Peer Review`).
   - **Gate 2 Approver**: Displays specs waiting for Gate 2 Code Review (`In QA`).
   - **Dual Approver (Gate 1 & Gate 2)**: Displays BOTH Gate 1 and Gate 2 pending reviewals in the same listing!

2. **Role-Filtered Listing Table**:
   The system displays the eligible pending specs assigned to that reviewer:

   | # | Spec ID | Spec Title | Gate Level | Assigned Role | Developer | Current Status |
   |---|---|---|---|---|---|---|
   | 1 | `auth-service` | User Authentication | **Gate 1** | Gate 1 Reviewer | Dev A | Pending Spec Review |
   | 2 | `payment-gateway` | Payment Gateway | **Gate 2** | Gate 2 Reviewer | Dev B | Pending Code Review |
   | 3 | `order-engine` | Order Processing | **Gate 1 & Gate 2** | Dual Reviewer | Dev C | Pending Spec Review |

3. **Spec-Oriented Interactive Q&A Review Process**:
   When the reviewer selects a spec from the table:
   - **Step A: Spec Orientation Summary**: Present the feature's Intent, Linked BRD, Acceptance Criteria, and (for Gate 2) code diff & passing test suite evidence.
   - **Step B: Interactive Q&A Criteria Evaluation**: System gathers reviewer input across the 11 standardized criteria (for Gate 1 or Gate 2).
   - **Step C: Review Description**: System prompts for high-level summary of review findings.
   - **Step D: Review Comments**: System prompts for line-item feedback or requested changes.
   - **Step E: Final Decision**: System prompts for official decision: **`Approve`**, **`Reject`**, or **`Changes Requested`**.

4. **Dedicated Review Record File Creation**:
   Upon review completion, the system automatically writes a dedicated review artifact file under:
   - `.ai-context/pr_reviews/GATE1-<feature-slug>-<YYYYMMDD-HHMMSS>.md` (for Gate 1)
   - `.ai-context/pr_reviews/GATE2-<feature-slug>-<YYYYMMDD-HHMMSS>.md` (for Gate 2)

5. **Multi-Artifact Synchronization Protocol**:
   Every completed PR review update MUST synchronize across **5 core repository artifacts**:
   - **1. PR Review Record (`.ai-context/pr_reviews/`)**: Dedicated markdown record with metadata, Q&A criteria scores, comments, description, reviewer identity, and timestamp.
   - **2. Dashboard HTML (`.ai-context/dashboard.html` — SINGLE SOURCE OF TRUTH)**: Updated with complete review record data, scores, comments, description, reviewer email/ID, and timestamp.
   - **3. Governing Spec (`.ai-context/specs/<slug>.spec.md`)**: Updated status (`Approved`, `Changes Requested`, `Under Development`, `Ready for Release`) and logged entry in `## Gate Approvals & History` linking to the PR review file.
   - **4. Project Status Board (`.ai-context/status.md`)**: Updated active spec status and daily log entry.
   - **5. Prompt History (`.ai-context/prompt_history.md`)**: Appended turn log entry (STRICT APPEND-ONLY RULE).

6. **Continuous Review Loop**:
   Immediately after review completion and 5-artifact sync:
   - The system **automatically loops back** to display the remaining list of assigned pending PR reviews for that reviewer!
   - If remaining assigned pending reviews exist:
     > *"Review completed and synchronized for `<spec-id>`. Remaining pending PR reviews assigned to you:"*
     > [Displays updated listing table]
   - If no more pending reviews remain:
     > *"All assigned PR reviews have been completed! Would you like to select an approved spec to start development on?"*

---

### Option 2 — Work on Approved Specs
If the reviewer selects **Work on Approved Specs**:
1. The reviewer acts as a **developer/contributor** for development purposes.
2. The system displays the list of Gate 1 approved specs available to any developer:
   > **"Select an approved spec to work on:"**
   - `spec-2` — Gate 1 Approved
   - `spec-3` — Gate 1 Approved
   - `spec-5` — Gate 1 Approved
3. The reviewer selects an approved spec and proceeds with standard development (TDD RED -> GREEN).

---

# 4. Reviewer and Developer Role Separation & Validation

The system enforces strict role separation:

- **Reviewer Identity**: Determines whether the user can perform:
  - Gate 1 review, approval, or rejection.
  - Gate 2 review, approval, or rejection.
- **Developer Identity**: Determines whether the user can:
  - Pull code.
  - Work on approved specs.
  - Execute development & write code.
  - Complete development & submit for Gate 2 review.

> **Crucial Rule**: Pulling code does NOT automatically grant reviewer approval rights. Only the assigned reviewer for that specific Gate and spec can perform official approval/rejection.
> Being assigned as a PR reviewer does NOT prevent a user from developing approved specs.
> Working on an approved spec does NOT automatically make the user the PR reviewer for that spec.

### Git-Based Identity Validation & Approval Restriction Rule
When project code is available in Git, the system performs **Strict Pre-Execution Email Matching**:

1. **Pre-Execution Check**:
   The system compares authenticated Git user email (`git config user.email`) against the **Assigned Reviewer Email Roster** configured for the target PR gate in `.ai-context/project_context.md` and `.ai-context/constitution.md`.

2. **Access & Approval Enforcement**:
   - If the user's Git email (`git config user.email`) matches an assigned reviewer email for that PR gate, the user is granted PR review access.
   - If the user's Git email does **NOT** match an assigned reviewer email:
     - **Option 1 (Review Pending Specs)** is **STRICTLY BLOCKED AND RESTRICTED**.
     - The system displays the high-priority restriction alert:
       > 🛑 **PR REVIEW RESTRICTED — EMAIL MISMATCH**
       > - **Logged-in Git Email:** `<logged_in_email>`
       > - **Assigned Reviewer Email:** `<assigned_email>`
       > 🔒 **Access Blocked**: You cannot perform PR reviews or approve PR gates because your logged-in Git email does not match the assigned PR reviewer email.
     - Any manual attempt to submit an `Approve`, `Reject`, or `Changes Requested` decision is **HARD-BLOCKED AND REJECTED**.

### Local-Only Scenario Rule
If the project has not yet been pushed to Git and exists only locally:
- Git identity validation is skipped.
- Review process STILL captures complete reviewer information: Reviewer Name, Reviewer Email/User ID, Review Status, Review Comments, Review Description, and Timestamp.
- Once pushed to Git, full Git identity validation rules apply automatically.

---

# 5. Reviewer With Multiple Responsibilities Example

A Team Lead/Manager may be assigned as a reviewer for some specs while contributing to development on others.
When pulling code, the system presents the top-level decision prompt:

```text
What would you like to do?
[ Review Pending Specs ]
[ Work on Approved Specs ]
```

If **Review Pending Specs** is selected:
- Filter and show assigned pending specs based on reviewer identity.
- Execute interactive Q&A review using standardized template.
- Save dedicated review file under `.ai-context/pr_reviews/` and sync Dashboard HTML, Spec, Status Board, and Prompt History.
- Loop back to show remaining pending reviews until complete.

If **Work on Approved Specs** is selected:
- Shows Gate 1 approved specs (`spec-2`, `spec-3`, `spec-5`).
- Select spec and begin TDD development cycle.

---

# 6. Standardized Gate 1 Review Template (Spec & BRD Peer Review)

Every Gate 1 review MUST evaluate BOTH the Feature Spec (`.spec.md`) and the linked BRD Requirement (`.ai-context/BRD.md`). It MUST utilize the standardized 22-field Gate 1 Review Template (saved under `.ai-context/pr_reviews/GATE1-<slug>-<timestamp>.md`):

```markdown
# Gate 1 PR Review: <Spec ID> — <Spec Name>

## Review Metadata
- **Project Name:** <Project Name>
- **Spec ID:** <feature-slug>
- **Spec Name:** <Spec Name>
- **Linked BRD Requirement:** .ai-context/BRD.md#<BRD-ID> (<BRD Requirement Title>)
- **Developer:** <Developer Name / Email>
- **Assigned Reviewer(s):** <Assigned Reviewer Roster>
- **Reviewer Name:** <Reviewer Name>
- **Reviewer Email/User ID:** <Reviewer Email or User ID>
- **Review Status:** Approved | Rejected | Changes Requested
- **Review Date/Time:** YYYY-MM-DD HH:MM:SS
- **Review Record File:** .ai-context/pr_reviews/GATE1-<feature-slug>-<YYYYMMDD-HHMMSS>.md

## Review Criteria Evaluation (Q&A Results)
1. **BRD Traceability & Alignment:** Passed | Needs Improvement | Failed
2. **Requirement Completeness:** Passed | Needs Improvement | Failed
3. **Requirement Understanding:** Passed | Needs Improvement | Failed
4. **Functional Scope:** Passed | Needs Improvement | Failed
5. **Technical Approach/Design:** Passed | Needs Improvement | Failed
6. **Business Rules:** Passed | Needs Improvement | Failed
7. **Validations:** Passed | Needs Improvement | Failed
8. **Dependencies:** Passed | Needs Improvement | Failed
9. **Assumptions:** Passed | Needs Improvement | Failed
10. **Edge Cases:** Passed | Needs Improvement | Failed
11. **Acceptance Criteria & Readiness:** Ready | Not Ready

## Review Summary & Feedback
- **Review Description:** <High-level summary of review findings, BRD scope alignment, and assessment>
- **Review Comments:** <Detailed line-item feedback, requested changes, or approval notes>
```

---

# 7. Standardized Gate 2 Review Template

Every Gate 2 review MUST utilize the standardized 22-field Gate 2 Review Template (saved under `.ai-context/pr_reviews/GATE2-<slug>-<timestamp>.md`):

```markdown
# Gate 2 PR Review: <Spec ID> — <Spec Name>

## Review Metadata
- **Project Name:** <Project Name>
- **Spec ID:** <feature-slug>
- **Spec Name:** <Spec Name>
- **Developer:** <Developer Name / Email>
- **Assigned Reviewer(s):** <Assigned Reviewer Roster>
- **Reviewer Name:** <Reviewer Name>
- **Reviewer Email/User ID:** <Reviewer Email or User ID>
- **Review Status:** Approved | Rejected | Changes Requested
- **Review Date/Time:** YYYY-MM-DD HH:MM:SS
- **Review Record File:** .ai-context/pr_reviews/GATE2-<feature-slug>-<YYYYMMDD-HHMMSS>.md

## Review Criteria Evaluation (Q&A Results)
1. **Implementation Against Approved Spec:** Passed | Needs Improvement | Failed
2. **Functional Correctness:** Passed | Needs Improvement | Failed
3. **Code Quality:** Passed | Needs Improvement | Failed
4. **Coding Standards:** Passed | Needs Improvement | Failed
5. **Error Handling:** Passed | Needs Improvement | Failed
6. **Validation:** Passed | Needs Improvement | Failed
7. **Security Considerations:** Passed | Needs Improvement | Failed
8. **Test Coverage:** Passed | Needs Improvement | Failed
9. **Edge Cases:** Passed | Needs Improvement | Failed
10. **Acceptance Criteria Compliance:** Passed | Needs Improvement | Failed
11. **Regression Impact:** None | Low | High

## Review Summary & Feedback
- **Review Description:** <High-level summary of code review findings, test suite verification, and quality sign-off>
- **Review Comments:** <Detailed code comments, refactoring notes, or approval sign-off notes>
```

---

# 8. Dashboard HTML — Single Source of Truth & 5-Artifact Synchronization

The existing Dashboard HTML (`.ai-context/dashboard.html` / `gate-review-dashboard-design.html`) provides a centralized view of every spec and its PR review lifecycle.

### Single Source of Truth Roles
- **Dashboard HTML = Complete PR Review Record** (contains full review templates, history, criteria scores, comments, descriptions, and timestamps for Gate 1 and Gate 2).
- **PR Review Folder (`.ai-context/pr_reviews/`) = Dedicated Review Record Files**.
- **Spec (`.spec.md`) = Current Workflow / Review Status** (contains summary state, reviewer identity link, current status, and next workflow action).

### 5-Artifact Synchronization Protocol
When Gate 1 or Gate 2 is approved or rejected:
1. **Create Review Record File**: Save `.ai-context/pr_reviews/GATE1-<slug>-<timestamp>.md` or `GATE2-<slug>-<timestamp>.md`.
2. **Dashboard HTML Update**: Record complete PR review template data (criteria, comments, description, reviewer identity, timestamps, next action).
3. **Spec File Update**: Update `.ai-context/specs/<slug>.spec.md` with new status (`Approved`, `Changes Requested`, `Under Development`, `Ready for Release`), reviewer metadata, and link to the review record file.
4. **Status Board Update**: Sync `.ai-context/status.md` active spec matrix and daily execution log.
5. **Prompt History Update**: Append execution entry to `.ai-context/prompt_history.md` (STRICT APPEND-ONLY RULE).

---

# Stable Feature Slug & Traceability

Every feature receives a short, kebab-case feature slug when its Spec is created (e.g. `user-authentication`, `employee-transfer-request`).

The feature slug is the single stable traceability key across:
- Spec: `.ai-context/specs/<slug>.spec.md`
- Plan: `.ai-context/plans/<slug>.plan.md`
- Tasks: `.ai-context/tasks/<slug>.tasks.md`
- Test Cases: `.ai-context/test_cases/<slug>.test_cases.md`
- Git branch: `feature/<slug>`
- Status Board: `.ai-context/status.md`

## CRITICAL RULE — FLAT FILE STRUCTURE (NO SUBDIRECTORIES)
All artifact files inside `.ai-context/` MUST be created directly as **flat files** at the root of their respective category folder.

## CRITICAL RULE — PORTABLE REPOSITORY-RELATIVE PATHS (NO ABSOLUTE PATHS)
All path references, file links, and code paths recorded inside repository artifacts MUST be **relative to the repository root**.

## Traceability ID Conventions
- Acceptance Criteria: `<slug>.AC1`, `<slug>.AC2`
- API Contracts: `<slug>.API01`, `<slug>.API02`
- Unit Test Cases: `<slug>.UT01`, `<slug>.UT02`
- Tasks: `<slug>.T01`, `<slug>.T02`
