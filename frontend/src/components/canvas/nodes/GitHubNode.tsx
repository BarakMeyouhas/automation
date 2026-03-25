import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Github } from 'lucide-react'
import type { GitHubNode as GitHubNodeType } from '../../../types/workflow'

const GitHubNode = ({ id, data, selected }: NodeProps<GitHubNodeType>) => {
  const handleChange = (field: 'personalAccessToken' | 'owner' | 'repo' | 'prNumber' | 'commentBody', value: string) => {
    data.onDataChange?.(id, field, value)
  }

  return (
    <div className={`min-w-[280px] rounded-3xl border bg-white p-4 shadow-lg transition ${selected ? 'border-[#24292E] shadow-slate-300' : 'border-slate-200 shadow-slate-200/70'}`}>
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-white !bg-[#24292E]" />
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-[#24292E]">
          <Github className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#24292E]">GitHub Action</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{data.label}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Post a comment on a Pull Request.</p>
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Personal Access Token
        </label>
        <input
          type="password"
          value={data.personalAccessToken}
          onChange={(event) => handleChange('personalAccessToken', event.target.value)}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          placeholder="ghp_xxxxxxxxxxxx"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Owner / Org
          </label>
          <input
            type="text"
            value={data.owner}
            onChange={(event) => handleChange('owner', event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            placeholder="e.g. MountApps"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Repo Name
          </label>
          <input
            type="text"
            value={data.repo}
            onChange={(event) => handleChange('repo', event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            placeholder="e.g. automation"
          />
        </div>
      </div>

      <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        PR Number
      </label>
      <input
        type="text"
        value={data.prNumber}
        onChange={(event) => handleChange('prNumber', event.target.value)}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
        placeholder="{{node_1.body.pull_request.number}}"
      />

      <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Comment Body
      </label>
      <textarea
        value={data.commentBody}
        onChange={(event) => handleChange('commentBody', event.target.value)}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        rows={4}
        className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
        placeholder="AI Code Review:\\n\\n{{node_2.result}}"
      />
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-white !bg-[#24292E]" />
    </div>
  )
}

export default GitHubNode
