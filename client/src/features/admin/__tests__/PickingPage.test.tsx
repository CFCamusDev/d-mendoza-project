import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import PickingPage from '../PickingPage';
import axiosInstance from '@/shared/api/axiosInstance';
import { Toaster } from 'react-hot-toast';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock del axiosInstance
vi.mock('@/shared/api/axiosInstance', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Setup de pruebas
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <HelmetProvider>
      {ui}
      <Toaster />
    </HelmetProvider>
  );
};

describe('PickingPage', () => {
  const mockOrders = [
    { id: 1, orderId: 1001, customerName: 'Juan Perez', itemsCount: 3, totalAmount: 150.0, status: 'PAID', createdAt: '2026-07-01T10:00:00Z' },
    { id: 2, orderId: 1002, customerName: 'Maria Lopez', itemsCount: 1, totalAmount: 45.5, status: 'PAID', createdAt: '2026-07-01T10:00:00Z' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (axiosInstance.get as any).mockResolvedValue({
      data: { success: true, data: mockOrders }
    });
  });

  it('debe renderizar el título, la tabla y los pedidos pendientes', async () => {
    renderWithProviders(<PickingPage />);
    
    // Verifica que el título esté en pantalla
    expect(screen.getByText('Generación de Picking')).toBeInTheDocument();
    
    // Debería resolverse de la API simulada
    expect(await screen.findByText('Juan Perez')).toBeInTheDocument();
    expect(screen.getByText('Maria Lopez')).toBeInTheDocument();
  });

  it('debe habilitar el botón como Picking Masivo por defecto y cambiar a Picking Parcial al seleccionar', async () => {
    renderWithProviders(<PickingPage />);
    
    // El botón debe mostrar Picking Masivo inicialmente y no estar deshabilitado si hay órdenes
    const btnGenerar = await screen.findByRole('button', { name: /Generar Picking Masivo/i });
    expect(btnGenerar).not.toBeDisabled();

    // Seleccionar el primer checkbox del pedido
    const checkboxes = await screen.findAllByRole('checkbox');
    // El primer checkbox en la lista suele ser el de "Seleccionar todos", el segundo es el del primer item
    fireEvent.click(checkboxes[1]);

    // Ahora el botón debería cambiar de etiqueta reflejando la selección
    expect(await screen.findByRole('button', { name: /Generar Picking \(1 sel\.\)/i })).toBeInTheDocument();
  });

  it('debe llamar al endpoint de generar picking con IDs específicos al hacer clic en el botón con selección', async () => {
    const mockDeliveries = [
      { id: 101, orderId: 1001, deliveryManId: null, status: 'PENDING', createdAt: '2026-07-01T10:00:00Z', pickingItems: [] },
      { id: 102, orderId: 1002, deliveryManId: null, status: 'PENDING', createdAt: '2026-07-01T10:00:00Z', pickingItems: [] }
    ];
    
    (axiosInstance.post as any).mockResolvedValueOnce({
      data: { success: true, data: mockDeliveries }
    });

    renderWithProviders(<PickingPage />);
    
    // Seleccionar todos los pedidos
    const checkboxes = await screen.findAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Click en "Seleccionar Todos"

    const btnGenerar = await screen.findByRole('button', { name: /Generar Picking \(2 sel\.\)/i });
    expect(btnGenerar).not.toBeDisabled();

    fireEvent.click(btnGenerar);

    // Debe mostrar loading y luego confirmar la llamada a la API con los IDs seleccionados
    expect(btnGenerar).toHaveTextContent('Generando...');
    
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/v1/logistics/picking', { orderIds: [1, 2] });
    });

    // Validar que la tabla de despachos muestre los nuevos IDs generados
    expect(await screen.findByText('DLV-101')).toBeInTheDocument();
    expect(await screen.findByText('DLV-102')).toBeInTheDocument();
  });

  it('debe llamar al endpoint de asignación al seleccionar un repartidor en el dropdown', async () => {
    const mockDeliveries = [
      { id: 101, orderId: 1001, deliveryManId: null, status: 'PENDING', createdAt: '2026-07-01T10:00:00Z', pickingItems: [] }
    ];
    
    (axiosInstance.post as any)
      .mockResolvedValueOnce({ data: { success: true, data: mockDeliveries } }) // Para el picking
      .mockResolvedValueOnce({ data: { success: true, data: { ...mockDeliveries[0], deliveryManId: 99, status: 'ASSIGNED' } } }); // Para el assign

    renderWithProviders(<PickingPage />);
    
    // 1. Generar picking parcial de 1 orden
    const checkboxes = await screen.findAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Seleccionar primera orden (id: 1)
    
    const btnGenerar = await screen.findByRole('button', { name: /Generar Picking \(1 sel\.\)/i });
    fireEvent.click(btnGenerar);
    
    // 2. Esperar a que aparezca la tabla de Deliveries con el dropdown
    const select = await screen.findByRole('combobox');
    expect(select).toBeInTheDocument();

    // 3. Seleccionar repartidor
    fireEvent.change(select, { target: { value: '99' } });

    // 4. Verificar llamada a API
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/v1/logistics/deliveries/101/assign', { deliveryManId: 99 });
    });
  });
});

