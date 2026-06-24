import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { ProductFilters } from './components/ProductFilters';
import { WishlistButton } from './components/WishlistButton';
import { searchProducts } from './services/search.service';
import type { SearchProductItem } from './types/search.types';
import { toast } from 'react-hot-toast';
import { ShoppingCart, ShoppingBag, Loader2, Grid3X3, ArrowUpDown } from 'lucide-react';
import { VariantSelectionModal } from './components/VariantSelectionModal';

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<SearchProductItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductSlug, setSelectedProductSlug] = useState<string>('');

  // Extract query parameters from URL
  const q = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;
  const brandId = searchParams.get('brandId') ? Number(searchParams.get('brandId')) : undefined;
  const gender = searchParams.get('gender') || undefined;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const branchId = searchParams.get('branchId') ? Number(searchParams.get('branchId')) : undefined;
  const orderBy = (searchParams.get('orderBy') as 'relevance' | 'newest' | 'price_asc' | 'price_desc') || 'relevance';

  // Set document title
  useDocumentTitle(q ? `Buscar: ${q}` : 'Catálogo de Prendas');

  // Trigger search when searchParams change
  useEffect(() => {
    const fetchInitialResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await searchProducts({
          q,
          categoryId,
          brandId,
          gender,
          minPrice,
          maxPrice,
          branchId,
          orderBy,
          limit: 8,
        });
        if (response.success) {
          setProducts(response.data);
          setNextCursor(response.pagination.nextCursor || null);
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
        setError('No pudimos cargar los resultados de búsqueda. Inténtalo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialResults();
  }, [q, categoryId, brandId, gender, minPrice, maxPrice, branchId, orderBy]);

  // Load more pages (pagination)
  const handleLoadMore = async () => {
    if (!nextCursor || isPaginationLoading) return;
    setIsPaginationLoading(true);
    try {
      const response = await searchProducts({
        q,
        categoryId,
        brandId,
        gender,
        minPrice,
        maxPrice,
        branchId,
        orderBy,
        cursor: Number(nextCursor),
        limit: 8,
      });
      if (response.success) {
        setProducts((prev) => [...prev, ...response.data]);
        setNextCursor(response.pagination.nextCursor || null);
      }
    } catch (err) {
      console.error('Error paginating search results:', err);
      toast.error('Error al cargar más productos');
    } finally {
      setIsPaginationLoading(false);
    }
  };

  // Sync state modifications to SearchParams
  const updateFilters = (newFilters: {
    categoryId?: number;
    brandId?: number;
    gender?: string;
    minPrice?: number;
    maxPrice?: number;
    branchId?: number;
  }) => {
    const nextParams = new URLSearchParams();
    if (q) nextParams.set('q', q);
    if (newFilters.categoryId !== undefined) nextParams.set('categoryId', newFilters.categoryId.toString());
    if (newFilters.brandId !== undefined) nextParams.set('brandId', newFilters.brandId.toString());
    if (newFilters.gender !== undefined) nextParams.set('gender', newFilters.gender);
    if (newFilters.minPrice !== undefined) nextParams.set('minPrice', newFilters.minPrice.toString());
    if (newFilters.maxPrice !== undefined) nextParams.set('maxPrice', newFilters.maxPrice.toString());
    if (newFilters.branchId !== undefined) nextParams.set('branchId', newFilters.branchId.toString());
    nextParams.set('orderBy', orderBy);
    setSearchParams(nextParams);
  };

  const handleOrderByChange = (newOrder: 'relevance' | 'newest' | 'price_asc' | 'price_desc') => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('orderBy', newOrder);
    setSearchParams(nextParams);
  };

  const handleClearFilters = () => {
    const nextParams = new URLSearchParams();
    if (q) nextParams.set('q', q);
    nextParams.set('orderBy', 'relevance');
    setSearchParams(nextParams);
  };


  const getProductPriceString = (product: SearchProductItem) => {
    const activeVariants = product.variants.filter(v => v.isActive);
    if (activeVariants.length === 0) return 'N/A';
    const prices = activeVariants.map(v => Number(v.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (minPrice === maxPrice) {
      return `S/ ${minPrice.toFixed(2)}`;
    }
    return `S/ ${minPrice.toFixed(2)} - S/ ${maxPrice.toFixed(2)}`;
  };

  const formatGender = (g: string) => {
    switch (g.toUpperCase()) {
      case 'MALE': return 'Hombre';
      case 'FEMALE': return 'Mujer';
      case 'UNISEX': return 'Unisex';
      case 'KIDS': return 'Niños';
      default: return g;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-16">
      {/* Top Banner Context */}
      <div className="bg-white border-b border-slate-100 py-8 mb-8">
        <div className="max-w-[1280px] mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-7 h-7 text-brand-accent shrink-0" />
              {q ? `Resultados para "${q}"` : 'Catálogo de Productos'}
            </h1>
            <p className="text-slate-400 text-xs mt-1 font-medium">
              {isLoading ? 'Buscando prendas...' : `${products.length} prendas encontradas`}
            </p>
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-3 self-start md:self-auto bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={orderBy}
              onChange={(e) => handleOrderByChange(e.target.value as any)}
              className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
            >
              <option value="relevance">Ordenar por: Relevancia</option>
              <option value="newest">Ordenar por: Lo más nuevo</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Side Filters Panel */}
          <div className="md:col-span-1">
            <ProductFilters
              filters={{ categoryId, brandId, gender, minPrice, maxPrice, branchId }}
              onFilterChange={updateFilters}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Results Grid */}
          <div className="md:col-span-3 flex flex-col">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-brand-accent" />
                <p className="text-slate-400 text-xs font-semibold">Cargando catálogo...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-3xl p-6 text-center text-sm font-semibold">
                {error}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
                <Grid3X3 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800 mb-2">No se encontraron productos</h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto mb-6">
                  Intenta cambiar las palabras clave de tu búsqueda o restablecer los filtros para ver más opciones.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-3 bg-slate-800 text-white rounded-full text-xs font-bold hover:bg-black transition-all shadow-sm"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => {
                    const mainImage = product.images.find(img => img.isMain)?.url || product.images[0]?.url || 'https://via.placeholder.com/400x500?text=No+Image';
                    const isOutOfStock = product.variants.every(v => v.outOfStock);
                    const firstVariant = product.variants[0];

                    return (
                      <div
                        key={product.id}
                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100/80 flex flex-col"
                      >
                        {/* Image Wrapper */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
                          <img
                            src={mainImage}
                            alt={product.name}
                            className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
                          />

                          {/* Stock status badge */}
                          {isOutOfStock ? (
                            <div className="absolute top-4 left-4 z-10 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                              Agotado
                            </div>
                          ) : (
                            <div className="absolute top-4 left-4 z-10 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                              En Stock
                            </div>
                          )}

                          {/* Wishlist floating toggle */}
                          {firstVariant && (
                            <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all">
                              <WishlistButton variantId={firstVariant.id} size={18} />
                            </div>
                          )}
                        </div>

                        {/* Product Detail Info */}
                        <div className="p-5 flex flex-col flex-grow">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                              {formatGender(product.gender)}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {product.brand?.name}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-800 mb-1.5 line-clamp-2 min-h-[40px] group-hover:text-brand-accent transition-colors">
                            {product.name}
                          </h3>

                          <p className="text-[11px] text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                            {product.description}
                          </p>

                          {/* Pricing and Action */}
                          <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-sm font-black text-slate-800">
                              {getProductPriceString(product)}
                            </span>
                            {firstVariant && !isOutOfStock && (
                              <button
                                onClick={() => {
                                  setSelectedProductSlug(product.slug);
                                  setIsModalOpen(true);
                                }}
                                className="flex items-center justify-center p-2.5 bg-slate-50 border border-slate-200 hover:bg-brand-accent hover:border-brand-accent hover:text-white text-slate-600 rounded-xl transition-all duration-200 group/btn shadow-sm"
                                title="Agregar al carrito"
                              >
                                <ShoppingCart size={16} className="transform group-hover/btn:scale-105 transition-transform" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Cursor Trigger */}
                {nextCursor && (
                  <div className="flex justify-center mt-12">
                    <button
                      onClick={handleLoadMore}
                      disabled={isPaginationLoading}
                      className="px-8 py-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-full text-xs font-bold shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-50"
                    >
                      {isPaginationLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-brand-accent" />
                          Cargando más...
                        </>
                      ) : (
                        'Cargar más prendas'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <VariantSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productSlug={selectedProductSlug}
        />
      )}
    </div>
  );
};

export default SearchResultsPage;
