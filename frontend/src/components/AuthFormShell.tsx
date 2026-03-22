import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthFormShellProps {
  title: string
  subtitle: string
  footerText: string
  footerLinkLabel: string
  footerLinkTo: string
  children: ReactNode
}

const AuthFormShell = ({
  title,
  subtitle,
  footerText,
  footerLinkLabel,
  footerLinkTo,
  children,
}: AuthFormShellProps) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.16),_transparent_26%)]" />
      <div className="relative grid w-full max-w-5xl gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="hidden rounded-[2rem] border border-white/60 bg-slate-900 px-10 py-12 text-white shadow-soft lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Automation control center
            </div>
            <h1 className="mt-8 max-w-md font-display text-5xl leading-tight text-white">
              Build, trigger, and monitor workflows from one clean dashboard.
            </h1>
            <p className="mt-6 max-w-lg text-base text-slate-300">
              FlowForge gives operators a focused workspace for auth, workflow management, and execution visibility without noisy setup friction.
            </p>
          </div>
          <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Secure JWT sessions
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Ready for workflow CRUD
            </div>
          </div>
        </section>

        <section className="panel rounded-[2rem] p-8 sm:p-10">
          <div className="mb-8">
            <Link to="/login" className="inline-flex items-center gap-3 text-sm font-semibold text-slate-700 hover:text-slate-950">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-base text-white">F</span>
              FlowForge
            </Link>
            <h2 className="mt-8 font-display text-4xl text-slate-950">{title}</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">{subtitle}</p>
          </div>

          {children}

          <p className="mt-8 text-sm text-slate-600">
            {footerText}{' '}
            <Link to={footerLinkTo} className="font-semibold text-sky-700 hover:text-sky-800">
              {footerLinkLabel}
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}

export default AuthFormShell
