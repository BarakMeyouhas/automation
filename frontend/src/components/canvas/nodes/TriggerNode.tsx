import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Play, Trash2 } from 'lucide-react'
import type { TriggerNode as TriggerNodeType } from '../../../types/workflow'

const TriggerNode = ({ id, data, selected }: NodeProps<TriggerNodeType>) => {
  return (
    <div className={`relative min-w-[220px] rounded-3xl border bg-white p-4 shadow-lg transition ${selected ? 'border-indigo-500 shadow-indigo-100' : 'border-indigo-200 shadow-slate-200/70'}`}>
      {selected ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); data.onDelete?.(id) }}
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
      <div className="flex items-start gap-3 pr-6">
        <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
          <Play className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">Trigger</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{data.label}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Receives inbound webhook payloads and starts the automation chain.</p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-white !bg-indigo-500" />
    </div>
  )
}

export default TriggerNode