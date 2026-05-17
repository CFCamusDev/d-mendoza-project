import express, { Request, Response } from 'express';
import cors from 'cors';
import profileRoutes from './routes/profile.routes';

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1', profileRoutes);

// Health check endpoint para Docker
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas base (se expandirá con la arquitectura hexagonal)
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Backend is running' });
});

export default app;
