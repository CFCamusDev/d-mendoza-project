import React, { useEffect, useState } from 'react';
import axiosInstance from '@/shared/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { UserPlus, Users, Search, Loader2 } from 'lucide-react';

interface Client {
  id: number;
  email: string;
  name: string;
  phone?: string;
  documentId?: string;
  userId?: number | null;
}

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

  const handleLink = async (id: number) => {
    if (!confirm('¿Estás seguro de vincular este cliente y enviar credenciales?')) return;
    
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

  const handleBulkLink = async () => {
    if (selectedIds.length === 0) {
      toast.error('Selecciona al menos un cliente');
      return;
    }

    if (!confirm(`¿Estás seguro de vincular ${selectedIds.length} clientes?`)) return;

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
          <h1 className="text-3xl font-bold text-slate-900">Vinculación de Clientes POS</h1>
          <p className="text-slate-500 mt-1">Gestiona la creación de cuentas e-commerce para clientes físicos.</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleBulkLink}
            disabled={bulkLinking || selectedIds.length === 0}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bulkLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
            Vincular Seleccionados ({selectedIds.length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o DNI..."
            className="bg-transparent border-none focus:ring-0 w-full text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider border-b border-slate-200">
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length > 0 && selectedIds.length === filteredClients.length}
                    onChange={toggleAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
                    <p className="mt-2 text-slate-500">Cargando clientes...</p>
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron clientes sin cuenta activa.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(client.id)}
                        onChange={() => toggleSelection(client.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{client.name}</div>
                      <div className="text-sm text-slate-500">{client.documentId || 'Sin DNI'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-slate-700">{client.email}</div>
                      <div className="text-slate-500">{client.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleLink(client.id)}
                        disabled={linkingId === client.id}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
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
    </div>
  );
};

export default ClientLinkPage;
