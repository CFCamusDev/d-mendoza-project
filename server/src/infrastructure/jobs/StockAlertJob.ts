import cron from 'node-cron';
import prisma from '@infrastructure/database/prisma';

export class StockAlertJob {
  public static start() {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
      console.log('⏳ [Cron Job] Running Stock Alert check...');
      try {
        await StockAlertJob.processAlerts();
        console.log('✅ [Cron Job] Stock Alert check finished.');
      } catch (error) {
        console.error('❌ [Cron Job] Error checking stock alerts:', error);
      }
    });
  }

  public static async processAlerts() {
    // Buscar el stock en todas las sucursales que sea menor al stock mínimo de la variante (y que esté activo)
    const criticalStocks = await prisma.branchStock.findMany({
      where: {
        variant: {
          isActive: true
        }
      },
      include: {
        variant: true
      }
    });

    for (const stock of criticalStocks) {
      if (stock.quantity < stock.variant.minStock) {
        // Upsert alerta de stock
        await prisma.stockAlert.upsert({
          where: {
            variantId_branchId: {
              variantId: stock.variantId,
              branchId: stock.branchId
            }
          },
          update: {
            isActive: true
          },
          create: {
            variantId: stock.variantId,
            branchId: stock.branchId,
            isActive: true
          }
        });
      } else {
        // Si la cantidad ya superó el stock mínimo, desactivamos la alerta si existe
        await prisma.stockAlert.updateMany({
          where: {
            variantId: stock.variantId,
            branchId: stock.branchId,
            isActive: true
          },
          data: {
            isActive: false
          }
        });
      }
    }
  }
}
