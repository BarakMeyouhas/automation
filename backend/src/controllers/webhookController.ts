import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { enqueueWorkflow } from '../queue/workflowQueue';

const prisma = new PrismaClient();

type WebhookParams = {
    workflowId: string;
};

export const handleWebhook = async (req: Request<WebhookParams>, res: Response): Promise<void> => {
    const { workflowId } = req.params;
    const triggerData: any = {
        headers: req.headers,
        body: req.body,
        query: req.query,
    };

    if (req.headers['x-github-event'] === 'pull_request' && req.body?.pull_request?.diff_url) {
        try {
            const diffResponse = await fetch(req.body.pull_request.diff_url);
            if (diffResponse.ok) {
                triggerData.body.pull_request.diff_content = await diffResponse.text();
            }
        } catch (e) {
            console.error('Failed to fetch PR diff automatically', e);
        }
    }

    try {
        // נוודא שהתהליך בכלל קיים ופעיל (אלא אם זה קריאת בדיקה)
        const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
        const isTestCall = req.query.test === 'true';

        if (!workflow || (!workflow.isActive && !isTestCall)) {
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
