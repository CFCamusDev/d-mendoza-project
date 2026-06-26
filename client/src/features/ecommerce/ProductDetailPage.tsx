import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '@/shared/api/axiosInstance';
import { 
  Heart, 
  ShoppingCart, 
  Ruler, 
  ArrowLeft, 
  Loader2, 
  AlertTriangle,
  ChevronRight,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useCart } from './hooks/useCart';

interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
}

interface Variant {
  id: number;
  sku: string;
  price: number;
  attributesJson: Record<string, string>;
  isActive: boolean;
  stock: number;
  outOfStock: boolean;
}

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface ProductDetail {
  id: number;
  code: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: number;
  brandId: number;
  gender: string | null;
  category: Category;
  brand: Brand;
  images: ProductImage[];
  variants: Variant[];
  sizeGuideUrl: string | null;
}

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery State
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Selector State
  const [selectedTalla, setSelectedTalla] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Modal State
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useDocumentTitle(product ? product.name : 'Detalle de Producto');

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosInstance.get(`/v1/ecommerce/products/${slug}`);
      if (data.success && data.data) {
        setProduct(data.data);
        // Find main image or fallback
        const mainImg = data.data.images.find((img: ProductImage) => img.isMain) || data.data.images[0];
        if (mainImg) {
          setSelectedImage(mainImg.url);
        }
      } else {
        setError('No se pudo cargar la información del producto.');
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Producto no encontrado.');
      } else {
        setError('Error de servidor al cargar el producto.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  // Extract unique attributes
  const { tallas, colores } = useMemo(() => {
    if (!product) return { tallas: [], colores: [] };
    const tallasSet = new Set<string>();
    const coloresSet = new Set<string>();

    product.variants.forEach(variant => {
      if (variant.isActive) {
        if (variant.attributesJson.talla) tallasSet.add(variant.attributesJson.talla);
        if (variant.attributesJson.color) coloresSet.add(variant.attributesJson.color);
      }
    });

    return {
      tallas: Array.from(tallasSet),
      colores: Array.from(coloresSet)
    };
  }, [product]);

  // Determine current active variant
  const selectedVariant = useMemo(() => {
    if (!product || !selectedTalla || !selectedColor) return null;
    return product.variants.find(variant => 
      variant.isActive &&
      variant.attributesJson.talla?.toUpperCase() === selectedTalla.toUpperCase() &&
      variant.attributesJson.color?.toUpperCase() === selectedColor.toUpperCase()
    ) || null;
  }, [product, selectedTalla, selectedColor]);

  // Handle wishlist toggle
  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(!isWishlisted ? 'Agregado a favoritos' : 'Eliminado de favoritos');
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Por favor selecciona talla y color.');
      return;
    }
    if (selectedVariant.outOfStock) {
      toast.error('Esta variante no tiene stock disponible.');
      return;
    }
    
    try {
      await addItem(selectedVariant.id, quantity);
      toast.success(`¡Agregado al carrito! ${product?.name} (${selectedTalla}/${selectedColor}) x${quantity}`);
    } catch (error) {
      toast.error('Error al agregar al carrito');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#3F3F3F] animate-spin" />
        <p className="text-sm text-[#6B6B6B] mt-2 font-medium">Cargando detalles de producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-800">{error || 'Producto no encontrado'}</h2>
        <button 
          onClick={() => navigate('/search')} 
          className="inline-flex items-center gap-2 bg-[#3F3F3F] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#3F3F3F]/90 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Volver a la búsqueda</span>
        </button>
      </div>
    );
  }

  // Base price representation
  const displayPrice = selectedVariant ? selectedVariant.price : (product.variants[0]?.price || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-8">
        <button onClick={() => navigate('/')} className="hover:text-[#3F3F3F] transition-colors">Inicio</button>
        <ChevronRight size={12} className="text-gray-300" />
        <button onClick={() => navigate(`/search?category=${product.category.id}`)} className="hover:text-[#3F3F3F] transition-colors">{product.category.name}</button>
        <ChevronRight size={12} className="text-gray-300" />
        <span className="text-[#3F3F3F] font-bold truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        
        {/* Product Images Column */}
        <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
          {/* Thumbnail list (Vertical on Desktop, Horizontal on Mobile) */}
          {product.images.length > 1 && (
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[700px] pb-2 lg:pb-0 lg:pr-2 custom-scrollbar shrink-0">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-20 h-24 lg:w-24 lg:h-32 shrink-0 overflow-hidden rounded-2xl border-2 transition-all p-1 bg-white
                    ${selectedImage === img.url ? 'border-brand-accent scale-[1.02] shadow-md' : 'border-transparent hover:border-slate-300'}`}
                >
                  <img src={img.url} alt="thumbnail" className="w-full h-full object-cover rounded-xl" />
                </button>
              ))}
            </div>
          )}

          {/* Main Image with Zoom */}
          <div className="relative flex-1 aspect-[4/5] overflow-hidden rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center group cursor-zoom-in">
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-150 origin-center"
                onMouseMove={(e) => {
                  const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - left) / width) * 100;
                  const y = ((e.clientY - top) / height) * 100;
                  e.currentTarget.style.transformOrigin = `${x}% ${y}%`;
                }}
              />
            ) : (
              <div className="text-slate-400 font-semibold text-sm">Sin imágenes</div>
            )}
            
            {selectedVariant && selectedVariant.outOfStock && (
              <div className="absolute top-6 left-6 bg-red-600/95 backdrop-blur text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
                Sin Stock
              </div>
            )}
          </div>
        </div>

        {/* Product Details Column */}
        <div className="flex flex-col space-y-8 lg:px-8 py-4">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">
                {product.brand.name}
              </span>
              <span className="text-xs text-slate-400 font-semibold tracking-wider">Cód: {product.code}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
              {product.name}
            </h1>

            {/* Price display */}
            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-3xl font-black text-brand-accent">
                S/ {displayPrice.toFixed(2)}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-slate-500 leading-relaxed pt-2">
                {product.description}
              </p>
            )}

            <div className="h-px w-full bg-slate-100 my-6"></div>

            {/* Variant Selectors */}
            <div className="space-y-8">
              
              {/* Color Selector */}
              {colores.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                      Color
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {selectedColor ? `— ${selectedColor}` : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colores.map(color => {
                      // Fallback hex codes for basic colors
                      const COLOR_MAP: Record<string, string> = {
                        'NEGRO': '#000000', 'BLANCO': '#FFFFFF', 'ROJO': '#FF0000', 'AZUL': '#0000FF',
                        'VERDE': '#00FF00', 'AMARILLO': '#FFFF00', 'GRIS': '#808080', 'BEIGE': '#F5F5DC',
                        'MARRON': '#8B4513', 'ROSA': '#FFC0CB', 'MORADO': '#800080', 'NARANJA': '#FFA500'
                      };
                      const hex = COLOR_MAP[color.toUpperCase()] || '#E2E8F0';
                      
                      return (
                        <button
                          key={color}
                          onClick={() => {
                            setSelectedColor(color);
                            setQuantity(1);
                          }}
                          className={`w-10 h-10 rounded-full transition-all flex items-center justify-center cursor-pointer relative group
                            ${selectedColor === color 
                              ? 'ring-2 ring-brand-accent ring-offset-2 scale-110' 
                              : 'ring-1 ring-slate-200 hover:scale-105'}`}
                          style={{ backgroundColor: hex }}
                          title={color}
                        >
                          {/* Inner shadow to make white colors visible */}
                          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"></div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Talla Selector */}
              {tallas.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                      Talla
                    </span>
                    {product.sizeGuideUrl && (
                      <button 
                        onClick={() => setShowSizeGuide(true)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-brand-accent transition-colors underline underline-offset-4"
                      >
                        <Ruler size={14} />
                        <span>Guía de Tallas</span>
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {tallas.map(talla => (
                      <button
                        key={talla}
                        onClick={() => {
                          setSelectedTalla(talla);
                          setQuantity(1);
                        }}
                        className={`min-w-[3rem] h-12 px-4 text-xs font-bold rounded-2xl border-2 transition-all flex items-center justify-center cursor-pointer
                          ${selectedTalla === talla 
                            ? 'border-brand-accent bg-brand-accent text-white shadow-md shadow-brand-accent/20' 
                            : 'border-slate-200 hover:border-slate-400 bg-white text-slate-700 hover:text-slate-900'}`}
                      >
                        {talla}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic stock and variant info */}
              {selectedVariant && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-start gap-3">
                  <Info className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600 leading-relaxed">
                    {selectedVariant.outOfStock ? (
                      <span className="font-bold text-red-500">Esta combinación está actualmente agotada.</span>
                    ) : (
                      <span>
                        ¡Excelente elección! Tenemos <strong className="text-emerald-600 font-black">{selectedVariant.stock} unidades</strong> disponibles para envío inmediato.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-6 pt-8 border-t border-slate-100">
            {selectedVariant && !selectedVariant.outOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Cantidad</span>
                <div className="flex items-center border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <button 
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => q - 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 text-slate-500 disabled:opacity-30 font-bold text-lg cursor-pointer transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-black text-slate-800">{quantity}</span>
                  <button 
                    disabled={quantity >= selectedVariant.stock}
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 text-slate-500 disabled:opacity-30 font-bold text-lg cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.outOfStock}
                className={`flex-1 flex items-center justify-center gap-3 font-bold px-8 py-4 rounded-2xl transition-all cursor-pointer text-sm
                  ${!selectedVariant
                    ? 'bg-slate-100 text-slate-400 border border-transparent cursor-not-allowed'
                    : selectedVariant.outOfStock
                    ? 'bg-red-50 text-red-600 border border-red-200 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-black text-white shadow-xl hover:shadow-2xl hover:-translate-y-1'}`}
              >
                <ShoppingCart size={18} />
                <span className="tracking-wide uppercase text-xs font-black">
                  {!selectedVariant 
                    ? 'Selecciona Opciones' 
                    : selectedVariant.outOfStock 
                    ? 'Sin Stock' 
                    : 'Añadir al Carrito'}
                </span>
              </button>

              <button 
                onClick={toggleWishlist}
                className={`w-full sm:w-16 h-[52px] sm:h-auto flex items-center justify-center rounded-2xl border-2 transition-all cursor-pointer shadow-sm
                  ${isWishlisted 
                    ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' 
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-400 hover:text-slate-600'}`}
                title="Añadir a Favoritos"
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} className={isWishlisted ? 'scale-110' : ''} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Size Guide Modal Overlay */}
      {showSizeGuide && product.sizeGuideUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-[#1e1e1a]/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowSizeGuide(false)} 
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-[#D9D9D2]/30 space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#D9D9D2]/40 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Ruler className="text-[#8B6E4E]" size={20} />
                <h3 className="text-lg font-bold text-[#3F3F3F]">Guía de Tallas</h3>
              </div>
              <button 
                onClick={() => setShowSizeGuide(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-sm font-bold p-1 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-[#F7F7F5] rounded-2xl border border-[#D9D9D2]/20">
              <img 
                src={product.sizeGuideUrl} 
                alt="Medidas y Guía de Tallas" 
                className="max-w-full max-h-[60vh] object-contain rounded-lg" 
              />
            </div>
            
            <div className="pt-2 text-center text-xs text-gray-400 shrink-0">
              * Las medidas pueden variar ligeramente dependiendo del corte de la prenda.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
