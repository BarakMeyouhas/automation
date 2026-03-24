import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Play } from 'lucide-react'
import type { TriggerNode as TriggerNodeType } from '../../../types/workflow'

const TriggerNode = ({ data, selected }: NodeProps<TriggerNodeType>) => {
  return (
    <div className={`min-w-[220px] rounded-3xl border bg-white p-4 shadow-lg transition ${selected ? 'border-indigo-500 shadow-indigo-100' : 'border-indigo-200 shadow-slate-200/70'}`}>
      <div className="flex items-start gap-3">
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