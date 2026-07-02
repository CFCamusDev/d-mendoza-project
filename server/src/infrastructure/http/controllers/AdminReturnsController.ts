import { Request, Response } from 'express';
import { GenerateCreditNoteUseCase } from '@application/use-cases/admin/GenerateCreditNoteUseCase';

export class AdminReturnsController {
  constructor(private readonly generateCreditNoteUseCase: GenerateCreditNoteUseCase) {}

  generateCreditNote = async (req: Request, res: Response) => {
    try {
      const returnRequestId = parseInt(req.params.id, 10);
      if (isNaN(returnRequestId)) {
        return res.status(400).json({ error: 'ID de solicitud de devolución inválido' });
      }

      const creditNote = await this.generateCreditNoteUseCase.execute(returnRequestId);
      return res.status(201).json({ message: 'Nota de crédito generada con éxito', creditNote });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}
