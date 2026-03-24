import type { Edge, Node } from '@xyflow/react'

export type WorkflowNodeType = 'webhookTrigger' | 'openAiAction' | 'httpAction'

export interface TriggerNodeData extends Record<string, unknown> {
  label: string
}

export interface OpenAINodeData extends Record<string, unknown> {
  label: string
  prompt: string
  onPromptChange?: (nodeId: string, prompt: string) => void
}

export interface HttpNodeData extends Record<string, unknown> {
  label: string
}

export type WorkflowNodeData = TriggerNodeData | OpenAINodeData | HttpNodeData

export type TriggerNode = Node<TriggerNodeData, 'webhookTrigger'>
export type OpenAINode = Node<OpenAINodeData, 'openAiAction'>
export type HttpNode = Node<HttpNodeData, 'httpAction'>

export type WorkflowNode = TriggerNode | OpenAINode | HttpNode
export type WorkflowEdge = Edge

export interface WorkflowDefinition {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export interface Workflow {
  id: string
  name: string
  description: string | null
  isActive: boolean
  definition: WorkflowDefinition | null
}

export type WorkflowNotificationTone = 'success' | 'error' | 'info'

export interface WorkflowNotification {
  tone: WorkflowNotificationTone
  message: string
}