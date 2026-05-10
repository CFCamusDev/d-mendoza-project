import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from '@infrastructure/http/routes/auth.routes';

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint para Docker
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas base (se expandirá con la arquitectura hexagonal)
app.use('/api/v1/auth', authRoutes);
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Backend is running' });
});

export default app;
