import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ROLE_LABELS } from "../components/Sidebar.jsx";
import { Button } from "../components/UI.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const REGISTRATION_ROLES = [
  "PROJECT_MANAGER",
  "TEAM_LEAD",
  "MEMBER",
  "STAKEHOLDER",
];

const ROLE_DESCRIPTIONS = {
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
  });

  const [registrationRoles, setRegistrationRoles] = useState(
    REGISTRATION_ROLES.map((role) => ({
      role,
      name: ROLE_LABELS[role] || role,
    })),
  );

  const [orgInfo, setOrgInfo] = useState({
    name: "ProjectPulse Workspace",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(!isLogin);

  useEffect(() => {
    if (isLogin) {
      setLoadingRoles(false);
      return;
    }

    let mounted = true;

    async function loadRegistrationInfo() {
      try {
        const response = await api.get("/auth/roles");

        if (!mounted) return;

        const roles = Array.isArray(response.data?.registrationRoles)
          ? response.data.registrationRoles.filter((entry) =>
              REGISTRATION_ROLES.includes(entry.role),
            )
          : [];

        if (response.data?.organisation) {
          setOrgInfo(response.data.organisation);
        }

        if (roles.length > 0) {
          setRegistrationRoles(roles);

          setForm((previous) => ({
            ...previous,
            role: roles.some((entry) => entry.role === previous.role)
              ? previous.role
              : roles[0].role,
          }));
        }
      } catch (requestError) {
        if (!mounted) return;

        setError(
          requestError.response?.data?.message ||
            "Unable to load workspace registration information.",
        );
      } finally {
        if (mounted) {
          setLoadingRoles(false);
        }
      }
    }

    loadRegistrationInfo();

    return () => {
      mounted = false;
    };
  }, [isLogin]);

  function update(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (
      !form.email ||
      !form.password ||
      (!isLogin && (!form.name || !form.confirmPassword))
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (!isLogin && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isLogin && form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!isLogin && !REGISTRATION_ROLES.includes(form.role)) {
      setError("Please select a valid workspace role.");
      return;
    }

    setSubmitting(true);

    try {
      if (isLogin) {
        await login({
          email: form.email,
          password: form.password,
        });

        navigate("/dashboard");
        return;
      }

      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      navigate("/login", {
        state: {
          registered: true,
          email: form.email,
        },
      });
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
              : "Build momentum with your team."}
          </h1>

          <p>
            {isLogin
              ? "Plan clearly, collaborate simply, and keep every deadline visible."
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
            <h2>{isLogin ? "Sign in" : "Create your account"}</h2>

            <p>
              {isLogin
                ? "Enter your credentials to continue."
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

          {loadingRoles && !isLogin ? (
            <p style={{ color: "#64748b", fontSize: 13 }}>
              Loading workspace roles...
            </p>
          ) : (
            <form onSubmit={submit}>
              {!isLogin && (
                <>
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
                </>
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

                  <label>
                    Workspace role
                    <select
                      name="role"
                      value={form.role}
                      onChange={update}
                      required
                    >
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
                    <strong>{ROLE_LABELS[form.role] || form.role}:</strong>{" "}
                    {ROLE_DESCRIPTIONS[form.role]}
                    <div
                      style={{
                        marginTop: 4,
                        color: "#94a3b8",
                        fontSize: 11,
                      }}
                    >
                      Organisation Admin accounts are created by the system
                      administrator.
                    </div>
                  </div>
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
