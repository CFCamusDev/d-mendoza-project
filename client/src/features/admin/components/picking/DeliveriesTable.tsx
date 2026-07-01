import React from 'react';
import { Delivery } from '../../types/logistics.types';
import { DeliveryDropdown } from './DeliveryDropdown';

interface DeliveriesTableProps {
  deliveries: Delivery[];
  onAssignDeliveryMan: (deliveryId: number, deliveryManId: number) => void;
  assigningId?: number | null;
}

export const DeliveriesTable: React.FC<DeliveriesTableProps> = ({
  deliveries,
  onAssignDeliveryMan,
  assigningId
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Despachos Pendientes (Picking Lists Generados)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Despacho
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Pedido
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Repartidor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Generación
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deliveries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay despachos pendientes de asignación.
                </td>
              </tr>
            ) : (
              deliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    DLV-{delivery.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    #{delivery.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      delivery.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {delivery.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <DeliveryDropdown 
                      deliveryId={delivery.id}
                      currentDeliveryManId={delivery.deliveryManId}
                      onAssign={onAssignDeliveryMan}
                      isLoading={assigningId === delivery.id}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(delivery.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
