import { Request, Response } from 'express';
import { RoleService } from '@application/services/RoleService';
import { PrismaRoleRepository } from '@infrastructure/database/repositories/PrismaRoleRepository';
import { PrismaUserRepository } from '@infrastructure/database/repositories/PrismaUserRepository';
import { CreateRoleDTOSchema, AssignRoleDTOSchema } from '@application/dtos/RoleDTO';

const roleRepository = new PrismaRoleRepository();
const userRepository = new PrismaUserRepository();
const roleService = new RoleService(roleRepository, userRepository);

export class RoleController {
  /**
   * POST /api/v1/roles
   */
  async createRole(req: Request, res: Response) {
    try {
      const validation = CreateRoleDTOSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.issues,
        });
      }

      const newRole = await roleService.createRole(validation.data);

      return res.status(201).json({
        success: true,
        data: newRole,
      });
    } catch (error: any) {
      if (error.message.includes('ya existe')) {
        return res.status(409).json({
          success: false,
          error: error.message,
        });
      }
      console.error('[RoleController.createRole] Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * PUT /api/v1/users/:id/role
   */
  async assignRoleToUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id as string, 10);
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: 'El ID de usuario proporcionado es inválido.',
        });
      }

      const validation = AssignRoleDTOSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.issues,
        });
      }

      await roleService.assignRole(userId, validation.data.roleName);

      return res.status(200).json({
        success: true,
        message: `Rol '${validation.data.roleName}' asignado exitosamente al usuario.`,
      });
    } catch (error: any) {
      if (error.message.includes('no encontrado') || error.message.includes('no está definido')) {
        return res.status(404).json({
          success: false,
          error: error.message,
        });
      }
      console.error('[RoleController.assignRoleToUser] Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/v1/roles
   */
  async getRoles(_req: Request, res: Response) {
    try {
      const roles = await roleRepository.findAll();
      return res.status(200).json({
        success: true,
        data: roles,
      });
    } catch (error: any) {
      console.error('[RoleController.getRoles] Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}
