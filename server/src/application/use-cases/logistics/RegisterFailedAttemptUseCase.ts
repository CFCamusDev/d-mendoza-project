import prisma from '@infrastructure/database/prisma';

export interface RegisterFailedAttemptInput {
  deliveryId: number;
  reason: string;
  rescheduledFor?: Date;
}

export interface FailedAttemptResult {
  id: number;
  deliveryId: number;
  reason: string;
  attemptedAt: Date;
  rescheduledFor: Date | null;
}

export class RegisterFailedAttemptUseCase {
  async execute(input: RegisterFailedAttemptInput): Promise<FailedAttemptResult> {
    const delivery = await prisma.delivery.findUnique({
      where: { id: input.deliveryId },
    });

    if (!delivery) {
      throw new Error(`Delivery #${input.deliveryId} no encontrado`);
    }

    const [attempt] = await prisma.$transaction([
      prisma.failedDeliveryAttempt.create({
        data: {
          deliveryId: input.deliveryId,
          reason: input.reason,
          rescheduledFor: input.rescheduledFor ?? null,
        },
      }),
      prisma.delivery.update({
        where: { id: input.deliveryId },
        data: { status: 'FAILED' },
      }),
    ]);

    return {
      id: attempt.id,
      deliveryId: attempt.deliveryId,
      reason: attempt.reason,
      attemptedAt: attempt.attemptedAt,
      rescheduledFor: attempt.rescheduledFor,
    };
  }
}
