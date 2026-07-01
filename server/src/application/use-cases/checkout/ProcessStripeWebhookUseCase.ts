import prisma from '@infrastructure/database/prisma';
import { IPaymentService } from '@domain/services/IPaymentService';
import { ProcessWebhookInputDTO } from '@application/dtos/CheckoutDTOs';

export class ProcessStripeWebhookUseCase {
  constructor(private readonly paymentService: IPaymentService) {}

  async execute(input: ProcessWebhookInputDTO): Promise<{ processed: boolean; orderId?: number }> {
    const { payload, signature } = input;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET no está configurada');
    }

    // 1. Construir el evento y verificar la firma de Stripe
    let event: any;
    try {
      event = this.paymentService.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      throw new Error(`Error de firma en Webhook de Stripe: ${err.message}`);
    }

    // 2. Procesar el evento payment_intent.succeeded
    if (event.type !== 'payment_intent.succeeded') {
      return { processed: false };
    }

    const paymentIntent = event.data.object;
    const paymentIntentId = paymentIntent.id;
    const metadata = paymentIntent.metadata;

    if (!metadata || !metadata.userId || !metadata.cartId || !metadata.addressId) {
      throw new Error('Metadatos insuficientes en el PaymentIntent para procesar la orden');
    }

    const userId = parseInt(metadata.userId, 10);
    const cartId = parseInt(metadata.cartId, 10);
    const addressId = parseInt(metadata.addressId, 10);

    // 3. Idempotencia: Verificar si la orden ya existe
    const existingOrder = await prisma.order.findUnique({
      where: { paymentIntentId },
    });

    if (existingOrder) {
      console.log(`Orden ya procesada anteriormente para el paymentIntentId: ${paymentIntentId}`);
      return { processed: true, orderId: existingOrder.id };
    }

    // 4. Iniciar la transacción atómica
    const orderId = await prisma.$transaction(async (tx) => {
      // A) Obtener el carrito y sus ítems
      const cart = await tx.cart.findUnique({
        where: { id: cartId },
        include: {
          items: {
            include: {
              variant: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error('El carrito está vacío o no existe');
      }

      // B) Obtener la dirección para la orden y calcular el costo de envío
      const address = await tx.address.findUnique({
        where: { id: addressId },
      });

      if (!address) {
        throw new Error('La dirección de envío no existe');
      }

      // Obtener el costo de delivery
      const deliveryZones = await tx.deliveryZone.findMany();
      let shippingCost = 0;
      let hasCoverage = false;

      for (const zone of deliveryZones) {
        const districtsArray = zone.districts as string[];
        if (Array.isArray(districtsArray) && districtsArray.includes(address.district)) {
          shippingCost = Number(zone.deliveryCost);
          hasCoverage = true;
          break;
        }
      }

      if (!hasCoverage) {
        throw new Error(`Sin cobertura de envío para el distrito: ${address.district}`);
      }

      // C) Calcular subtotal de los ítems
      let subtotal = 0;
      for (const item of cart.items) {
        const itemPrice = Number(item.variant.price);
        const itemDiscount = item.variant.discountPercent || 0;
        
        const finalPrice = itemDiscount > 0 
          ? itemPrice - (itemPrice * itemDiscount) / 100 
          : itemPrice;
          
        subtotal += finalPrice * item.quantity;
      }
      const total = subtotal + shippingCost;

      // Crear el addressSnapshot para guardar el estado histórico de la dirección
      const addressSnapshot = {
        alias: address.alias,
        fullAddress: address.fullAddress,
        district: address.district,
        reference: address.reference,
      };

      // D) Obtener la sucursal principal para descontar stock
      let mainBranch = await tx.branch.findFirst({
        where: { isMain: true, isActive: true },
      });

      if (!mainBranch) {
        mainBranch = await tx.branch.findFirst({
          where: { isActive: true },
          orderBy: { id: 'asc' },
        });
      }

      if (!mainBranch) {
        throw new Error('No se encontró ninguna sucursal activa para despachar el stock');
      }

      // E) Crear la Orden
      const order = await tx.order.create({
        data: {
          userId,
          status: 'PAID',
          total,
          shippingCost,
          addressSnapshot,
          paymentIntentId,
        },
      });

      // F) Crear OrderItems, actualizar stock y generar Kardex por cada item
      for (const item of cart.items) {
        // Calcular precio final con descuento
        const itemPrice = Number(item.variant.price);
        const itemDiscount = item.variant.discountPercent || 0;
        
        const finalPrice = itemDiscount > 0 
          ? itemPrice - (itemPrice * itemDiscount) / 100 
          : itemPrice;

        // Crear OrderItem
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: item.variantId,
            qty: item.quantity,
            unitPrice: finalPrice,
          },
        });

        // Verificar y actualizar stock de la sucursal principal
        const stock = await tx.branchStock.findUnique({
          where: {
            variantId_branchId_status: {
              variantId: item.variantId,
              branchId: mainBranch.id,
              status: 'AVAILABLE',
            },
          },
        });

        if (!stock || stock.quantity < item.quantity) {
          throw new Error(`Stock insuficiente en sucursal principal para el SKU: ${item.variant.sku}`);
        }

        const newQty = stock.quantity - item.quantity;

        // Decrementar el stock
        await tx.branchStock.update({
          where: {
            variantId_branchId_status: {
              variantId: item.variantId,
              branchId: mainBranch.id,
              status: 'AVAILABLE',
            },
          },
          data: {
            quantity: newQty,
          },
        });

        // Obtener el costo unitario desde el último asiento de Kardex
        const lastKardex = await tx.kardexEntry.findFirst({
          where: { variantId: item.variantId, branchId: mainBranch.id },
          orderBy: { id: 'desc' },
        });

        const unitCost = lastKardex?.unitCost ?? 0;
        const lastBalanceCost = lastKardex?.balanceCost ?? 0;
        const newBalanceCost = lastBalanceCost - item.quantity * unitCost;

        // Crear asiento Kardex SALIDA
        await tx.kardexEntry.create({
          data: {
            variantId: item.variantId,
            branchId: mainBranch.id,
            type: 'SALIDA',
            quantity: item.quantity,
            unitCost,
            balanceQty: newQty,
            balanceCost: newBalanceCost,
          },
        });
      }

      // G) Limpiar el carrito de compras (vaciar CartItems)
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order.id;
    });

    return { processed: true, orderId };
  }
}
