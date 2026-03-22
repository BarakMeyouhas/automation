import { ArrowRight, Layers3, PlayCircle, ShieldCheck } from 'lucide-react'

const cards = [
  {
    title: 'Workflow builder',
    description: 'Compose multi-step automations with triggers, actions, and execution routing.',
    icon: Layers3,
  },
  {
    title: 'Credential vault',
    description: 'Store provider keys securely before wiring them into future workflow nodes.',
    icon: ShieldCheck,
  },
  {
    title: 'Execution runner',
    description: 'Track webhook-triggered runs and inspect outcomes in one operator-friendly surface.',
    icon: PlayCircle,
  },
]

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Overview</p>
          <h2 className="mt-3 font-display text-4xl text-slate-950">My Workflows</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            The frontend auth foundation is ready. This space is prepared for workflow lists, execution history, and credential management.
          </p>
        </div>
        <button type="button" className="primary-button gap-2 self-start sm:self-auto">
          Create New Workflow
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {cards.map(({ title, description, icon: Icon }) => (
          <article key={title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
