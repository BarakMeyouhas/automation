import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

// יצירת Workflow חדש
export const createWorkflow = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { name, description, definition } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // יצירת מבנה דיפולטיבי של React Flow אם לא נשלח כזה
        const defaultDefinition = definition || { nodes: [], edges: [] };

        const workflow = await prisma.workflow.create({
            data: {
                userId,
                name: name || 'Untitled Workflow',
                description: description || '',
                definition: defaultDefinition,
            },
        });

        res.status(201).json(workflow);
    } catch (error) {
        console.error('Error creating workflow:', error);
        res.status(500).json({ error: 'Failed to create workflow' });
    }
};

// קבלת כל ה-Workflows של המשתמש המחובר
export const getWorkflows = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        const workflows = await prisma.workflow.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' }, // נציג קודם את מה שעודכן לאחרונה
        });

        res.json(workflows);
    } catch (error) {
        console.error('Error fetching workflows:', error);
        res.status(500).json({ error: 'Failed to fetch workflows' });
    }
};

// קבלת Workflow ספציפי לפי ID
export const getWorkflowById = async (req: AuthRequest<{ id: string }>, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        const workflow = await prisma.workflow.findFirst({
            where: { id, userId }, // מוודאים שהתהליך שייך למשתמש המבקש
        });

        if (!workflow) {
            res.status(404).json({ error: 'Workflow not found' });
            return;
        }

        res.json(workflow);
    } catch (error) {
        console.error('Error fetching workflow:', error);
        res.status(500).json({ error: 'Failed to fetch workflow' });
    }
};

// עדכון Workflow (למשל, שמירת שינויים ב-Canvas)
export const updateWorkflow = async (req: AuthRequest<{ id: string }>, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { name, description, definition, isActive } = req.body;

        // קודם נוודא שה-Workflow קיים ושייך למשתמש
        const existingWorkflow = await prisma.workflow.findFirst({
            where: { id, userId },
        });

        if (!existingWorkflow) {
            res.status(404).json({ error: 'Workflow not found' });
            return;
        }

        const updatedWorkflow = await prisma.workflow.update({
            where: { id },
            data: {
                name: name !== undefined ? name : existingWorkflow.name,
                description: description !== undefined ? description : existingWorkflow.description,
                definition: definition !== undefined ? definition : existingWorkflow.definition,
                isActive: isActive !== undefined ? isActive : existingWorkflow.isActive,
            },
        });

        res.json(updatedWorkflow);
    } catch (error) {
        console.error('Error updating workflow:', error);
        res.status(500).json({ error: 'Failed to update workflow' });
    }
};

// מחיקת Workflow
export const deleteWorkflow = async (req: AuthRequest<{ id: string }>, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        const existingWorkflow = await prisma.workflow.findFirst({
            where: { id, userId },
        });

        if (!existingWorkflow) {
            res.status(404).json({ error: 'Workflow not found' });
            return;
        }

        await prisma.workflow.delete({
            where: { id },
        });

        res.json({ message: 'Workflow deleted successfully' });
    } catch (error) {
        console.error('Error deleting workflow:', error);
        res.status(500).json({ error: 'Failed to delete workflow' });
    }
};
