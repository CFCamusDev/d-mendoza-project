import { z } from 'zod';

export const CreateCreditDTOSchema = z.object({
  clientId: z.number({ required_error: 'El ID de cliente es obligatorio' }).int().positive(),
  totalAmount: z.number({ required_error: 'El monto total es obligatorio' }).positive('El monto total debe ser mayor a cero'),
  installments: z.number({ required_error: 'El número de cuotas es obligatorio' }).int().positive('El número de cuotas debe ser mayor a cero'),
  dueDate: z.preprocess((val) => {
    if (typeof val === 'string' || val instanceof Date) return new Date(val);
    return val;
  }, z.date({ required_error: 'La fecha de vencimiento es obligatoria' }).refine((val) => !isNaN(val.getTime()), { message: 'Fecha de vencimiento inválida' }))
});

export type CreateCreditDTO = z.infer<typeof CreateCreditDTOSchema>;

export const CreatePaymentDTOSchema = z.object({
  amount: z.number({ required_error: 'El monto del pago es obligatorio' }).positive('El monto del pago debe ser mayor a cero')
});

export type CreatePaymentDTO = z.infer<typeof CreatePaymentDTOSchema>;
