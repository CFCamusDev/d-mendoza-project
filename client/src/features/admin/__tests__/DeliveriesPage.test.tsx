import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import DeliveriesPage from '../DeliveriesPage';
import axiosInstance from '@/shared/api/axiosInstance';
import { Toaster } from 'react-hot-toast';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock('@/shared/api/axiosInstance', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <HelmetProvider>
      {ui}
      <Toaster />
    </HelmetProvider>
  );
};

describe('DeliveriesPage', () => {
  const mockDeliveries = [
    { id: 101, orderId: 1001, deliveryManId: null, status: 'PENDING', createdAt: '2026-07-01T10:00:00Z', pickingItems: [] },
    { id: 102, orderId: 1002, deliveryManId: 99, status: 'ASSIGNED', createdAt: '2026-07-01T10:00:00Z', pickingItems: [] }
  ];

  const mockDeliveryMen = [
    { id: 101, name: 'Repartidor 1', email: 'rep1@test.com' },
    { id: 102, name: 'Repartidor 2', email: 'rep2@test.com' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (axiosInstance.get as any).mockImplementation((url: string) => {
      if (url.includes('/delivery-men')) {
        return Promise.resolve({ data: { success: true, data: mockDeliveryMen } });
      }
      return Promise.resolve({ data: { success: true, data: mockDeliveries } });
    });
  });

  it('debe renderizar el título, filtros y la tabla de despachos', async () => {
    renderWithProviders(<DeliveriesPage />);
    
    expect(screen.getByText('Control de Despachos')).toBeInTheDocument();
    
    // Deberían verse los despachos de la API
    expect(await screen.findByText('DLV-101')).toBeInTheDocument();
    expect(screen.getByText('DLV-102')).toBeInTheDocument();
  });

  it('debe filtrar despachos al cambiar el dropdown de filtros', async () => {
    renderWithProviders(<DeliveriesPage />);
    
    const filterSelect = screen.getByRole('combobox', { name: '' }); // El select de filtrar por
    fireEvent.change(filterSelect, { target: { value: 'PENDING' } });

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenLastCalledWith('/v1/logistics/deliveries', {
        params: { status: 'PENDING' }
      });
    });
  });

  it('debe llamar al endpoint de asignación al cambiar el repartidor de un despacho', async () => {
    (axiosInstance.post as any).mockResolvedValueOnce({
      data: { success: true, data: { id: 101, orderId: 1001, deliveryManId: 100, status: 'ASSIGNED', createdAt: '2026-07-01T10:00:00Z', pickingItems: [] } }
    });

    renderWithProviders(<DeliveriesPage />);

    // Esperar a que se carguen los datos y se renderice la tabla
    expect(await screen.findByText('DLV-101')).toBeInTheDocument();

    const selects = screen.getAllByRole('combobox');
    const dlvSelect = selects[1]; 
    
    fireEvent.change(dlvSelect, { target: { value: '101' } });

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/v1/logistics/deliveries/101/assign', { deliveryManId: 101 });
    });
  });

  it('debe llamar al endpoint de etiqueta al hacer clic en Descargar Etiqueta', async () => {
    (axiosInstance.get as any).mockImplementation((url: string) => {
      if (url.includes('/label')) {
        return Promise.resolve({ data: new Blob() });
      }
      if (url.includes('/delivery-men')) {
        return Promise.resolve({ data: { success: true, data: mockDeliveryMen } });
      }
      return Promise.resolve({ data: { success: true, data: mockDeliveries } });
    });

    renderWithProviders(<DeliveriesPage />);

    const downloadButtons = await screen.findAllByRole('button', { name: /Descargar Etiqueta/i });
    fireEvent.click(downloadButtons[0]);

    await waitFor(() => {
      expect(axiosInstance.get).toHaveBeenCalledWith('/v1/logistics/deliveries/101/label', {
        responseType: 'blob'
      });
    });
  });
});
