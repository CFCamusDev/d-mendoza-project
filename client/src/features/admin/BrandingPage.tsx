import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '@/shared/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { Palette, Globe, Save, Loader2, Image as ImageIcon, UploadCloud } from 'lucide-react';

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

interface BrandConfig {
  brandName: string;
  faviconUrl: string | null;
  logoHorizontalUrl: string | null;
  logoVerticalUrl: string | null;
  colorBrandBg: string;
  colorBrandPrimary: string;
  colorBrandText: string;
  colorBrandAccent: string;
  socialLinksJson: Record<string, string> | null;
}

const LogoUploader = ({ 
  label, 
  url, 
  onUpload 
}: { 
  label: string; 
  url: string | null; 
  onUpload: (file: File) => Promise<void> 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se admiten imágenes');
      return;
    }
    setIsUploading(true);
    try {
      await onUpload(file);
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div 
        className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg transition-colors overflow-hidden
          ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}
          ${url ? 'h-32' : 'h-32'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {isUploading ? (
          <div className="flex flex-col items-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mb-2 text-indigo-500" />
            <span className="text-xs font-medium">Subiendo...</span>
          </div>
        ) : url ? (
          <div className="relative w-full h-full flex items-center justify-center group cursor-pointer">
            <img src={url} alt={label} className="max-w-full max-h-full object-contain" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
              <span className="text-white text-xs font-medium">Cambiar imagen</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-slate-500 cursor-pointer">
            <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
            <span className="text-sm font-medium">Clic o arrastra aquí</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const BrandingPage: React.FC = () => {
  const [config, setConfig] = useState<BrandConfig>({
    brandName: '',
    faviconUrl: null,
    logoHorizontalUrl: null,
    logoVerticalUrl: null,
    colorBrandBg: '#F7F7F5',
    colorBrandPrimary: '#D9D9D2',
    colorBrandText: '#6B6B6B',
    colorBrandAccent: '#3F3F3F',
    socialLinksJson: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data } = await axiosInstance.get('/v1/config/brand');
      if (data.success) {
        setConfig({
          ...data.data,
          socialLinksJson: {
            facebook: data.data.socialLinksJson?.facebook || '',
            instagram: data.data.socialLinksJson?.instagram || '',
            twitter: data.data.socialLinksJson?.twitter || ''
          }
        });
      }
    } catch (error: any) {
      toast.error('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.put('/v1/config/brand', config);
      toast.success('Configuración actualizada correctamente');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const updateSocialLink = (platform: string, url: string) => {
    setConfig(prev => ({
      ...prev,
      socialLinksJson: {
        ...(prev.socialLinksJson || {}),
        [platform]: url
      }
    }));
  };

  const handleLogoUpload = async (file: File, key: keyof Pick<BrandConfig, 'faviconUrl' | 'logoHorizontalUrl' | 'logoVerticalUrl'>) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await axiosInstance.post('/v1/config/brand/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        setConfig(prev => ({ ...prev, [key]: data.data.url }));
        toast.success('Logo subido correctamente');
      }
    } catch (error) {
      toast.error('Error al subir el logo');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Identidad Visual</h1>
          <p className="text-slate-500">Configura el branding, colores y redes sociales de tu plataforma.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors font-medium disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar Cambios
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECCIÓN: NOMBRES Y LOGOS */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-slate-100 pb-4">
              <ImageIcon className="w-5 h-5 text-indigo-500" />
              Marca y Logos
            </h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nombre de la Marca</label>
              <input
                type="text"
                value={config.brandName}
                onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ej. D'Mendoza"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <LogoUploader 
                label="Favicon" 
                url={config.faviconUrl} 
                onUpload={(f) => handleLogoUpload(f, 'faviconUrl')} 
              />
              <LogoUploader 
                label="Logo Horizontal" 
                url={config.logoHorizontalUrl} 
                onUpload={(f) => handleLogoUpload(f, 'logoHorizontalUrl')} 
              />
              <LogoUploader 
                label="Logo Vertical" 
                url={config.logoVerticalUrl} 
                onUpload={(f) => handleLogoUpload(f, 'logoVerticalUrl')} 
              />
            </div>
          </div>

          {/* SECCIÓN: COLORES */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-slate-100 pb-4">
              <Palette className="w-5 h-5 text-indigo-500" />
              Colores Principales
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Color de Fondo (Bg)', key: 'colorBrandBg' },
                { label: 'Color Primario', key: 'colorBrandPrimary' },
                { label: 'Color de Texto', key: 'colorBrandText' },
                { label: 'Color de Acento', key: 'colorBrandAccent' },
              ].map((colorField) => (
                <div key={colorField.key} className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">{colorField.label}</label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="color"
                      value={config[colorField.key as keyof BrandConfig] as string}
                      onChange={(e) => setConfig({ ...config, [colorField.key]: e.target.value })}
                      className="w-12 h-12 rounded cursor-pointer border-none bg-transparent p-0"
                    />
                    <input
                      type="text"
                      value={config[colorField.key as keyof BrandConfig] as string}
                      onChange={(e) => setConfig({ ...config, [colorField.key]: e.target.value })}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg outline-none uppercase font-mono text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECCIÓN: REDES SOCIALES */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-slate-100 pb-4">
              <Globe className="w-5 h-5 text-indigo-500" />
              Redes Sociales
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FacebookIcon className="text-blue-600" />
                <input
                  type="text"
                  value={config.socialLinksJson?.facebook || ''}
                  onChange={(e) => updateSocialLink('facebook', e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg outline-none"
                  placeholder="URL de Facebook"
                />
              </div>
              <div className="flex items-center gap-3">
                <InstagramIcon className="text-pink-600" />
                <input
                  type="text"
                  value={config.socialLinksJson?.instagram || ''}
                  onChange={(e) => updateSocialLink('instagram', e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg outline-none"
                  placeholder="URL de Instagram"
                />
              </div>
              <div className="flex items-center gap-3">
                <TwitterIcon className="text-sky-500" />
                <input
                  type="text"
                  value={config.socialLinksJson?.twitter || ''}
                  onChange={(e) => updateSocialLink('twitter', e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg outline-none"
                  placeholder="URL de Twitter"
                />
              </div>
            </div>
          </div>
        </div>

        {/* VISTA PREVIA (AISLADA) */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Vista Previa Ecommerce</h2>
          <div 
            className="rounded-xl border border-slate-200 shadow-lg overflow-hidden sticky top-6"
            style={{ 
              backgroundColor: config.colorBrandBg,
              color: config.colorBrandText,
            }}
          >
            {/* Header Preview */}
            <div className="h-16 flex items-center px-6 justify-between shadow-sm" style={{ backgroundColor: '#ffffff' }}>
              {config.logoHorizontalUrl ? (
                <img src={config.logoHorizontalUrl} alt="Logo" className="h-8 max-w-[120px] object-contain" />
              ) : (
                <span className="font-bold text-lg" style={{ color: config.colorBrandAccent }}>
                  {config.brandName || 'Tu Marca'}
                </span>
              )}
              <div className="flex gap-4">
                <span className="text-sm font-medium cursor-pointer hover:opacity-80">Inicio</span>
                <span className="text-sm font-medium cursor-pointer hover:opacity-80">Catálogo</span>
              </div>
            </div>
            
            {/* Body Preview */}
            <div className="p-8 space-y-6">
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-bold" style={{ color: config.colorBrandAccent }}>
                  Descubre la nueva colección
                </h3>
                <p className="text-sm opacity-80">Encuentra los mejores productos seleccionados para ti.</p>
              </div>

              {/* Fake Banner */}
              <div className="h-40 rounded-xl flex items-center justify-center border-2 border-dashed border-opacity-30 relative overflow-hidden"
                   style={{ borderColor: config.colorBrandPrimary, backgroundColor: `${config.colorBrandPrimary}20` }}>
                <ImageIcon className="w-10 h-10 opacity-30" />
              </div>
              
              {/* Fake Button */}
              <button 
                className="w-full py-3 rounded-lg font-medium shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: config.colorBrandPrimary, color: config.colorBrandBg }}
              >
                Comprar Ahora
              </button>
            </div>

            {/* Footer Preview */}
            <div className="p-6 space-y-4" style={{ backgroundColor: config.colorBrandAccent, color: config.colorBrandBg }}>
              <div className="flex justify-between items-center">
                {config.logoVerticalUrl ? (
                  <img src={config.logoVerticalUrl} alt="Logo" className="h-10 max-w-[100px] object-contain brightness-0 invert" />
                ) : (
                  <span className="font-bold">{config.brandName || 'Tu Marca'}</span>
                )}
                <div className="flex gap-4">
                  {config.socialLinksJson?.facebook && <FacebookIcon className="w-5 h-5 opacity-80 hover:opacity-100 cursor-pointer" />}
                  {config.socialLinksJson?.instagram && <InstagramIcon className="w-5 h-5 opacity-80 hover:opacity-100 cursor-pointer" />}
                  {config.socialLinksJson?.twitter && <TwitterIcon className="w-5 h-5 opacity-80 hover:opacity-100 cursor-pointer" />}
                </div>
              </div>
              <div className="text-xs opacity-60 text-center border-t pt-4" style={{ borderColor: `${config.colorBrandBg}30` }}>
                © {new Date().getFullYear()} {config.brandName || 'Tu Marca'}. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingPage;
