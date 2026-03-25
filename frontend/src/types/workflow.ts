import type { Edge, Node } from '@xyflow/react'

export type WorkflowNodeType = 'webhookTrigger' | 'openAiAction' | 'httpAction' | 'discordAction' | 'trelloAction' | 'githubAction'

export interface TriggerNodeData extends Record<string, unknown> {
  label: string
  onDelete?: (nodeId: string) => void
}

export interface OpenAINodeData extends Record<string, unknown> {
  label: string
  prompt: string
  onPromptChange?: (nodeId: string, prompt: string) => void
  onDelete?: (nodeId: string) => void
}

export interface HttpNodeData extends Record<string, unknown> {
  label: string
  onDelete?: (nodeId: string) => void
}

export interface DiscordNodeData extends Record<string, unknown> {
  label: string
  webhookUrl: string
  message: string
  onDataChange?: (nodeId: string, field: 'webhookUrl' | 'message', value: string) => void
  onDelete?: (nodeId: string) => void
}

export interface TrelloNodeData extends Record<string, unknown> {
  label: string
  apiKey: string
  apiToken: string
  listId: string
  cardName: string
  cardDescription: string
  onDataChange?: (nodeId: string, field: 'apiKey' | 'apiToken' | 'listId' | 'cardName' | 'cardDescription', value: string) => void
  onDelete?: (nodeId: string) => void
}

export interface GitHubNodeData extends Record<string, unknown> {
  label: string
  personalAccessToken: string
  owner: string
  repo: string
  prNumber: string
  commentBody: string
  onDataChange?: (nodeId: string, field: 'personalAccessToken' | 'owner' | 'repo' | 'prNumber' | 'commentBody', value: string) => void
  onDelete?: (nodeId: string) => void
}

export type WorkflowNodeData = TriggerNodeData | OpenAINodeData | HttpNodeData | DiscordNodeData | TrelloNodeData | GitHubNodeData

export type TriggerNode = Node<TriggerNodeData, 'webhookTrigger'>
export type OpenAINode = Node<OpenAINodeData, 'openAiAction'>
export type HttpNode = Node<HttpNodeData, 'httpAction'>
export type DiscordNode = Node<DiscordNodeData, 'discordAction'>
export type TrelloNode = Node<TrelloNodeData, 'trelloAction'>
export type GitHubNode = Node<GitHubNodeData, 'githubAction'>

export type WorkflowNode = TriggerNode | OpenAINode | HttpNode | DiscordNode | TrelloNode | GitHubNode
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