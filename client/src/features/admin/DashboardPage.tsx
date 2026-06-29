import React from 'react';
import { useDashboardKpis } from './hooks/useDashboardKpis';
import { KpiCard } from './components/KpiCard';
import { BranchSalesChart } from './components/BranchSalesChart';
import { CriticalStockAlertsList } from './components/CriticalStockAlertsList';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { 
  Loader2, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  LayoutDashboard 
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  useDocumentTitle('Dashboard - D\'Mendoza');
  const { kpis, loading, error, refresh } = useDashboardKpis();

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-brand-accent tracking-tight">Dashboard de Analíticas</h2>
            <p className="text-xs text-brand-text mt-0.5">Monitoreo en tiempo real de ventas, pedidos e inventario crítico.</p>
          </div>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-gray-200 hover:border-black rounded-xl text-xs font-bold text-gray-700 hover:text-black bg-white transition shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-accent' : ''}`} />
          <span>Actualizar Datos</span>
        </button>
      </div>

      {loading && !kpis ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Loader2 className="w-10 h-10 animate-spin text-brand-accent" />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-center text-red-800 text-sm font-semibold shadow-sm">
          {error}
        </div>
      ) : kpis ? (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KpiCard
              title="Ventas del Día"
              value={`S/ ${kpis.todaySales.total.toFixed(2)}`}
              icon={TrendingUp}
              breakdown={[
                { label: 'POS', value: `S/ ${kpis.todaySales.pos.toFixed(2)}` },
                { label: 'E-commerce', value: `S/ ${kpis.todaySales.ecommerce.toFixed(2)}` }
              ]}
              iconColorClass="bg-emerald-50 text-emerald-600"
            />

            <KpiCard
              title="Pedidos Pendientes"
              value={`${kpis.pendingOrdersCount} pedido${kpis.pendingOrdersCount === 1 ? '' : 's'}`}
              icon={Clock}
              breakdown={[
                { label: 'Por despachar', value: kpis.pendingOrdersCount }
              ]}
              iconColorClass="bg-blue-50 text-blue-600"
            />

            <KpiCard
              title="Stock Crítico"
              value={`${kpis.criticalStock.count} variante${kpis.criticalStock.count === 1 ? '' : 's'}`}
              icon={AlertTriangle}
              colorClass={kpis.criticalStock.count > 0 ? 'text-red-600' : 'text-gray-900'}
              iconColorClass={kpis.criticalStock.count > 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}
              breakdown={[
                { label: 'Con stock bajo', value: kpis.criticalStock.count }
              ]}
            />
          </div>

          {/* Charts & Alerts Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <BranchSalesChart data={kpis.salesByBranch} />
            </div>
            <div className="lg:col-span-2">
              <CriticalStockAlertsList products={kpis.criticalStock.products} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default DashboardPage;
