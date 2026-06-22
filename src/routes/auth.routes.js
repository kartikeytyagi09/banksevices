import express from 'express';
import { loginUser, registerUser } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', (req, res) => {registerUser(req, res)});

router.post('/login', (req, res) => {loginUser(req, res)});

router.post('/logout', (req, res) => {
	res.status(501).json({ message: 'Not implemented' });
});

router.get('/me', (req, res) => {
	res.status(501).json({ message: 'Not implemented' });
});

export default router;