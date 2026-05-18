import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PrismaEmployeeRepository } from '@infrastructure/database/repositories/PrismaEmployeeRepository';
import { PrismaRoleRepository } from '@infrastructure/database/repositories/PrismaRoleRepository';

const employeeRepository = new PrismaEmployeeRepository();
const roleRepository = new PrismaRoleRepository();

const CreateEmployeeSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  dni: z.string().min(8, 'DNI inválido'),
  branchId: z.number().positive('Sucursal requerida'),
  userId: z.number().optional().nullable(),
  roleId: z.number().optional().nullable(),
});

const UpdateEmployeeSchema = z.object({
  name: z.string().min(1).optional(),
  branchId: z.number().positive().optional(),
  roleId: z.number().optional().nullable(),
});

const ToggleStatusSchema = z.object({
  isActive: z.boolean(),
});

export class EmployeeController {
  async getEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(String(req.query.page || '1'), 10);
      const limit = parseInt(String(req.query.limit || '10'), 10);
      const search = req.query.search as string;

      const data = await employeeRepository.findAll({ page, limit, search });
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      next(error);
    }
  }

  async createEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = CreateEmployeeSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ success: false, error: validation.error.issues });
      }

      const { roleId, ...employeeData } = validation.data;

      const existing = await employeeRepository.findByDni(employeeData.dni);
      if (existing) {
        return res.status(400).json({ success: false, error: 'El DNI ya está registrado' });
      }

      const employee = await employeeRepository.create(employeeData);

      // Si hay userId y roleId, vinculamos el rol
      if (employee.userId && roleId) {
        await roleRepository.assignRoleToUser(employee.userId, roleId);
      }

      return res.status(201).json({ success: true, data: employee });
    } catch (error: any) {
      next(error);
    }
  }

  async updateEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const validation = UpdateEmployeeSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ success: false, error: validation.error.issues });
      }

      const { roleId, ...updateData } = validation.data;
      const employee = await employeeRepository.update(id, updateData);

      // Si hay userId y roleId, vinculamos el rol
      if (employee.userId && roleId) {
        await roleRepository.assignRoleToUser(employee.userId, roleId);
      }

      return res.status(200).json({ success: true, data: employee });
    } catch (error: any) {
      next(error);
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id), 10);
      const validation = ToggleStatusSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ success: false, error: validation.error.issues });
      }

      await employeeRepository.toggleStatus(id, validation.data.isActive);
      return res.status(200).json({ success: true, message: 'Estado actualizado' });
    } catch (error: any) {
      next(error);
    }
  }
}

