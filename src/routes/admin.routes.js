import express from 'express';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);


router.post('/:accountId/deposit', );

export default router;
