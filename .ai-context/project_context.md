# Project Context: Employee Internal Transfer

## 1. Project Overview
- **Project Name:** Employee Internal Transfer
- **Project Slug:** employee-internal-transfer
- **Project Type:** Full Stack (Frontend + Backend)
- **Architecture Pattern:** Modular Monolith (Microservice Ready)
- **Status:** Initialized (Baseline Setup Complete)
- **Governing Standard:** INT AI-First Specification-Driven Delivery (SDD) v1.0

---

## 2. Technology Stack & Frameworks

| Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | React (Vite) | Fast modern SPA architecture with component-based modular design |
| **Frontend Styling** | Vanilla CSS | Bespoke, premium responsive design system (dark/light tokens, responsive layout) |
| **Backend Framework** | Node.js (Express) | Modular RESTful API services structured for microservice extractability |
| **Database & ORM** | PostgreSQL + Prisma ORM | Relational data model with type-safe migrations and repository pattern |
| **Authentication** | JWT (JSON Web Tokens) | Access tokens (short-lived) + Refresh tokens (httpOnly cookie) |
| **Deployment Target** | Docker | Containerized multi-service configuration (Frontend, Backend, PostgreSQL) |

---

## 3. Quality Gate Reviewers & Authority Roster

Strict Git email validation is enforced for PR Gate review actions. Authenticated Git email (`git config user.email`) must match the assigned reviewer roster:

| Gate | Stage | Assigned Role | Assigned Reviewer | Reviewer Email |
|---|---|---|---|---|
| **Gate 0** | BRD Baseline PR Review | PM / Tech Lead | Tech Lead | `supratim.jetty@intglobal.com` |
| **Gate 1** | Feature Spec Peer Review | PM / Tech Lead | Tech Lead | `supratim.jetty@intglobal.com` |
| **Gate 2** | Code PR Review & Sign-Off | Senior Dev / Tech Lead | Tech Lead | `supratim.jetty@intglobal.com` |

---

## 4. Requirement Baseline Status
- **Client BRD Source:** Pending upload to `docs/`
- **Authoritative BRD:** `.ai-context/BRD.md` (Awaiting client document ingestion)
- **Gate 0 Approval Status:** Pending BRD Ingestion
