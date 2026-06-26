import Stripe from 'stripe';
import { IPaymentService } from '@domain/services/IPaymentService';

export class StripePaymentService implements IPaymentService {
  private stripe: Stripe;

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY no está configurada');
    }
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16' as any,
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<{ clientSecret: string; paymentIntentId: string }> {
    // Si estamos en entorno de desarrollo con una llave dummy, mockeamos la respuesta
    // para evitar que la aplicación falle al intentar contactar a Stripe con una llave inválida.
    if (process.env.STRIPE_SECRET_KEY?.includes('dummy')) {
      console.warn('⚠️ Usando llave de Stripe dummy. Generando PaymentIntent mockeado.');
      return {
        clientSecret: 'pi_mock_secret_12345_test',
        paymentIntentId: 'pi_mock_12345',
      };
    }

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
    });

    if (!paymentIntent.client_secret) {
      throw new Error('No se pudo generar el client_secret de Stripe');
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  constructEvent(payload: Buffer, signature: string, secret: string): any {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
