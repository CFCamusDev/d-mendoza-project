import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axiosInstance from '@/shared/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { Upload, Star, X, Loader2 } from 'lucide-react';

interface SelectOption { id: number; name: string; }
interface ImagePreview { file: File; url: string; isMain: boolean; }

const schema = yup.object({
  name: yup.string().required('El nombre es obligatorio'),
  description: yup.string().nullable(),
  categoryId: yup.number().typeError('Selecciona una categoría').required(),
  brandId: yup.number().typeError('Selecciona una marca').required(),
  gender: yup.string().nullable(),
});

type FormData = yup.InferType<typeof schema>;

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [brands, setBrands] = useState<SelectOption[]>([]);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/api/v1/categories'),
      axiosInstance.get('/api/v1/brands'),
    ]).then(([cats, brnds]) => {
      setCategories(cats.data.data);
      setBrands(brnds.data.data);
    }).catch(() => toast.error('Error al cargar datos'));

    if (isEdit) {
      axiosInstance.get(`/api/v1/products/${id}`)
        .then(({ data }) => reset(data.data))
        .catch(() => toast.error('Error al cargar producto'));
    }
  }, [id, isEdit, reset]);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    Array.from(files).forEach(file => {
      if (!allowed.includes(file.type)) { toast.error(`${file.name}: solo JPEG/PNG/WEBP`); return; }
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name}: máx 5 MB`); return; }
      const url = URL.createObjectURL(file);
      setImages(prev => [...prev, { file, url, isMain: prev.length === 0 }]);
    });
  };

  const setMain = (index: number) =>
    setImages(prev => prev.map((img, i) => ({ ...img, isMain: i === index })));

  const removeImage = (index: number) =>
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some(img => img.isMain)) next[0].isMain = true;
      return next;
    });

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      let productId: number;
      if (isEdit) {
        await axiosInstance.patch(`/api/v1/products/${id}`, data);
        productId = Number(id);
        toast.success('Producto actualizado');
      } else {
        const { data: res } = await axiosInstance.post('/api/v1/products', data);
        productId = res.data.id;
        toast.success('Producto creado');
      }

      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(img => formData.append('images', img.file));
        const mainIndex = images.findIndex(img => img.isMain);
        formData.append('isMain', String(mainIndex >= 0 ? mainIndex : 0));
        await axiosInstance.post(`/api/v1/products/${productId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      navigate('/admin/products');
    } catch { toast.error('Error al guardar producto'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos básicos */}
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Información general</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input {...register('name')} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea {...register('description')} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select {...register('categoryId', { valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Seleccionar —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
              <select {...register('brandId', { valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Seleccionar —</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {errors.brandId && <p className="text-red-500 text-xs mt-1">{errors.brandId.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
            <select {...register('gender')} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Sin especificar —</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
        </div>

        {/* Imágenes */}
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Imágenes del producto</h2>

          <div
            ref={dropRef}
            onDrop={onDrop}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
          >
            <Upload size={28} className="text-gray-400" />
            <p className="text-sm text-gray-500">Arrastra imágenes aquí o <span className="text-blue-600 underline">selecciona archivos</span></p>
            <p className="text-xs text-gray-400">JPEG, PNG, WEBP — máx. 5 MB por imagen</p>
          </div>
          <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => addFiles(e.target.files)} />

          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border aspect-square">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" onClick={() => setMain(i)} title="Imagen principal"
                      className={`p-1 rounded-full ${img.isMain ? 'text-yellow-400' : 'text-white hover:text-yellow-400'}`}>
                      <Star size={18} fill={img.isMain ? 'currentColor' : 'none'} />
                    </button>
                    <button type="button" onClick={() => removeImage(i)} className="p-1 text-white hover:text-red-400">
                      <X size={18} />
                    </button>
                  </div>
                  {img.isMain && (
                    <span className="absolute top-1 left-1 bg-yellow-400 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">Principal</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 border rounded-xl py-3 text-sm hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? 'Guardando...' : isEdit ? 'Actualizar producto' : 'Crear producto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
