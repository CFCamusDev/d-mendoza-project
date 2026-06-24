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
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-[#F7F7F5] border border-[#D9D9D2]/30 flex items-center justify-center p-6">
            {selectedImage ? (
              <img 
                src={selectedImage} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain mix-blend-multiply"
              />
            ) : (
              <div className="text-gray-400">Sin imágenes</div>
            )}
            
            {/* Out of Stock visual label for resolved variant */}
            {selectedVariant && selectedVariant.outOfStock && (
              <div className="absolute top-4 left-4 bg-red-600 text-white font-bold text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm">
                Sin Stock
              </div>
            )}
          </div>

          {/* Thumbnail list */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-20 h-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all p-1 bg-white
                    ${selectedImage === img.url ? 'border-[#3F3F3F] scale-[1.03]' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={img.url} alt="thumbnail" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-[#8B6E4E] bg-[#FAF5EF] border border-[#8B6E4E]/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                {product.brand.name}
              </span>
              <span className="text-xs text-gray-400 font-mono">Cód: {product.code}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3F3F3F] tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price display */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#3F3F3F]">
                S/ {displayPrice.toFixed(2)}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-xl">
                {product.description}
              </p>
            )}

            <hr className="border-[#D9D9D2]/40" />

            {/* Variant Selectors */}
            <div className="space-y-6">
              
              {/* Talla Selector */}
              {tallas.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#3F3F3F] uppercase tracking-wider">
                      Selecciona Talla *
                    </span>
                    {product.sizeGuideUrl && (
                      <button 
                        onClick={() => setShowSizeGuide(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B6E4E] hover:text-[#5F4B35] transition-colors"
                      >
                        <Ruler size={13} />
                        <span>Ver Guía de Tallas</span>
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {tallas.map(talla => (
                      <button
                        key={talla}
                        onClick={() => {
                          setSelectedTalla(talla);
                          // Clear quantity limit check if variant changes
                          setQuantity(1);
                        }}
                        className={`min-w-[48px] px-3.5 py-2.5 text-xs font-bold rounded-xl border-2 transition-all flex items-center justify-center cursor-pointer
                          ${selectedTalla === talla 
                            ? 'border-[#3F3F3F] bg-[#3F3F3F] text-white' 
                            : 'border-[#D9D9D2] hover:border-gray-400 bg-white text-[#3F3F3F]'}`}
                      >
                        {talla}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {colores.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-[#3F3F3F] uppercase tracking-wider block">
                    Selecciona Color *
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {colores.map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          setQuantity(1);
                        }}
                        className={`px-4 py-2.5 text-xs font-bold rounded-xl border-2 transition-all flex items-center justify-center cursor-pointer
                          ${selectedColor === color 
                            ? 'border-[#3F3F3F] bg-[#3F3F3F] text-white' 
                            : 'border-[#D9D9D2] hover:border-gray-400 bg-white text-[#3F3F3F]'}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic stock and variant info */}
              {selectedVariant && (
                <div className="bg-[#F7F7F5] rounded-2xl p-4 border border-[#D9D9D2]/30 flex items-center gap-3">
                  <Info className="w-5 h-5 text-gray-500 shrink-0" />
                  <div className="text-xs text-[#3F3F3F]">
                    {selectedVariant.outOfStock ? (
                      <span className="font-bold text-red-600">Variante agotada.</span>
                    ) : (
                      <span>
                        Stock disponible para envío: <strong className="text-emerald-600 font-bold">{selectedVariant.stock} unidades</strong>.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-6 border-t border-[#D9D9D2]/40">
            {selectedVariant && !selectedVariant.outOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-[#3F3F3F] uppercase tracking-wider">Cantidad:</span>
                <div className="flex items-center border border-[#D9D9D2] rounded-xl overflow-hidden bg-white">
                  <button 
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => q - 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 font-bold text-lg cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-[#3F3F3F]">{quantity}</span>
                  <button 
                    disabled={quantity >= selectedVariant.stock}
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 font-bold text-lg cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.outOfStock}
                className={`flex-1 flex items-center justify-center gap-2 font-bold px-8 py-3.5 rounded-2xl transition-all cursor-pointer text-sm
                  ${!selectedVariant
                    ? 'bg-gray-200 text-gray-400 border border-transparent cursor-not-allowed'
                    : selectedVariant.outOfStock
                    ? 'bg-red-50 text-red-600 border border-red-200 cursor-not-allowed'
                    : 'bg-[#3F3F3F] hover:bg-[#3F3F3F]/90 text-white shadow-sm hover:shadow hover:scale-[1.01]'}`}
              >
                <ShoppingCart size={16} />
                <span>
                  {!selectedVariant 
                    ? 'Selecciona Opciones' 
                    : selectedVariant.outOfStock 
                    ? 'Sin Stock' 
                    : 'Añadir al Carrito'}
                </span>
              </button>

              <button 
                onClick={toggleWishlist}
                className={`w-full sm:w-12 h-12 flex items-center justify-center rounded-2xl border transition-all cursor-pointer
                  ${isWishlisted 
                    ? 'bg-red-50 border-red-200 text-red-500' 
                    : 'border-[#D9D9D2] hover:border-gray-400 bg-white text-gray-500 hover:text-[#3F3F3F]'}`}
              >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
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
