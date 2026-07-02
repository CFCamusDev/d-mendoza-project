import { Request, Response, NextFunction } from 'express';
import { CreateReturnRequestUseCase } from '@application/use-cases/returns/CreateReturnRequestUseCase';
import { ApproveReturnRequestUseCase } from '@application/use-cases/returns/ApproveReturnRequestUseCase';
import { RejectReturnRequestUseCase } from '@application/use-cases/returns/RejectReturnRequestUseCase';
import { IssueCreditNoteUseCase } from '@application/use-cases/returns/IssueCreditNoteUseCase';
import { PrismaReturnRequestRepository } from '@infrastructure/database/repositories/PrismaReturnRequestRepository';
import { PrismaOrderRepository } from '@infrastructure/database/repositories/PrismaOrderRepository';
import { PrismaCreditNoteRepository } from '@infrastructure/database/repositories/PrismaCreditNoteRepository';
import { PdfGeneratorAdapter } from '@infrastructure/adapters/PdfGeneratorAdapter';
import { ResendEmailSenderAdapter } from '@infrastructure/adapters/ResendEmailSenderAdapter';

export class ReturnRequestController {
  private createReturnRequestUseCase: CreateReturnRequestUseCase;
  private approveReturnRequestUseCase: ApproveReturnRequestUseCase;
  private rejectReturnRequestUseCase: RejectReturnRequestUseCase;
  private issueCreditNoteUseCase: IssueCreditNoteUseCase;

  constructor() {
    const returnRequestRepo = new PrismaReturnRequestRepository();
    const orderRepo = new PrismaOrderRepository();
    const creditNoteRepo = new PrismaCreditNoteRepository();
    const pdfGenerator = new PdfGeneratorAdapter();
    const emailSender = new ResendEmailSenderAdapter();

    this.createReturnRequestUseCase = new CreateReturnRequestUseCase(returnRequestRepo, orderRepo);
    this.approveReturnRequestUseCase = new ApproveReturnRequestUseCase(returnRequestRepo);
    this.rejectReturnRequestUseCase = new RejectReturnRequestUseCase(returnRequestRepo);
    this.issueCreditNoteUseCase = new IssueCreditNoteUseCase(creditNoteRepo, pdfGenerator, emailSender);
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized: User ID not found' });
        return;
      }

      const { orderId, reason, refundType, items } = req.body;

      const returnRequest = await this.createReturnRequestUseCase.execute({
        orderId,
        userId,
        reason,
        refundType,
        items,
      });

      res.status(201).json({ success: true, data: returnRequest });
    } catch (error: any) {
      if (
        error.message?.includes('not found') ||
        error.message?.includes('authorized') ||
        error.message?.includes('Only delivered') ||
        error.message?.includes('exceeds') ||
        error.message?.includes('Invalid return quantity')
      ) {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  };

  approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: 'Invalid ID parameter' });
        return;
      }

      const returnRequest = await this.approveReturnRequestUseCase.execute(id);
      res.status(200).json({ success: true, data: returnRequest });
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      if (error.message?.includes('already')) {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  };

  reject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: 'Invalid ID parameter' });
        return;
      }

      const returnRequest = await this.rejectReturnRequestUseCase.execute(id);
      res.status(200).json({ success: true, data: returnRequest });
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        res.status(404).json({ success: false, error: error.message });
        return;
      }
      if (error.message?.includes('already')) {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  };

  issueCreditNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: 'Invalid ID parameter' });
        return;
      }

      const creditNote = await this.issueCreditNoteUseCase.execute(id);
      res.status(201).json({ success: true, data: creditNote });
    } catch (error: any) {
      if (
        error.message?.includes('not found') ||
        error.message?.includes('already been issued') ||
        error.message?.includes('invalid total amount')
      ) {
        res.status(400).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  };
}
