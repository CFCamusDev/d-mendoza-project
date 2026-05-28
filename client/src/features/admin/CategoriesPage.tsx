import React, { useEffect, useState } from 'react';
import axiosInstance from '@/shared/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { ChevronRight, ChevronDown, Plus, Pencil, XCircle, Loader2 } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  parentId: number | null;
  isActive: boolean;
  children?: Category[];
}

interface FormState { name: string; parentId: number | null; }

const CategoryNode: React.FC<{
  cat: Category;
  onEdit: (cat: Category) => void;
  onDeactivate: (id: number) => void;
}> = ({ cat, onEdit, onDeactivate }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = (cat.children?.length ?? 0) > 0;

  return (
    <div className="ml-4">
      <div className="flex items-center gap-2 py-1 hover:bg-gray-50 rounded px-2">
        <button onClick={() => setOpen(!open)} className="w-5 text-gray-400">
          {hasChildren ? (open ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="w-[14px]" />}
        </button>
        <span className={`flex-1 text-sm ${!cat.isActive ? 'text-gray-400 line-through' : ''}`}>{cat.name}</span>
        <button onClick={() => onEdit(cat)} className="text-blue-500 hover:text-blue-700"><Pencil size={14} /></button>
        {cat.isActive && (
          <button onClick={() => onDeactivate(cat.id)} className="text-red-400 hover:text-red-600"><XCircle size={14} /></button>
        )}
      </div>
      {open && hasChildren && cat.children!.map(child => (
        <CategoryNode key={child.id} cat={child} onEdit={onEdit} onDeactivate={onDeactivate} />
      ))}
    </div>
  );
};

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>({ name: '', parentId: null });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data } = await axiosInstance.get('/api/v1/categories');
      setCategories(data.data);
    } catch { toast.error('Error al cargar categorías'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', parentId: null }); setShowModal(true); };
  const openEdit = (cat: Category) => { setEditing(cat); setForm({ name: cat.name, parentId: cat.parentId }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await axiosInstance.patch(`/api/v1/categories/${editing.id}`, form);
        toast.success('Categoría actualizada');
      } else {
        await axiosInstance.post('/api/v1/categories', form);
        toast.success('Categoría creada');
      }
      setShowModal(false);
      fetchCategories();
    } catch { toast.error('Error al guardar'); }
    finally { setSubmitting(false); }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm('¿Inactivar esta categoría?')) return;
    try {
      await axiosInstance.delete(`/api/v1/categories/${id}`);
      toast.success('Categoría inactivada');
      fetchCategories();
    } catch { toast.error('Error al inactivar'); }
  };

  const flat = (list: Category[]): Category[] => list.flatMap(c => [c, ...flat(c.children ?? [])]);
  const allFlat = flat(categories);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={16} /> Nueva categoría
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
      ) : (
        <div className="bg-white border rounded-xl p-4">
          {categories.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No hay categorías registradas</p>
          ) : (
            categories.map(cat => (
              <CategoryNode key={cat.id} cat={cat} onEdit={openEdit} onDeactivate={handleDeactivate} />
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Editar categoría' : 'Nueva categoría'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría padre (opcional)</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.parentId ?? ''}
                  onChange={e => setForm(f => ({ ...f, parentId: e.target.value ? Number(e.target.value) : null }))}
                >
                  <option value="">— Sin padre (raíz) —</option>
                  {allFlat.filter(c => c.id !== editing?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 disabled:opacity-50">
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
