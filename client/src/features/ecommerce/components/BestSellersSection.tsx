import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import ProductCard from './ProductCard';
import type { ProductVariant } from '../types';

export default function BestSellersSection() {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/ecommerce/products/best-sellers?limit=10')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setVariants(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);



  if (loading) {
    return <div className="py-8 text-center text-gray-500">Cargando los más vendidos...</div>;
  }

  if (variants.length === 0) {
    return null; // Ocultar si no hay productos
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          🔥 Lo Más Vendido
        </h2>
        
        <Swiper
          modules={[Navigation, Pagination, A11y, Autoplay]}
          spaceBetween={20}
          slidesPerView={1.5}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: true }}
          breakpoints={{
            480: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
          }}
          className="pb-12" // padding para la paginación
        >
          {variants.map((variant) => (
            <SwiperSlide key={variant.id} className="h-auto">
              <ProductCard variant={variant} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
