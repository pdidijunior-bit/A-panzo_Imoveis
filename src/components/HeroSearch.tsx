import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Home,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  BedDouble,
  Building,
  ArrowRight,
  Bell,
} from 'lucide-react';
import { Category, LocationConfig, FilterState, DealType } from '../types';
import { useFavoritesAndAlerts } from '../context/FavoritesAndAlertsContext';

interface HeroSearchProps {
  heroTitle: string;
  heroSubtitle: string;
  heroBannerImage?: string;
  categories: Category[];
  locations: LocationConfig[];
  filterState: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onOpenAbout: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  heroTitle,
  heroSubtitle,
  heroBannerImage,
  categories,
  locations,
  filterState,
  onFilterChange,
  onResetFilters,
  onOpenAbout,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { openCreateAlertModal } = useFavoritesAndAlerts();

  // Available municipalities based on selected province
  const selectedLocation = locations.find((l) => l.province === filterState.province);
  const availableMunicipalities = selectedLocation ? selectedLocation.municipalities : [];

  const defaultHeroBg =
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80';

  const activeFiltersCount = [
    filterState.keyword,
    filterState.category,
    filterState.province,
    filterState.municipality,
    filterState.bedrooms !== 'todos' ? filterState.bedrooms : null,
    filterState.minPrice,
    filterState.maxPrice,
  ].filter(Boolean).length;

