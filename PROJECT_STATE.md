# ProjectPulse Current State

## Problem Statement
Software development teams frequently struggle with fragmented project management across multiple disconnected tools. Information siloing, inconsistent task ownership, untracked bugs, and opaque progress metrics result in communication overhead, delayed delivery cycles, and lack of stakeholder visibility.

## Solution Overview
ProjectPulse centralizes the software project lifecycle in a responsive MERN application providing:
- Project ownership and team membership assignment
- Task management across lifecycle states (TODO, IN_PROGRESS, COMPLETED)
- Kanban visualization with progress rollups
- Structured issue tracking with severity and priority indicators
- Milestone planning and deadline monitoring
- Aggregated executive analytics and workspace search

## Last Updated
2026-09-23

## Current Phase
Core MVP Verified & Ready for Agile Extensions (Sprints & Collaboration)

## Overall Status

| Module | Status | Notes |
| :--- | :--- | :--- |
| **Authentication** | COMPLETE | JWT with httpOnly cookie (`projectpulse_token`), bcryptjs hashing |
| **Projects** | COMPLETE | Full CRUD, member management, dynamic progress calculation |
| **Tasks** | COMPLETE | Full CRUD, project assignee validation, priority/status filtering |
| **Kanban** | COMPLETE | Interactive status boards across TODO, IN_PROGRESS, COMPLETED |
| **Issues** | COMPLETE | Issue tracking with severity, status, task link, and assignments |
| **Dashboard** | COMPLETE | Metric cards, active projects list, recent tasks, quick navigation |
| **Calendar** | COMPLETE | Visual task and milestone scheduling view by due dates |
| **Reports** | COMPLETE | Aggregated project, task status, priority, and issue metrics |
| **Search** | COMPLETE | Workspace-wide text search across projects, tasks, and issues |
| **Milestones** | COMPLETE | Nested project milestones with deadline and completion tracking |
| **Sprints** | NOT IMPLEMENTED | Planned next: Sprint cycles, backlog planning, sprint burn-down |
| **Comments** | NOT IMPLEMENTED | Planned: Threaded discussion on tasks and issues |
| **Activity Log** | NOT IMPLEMENTED | Planned: Entity audit logs and historical event stream |
| **Notifications** | NOT IMPLEMENTED | Planned: In-app notification center and unread counter badges |
| **Files** | NOT IMPLEMENTED | Planned: File and image attachment uploads for tasks and issues |
| **Teams** | PARTIAL | Frontend lists workspace users under `/team`; dedicated Team API not implemented |
| **Workload** | NOT IMPLEMENTED | Planned: Member capacity and task allocation dashboard |
| **Role/Permissions**| COMPLETE | `PROJECT_MANAGER` and `MEMBER` enforced on backend routes and UI |

## Backend Structure
`backend/`
- `server.js` — Express app configuration, security middleware, and route mounting
- `config/db.js` — MongoDB Atlas / Local connection setup via Mongoose
- `controllers/`
  - `authController.js` — User registration, login, session inspection (`/me`), logout
  - `projectController.js` — Project CRUD, member assignment, and progress calculation
  - `taskController.js` — Task CRUD, access control, and assignee validation
  - `issueController.js` — Issue lifecycle, task linkage, and manager assignment
  - `milestoneController.js` — Project milestones management
  - `reportController.js` — Aggregated workspace reports and metric summaries
  - `searchController.js` — Search aggregation across projects, tasks, issues, and users
- `middleware/`
  - `authMiddleware.js` — Cookie validation and session restoration (`protect`)
  - `roleMiddleware.js` — Role authorization guards (`authorizeRoles`)
  - `errorMiddleware.js` — 404 handler and central JSON error response formatter
- `models/`
  - `User.js`, `Project.js`, `Task.js`, `Issue.js`, `Milestone.js`
- `routes/`
  - `authRoutes.js`, `projectRoutes.js`, `taskRoutes.js`, `issueRoutes.js`, `milestoneRoutes.js`, `reportRoutes.js`, `searchRoutes.js`, `userRoutes.js`, `healthRoutes.js`

