import React, { useState } from 'react';
import { 
  DndContext, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { Delivery, DeliveryMan } from '../../types/logistics.types';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { AssignDriverModal } from './AssignDriverModal';
import { toast } from 'react-hot-toast';

interface KanbanBoardProps {
  deliveries: Delivery[];
  deliveryMen: DeliveryMan[];
  onUpdateStatus: (deliveryId: number, status: Delivery['status']) => Promise<void>;
  onAssignDriver: (deliveryId: number, deliveryManId: number) => Promise<void>;
  onCardClick: (delivery: Delivery) => void;
}

// Columns defined exactly for the operational view
const COLUMNS: Delivery['status'][] = ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'FAILED'];

// Allowed state transitions based on DeliveryStateMachine
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'FAILED'],
  FAILED: ['RETURNED'],
  DELIVERED: [],
  CANCELLED: [],
  RETURNED: [],
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  deliveries,
  deliveryMen,
  onUpdateStatus,
  onAssignDriver,
  onCardClick
}) => {
  const [activeDragDelivery, setActiveDragDelivery] = useState<Delivery | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  
  // States for Assignment Modal when dragging to ASSIGNED
  const [pendingAssignmentId, setPendingAssignmentId] = useState<number | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // DnD sensors config
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoid accidental drags when clicking the detail button
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const delivery = active.data.current?.delivery as Delivery;
    if (delivery) {
      setActiveDragDelivery(delivery);
    }
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    setOverColumnId(over ? over.id : null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragDelivery(null);
    setOverColumnId(null);

    if (!over) return;

    const targetStatus = over.id as Delivery['status'];
    const delivery = active.data.current?.delivery as Delivery;

    if (!delivery || delivery.status === targetStatus) return;

    // Check if the state transition is valid
    const allowed = ALLOWED_TRANSITIONS[delivery.status] || [];
    if (!allowed.includes(targetStatus)) {
      toast.error(`No está permitido mover envíos de ${delivery.status} a ${targetStatus}`);
      return;
    }

    // Special behavior: Dragging to ASSIGNED requires picking a driver
    if (targetStatus === 'ASSIGNED') {
      setPendingAssignmentId(delivery.id);
      return;
    }

    // Normal transition
    try {
      await onUpdateStatus(delivery.id, targetStatus);
      toast.success(`Envío #${delivery.id} cambiado a ${targetStatus}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || `Error al cambiar estado a ${targetStatus}`);
    }
  };

  const handleConfirmAssignment = async (deliveryManId: number) => {
    if (!pendingAssignmentId) return;

    setIsAssigning(true);
    try {
      await onAssignDriver(pendingAssignmentId, deliveryManId);
      toast.success(`Repartidor asignado correctamente al envío #${pendingAssignmentId}`);
      setPendingAssignmentId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al asignar repartidor');
    } finally {
      setIsAssigning(false);
    }
  };

  // Check if a specific column is a valid drop target for the currently dragged card
  const getIsDropTargetValid = (columnStatus: string) => {
    if (!activeDragDelivery) return false;
    if (activeDragDelivery.status === columnStatus) return true; // Dropping in original column is allowed
    const allowed = ALLOWED_TRANSITIONS[activeDragDelivery.status] || [];
    return allowed.includes(columnStatus);
  };

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 items-start select-none">
        {COLUMNS.map((status) => {
          const columnDeliveries = deliveries.filter((d) => d.status === status);
          const isValidTarget = getIsDropTargetValid(status);

          return (
            <KanbanColumn
              key={status}
              status={status}
              deliveries={columnDeliveries}
              deliveryMen={deliveryMen}
              onCardClick={onCardClick}
              isDragActive={!!activeDragDelivery}
              isValidDropTarget={isValidTarget}
              isOverThisColumn={overColumnId === status}
            />
          );
        })}
      </div>

      {/* Drag Overlay to render dragging card with high fidelity */}
      <DragOverlay>
        {activeDragDelivery ? (
          <div className="rotate-3 shadow-2xl scale-105 opacity-90 transition-transform duration-200">
            <KanbanCard
              delivery={activeDragDelivery}
              deliveryMen={deliveryMen}
              onClick={() => {}}
              isOverInvalidTarget={overColumnId ? !getIsDropTargetValid(overColumnId) : false}
            />
          </div>
        ) : null}
      </DragOverlay>

      {/* Modal for driver assignment */}
      <AssignDriverModal
        isOpen={pendingAssignmentId !== null}
        onClose={() => setPendingAssignmentId(null)}
        deliveryMen={deliveryMen}
        onConfirm={handleConfirmAssignment}
        isAssigning={isAssigning}
      />
    </DndContext>
  );
};
