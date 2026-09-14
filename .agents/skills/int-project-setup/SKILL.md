---
name: int-project-setup
description: Initialize a new software project using the exact INT AI-First standard Control Plane, project-specific AI context, technology-aware execution structure, and foundational repository baseline.
---
# INT AI-First Project Setup

## Purpose

Initialize a new software project according to the INT AI-First development architecture.

This skill is responsible for project initialization and baseline setup only. Do not implement business functionality or create business modules during initial setup unless explicitly requested.

The INT Control Plane is an organizational standard and MUST remain unchanged.

---

# MANDATORY STEP 1 — Technology & Architecture Discovery Gate

Before generating execution layer folders (`src/`, `tests/`) or starting implementation, the agent MUST confirm all foundational technology and architecture parameters.

If any of the following items are ambiguous or not explicitly specified in the prompt or provided BRD, **the agent MUST ask and clarify with the user before proceeding**:

1. **Project Name & Type**: Full Stack, Frontend Only, Backend Only, or Mobile.
2. **Architecture Style (MANDATORY FOR ALL PROJECT TYPES)**: Must explicitly ask user to select architecture pattern:
   - **Backend Only / Full Stack Options**: Monolithic vs Modular Monolith (Microservice Ready) vs Microservices vs Clean Architecture / Layered Architecture.
   - **Frontend Only Options**: Modular Component Architecture vs Feature-Sliced Architecture (FSD) vs Micro-Frontends vs Monolithic SPA.
3. **Frontend Technology & Styling** (if Frontend or Full Stack): (e.g., React / Next.js / Vite + Vanilla CSS or Tailwind).
4. **Backend Technology & Framework** (if Backend or Full Stack): (e.g., Node.js Express / Fastify / NestJS / Python FastAPI / Go).
5. **Database & Data Access / ORM Layer** (if Backend or Full Stack): (e.g., PostgreSQL + Sequelize / MySQL / MongoDB + Prisma / TypeORM / Drizzle / Mongoose).
6. **Authentication & Security Strategy**: (e.g., JWT / OAuth2 / NextAuth / Session / None).
7. **Deployment Target**: (e.g., Docker / AWS / Vercel / Kubernetes / Unknown).
8. **Gate 1 Reviewer(s)**: Assigned Project Manager(s) / Tech Lead(s) responsible for Spec Peer Reviews (can be single or multiple individuals, specified by Name/Email/User ID).
9. **Gate 2 Reviewer(s)**: Assigned Technical Lead(s) / Senior Developer(s) responsible for Code Reviews (can be single or multiple individuals, specified by Name/Email/User ID).

---

# CRITICAL RULE — INT CONTROL PLANE (DYNAMIC COPY & SYNC)

The following directory is the authoritative source for the INT Control Plane:
`skills/int-project-setup/resources/INT-Control-Plane/.agent/`

You MUST dynamically copy the entire contents of this directory into the project root:
`.agent/`

---

# MANDATORY PROJECT VENDOR-AGNOSTIC GOVERNANCE & LOCAL SKILLS (`AGENTS.md` & `.agents/skills/`)

To ensure the project repository is completely self-contained and vendor-agnostic (independent of any specific AI tool or provider such as Gemini, Claude, Cursor, Windsurf, or Copilot):

1. **Auto-Generate `AGENTS.md` in Workspace Root**:
   During initial project setup, the agent MUST write **`AGENTS.md`** into the project workspace root.

2. **Auto-Copy Project-Level Skills into `.agents/skills/`**:
   During project setup, the agent MUST create **`.agents/skills/`** in the project workspace root and dynamically copy all project SDD sub-skills into it:
   - `.agents/skills/int-project-setup/SKILL.md`
   - `.agents/skills/int-sdd-lifecycle/SKILL.md`
   - `.agents/skills/int-brd-ingestion/SKILL.md`
   - `.agents/skills/int-incident-management/SKILL.md`
   - `.agents/skills/int-hotfix-management/SKILL.md`
   - `.agents/skills/int-release-management/SKILL.md`
   - `.agents/skills/int-session-continuation/SKILL.md`

3. **Mandatory Skill & Governance Resolution Hierarchy**:
   After project setup is complete, whenever any skill or governance rule is executed in the workspace, the system MUST enforce the following loading priority:
   - **Priority 1 (Local Repository First)**: Load local project skills (`.agents/skills/<skill_name>/SKILL.md`) first.
   - **Priority 2 (Global Fallback Second)**: Fall back to global skills (`~/.gemini/config/skills/<skill_name>/SKILL.md`) only if not present locally.

---

# MANDATORY AUTOMATED `.gitignore` CREATION

During initial project setup, the agent MUST automatically create **`.gitignore`** in the project workspace root.

---

# Project Knowledge Base

Create the project-specific AI context directory structure:

```text
.ai-context/
├── constitution.md
├── project_context.md
├── architecture.md
├── BRD.md
├── brd-change-log.md
├── status.md
├── prompt_history.md
├── specs/
├── plans/
├── tasks/
├── test_cases/
├── pr_reviews/
├── decisions/
├── incidents/
├── hotfixes/
├── releases/
├── change_requests/
└── templates/
```
