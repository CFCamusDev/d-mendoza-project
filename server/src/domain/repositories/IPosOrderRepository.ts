export interface IPosOrderRepository {
  getSalesTotalInRange(start: Date, end: Date): Promise<number>;
  getSalesByBranchInRange(start: Date, end: Date): Promise<Array<{
    branchId: number;
    totalSales: number;
  }>>;
  findPosOrdersForExport(params: { from?: Date; to?: Date }): Promise<any[]>;
}
