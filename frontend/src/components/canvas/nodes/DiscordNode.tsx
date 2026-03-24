import { Handle, Position, type NodeProps } from '@xyflow/react'
import { MessageSquare } from 'lucide-react'
import type { DiscordNode as DiscordNodeType } from '../../../types/workflow'

const DiscordNode = ({ id, data, selected }: NodeProps<DiscordNodeType>) => {
  const handleChange = (field: 'webhookUrl' | 'message', value: string) => {
    data.onDataChange?.(id, field, value)
  }

  return (
    <div className={`min-w-[280px] rounded-3xl border bg-white p-4 shadow-lg transition ${selected ? 'border-[#5865F2] shadow-indigo-100' : 'border-indigo-200 shadow-slate-200/70'}`}>
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-white !bg-[#5865F2]" />
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-[#5865F2]">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#5865F2]">Discord Action</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{data.label}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Post a message to a Discord channel.</p>
        </div>
      </div>
      
      <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Webhook URL
      </label>
      <input
        type="url"
        value={data.webhookUrl}
        onChange={(event) => handleChange('webhookUrl', event.target.value)}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        className="mt-2 w-full rounded-2xl border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
        placeholder="https://discord.com/api/webhooks/..."
      />

      <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Message
      </label>
      <textarea
        value={data.message}
        onChange={(event) => handleChange('message', event.target.value)}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        rows={4}
        className="mt-2 w-full resize-none rounded-2xl border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
        placeholder="Hello from automation! {{node_1.data}}"
      />
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-white !bg-[#5865F2]" />
    </div>
  )
}

export default DiscordNode
