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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el título, la tabla y los pedidos pendientes', async () => {
    renderWithProviders(<PickingPage />);
    
    // Verifica que el título esté en pantalla
    expect(screen.getByText('Generación de Picking')).toBeInTheDocument();
    
    // El pedido de Juan Perez está hardcodeado temporalmente en el hook mock
    expect(await screen.findByText('Juan Perez')).toBeInTheDocument();
    expect(screen.getByText('Maria Lopez')).toBeInTheDocument();
  });

  it('debe deshabilitar el botón de generar si no hay selección y habilitarlo al seleccionar', async () => {
    renderWithProviders(<PickingPage />);
    
    // El botón debe estar deshabilitado inicialmente
    const btnGenerar = await screen.findByRole('button', { name: /Generar Picking List/i });
    expect(btnGenerar).toBeDisabled();

    // Seleccionar el primer checkbox del pedido
    const checkboxes = await screen.findAllByRole('checkbox');
    // El primer checkbox en la lista suele ser el de "Seleccionar todos", el segundo es el del primer item
    fireEvent.click(checkboxes[1]);

    // Ahora el botón debería estar habilitado
    expect(btnGenerar).not.toBeDisabled();
  });

  it('debe llamar al endpoint de generar picking al hacer clic en el botón', async () => {
    const mockDeliveries = [
      { id: 101, orderId: 1001, deliveryManId: null, status: 'PENDING', createdAt: '2026-07-01T10:00:00Z', pickingItems: [] }
    ];
    
    (axiosInstance.post as any).mockResolvedValueOnce({
      data: { success: true, data: mockDeliveries }
    });

    renderWithProviders(<PickingPage />);
    
    // Seleccionar todos los pedidos
    const checkboxes = await screen.findAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Click en "Seleccionar Todos"

    const btnGenerar = screen.getByRole('button', { name: /Generar Picking List/i });
    expect(btnGenerar).not.toBeDisabled();

    fireEvent.click(btnGenerar);

    // Debe mostrar loading y luego confirmar la llamada a la API
    expect(btnGenerar).toHaveTextContent('Generando...');
    
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/v1/logistics/picking');
    });

    // Validar que la tabla de despachos muestre el nuevo ID generado
    expect(await screen.findByText('DLV-101')).toBeInTheDocument();
  });

  it('debe llamar al endpoint de asignación al seleccionar un repartidor en el dropdown', async () => {
    // Primero, mockear la generación inicial para tener despachos visibles o 
    // mockear directamente la data inicial modificando el hook si fuera necesario.
    // Aquí el componente ya empieza sin Deliveries por defecto según nuestra última actualización.
    // Vamos a simular que se genera un picking primero.
    const mockDeliveries = [
      { id: 101, orderId: 1001, deliveryManId: null, status: 'PENDING', createdAt: '2026-07-01T10:00:00Z', pickingItems: [] }
    ];
    
    (axiosInstance.post as any)
      .mockResolvedValueOnce({ data: { success: true, data: mockDeliveries } }) // Para el picking
      .mockResolvedValueOnce({ data: { success: true, data: { ...mockDeliveries[0], deliveryManId: 99, status: 'ASSIGNED' } } }); // Para el assign

    renderWithProviders(<PickingPage />);
    
    // 1. Generar picking
    const checkboxes = await screen.findAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Seleccionar todos
    fireEvent.click(screen.getByRole('button', { name: /Generar Picking List/i }));
    
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
