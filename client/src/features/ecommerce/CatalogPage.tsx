import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { ProductFilters } from './components/ProductFilters';
import { WishlistButton } from './components/WishlistButton';
import { searchProducts } from './services/search.service';
import type { SearchProductItem } from './types/search.types';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Loader2, Grid3X3, ArrowUpDown } from 'lucide-react';
import { VariantSelectionModal } from './components/VariantSelectionModal';

export const CatalogPage: React.FC = () => {
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
  useDocumentTitle(q ? `Buscar: ${q}` : 'Catálogo de Prendas - D\'Mendoza');

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
      <div className="bg-white border-b border-slate-100 pt-10 pb-8 mb-8 relative">
        <div className="max-w-[1280px] mx-auto px-4 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              {q ? `Resultados para "${q}"` : 'Nuestra Colección'}
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">
              {isLoading ? 'Cargando prendas...' : `${products.length} estilos para ti`}
            </p>
          </div>

          {/* Sort Selection */}
          <div className="flex items-center gap-3 self-start md:self-auto bg-slate-50 border border-slate-200 rounded-full px-4 py-2 hover:border-brand-accent transition-colors">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={orderBy}
              onChange={(e) => handleOrderByChange(e.target.value as any)}
              className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none focus:ring-0 cursor-pointer"
            >
              <option value="relevance">Relevancia</option>
              <option value="newest">Lo más nuevo</option>
              <option value="price_asc">Menor Precio</option>
              <option value="price_desc">Mayor Precio</option>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-[400px]">
                    <div className="aspect-[4/5] bg-slate-100 animate-pulse"></div>
                    <div className="p-5 flex flex-col gap-3 flex-grow">
                      <div className="w-16 h-4 bg-slate-100 animate-pulse rounded"></div>
                      <div className="w-3/4 h-5 bg-slate-100 animate-pulse rounded"></div>
                      <div className="w-full h-3 bg-slate-100 animate-pulse rounded mt-auto"></div>
                    </div>
                  </div>
                ))}
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
                    const secondaryImage = product.images.find(img => !img.isMain)?.url;
                    const isOutOfStock = product.variants.every(v => v.outOfStock);
                    const firstVariant = product.variants[0];

                    return (
                      <Link
                        key={product.id}
                        to={`/products/${product.slug}`}
                        className="group bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col relative"
                      >
                        {/* Image Wrapper */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
                          <img
                            src={mainImage}
                            alt={product.name}
                            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${secondaryImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
                          />
                          {secondaryImage && (
                            <img
                              src={secondaryImage}
                              alt={`${product.name} alternate`}
                              className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-100"
                            />
                          )}

                          {/* Stock status badge */}
                          {isOutOfStock ? (
                            <div className="absolute top-4 left-4 z-10 bg-red-500/95 backdrop-blur text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                              Agotado
                            </div>
                          ) : (
                            <div className="absolute top-4 left-4 z-10 bg-emerald-500/95 backdrop-blur text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                              En Stock
                            </div>
                          )}

                          {/* Wishlist floating toggle */}
                          {firstVariant && (
                            <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-sm rounded-full shadow hover:scale-110 active:scale-95 transition-transform" onClick={(e) => e.preventDefault()}>
                              <WishlistButton variantId={firstVariant.id} size={18} />
                            </div>
                          )}

                          {/* Add to cart quick button on hover */}
                          {firstVariant && !isOutOfStock && (
                            <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setSelectedProductSlug(product.slug);
                                  setIsModalOpen(true);
                                }}
                                className="w-full bg-brand-accent/95 backdrop-blur text-white font-bold text-[11px] uppercase tracking-wider py-3.5 rounded-xl shadow-lg hover:bg-black transition-colors flex items-center justify-center gap-2"
                              >
                                <ShoppingCart size={16} />
                                Compra Rápida
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Product Detail Info */}
                        <div className="p-5 flex flex-col flex-grow bg-white z-10 relative">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                              {formatGender(product.gender)}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {product.brand?.name}
                            </span>
                          </div>

                          <h3 className="text-sm font-black text-slate-800 mb-1 line-clamp-2 leading-tight group-hover:text-brand-accent transition-colors">
                            {product.name}
                          </h3>

                          <p className="text-[11px] text-slate-400 line-clamp-1 mb-4">
                            {product.description}
                          </p>

                          <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-sm font-black text-brand-accent">
                              {getProductPriceString(product)}
                            </span>
                          </div>
                        </div>
                      </Link>
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

export default CatalogPage;
