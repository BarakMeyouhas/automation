import axios from 'axios'
import api from './axios'
import type { Workflow, WorkflowDefinition, WorkflowEdge, WorkflowNode, WorkflowNodeType } from '../types/workflow'

interface CreateWorkflowInput {
  name?: string
}

interface UpdateWorkflowInput {
  definition?: WorkflowDefinition
  name?: string
  isActive?: boolean
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const asNodeArray = (value: unknown): WorkflowNode[] => (Array.isArray(value) ? (value as WorkflowNode[]) : [])
const asEdgeArray = (value: unknown): WorkflowEdge[] => (Array.isArray(value) ? (value as WorkflowEdge[]) : [])

export const normalizeWorkflowDefinition = (definition: unknown): WorkflowDefinition => {
  if (!isObject(definition)) {
    return { nodes: [], edges: [] }
  }

  return {
    nodes: asNodeArray(definition.nodes),
    edges: asEdgeArray(definition.edges),
  }
}

export const createWorkflow = async ({ name = 'Untitled Workflow' }: CreateWorkflowInput = {}): Promise<Workflow> => {
  const { data } = await api.post<Workflow>('/workflows', {
    name,
    definition: { nodes: [], edges: [] },
  })

  return {
    ...data,
    definition: normalizeWorkflowDefinition(data.definition),
  }
}

export const getWorkflow = async (workflowId: string): Promise<Workflow> => {
  const { data } = await api.get<Workflow>(`/workflows/${workflowId}`)

  return {
    ...data,
    definition: normalizeWorkflowDefinition(data.definition),
  }
}

export const updateWorkflow = async (workflowId: string, input: UpdateWorkflowInput): Promise<Workflow> => {
  const { data } = await api.put<Workflow>(`/workflows/${workflowId}`, input)

  return {
    ...data,
    definition: normalizeWorkflowDefinition(data.definition),
  }
}

export const testWorkflow = async (workflowId: string): Promise<string> => {
  const { data } = await axios.post<{ message?: string }>(`http://localhost:3000/api/webhooks/${workflowId}?test=true`, {
    event: 'test',
  })

  return data.message ?? 'Workflow test queued.'
}

export const isWorkflowNodeType = (value: string): value is WorkflowNodeType => {
  return value === 'webhookTrigger' || value === 'openAiAction' || value === 'httpAction' || value === 'discordAction'
}