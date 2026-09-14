# Project Constitution — Employee Internal Transfer

**Owner:** Tech Lead (`supratim.jetty@intglobal.com`) · **Adopted:** 2026-09-13 · **Version:** v1.0

Governs every feature this repository will ever build. Written once, amended rarely, and amended only through the same review rigour as a spec. Each spec operates inside this document and never restates it.

Standard in force: **INT Engineering Guidelines — Specification-Driven Delivery (SDD) v1.0**

---

## Governance & Roles

| Role | Person | Email | Responsibility |
|---|---|---|---|
| Technical Lead / Architect | Tech Lead | `supratim.jetty@intglobal.com` | Owns this constitution; default Gate 0, Gate 1, and Gate 2 reviewer |
| Senior Software Engineer | Developer | *Assigned per feature* | Default Spec Author for feature and retro-specs |
| Project Manager | Tech Lead | `supratim.jetty@intglobal.com` | Owns BRD baseline and product-side sign-off |

### Core Governance Rules:
- **Author ≠ Reviewer**: Gate 1 reviewer is never the spec author.
- **Git Identity Verification**: All Gate approvals require `git config user.email` matching the assigned reviewer email roster.
- **Gate 1 SLA**: Same working day for specs with ≤ 5 Acceptance Criteria; 48 hours maximum.
- **Strict Spec Generation Block**: Feature spec authoring is strictly blocked until Gate 0 BRD PR Review is approved.

---

## Testing Discipline

- Test-first (TDD RED ➔ GREEN) is mandatory for every API endpoint, data mutation, and state-changing operation.
- **Framework & Location**: Tests live in `tests/frontend/` and `tests/backend/`, mirroring the `src/` modular hierarchy.
- **Coverage Floors (Measured on Changed Files Only)**:
  | Tier | Floor | Domain Contexts |
  |---|---|---|
  | **Critical** (auth, transfer approval, security, audit) | **80%** | `auth`, `rbac`, `approvals`, `audit-logs` |
  | **Business** (transfer requests, employee profiles, department routing) | **70%** | `transfers`, `employees`, `departments`, `jobs` |
  | **Utility** (lookups, formatting, presentation helpers) | **60%** | `lookups`, `notifications`, `helpers` |
- **Verification Commands**: Linting (zero warnings), type checking, and test suites must pass before any task is marked complete.

---

## Security Posture

- **No PII in Logs**: Employee personal identifiable information (names, emails, phone numbers, compensation) must be masked in log streams.
- **Secrets Management**: Supplied strictly via environment variables (`.env`) and validated at startup. Secrets must NEVER be committed to Git.
- **JWT Security**: Distinct secrets for access tokens (15m TTL) and refresh tokens (httpOnly cookie, 7d TTL). Bcrypt cost 12 minimum.
- **Role-Based Access Control (RBAC)**: All endpoints must enforce role checks (Employee, Manager, HR Admin).
- **Hardening**: HTTPS only, `helmet` security headers, strict CORS allowlist, payload sanitization.

---

## Architectural Constraints

- **Approved Datastores**: PostgreSQL (Primary system of record). Introduction of any secondary datastore requires an approved ADR.
- **Modular Monolith Default**: Single process execution for local development. Modules must maintain clean service boundaries for future extraction.
- **Non-Negotiable Layering**: Business logic in `services/`, HTTP mapping in `controllers/`, DB queries in `repositories/`.
- **Database Migrations**: All schema modifications must occur through versioned Prisma migrations.

---

## Non-Functional Baselines

- **p95 API Latency Targets**:
  | Tier | Target | Scope |
  |---|---|---|
  | **Tier 1 (Critical)** | **< 300 ms** | Auth, session validation, transfer status lookups |
  | **Tier 2 (Standard CRUD)** | **< 500 ms** | Transfer request submissions, employee lookups |
  | **Tier 3 (Reports / Exports)** | **< 2 s** | Transfer analytics, audit reports, CSV exports |
- **Availability Target**: 99.5% baseline uptime.

---

## Versioning Rules

- **API Path Versioning**: Mounted under `/api/v1`. Breaking changes require a new path version (`/api/v2`) and an approved ADR.
- **Semver Tagging**: Releases documented in `.ai-context/releases/RELEASE-vX.Y.Z.md`.
