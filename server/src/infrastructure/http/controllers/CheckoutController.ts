import { Request, Response } from 'express';
import { CalculateCheckoutUseCase } from '../../../application/use-cases/checkout/CalculateCheckoutUseCase';

const calculateCheckoutUseCase = new CalculateCheckoutUseCase();

export class CheckoutController {
  async calculate(req: Request, res: Response): Promise<void> {
    try {
      const { cartId, addressId } = req.body;

      if (!cartId || !addressId) {
        res.status(400).json({ success: false, error: 'cartId y addressId son requeridos' });
        return;
      }

      const result = await calculateCheckoutUseCase.execute({ cartId, addressId });

      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      if (error.message.includes('cobertura') || error.message.includes('encontrado') || error.message.includes('encontrada')) {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Error interno del servidor al calcular checkout' });
    }
  }
}
