import { LogOut, Plus, Sparkles } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DashboardLayout = () => {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col gap-6">
        <header className="panel flex flex-col gap-4 rounded-[2rem] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">FlowForge</p>
              <h1 className="font-display text-3xl text-slate-950">Automation Dashboard</h1>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Signed in as <span className="font-semibold text-slate-950">{user?.name ?? user?.email}</span>
            </div>
            <button type="button" onClick={logout} className="secondary-button gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        <main className="grid flex-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="panel rounded-[2rem] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
            <div className="mt-6 rounded-[1.5rem] bg-slate-900 p-5 text-white">
              <p className="text-sm text-slate-300">Next milestone</p>
              <h2 className="mt-2 font-display text-2xl">Start building your first workflow</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Auth is ready. The next UI layer can plug directly into the workflow and credential APIs.
              </p>
              <button type="button" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                <Plus className="h-4 w-4" />
                Create New Workflow
              </button>
            </div>
          </aside>

          <section className="panel rounded-[2rem] p-6 sm:p-8">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
