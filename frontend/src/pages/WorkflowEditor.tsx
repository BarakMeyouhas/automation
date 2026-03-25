import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type NodeChange,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Beaker, Bot, Cable, Globe, Loader2, Save, Siren, Webhook, MessageSquare, Trello, Github } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getWorkflow, isWorkflowNodeType, testWorkflow, updateWorkflow } from '../api/workflows'
import DiscordNode from '../components/canvas/nodes/DiscordNode'
import HttpNode from '../components/canvas/nodes/HttpNode'
import OpenAINode from '../components/canvas/nodes/OpenAINode'
import TriggerNode from '../components/canvas/nodes/TriggerNode'
import TrelloNode from '../components/canvas/nodes/TrelloNode'
import GitHubNode from '../components/canvas/nodes/GitHubNode'
import type {
  DiscordNode as DiscordNodeType,
  DiscordNodeData,
  HttpNodeData,
  OpenAINode as OpenAINodeType,
  OpenAINodeData,
  TrelloNode as TrelloNodeType,
  TrelloNodeData,
  GitHubNode as GitHubNodeType,
  GitHubNodeData,
  TriggerNodeData,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeData,
  WorkflowNodeType,
  WorkflowNotification,
} from '../types/workflow'

const nodeTypes: NodeTypes = {
  webhookTrigger: TriggerNode,
  openAiAction: OpenAINode,
  httpAction: HttpNode,
  discordAction: DiscordNode,
  trelloAction: TrelloNode,
  githubAction: GitHubNode,
}

const palette = [
  {
    type: 'webhookTrigger' as const,
    title: 'Webhook Trigger',
    description: 'Start the flow from an inbound event.',
    icon: Webhook,
    accent: 'from-indigo-500/20 to-indigo-100',
  },
  {
    type: 'openAiAction' as const,
    title: 'OpenAI Action',
    description: 'Add a prompt-driven AI processing step.',
    icon: Bot,
    accent: 'from-emerald-500/20 to-emerald-100',
  },
  {
    type: 'httpAction' as const,
    title: 'HTTP Action',
    description: 'Forward data to external APIs or services.',
    icon: Globe,
    accent: 'from-sky-500/20 to-sky-100',
  },
  {
    type: 'discordAction' as const,
    title: 'Discord Notification',
    description: 'Post a message to a Discord channel.',
    icon: MessageSquare,
    accent: 'from-indigo-500/20 to-indigo-100',
  },
  {
    type: 'trelloAction' as const,
    title: 'Trello (Create Card)',
    description: 'Create a new card in a Trello board.',
    icon: Trello,
    accent: 'from-blue-500/20 to-blue-100',
  },
  {
    type: 'githubAction' as const,
    title: 'GitHub Action (Get Diff)',
    description: 'Fetch the raw Git diff of a Pull Request.',
    icon: Github,
    accent: 'from-slate-500/20 to-slate-200',
  },
]

const createNodeId = (() => {
  let counter = 0
  return () => {
    counter += 1
    return `node-${Date.now()}-${counter}`
  }
})()

const createDefaultNodeData = (type: WorkflowNodeType): WorkflowNodeData => {
  if (type === 'webhookTrigger') {
    return { label: 'Webhook Trigger' }
  }

  if (type === 'openAiAction') {
    return { label: 'OpenAI Action', prompt: '' }
  }

  if (type === 'discordAction') {
    return { label: 'Discord Action', webhookUrl: '', message: '' }
  }

  if (type === 'trelloAction') {
    return { label: 'Trello Action', apiKey: '', apiToken: '', listId: '', cardName: '', cardDescription: '' }
  }

  if (type === 'githubAction') {
    return { label: 'GitHub Action (Get Diff)', personalAccessToken: '', owner: '', repo: '', prNumber: '' }
  }

  return { label: 'HTTP Action' }
}

const notificationStyles: Record<WorkflowNotification['tone'], string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
}

