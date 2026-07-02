import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app';
import prisma from '@infrastructure/database/prisma';

// Mock Prisma Client
jest.mock('@infrastructure/database/prisma', () => {
  const mockOrder = {
    findUnique: jest.fn(),
  };

  const mockReturnRequest = {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  };

  const mockUser = {
    findUnique: jest.fn(),
  };

  const mockPrisma: any = {
    order: mockOrder,
    returnRequest: mockReturnRequest,
    user: mockUser,
  };

  return { __esModule: true, default: mockPrisma };
});

const mockTokenPayload = {
  userId: 2,
  email: 'user@example.com',
  role: 'CLIENT',
};

// Mock JwtService for requireAuth
jest.mock('@infrastructure/services/JwtService', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    verifyAccessToken: jest.fn().mockImplementation(() => {
      return mockTokenPayload;
    }),
  })),
}));

describe('Returns Endpoints', () => {
  let userMockDb: Record<number, any> = {};

  beforeEach(() => {
    jest.clearAllMocks();

    mockTokenPayload.userId = 2;
    mockTokenPayload.email = 'user@example.com';
    mockTokenPayload.role = 'CLIENT';

    userMockDb = {
      2: {
        id: 2,
        email: 'user@example.com',
        isActive: true,
        roles: [{ name: 'CLIENT' }],
      },
      1: {
        id: 1,
        email: 'admin@example.com',
        isActive: true,
        roles: [{ name: 'ADMIN' }],
      },
    };

    (prisma.user.findUnique as any).mockImplementation((args: any) => {
      const id = args?.where?.id;
      return Promise.resolve(userMockDb[id] || null);
    });
  });

  describe('POST /api/v1/returns', () => {
    it('should create a return request successfully for a delivered order belonging to the client', async () => {
      const mockOrder = {
        id: 10,
        userId: 2,
        status: 'DELIVERED',
        items: [
          {
            id: 1,
            qty: 2,
          },
        ],
      };

      (prisma.order.findUnique as any).mockResolvedValue(mockOrder);
      (prisma.returnRequest.create as any).mockResolvedValue({
        id: 1,
        orderId: 10,
        userId: 2,
        reason: 'Factory defect on items',
        status: 'PENDING',
        refundType: 'CREDIT_NOTE',
        items: [{ id: 1, returnRequestId: 1, orderItemId: 1, qty: 1 }],
      });

      const response = await request(app)
        .post('/api/v1/returns')
        .send({
          orderId: 10,
          reason: 'Factory defect on items',
          refundType: 'CREDIT_NOTE',
          items: [{ orderItemId: 1, qty: 1 }],
        })
        .set('Authorization', 'Bearer dummy-token');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('PENDING');
    });

    it('should return 400 if order is not delivered', async () => {
      const mockOrder = {
        id: 10,
        userId: 2,
        status: 'PAID',
        items: [{ id: 1, qty: 2 }],
      };

      (prisma.order.findUnique as any).mockResolvedValue(mockOrder);

      const response = await request(app)
        .post('/api/v1/returns')
        .send({
          orderId: 10,
          reason: 'Reason goes here',
          refundType: 'STORE_CREDIT',
          items: [{ orderItemId: 1, qty: 1 }],
        })
        .set('Authorization', 'Bearer dummy-token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Only delivered orders can be returned');
    });

    it('should return 400 if return quantity exceeds ordered quantity', async () => {
      const mockOrder = {
        id: 10,
        userId: 2,
        status: 'DELIVERED',
        items: [{ id: 1, qty: 1 }],
      };

      (prisma.order.findUnique as any).mockResolvedValue(mockOrder);

      const response = await request(app)
        .post('/api/v1/returns')
        .send({
          orderId: 10,
          reason: 'Reason goes here',
          refundType: 'STORE_CREDIT',
          items: [{ orderItemId: 1, qty: 5 }],
        })
        .set('Authorization', 'Bearer dummy-token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Return quantity exceeds ordered quantity');
    });

    it('should return 400 on Zod validation failure (e.g. reason too short)', async () => {
      const response = await request(app)
        .post('/api/v1/returns')
        .send({
          orderId: 10,
          reason: 'bad',
          refundType: 'STORE_CREDIT',
          items: [{ orderItemId: 1, qty: 1 }],
        })
        .set('Authorization', 'Bearer dummy-token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/admin/returns/:id/approve', () => {
    it('should approve return request successfully with ADMIN role', async () => {
      mockTokenPayload.userId = 1;
      mockTokenPayload.role = 'ADMIN';

      (prisma.returnRequest.findUnique as any).mockResolvedValue({
        id: 1,
        status: 'PENDING',
      });

      (prisma.returnRequest.update as any).mockResolvedValue({
        id: 1,
        status: 'APPROVED',
      });

      const response = await request(app)
        .patch('/api/v1/admin/returns/1/approve')
        .set('Authorization', 'Bearer dummy-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('APPROVED');
    });

    it('should block non-admin users with 403 Forbidden', async () => {
      mockTokenPayload.userId = 2;
      mockTokenPayload.role = 'CLIENT';

      const response = await request(app)
        .patch('/api/v1/admin/returns/1/approve')
        .set('Authorization', 'Bearer dummy-token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Acceso denegado');
    });
  });

  describe('PATCH /api/v1/admin/returns/:id/reject', () => {
    it('should reject return request successfully with ADMIN role', async () => {
      mockTokenPayload.userId = 1;
      mockTokenPayload.role = 'ADMIN';

      (prisma.returnRequest.findUnique as any).mockResolvedValue({
        id: 1,
        status: 'PENDING',
      });

      (prisma.returnRequest.update as any).mockResolvedValue({
        id: 1,
        status: 'REJECTED',
      });

      const response = await request(app)
        .patch('/api/v1/admin/returns/1/reject')
        .set('Authorization', 'Bearer dummy-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('REJECTED');
    });
  });
});
