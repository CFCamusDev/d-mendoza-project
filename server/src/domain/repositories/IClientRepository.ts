import { Client, CreateClientDTO } from '@domain/entities/Client';

export interface IClientRepository {
  findById(id: number): Promise<Client | null>;
  findByEmail(email: string): Promise<Client | null>;
  findAllWithoutUser(): Promise<Client[]>;
  create(data: CreateClientDTO): Promise<Client>;
  linkUser(clientId: number, userId: number): Promise<void>;
}
