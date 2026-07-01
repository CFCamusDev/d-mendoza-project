import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { DeliveriesTable } from './components/picking/DeliveriesTable';
import { useDeliveries } from './hooks/useDeliveries';
import { useDeliveryAssignment } from './hooks/useDeliveryAssignment';
import { Truck, Loader2 } from 'lucide-react';
import type { Delivery, DeliveryMan } from './types/logistics.types';
import { logisticsService } from './services/logistics.service';

const DeliveriesPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [deliveryMen, setDeliveryMen] = useState<DeliveryMan[]>([]);
  const [isLoadingDeliveryMen, setIsLoadingDeliveryMen] = useState(false);
  
  const { 
    deliveries, 
    setDeliveries, 
    isLoading, 
    error, 
    fetchDeliveries 
  } = useDeliveries();

  // Load deliveries on mount and when filter changes
  useEffect(() => {
    fetchDeliveries(statusFilter || undefined);
  }, [fetchDeliveries, statusFilter]);

  // Load delivery men on mount
  useEffect(() => {
    const fetchDeliveryMen = async () => {
      setIsLoadingDeliveryMen(true);
      try {
        const data = await logisticsService.getDeliveryMen();
        setDeliveryMen(data);
      } catch (err) {
        console.error('Error fetching delivery men', err);
      } finally {
        setIsLoadingDeliveryMen(false);
      }
    };
    fetchDeliveryMen();
  }, []);

  const updateDeliveryState = (deliveryId: number, deliveryManId: number, status: Delivery['status']) => {
    setDeliveries((prev) => 
      prev.map(d => d.id === deliveryId ? { ...d, deliveryManId, status } : d)
    );
  };

  const { assignDeliveryMan, downloadLabel, assigningId } = useDeliveryAssignment(updateDeliveryState);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  return (
    <>
      <Helmet>
        <title>Control de Despachos | Admin D'Mendoza</title>
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
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-brand-accent tracking-tight">Control de Despachos</h2>
              <p className="text-xs text-brand-text mt-0.5">Asigna repartidores a los despachos pendientes y descarga etiquetas de envío.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500">Filtrar por:</span>
            <select
              value={statusFilter}
              onChange={handleFilterChange}
              className="block w-40 pl-3 pr-10 py-2 text-xs border border-gray-200 focus:outline-none focus:ring-black focus:border-black rounded-xl bg-white"
            >
              <option value="">Todos los estados</option>
              <option value="PENDING">Pendientes (PENDING)</option>
              <option value="ASSIGNED">Asignados (ASSIGNED)</option>
              <option value="IN_TRANSIT">En Camino (IN_TRANSIT)</option>
              <option value="DELIVERED">Entregados (DELIVERED)</option>
              <option value="CANCELLED">Cancelados (CANCELLED)</option>
            </select>
          </div>
        </div>

        {isLoading || isLoadingDeliveryMen ? (
          <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-brand-accent" />
          </div>
        ) : (
          <DeliveriesTable 
            deliveries={deliveries}
            deliveryMen={deliveryMen}
            onAssignDeliveryMan={assignDeliveryMan}
            onDownloadLabel={downloadLabel}
            assigningId={assigningId}
          />
        )}
      </div>
    </>
  );
};

export default DeliveriesPage;
