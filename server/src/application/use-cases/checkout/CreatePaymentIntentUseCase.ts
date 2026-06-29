import prisma from '@infrastructure/database/prisma';
import { IPaymentService } from '@domain/services/IPaymentService';
import { CreatePaymentIntentInputDTO, CreatePaymentIntentResultDTO } from '@application/dtos/CheckoutDTOs';
import { CalculateCheckoutUseCase } from './CalculateCheckoutUseCase';
const calculateCheckoutUseCase = new CalculateCheckoutUseCase();

export class CreatePaymentIntentUseCase {
  constructor(private readonly paymentService: IPaymentService) {}

  async execute(input: CreatePaymentIntentInputDTO): Promise<CreatePaymentIntentResultDTO> {
    const { userId, cartId, addressId } = input;

    // 1. Validar propiedad del carrito
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
    });

    if (!cart) {
      throw new Error('Carrito no encontrado');
    }

    if (cart.userId !== userId) {
      throw new Error('El carrito no pertenece al usuario autenticado');
    }

    // 2. Validar propiedad de la dirección
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new Error('Dirección no encontrada');
    }

    if (address.userId !== userId) {
      throw new Error('La dirección no pertenece al usuario autenticado');
    }

    // 3. Calcular checkout (subtotal, shippingCost, total)
    const calculation = await calculateCheckoutUseCase.execute({ cartId, addressId });

    // 4. Crear PaymentIntent en Stripe
    // El monto debe estar en centavos (ej: S/. 100.50 -> 10050 centavos)
    const amountInCents = Math.round(calculation.total * 100);

    const { clientSecret } = await this.paymentService.createPaymentIntent(
      amountInCents,
      'pen', // soles peruanos
      {
        userId: userId.toString(),
        cartId: cartId.toString(),
        addressId: addressId.toString(),
      }
    );

    return { clientSecret };
  }
}
