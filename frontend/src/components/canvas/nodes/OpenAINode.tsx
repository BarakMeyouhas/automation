import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Bot } from 'lucide-react'
import type { OpenAINode as OpenAINodeType } from '../../../types/workflow'

const OpenAINode = ({ id, data, selected }: NodeProps<OpenAINodeType>) => {
  const handleChange = (value: string) => {
    data.onPromptChange?.(id, value)
  }

  return (
    <div className={`min-w-[280px] rounded-3xl border bg-white p-4 shadow-lg transition ${selected ? 'border-emerald-500 shadow-emerald-100' : 'border-emerald-200 shadow-slate-200/70'}`}>
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-white !bg-emerald-500" />
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Bot className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">AI Action</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{data.label}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Prepare a prompt that the worker can later route into an OpenAI-backed node.</p>
        </div>
      </div>
      <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Prompt
      </label>
      <textarea
        value={data.prompt}
        onChange={(event) => handleChange(event.target.value)}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        rows={5}
        className="mt-2 w-full resize-none rounded-2xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
        placeholder="Summarize the webhook payload and decide the next action..."
      />
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-white !bg-emerald-500" />
    </div>
  )
}

export default OpenAINode