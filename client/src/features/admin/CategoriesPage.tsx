import React, { useEffect, useState, useMemo } from 'react';
import axiosInstance from '@/shared/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Pencil, 
  XCircle, 
  Loader2,
  FolderTree,
  Folder,
  FolderOpen,
  Sparkles,
  Tag,
  Search
} from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

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
  level: number;
  onEdit: (cat: Category) => void;
  onDeactivate: (id: number) => void;
}> = ({ cat, level, onEdit, onDeactivate }) => {
  const [open, setOpen] = useState(level < 1); // Expand first levels by default
  const hasChildren = (cat.children?.length ?? 0) > 0;

  return (
    <div className="space-y-1">
      <div 
        style={{ paddingLeft: `${level * 1.25}rem` }}
        className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
          level === 0 
            ? 'bg-white border-[#D9D9D2]/40 shadow-sm' 
            : 'bg-[#FAFAFA]/40 hover:bg-[#FAFAFA] border-transparent'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button 
            type="button"
            onClick={() => setOpen(!open)} 
            disabled={!hasChildren}
            className={`w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 disabled:opacity-30`}
          >
            {hasChildren ? (open ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
          </button>

          <div className="text-gray-400 shrink-0">
            {hasChildren 
              ? (open ? <FolderOpen className="w-4 h-4 text-[#3F3F3F]" /> : <Folder className="w-4 h-4 text-[#6B6B6B]" />) 
              : <Tag className="w-3.5 h-3.5 text-gray-400" />
            }
          </div>

          <span className={`text-sm font-bold text-[#3F3F3F] truncate ${!cat.isActive ? 'text-gray-400 line-through font-normal' : ''}`}>
            {cat.name}
          </span>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(cat)} 
            className="p-1 rounded-lg text-gray-400 hover:text-[#3F3F3F] hover:bg-gray-100 transition-colors"
            title="Editar Categoría"
          >
            <Pencil size={13} />
          </button>
          {cat.isActive && (
            <button 
              onClick={() => onDeactivate(cat.id)} 
              className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Inactivar Categoría"
            >
              <XCircle size={13} />
            </button>
          )}
        </div>
      </div>

      {open && hasChildren && (
        <div className="space-y-1.5 border-l border-[#D9D9D2]/40 ml-6 pl-2.5 my-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {cat.children!.map(child => (
            <CategoryNode 
              key={child.id} 
              cat={child} 
              level={level + 1} 
              onEdit={onEdit} 
              onDeactivate={onDeactivate} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoriesPage: React.FC = () => {
  useDocumentTitle('Gestión de Categorías');

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>({ name: '', parentId: null });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategories = async () => {
    try {
      const { data } = await axiosInstance.get('/api/v1/categories');
      setCategories(data.data);
    } catch { 
      toast.error('Error al cargar categorías'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchCategories(); 
  }, []);

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
    } catch { 
      toast.error('Error al guardar'); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm('¿Inactivar esta categoría y todas sus subcategorías descendentes?')) return;
    try {
      await axiosInstance.delete(`/api/v1/categories/${id}`);
      toast.success('Categoría inactivada');
      fetchCategories();
    } catch { 
      toast.error('Error al inactivar'); 
    }
  };

  const flat = (list: Category[]): Category[] => list.flatMap(c => [c, ...flat(c.children ?? [])]);
  
  const allFlat = useMemo(() => {
    return flat(categories);
  }, [categories]);

  // Compute visual KPIs
  const stats = useMemo(() => {
    const total = allFlat.length;
    const root = categories.length;
    const active = allFlat.filter(c => c.isActive).length;
    return { total, root, active };
  }, [categories, allFlat]);

  // Filter categories by search term
  const filteredTree = useMemo(() => {
    if (!searchTerm) return categories;
    
    const filterNode = (node: Category): Category | null => {
      const matchSelf = node.name.toLowerCase().includes(searchTerm.toLowerCase());
      const filteredChildren = node.children
        ? node.children.map(filterNode).filter((c): c is Category => c !== null)
        : [];
      
      if (matchSelf || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren
        };
      }
      return null;
    };

    return categories.map(filterNode).filter((c): c is Category => c !== null);
  }, [categories, searchTerm]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9D9D2]/40 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3F3F3F]/80 uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Módulo de Estructuración</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#3F3F3F] tracking-tight">
            Categorías de Catálogo
          </h1>
          <p className="text-sm text-[#6B6B6B] mt-1 max-w-2xl">
            Gestiona la taxonomía y jerarquización de productos para optimizar las búsquedas y ordenamientos en tienda.
          </p>
        </div>

        <button 
          onClick={openCreate} 
          className="flex items-center gap-2 bg-[#3F3F3F] hover:bg-[#3F3F3F]/90 text-white font-bold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow hover:scale-[1.01] self-start md:self-auto cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#D9D9D2]/50 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="p-3 bg-[#F7F7F5] text-[#3F3F3F] rounded-xl border border-[#D9D9D2]/30">
            <FolderTree className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Total Estructuradas</p>
            <h3 className="text-2xl font-bold text-[#3F3F3F] mt-0.5">{stats.total}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D9D9D2]/50 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="p-3 bg-[#F7F7F5] text-[#3F3F3F] rounded-xl border border-[#D9D9D2]/30">
            <Folder className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Categorías Raíz</p>
            <h3 className="text-2xl font-bold text-[#3F3F3F] mt-0.5">{stats.root}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D9D9D2]/50 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-200">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <FolderOpen className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Categorías Activas</p>
            <h3 className="text-2xl font-bold text-[#3F3F3F] mt-0.5">{stats.active}</h3>
          </div>
        </div>
      </div>

      {/* Search and tree rendering */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-[#D9D9D2]/50 max-w-md shadow-sm focus-within:ring-1 focus-within:ring-[#3F3F3F] focus-within:border-[#3F3F3F]">
          <Search className="w-5 h-5 text-[#6B6B6B]/60" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar categoría..."
            className="w-full bg-transparent border-none outline-none text-sm text-[#3F3F3F] placeholder-[#6B6B6B]/40"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#3F3F3F] animate-spin" />
            <p className="text-sm text-[#6B6B6B] mt-2">Cargando árbol jerárquico...</p>
          </div>
        ) : (
          <div className="bg-white border border-[#D9D9D2]/30 rounded-2xl p-6 shadow-sm space-y-4">
            {filteredTree.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">
                {searchTerm ? 'No se encontraron categorías con la búsqueda.' : 'No hay categorías de catálogo registradas.'}
              </p>
            ) : (
              <div className="space-y-3">
                {filteredTree.map(cat => (
                  <CategoryNode 
                    key={cat.id} 
                    cat={cat} 
                    level={0} 
                    onEdit={openEdit} 
                    onDeactivate={handleDeactivate} 
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Creation/Edition Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-[#1e1e1a]/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowModal(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#D9D9D2]/30 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-[#3F3F3F] border-b border-[#D9D9D2]/40 pb-3 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-[#6B6B6B]" />
              <span>{editing ? 'Editar Categoría' : 'Nueva Categoría'}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3F3F3F] uppercase tracking-wider mb-2">
                  Nombre de Categoría *
                </label>
                <input
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9D9D2]/70 bg-[#FAFAFA] text-sm text-[#3F3F3F] placeholder-[#6B6B6B]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F3F3F]/20 focus:border-[#3F3F3F] transition-all"
                  value={form.name}
                  placeholder="Ej. Polos Deportivos"
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#3F3F3F] uppercase tracking-wider mb-2">
                  Categoría Padre (Jerarquía)
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D9D9D2]/70 bg-[#FAFAFA] text-sm text-[#3F3F3F] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3F3F3F]/20 focus:border-[#3F3F3F] transition-all appearance-none"
                  value={form.parentId ?? ''}
                  onChange={e => setForm(f => ({ ...f, parentId: e.target.value ? Number(e.target.value) : null }))}
                >
                  <option value="">— Sin padre (Categoría Raíz) —</option>
                  {allFlat.filter(c => c.id !== editing?.id).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#D9D9D2]/30">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 border border-[#D9D9D2]/70 rounded-xl py-2.5 text-xs font-bold text-[#3F3F3F] hover:bg-[#FAFAFA] transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="flex-1 bg-[#3F3F3F] hover:bg-[#3F3F3F]/90 text-white rounded-xl py-2.5 text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{submitting ? 'Guardando...' : 'Guardar Categoría'}</span>
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
