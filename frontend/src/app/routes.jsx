import { Route, Routes } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import { AuthPage } from "../pages/AuthPages.jsx";
import CalendarPage from "../pages/CalendarPage.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import NotificationsPage from "../pages/NotificationsPage.jsx";
import { MilestonesPage, SprintsPage } from "../pages/PlanningPages.jsx";

function NotFoundPage() {
  return <div className="not-found">Page not found</div>;
}

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppShell />
    </ProtectedRoute>
  );
}

export default function AppRoutes({ pages }) {
  const {
    ProjectsPage,
    ProjectForm,
    ProjectDetailPage,
    DashboardPage,
    TasksPage,
    TaskForm,
    TaskDetailPage,
    KanbanPage,
    TeamPage,
    FormPage,
    IssuesPage,
    IssueForm,
    IssueDetailPage,
    ReportsPage,
    SearchPage,
    ProfilePage,
  } = pages;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/new" element={<ProjectForm />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/projects/:id/edit" element={<ProjectForm edit />} />
        <Route path="/projects/:id/activity" element={<ProjectDetailPage />} />
        <Route path="/projects/:id/milestones" element={<MilestonesPage />} />
        <Route path="/projects/:id/sprints" element={<SprintsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/new" element={<TaskForm />} />
        <Route path="/tasks/:id" element={<TaskDetailPage />} />
        <Route path="/tasks/:id/edit" element={<TaskForm edit />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route
          path="/team/new"
          element={
            <FormPage
              title="Invite a member"
              description="Bring another collaborator into your workspace."
            />
          }
        />
        <Route path="/team/:id" element={<TeamPage />} />
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/issues/new" element={<IssueForm />} />
        <Route path="/issues/:id" element={<IssueDetailPage />} />
        <Route path="/issues/:id/edit" element={<IssueForm edit />} />
        <Route path="/milestones" element={<MilestonesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
