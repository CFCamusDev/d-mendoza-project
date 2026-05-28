import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaProductRepository } from '@infrastructure/database/repositories/PrismaProductRepository';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const repo = new PrismaProductRepository();

const CreateProductSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().nullable().optional(),
  categoryId: z.number().int().positive(),
  brandId: z.number().int().positive(),
  gender: z.string().nullable().optional(),
});

const uploadsDir = path.join(process.cwd(), 'uploads', 'products');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`),
});

export const productUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

export class ProductController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(200).json({ success: true, data: await repo.findAll() });
    } catch (e) { next(e); }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID inválido' });
      const data = await repo.findById(id);
      if (!data) return res.status(404).json({ success: false, error: 'Producto no encontrado' });
      return res.status(200).json({ success: true, data });
    } catch (e) { next(e); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = {
        ...req.body,
        categoryId: Number(req.body.categoryId),
        brandId: Number(req.body.brandId),
      };
      const parsed = CreateProductSchema.safeParse(body);
      if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.issues });
      const data = await repo.create(parsed.data);
      return res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID inválido' });
      const parsed = CreateProductSchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.issues });
      const data = await repo.update(id, parsed.data);
      return res.status(200).json({ success: true, data });
    } catch (e) { next(e); }
  }

  async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parseInt(String(req.params.id), 10);
      if (isNaN(productId)) return res.status(400).json({ success: false, error: 'ID inválido' });

      const product = await repo.findById(productId);
      if (!product) return res.status(404).json({ success: false, error: 'Producto no encontrado' });

      const files = req.files as Express.Multer.File[];
      if (!files?.length) return res.status(400).json({ success: false, error: 'No se enviaron imágenes' });

      const isMainParam = req.body.isMain;
      const mainIndex = isMainParam !== undefined ? parseInt(String(isMainParam), 10) : 0;

      for (let i = 0; i < files.length; i++) {
        const url = `/uploads/products/${files[i].filename}`;
        const isMain = i === mainIndex;
        await repo.addImage(productId, url, isMain);
      }

      const updated = await repo.findById(productId);
      return res.status(201).json({ success: true, data: updated });
    } catch (e) { next(e); }
  }
}
