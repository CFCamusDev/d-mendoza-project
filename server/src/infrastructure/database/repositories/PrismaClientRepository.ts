import prisma from '@infrastructure/database/prisma';
import { IClientRepository } from '@domain/repositories/IClientRepository';
import { Client, CreateClientDTO } from '@domain/entities/Client';

export class PrismaClientRepository implements IClientRepository {
  async findById(id: number): Promise<Client | null> {
    const record = await prisma.client.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<Client | null> {
    const record = await prisma.client.findUnique({ where: { email } });
    return record ? this.toDomain(record) : null;
  }

  async findAllWithoutUser(): Promise<Client[]> {
    const records = await prisma.client.findMany({
      where: { userId: null },
    });
    return records.map((record: any) => this.toDomain(record));
  }

  async create(data: CreateClientDTO): Promise<Client> {
    const record = await prisma.client.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        documentId: data.documentId,
      },
    });
    return this.toDomain(record);
  }

  async linkUser(clientId: number, userId: number, tx?: any): Promise<void> {
    const client = tx || prisma;
    await client.client.update({
      where: { id: clientId },
      data: { userId },
    });
  }

  private toDomain(record: {
    id: number;
    email: string;
    name: string;
    phone: string | null;
    documentId: string | null;
    userId: number | null;
    createdAt: Date;
    updatedAt: Date;
  }): Client {
    return {
      id: record.id,
      email: record.email,
      name: record.name,
      phone: record.phone,
      documentId: record.documentId,
      userId: record.userId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
