// src/worker/workflowWorker.ts
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { decrypt } from '../utils/encryption';
import { parseTemplate } from '../utils/templateParser';

const prisma = new PrismaClient();
const connection = {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
};

console.log('👷 Worker is starting and listening to queue...');

export const workflowWorker = new Worker('workflow-executions', async (job: Job) => {
    const { workflowId, triggerData } = job.data;
    console.log(`🚀 Starting Graph Execution for workflow: ${workflowId}`);

    const executionLog = await prisma.executionLog.create({
        data: { workflowId, status: 'RUNNING', triggerData, stepsLogs: [] }
    });

    try {
        const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
        if (!workflow || !workflow.isActive) throw new Error('Workflow not found or inactive');

        // אנחנו שומרים את ה-userId כדי שנוכל לחפש את המפתחות הסודיים שלו
        const userId = workflow.userId;

        const definition = workflow.definition as any;
        const nodes = definition.nodes || [];
        const edges = definition.edges || [];

        const startNode = nodes.find((n: any) => n.type === 'webhookTrigger');
        if (!startNode) throw new Error('No webhookTrigger node found in the workflow definition');

        const executionQueue = [{ node: startNode, inputData: triggerData }];
        const nodeOutputs: Record<string, any> = {};
        const stepLogs: any[] = [];

        let stepCount = 0;
        const MAX_STEPS = 50;

        while (executionQueue.length > 0) {
            if (stepCount++ > MAX_STEPS) throw new Error('Max steps reached');

            const { node, inputData } = executionQueue.shift()!;
            console.log(`Running node: ${node.id} (${node.type})`);

            let nodeOutput: any = {};

            switch (node.type) {
                case 'webhookTrigger':
                    nodeOutput = inputData;
                    break;

                case 'openAiAction':
                    // 1. מחפשים את מפתח ה-OpenAI של המשתמש הזה במסד הנתונים
                    const credential = await prisma.credential.findFirst({
                        where: { userId: userId, provider: 'OPENAI' }
                    });

                    if (!credential) {
                        throw new Error('OpenAI credential not found. Please save your API key first.');
                    }

                    // 2. מפענחים את המפתח הסודי
                    const apiKey = decrypt(credential.encryptedData);

                    // 3. שולפים את הפרומפט שהמשתמש הגדיר בצומת (או משתמשים בברירת מחדל)
                    const rawPrompt = node.data?.prompt || "Please summarize the following data briefly:";
                    const userPrompt = parseTemplate(rawPrompt, nodeOutputs);

                    // 4. יוצרים מופע של OpenAI עם המפתח המפוענח
                    const openai = new OpenAI({ apiKey });

                    // 5. שולחים את הבקשה לאינטליגנציה המלאכותית!
                    const response = await openai.chat.completions.create({
                        model: 'gpt-4o-mini', // מודל מהיר וזול שמעולה לאוטומציות
                        messages: [
                            { role: 'system', content: 'You are a helpful data-processing assistant working inside an automation tool.' },
                            // אנחנו משלבים את הפרומפט של המשתמש יחד עם המידע שהגיע מהצומת הקודם (כ-JSON)
                            { role: 'user', content: `${userPrompt}\n\nData to process: ${JSON.stringify(inputData)}` }
                        ]
                    });

                    nodeOutput = {
                        result: response.choices[0].message.content,
                        modelUsed: response.model
                    };
                    break;

                case 'discordAction':
                    const rawUrl = node.data?.webhookUrl || '';
                    const rawMsg = node.data?.message || '';

                    const discordUrl = parseTemplate(rawUrl, nodeOutputs);
                    const discordMsg = parseTemplate(rawMsg, nodeOutputs);

                    if (!discordUrl) {
                        throw new Error('Discord Webhook URL is missing or invalid');
                    }

                    const discordResponse = await fetch(discordUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: discordMsg })
                    });

                    if (!discordResponse.ok) {
                        const errorText = await discordResponse.text();
                        throw new Error(`Discord API Error: ${discordResponse.status} - ${errorText}`);
                    }

                    nodeOutput = {
                        success: true,
                        sentMessage: discordMsg
                    };
                    break;

                case 'trelloAction':
                    const trelloApiKey = node.data?.apiKey || '';
                    const trelloApiToken = node.data?.apiToken || '';
                    const trelloListId = node.data?.listId || '';
                    const rawCardName = node.data?.cardName || '';
                    const rawCardDesc = node.data?.cardDescription || '';

                    const parsedCardName = parseTemplate(rawCardName, nodeOutputs);
                    const parsedCardDesc = parseTemplate(rawCardDesc, nodeOutputs);

                    if (!trelloApiKey || !trelloApiToken || !trelloListId) {
                        throw new Error('Trello credentials or List ID are missing');
                    }

                    const trelloUrl = new URL(`https://api.trello.com/1/cards`);
                    trelloUrl.searchParams.append('idList', trelloListId);
                    trelloUrl.searchParams.append('key', trelloApiKey);
                    trelloUrl.searchParams.append('token', trelloApiToken);
                    trelloUrl.searchParams.append('name', parsedCardName);
                    trelloUrl.searchParams.append('desc', parsedCardDesc);

                    const trelloResponse = await fetch(trelloUrl.toString(), {
                        method: 'POST',
                        headers: { 'Accept': 'application/json' }
                    });

                    if (!trelloResponse.ok) {
                        const errorText = await trelloResponse.text();
                        throw new Error(`Trello API Error: ${trelloResponse.status} - ${errorText}`);
                    }

                    const trelloData = await trelloResponse.json();
                    nodeOutput = {
                        success: true,
                        cardId: trelloData.id,
                        cardUrl: trelloData.url
                    };
                    break;

                case 'httpAction':
                    nodeOutput = { status: 200, message: "Simulated HTTP success", received: inputData };
                    break;

                default:
                    nodeOutput = { warning: "Unrecognized node", received: inputData };
            }

            nodeOutputs[node.id] = nodeOutput;

            stepLogs.push({
                nodeId: node.id,
                nodeType: node.type,
                input: inputData,
                output: nodeOutput,
                timestamp: new Date().toISOString()
            });

            const outgoingEdges = edges.filter((e: any) => e.source === node.id);
            for (const edge of outgoingEdges) {
                const targetNode = nodes.find((n: any) => n.id === edge.target);
                if (targetNode) {
                    executionQueue.push({ node: targetNode, inputData: nodeOutput });
                }
            }
        }

        await prisma.executionLog.update({
            where: { id: executionLog.id },
            data: { status: 'SUCCESS', stepsLogs: stepLogs, completedAt: new Date() }
        });
        console.log(`✅ Workflow ${workflowId} completed graph execution successfully!`);

    } catch (error: any) {
        console.error(`❌ Workflow ${workflowId} failed:`, error.message);
        await prisma.executionLog.update({
            where: { id: executionLog.id },
            data: { status: 'FAILED', error: error.message, completedAt: new Date() }
        });
    }
}, { connection });