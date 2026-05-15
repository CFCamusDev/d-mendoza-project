import React, { useEffect, useState } from 'react';
import axiosInstance from '@/shared/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { 
  UserPlus, 
  Search, 
  Loader2, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Plus,
  Filter,
  Building2
} from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  dni: string;
  isActive: boolean;
  branchId: number;
  userId?: number | null;
  createdAt: string;
}

interface Branch {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    branchId: '',
    roleId: ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchBranches();
    fetchRoles();
  }, [page, searchTerm]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/v1/employees', {
        params: { page, limit: 10, search: searchTerm }
      });
      setEmployees(data.data.items);
      setTotal(data.data.total);
    } catch (error) {
      toast.error('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const { data } = await axiosInstance.get('/v1/branches');
      setBranches(data.data);
    } catch (error) {}
  };

  const fetchRoles = async () => {
    try {
      const { data } = await axiosInstance.get('/v1/roles');
      setRoles(data.data);
    } catch (error) {}
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await axiosInstance.patch(`/v1/employees/${id}/status`, { isActive: !currentStatus });
      toast.success('Estado actualizado');
      fetchEmployees();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingEmployee) {
        await axiosInstance.put(`/v1/employees/${editingEmployee.id}`, {
          name: formData.name,
          branchId: parseInt(formData.branchId)
        });
        toast.success('Empleado actualizado');
      } else {
        await axiosInstance.post('/v1/employees', {
          name: formData.name,
          dni: formData.dni,
          branchId: parseInt(formData.branchId)
        });
        toast.success('Empleado creado');
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
      setFormData({ name: '', dni: '', branchId: '', roleId: '' });
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al procesar solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      dni: employee.dni,
      branchId: employee.branchId.toString(),
      roleId: ''
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Empleados</h1>
          <p className="text-slate-500 mt-1">Administra el personal de tus sucursales y sus permisos.</p>
        </div>
        
        <button
          onClick={() => {
            setEditingEmployee(null);
            setFormData({ name: '', dni: '', branchId: '', roleId: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Empleado
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o DNI..."
            className="bg-transparent border-none focus:ring-0 w-full text-slate-700 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider border-b border-slate-200">
                <th className="px-6 py-4">Empleado</th>
                <th className="px-6 py-4">DNI</th>
                <th className="px-6 py-4">Sucursal</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron empleados.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{employee.name}</div>
                      <div className="text-xs text-slate-400">ID: {employee.id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {employee.dni}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {branches.find(b => b.id === employee.branchId)?.name || 'Cargando...'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(employee.id, employee.isActive)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          employee.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {employee.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {employee.isActive ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => openEditModal(employee)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 10 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Mostrando {(page - 1) * 10 + 1} - {Math.min(page * 10, total)} de {total} empleados
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 border border-slate-300 rounded hover:bg-white disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                disabled={page * 10 >= total}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border border-slate-300 rounded hover:bg-white disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">
                {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Nombre Completo</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {!editingEmployee && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">DNI</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.dni}
                    onChange={e => setFormData({ ...formData, dni: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Sucursal</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  value={formData.branchId}
                  onChange={e => setFormData({ ...formData, branchId: e.target.value })}
                >
                  <option value="">Selecciona sucursal</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Rol asignado (opcional)</label>
                <select
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  value={formData.roleId}
                  onChange={e => setFormData({ ...formData, roleId: e.target.value })}
                >
                  <option value="">Sin rol asignado</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingEmployee ? 'Actualizar' : 'Crear Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
