import { Queue } from 'bullmq';
const connection = {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
};

// יצירת תור בשם 'workflow-executions'
export const workflowQueue = new Queue('workflow-executions', { connection });

// פונקציית עזר להוספת ריצה לתור
export const enqueueWorkflow = async (workflowId: string, triggerData: any) => {
    await workflowQueue.add('execute', {
        workflowId,
        triggerData,
    }, {
        removeOnComplete: true, // מנקה מהזיכרון של רדיס אחרי סיום מוצלח (התיעוד נשמר ב-DB שלנו)
        removeOnFail: false,
    });
};
