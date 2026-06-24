export class DeliveryZone {
  constructor(
    public readonly id: number,
    public name: string,
    public districts: string[],
    public deliveryCost: number,
    public estimatedDays: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}
