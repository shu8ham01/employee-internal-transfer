# INT AI-First Engineering Policy & Agent Governance

Welcome to **Employee Internal Transfer**. This repository is governed by the **INT AI-First Specification-Driven Delivery (SDD) v1.0** standard. All AI agents, contributors, and automated pipelines interacting with this codebase MUST strictly abide by the rules detailed in this document.

---

## 1. Skill & Governance Resolution Hierarchy (Vendor-Agnostic)

To guarantee that this repository is entirely self-contained, reproducible, and vendor-agnostic (compatible across Gemini, Claude, Cursor, Windsurf, Copilot, or custom LLM runners), governance and skills are resolved using the following strict priority:

1. **Priority 1 (Local Repository First)**: Always inspect the project workspace root for `AGENTS.md` and `.agents/skills/<skill_name>/SKILL.md`. If present, load and execute these repository-local definitions first.
2. **Priority 2 (Global Environment Second)**: If and ONLY if a requested skill or rule file is not present inside the local repository, fall back to global configurations (`~/.gemini/config/skills/`).

---

## 2. Project Authority & Core Architecture

- **Project Name:** Employee Internal Transfer
- **Project Type:** Full Stack (Frontend + Backend)
- **Architecture Style:** Modular Monolith (Microservice Ready)
- **Frontend Stack:** React (Vite) + Vanilla CSS
- **Backend Stack:** Node.js (Express)
- **Database & ORM:** PostgreSQL + Prisma ORM
- **Authentication:** JWT (JSON Web Tokens) with Refresh Tokens
- **Deployment Target:** Docker / Containerized Environment
- **Gate 1 Reviewer:** Tech Lead (`supratim.jetty@intglobal.com`)
- **Gate 2 Reviewer:** Tech Lead (`supratim.jetty@intglobal.com`)

---

## 3. Mandatory Engineering Lifecycle & Quality Gates

The engineering lifecycle follows a strict sequence governed by quality gates:

```text
1. Client BRD Ingestion (docs/) ──► .ai-context/BRD.md
       ↓
2. Gate 0: BRD PR Review & Approval (PM / Tech Lead)
       ↓
3. Feature Spec Authoring (.ai-context/specs/<feature-slug>.spec.md) [Non-blocking, parallel]
       ↓
4. Reviewer Detection & Decision Prompt (Review Pending Specs vs Work on Approved Specs)
       ↓
5. Gate 1: Spec PR Peer Review & Approval (PM / Tech Lead)
       ↓
6. Developer Work Selection ("Which approved spec would you like to start development on?")
       ↓
7. Pre-Development PR Review Check & Developer Feedback Briefing
       ↓
8. Implementation Plan (.plan.md) ──► Tasks Breakdown (.tasks.md) ──► Test Case Specs (.test_cases.md)
       ↓
9. Full TDD Cycle: RED (Failing tests in tests/) ──► GREEN (Code in src/) ──► 100% Suite Pass
       ↓
10. Gate 2: Code PR Review & Sign-Off (Tech Lead)
       ↓
11. Downstream Handoff (Release Management / Hotfix / Deployment)
```

### Critical Governance Rules:
1. **Gate 0 BRD Review Guard**: Feature spec drafting is **STRICTLY PROHIBITED** until `.ai-context/BRD.md` is reviewed and marked `Approved` via Gate 0.
2. **Non-Blocking Parallel Specs**: Once BRD Gate 0 is approved, multiple feature specs exist and progress independently. One spec waiting for review does NOT block authoring or reviewing another.
3. **Strict Gate 1 Rejection Block**: If a spec receives `Rejected` or `Changes Requested` at Gate 1, all planning, task generation, test creation, and implementation in `src/` are **STRICTLY BLOCKED**. The author must revise `.spec.md` and re-submit for Gate 1 approval.
4. **Git Email-Based Identity Validation**: Reviewer approvals at Gate 0, Gate 1, and Gate 2 require email matching (`git config user.email` matching the assigned reviewer email roster). In local-only development mode (before git push), reviewer identity is captured without blocking.
5. **Role Separation**: Being assigned as a PR reviewer does not prevent a user from contributing to approved specs; conversely, pulling or editing code confers no reviewer approval authority.
6. **5-Artifact Synchronization**: Every Gate 0, Gate 1, and Gate 2 review decision MUST be simultaneously synchronized across:
   - Dedicated Review Record (`.ai-context/pr_reviews/`)
   - Dashboard HTML (`.ai-context/dashboard.html` — Single Source of Truth)
   - Governing Spec (`.ai-context/specs/<slug>.spec.md`)
   - Project Status Board (`.ai-context/status.md`)
   - Prompt History (`.ai-context/prompt_history.md` — Append-Only)
7. **Strict Test-First Discipline (TDD)**: Failing automated tests (`tests/`) must be written and executed (RED) before writing implementation code (`src/`) to achieve GREEN.
8. **Portable Paths Only**: All artifact references, links, and code paths inside `.ai-context/` MUST be repository-relative (e.g. `src/backend/...`, `.ai-context/specs/...`). Never write absolute OS file system paths (`C:\...`).
9. **Change Request vs Bug Fix Distinction**: Trigger formal Change Request workflows (with Spec revisions and Gate 1 re-review) ONLY when a user prompt explicitly contains the keyword **"Change Request"** or **"CR"**. Prompts without these keywords are handled as Development-Related Fixes under the active approved spec.
10. **Zero AI Attribution**: Never commit code with comments or commit messages stating "Generated by AI" or referencing LLMs.
