import React, { useEffect, useState } from 'react';
import axiosInstance from '@/shared/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { Palette, Globe, Save, Loader2, Image as ImageIcon } from 'lucide-react';

// Componentes locales para iconos sociales para evitar dependencias faltantes
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
  logoUrl: string | null;
  primaryColor: string;
  socialLinksJson: Record<string, string> | null;
}

export const BrandingPage: React.FC = () => {
  const [config, setConfig] = useState<BrandConfig>({
    brandName: '',
    logoUrl: '',
    primaryColor: '#4F46E5',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Identidad Visual</h1>
          <p className="text-slate-500">Configura el branding y redes sociales de tu plataforma.</p>
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
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-indigo-500" />
              Apariencia General
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">URL del Logo</label>
              <input
                type="text"
                value={config.logoUrl || ''}
                onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Color Primario</label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="w-12 h-12 rounded cursor-pointer border-none"
                />
                <input
                  type="text"
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg outline-none uppercase"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
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

        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Vista Previa</h2>
          <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden sticky top-6">
            <div className="h-16 border-b border-slate-100 flex items-center px-6 justify-between" style={{ borderTop: `4px solid ${config.primaryColor}` }}>
              {config.logoUrl ? (
                <img src={config.logoUrl} alt="Logo" className="h-8 max-w-[120px] object-contain" />
              ) : (
                <span className="font-bold text-lg">{config.brandName || 'Tu Marca'}</span>
              )}
              <div className="w-8 h-8 rounded-full bg-slate-100" />
            </div>
            
            <div className="p-8 space-y-4">
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-32 bg-slate-50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-200">
                <ImageIcon className="w-8 h-8 text-slate-300" />
              </div>
              <button 
                className="w-full py-3 rounded-lg text-white font-medium shadow-sm transition-opacity"
                style={{ backgroundColor: config.primaryColor }}
              >
                Botón de Acción
              </button>
            </div>

            <div className="p-6 bg-slate-900 text-white space-y-4">
              <div className="flex gap-4">
                {config.socialLinksJson?.facebook && <FacebookIcon />}
                {config.socialLinksJson?.instagram && <InstagramIcon />}
                {config.socialLinksJson?.twitter && <TwitterIcon />}
              </div>
              <div className="text-xs opacity-50">
                © {new Date().getFullYear()} {config.brandName || 'Tu Marca'}.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingPage;
