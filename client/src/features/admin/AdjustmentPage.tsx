import React, { useState } from 'react';
import axiosInstance from '@/shared/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { Search, Loader2, PackageCheck } from 'lucide-react';

interface VariantStock {
  variantId: number;
  sku: string;
  branchId: number;
  branchName: string;
  currentQty: number;
}

const AdjustmentPage: React.FC = () => {
  const [sku, setSku] = useState('');
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<VariantStock | null>(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim()) return;
    setSearching(true);
    setResult(null);
    try {
      const { data } = await axiosInstance.get(`/api/v1/stock/by-sku?sku=${encodeURIComponent(sku.trim())}`);
      setResult(data.data);
      setNewQuantity(String(data.data.currentQty));
    } catch {
      toast.error('Variante no encontrada para el SKU ingresado');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;

    const qty = parseFloat(newQuantity);
    if (isNaN(qty) || qty < 0) { toast.error('Cantidad inválida'); return; }
    if (reason.trim().length < 10) { toast.error('La justificación debe tener al menos 10 caracteres'); return; }

    setSubmitting(true);
    try {
      await axiosInstance.post('/api/v1/stock/adjustments', {
        variantId: result.variantId,
        branchId: result.branchId,
        newQuantity: qty,
        reason: reason.trim(),
      });
      toast.success('Ajuste registrado correctamente');
      setResult(null);
      setSku('');
      setNewQuantity('');
      setReason('');
    } catch {
      toast.error('Error al registrar el ajuste');
    } finally {
      setSubmitting(false);
    }
  };

  const delta = result ? parseFloat(newQuantity || '0') - result.currentQty : 0;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Ajuste Manual de Inventario</h1>

      {/* Búsqueda por SKU */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar variante por SKU..."
            value={sku}
            onChange={e => setSku(e.target.value)}
          />
        </div>
        <button type="submit" disabled={searching} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
          {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          Buscar
        </button>
      </form>

      {/* Resultado y formulario de ajuste */}
      {result && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-5">
          {/* Info actual */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-1">SKU</p>
              <p className="font-semibold text-gray-800">{result.sku}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-1">Sucursal</p>
              <p className="font-semibold text-gray-800">{result.branchName}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-1">Stock actual</p>
              <p className="font-semibold text-gray-800">{result.currentQty}</p>
            </div>
            <div className={`rounded-lg p-3 ${delta === 0 ? 'bg-gray-50' : delta > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-gray-500 text-xs mb-1">Diferencia</p>
              <p className={`font-semibold ${delta === 0 ? 'text-gray-800' : delta > 0 ? 'text-green-700' : 'text-red-600'}`}>
                {delta > 0 ? `+${delta}` : delta}
              </p>
            </div>
          </div>

          {/* Nueva cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva cantidad *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={newQuantity}
              onChange={e => setNewQuantity(e.target.value)}
              required
            />
          </div>

          {/* Justificación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Justificación * <span className="text-gray-400 font-normal">(mín. 10 caracteres)</span>
            </label>
            <textarea
              rows={3}
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none ${reason.length > 0 && reason.length < 10 ? 'border-red-400' : ''}`}
              placeholder="Describe el motivo del ajuste..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            />
            {reason.length > 0 && reason.length < 10 && (
              <p className="text-red-500 text-xs mt-1">{10 - reason.length} caracteres restantes</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || reason.trim().length < 10}
            className="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
            {submitting ? 'Registrando...' : 'Registrar ajuste'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AdjustmentPage;
