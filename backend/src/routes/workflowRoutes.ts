import { Router } from 'express';
import {
    createWorkflow,
    getWorkflows,
    getWorkflowById,
    updateWorkflow,
    deleteWorkflow,
} from '../controllers/workflowController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// כל הנתיבים בקובץ הזה יהיו מוגנים על ידי ה-Middleware
router.use(authenticateToken);

// הגדרת הנתיבים (הקידומת תהיה /api/workflows כפי שנגדיר ב-index.ts)
router.post('/', createWorkflow);
router.get('/', getWorkflows);
router.get('/:id', getWorkflowById);
router.put('/:id', updateWorkflow);
router.delete('/:id', deleteWorkflow);

export default router;