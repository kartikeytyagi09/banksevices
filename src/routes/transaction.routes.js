import express from 'express';
import {
	createTransaction,
	getTransaction,
	getTransactions,
} from '../controllers/transaction.controllers.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/:transactionId', getTransaction);

export default router;
