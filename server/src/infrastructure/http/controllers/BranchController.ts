import { Request, Response } from 'express';
import prisma from '@infrastructure/database/prisma';

export class BranchController {
  async getBranches(_req: Request, res: Response) {
    try {
      const branches = await prisma.branch.findMany({
        where: { isActive: true }
      });
      return res.status(200).json({ success: true, data: branches });
    } catch (error: any) {
      console.error('[BranchController.getBranches] Error:', error);
      return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}
