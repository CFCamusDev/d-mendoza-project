import { z } from 'zod';

export const RegisterUserDTOSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .regex(/[A-Z]/, { message: "La contraseña debe contener al menos una letra mayúscula" })
    .regex(/[0-9]/, { message: "La contraseña debe contener al menos un número" })
});

export type RegisterUserDTO = z.infer<typeof RegisterUserDTOSchema>;

export const VerifyUserDTOSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  pin: z
    .string()
    .length(6, { message: "El PIN debe tener exactamente 6 dígitos" })
    .regex(/^\d{6}$/, { message: "El PIN debe contener solo números" }),
});

export type VerifyUserDTO = z.infer<typeof VerifyUserDTOSchema>;

export const LoginDTOSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "La contraseña es requerida" }),
});

export type LoginDTO = z.infer<typeof LoginDTOSchema>;
