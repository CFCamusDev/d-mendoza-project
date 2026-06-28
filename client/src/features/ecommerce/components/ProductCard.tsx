import { useState, useEffect, useMemo } from 'react';
import { ShoppingCart } from 'lucide-react';
import type { ProductVariant } from '../types';
import { WishlistButton } from './WishlistButton';
import { VariantSelectionModal } from './VariantSelectionModal';
import axiosInstance from '@/shared/api/axiosInstance';

let attributesCache: any[] | null = null;
let attributesPromise: Promise<any[]> | null = null;

const getAttributes = () => {
  if (attributesCache) return Promise.resolve(attributesCache);
  if (attributesPromise) return attributesPromise;
  
  attributesPromise = axiosInstance.get('/v1/attributes')
    .then(({ data }) => {
      if (data.success) {
        attributesCache = data.data;
        return data.data;
      }
      return [];
    })
    .catch(() => []);
  return attributesPromise;
};

interface ProductCardProps {
  variant: ProductVariant & {
    product: {
      name: string;
      slug: string;
      images: Array<{ url: string; isMain: boolean }>;
    };
    discountPercent: number; // Added to interface since it's new
  };
}

export default function ProductCard({ variant }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [hoveredColorId, setHoveredColorId] = useState<number | null>(null);

  useEffect(() => {
    getAttributes().then(setAttributes);
  }, []);

  const productVariants = (variant.product as any).variants || [];
  
  const colors = useMemo(() => {
    if (attributes.length === 0) return [];
    const colorAttr = attributes.find(a => a.name.toLowerCase() === 'color' || a.isVisualDriver);
    if (!colorAttr) return [];
    
    const uniqueColors: Array<{ id: number; value: string; hex: string }> = [];
    const seen = new Set<number>();
    
    productVariants.forEach((v: any) => {
      if (v.isActive && v.attributesJson?.color) {
        const colorName = v.attributesJson.color;
        const valObj = colorAttr.values.find((val: any) => val.value.toUpperCase() === colorName.toUpperCase());
        if (valObj && !seen.has(valObj.id)) {
          seen.add(valObj.id);
          
          const COLOR_MAP: Record<string, string> = {
            'NEGRO': '#000000', 'BLANCO': '#FFFFFF', 'ROJO': '#FF0000', 'AZUL': '#0000FF',
            'VERDE': '#00FF00', 'AMARILLO': '#FFFF00', 'GRIS': '#808080', 'BEIGE': '#F5F5DC',
            'MARRON': '#8B4513', 'ROSA': '#FFC0CB', 'MORADO': '#800080', 'NARANJA': '#FFA500'
          };
          const hex = COLOR_MAP[colorName.toUpperCase()] || '#E2E8F0';
          
          uniqueColors.push({
            id: valObj.id,
            value: colorName,
            hex
          });
        }
      }
    });
    return uniqueColors;
  }, [productVariants, attributes]);

  const activeImage = useMemo(() => {
    if (hoveredColorId) {
      const colorImg = (variant.product.images as any[])?.find(img => img.attributeValueId === hoveredColorId);
      if (colorImg) return colorImg.url;
    }
    return variant.product.images?.find(img => img.isMain)?.url || variant.product.images?.[0]?.url || 'https://via.placeholder.com/300';
  }, [variant, hoveredColorId]);
  
  const price = Number(variant.price);
  const discountAmount = variant.discountPercent > 0 ? (price * variant.discountPercent) / 100 : 0;
  const finalPrice = price - discountAmount;

  const handleAddToCartClick = () => {
    // Open the modal instead of instantly adding
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative flex flex-col h-full group">
        {/* Badge de Oferta */}
        {variant.discountPercent > 0 && (
          <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
            -{variant.discountPercent}%
          </div>
        )}
        
        {/* Botón de Favorito */}
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton variantId={variant.id} />
        </div>

        {/* Imagen (Lazy loading nativo) */}
        <div className="w-full aspect-square overflow-hidden bg-gray-50 relative flex items-center justify-center">
          <img 
            src={activeImage} 
            alt={variant.product.name} 
            loading="lazy"
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300 p-4"
          />
          {variant.outOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
              <span className="font-bold text-gray-700 bg-white px-3 py-1 rounded shadow-sm text-sm">
                Agotado
              </span>
            </div>
          )}
        </div>

        {/* Detalles del producto */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 flex-grow">
            {variant.product.name}
          </h3>
          <p className="text-xs text-gray-500 mb-1">SKU: {variant.sku}</p>
          
          {colors.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {colors.map(col => (
                <div
                  key={col.id}
                  onMouseEnter={() => setHoveredColorId(col.id)}
                  onMouseLeave={() => setHoveredColorId(null)}
                  className="w-4 h-4 rounded-full border border-gray-200 cursor-pointer transition-transform hover:scale-110 shadow-xs"
                  style={{ backgroundColor: col.hex }}
                  title={col.value}
                />
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-auto">
            <div>
              {variant.discountPercent > 0 ? (
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 line-through">S/ {price.toFixed(2)}</span>
                  <span className="font-bold text-brand-accent">S/ {finalPrice.toFixed(2)}</span>
                </div>
              ) : (
                <span className="font-bold text-brand-accent">S/ {price.toFixed(2)}</span>
              )}
            </div>
            
            <button
              onClick={handleAddToCartClick}
              disabled={variant.outOfStock}
              className={`p-2 rounded-full transition-colors ${
                variant.outOfStock 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-brand-primary text-brand-accent hover:bg-brand-accent hover:text-white'
              }`}
              aria-label="Añadir al carrito"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
      <VariantSelectionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productSlug={variant.product.slug}
      />
    </>
  );
}
