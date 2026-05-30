import React, { useEffect, useState } from 'react';
import axiosInstance from '@/shared/api/axiosInstance';
import { toast } from 'react-hot-toast';
import { Loader2, Box, Eye, Layers } from 'lucide-react';
import { VariantMatrix } from './components/VariantMatrix';

interface Product {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export const ProductsAdminPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Intentamos listar productos desde la API (o mockear algunos de prueba si la BD está limpia)
      const { data } = await axiosInstance.get('/v1/products');
      setProducts(data.data || []);
    } catch (error) {
      // Fallback a productos mock para pruebas directas en local si el catálogo está vacío
      const mockProducts: Product[] = [
        { id: 1, code: 'CAM', name: 'Camisa Formal Slim Fit', description: 'Camisa de algodón premium', isActive: true },
        { id: 2, code: 'PAN', name: 'Pantalón Chino Elegante', description: 'Pantalón gabardina casual', isActive: true },
      ];
      setProducts(mockProducts);
      toast('Mostrando productos de demostración local.', {
        icon: 'ℹ️',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-[#F7F7F5]/50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#3F3F3F]">Administración de Productos</h1>
        <p className="text-[#6B6B6B] mt-1">Gestiona el inventario, catálogo y variantes de SKU únicas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Product List */}
        <div className="lg:col-span-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-semibold text-[#3F3F3F] mb-4 flex items-center gap-2">
            <Box className="w-5 h-5 text-[#6B6B6B]" />
            Catálogo de Productos
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#3F3F3F]" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No hay productos registrados.</p>
          ) : (
            <div className="space-y-3">
              {products.map((p) => {
                const isSelected = selectedProduct?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`w-full text-left p-4 rounded-lg border transition duration-200 flex justify-between items-center ${
                      isSelected
                        ? 'border-[#3F3F3F] bg-[#D9D9D2]/20 font-medium'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-[#3F3F3F]">{p.name}</h3>
                      <span className="text-xs font-mono text-[#6B6B6B] mt-1 block">Código: {p.code}</span>
                    </div>
                    <Layers className={`w-4 h-4 ${isSelected ? 'text-[#3F3F3F]' : 'text-gray-400'}`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Variant Matrix Panel */}
        <div className="lg:col-span-2">
          {selectedProduct ? (
            <div className="animate-in fade-in duration-300">
              <VariantMatrix productId={selectedProduct.id} productCode={selectedProduct.code} />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-[#6B6B6B] flex flex-col items-center justify-center h-64">
              <Eye className="w-8 h-8 text-gray-300 mb-3" />
              <h3 className="font-semibold text-base">Ver Matriz de Variantes</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-sm">
                Selecciona un producto del catálogo izquierdo para cargar y editar inline su matriz de Talla × Color y sus SKUs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsAdminPage;
