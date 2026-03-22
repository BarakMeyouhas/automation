import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest<TParams = Record<string, string>, TResBody = any, TReqBody = any, TReqQuery = any>
    extends Request<TParams, TResBody, TReqBody, TReqQuery> {
    user?: { userId: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Access denied. No token provided.' });
        return;
    }

    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const decoded = jwt.verify(token, secret) as { userId: string };
        req.user = decoded;

        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
};
