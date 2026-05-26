import React, { useEffect, useRef, useState } from 'react';
import axiosInstance from '@/shared/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, XCircle, Loader2, Upload, ImageOff } from 'lucide-react';

interface Brand { id: number; name: string; logoUrl: string | null; isActive: boolean; }
interface FormState { name: string; logoUrl: string; }

const BrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState<FormState>({ name: '', logoUrl: '' });
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchBrands = async () => {
    try {
      const { data } = await axiosInstance.get('/api/v1/brands');
      setBrands(data.data);
    } catch { toast.error('Error al cargar marcas'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBrands(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', logoUrl: '' }); setPreview(null); setShowModal(true); };
  const openEdit = (b: Brand) => { setEditing(b); setForm({ name: b.name, logoUrl: b.logoUrl ?? '' }); setPreview(b.logoUrl); setShowModal(true); };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { toast.error('Solo JPEG, PNG o WEBP'); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setForm(f => ({ ...f, logoUrl: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { name: form.name, logoUrl: form.logoUrl || null };
      if (editing) {
        await axiosInstance.patch(`/api/v1/brands/${editing.id}`, payload);
        toast.success('Marca actualizada');
      } else {
        await axiosInstance.post('/api/v1/brands', payload);
        toast.success('Marca creada');
      }
      setShowModal(false);
      fetchBrands();
    } catch { toast.error('Error al guardar'); }
    finally { setSubmitting(false); }
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm('¿Inactivar esta marca?')) return;
    try {
      await axiosInstance.delete(`/api/v1/brands/${id}`);
      toast.success('Marca inactivada');
      fetchBrands();
    } catch { toast.error('Error al inactivar'); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Marcas</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={16} /> Nueva marca
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Logo</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {brands.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No hay marcas registradas</td></tr>
              ) : brands.map(b => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {b.logoUrl ? (
                      <img src={b.logoUrl} alt={b.name} className="w-10 h-10 object-contain rounded border" />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded border text-gray-300">
                        <ImageOff size={18} />
                      </div>
                    )}
                  </td>
                  <td className={`px-4 py-3 font-medium ${!b.isActive ? 'text-gray-400 line-through' : ''}`}>{b.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                    <button onClick={() => openEdit(b)} className="text-blue-500 hover:text-blue-700"><Pencil size={16} /></button>
                    {b.isActive && <button onClick={() => handleDeactivate(b.id)} className="text-red-400 hover:text-red-600"><XCircle size={16} /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Editar marca' : 'Nueva marca'}</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50"
                >
                  {preview ? (
                    <img src={preview} alt="preview" className="h-20 object-contain" />
                  ) : (
                    <>
                      <Upload size={24} className="text-gray-400" />
                      <span className="text-xs text-gray-400">Click para subir logo (JPEG/PNG/WEBP)</span>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
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

export default BrandsPage;
