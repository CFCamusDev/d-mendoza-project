import React, { useEffect, useState } from 'react';
import { getCategories, getBrands, getBranches } from '../services/search.service';
import type { Category, Brand } from '../types/search.types';
import { Filter, RefreshCw } from 'lucide-react';

interface ProductFiltersProps {
  filters: {
    categoryId?: number;
    brandId?: number;
    gender?: string;
    minPrice?: number;
    maxPrice?: number;
    branchId?: number;
  };
  onFilterChange: (newFilters: {
    categoryId?: number;
    brandId?: number;
    gender?: string;
    minPrice?: number;
    maxPrice?: number;
    branchId?: number;
  }) => void;
  onClearFilters: () => void;
}

interface Branch {
  id: number;
  name: string;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Price local state for better user typing control (we don't want to query instantly on every keystroke,
  // but rather let them type, or trigger on blur/submit)
  const [minPriceInput, setMinPriceInput] = useState(filters.minPrice?.toString() || '');
  const [maxPriceInput, setMaxPriceInput] = useState(filters.maxPrice?.toString() || '');

  useEffect(() => {
    const fetchMetadata = async () => {
      setIsLoading(true);
      try {
        const [catsRes, brandsRes, branchesRes] = await Promise.all([
          getCategories(),
          getBrands(),
          getBranches(),
        ]);
        if (catsRes.success) setCategories(catsRes.data);
        if (brandsRes.success) setBrands(brandsRes.data);
        if (branchesRes.success) setBranches(branchesRes.data);
      } catch (error) {
        console.error('Error fetching filters metadata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  // Keep price inputs in sync with filters if cleared/changed from parent
  useEffect(() => {
    setMinPriceInput(filters.minPrice?.toString() || '');
    setMaxPriceInput(filters.maxPrice?.toString() || '');
  }, [filters.minPrice, filters.maxPrice]);

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const min = minPriceInput !== '' ? Number(minPriceInput) : undefined;
    const max = maxPriceInput !== '' ? Number(maxPriceInput) : undefined;
    onFilterChange({
      ...filters,
      minPrice: min,
      maxPrice: max,
    });
  };

  const handlePriceBlur = () => {
    const min = minPriceInput !== '' ? Number(minPriceInput) : undefined;
    const max = maxPriceInput !== '' ? Number(maxPriceInput) : undefined;
    if (min !== filters.minPrice || max !== filters.maxPrice) {
      onFilterChange({
        ...filters,
        minPrice: min,
        maxPrice: max,
      });
    }
  };

  const handleGenderChange = (gender: string) => {
    onFilterChange({
      ...filters,
      gender: gender === '' ? undefined : gender,
    });
  };

  const handleCategoryChange = (catIdStr: string) => {
    onFilterChange({
      ...filters,
      categoryId: catIdStr === '' ? undefined : Number(catIdStr),
    });
  };

  const handleBrandChange = (brandIdStr: string) => {
    onFilterChange({
      ...filters,
      brandId: brandIdStr === '' ? undefined : Number(brandIdStr),
    });
  };

  const handleBranchChange = (branchIdStr: string) => {
    onFilterChange({
      ...filters,
      branchId: branchIdStr === '' ? undefined : Number(branchIdStr),
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-accent animate-pulse" />
          Filtros de Búsqueda
        </h3>
        <button
          onClick={() => {
            setMinPriceInput('');
            setMaxPriceInput('');
            onClearFilters();
          }}
          className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-1 transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          Limpiar
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-10 bg-slate-50 rounded-xl animate-pulse"></div>
          <div className="h-10 bg-slate-50 rounded-xl animate-pulse"></div>
          <div className="h-10 bg-slate-50 rounded-xl animate-pulse"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sucursal (Stock Availability) */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Disponibilidad en Sucursal
            </label>
            <select
              value={filters.branchId || ''}
              onChange={(e) => handleBranchChange(e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all cursor-pointer"
            >
              <option value="">Todas las Sucursales</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Categorías */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Categoría
            </label>
            <select
              value={filters.categoryId || ''}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all cursor-pointer"
            >
              <option value="">Todas las Categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Marcas */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Marca
            </label>
            <select
              value={filters.brandId || ''}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all cursor-pointer"
            >
              <option value="">Todas las Marcas</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Género */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Género
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: '', label: 'Todos' },
                { value: 'MALE', label: 'Hombre' },
                { value: 'FEMALE', label: 'Mujer' },
                { value: 'UNISEX', label: 'Unisex' },
                { value: 'KIDS', label: 'Niños' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleGenderChange(opt.value)}
                  className={`text-[11px] font-bold py-2.5 px-3 rounded-xl border text-center transition-all ${
                    (filters.gender || '') === opt.value
                      ? 'bg-brand-accent text-white border-brand-accent shadow'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Precios (Rango) */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Rango de Precio (S/)
            </label>
            <form onSubmit={handlePriceApply} className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                onBlur={handlePriceBlur}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-accent transition-all text-center"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Máx"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                onBlur={handlePriceBlur}
                className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-brand-accent transition-all text-center"
              />
              <button type="submit" className="hidden" aria-hidden="true" />
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
