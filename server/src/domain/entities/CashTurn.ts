export type TurnStatus = 'OPEN' | 'CLOSED';

export interface CashRegister {
  id?: number;
  branchId: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CashTurn {
  id?: number;
  registerId: number;
  userId: number;
  openAmount: number;
  status: TurnStatus;
  openedAt?: Date;
  closedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}
