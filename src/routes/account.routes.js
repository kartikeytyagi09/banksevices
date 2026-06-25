import express from 'express';
import {
	createAccount,
	getUserAccounts,
	getAccount,
	getAccountBalance,
	updateAccountStatus,
} from '../controllers/account.controllers.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createAccount);
router.get('/', getUserAccounts);
router.get('/:accountId', getAccount);
router.get('/:accountId/balance', getAccountBalance);
router.patch('/:accountId/status', updateAccountStatus);



export default router;
