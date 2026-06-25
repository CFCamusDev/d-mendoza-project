import React, { useState, useEffect } from 'react';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useCart } from './hooks/useCart';
import { ShoppingCart, MapPin, CreditCard, CheckCircle, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/shared/api/axiosInstance';

export const CheckoutPage = () => {
  useDocumentTitle('Checkout - Envío y Pago');
  const { cart, isLoading } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supportedLocations, setSupportedLocations] = useState<any[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [deliveryCost, setDeliveryCost] = useState<number | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axiosInstance.get('/v1/delivery-zones/locations/supported');
        setSupportedLocations(res.data.departments);
      } catch (error) {
        console.error('Error fetching supported locations:', error);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchLocations();
  }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentId: '',
    department: '',
    city: '',
    district: '',
    address: '',
    reference: '',
  });

  const departments = supportedLocations || [];
  const selectedDept = departments.find((d: any) => d.name === formData.department) as any;
  const provinces = selectedDept ? selectedDept.provinces : [];
  
  const selectedProv = provinces.find((p: any) => p.name === formData.city) as any;
  const districts = selectedProv ? selectedProv.districts : [];

  useEffect(() => {
    if (formData.district && districts.length > 0) {
      const distData = districts.find((d: any) => d.name === formData.district);
      if (distData) {
        setDeliveryCost(Number(distData.cost));
      } else {
        setDeliveryCost(null);
      }
    } else {
      setDeliveryCost(null);
    }
  }, [formData.district, districts]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Aquí iría la lógica de procesar la orden o ir a pasarela de pago
    try {
      // Simulación de delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('¡Orden generada con éxito!');
      // TODO: Limpiar carrito y redirigir a confirmación
      navigate('/');
    } catch (error) {
      toast.error('Ocurrió un error al procesar la orden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || loadingLocations) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-accent" />
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] pt-24 px-4 flex flex-col items-center justify-center text-center">
        <ShoppingCart className="w-20 h-20 text-gray-300 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Aún no has agregado productos a tu carrito. Explora nuestras colecciones y encuentra lo que buscas.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-brand-accent text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all"
        >
          Ir a comprar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Stepper visual */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-8 text-sm md:text-base font-medium text-gray-500">
          <span className="flex items-center gap-2 cursor-pointer hover:text-brand-accent" onClick={() => navigate('/cart')}>
            <ShoppingCart size={18} /> Carrito
          </span>
          <ChevronRight size={16} />
          <span className="flex items-center gap-2 text-brand-accent font-bold">
            <MapPin size={18} /> Envío
          </span>
          <ChevronRight size={16} />
          <span className="flex items-center gap-2 opacity-50">
            <CreditCard size={18} /> Pago
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Formulario de Envío */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Detalles de Facturación y Envío</h2>
            
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Información Personal */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition" placeholder="Juan" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition" placeholder="Pérez" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition" placeholder="juan@correo.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Móvil *</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition" placeholder="987654321" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">DNI / CE *</label>
                    <input required type="text" name="documentId" value={formData.documentId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition" placeholder="Documento de Identidad" />
                  </div>
                </div>
              </div>

              {/* Información de Envío */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Dirección de Envío</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departamento *</label>
                    <select required name="department" value={formData.department} onChange={(e) => {
                      setFormData({ ...formData, department: e.target.value, city: '', district: '' });
                    }} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition bg-white">
                      <option value="">Seleccionar...</option>
                      {departments.map((d: any) => (
                        <option key={d.name} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provincia *</label>
                    <select required name="city" value={formData.city} onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value, district: '' });
                    }} disabled={!formData.department} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition bg-white disabled:bg-gray-100 disabled:opacity-70">
                      <option value="">Seleccionar...</option>
                      {provinces.map((p: any) => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Distrito *</label>
                    <select required name="district" value={formData.district} onChange={handleChange} disabled={!formData.city} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition bg-white disabled:bg-gray-100 disabled:opacity-70">
                      <option value="">Seleccionar...</option>
                      {districts.map((d: any) => (
                        <option key={d.name} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Exacta (Calle, Nro) *</label>
                    <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition" placeholder="Av. Principal 123, Dpto 4" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Referencia (Opcional)</label>
                    <input type="text" name="reference" value={formData.reference} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none transition" placeholder="Frente al parque, casa blanca" />
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* Resumen de la Orden */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen de tu Orden</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative">
                      <img
                        src={item.variant.product.images.find(i => i.isMain)?.url || 'https://via.placeholder.com/150'}
                        alt={item.variant.product.name}
                        className="w-16 h-16 object-cover rounded-lg border bg-gray-50"
                      />
                      <span className="absolute -top-2 -right-2 bg-brand-accent text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold shadow-sm">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 flex justify-between">
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{item.variant.product.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.variant.attributesJson?.talla && `Talla: ${item.variant.attributesJson.talla}`}
                          {item.variant.attributesJson?.color && ` • Color: ${item.variant.attributesJson.color}`}
                        </p>
                      </div>
                      <div className="text-right pl-4">
                        <p className="font-bold text-sm text-gray-900">S/ {Number(item.variant.finalPrice * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">S/ {cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío estimado</span>
                  <span className="font-medium text-gray-900">
                    {deliveryCost !== null ? `S/ ${deliveryCost.toFixed(2)}` : 'Por calcular'}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mb-8">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-black text-brand-accent text-xl">
                    S/ {(cart.subtotal + (deliveryCost || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || deliveryCost === null}
                className="w-full flex items-center justify-center gap-2 bg-brand-accent text-white px-6 py-4 rounded-xl font-bold hover:bg-black transition-all shadow-md hover:shadow-lg disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Continuar al Pago
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                Pagos 100% Seguros
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
