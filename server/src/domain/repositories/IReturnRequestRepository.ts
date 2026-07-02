import { ReturnRequest, ReturnStatus } from '@domain/entities/ReturnRequest';

export interface IReturnRequestRepository {
  create(data: {
    orderId: number;
    userId: number;
    reason: string;
    refundType: 'CREDIT_NOTE' | 'STORE_CREDIT';
    items: Array<{ orderItemId: number; qty: number }>;
  }): Promise<ReturnRequest>;
  findById(id: number): Promise<ReturnRequest | null>;
  updateStatus(id: number, status: ReturnStatus): Promise<ReturnRequest>;
}
