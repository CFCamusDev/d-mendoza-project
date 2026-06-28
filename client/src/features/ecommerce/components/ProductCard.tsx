import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { WishlistButton } from './WishlistButton';
import { VariantSelectionModal } from './VariantSelectionModal';

interface ProductCardProps {
  variantId: number;
  productSlug: string;
  productName: string;
  brandName?: string;
  gender?: string;
  description?: string;
  images: Array<{ url: string; isMain: boolean; attributeValueId?: number | null }>;
  priceString: string;
  isOutOfStock?: boolean;
  discountPercent?: number;
  originalPriceString?: string; // Optional: to display crossed price
  
  initialIsWishlisted?: boolean;
  onFavoriteToggle?: (variantId: number, isWishlisted: boolean) => void;
}

export default function ProductCard({
  variantId,
  productSlug,
  productName,
  brandName,
  gender,
  description,
  images,
  priceString,
  isOutOfStock = false,
  discountPercent = 0,
  originalPriceString,
  initialIsWishlisted = false,
  onFavoriteToggle
}: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mainImage = images.find(img => img.isMain)?.url || images[0]?.url || 'https://via.placeholder.com/400x500?text=No+Image';
  const secondaryImage = images.find(img => !img.isMain)?.url;

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
    <>
      <Link
        to={`/products/${productSlug}`}
        className="group bg-transparent flex flex-col relative overflow-hidden transition-all duration-300 h-full"
      >
        {/* Image Wrapper */}
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-50 rounded-sm">
          <img
            src={mainImage}
            alt={productName}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${secondaryImage ? 'group-hover:opacity-0' : 'group-hover:scale-102'}`}
          />
          {secondaryImage && (
            <img
              src={secondaryImage}
              alt={`${productName} alternate`}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-all duration-750 scale-102 group-hover:scale-100"
            />
          )}

          {/* Stock status badge */}
          {isOutOfStock ? (
            <span className="absolute top-3 left-3 z-10 bg-neutral-900/90 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1">
              Agotado
            </span>
          ) : (
            discountPercent > 0 && (
              <span className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-1">
                -{discountPercent}%
              </span>
            )
          )}

          {/* Wishlist floating toggle */}
          <div 
            className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm hover:scale-110 active:scale-95 transition-transform" 
            onClick={(e) => e.preventDefault()}
          >
            <WishlistButton 
              variantId={variantId} 
              initialIsWishlisted={initialIsWishlisted} 
              onToggle={onFavoriteToggle}
              size={15} 
            />
          </div>

          {/* Add to cart quick button on hover */}
          {!isOutOfStock && (
            <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
                className="w-full bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 font-bold text-[10px] uppercase tracking-widest py-3 shadow-md transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={13} />
                Compra Rápida
              </button>
            </div>
          )}
        </div>

        {/* Product Detail Info (Inline Layout) */}
        <div className="pt-4 flex flex-col flex-grow bg-transparent relative">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              {brandName && (
                <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">
                  {brandName}
                </span>
              )}
              <h3 className="text-[13px] font-bold text-neutral-800 mb-1 line-clamp-1 leading-tight group-hover:text-brand-accent transition-colors">
                {productName}
              </h3>
              {description && (
                <p className="text-[11px] text-neutral-400 line-clamp-1">
                  {description}
                </p>
              )}
            </div>
            <div className="shrink-0 text-right">
              {originalPriceString && (
                <span className="text-[10px] text-neutral-400 line-through block leading-none mb-1">
                  {originalPriceString}
                </span>
              )}
              <span className="text-xs font-bold text-neutral-900 block">
                {priceString}
              </span>
              {gender && (
                <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider block mt-1">
                  {formatGender(gender)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
      {isModalOpen && (
        <VariantSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productSlug={productSlug}
        />
      )}
    </>
  );
}
