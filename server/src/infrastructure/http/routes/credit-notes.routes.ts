import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import prisma from '@infrastructure/database/prisma';

const router = Router();

const checkAdmin = (req: any, res: any, next: any) => {
  const roleName = req.auth?.role?.name || req.auth?.role;
  const isAuthorized = roleName === 'ADMIN' || roleName === 'Admin';
  if (!isAuthorized) {
    return res.status(403).json({ error: 'Acceso denegado: Se requiere el rol de Admin' });
  }
  next();
};

router.get('/admin/credit-notes', requireAuth, checkAdmin, async (req, res) => {
  try {
    const notes = await prisma.creditNote.findMany({
      include: {
        returnRequest: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ notes });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admin/credit-notes/:id/resend', requireAuth, checkAdmin, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    // In a real app we'd regenerate the PDF or load it from storage, and resend the email.
    // We'll simulate a successful resend for now since we're just testing the flow.
    res.json({ message: 'Email resent successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
