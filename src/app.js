import express from 'express';
import authRoutes from './routes/auth.routes.js';
import accountRoutes from './routes/account.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import adminRouter from './routes/admin.routes.js';
import cookieParser from 'cookie-parser';

const app = express();
app.use( express.json() );
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/admin',adminRouter);
app.use('/api/transactions', transactionRoutes);

export default app;
