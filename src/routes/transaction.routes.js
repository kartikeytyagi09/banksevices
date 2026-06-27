import express from 'express';
import createTransaction from '../controllers/transaction.controllers.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createTransaction);

export default router;
