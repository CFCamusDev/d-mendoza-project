import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../app';
import { Readable } from 'stream';
import prisma from '@infrastructure/database/prisma';

// Mock PdfKitShippingLabelService
jest.mock('@infrastructure/services/PdfKitShippingLabelService', () => {
  return {
    PdfKitShippingLabelService: jest.fn().mockImplementation(() => {
      return {
        generateLabelPdfStream: jest.fn().mockImplementation(async () => {
          const s = new Readable();
          s.push('mock pdf shipping label content');
          s.push(null);
          return s;
        }),
      };
    }),
  };
});

// Mock Prisma Client
jest.mock('@infrastructure/database/prisma', () => {
  const mockOrder = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  };

  const mockDelivery = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockUser = {
    findUnique: jest.fn(),
  };

  const mockPrisma: any = {
    order: mockOrder,
    delivery: mockDelivery,
    user: mockUser,
    $transaction: jest.fn().mockImplementation(async (args: any): Promise<any> => {
      if (typeof args === 'function') {
        return args();
      }
      return args;
    }),
  };

  return { __esModule: true, default: mockPrisma };
});

// Share a mutable mock token payload. Variables prefixed with "mock" are hoisted safely by Jest.
const mockTokenPayload = {
  userId: 1,
  email: 'admin@example.com',
  role: 'ADMIN',
};

// Mock JwtService for requireAuth
jest.mock('@infrastructure/services/JwtService', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    verifyAccessToken: jest.fn().mockImplementation(() => {
      return mockTokenPayload;
    }),
  })),
}));

describe('Logistics Endpoints', () => {
  let userMockDb: Record<number, any> = {};

  beforeEach(() => {
    jest.clearAllMocks();

    // Default token payload
    mockTokenPayload.userId = 1;
    mockTokenPayload.email = 'admin@example.com';
    mockTokenPayload.role = 'ADMIN';

    // Mock database state for users
    userMockDb = {
      1: {
        id: 1,
        email: 'admin@example.com',
        isActive: true,
        roles: [{ name: 'ADMIN' }],
      },
      99: {
        id: 99,
        email: 'repartidor@example.com',
        isActive: true,
        roles: [{ name: 'DELIVERY' }],
      },
    };

    // Configure dynamic mock for user lookup
    (prisma.user.findUnique as any).mockImplementation((args: any) => {
      const id = args?.where?.id;
      return Promise.resolve(userMockDb[id] || null);
    });
  });

  describe('POST /api/v1/logistics/picking', () => {
    it('should generate picking list successfully', async () => {
      const mockPaidOrders = [
        {
          id: 101,
          status: 'PAID',
          items: [{ variantId: 5, qty: 2 }],
        },
      ];

      (prisma.order.findMany as any).mockResolvedValue(mockPaidOrders);
      (prisma.delivery.create as any).mockResolvedValue({
        id: 1,
        orderId: 101,
        deliveryManId: null,
        status: 'PENDING',
        pickingItems: [{ id: 1, deliveryId: 1, variantId: 5, qty: 2, pickedAt: null }],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/v1/logistics/picking')
        .set('Authorization', 'Bearer dummy-token');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].status).toBe('PENDING');
    });

    it('should block non-admin and non-logistics users', async () => {
      mockTokenPayload.role = 'CLIENT';
      // client has id 1 here, update mock database role too
      userMockDb[1].roles = [{ name: 'CLIENT' }];

      const response = await request(app)
        .post('/api/v1/logistics/picking')
        .set('Authorization', 'Bearer dummy-token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/logistics/deliveries/:id/assign', () => {
    it('should assign a delivery man with role DELIVERY', async () => {
      (prisma.delivery.findUnique as any).mockResolvedValue({
        id: 1,
        orderId: 101,
        status: 'PENDING',
      });

      (prisma.delivery.update as any).mockResolvedValue({
        id: 1,
        orderId: 101,
        deliveryManId: 99,
        status: 'ASSIGNED',
      });

      const response = await request(app)
        .post('/api/v1/logistics/deliveries/1/assign')
        .send({ deliveryManId: 99 })
        .set('Authorization', 'Bearer dummy-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('ASSIGNED');
      expect(response.body.data.deliveryManId).toBe(99);
    });

    it('should fail if delivery man does not have DELIVERY role', async () => {
      (prisma.delivery.findUnique as any).mockResolvedValue({
        id: 1,
        orderId: 101,
        status: 'PENDING',
      });

      // Update mock database: make user 99 a CLIENT
      userMockDb[99].roles = [{ name: 'CLIENT' }];

      const response = await request(app)
        .post('/api/v1/logistics/deliveries/1/assign')
        .send({ deliveryManId: 99 })
        .set('Authorization', 'Bearer dummy-token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('role');
    });
  });

  describe('GET /api/v1/logistics/deliveries/:id/label', () => {
    it('should generate PDF shipping label', async () => {
      (prisma.delivery.findUnique as any).mockResolvedValue({
        id: 1,
        orderId: 101,
      });

      (prisma.order.findUnique as any).mockResolvedValue({
        id: 101,
        userId: 2,
        addressSnapshot: {
          fullAddress: 'Calle Las Flores 123',
          district: 'San Isidro',
        },
        user: {
          id: 2,
          name: 'John',
        },
      });

      const response = await request(app)
        .get('/api/v1/logistics/deliveries/1/label')
        .set('Authorization', 'Bearer dummy-token');

      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('application/pdf');
      expect(response.header['content-disposition']).toContain('shipping-label-1.pdf');
    });
  });
});