## Frontend Structure
`frontend/src/`
- `App.jsx` — Primary route declarations, ProtectedLayout, and fallback routing
- `components/`
  - `AppShell.jsx` — Main layout frame containing Topbar and Sidebar
  - `Sidebar.jsx` — Navigation menu, role-aware links, and workspace switcher
  - `Topbar.jsx` — Search trigger, quick-action navigation, user menu, and logout
  - `ProtectedRoute.jsx` — Authentication wrapper redirecting unauthenticated sessions
  - `UI.jsx` — Reusable primitive design system components (buttons, badges, modals, cards)
- `pages/`
  - `LandingPage.jsx` — Public landing page explaining product value
  - `AuthPages.jsx` — Login and registration view components
  - `DashboardPage.jsx` — Executive overview, metrics, and ongoing project summaries
  - `ProjectsPages.jsx` — Projects catalog, detail view, creation/edit form, member manager
  - `TasksPages.jsx` — Task list view, filterable table, creation/edit form, detail modal
  - `KanbanPage.jsx` — Columnar board with task cards organized by status
  - `IssuesPages.jsx` — Issue directory, severity filter, issue creation/edit, detail view
  - `CalendarPage.jsx` — Due-date timeline for tasks and project milestones
  - `PlanningPages.jsx` — Milestones and roadmap planning view
  - `CollaborationPages.jsx` — Reports analytics and workspace search results
  - `TeamPages.jsx` — Workspace user directory and profile page
- `context/AuthContext.jsx` — React context providing authenticated user state and auth actions
- `services/api.js` — Axios instance configured with `baseURL: http://localhost:5000` and credentials
- `index.css` — Custom CSS tokens, resets, utility classes, and component styling

## Authentication
- Mechanism: Signed JWT containing `userId` stored in an `httpOnly`, `sameSite: 'lax'` cookie named `projectpulse_token`.
- Cookie lifespan: 7 days.
- Endpoints:
  - `POST /api/auth/register` — Validates email, role, and length of password; creates user.
  - `POST /api/auth/login` — Verifies credentials with `bcrypt.compare`; issues cookie.
  - `POST /api/auth/logout` — Clears `projectpulse_token` cookie.
  - `GET /api/auth/me` — Authenticated inspection of current user object.

## Roles
- `PROJECT_MANAGER` — Can create/edit/delete projects, manage members, create tasks, assign issues, and manage milestones.
- `MEMBER` — Can view accessible projects, view tasks, update status of assigned tasks, and report issues.

## API Summary

