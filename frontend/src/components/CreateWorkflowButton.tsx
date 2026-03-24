import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { createWorkflow } from '../api/workflows'

interface CreateWorkflowButtonProps {
  children: ReactNode
  className: string
}

const CreateWorkflowButton = ({ children, className }: CreateWorkflowButtonProps) => {
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)

  const handleClick = async () => {
    if (isCreating) {
      return
    }

    setIsCreating(true)

    try {
      const workflow = await createWorkflow()
      navigate(`/dashboard/workflows/${workflow.id}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create workflow.'
      window.alert(message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={isCreating} className={className}>
      {isCreating ? 'Creating...' : children}
    </button>
  )
}

export default CreateWorkflowButton