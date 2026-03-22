// src/controllers/credentialController.ts
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';
import { encrypt } from '../utils/encryption';

const prisma = new PrismaClient();

// יצירת מפתח חדש (למשל מפתח OpenAI)
export const createCredential = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { name, provider, value } = req.body; // value הוא ה-API Key הגלוי

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        if (!name || !provider || !value) {
            res.status(400).json({ error: 'Name, provider, and value are required' });
            return;
        }

        // הצפנת המפתח לפני השמירה במסד הנתונים!
        const encryptedData = encrypt(value);

        const credential = await prisma.credential.create({
            data: {
                userId,
                name,
                provider,
                encryptedData,
            },
        });

        // אנחנו לא מחזירים ללקוח את הנתונים המוצפנים כדי למנוע דלף מידע
        res.status(201).json({
            id: credential.id,
            name: credential.name,
            provider: credential.provider,
            createdAt: credential.createdAt,
        });
    } catch (error: any) {
        // טיפול בשגיאה של כפילות שם הסוד לאותו משתמש
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'A credential with this name already exists' });
            return;
        }
        console.error('Error creating credential:', error);
        res.status(500).json({ error: 'Failed to create credential' });
    }
};

// שליפת רשימת הסודות של המשתמש (ללא המפתח עצמו!)
export const getCredentials = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        const credentials = await prisma.credential.findMany({
            where: { userId },
            select: { // אנחנו בוררים אילו שדות להחזיר - בשום אופן לא את encryptedData
                id: true,
                name: true,
                provider: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(credentials);
    } catch (error) {
        console.error('Error fetching credentials:', error);
        res.status(500).json({ error: 'Failed to fetch credentials' });
    }
};

// מחיקת מפתח
export const deleteCredential = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        const existingCredential = await prisma.credential.findFirst({
            where: { id, userId },
        });

        if (!existingCredential) {
            res.status(404).json({ error: 'Credential not found' });
            return;
        }

        await prisma.credential.delete({
            where: { id },
        });

        res.json({ message: 'Credential deleted successfully' });
    } catch (error) {
        console.error('Error deleting credential:', error);
        res.status(500).json({ error: 'Failed to delete credential' });
    }
};