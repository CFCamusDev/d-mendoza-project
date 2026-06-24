import { DeliveryZone } from '../../../domain/entities/DeliveryZone';
import { IDeliveryZoneRepository } from '../../../domain/repositories/IDeliveryZoneRepository';

export interface UpdateDeliveryZoneDTO {
  name?: string;
  districts?: string[];
  deliveryCost?: number;
  estimatedDays?: number;
}

export class UpdateDeliveryZoneUseCase {
  constructor(private readonly deliveryZoneRepository: IDeliveryZoneRepository) {}

  async execute(id: number, dto: UpdateDeliveryZoneDTO): Promise<DeliveryZone> {
    const existing = await this.deliveryZoneRepository.findById(id);
    if (!existing) {
      throw new Error(`Zona de delivery con id ${id} no encontrada`);
    }

    if (dto.name && dto.name !== existing.name) {
      const nameConflict = await this.deliveryZoneRepository.findByName(dto.name);
      if (nameConflict) {
        throw new Error(`Ya existe una zona de delivery con el nombre ${dto.name}`);
      }
    }

    return await this.deliveryZoneRepository.update(id, dto);
  }
}
