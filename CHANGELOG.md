# ProjectPulse Changelog

## 2026-09-23

### Added
- **AI Memory System**: Created lightweight project context files (`AI_CONTEXT.md`, `PROJECT_STATE.md`, `CHANGELOG.md`) to guide future AI agents with minimal token consumption.
- **REST Demo Data Generator**: Developed `scripts/create-demo-data.mjs` using native Node `fetch` to populate realistic demo data strictly via REST API endpoints.
- **Realistic Seed Dataset**:
  - 16 Users (4 `PROJECT_MANAGER` accounts + 12 `MEMBER` accounts) using common demo password `Sanju@03`.
  - 10 Projects across managers with member rosters, status variations, and auto progress calculation.
  - 10 Project Milestones distributed across projects.
  - 28 Tasks with assigned project members, priorities, and status distributions.
  - 10 Issues with severity levels, status tracking, and task linkage.

### Changed
- Verified and enforced idempotent REST data synchronization to safely reuse existing records without duplicating MongoDB documents.

### Verified
- **Frontend Production Build**: `npm run build` in `frontend/` completed successfully with zero errors.
- **Backend Syntax**: `node --check server.js` in `backend/` executed with zero errors.
- **API Endpoints**: Verified `GET /api/health`, `GET /api/users`, `GET /api/projects`, `GET /api/tasks`, `GET /api/issues`, `GET /api/reports`, and `GET /api/search`.
- **Frontend Integration**: Authenticated into `http://localhost:5173/login` with demo PM credentials and confirmed live dashboard rendering with charts, task boards, and project metrics.

### Blocked
- **Team Management API**: Backend currently does not implement a dedicated `Team` model or `/api/teams` route; workspace members are listed from the user directory.

### Next
- Implement Sprint model, controllers, and routes in `backend/` for agile sprint cycles.
- Build Sprint backlog and active sprint board in `frontend/`.
