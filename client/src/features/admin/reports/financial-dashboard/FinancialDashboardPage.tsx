import React, { useState } from 'react';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { DashboardFilters } from './components/DashboardFilters';
import { KpiCards } from './components/KpiCards';
import { Landmark } from 'lucide-react';
import type { FinancialDashboardSummary } from '../../types/financial-dashboard';

export const FinancialDashboardPage: React.FC = () => {
  useDocumentTitle('Dashboard Financiero - D\'Mendoza');

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data for Fase 1
  const mockSummary: FinancialDashboardSummary = {
    currentPeriod: {
      totalRevenue: 25000.00,
      posRevenue: 18000.00,
      ecommerceRevenue: 7000.00,
      revenueByBranch: [
        { branchId: 1, branchName: 'Sede Principal', total: 18000.00 },
        { branchId: null, branchName: 'Venta Online', total: 7000.00 }
      ]
    },
    previousPeriod: {
      totalRevenue: 20000.00,
      posRevenue: 15000.00,
      ecommerceRevenue: 5000.00,
      revenueByBranch: [
        { branchId: 1, branchName: 'Sede Principal', total: 15000.00 },
        { branchId: null, branchName: 'Venta Online', total: 5000.00 }
      ]
    },
    comparison: {
      revenueDifference: 5000.00,
      revenuePercentageChange: 25.00
    }
  };

  const handleApplyFilters = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-brand-accent tracking-tight">
              Dashboard Financiero Consolidado
            </h2>
            <p className="text-xs text-brand-text mt-0.5">
              Consolidación de ingresos del canal POS y E-commerce, comparativas y desglose por sucursal.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <DashboardFilters
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onApply={handleApplyFilters}
        loading={loading}
      />

      {/* KPI Cards */}
      <KpiCards summary={mockSummary} />
    </div>
  );
};
