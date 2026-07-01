import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PickingTable } from './components/picking/PickingTable';
import { OrderToPick } from './types/logistics.types';
import toast from 'react-hot-toast';
import { PackageSearch, FileText } from 'lucide-react';

// Mock data temporal para la Fase 1
const mockOrders: OrderToPick[] = [
  { id: 1, orderId: 1001, customerName: 'Juan Perez', itemsCount: 3, totalAmount: 150.0, status: 'PAID', createdAt: new Date().toISOString() },
  { id: 2, orderId: 1002, customerName: 'Maria Lopez', itemsCount: 1, totalAmount: 45.5, status: 'PAID', createdAt: new Date().toISOString() },
];

const PickingPage: React.FC = () => {
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  const handleSelectOrder = (orderId: number, isSelected: boolean) => {
    setSelectedOrders((prev) =>
      isSelected ? [...prev, orderId] : prev.filter((id) => id !== orderId)
    );
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedOrders(mockOrders.map((o) => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleGeneratePicking = () => {
    if (selectedOrders.length === 0) {
      toast.error('Debe seleccionar al menos un pedido para generar el picking list.');
      return;
    }
    // Lógica temporal para Fase 1
    toast.success(`Generando picking list para ${selectedOrders.length} pedido(s)...`);
  };

  return (
    <>
      <Helmet>
        <title>Generación de Picking | Admin D'Mendoza</title>
      </Helmet>
      
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center shrink-0">
              <PackageSearch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-brand-accent tracking-tight">Generación de Picking</h2>
              <p className="text-xs text-brand-text mt-0.5">Selecciona los pedidos listos para despachar y genera su Picking List.</p>
            </div>
          </div>

          <button
            onClick={handleGeneratePicking}
            disabled={selectedOrders.length === 0}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
              selectedOrders.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-black text-white hover:bg-gray-800 border border-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generar Picking List</span>
          </button>
        </div>

        <PickingTable
          orders={mockOrders}
          selectedOrders={selectedOrders}
          onSelectOrder={handleSelectOrder}
          onSelectAll={handleSelectAll}
        />
      </div>
    </>
  );
};

export default PickingPage;
