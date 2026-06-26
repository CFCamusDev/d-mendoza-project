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
    talla?: string;
  };
  onFilterChange: (newFilters: {
    categoryId?: number;
    brandId?: number;
    gender?: string;
    minPrice?: number;
    maxPrice?: number;
    branchId?: number;
    talla?: string;
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
    <div className="border-b border-neutral-100 pb-5 pt-3">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-[11px] font-bold text-neutral-900 uppercase tracking-widest hover:text-brand-accent transition-colors"
      >
        <span>{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-accent' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-4 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
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
    <div className="sticky top-28 bg-transparent">
      {/* Header filter title */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-2">
        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-800" />
          Filtros
        </h3>
        <button
          onClick={() => {
            setMinPriceInput('');
            setMaxPriceInput('');
            onClearFilters();
          }}
          className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 hover:text-brand-accent flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-2.5 h-2.5" />
          Limpiar
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6 pt-4">
          <div className="h-10 bg-neutral-50 rounded animate-pulse"></div>
          <div className="h-20 bg-neutral-50 rounded animate-pulse"></div>
          <div className="h-20 bg-neutral-50 rounded animate-pulse"></div>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          
          <FilterSection title="Sucursal" defaultOpen={true}>
            <div className="flex flex-col gap-2.5 pt-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${!filters.branchId ? 'border-brand-accent bg-brand-accent text-white' : 'border-neutral-200 bg-transparent group-hover:border-neutral-400'}`}>
                  {!filters.branchId && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                </div>
                <span className={`text-[13px] transition-colors ${!filters.branchId ? 'text-neutral-900 font-bold' : 'text-neutral-500 group-hover:text-neutral-900'}`}>
                  Todas las Sucursales
                </span>
                <input type="radio" className="hidden" checked={!filters.branchId} onChange={() => handleBranchChange('')} />
              </label>
              {branches.map(b => (
                <label key={b.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${filters.branchId === b.id ? 'border-brand-accent bg-brand-accent text-white' : 'border-neutral-200 bg-transparent group-hover:border-neutral-400'}`}>
                    {filters.branchId === b.id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                  <span className={`text-[13px] transition-colors ${filters.branchId === b.id ? 'text-neutral-900 font-bold' : 'text-neutral-500 group-hover:text-neutral-900'}`}>
                    {b.name}
                  </span>
                  <input type="radio" className="hidden" checked={filters.branchId === b.id} onChange={() => handleBranchChange(b.id.toString())} />
                </label>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Género" defaultOpen={true}>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { value: '', label: 'Todos' },
                { value: 'MALE', label: 'Hombre' },
                { value: 'FEMALE', label: 'Mujer' },
                { value: 'UNISEX', label: 'Unisex' },
                { value: 'KIDS', label: 'Niños' },
              ].map((opt) => {
                const isActive = (filters.gender || '') === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleGenderChange(opt.value)}
                    className={`text-[11px] font-bold py-1.5 px-3 border transition-all duration-200 ${
                      isActive
                        ? 'bg-neutral-900 border-neutral-900 text-white'
                        : 'bg-transparent border-neutral-200 text-neutral-600 hover:border-neutral-800 hover:text-neutral-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          <FilterSection title="Tallas" defaultOpen={true}>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => {
                const isActive = filters.talla === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onFilterChange({ ...filters, talla: isActive ? undefined : size })}
                    className={`text-[11px] font-bold py-2 border transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-accent border-brand-accent text-white font-black'
                        : 'bg-transparent border-neutral-200 text-neutral-600 hover:border-neutral-800 hover:text-neutral-900'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          <FilterSection title="Categorías" defaultOpen={true}>
            <div className="flex flex-wrap gap-1.5 pt-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              <button
                type="button"
                onClick={() => handleCategoryChange('')}
                className={`text-[11px] font-bold py-1.5 px-3 border transition-all duration-200 ${
                  !filters.categoryId
                    ? 'bg-neutral-900 border-neutral-900 text-white'
                    : 'bg-transparent border-neutral-200 text-neutral-600 hover:border-neutral-800 hover:text-neutral-900'
                }`}
              >
                Todas
              </button>
              {categories.map((c) => {
                const isActive = filters.categoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCategoryChange(c.id.toString())}
                    className={`text-[11px] font-bold py-1.5 px-3 border transition-all duration-200 ${
                      isActive
                        ? 'bg-neutral-900 border-neutral-900 text-white'
                        : 'bg-transparent border-neutral-200 text-neutral-600 hover:border-neutral-800 hover:text-neutral-900'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          <FilterSection title="Marcas" defaultOpen={false}>
            <div className="flex flex-col gap-2.5 pt-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${!filters.brandId ? 'border-brand-accent bg-brand-accent text-white' : 'border-neutral-200 bg-transparent group-hover:border-neutral-400'}`}>
                  {!filters.brandId && <Check className="w-3 h-3" />}
                </div>
                <span className={`text-[13px] transition-colors ${!filters.brandId ? 'text-neutral-900 font-bold' : 'text-neutral-500 group-hover:text-neutral-900'}`}>
                  Todas las Marcas
                </span>
                <input type="radio" className="hidden" checked={!filters.brandId} onChange={() => handleBrandChange('')} />
              </label>
              {brands.map(b => (
                <label key={b.id} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${filters.brandId === b.id ? 'border-brand-accent bg-brand-accent text-white' : 'border-neutral-200 bg-transparent group-hover:border-neutral-400'}`}>
                    {filters.brandId === b.id && <Check className="w-3 h-3" />}
                  </div>
                  <span className={`text-[13px] transition-colors ${filters.brandId === b.id ? 'text-neutral-900 font-bold' : 'text-neutral-500 group-hover:text-neutral-900'}`}>
                    {b.name}
                  </span>
                  <input type="radio" className="hidden" checked={filters.brandId === b.id} onChange={() => handleBrandChange(b.id.toString())} />
                </label>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Precio" defaultOpen={true}>
            <form onSubmit={handlePriceApply} className="space-y-4 pt-1">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-0.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">S/</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    onBlur={applyPrice}
                    className="w-full text-xs font-bold text-neutral-800 bg-transparent border-b border-neutral-200 py-2 pl-5 pr-1 focus:outline-none focus:border-brand-accent transition-all"
                  />
                </div>
                <span className="text-neutral-300 font-normal">a</span>
                <div className="relative flex-1">
                  <span className="absolute left-0.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">S/</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    onBlur={applyPrice}
                    className="w-full text-xs font-bold text-neutral-800 bg-transparent border-b border-neutral-200 py-2 pl-5 pr-1 focus:outline-none focus:border-brand-accent transition-all"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold uppercase tracking-wider transition-colors"
              >
                Aplicar Rango
              </button>
            </form>
          </FilterSection>

        </div>
      )}
    </div>
  );
};
