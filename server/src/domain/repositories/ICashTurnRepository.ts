import { CashTurn, CashRegister } from '../entities/CashTurn';

export interface CreateCashTurnDTO {
  registerId: number;
  userId: number;
  openAmount: number;
}

export interface ICashTurnRepository {
  create(data: CreateCashTurnDTO): Promise<CashTurn>;
  findActiveByUser(userId: number): Promise<CashTurn | null>;
  findActiveByRegister(registerId: number): Promise<CashTurn | null>;
  findRegisterById(registerId: number): Promise<CashRegister | null>;
}