  return (
    <section className="relative min-h-[600px] lg:min-h-[660px] flex items-center justify-center overflow-hidden bg-slate-950 py-16 sm:py-20 lg:py-24">
      {/* Hero Background Image with deep blue/navy gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBannerImage || defaultHeroBg}
          alt="A.PANZO Imobiliária - Imóveis em Angola"
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Multilayer contrast overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-[#003366]/80" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/40 to-slate-950/90" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Institutional Punchline & Majestic Hero Typography */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-blue-200 text-xs font-semibold tracking-wider mb-6 backdrop-blur-md shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>A.PANZO – COMÉRCIO & PRESTAÇÃO DE SERVIÇOS, LDA</span>
          </div>

          <h1 className="font-brand-display text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] text-balance max-w-4xl mx-auto">
            Quer Vender, Comprar ou Arrendar?
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-extrabold text-blue-200/95 mt-3">
              Nós Temos a Solução Ideal para Si!
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-200/90 max-w-2xl mx-auto leading-relaxed font-normal">
            {heroSubtitle ||
              'Cuidamos do seu imóvel como se fosse nosso. Serviços de excelência com qualidade, rigor e confiança em Angola.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs sm:text-sm font-medium text-blue-200/80">
            <span>Compra & Venda</span>
            <span className="text-blue-300/40" aria-hidden="true">·</span>
            <span>Arrendamento</span>
            <span className="text-blue-300/40" aria-hidden="true">·</span>
            <span>Segurança Jurídica</span>
            <span className="text-blue-300/40" aria-hidden="true">·</span>
            <button
              onClick={onOpenAbout}
              className="text-white hover:text-amber-300 underline underline-offset-4 font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              Sobre a A.PANZO <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Smart Search Bar & Filter Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 max-w-5xl mx-auto">
          {/* Deal Type Switcher Tabs (Todos / Comprar / Arrendar) */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => onFilterChange({ dealType: 'todos' })}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  filterState.dealType === 'todos'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos os Imóveis
              </button>

              <button
                onClick={() => onFilterChange({ dealType: 'venda' })}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  filterState.dealType === 'venda'
                    ? 'bg-[#0052A5] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Comprar
              </button>

              <button
                onClick={() => onFilterChange({ dealType: 'arrendamento' })}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  filterState.dealType === 'arrendamento'
                    ? 'bg-[#0052A5] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Arrendar
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="hero-create-alert-btn"
                type="button"
                onClick={() => openCreateAlertModal(filterState)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#0052A5] text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Criar um alerta em tempo real"
              >
                <Bell className="w-3.5 h-3.5 text-[#0052A5]" />
                <span>Criar Alerta</span>
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={onResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 hover:text-rose-600 transition-colors font-semibold cursor-pointer"
                  title="Limpar todos os filtros"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Limpar ({activeFiltersCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Primary Quick Search Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Keyword / Reference / Neighborhood Input */}
            <div className="md:col-span-4">
              <label htmlFor="search-keyword" className="block text-xs font-bold text-slate-700 mb-2">
                Pesquisa Rápida
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="search-keyword"
                  type="text"
                  value={filterState.keyword}
                  onChange={(e) => onFilterChange({ keyword: e.target.value })}
                  placeholder="Bairro, condomínio, código..."
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="md:col-span-3">
              <label htmlFor="search-category" className="block text-xs font-bold text-slate-700 mb-2">
                Categoria
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="search-category"
                  value={filterState.category}
                  onChange={(e) => onFilterChange({ category: e.target.value })}
                  className="w-full pl-10 pr-8 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5] focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value="">Todas as Categorias</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Province Select */}
            <div className="md:col-span-3">
              <label htmlFor="search-province" className="block text-xs font-bold text-slate-700 mb-2">
                Localização / Província
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="search-province"
                  value={filterState.province}
                  onChange={(e) => onFilterChange({ province: e.target.value, municipality: '' })}
                  className="w-full pl-10 pr-8 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5] focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value="">Todas as Províncias</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.province}>
                      {loc.province}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Toggle Button */}
            <div className="md:col-span-2">
              <span className="hidden md:block text-xs font-bold text-transparent mb-2 select-none">
                Ação
              </span>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  showAdvanced || activeFiltersCount > 0
                    ? 'bg-[#0052A5] hover:bg-[#003366] text-white shadow-md'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black flex items-center justify-center ml-0.5">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expandable Advanced Filters (Municipality, Bedrooms, Price range) */}
          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-xl animate-in fade-in duration-200">
              {/* Municipality Select (Depends on Province) */}
              <div>
                <label htmlFor="search-municipality" className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Município
                </label>
                <select
                  id="search-municipality"
                  disabled={!filterState.province}
                  value={filterState.municipality}
                  onChange={(e) => onFilterChange({ municipality: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5] disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {filterState.province ? 'Todos os Municípios' : 'Selecione a província primeiro'}
                  </option>
                  {availableMunicipalities.map((mun) => (
                    <option key={mun} value={mun}>
                      {mun}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bedrooms Filter */}
              <div>
                <label htmlFor="search-bedrooms" className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Tipologia (Quartos)
                </label>
                <div className="relative">
                  <BedDouble className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="search-bedrooms"
                    value={filterState.bedrooms}
                    onChange={(e) => onFilterChange({ bedrooms: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5]"
                  >
                    <option value="todos">Qualquer Tipologia</option>
                    <option value="1">T1 (1 Quarto)</option>
                    <option value="2">T2 (2 Quartos)</option>
                    <option value="3">T3 (3 Quartos)</option>
                    <option value="4">T4 (4 Quartos)</option>
                    <option value="5+">T4+ / T5 ou Superior</option>
                  </select>
                </div>
              </div>

              {/* Price Min (Kz) */}
              <div>
                <label htmlFor="search-min-price" className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Preço Mínimo (Kz)
                </label>
                <input
                  id="search-min-price"
                  type="number"
                  placeholder="Ex: 5000000"
                  value={filterState.minPrice}
                  onChange={(e) =>
                    onFilterChange({ minPrice: e.target.value ? Number(e.target.value) : '' })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5]"
                />
              </div>

              {/* Price Max (Kz) */}
              <div>
                <label htmlFor="search-max-price" className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Preço Máximo (Kz)
                </label>
                <input
                  id="search-max-price"
                  type="number"
                  placeholder="Ex: 80000000"
                  value={filterState.maxPrice}
                  onChange={(e) =>
                    onFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : '' })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
