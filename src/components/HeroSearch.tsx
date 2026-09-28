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
import { Category, LocationConfig, FilterState, Property } from '../types';
import { useFavoritesAndAlerts } from '../context/FavoritesAndAlertsContext';
import { FeaturedNewsTicker } from './FeaturedNewsTicker';

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
  featuredProperties?: Property[];
  onSelectProperty?: (property: Property) => void;
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
  featuredProperties = [],
  onSelectProperty,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { openCreateAlertModal } = useFavoritesAndAlerts();

  // Available municipalities based on selected province
  const selectedLocation = locations.find((l) => l.province === filterState.province);
  const availableMunicipalities = selectedLocation ? selectedLocation.municipalities : [];

  // Warm, sunny, real-tone architectural hero image
  const defaultHeroBg =
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2000&q=80';

  const activeFiltersCount = [
    filterState.keyword,
    filterState.category,
    filterState.province,
    filterState.municipality,
    filterState.bedrooms !== 'todos' ? filterState.bedrooms : null,
    filterState.minPrice,
    filterState.maxPrice,
  ].filter(Boolean).length;

  const handleTriggerSearch = () => {
    const listingsEl = document.getElementById('catalogo-imoveis');
    if (listingsEl) {
      listingsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[620px] lg:min-h-[690px] flex items-center justify-center overflow-hidden bg-slate-950 py-14 sm:py-20 lg:py-24">
      {/* Hero Background Image with warm, real-tone natural treatment (no dark blue wash) */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBannerImage || defaultHeroBg}
          alt="A.PANZO Imobiliária - Imóveis em Angola"
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Soft, warm contrast overlay that maintains authentic sunlight and color vibrancy */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-slate-950/50 backdrop-contrast-[1.03]" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/65 via-transparent to-slate-950/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Institutional Punchline & Majestic Hero Typography */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-amber-200 text-xs font-bold tracking-wider mb-5 backdrop-blur-md shadow-xs drop-shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>A.PANZO – COMÉRCIO & PRESTAÇÃO DE SERVIÇOS, LDA</span>
          </div>

          <h1 className="font-brand-display text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] text-balance max-w-4xl mx-auto drop-shadow-md">
            Quer Vender, Comprar ou Arrendar?
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-extrabold text-amber-300 mt-3 drop-shadow-sm">
              Nós Temos a Solução Ideal para Si!
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-100 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-xs">
            {heroSubtitle ||
              'Cuidamos do seu imóvel como se fosse nosso. Serviços de excelência com qualidade, rigor e confiança em Angola.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs sm:text-sm font-medium text-slate-200">
            <span>Compra & Venda</span>
            <span className="text-amber-300/60" aria-hidden="true">·</span>
            <span>Arrendamento</span>
            <span className="text-amber-300/60" aria-hidden="true">·</span>
            <span>Segurança Jurídica</span>
            <span className="text-amber-300/60" aria-hidden="true">·</span>
            <button
              onClick={onOpenAbout}
              className="text-amber-300 hover:text-white underline underline-offset-4 font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              Sobre a A.PANZO <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Ticker de Destaques em Formato Noticiário (Hero Section) */}
        {featuredProperties.length > 0 && onSelectProperty && (
          <FeaturedNewsTicker
            properties={featuredProperties}
            onSelectProperty={onSelectProperty}
          />
        )}

        {/* Smart Search Bar & Filter Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/60 max-w-5xl mx-auto">
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
            {/* Keyword / Reference / Neighborhood Input with Stylized Search Button on Right */}
            <div className="md:col-span-5">
              <label htmlFor="search-keyword" className="block text-xs font-bold text-slate-700 mb-2">
                Pesquisa Rápida
              </label>
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  id="search-keyword"
                  type="text"
                  value={filterState.keyword}
                  onChange={(e) => onFilterChange({ keyword: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTriggerSearch();
                    }
                  }}
                  placeholder="Bairro, condomínio, código..."
                  className="w-full pl-10 pr-24 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5] focus:border-transparent transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={handleTriggerSearch}
                  className="absolute right-1.5 px-3.5 py-1.5 bg-[#0052A5] hover:bg-[#003366] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Pesquisar agora"
                >
                  <Search className="w-3.5 h-3.5 text-white" />
                  <span>Buscar</span>
                </button>
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
            <div className="md:col-span-2">
              <label htmlFor="search-province" className="block text-xs font-bold text-slate-700 mb-2">
                Província
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="search-province"
                  value={filterState.province}
                  onChange={(e) => onFilterChange({ province: e.target.value, municipality: '' })}
                  className="w-full pl-10 pr-8 py-3 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5] focus:border-transparent transition-all appearance-none cursor-pointer"
                >
                  <option value="">Todas</option>
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
