import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '@/shared/api/axiosInstance';
import {
  Heart,
  Ruler,
  ArrowLeft,
  AlertTriangle,
  ChevronRight,
  ChevronLeft
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
  model: string | null;
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

  // Gallery Carousel State
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Selector State
  const [selectedTalla, setSelectedTalla] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Gallery Image Load State
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
        const prod = data.data;
        // Find main image index or fallback
        const mainImgIndex = prod.images.findIndex((img: ProductImage) => img.isMain);
        const activeIdx = mainImgIndex >= 0 ? mainImgIndex : 0;
        setCurrentImageIndex(activeIdx);

        // Preload main image so it renders instantly when skeleton hides
        const mainImageUrl = prod.images[activeIdx]?.url;
        if (mainImageUrl) {
          const img = new window.Image();
          img.src = mainImageUrl;
          img.onload = () => {
            setProduct(prod);
            setLoading(false);
          };
          img.onerror = () => {
            setProduct(prod);
            setLoading(false);
          };
        } else {
          setProduct(prod);
          setLoading(false);
        }
      } else {
        setError('No se pudo cargar la información del producto.');
        setLoading(false);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Producto no encontrado.');
      } else {
        setError('Error de servidor al cargar el producto.');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  // Automatic Carousel effect
  useEffect(() => {
    if (!product || product.images.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [product, isHovered]);

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

  // Base price representation & selected image calculations
  const displayPrice = product ? (selectedVariant ? selectedVariant.price : (product.variants[0]?.price || 0)) : 0;
  const selectedImage = product && product.images[currentImageIndex] ? product.images[currentImageIndex].url : 'https://via.placeholder.com/600x600?text=No+Image';

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

  const handleBuyNow = async () => {
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
      toast.success('¡Producto seleccionado! Redirigiendo...');
      navigate('/checkout');
    } catch (error) {
      toast.error('Error al procesar la compra');
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product || product.images.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product || product.images.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50/50 text-neutral-800 pb-10 relative overflow-hidden font-sans">
        {/* Top Navigation Row Skeleton */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-3 pb-1 relative z-20">
          <div className="flex items-center justify-between gap-4">
            <div className="w-10 h-10 rounded-full bg-neutral-200 animate-pulse border border-neutral-100" />
            <div className="h-3 w-48 bg-neutral-200 animate-pulse rounded-md hidden sm:block" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-8 relative z-10 flex flex-col justify-between min-h-[78vh]">
          {/* Hero Section Skeleton */}
          <div className="relative flex-1 flex flex-col justify-center items-center py-2 md:py-4 my-auto lg:-mt-6">
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center z-10">

              {/* Carousel skeleton */}
              <div className="lg:col-span-8 flex items-center justify-center relative h-[280px] md:h-[350px] lg:h-[430px] w-full bg-neutral-200/40 rounded-2xl animate-pulse" />

              {/* Sidebar skeleton */}
              <div className="lg:col-span-4 space-y-5 lg:pl-6 flex flex-col justify-center bg-white/60 p-5 rounded-2xl border border-neutral-200/50 shadow-xs z-20 animate-pulse">
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-neutral-200 rounded-full" />
                  <div className="h-6 w-3/4 bg-neutral-200 rounded-md" />
                  <div className="h-2.5 w-24 bg-neutral-200 rounded-md" />
                </div>

                <div className="py-3 border-y border-neutral-100 flex items-center justify-between">
                  <div className="h-5 w-20 bg-neutral-200 rounded-md" />
                  <div className="h-3.5 w-12 bg-neutral-200 rounded-md" />
                </div>

                {/* Colors skeleton */}
                <div className="space-y-2">
                  <div className="h-2.5 w-28 bg-neutral-200 rounded-md" />
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-neutral-200" />
                    <div className="w-7 h-7 rounded-full bg-neutral-200" />
                    <div className="w-7 h-7 rounded-full bg-neutral-200" />
                  </div>
                </div>

                {/* Sizes skeleton */}
                <div className="space-y-2">
                  <div className="h-2.5 w-24 bg-neutral-200 rounded-md" />
                  <div className="flex gap-2">
                    <div className="w-9 h-8 bg-neutral-200 rounded-lg" />
                    <div className="w-9 h-8 bg-neutral-200 rounded-lg" />
                    <div className="w-9 h-8 bg-neutral-200 rounded-lg" />
                    <div className="w-9 h-8 bg-neutral-200 rounded-lg" />
                  </div>
                </div>

                {/* Action buttons skeleton */}
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <div className="w-full h-10 bg-neutral-200 rounded-lg" />
                  <div className="flex gap-2">
                    <div className="flex-1 h-9 bg-neutral-200 rounded-lg" />
                    <div className="w-12 h-9 bg-neutral-200 rounded-lg" />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Description skeleton */}
          <div className="mt-4 pt-4 border-t border-neutral-200 shrink-0 max-w-3xl animate-pulse">
            <div className="h-3 w-16 bg-neutral-200 rounded-md mb-2" />
            <div className="space-y-1.5">
              <div className="h-2.5 w-full bg-neutral-200 rounded-md" />
              <div className="h-2.5 w-5/6 bg-neutral-200 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-800">{error || 'Producto no encontrado'}</h2>
        <button
          onClick={() => navigate('/catalog')}
          className="inline-flex items-center gap-2 bg-[#3F3F3F] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#3F3F3F]/90 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Volver al catálogo</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text pb-10 animate-in fade-in duration-300 relative overflow-hidden font-sans">
      {/* Decorative Lines from the reference design */}
      <div className="absolute inset-0 pointer-events-none opacity-20 select-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 0,20 C 30,10 70,30 100,20 M 0,80 C 30,90 70,70 100,80" stroke="var(--color-brand-primary)" strokeWidth="0.2" fill="none" />
        </svg>
      </div>

      {/* Huge Background Watermark with Gradient at the body/root level */}
      <div className="fixed left-0 right-0 top-[20vh] lg:top-32 flex items-center justify-center select-none pointer-events-none z-0 overflow-hidden w-screen">
        <h1 className="max-w-[100vw] text-[12vw] lg:text-[200px] font-black uppercase tracking-tighter leading-none select-none text-center whitespace-normal break-words bg-gradient-to-r from-brand-primary/60 via-brand-accent/30 to-brand-primary/50 bg-clip-text text-transparent opacity-35">
          {product.model || ''}
        </h1>
      </div>

      {/* Top Navigation Row (Outside the main hero viewport container, closer to header) */}
      <div className="max-w-7xl mx-auto lg:px-8 pt-3 pb-1 relative z-20">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-brand-accent shadow-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-neutral-100"
            title="Regresar"
          >
            <ArrowLeft size={18} />
          </button>

          <nav className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-brand-text/60 uppercase tracking-widest">
            <button onClick={() => navigate('/')} className="hover:text-brand-accent transition-colors">Inicio</button>
            <ChevronRight size={10} />
            <button onClick={() => navigate(`/catalog?categoryId=${product.category.id}`)} className="hover:text-brand-accent transition-colors">{product.category.name}</button>
            <ChevronRight size={10} />
            <span className="text-brand-accent font-black truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto lg:px-8 pb-8 relative z-10 flex flex-col justify-between min-h-[78vh]">
        {/* Hero Section: Centered Floating Image Carousel + Huge Background Text + Side Info */}
        <div className="relative flex-1 flex flex-col justify-center items-center py-2 md:py-4 my-auto lg:-mt-6">
          {/* Core Content Grid */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 lg:gap-6 gap-0 items-center z-10">

            {/* Interactive Image Carousel Container (Takes 8 Columns) */}
            <div
              className="lg:col-span-8 flex items-center justify-center relative h-[280px] md:h-[350px] lg:h-[430px] w-full group overflow-hidden"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Previous Slide Button */}
              {product.images.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-brand-accent flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-neutral-100 opacity-0 group-hover:opacity-100 shadow-sm"
                  title="Anterior"
                >
                  <ChevronLeft size={18} />
                </button>
              )}

              {/* Next Slide Button */}
              {product.images.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-brand-accent flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-neutral-100 opacity-0 group-hover:opacity-100 shadow-sm"
                  title="Siguiente"
                >
                  <ChevronRight size={18} />
                </button>
              )}

              {/* Main Active Product Image */}
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.12)] hover:rotate-3 transition-transform duration-500 hover:scale-105 select-none"
                />

                {selectedVariant && selectedVariant.outOfStock && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    Sin Stock
                  </div>
                )}
              </div>

              {/* Slide Position Indicator Dots */}
              {product.images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-neutral-900/10 py-1.5 px-3 rounded-full backdrop-blur-xs">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-4 bg-brand-accent' : 'w-1.5 bg-neutral-300 hover:bg-neutral-400'}`}
                      title={`Ver imagen ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Meta Info & Checkout Panel (Takes 4 Columns) */}
            <div className="lg:col-span-4 space-y-4 lg:pl-6 flex flex-col justify-center bg-white/30 p-5 rounded-2xl border border-white/45 shadow-xs z-20">
              <div>
                <span className="text-[9px] font-black text-brand-accent bg-brand-primary/55 px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-1.5">
                  {product.brand.name}
                </span>
                <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight leading-none block">
                  {product.name}
                </h1>
                <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block mt-0.5">
                  CÓDIGO: {product.code}
                </span>
              </div>

              {/* Price & Category */}
              <div className="py-2 border-y border-neutral-100 flex items-center justify-between">
                <span className="text-2xl font-black text-brand-accent">
                  S/ {displayPrice.toFixed(2)}
                </span>
                <span className="text-[9px] font-bold text-neutral-400 uppercase bg-neutral-100 px-2 py-0.5 rounded-sm">
                  {product.category.name}
                </span>
              </div>

              {/* Color Selector */}
              {colores.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest block">
                    Seleccionar Color : {selectedColor}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {colores.map(color => {
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
                          className={`w-7 h-7 rounded-full transition-all flex items-center justify-center cursor-pointer relative group
                            ${selectedColor === color
                              ? 'ring-2 ring-brand-accent ring-offset-2 scale-110'
                              : 'ring-1 ring-slate-200 hover:scale-105'}`}
                          style={{ backgroundColor: hex }}
                          title={color}
                        >
                          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]"></div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {tallas.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">
                      Seleccionar Talla
                    </span>
                    {product.sizeGuideUrl && (
                      <button
                        onClick={() => setShowSizeGuide(true)}
                        className="inline-flex items-center gap-1.5 text-[9px] font-bold text-slate-400 hover:text-brand-accent transition-colors underline underline-offset-4"
                      >
                        <Ruler size={10} />
                        <span>Guía</span>
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tallas.map(talla => (
                      <button
                        key={talla}
                        onClick={() => {
                          setSelectedTalla(talla);
                          setQuantity(1);
                        }}
                        className={`min-w-[2.5rem] h-9 px-2 text-[10px] font-bold rounded-lg border transition-all flex items-center justify-center cursor-pointer
                          ${selectedTalla === talla
                            ? 'border-brand-accent bg-brand-accent text-white shadow-sm'
                            : 'border-neutral-200 hover:border-brand-accent bg-white text-neutral-700'}`}
                      >
                        {talla}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              {selectedVariant && !selectedVariant.outOfStock && (
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-brand-text uppercase tracking-widest">Cantidad:</span>
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
                    <button
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(q => q - 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-slate-50 text-slate-500 disabled:opacity-30 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="w-7 text-center text-[11px] font-black text-slate-800">{quantity}</span>
                    <button
                      disabled={quantity >= selectedVariant.stock}
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-slate-50 text-slate-500 disabled:opacity-30 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Checkout Action Buttons */}
              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.outOfStock}
                  className={`w-full font-bold py-2.5 px-4 rounded-lg transition-all cursor-pointer text-[10px] tracking-widest uppercase border border-transparent shadow-sm
                    ${!selectedVariant
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : selectedVariant.outOfStock
                        ? 'bg-red-50 text-red-600 border-red-200 cursor-not-allowed'
                        : 'bg-brand-accent text-brand-bg hover:opacity-90'}`}
                >
                  Añadir al Carrito
                </button>

                <div className="flex gap-2 w-full">
                  <button
                    onClick={handleBuyNow}
                    disabled={!selectedVariant || selectedVariant.outOfStock}
                    className={`flex-1 font-bold py-2.5 px-4 rounded-lg transition-all cursor-pointer text-[10px] tracking-widest uppercase border border-brand-accent text-brand-accent bg-transparent hover:bg-brand-accent hover:text-white
                      ${(!selectedVariant || selectedVariant.outOfStock) ? 'hidden' : ''}`}
                  >
                    Comprar Ahora
                  </button>

                  <button
                    onClick={toggleWishlist}
                    className={`w-12 h-[38px] flex items-center justify-center rounded-lg border transition-all cursor-pointer shadow-xs
                      ${isWishlisted
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-400'} ${(!selectedVariant || selectedVariant.outOfStock) ? 'w-full' : ''}`}
                  >
                    <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel: Description (Footer) */}
        {product.description && (
          <div className="mt-4 pt-4 border-t border-brand-primary/20 shrink-0 max-w-3xl">
            <span className="text-[10px] font-black text-brand-text uppercase tracking-widest block mb-1">
              Inspiración :
            </span>
            <p className="text-[11px] text-brand-text/80 leading-relaxed font-medium">
              {product.description}
            </p>
          </div>
        )}
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
