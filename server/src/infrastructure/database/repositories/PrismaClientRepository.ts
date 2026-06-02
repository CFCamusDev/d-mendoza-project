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
        lastName: data.lastName,
        phone: data.phone,
        documentType: data.documentType,
        documentId: data.documentId,
        address: data.address,
        department: data.department,
        province: data.province,
        district: data.district,
        ubigeo: data.ubigeo,
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

  async search(query: string, skip: number, take: number): Promise<Client[]> {
    const records = await prisma.client.findMany({
      where: {
        OR: [
          { documentId: { contains: query } },
          { name: { contains: query } },
          { lastName: { contains: query } },
        ],
      },
      skip,
      take,
      orderBy: { name: 'asc' },
    });
    return records.map((r: any) => this.toDomain(r));
  }

  async countSearch(query: string): Promise<number> {
    return prisma.client.count({
      where: {
        OR: [
          { documentId: { contains: query } },
          { name: { contains: query } },
          { lastName: { contains: query } },
        ],
      },
    });
  }

  private toDomain(record: any): Client {
    return {
      id: record.id,
      email: record.email,
      name: record.name,
      lastName: record.lastName,
      phone: record.phone,
      documentType: record.documentType,
      documentId: record.documentId,
      address: record.address,
      department: record.department,
      province: record.province,
      district: record.district,
      ubigeo: record.ubigeo,
      userId: record.userId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
