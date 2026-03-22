import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes';
import workflowRoutes from './routes/workflowRoutes';
import credentialRoutes from './routes/credentialRoutes';
import './worker/workflowWorker';
import { handleWebhook } from './controllers/webhookController';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
    try {
        // בדיקת חיבור פשוטה למסד הנתונים
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected', details: error });
    }
});

app.post('/api/webhooks/:workflowId', handleWebhook);
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/credentials', credentialRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});