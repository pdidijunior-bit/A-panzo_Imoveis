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
    <section className="relative min-h-[560px] lg:min-h-[620px] flex items-center justify-center overflow-hidden bg-slate-950 py-12 lg:py-16">
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
        {/* Institutional Punchline & Description */}
        <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            A.PANZO - Comércio & Prestação de Serviços, LDA
          </div>

          <h1 className="font-brand-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight sm:leading-snug">
            {heroTitle || 'Quer Vender, Comprar ou Arrendar? Nós Temos a Solução Ideal para Si!'}
          </h1>

          <p className="mt-4 text-sm sm:text-base lg:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle ||
              'Cuidamos do seu imóvel como se fosse nosso. Serviços de excelência com qualidade e confiança em Angola.'}
          </p>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs font-semibold text-blue-200">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0052A5]"></span>
              Compra & Venda
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0052A5]"></span>
              Arrendamento
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0052A5]"></span>
              Segurança Jurídica
            </span>
            <span>•</span>
            <button
              onClick={onOpenAbout}
              className="underline hover:text-white transition-colors flex items-center gap-1 text-white font-bold"
            >
              Sobre a A.PANZO <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Smart Search Bar & Filter Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 border border-slate-100 max-w-5xl mx-auto">
          {/* Deal Type Switcher Tabs (Todos / Comprar / Arrendar) - Clean essential labels */}
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <button
              onClick={() => onFilterChange({ dealType: 'todos' })}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                filterState.dealType === 'todos'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Todos os Imóveis
            </button>

            <button
              onClick={() => onFilterChange({ dealType: 'venda' })}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                filterState.dealType === 'venda'
                  ? 'bg-[#0052A5] text-white shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Comprar
            </button>

            <button
              onClick={() => onFilterChange({ dealType: 'arrendamento' })}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                filterState.dealType === 'arrendamento'
                  ? 'bg-[#0052A5] text-white shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Arrendar
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                id="hero-create-alert-btn"
                type="button"
                onClick={() => openCreateAlertModal(filterState)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0052A5] border border-blue-200 text-xs font-bold transition-all shadow-xs"
                title="Criar um alerta em tempo real"
              >
                <Bell className="w-3.5 h-3.5 text-[#0052A5]" />
                <span className="hidden sm:inline">Criar Alerta</span>
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={onResetFilters}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#0052A5] transition-colors font-semibold"
                  title="Limpar todos os filtros"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Limpar ({activeFiltersCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Primary Quick Search Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Keyword / Reference / Neighborhood Input */}
            <div className="lg:col-span-4 relative">
              <label htmlFor="search-keyword" className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Pesquisa Rápida
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="search-keyword"
                  type="text"
                  value={filterState.keyword}
                  onChange={(e) => onFilterChange({ keyword: e.target.value })}
                  placeholder="Bairro, condomínio, código..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="lg:col-span-3">
              <label htmlFor="search-category" className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Categoria
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="search-category"
                  value={filterState.category}
                  onChange={(e) => onFilterChange({ category: e.target.value })}
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5] focus:bg-white transition-all appearance-none cursor-pointer"
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
            <div className="lg:col-span-3">
              <label htmlFor="search-province" className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Localização / Província
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="search-province"
                  value={filterState.province}
                  onChange={(e) => onFilterChange({ province: e.target.value, municipality: '' })}
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5] focus:bg-white transition-all appearance-none cursor-pointer"
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
            <div className="lg:col-span-2 flex items-end gap-2 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  showAdvanced || activeFiltersCount > 0
                    ? 'bg-blue-50 border-blue-300 text-[#0052A5] font-extrabold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#0052A5]" />
                <span>Filtros</span>
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
