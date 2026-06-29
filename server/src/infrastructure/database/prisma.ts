import { PrismaClient } from '@prisma/client';
import { requestContext } from '@infrastructure/context/RequestContext';

const prismaInstance = new PrismaClient();

const extendedPrisma = prismaInstance.$extends({
  query: {
    order: {
      async update({ model, operation, args, query }) {
        const orderId = (args.where as any).id;
        let oldStatus: string | undefined;

        if (orderId && args.data.status !== undefined) {
          const existing = await prismaInstance.order.findUnique({
            where: { id: orderId },
            select: { status: true },
          });
          oldStatus = existing?.status;
        }

        const result = await query(args);

        if (args.data.status !== undefined && oldStatus !== args.data.status) {
          const store = requestContext.getStore();
          const changedBy = store?.email || (store?.userId ? `User #${store.userId}` : 'SYSTEM');

          // Use the base prismaInstance to write to OrderStatusLog to avoid triggering this extension hook recursively
          await prismaInstance.orderStatusLog.create({
            data: {
              orderId: result.id as number,
              status: result.status as any,
              changedBy: changedBy,
            },
          });
        }

        return result;
      },
    },
  },
});

export const prisma = extendedPrisma as unknown as PrismaClient;
export default prisma;
