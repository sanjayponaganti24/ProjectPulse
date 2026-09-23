# ProjectPulse AI Context

## Project
ProjectPulse is a MERN-based agile project and team collaboration platform.

### Problem Statement
Modern software engineering teams frequently suffer from fragmented tooling, siloed communication, and poor progress visibility across disparate apps for task tracking, bug reporting, roadmaps, and executive reporting.

### Solution
ProjectPulse provides a unified, lightweight, high-performance collaboration suite connecting:
Project → Members → Tasks → Progress → Issues → Milestones → Reports

## Tech Stack

Frontend:
- React 19
- Vite
- React Router (v7)
- Custom CSS Design System (clean, modular vanilla CSS)
- Axios (`withCredentials: true`)
- Lucide React (icons)

Backend:
- Node.js (ES Modules)
- Express 5
- MongoDB & Mongoose
- JWT (`jsonwebtoken`)
- Cookie-parser
- bcryptjs (cost factor 12)
- Express-validator

## Architecture

Frontend (`frontend/`):
- `src/App.jsx`: Main routing table and layout wrappers
- `src/components/`: Shared UI components (`AppShell`, `Sidebar`, `Topbar`, `UI`, `ProtectedRoute`)
- `src/pages/`: Feature view modules (`DashboardPage`, `ProjectsPages`, `TasksPages`, `KanbanPage`, `IssuesPages`, etc.)
- `src/context/`: Global states (`AuthContext`)
- `src/services/`: API client (`api.js`)
- `src/index.css`: Comprehensive custom CSS design system

Backend (`backend/`):
- `server.js`: Server bootstrap, middleware, and route mounting
- `config/`: Database connection (`db.js`)
- `models/`: Mongoose schemas (`User`, `Project`, `Task`, `Issue`, `Milestone`)
- `controllers/`: Request handling and business logic
- `routes/`: Express routers and request validation
- `middleware/`: Authentication (`protect`), role checks (`authorizeRoles`), error handlers

Important:
The project uses a custom CSS design system. DO NOT migrate to Tailwind unless explicitly requested.

## Current Authentication
- Mechanism: JWT stored in an `httpOnly` cookie (`projectpulse_token`).
- Token verification performed via `middleware/authMiddleware.js`.
- Core endpoints:
  - `POST /api/auth/register` (creates user; does not auto-set cookie)
  - `POST /api/auth/login` (sets `projectpulse_token` cookie)
  - `POST /api/auth/logout` (clears cookie)
  - `GET /api/auth/me` (returns current user profile)

## Current Roles
Strictly enforced by `User.js` enum and `middleware/roleMiddleware.js`:
- `PROJECT_MANAGER` (Full project, task, milestone, and issue management)
- `MEMBER` (Can view assigned projects, update status of assigned tasks, log issues)

DO NOT invent additional roles (e.g., ADMIN, LEAD) without explicit instructions and schema updates.

## What Has Been Done Till Now
- Implemented complete backend REST API for Auth, Projects, Tasks, Issues, Milestones, Reports, Search, and Users.
- Implemented React frontend with responsive layout, Dashboard, Projects CRUD, Tasks CRUD, Kanban board, Issues tracker, Milestones view, Reports analytics, and Search.
- Seeded realistic, idempotent demo data through REST APIs (16 users, 10 projects, 28 tasks, 10 milestones, 10 issues).

## What Should We Do Next
- **Primary**: Implement Sprints feature (Backend model, controller, routes + Frontend sprint backlog & active sprint view).
- **Secondary**: Implement task/issue comments, activity log/audit trails, and notification badges.

## UI Rules
- Clean premium SaaS design language with light interface.
- White card surfaces, subtle borders (`#e2e8f0`), soft shadows, rounded corners (`8px`-`12px`).
- Modern typography, restrained blue/indigo primary accents (`#4f46e5` / `#2563eb`), semantic status colors.
- Responsive layout with compact sidebar and top navigation (search, notifications, avatar).

## Coding Rules
1. Inspect before modifying.
2. Reuse existing architecture, models, and endpoints.
3. Do not rewrite working features or migrate CSS architecture.
4. Do not introduce unnecessary third-party dependencies.
5. Preserve existing authentication and REST API contracts.
6. Verify changes (build & backend syntax) before reporting completion.
7. Update `PROJECT_STATE.md` and `CHANGELOG.md` after meaningful changes.
8. Never expose secrets or print `.env` contents.

## Token Efficiency Rules
- Read `AI_CONTEXT.md` and `PROJECT_STATE.md` first.
- Inspect only the files relevant to the specific task.
- Do NOT scan `node_modules/`, `dist/`, or lock files.
- Prefer targeted grep/file searches and small, focused edits.
