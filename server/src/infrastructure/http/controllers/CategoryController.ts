import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaCategoryRepository } from '@infrastructure/database/repositories/PrismaCategoryRepository';

const repo = new PrismaCategoryRepository();

const CreateSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  parentId: z.number().int().positive().nullable().optional(),
});

const UpdateSchema = CreateSchema.partial();

export class CategoryController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await repo.findAll();
      return res.status(200).json({ success: true, data });
    } catch (e) { next(e); }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID inválido' });
      const data = await repo.findById(id);
      if (!data) return res.status(404).json({ success: false, error: 'Categoría no encontrada' });
      return res.status(200).json({ success: true, data });
    } catch (e) { next(e); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = CreateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.issues });
      const data = await repo.create(parsed.data);
      return res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID inválido' });
      const parsed = UpdateSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.issues });
      const data = await repo.update(id, parsed.data);
      return res.status(200).json({ success: true, data });
    } catch (e) { next(e); }
  }

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID inválido' });
      await repo.deactivate(id);
      return res.status(200).json({ success: true, message: 'Categoría inactivada' });
    } catch (e) { next(e); }
  }
}
