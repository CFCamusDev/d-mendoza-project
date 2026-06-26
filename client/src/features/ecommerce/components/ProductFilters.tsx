import React, { useEffect, useState } from 'react';
import { getCategories, getBrands, getBranches } from '../services/search.service';
import type { Category, Brand } from '../types/search.types';
import { Filter, RefreshCw, ChevronDown, Check } from 'lucide-react';

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

const FilterSection = ({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 pb-5">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-[11px] font-bold text-slate-800 uppercase tracking-widest hover:text-brand-accent transition-colors"
      >
        {title}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
};

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    setMinPriceInput(filters.minPrice?.toString() || '');
    setMaxPriceInput(filters.maxPrice?.toString() || '');
  }, [filters.minPrice, filters.maxPrice]);

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyPrice();
  };

  const applyPrice = () => {
    const min = minPriceInput !== '' ? Number(minPriceInput) : undefined;
    const max = maxPriceInput !== '' ? Number(maxPriceInput) : undefined;
    if (min !== filters.minPrice || max !== filters.maxPrice) {
      onFilterChange({ ...filters, minPrice: min, maxPrice: max });
    }
  };

  const handleGenderChange = (gender: string) => {
    onFilterChange({ ...filters, gender: gender === '' ? undefined : gender });
  };

  const handleCategoryChange = (catIdStr: string) => {
    onFilterChange({ ...filters, categoryId: catIdStr === '' ? undefined : Number(catIdStr) });
  };

  const handleBrandChange = (brandIdStr: string) => {
    onFilterChange({ ...filters, brandId: brandIdStr === '' ? undefined : Number(brandIdStr) });
  };

  const handleBranchChange = (branchIdStr: string) => {
    onFilterChange({ ...filters, branchId: branchIdStr === '' ? undefined : Number(branchIdStr) });
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] sticky top-24">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-accent" />
          Filtros
        </h3>
        <button
          onClick={() => {
            setMinPriceInput('');
            setMaxPriceInput('');
            onClearFilters();
          }}
          className="text-[10px] uppercase font-bold tracking-widest text-slate-400 hover:text-brand-accent flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Limpiar
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-12 bg-slate-50 rounded-xl animate-pulse"></div>
          <div className="h-24 bg-slate-50 rounded-xl animate-pulse"></div>
          <div className="h-24 bg-slate-50 rounded-xl animate-pulse"></div>
        </div>
      ) : (
        <div className="space-y-6">
          
          <FilterSection title="Sucursal" defaultOpen={true}>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${!filters.branchId ? 'border-brand-accent bg-brand-accent text-white' : 'border-slate-300 bg-transparent group-hover:border-brand-accent'}`}>
                  {!filters.branchId && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                </div>
                <span className={`text-xs font-semibold ${!filters.branchId ? 'text-slate-800' : 'text-slate-500 group-hover:text-slate-800'}`}>
                  Todas las Sucursales
                </span>
                <input type="radio" className="hidden" checked={!filters.branchId} onChange={() => handleBranchChange('')} />
              </label>
              {branches.map(b => (
                <label key={b.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${filters.branchId === b.id ? 'border-brand-accent bg-brand-accent text-white' : 'border-slate-300 bg-transparent group-hover:border-brand-accent'}`}>
                    {filters.branchId === b.id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                  <span className={`text-xs font-semibold ${filters.branchId === b.id ? 'text-slate-800' : 'text-slate-500 group-hover:text-slate-800'}`}>
                    {b.name}
                  </span>
                  <input type="radio" className="hidden" checked={filters.branchId === b.id} onChange={() => handleBranchChange(b.id.toString())} />
                </label>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Género" defaultOpen={true}>
            <div className="flex flex-wrap gap-2">
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
                  className={`text-[11px] font-bold py-2 px-3.5 rounded-full transition-all ${
                    (filters.gender || '') === opt.value
                      ? 'bg-slate-800 text-white shadow-md shadow-slate-200'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Categorías" defaultOpen={true}>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              <button
                type="button"
                onClick={() => handleCategoryChange('')}
                className={`text-[11px] font-bold py-2 px-3.5 rounded-full transition-all ${
                  !filters.categoryId
                    ? 'bg-slate-800 text-white shadow-md shadow-slate-200'
                    : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800'
                }`}
              >
                Todas
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCategoryChange(c.id.toString())}
                  className={`text-[11px] font-bold py-2 px-3.5 rounded-full transition-all ${
                    filters.categoryId === c.id
                      ? 'bg-slate-800 text-white shadow-md shadow-slate-200'
                      : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Marcas" defaultOpen={false}>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${!filters.brandId ? 'border-brand-accent bg-brand-accent text-white' : 'border-slate-300 bg-transparent group-hover:border-brand-accent'}`}>
                  {!filters.brandId && <Check className="w-3 h-3" />}
                </div>
                <span className={`text-xs font-semibold ${!filters.brandId ? 'text-slate-800' : 'text-slate-500 group-hover:text-slate-800'}`}>
                  Todas las Marcas
                </span>
                <input type="radio" className="hidden" checked={!filters.brandId} onChange={() => handleBrandChange('')} />
              </label>
              {brands.map(b => (
                <label key={b.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${filters.brandId === b.id ? 'border-brand-accent bg-brand-accent text-white' : 'border-slate-300 bg-transparent group-hover:border-brand-accent'}`}>
                    {filters.brandId === b.id && <Check className="w-3 h-3" />}
                  </div>
                  <span className={`text-xs font-semibold ${filters.brandId === b.id ? 'text-slate-800' : 'text-slate-500 group-hover:text-slate-800'}`}>
                    {b.name}
                  </span>
                  <input type="radio" className="hidden" checked={filters.brandId === b.id} onChange={() => handleBrandChange(b.id.toString())} />
                </label>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Precio" defaultOpen={true}>
            <form onSubmit={handlePriceApply} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">S/</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    onBlur={applyPrice}
                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-8 pr-3 focus:outline-none focus:border-brand-accent focus:bg-white transition-all"
                  />
                </div>
                <span className="text-slate-300 font-bold">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">S/</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    onBlur={applyPrice}
                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-8 pr-3 focus:outline-none focus:border-brand-accent focus:bg-white transition-all"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors">
                Aplicar Rango
              </button>
            </form>
          </FilterSection>

        </div>
      )}
    </div>
  );
};
