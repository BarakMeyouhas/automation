import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Globe, Trash2 } from 'lucide-react'
import type { HttpNode as HttpNodeType } from '../../../types/workflow'

const HttpNode = ({ id, data, selected }: NodeProps<HttpNodeType>) => {
  return (
    <div className={`relative min-w-[240px] rounded-3xl border bg-white p-4 shadow-lg transition ${selected ? 'border-sky-500 shadow-sky-100' : 'border-sky-200 shadow-slate-200/70'}`}>
      {selected ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); data.onDelete?.(id) }}
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-white !bg-sky-500" />
      <div className="flex items-start gap-3 pr-6">
        <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">HTTP Action</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{data.label}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Use this action node for outbound requests and third-party API handoffs.</p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-white !bg-sky-500" />
    </div>
  )
}

export default HttpNode