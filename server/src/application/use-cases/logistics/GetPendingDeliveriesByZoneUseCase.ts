import { IDeliveryRepository } from '@domain/repositories/IDeliveryRepository';
import { IDeliveryZoneRepository } from '@domain/repositories/IDeliveryZoneRepository';

export class GetPendingDeliveriesByZoneUseCase {
  constructor(
    private readonly deliveryRepository: IDeliveryRepository,
    private readonly deliveryZoneRepository: IDeliveryZoneRepository
  ) {}

  async execute(): Promise<any[]> {
    const deliveries = await this.deliveryRepository.findDeliveries('PENDING');
    const zones = await this.deliveryZoneRepository.findAll();

    // Group deliveries by zone
    const grouped = zones.map((zone: any) => ({
      zone,
      deliveries: deliveries.filter((delivery: any) => {
        // Implement the logic to match delivery to zone, for now mock
        return true; 
      })
    }));

    return grouped;
  }
}
