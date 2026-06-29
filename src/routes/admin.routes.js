import express from 'express';
import { protect } from '../middleware/auth.middleware';
import depositToAccount from '../controllers/admin.controller';

const router = express.Router();

router.use(protect);


router.post('/:accountId/deposit', depositToAccount);

export default router;
