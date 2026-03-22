import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { enqueueWorkflow } from '../queue/workflowQueue';

const prisma = new PrismaClient();

type WebhookParams = {
    workflowId: string;
};

export const handleWebhook = async (req: Request<WebhookParams>, res: Response): Promise<void> => {
    const { workflowId } = req.params;
    const triggerData = {
        headers: req.headers,
        body: req.body,
        query: req.query,
    };

    try {
        // נוודא שהתהליך בכלל קיים ופעיל
        const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });

        if (!workflow || !workflow.isActive) {
            res.status(404).json({ error: 'Workflow not found or is currently inactive' });
            return;
        }

        // מוסיפים לתור (פעולה סופר-מהירה)
        await enqueueWorkflow(workflowId, triggerData);

        // מחזירים תשובה מיידית לשירות שקרא לנו (למשל Stripe, Github, או לקוח ששלח טופס)
        res.status(202).json({ message: 'Webhook received and workflow queued for execution' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
