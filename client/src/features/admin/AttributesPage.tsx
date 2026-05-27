import React, { useEffect, useState } from 'react';
import axiosInstance from '@/shared/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, XCircle, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

interface AttributeValue { id: number; value: string; isActive: boolean; }
interface Attribute { id: number; name: string; isActive: boolean; values: AttributeValue[]; }

const AttributesPage: React.FC = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [newValueInputs, setNewValueInputs] = useState<Record<number, string>>({});
  const [showAttrModal, setShowAttrModal] = useState(false);
  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);
  const [attrName, setAttrName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetch = async () => {
    try {
      const { data } = await axiosInstance.get('/api/v1/attributes');
      setAttributes(data.data);
    } catch { toast.error('Error al cargar atributos'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const toggle = (id: number) => setExpanded(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const openCreate = () => { setEditingAttr(null); setAttrName(''); setShowAttrModal(true); };
  const openEdit = (a: Attribute) => { setEditingAttr(a); setAttrName(a.name); setShowAttrModal(true); };

  const handleSaveAttr = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAttr) {
        await axiosInstance.patch(`/api/v1/attributes/${editingAttr.id}`, { name: attrName });
        toast.success('Atributo actualizado');
      } else {
        await axiosInstance.post('/api/v1/attributes', { name: attrName });
        toast.success('Atributo creado');
      }
      setShowAttrModal(false);
      fetch();
    } catch { toast.error('Error al guardar'); }
    finally { setSubmitting(false); }
  };

  const handleDeactivateAttr = async (id: number) => {
    if (!confirm('¿Inactivar este atributo?')) return;
    try {
      await axiosInstance.delete(`/api/v1/attributes/${id}`);
      toast.success('Atributo inactivado');
      fetch();
    } catch { toast.error('Error al inactivar'); }
  };

  const handleAddValue = async (attrId: number) => {
    const val = (newValueInputs[attrId] ?? '').trim();
    if (!val) return;
    try {
      await axiosInstance.post(`/api/v1/attributes/${attrId}/values`, { value: val });
      toast.success('Valor agregado');
      setNewValueInputs(s => ({ ...s, [attrId]: '' }));
      fetch();
    } catch { toast.error('Error al agregar valor'); }
  };

  const handleDeactivateValue = async (attrId: number, valueId: number) => {
    try {
      await axiosInstance.delete(`/api/v1/attributes/${attrId}/values/${valueId}`);
      toast.success('Valor inactivado');
      fetch();
    } catch { toast.error('Error al inactivar valor'); }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Atributos de Producto</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={16} /> Nuevo atributo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
      ) : (
        <div className="space-y-2">
          {attributes.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">No hay atributos registrados</p>
          )}
          {attributes.map(attr => (
            <div key={attr.id} className="bg-white border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 cursor-pointer" onClick={() => toggle(attr.id)}>
                <span className="text-gray-400">
                  {expanded.has(attr.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
                <span className="flex-1 font-medium text-sm text-gray-800">{attr.name}</span>
                <span className="text-xs text-gray-400">{attr.values.length} valores</span>
                <button onClick={e => { e.stopPropagation(); openEdit(attr); }} className="text-blue-500 hover:text-blue-700 p-1"><Pencil size={14} /></button>
                {attr.isActive && (
                  <button onClick={e => { e.stopPropagation(); handleDeactivateAttr(attr.id); }} className="text-red-400 hover:text-red-600 p-1"><XCircle size={14} /></button>
                )}
              </div>

              {expanded.has(attr.id) && (
                <div className="border-t px-4 py-3 bg-gray-50">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {attr.values.map(v => (
                      <span key={v.id} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${v.isActive ? 'bg-white border-gray-300' : 'bg-gray-100 text-gray-400 line-through'}`}>
                        {v.value}
                        {v.isActive && (
                          <button onClick={() => handleDeactivateValue(attr.id, v.id)} className="text-red-400 hover:text-red-600">
                            <XCircle size={12} />
                          </button>
                        )}
                      </span>
                    ))}
                    {attr.values.length === 0 && <span className="text-xs text-gray-400">Sin valores</span>}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Nuevo valor (ej: XL, Rojo)..."
                      value={newValueInputs[attr.id] ?? ''}
                      onChange={e => setNewValueInputs(s => ({ ...s, [attr.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleAddValue(attr.id)}
                    />
                    <button onClick={() => handleAddValue(attr.id)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAttrModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-4">{editingAttr ? 'Editar atributo' : 'Nuevo atributo'}</h2>
            <form onSubmit={handleSaveAttr} className="space-y-4">
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nombre (ej: Talla, Color...)"
                value={attrName}
                onChange={e => setAttrName(e.target.value)}
                required
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAttrModal(false)} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">Cancelar</button>
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

export default AttributesPage;
