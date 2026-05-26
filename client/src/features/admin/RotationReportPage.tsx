import React, { useState } from 'react';
import axiosInstance from '@/shared/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { Search, Download, Loader2, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface RotationRow {
  variantId: number;
  sku: string;
  productName: string;
  branchName: string;
  unitsSold: number;
  avgStock: number;
  rotationRatio: number;
  stockDays: number | null;
  periodDays: number;
}

type SortKey = keyof RotationRow;

const RotationReportPage: React.FC = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [branchId, setBranchId] = useState('');
  const [data, setData] = useState<RotationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('rotationRatio');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) { toast.error('Selecciona el rango de fechas'); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from: new Date(from).toISOString(),
        to: new Date(to).toISOString(),
        ...(branchId ? { branchId } : {}),
      });
      const { data: res } = await axiosInstance.get(`/api/v1/reports/inventory-rotation?${params}`);
      setData(res.data);
      if (res.data.length === 0) toast('Sin movimientos en el período seleccionado', { icon: 'ℹ️' });
    } catch { toast.error('Error al cargar reporte'); }
    finally { setLoading(false); }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(false); }
  };

  const sorted = [...data].sort((a, b) => {
    const va = a[sortKey] ?? 0;
    const vb = b[sortKey] ?? 0;
    return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });

  const exportCSV = () => {
    const header = ['SKU', 'Producto', 'Sucursal', 'Vendidas', 'Stock Prom.', 'Ratio Rotación', 'Días de Stock'];
    const rows = sorted.map(r => [r.sku, r.productName, r.branchName, r.unitsSold, r.avgStock.toFixed(2), r.rotationRatio.toFixed(2), r.stockDays ?? 'N/A']);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rotacion-inventario-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <Minus size={12} className="text-gray-300" />;
    return sortAsc ? <ArrowUp size={12} className="text-blue-500" /> : <ArrowDown size={12} className="text-blue-500" />;
  };

  const Th = ({ label, k }: { label: string; k: SortKey }) => (
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100 select-none" onClick={() => handleSort(k)}>
      <span className="flex items-center gap-1">{label}<SortIcon k={k} /></span>
    </th>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reporte de Rotación de Inventario</h1>

      {/* Filtros */}
      <form onSubmit={handleSearch} className="bg-white border rounded-xl p-4 flex flex-wrap gap-4 items-end mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} required
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} required
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Sucursal (opcional)</label>
          <input type="number" placeholder="ID sucursal" value={branchId} onChange={e => setBranchId(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-32" />
        </div>
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          Consultar
        </button>
        {data.length > 0 && (
          <button type="button" onClick={exportCSV}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
            <Download size={14} /> Exportar CSV
          </button>
        )}
      </form>

      {/* Tabla */}
      {data.length > 0 && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <Th label="SKU" k="sku" />
                <Th label="Producto" k="productName" />
                <Th label="Sucursal" k="branchName" />
                <Th label="Vendidas" k="unitsSold" />
                <Th label="Stock Prom." k="avgStock" />
                <Th label="Ratio Rotación" k="rotationRatio" />
                <Th label="Días de Stock" k="stockDays" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => {
                const lowRotation = row.rotationRatio < 1;
                return (
                  <tr key={i} className={`border-b last:border-0 hover:bg-gray-50 ${lowRotation ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{row.sku}</td>
                    <td className={`px-4 py-3 font-medium ${lowRotation ? 'text-red-700' : 'text-gray-800'}`}>{row.productName}</td>
                    <td className="px-4 py-3 text-gray-600">{row.branchName}</td>
                    <td className="px-4 py-3 text-center">{row.unitsSold}</td>
                    <td className="px-4 py-3 text-center text-gray-500">{row.avgStock.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${lowRotation ? 'text-red-600' : 'text-green-600'}`}>
                        {row.rotationRatio.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {row.stockDays !== null ? `${row.stockDays}d` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RotationReportPage;
