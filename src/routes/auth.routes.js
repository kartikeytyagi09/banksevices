import express from 'express';
import { loginUser, logoutUser, registerUser } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', (req, res) => {registerUser(req, res)});

router.post('/login', (req, res) => {loginUser(req, res)}); 

router.post('/logout', (req, res) => {logoutUser(req, res)});


export default router;