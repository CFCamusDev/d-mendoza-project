import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { configurePassport } from '@infrastructure/auth/passport.config';
import authRoutes from '@infrastructure/http/routes/auth.routes';
import rbacRoutes from '@infrastructure/http/routes/role.routes';
import userRoutes from '@infrastructure/http/routes/user.routes';
import employeeRoutes from '@infrastructure/http/routes/employee.routes';
import branchRoutes from '@infrastructure/http/routes/branch.routes';
import profileRoutes from '@infrastructure/http/routes/profile.routes';
import { globalErrorHandler } from '@infrastructure/http/middlewares/error.middleware';
import clientRoutes from '@infrastructure/http/routes/client.routes';
import catalogRoutes from '@infrastructure/http/routes/catalog.routes';
import attributeRoutes from '@infrastructure/http/routes/attribute.routes';

const app = express();

// Initialize Passport with Google OAuth strategy (HU-001 / T-032)
configurePassport();

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true, // Allow cookies cross-origin for OAuth flow
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Health check endpoint para Docker
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas base (se expandirá con la arquitectura hexagonal)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', rbacRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', employeeRoutes);
app.use('/api/v1', branchRoutes);
app.use('/api/v1', profileRoutes);
app.use('/api/v1', clientRoutes);
app.use('/api/v1', catalogRoutes);
app.use('/api/v1', attributeRoutes);
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'Backend is running' });
});

// Error Handling (Must be after routes)
app.use(globalErrorHandler);

export default app;