### Auth (`/api/auth`)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Projects (`/api/projects`)
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/members`
- `DELETE /api/projects/:id/members/:memberId`

### Tasks (`/api/tasks`)
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

### Issues (`/api/issues`)
- `GET /api/issues`
- `POST /api/issues`
- `GET /api/issues/:id`
- `PUT /api/issues/:id`
- `PATCH /api/issues/:id`
- `DELETE /api/issues/:id`

### Milestones (`/api/projects/:projectId/milestones`)
- `GET /api/projects/:projectId/milestones`
- `POST /api/projects/:projectId/milestones`
- `GET /api/projects/:projectId/milestones/:id`
- `PUT /api/projects/:projectId/milestones/:id`
- `PATCH /api/projects/:projectId/milestones/:id`
- `DELETE /api/projects/:projectId/milestones/:id`

### Reports & Search & Users
- `GET /api/reports`
- `GET /api/search?q=:query`
- `GET /api/users`
- `GET /api/health`

## Frontend Routes
- `/` — Public marketing/landing page
- `/login` — User authentication login page
- `/register` — New account registration page
- `/dashboard` — Protected primary workspace dashboard
- `/projects` — List of accessible projects
- `/projects/new` — Create new project form (PM only)
- `/projects/:id` — Project overview, task list, member roster, milestones
- `/projects/:id/edit` — Edit project details (PM only)
- `/projects/:id/activity` — Project detail tab view
- `/tasks` — Filterable task directory
- `/tasks/new` — Create new task form (PM only)
- `/tasks/:id` — Task detail view
- `/tasks/:id/edit` — Edit task form
- `/kanban` — Interactive Kanban task board
- `/team` — Workspace member directory
- `/team/new` — Invite member view
- `/team/:id` — Member profile view
- `/issues` — Issue tracking registry
- `/issues/new` — Report new issue form
- `/issues/:id` — Issue detail view
- `/issues/:id/edit` — Edit issue form
- `/reports` — Project analytics and visual metric summaries
- `/search` — Universal workspace search
- `/profile` — Current user profile and settings

## Database Models
- `User` — Authentication credentials, role (`PROJECT_MANAGER` | `MEMBER`), avatar, and profile metadata.
- `Project` — Project name, description, start/deadline dates, manager (`User`), members (`[User]`), and status (`PLANNED` | `ACTIVE` | `COMPLETED`).
- `Task` — Title, description, project (`Project`), assignedTo (`User`), createdBy (`User`), status (`TODO` | `IN_PROGRESS` | `COMPLETED`), priority (`LOW` | `MEDIUM` | `HIGH`), dueDate.
- `Issue` — Title, description, project (`Project`), optional task (`Task`), reportedBy (`User`), assignedTo (`User`), severity (`LOW` | `MEDIUM` | `HIGH` | `CRITICAL`), status (`OPEN` | `IN_PROGRESS` | `RESOLVED` | `CLOSED`).
- `Milestone` — Name, description, project (`Project`), dueDate, status (`PLANNED` | `IN_PROGRESS` | `COMPLETED`), createdBy (`User`).

## Completed Features (What We Have Done Till Now)
1. **Core Backend Architecture**: Express 5 server with Mongoose ODM, helmet, CORS, cookie-parser, morgan, and centralized error handling.
2. **Robust Authentication**: JWT session handling stored via httpOnly cookies with bcryptjs password hashing.
3. **Role-Based Access Control**: Strict `PROJECT_MANAGER` and `MEMBER` privileges enforced on both routes and UI views.
4. **Project Lifecycle & Auto-Progress**: Projects compute dynamic completion percentage based on ratio of completed tasks.
5. **Task Management & Assignee Constraints**: Tasks require assignees to be verified members of the parent project.
6. **Issue Tracking & Task Linkage**: Issues support severity rankings, lifecycle status transitions, and optional task associations.
7. **Milestones Management**: Nested under projects to track key deadlines and deliverable goals.
8. **Reports & Cross-Entity Search**: Aggregated progress statistics and regex-based workspace search across all models.
9. **Responsive Frontend UI**: Clean light-themed custom CSS design system with cards, tables, modals, and navigation components.
10. **Realistic Demo Dataset**: Created and verified via REST APIs 16 users, 10 projects, 10 milestones, 28 tasks, and 10 issues using `scripts/create-demo-data.mjs` with full idempotency.

## In Progress
- Architecture preparation for Sprints module (sprint backlog, active sprint status, sprint dates).

## Not Implemented (What Should We Do Next)
- **Sprints**: Sprint backlog management, sprint lifecycle (`PLANNED`, `ACTIVE`, `COMPLETED`), burn-down tracking.
- **Comments System**: Collaborative discussion threads on tasks and issues.
- **Activity Log & Audit Trail**: Real-time event logging of project changes, task moves, and issue status transitions.
- **Notifications**: In-app notifications with badge counts for assignment mentions and deadline alerts.
- **Team Management API**: Dedicated team model with manager, department, and team memberships.

## Known Problems
- None. Backend syntax, health check, and frontend production builds pass with zero errors.

## Last Verified
- **Frontend Build**: Passed (`vite build` succeeded with zero errors, producing optimized assets).
- **Backend Syntax**: Passed (`node --check server.js` validated clean).
- **API Health**: Passed (`GET /api/health` returns `{ success: true, message: "ProjectPulse API is running" }`).
- **REST Demo Seeding & Verification**: 100% verified (all 16 users, 10 projects, 28 tasks, 10 milestones, 10 issues verified via GET endpoints).
- **Verification Date**: 2026-09-23

## Current Task
Implement Sprint backend and frontend (models, routes, controllers, and UI) to support agile sprint cycles and backlog planning.

## Next Steps
1. Create `Sprint` model, controller, and routes on backend with project association and task linkage.
2. Add Sprint UI page and sprint selector on Kanban/Tasks pages.
3. Implement Comments API and UI component on Task and Issue detail pages.
4. Implement Activity Log tracking for project and task updates.
5. Introduce in-app notifications for task assignments and status updates.

## Important Constraints
- Do not migrate custom CSS to Tailwind unless explicitly requested.
- Do not invent unsupported roles (only `PROJECT_MANAGER` and `MEMBER` are valid).
- Do not bypass REST APIs when manipulating data; never insert directly into MongoDB.
- Do not modify existing authentication behavior unnecessarily.
- Never expose or commit secrets (`.env` or production credentials).
