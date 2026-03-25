import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Trello, Trash2 } from 'lucide-react'
import type { TrelloNode as TrelloNodeType } from '../../../types/workflow'

const TrelloNode = ({ id, data, selected }: NodeProps<TrelloNodeType>) => {
  const handleChange = (field: 'apiKey' | 'apiToken' | 'listId' | 'cardName' | 'cardDescription', value: string) => {
    data.onDataChange?.(id, field, value)
  }

  return (
    <div className={`relative min-w-[280px] rounded-3xl border bg-white p-4 shadow-lg transition ${selected ? 'border-[#0052CC] shadow-blue-100' : 'border-blue-200 shadow-slate-200/70'}`}>
      {selected ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); data.onDelete?.(id) }}
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-white !bg-[#0052CC]" />
      <div className="flex items-start gap-3 pr-6">
        <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-[#0052CC]">
          <Trello className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#0052CC]">Trello Action</p>
          <h3 className="mt-1 text-base font-semibold text-slate-950">{data.label}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Create a new card in a Trello board.</p>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            API Key
          </label>
          <input
            type="password"
            value={data.apiKey}
            onChange={(event) => handleChange('apiKey', event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            className="mt-2 w-full rounded-2xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            placeholder="Key"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            API Token
          </label>
          <input
            type="password"
            value={data.apiToken}
            onChange={(event) => handleChange('apiToken', event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            className="mt-2 w-full rounded-2xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
            placeholder="Token"
          />
        </div>
      </div>

      <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        List ID
      </label>
      <input
        type="text"
        value={data.listId}
        onChange={(event) => handleChange('listId', event.target.value)}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        className="mt-2 w-full rounded-2xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        placeholder="e.g. 5abbe4b7..."
      />

      <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Card Name
      </label>
      <input
        type="text"
        value={data.cardName}
        onChange={(event) => handleChange('cardName', event.target.value)}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        className="mt-2 w-full rounded-2xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        placeholder="New Lead: {{node_1.name}}"
      />

      <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Card Description
      </label>
      <textarea
        value={data.cardDescription}
        onChange={(event) => handleChange('cardDescription', event.target.value)}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        rows={3}
        className="mt-2 w-full resize-none rounded-2xl border border-blue-100 bg-blue-50/60 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        placeholder="Details: {{node_2.data}}"
      />
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-white !bg-[#0052CC]" />
    </div>
  )
}

export default TrelloNode
