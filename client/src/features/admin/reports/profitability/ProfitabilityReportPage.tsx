import React, { useState } from 'react';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { ProfitabilityFilters } from './components/ProfitabilityFilters';
import type { GroupByOption, ProfitabilityReportResponse } from '../../types/profitability';
import { BarChart3, Download } from 'lucide-react';

export const ProfitabilityReportPage: React.FC = () => {
  useDocumentTitle('Reporte de Rentabilidad - D\'Mendoza');

  // Filtros
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [groupBy, setGroupBy] = useState<GroupByOption>('brand');
  
  // Estado local mock (Fase 1)
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ProfitabilityReportResponse['data'] | null>(null);

  const handleApplyFilters = () => {
    setLoading(true);
    // Simulación de carga para Fase 1
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleExportCsv = () => {
    // Placeholder para Fase 4
    console.log('Exporting CSV...');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Encabezado */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-brand-accent tracking-tight">
              Reporte de Rentabilidad
            </h2>
            <p className="text-xs text-brand-text mt-0.5">
              Analice la utilidad bruta y el margen porcentual de sus ventas cruzadas con el costo de inventario (Kardex).
            </p>
          </div>
        </div>
        
        <button
          onClick={handleExportCsv}
          disabled={!reportData || loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#F7F7F5] border border-gray-200 text-[#3F3F3F] text-sm font-bold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {/* Controles de Filtros */}
      <ProfitabilityFilters
        fromDate={fromDate}
        toDate={toDate}
        groupBy={groupBy}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onGroupByChange={setGroupBy}
        onApply={handleApplyFilters}
        loading={loading}
      />

      {/* Contenedor de la Tabla (Fase 2) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-center min-h-[300px]">
        {loading ? (
          <p className="text-gray-500 text-sm font-semibold">Cargando reporte...</p>
        ) : (
          <p className="text-gray-400 text-sm italic">
            Seleccione sus filtros y presione "Aplicar Filtros" para consultar la rentabilidad.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfitabilityReportPage;
