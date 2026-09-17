import { ArrowRight, CheckCircle2, CircleUserRound } from 'lucide-react'
import { Link, Route, Routes } from 'react-router-dom'

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="text-xl font-semibold tracking-tight">
            Project<span className="text-cyan-400">Pulse</span>
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-cyan-400 px-4 py-2 font-medium text-slate-950 transition hover:bg-cyan-300"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  )
}

function LandingPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center sm:py-32">
      <div className="mb-8 flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
        <CheckCircle2 size={16} />
        <span>Clarity for every project</span>
      </div>
      <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-7xl">
        Project<span className="text-cyan-400">Pulse</span>
      </h1>
      <p className="mt-6 text-xl font-medium text-slate-300 sm:text-2xl">
        Plan. Assign. Track. Complete.
      </p>
      <p className="mt-5 max-w-xl text-base leading-7 text-slate-400">
        Bring your projects, people, and progress together in one focused
        workspace.
      </p>
      <Link
        to="/register"
        className="mt-10 inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-300"
      >
        Start planning
        <ArrowRight size={18} />
      </Link>
    </main>
  )
}

function PlaceholderPage({ title, description }) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-28 text-center">
      <CircleUserRound className="text-cyan-400" size={40} />
      <h1 className="mt-6 text-4xl font-semibold">{title}</h1>
      <p className="mt-4 text-slate-400">{description}</p>
      <Link to="/" className="mt-8 text-cyan-400 hover:text-cyan-300">
        Back to home
      </Link>
    </main>
  )
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <PlaceholderPage
              title="Welcome back"
              description="The login experience is coming soon."
            />
          }
        />
        <Route
          path="/register"
          element={
            <PlaceholderPage
              title="Create your workspace"
              description="Registration will be available soon."
            />
          }
        />
      </Routes>
    </Layout>
  )
}
