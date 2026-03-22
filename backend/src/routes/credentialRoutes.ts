import { Router } from 'express';
import {
    createCredential,
    getCredentials,
    deleteCredential,
} from '../controllers/credentialController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken); // מגן על כל הנתיבים

router.post('/', createCredential);
router.get('/', getCredentials);
router.delete('/:id', deleteCredential);

export default router;