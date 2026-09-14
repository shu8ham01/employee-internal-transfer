# Application Architecture: Employee Internal Transfer

## 1. Selected Architecture Pattern
**Modular Monolith (Microservice Ready)**

All business capabilities run within unified frontend and backend application processes during development and initial deployment, while strictly preserving bounded contexts. Every business module maintains discrete folder boundaries, isolated data access logic, and well-defined API contracts so that any module may be extracted into an autonomous microservice without architectural refactoring.

---

## 2. Structural Layering & Directory Design

### A. Full Stack Directory Layout
```text
src/
├── frontend/
│   ├── app/                # Application entry points, root routes, and global providers
│   ├── modules/            # Domain-bounded frontend modules (instantiated post Gate 1)
│   └── shared/             # Reusable UI components, design tokens, hooks, API client
└── backend/
    ├── app/                # Express server setup, middleware chain, router orchestration
    ├── config/             # Environment, database, and authentication configurations
    ├── modules/            # Domain-bounded backend modules (instantiated post Gate 1)
    └── shared/             # Database client, logger, standard errors, utility helpers
tests/
├── frontend/
│   ├── modules/            # Spec-derived frontend unit & integration tests
│   └── shared/             # Shared component and utility test suites
└── backend/
    ├── config/             # Configuration and database connectivity tests
    ├── modules/            # Spec-derived backend unit & service tests
    └── shared/             # Utility and middleware test suites
docs/                       # Ingested client BRD documents and architectural diagrams
```

---

## 3. Backend Architectural Baseline (Express + Prisma)

### A. Modular Component Structure (Post Gate 1)
Once a domain module is approved via Gate 1, it will adhere to the following clean layering:
```text
src/backend/modules/<module-name>/
├── controllers/            # HTTP request/response handlers, status codes
├── services/               # Core business logic and transaction management
├── repositories/           # Prisma ORM data access queries and mutations
├── models/                 # TypeScript types and domain entities
├── validators/             # Request payload schema validation (e.g., Zod)
└── routes/                 # Express router mounting
```

### B. Module Isolation & Microservice Readiness
1. **Zero Cross-Module Direct DB Mutations**: Module A must never execute direct write queries against Module B's internal database tables. All cross-module operations must go through service interfaces.
2. **Explicit Interfaces**: Modules communicate via exported TypeScript service functions or internal event dispatchers.
3. **Shared Infrastructure**: Cross-cutting concerns (logging, authentication verification, global error handling) live exclusively under `src/backend/shared/`.

---

## 4. Frontend Architectural Baseline (React + Vite)

### A. Modular Component Structure (Post Gate 1)
```text
src/frontend/modules/<module-name>/
├── components/             # Domain-specific UI widgets and cards
├── pages/                  # Route view components
├── hooks/                  # Module-scoped custom hooks and state handlers
├── services/               # API call wrappers and data mappers
└── utils/                  # Domain-specific formatting and calculations
```

### B. Shared Foundation
- Design tokens, global CSS variables, button primitives, form controls, and dialog layouts reside in `src/frontend/shared/components/`.
- Clean fetch client with automatic JWT bearer token attachment and refresh logic resides in `src/frontend/shared/services/`.

---

## 5. Security & Authentication Architecture
- **Protocol:** JWT (JSON Web Tokens) with Refresh Tokens.
- **Access Tokens:** Short-lived (15 minutes), passed via `Authorization: Bearer <token>` header.
- **Refresh Tokens:** Long-lived (7 days), stored securely in `httpOnly`, `SameSite=Strict` cookies.
- **Password Hashing:** Bcrypt with minimum 12 salt rounds.
- **Data Protection:** No PII logged; strict payload validation before hitting service layers.

---

## 6. Containerization & Deployment Target
- **Runtime:** Node.js LTS container.
- **Database:** PostgreSQL 16 Alpine container.
- **Docker Compose:** Multi-container configuration linking `frontend`, `backend`, and `postgres` networks.
