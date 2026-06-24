import { DeliveryZone } from '../../../domain/entities/DeliveryZone';
import { IDeliveryZoneRepository } from '../../../domain/repositories/IDeliveryZoneRepository';

export interface CreateDeliveryZoneDTO {
  name: string;
  districts: string[];
  deliveryCost: number;
  estimatedDays: number;
}

export class CreateDeliveryZoneUseCase {
  constructor(private readonly deliveryZoneRepository: IDeliveryZoneRepository) {}

  async execute(dto: CreateDeliveryZoneDTO): Promise<DeliveryZone> {
    const existing = await this.deliveryZoneRepository.findByName(dto.name);
    if (existing) {
      throw new Error(`Ya existe una zona de delivery con el nombre ${dto.name}`);
    }

    return await this.deliveryZoneRepository.create(dto);
  }
}
