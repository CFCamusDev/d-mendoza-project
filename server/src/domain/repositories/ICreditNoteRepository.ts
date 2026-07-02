import { CreditNote } from '@domain/entities/CreditNote';
import { RefundType } from '@domain/entities/ReturnRequest';

export interface ICreditNoteRepository {
  create(
    data: {
      returnRequestId: number;
      amount: number;
      type: RefundType;
      code: string;
    },
    tx?: any
  ): Promise<CreditNote>;
  findByCode(code: string): Promise<CreditNote | null>;
  findByReturnRequestId(returnRequestId: number): Promise<CreditNote | null>;
}