const WorkflowEditorInner = () => {
  const { id } = useParams<{ id: string }>()
  const reactFlow = useReactFlow<WorkflowNode, WorkflowEdge>()
  const [nodes, setNodes, onNodesChangeBase] = useNodesState<WorkflowNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>([])
  const [workflowName, setWorkflowName] = useState('Workflow Editor')
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [notification, setNotification] = useState<WorkflowNotification | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const notificationTimerRef = useRef<number | null>(null)

  const pushNotification = useCallback((nextNotification: WorkflowNotification) => {
    setNotification(nextNotification)

    if (notificationTimerRef.current) {
      window.clearTimeout(notificationTimerRef.current)
    }

    notificationTimerRef.current = window.setTimeout(() => {
      setNotification(null)
      notificationTimerRef.current = null
    }, 4000)
  }, [])

  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        window.clearTimeout(notificationTimerRef.current)
      }
    }
  }, [])

  const injectRuntimeData = useCallback((incomingNodes: WorkflowNode[]): WorkflowNode[] => {
    return incomingNodes.map((node) => {
      const baseNode = {
        ...node,
        data: {
          ...node.data,
          onDelete: (nodeId: string) => {
            setNodes((nds) => nds.filter((n) => n.id !== nodeId))
            setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
          },
        },
      } as WorkflowNode

      if (node.type === 'openAiAction') {
        return {
          ...baseNode,
          data: {
            ...baseNode.data,
            onPromptChange: (nodeId: string, prompt: string) => {
              setNodes((currentNodes) =>
                currentNodes.map((currentNode) => {
                  if (currentNode.id !== nodeId || currentNode.type !== 'openAiAction') return currentNode
                  return { ...currentNode, data: { ...currentNode.data, prompt, onPromptChange: currentNode.data.onPromptChange } }
                })
              )
            },
          },
        } as OpenAINodeType
      }

      if (node.type === 'discordAction') {
        return {
          ...baseNode,
          data: {
            ...baseNode.data,
            onDataChange: (nodeId: string, field: 'webhookUrl' | 'message', value: string) => {
              setNodes((currentNodes) =>
                currentNodes.map((currentNode) => {
                  if (currentNode.id !== nodeId || currentNode.type !== 'discordAction') return currentNode
                  return { ...currentNode, data: { ...currentNode.data, [field]: value, onDataChange: currentNode.data.onDataChange } }
                })
              )
            },
          },
        } as DiscordNodeType
      }

      if (node.type === 'trelloAction') {
        return {
          ...baseNode,
          data: {
            ...baseNode.data,
            onDataChange: (nodeId: string, field: 'apiKey' | 'apiToken' | 'listId' | 'cardName' | 'cardDescription', value: string) => {
              setNodes((currentNodes) =>
                currentNodes.map((currentNode) => {
                  if (currentNode.id !== nodeId || currentNode.type !== 'trelloAction') return currentNode
                  return { ...currentNode, data: { ...currentNode.data, [field]: value, onDataChange: currentNode.data.onDataChange } }
                })
              )
            },
          },
        } as TrelloNodeType
      }

      if (node.type === 'githubAction') {
        return {
          ...baseNode,
          data: {
            ...baseNode.data,
            onDataChange: (nodeId: string, field: 'personalAccessToken' | 'owner' | 'repo' | 'prNumber', value: string) => {
              setNodes((currentNodes) =>
                currentNodes.map((currentNode) => {
                  if (currentNode.id !== nodeId || currentNode.type !== 'githubAction') return currentNode
                  return { ...currentNode, data: { ...currentNode.data, [field]: value, onDataChange: currentNode.data.onDataChange } }
                })
              )
            },
          },
        } as GitHubNodeType
      }

      return baseNode
    })
  }, [setNodes, setEdges])

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      pushNotification({ tone: 'error', message: 'Workflow id is missing from the route.' })
      return
    }

    const loadWorkflow = async () => {
      setIsLoading(true)

      try {
        const workflow = await getWorkflow(id)
        setWorkflowName(workflow.name)
        setIsActive(workflow.isActive ?? false)
        setNodes(injectRuntimeData(workflow.definition?.nodes ?? []))
        setEdges(workflow.definition?.edges ?? [])
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load workflow.'
        pushNotification({ tone: 'error', message })
      } finally {
        setIsLoading(false)
      }
    }

    void loadWorkflow()
  }, [id, injectRuntimeData, pushNotification, setEdges, setNodes])

  const onNodesChange = useCallback((changes: NodeChange<WorkflowNode>[]) => {
    onNodesChangeBase(changes)
  }, [onNodesChangeBase])

  const onConnect = useCallback((connection: Connection) => {
    setEdges((currentEdges) =>
      addEdge(
        {
          ...connection,
          animated: true,
          style: { strokeWidth: 2, stroke: '#0f172a' },
        },
        currentEdges,
      ),
    )
  }, [setEdges])

  const handleDragStart = (event: React.DragEvent<HTMLButtonElement>, type: WorkflowNodeType) => {
    event.dataTransfer.setData('application/reactflow', type)
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()

    const type = event.dataTransfer.getData('application/reactflow')
    if (!isWorkflowNodeType(type)) {
      return
    }

    const position = reactFlow.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    })

    const newNode: WorkflowNode = {
      id: createNodeId(),
      type,
      position,
      data: createDefaultNodeData(type) as TriggerNodeData & OpenAINodeData & HttpNodeData & DiscordNodeData & TrelloNodeData & GitHubNodeData,
    }

    setNodes((currentNodes) => injectRuntimeData([...currentNodes, newNode]))
  }

  const serializeNodes = useCallback((currentNodes: WorkflowNode[]): WorkflowNode[] => {
    return currentNodes.map((node) => {
      if (node.type === 'openAiAction') {
        const { onPromptChange: _onPromptChange, onDelete: _onDelete, ...data } = node.data
        return { ...node, data } as OpenAINodeType
      }
      if (node.type === 'discordAction') {
        const { onDataChange: _onDataChange, onDelete: _onDelete, ...data } = node.data
        return { ...node, data } as DiscordNodeType
      }
      if (node.type === 'trelloAction') {
        const { onDataChange: _onDataChange, onDelete: _onDelete, ...data } = node.data
        return { ...node, data } as TrelloNodeType
      }
      if (node.type === 'githubAction') {
        const { onDataChange: _onDataChange, onDelete: _onDelete, ...data } = node.data
        return { ...node, data } as GitHubNodeType
      }
      
      const { onDelete: _onDelete, ...data } = node.data
      return { ...node, data } as typeof node
    })
  }, [])

  const handleSave = async () => {
    if (!id) {
      return
    }

    setIsSaving(true)

    try {
      const workflow = await updateWorkflow(id, {
        definition: {
          nodes: serializeNodes(nodes),
          edges,
        },
      })
      setWorkflowName(workflow.name)
      setLastSavedAt(new Date().toLocaleTimeString())
      pushNotification({ tone: 'success', message: 'Workflow saved successfully.' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save workflow.'
      pushNotification({ tone: 'error', message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleActive = async () => {
    if (!id) return
    const newActiveState = !isActive
    setIsActive(newActiveState)
    
    try {
      await updateWorkflow(id, { isActive: newActiveState })
      pushNotification({ tone: newActiveState ? 'success' : 'info', message: newActiveState ? 'Workflow is now live!' : 'Workflow paused.' })
    } catch (error) {
      setIsActive(!newActiveState)
      pushNotification({ tone: 'error', message: 'Failed to update workflow status.' })
    }
  }

  const handleTest = async () => {
    if (!id) {
      return
    }

    setIsTesting(true)

    try {
      const message = await testWorkflow(id)
      pushNotification({ tone: 'success', message })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to queue workflow test.'
      pushNotification({ tone: 'error', message })
    } finally {
      setIsTesting(false)
    }
  }

  const minimapNodeColor = useCallback((node: WorkflowNode) => {
    switch (node.type) {
      case 'webhookTrigger':
        return '#6366f1'
      case 'openAiAction':
        return '#10b981'
      case 'httpAction':
        return '#0ea5e9'
      case 'discordAction':
        return '#5865F2'
      case 'trelloAction':
        return '#0052CC'
      case 'githubAction':
        return '#24292E'
      default:
        return '#94a3b8'
    }
  }, [])

  const statusText = useMemo(() => {
    if (isLoading) {
      return 'Loading workflow...'
    }

    if (isSaving) {
      return 'Saving changes...'
    }

    if (lastSavedAt) {
      return `Last saved at ${lastSavedAt}`
    }

    return 'Unsaved changes'
  }, [isLoading, isSaving, lastSavedAt])

  if (isLoading) {
    return (
      <div className="flex min-h-[720px] items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white/70">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading workflow canvas...
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[720px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.95),_rgba(248,250,252,0.88))]">
      <div className="absolute inset-x-0 top-0 z-20 flex flex-col gap-4 border-b border-white/70 bg-white/80 px-4 py-4 backdrop-blur-md lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Workflow Canvas</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">{workflowName}</h2>
          <p className="mt-2 text-sm text-slate-600">{statusText}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="mr-2 flex items-center gap-3 border-r border-slate-200 pr-5">
            <span className={`text-sm font-semibold uppercase tracking-wider ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}>{isActive ? 'Live' : 'Paused'}</span>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={handleToggleActive}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <button type="button" onClick={handleTest} disabled={isTesting} className="secondary-button gap-2">
            {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Beaker className="h-4 w-4" />}
            {isTesting ? 'Running...' : 'Test / Run'}
          </button>
          <button type="button" onClick={handleSave} disabled={isSaving} className="primary-button gap-2">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save Workflow'}
          </button>
        </div>
      </div>

      {notification ? (
        <div className={`absolute right-4 top-[110px] z-20 max-w-md rounded-2xl border px-4 py-3 text-sm shadow-lg ${notificationStyles[notification.tone]}`}>
          <div className="flex items-start gap-3">
            <Siren className="mt-0.5 h-4 w-4" />
            <span>{notification.message}</span>
          </div>
        </div>
      ) : null}

      <div className="absolute bottom-4 left-4 top-[118px] z-10 flex w-[270px] flex-col overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/80 shadow-xl backdrop-blur md:left-6 md:top-[124px]">
        <div className="p-4 pb-2 flex-shrink-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Node Palette</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-3 mt-2">
            {palette.map(({ type, title, description, icon: Icon, accent }) => (
              <button
                key={type}
                type="button"
                draggable
                onDragStart={(event) => handleDragStart(event, type)}
                className="w-full rounded-[1.4rem] border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-slate-900`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-950">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
              </button>
            ))}
          </div>
          <div className="mt-6 mb-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Drag a node onto the canvas, then connect nodes to shape the workflow definition.
          </div>
        </div>
      </div>

      <div className="h-[720px] pt-[108px]" onDragOver={handleDragOver} onDrop={handleDrop}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          defaultEdgeOptions={{ animated: true, style: { strokeWidth: 2, stroke: '#0f172a' } }}
          proOptions={{ hideAttribution: true }}
          className="workflow-canvas"
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1.4} color="#cbd5e1" />
          <Controls className="!shadow-lg" />
          <MiniMap
            pannable
            zoomable
            className="!rounded-2xl !border !border-slate-200 !bg-white/90 !shadow-lg"
            nodeColor={minimapNodeColor}
          />
        </ReactFlow>
      </div>

      <div className="absolute bottom-6 right-6 z-10 hidden items-center gap-2 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-sm text-slate-600 shadow-lg backdrop-blur md:flex">
        <Cable className="h-4 w-4 text-slate-500" />
        Connect nodes to build the execution chain.
      </div>
    </div>
  )
}

const WorkflowEditor = () => {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner />
    </ReactFlowProvider>
  )
}

export default WorkflowEditor