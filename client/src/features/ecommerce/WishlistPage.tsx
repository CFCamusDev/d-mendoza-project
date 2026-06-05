import { useEffect, useState } from 'react';
import axiosInstance from '@/shared/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { ShoppingCart, HeartCrack } from 'lucide-react';
import { WishlistButton } from './components/WishlistButton';
import { useAuth } from '@/shared/context/AuthContext';

interface WishlistItem {
  id: number;
  userId: number;
  variantId: number;
  addedAt: string;
  variant: {
    id: number;
    sku: string;
    price: string;
    product: {
      id: number;
      name: string;
      description: string;
      images: Array<{
        id: number;
        url: string;
        isMain: boolean;
      }>;
    };
  };
}

export const WishlistPage = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchWishlist = async () => {
    try {
      const response = await axiosInstance.get('/wishlist');
      if (response.data?.success) {
        setItems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('No se pudo cargar la lista de favoritos');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleAddToCart = (variantId: number) => {
    // Aquí iría la lógica para agregar al carrito real
    // Por ahora solo mostraremos un toast
    toast.success(`Producto (Variante ${variantId}) agregado al carrito`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] p-8 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
          <HeartCrack className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-[#3F3F3F] mb-2">Inicia sesión</h2>
          <p className="text-gray-500 mb-6">Debes iniciar sesión para ver tus favoritos.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full py-3 px-4 bg-[#3F3F3F] text-white rounded-xl font-medium hover:bg-black transition-colors"
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-[#3F3F3F] tracking-tight">Mis Favoritos</h1>
            <p className="text-sm text-gray-500 mt-1">
              {items.length} {items.length === 1 ? 'producto guardado' : 'productos guardados'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3F3F3F]"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <HeartCrack className="mx-auto h-20 w-20 text-gray-200 mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Tu lista está vacía</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Aún no has guardado ningún producto. Explora nuestro catálogo y marca los que más te gusten.
            </p>
            <button className="px-8 py-3 bg-[#3F3F3F] text-white rounded-full font-medium hover:bg-black transition-all transform hover:scale-105 active:scale-95">
              Explorar productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const product = item.variant.product;
              const mainImage = product.images.find(img => img.isMain)?.url || product.images[0]?.url || 'https://via.placeholder.com/400x500?text=No+Image';
              
              return (
                <div key={item.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
                  {/* Image container */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                    <img 
                      src={mainImage} 
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Floating Wishlist Button */}
                    <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors">
                      <WishlistButton variantId={item.variantId} initialIsWishlisted={true} size={20} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      SKU: {item.variant.sku}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#3F3F3F] transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <span className="text-xl font-black text-[#3F3F3F]">
                        S/ {Number(item.variant.price).toFixed(2)}
                      </span>
                      <button 
                        onClick={() => handleAddToCart(item.variantId)}
                        className="flex items-center justify-center p-3 bg-gray-100 hover:bg-[#3F3F3F] hover:text-white text-gray-700 rounded-xl transition-all duration-300 group/btn"
                        title="Agregar al carrito"
                      >
                        <ShoppingCart size={20} className="transform group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
