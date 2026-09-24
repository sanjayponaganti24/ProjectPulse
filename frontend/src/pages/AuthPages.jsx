import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ROLE_LABELS } from "../components/Sidebar.jsx";
import { Button } from "../components/UI.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const ROLE_DESCRIPTIONS = {
  ORGANISATION_ADMIN:
    "Full control to manage users, teams, projects, roles, and organisation settings.",
  PROJECT_MANAGER:
    "Plan projects, manage milestones, sprints, assignments, and reports.",
  TEAM_LEAD:
    "Manage team workload, review tasks, resolve blockers, and coordinate releases.",
  MEMBER:
    "Work on assigned tasks, update progress, comment, and report issues.",
  STAKEHOLDER:
    "View authorized project progress, milestones, risks, and reports (Read-only).",
};

export function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { login, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "MEMBER",
    organisationName: "ProjectPulse Workspace",
  });
  const [adminExists, setAdminExists] = useState(null);
  const [registrationRoles, setRegistrationRoles] = useState([]);
  const [orgInfo, setOrgInfo] = useState({ name: "ProjectPulse Workspace" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLogin) {
      setAdminExists(true);
      return;
    }

    setAdminExists(null);
    api
      .get("/api/auth/roles")
      .then((res) => {
        const exists = !!res.data.adminExists;
        setAdminExists(exists);
        if (res.data.organisation) {
          setOrgInfo(res.data.organisation);
        }
        const roles = res.data.registrationRoles || [];
        setRegistrationRoles(roles);
        if (!exists) {
          setForm((prev) => ({ ...prev, role: "ORGANISATION_ADMIN" }));
        } else if (roles.length > 0) {
          setForm((prev) => ({
            ...prev,
            role: roles.some((r) => r.role === prev.role)
              ? prev.role
              : roles[0].role,
          }));
        }
      })
      .catch(() => {
        setAdminExists(true);
        setRegistrationRoles([
          { role: "MEMBER", name: "Developer / Member" },
          { role: "PROJECT_MANAGER", name: "Project Manager" },
          { role: "TEAM_LEAD", name: "Team Lead" },
          { role: "STAKEHOLDER", name: "Stakeholder" },
        ]);
      });
  }, [isLogin]);

  const update = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (
      !form.email ||
      !form.password ||
      (!isLogin && (!form.name || !form.confirmPassword))
    ) {
      return setError("Please complete all required fields.");
    }
    if (!isLogin && form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (!isLogin && form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setSubmitting(true);
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
        navigate("/dashboard");
      } else {
        const isFirstUser = adminExists === false;
        const payload = {
          name: form.name,
          email: form.email,
          password: form.password,
          role: isFirstUser ? "ORGANISATION_ADMIN" : form.role,
          organisationName: isFirstUser ? form.organisationName : undefined,
        };
        const res = await register(payload);
        if (isFirstUser || res?.user?.role === "ORGANISATION_ADMIN") {
          navigate("/dashboard");
        } else {
          navigate("/login", { state: { registered: true } });
        }
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          (isLogin
            ? "Invalid email or password."
            : "Unable to create your account. Please try again."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const registeredNotice = location.state?.registered;
  const isFirstUserSetup = !isLogin && adminExists === false;
  const isRegisterReady = isLogin || adminExists !== null;

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Link to="/" className="brand">
          <span className="brand-mark">P</span>
          <span>
            Project<span className="brand-accent">Pulse</span>
          </span>
        </Link>
        <div className="auth-message">
          <div className="eyebrow">Your work, in focus</div>
          <h1>
            {isLogin
              ? "Welcome back to your workspace."
              : isFirstUserSetup
                ? "Setup your organisation."
                : "Build momentum with your team."}
          </h1>
          <p>
            {isLogin
              ? "Plan clearly, collaborate simply, and keep every deadline visible."
              : isFirstUserSetup
                ? "Initialize the workspace, configure your organisation, and begin as Organisation Admin."
                : `Join ${orgInfo.name || "ProjectPulse"} to collaborate on active initiatives.`}
          </p>
          <div className="auth-quote">
            <CheckCircle2 size={18} />
            <span>Everything your team needs to move forward.</span>
          </div>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <div className="auth-heading">
            <h2>
              {isLogin
                ? "Sign in"
                : isFirstUserSetup
                  ? "Create organisation"
                  : "Create your account"}
            </h2>
            <p>
              {isLogin
                ? "Enter your credentials to continue."
                : isFirstUserSetup
                  ? "First user onboarding: create workspace & organisation admin."
                  : "Join your team workspace in seconds."}
            </p>
          </div>

          {registeredNotice && !error && (
            <div
              style={{
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <CheckCircle2 size={16} />
              <span>
                Account created successfully! Please sign in with your
                credentials.
              </span>
            </div>
          )}

          {isFirstUserSetup && (
            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#1e40af",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              <strong>First-Time Setup:</strong> You are the first user for this
              instance and will become the{" "}
              <strong>Organisation Admin</strong>.
            </div>
          )}

          {!isRegisterReady && !isLogin ? (
            <p style={{ color: "#64748b", fontSize: 13 }}>Loading setup…</p>
          ) : (
            <form onSubmit={submit}>
              {isFirstUserSetup && (
                <label>
                  Organisation / Workspace name
                  <input
                    name="organisationName"
                    value={form.organisationName}
                    onChange={update}
                    placeholder="ProjectPulse Workspace"
                    required
                  />
                </label>
              )}

              {!isLogin && (
                <label>
                  Full name
                  <input
                    name="name"
                    value={form.name}
                    onChange={update}
                    placeholder="Your full name"
                    autoComplete="name"
                    required
                  />
                </label>
              )}

              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Password
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={update}
                  placeholder="At least 6 characters"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                />
              </label>

              {!isLogin && (
                <>
                  <label>
                    Confirm password
                    <input
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={update}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      required
                    />
                  </label>

                  {adminExists ? (
                    <>
                      <label>
                        Workspace role
                        <select name="role" value={form.role} onChange={update}>
                          {registrationRoles.map((entry) => (
                            <option key={entry.role} value={entry.role}>
                              {entry.name || ROLE_LABELS[entry.role] || entry.role}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          padding: "10px 12px",
                          fontSize: 12,
                          color: "#475569",
                          marginBottom: 14,
                        }}
                      >
                        <strong>
                          {ROLE_LABELS[form.role] || form.role}:
                        </strong>{" "}
                        {ROLE_DESCRIPTIONS[form.role]}
                        <div
                          style={{
                            marginTop: 4,
                            color: "#94a3b8",
                            fontSize: 11,
                          }}
                        >
                          Organisation Admin accounts are assigned by workspace
                          administrators.
                        </div>
                      </div>
                    </>
                  ) : (
                    adminExists === false && (
                      <div
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          padding: "10px 12px",
                          fontSize: 12,
                          color: "#475569",
                          marginBottom: 14,
                        }}
                      >
                        <strong>Role: Organisation Admin</strong>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: 11,
                            color: "#64748b",
                          }}
                        >
                          {ROLE_DESCRIPTIONS.ORGANISATION_ADMIN}
                        </p>
                      </div>
                    )
                  )}
                </>
              )}

              {error && (
                <div className="form-error">
                  <XCircle size={16} />
                  {error}
                </div>
              )}

              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Please wait..."
                  : isLogin
                    ? "Sign in"
                    : isFirstUserSetup
                      ? "Create workspace & admin"
                      : "Create account"}{" "}
                <ArrowRight size={16} />
              </Button>
            </form>
          )}

          <p className="auth-switch">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link to={isLogin ? "/register" : "/login"}>
              {isLogin ? "Create one" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
