import { LinkClientUseCase } from './LinkClientUseCase';

export interface BulkLinkReport {
  linked: number;
  skipped: number;
  errors: { id: number; error: string }[];
}

export class BulkLinkClientsUseCase {
  constructor(private readonly linkClientUseCase: LinkClientUseCase) {}

  async execute(clientIds: number[]): Promise<BulkLinkReport> {
    const report: BulkLinkReport = {
      linked: 0,
      skipped: 0,
      errors: [],
    };

    const results = await Promise.allSettled(
      clientIds.map((id) => this.linkClientUseCase.execute(id))
    );

    results.forEach((result, index) => {
      const clientId = clientIds[index];
      if (result.status === 'fulfilled') {
        report.linked++;
      } else {
        const error = result.reason as Error;
        if (error.message === 'El cliente ya tiene una cuenta vinculada') {
          report.skipped++;
        } else {
          report.errors.push({ id: clientId, error: error.message });
        }
      }
    });

    return report;
  }
}
