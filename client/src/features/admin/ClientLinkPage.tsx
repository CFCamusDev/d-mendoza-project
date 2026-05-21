import React, { useEffect, useState } from 'react';
import axiosInstance from '@/shared/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { UserPlus, Users, Search, Loader2 } from 'lucide-react';
import type { Client } from './types/client';
import ConfirmModal from './components/ConfirmModal';

interface BulkReport {
  linked: number;
  skipped: number;
  errors: { id: number; error: string }[];
}

export const ClientLinkPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkingId, setLinkingId] = useState<number | null>(null);
  const [bulkLinking, setBulkLinking] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Custom Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchUnlinkedClients();
  }, []);

  const fetchUnlinkedClients = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/v1/admin/clients/unlinked');
      setClients(data.data);
    } catch (error: any) {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const executeLink = async (id: number) => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    setLinkingId(id);
    try {
      await axiosInstance.post(`/v1/admin/clients/${id}/link`);
      toast.success('Cliente vinculado exitosamente');
      fetchUnlinkedClients();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al vincular cliente');
    } finally {
      setLinkingId(null);
    }
  };

  const handleLink = (id: number) => {
    const clientName = clients.find(c => c.id === id)?.name || 'este cliente';
    setConfirmModal({
      isOpen: true,
      title: 'Vincular Cliente',
      message: `¿Estás seguro de vincular a ${clientName} y enviar sus credenciales de acceso por correo electrónico?`,
      onConfirm: () => executeLink(id),
    });
  };

  const executeBulkLink = async () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    setBulkLinking(true);
    try {
      const { data } = await axiosInstance.post('/v1/admin/clients/bulk-link', { ids: selectedIds });
      const report: BulkReport = data.data;
      
      toast.success(`Vinculación masiva completada: ${report.linked} vinculados, ${report.skipped} omitidos`);
      if (report.errors.length > 0) {
        toast.error(`${report.errors.length} errores encontrados`);
      }
      
      setSelectedIds([]);
      fetchUnlinkedClients();
    } catch (error: any) {
      toast.error('Error en el proceso masivo');
    } finally {
      setBulkLinking(false);
    }
  };

  const handleBulkLink = () => {
    if (selectedIds.length === 0) {
      toast.error('Selecciona al menos un cliente');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Vinculación Masiva',
      message: `¿Estás seguro de vincular a los ${selectedIds.length} clientes seleccionados y enviar sus credenciales de acceso?`,
      onConfirm: executeBulkLink,
    });
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredClients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredClients.map(c => c.id));
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.documentId?.includes(searchTerm)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-accent">Vinculación de Clientes POS</h1>
          <p className="text-brand-text mt-1">Gestiona la creación de cuentas e-commerce para clientes físicos.</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleBulkLink}
            disabled={bulkLinking || selectedIds.length === 0}
            className="flex items-center gap-2 bg-brand-accent hover:bg-brand-text text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow cursor-pointer font-medium"
          >
            {bulkLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
            Vincular Seleccionados ({selectedIds.length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brand-primary/20 overflow-hidden">
        <div className="p-4 border-b border-brand-primary/20 bg-brand-bg flex items-center gap-3">
          <Search className="w-5 h-5 text-brand-text/50" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o DNI..."
            className="bg-transparent border-none focus:ring-0 w-full text-brand-text placeholder-brand-text/40 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg text-brand-text/75 uppercase text-xs font-semibold tracking-wider border-b border-brand-primary/20">
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length > 0 && selectedIds.length === filteredClients.length}
                    onChange={toggleAll}
                    className="rounded border-brand-primary text-brand-accent focus:ring-brand-accent w-4 h-4"
                  />
                </th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-primary/10">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-accent" />
                    <p className="mt-2 text-brand-text">Cargando clientes...</p>
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-brand-text/80">
                    No se encontraron clientes sin cuenta activa.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-brand-bg/50 transition-colors">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(client.id)}
                        onChange={() => toggleSelection(client.id)}
                        className="rounded border-brand-primary text-brand-accent focus:ring-brand-accent w-4 h-4"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-brand-accent">{client.name}</div>
                      <div className="text-xs text-brand-text">{client.documentId || 'Sin DNI'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-brand-accent/95">{client.email}</div>
                      <div className="text-brand-text">{client.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleLink(client.id)}
                        disabled={linkingId === client.id}
                        className="inline-flex items-center gap-1.5 text-brand-accent hover:text-brand-text font-semibold disabled:opacity-50 transition-colors duration-200 cursor-pointer text-sm"
                      >
                        {linkingId === client.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        Vincular
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isLoading={linkingId !== null || bulkLinking}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default ClientLinkPage;
