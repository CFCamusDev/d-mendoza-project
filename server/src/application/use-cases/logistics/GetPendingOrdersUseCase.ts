import { IDeliveryRepository } from '@domain/repositories/IDeliveryRepository';

export class GetPendingOrdersUseCase {
  constructor(private readonly deliveryRepository: IDeliveryRepository) {}

  async execute(): Promise<any[]> {
    return await this.deliveryRepository.findPaidOrdersWithoutDelivery();
  }
}
