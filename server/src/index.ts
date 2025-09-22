import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import { runMigrations } from './db/migrations';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import productRoutes from './routes/products';
import stockRoutes from './routes/stock';
import paymentRoutes from './routes/payments';
import reportRoutes from './routes/reports';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
	res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/stock', stockRoutes);
app.use('/payments', paymentRoutes);
app.use('/reports', reportRoutes);

runMigrations();

app.listen(env.port, () => {
	console.log(`API listening on http://localhost:${env.port}`);
});

