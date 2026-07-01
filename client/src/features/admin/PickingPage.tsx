import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { PickingTable } from './components/picking/PickingTable';
import { DeliveriesTable } from './components/picking/DeliveriesTable';
import { usePicking } from './hooks/usePicking';
import { useDeliveryAssignment } from './hooks/useDeliveryAssignment';
import toast from 'react-hot-toast';
import { PackageSearch, FileText, Loader2 } from 'lucide-react';
import { Delivery } from './types/logistics.types';

const PickingPage: React.FC = () => {
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  
  const { 
    orders, 
    deliveries, 
    setDeliveries, 
    isLoading, 
    isGenerating, 
    error, 
    fetchPendingOrders, 
    generatePickingList 
  } = usePicking();

  // Load pending orders on mount
  useEffect(() => {
    fetchPendingOrders();
  }, [fetchPendingOrders]);

  const updateDeliveryState = (deliveryId: number, deliveryManId: number, status: Delivery['status']) => {
    setDeliveries((prev) => 
      prev.map(d => d.id === deliveryId ? { ...d, deliveryManId, status } : d)
    );
  };

  const { assignDeliveryMan, downloadLabel, assigningId } = useDeliveryAssignment(updateDeliveryState);

  const handleSelectOrder = (orderId: number, isSelected: boolean) => {
    setSelectedOrders((prev) =>
      isSelected ? [...prev, orderId] : prev.filter((id) => id !== orderId)
    );
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedOrders(orders.map((o) => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleGeneratePicking = async () => {
    // Si la API generará todo, la validación de selectedOrders es opcional
    // Pero según el requerimiento de la interfaz, el usuario debe seleccionar
    if (selectedOrders.length === 0) {
      toast.error('Debe seleccionar al menos un pedido para generar el picking list.');
      return;
    }
    
    await generatePickingList();
    setSelectedOrders([]);
  };

  return (
    <>
      <Helmet>
        <title>Generación de Picking | Admin D'Mendoza</title>
      </Helmet>
      
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-semibold shadow-sm">
            {error}
          </div>
        )}

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
            disabled={selectedOrders.length === 0 || isGenerating}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
              selectedOrders.length === 0 || isGenerating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-black text-white hover:bg-gray-800 border border-transparent'
            }`}
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            <span>{isGenerating ? 'Generando...' : 'Generar Picking List'}</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-brand-accent" />
          </div>
        ) : (
          <PickingTable
            orders={orders}
            selectedOrders={selectedOrders}
            onSelectOrder={handleSelectOrder}
            onSelectAll={handleSelectAll}
          />
        )}

        {deliveries.length > 0 && (
          <DeliveriesTable 
            deliveries={deliveries}
            onAssignDeliveryMan={assignDeliveryMan}
            onDownloadLabel={downloadLabel}
            assigningId={assigningId}
          />
        )}
      </div>
    </>
  );
};

export default PickingPage;
