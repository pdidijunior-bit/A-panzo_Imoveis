import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { dbService } from './lib/dbService';
import { smartPropertySearch } from './lib/smartSearch';
import {
  Property,
  Category,
  LocationConfig,
  SiteSettings,
  FilterState,
  DealType,
} from './types';
import { DEFAULT_SITE_SETTINGS } from './lib/defaultData';
import { Navbar } from './components/Navbar';
import { MarqueeBanner } from './components/MarqueeBanner';
import { HeroSearch } from './components/HeroSearch';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { AboutUsModal } from './components/AboutUsModal';
import { RealTimeChat } from './components/RealTimeChat';
import { AdminPanel } from './components/AdminPanel';
import { PartnerPortal } from './components/PartnerPortal';
import { Footer } from './components/Footer';
import { LegalModal } from './components/LegalModals';
import { FavoritesAndAlertsProvider, useFavoritesAndAlerts } from './context/FavoritesAndAlertsContext';
import { UserDashboardModal } from './components/UserDashboardModal';
import { CreateAlertModal } from './components/CreateAlertModal';
import { AuthModal } from './components/AuthModal';
import {
  Building,
  Headphones,
  Sparkles,
  Phone,
  MessageCircle,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  Filter,
  Layers,
  Home,
  Plus,
  Briefcase,
  Star,
} from 'lucide-react';

interface MainContentProps {
  properties: Property[];
  categories: Category[];
  locations: LocationConfig[];
  settings: SiteSettings;
  isLoading: boolean;
  loadBaseData: () => Promise<void>;
}

function MainContent({
  properties,
  categories,
  locations,
  settings,
  isLoading,
  loadBaseData,
}: MainContentProps) {
  const { isAdmin } = useAuth();
  const { openAuthModal } = useFavoritesAndAlerts();

  // Active View and Modals
  const [activeView, setActiveView] = useState<'home' | 'admin' | 'partners'>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [attachedChatProperty, setAttachedChatProperty] = useState<Property | null>(null);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | null>(null);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    dealType: 'todos',
    category: '',
    province: '',
    municipality: '',
    bedrooms: 'todos',
    minPrice: '',
    maxPrice: '',
    keyword: '',
    bathrooms: '',
    sortBy: 'recent',
  });

  const [sortOption, setSortOption] = useState<'recent' | 'price_asc' | 'price_desc'>('recent');

  // Filter properties with Smart Fuzzy Search & Multi-criteria
  const filteredProperties = useMemo(() => {
    let list = (properties || []).filter((item) => {
      if (!item) return false;
      // Deal type
      if (filters.dealType !== 'todos' && item.dealType !== filters.dealType) {
        return false;
      }
      // Category
      if (filters.category && item.category !== filters.category) {
        return false;
      }
      // Province
      if (filters.province) {
        const itemProv = (item.province || '').toLowerCase();
        const filterProv = filters.province.toLowerCase();
        if (itemProv !== filterProv) return false;
      }
      // Municipality
      if (filters.municipality) {
        const itemMuni = (item.municipality || '').toLowerCase();
        const filterMuni = filters.municipality.toLowerCase();
        if (itemMuni !== filterMuni) return false;
      }
      // Bedrooms
      if (filters.bedrooms !== 'todos') {
        const itemBeds = typeof item.bedrooms === 'number' ? item.bedrooms : 0;
        if (filters.bedrooms === '5+') {
          if (itemBeds < 5) return false;
        } else {
          if (itemBeds !== Number(filters.bedrooms)) return false;
        }
      }
      // Min Price
      const itemPrice = typeof item.price === 'number' ? item.price : 0;
      if (filters.minPrice !== '' && itemPrice < Number(filters.minPrice)) {
        return false;
      }
      // Max Price
      if (filters.maxPrice !== '' && itemPrice > Number(filters.maxPrice)) {
        return false;
      }
      return true;
    });

    // Smart fuzzy search across title, code, neighborhood, typology, condominium, features
    if (filters.keyword && filters.keyword.trim()) {
      list = smartPropertySearch(list, filters.keyword);
    }

    return list;
  }, [properties, filters]);

  // Sort properties
  const sortedProperties = useMemo(() => {
    const list = [...filteredProperties];
    if (sortOption === 'price_asc') {
      return list.sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    if (sortOption === 'price_desc') {
      return list.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    // Default 'recent'
    return list.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      const validA = isNaN(timeA) ? 0 : timeA;
      const validB = isNaN(timeB) ? 0 : timeB;
      return validB - validA;
    });
  }, [filteredProperties, sortOption]);

  const handleFilterChange = (newValues: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newValues }));
  };

  const handleResetFilters = () => {
    setFilters({
      dealType: 'todos',
      category: '',
      province: '',
      municipality: '',
      bedrooms: 'todos',
      minPrice: '',
      maxPrice: '',
      keyword: '',
      bathrooms: '',
      sortBy: 'recent',
    });
  };

  const handleSelectDealType = (dealType: 'venda' | 'arrendamento') => {
    handleFilterChange({ dealType });
    setActiveView('home');
    const listingsEl = document.getElementById('catalogo-imoveis');
    if (listingsEl) {
      listingsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (catSlug: string) => {
    handleFilterChange({ category: catSlug });
    setActiveView('home');
    const listingsEl = document.getElementById('catalogo-imoveis');
    if (listingsEl) {
      listingsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cleanWhatsapp = (settings?.whatsapp || '+244 925 883 080').replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-brand-body selection:bg-amber-400 selection:text-slate-950">
      {/* 1. Notice / Eye-Catching Marquee Banner */}
      <MarqueeBanner
        notice={settings.marqueeNotice || ''}
        phone={settings.phone || '+244 925 883 080'}
        whatsapp={settings.whatsapp || '+244 925 883 080'}
        visible={settings.showMarquee}
      />

      {/* 2. Top Modern Navbar with Sliding Drawer for Mobile/Tablet */}
      <Navbar
        logoUrl={settings.logoUrl}
        phone={settings.phone || '+244 925 883 080'}
        whatsapp={settings.whatsapp || '+244 925 883 080'}
        isAdmin={isAdmin}
        catalogProperties={properties}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenAdmin={() => setActiveView('admin')}
        onOpenPartners={() => setActiveView('partners')}
        onSelectCategory={handleSelectCategory}
        onSelectDealType={handleSelectDealType}
        activeView={activeView}
        onNavigateHome={() => setActiveView('home')}
        onSelectProperty={(prop) => setSelectedProperty(prop)}
      />

      {/* 3. Main Body */}
      {activeView === 'admin' ? (
        <AdminPanel
          onClose={() => setActiveView('home')}
          properties={properties}
          categories={categories}
          locations={locations}
          siteSettings={settings}
          onRefreshData={loadBaseData}
        />
      ) : activeView === 'partners' ? (
        <PartnerPortal
          onBackToHome={() => setActiveView('home')}
          catalogProperties={properties}
          categories={categories}
          locations={locations}
          onSelectProperty={(prop) => setSelectedProperty(prop)}
          onOpenAuth={() => openAuthModal()}
        />
      ) : (
        <main className="flex-1">
          {/* Hero & Smart Search Section with Featured News Ticker */}
          <HeroSearch
            heroTitle={settings.heroTitle}
            heroSubtitle={settings.heroSubtitle}
            heroBannerImage={settings.heroBannerImage}
            categories={categories}
            locations={locations}
            filterState={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onOpenAbout={() => setIsAboutOpen(true)}
            featuredProperties={properties}
            onSelectProperty={(prop) => setSelectedProperty(prop)}
          />

          {/* Quick Category Navigation Pills */}
          <section className="bg-white border-b border-slate-200/80 py-4 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => handleFilterChange({ category: '' })}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    !filters.category
                      ? 'bg-slate-900 text-amber-400 shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Todas as Categorias
                </button>

                {categories.map((cat) => {
                  const isActive = filters.category === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleFilterChange({ category: cat.slug })}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow-xs font-extrabold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Main Listings Catalog Section */}
          <section id="catalogo-imoveis" className="py-12 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Catalog Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Portfólio de Imóveis Verificados</span>
                </div>
                <h2 className="font-brand-display text-2xl sm:text-3xl font-extrabold text-slate-950">
                  Imóveis Recentes Publicados
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Apresentando {sortedProperties.length}{' '}
                  {sortedProperties.length === 1 ? 'imóvel disponível' : 'imóveis disponíveis'} em Angola
                </p>
              </div>

              {/* Sorting options */}
              <div className="flex items-center gap-3 self-start md:self-auto">
                <label htmlFor="sort-select" className="text-xs font-bold text-slate-500 whitespace-nowrap">
                  Ordenar por:
                </label>
                <select
                  id="sort-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-xs cursor-pointer"
                >
                  <option value="recent">Mais Recentes</option>
                  <option value="price_asc">Menor Preço</option>
                  <option value="price_desc">Maior Preço</option>
                </select>
              </div>
            </div>

            {/* Properties Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
                    <div className="aspect-4/3 bg-slate-200 rounded-xl" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-6 bg-slate-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : sortedProperties.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8" />
                </div>
                <h3 className="font-brand-display text-lg font-bold text-slate-900">
                  Nenhum imóvel corresponde aos critérios
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                  Não encontramos imóveis disponíveis com os filtros selecionados. Tente ajustar os termos de pesquisa ou limpar os filtros.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-[#0052A5] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Limpar Todos os Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProperties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    onSelect={(p) => setSelectedProperty(p)}
                    agencyPhone={settings.phone}
                    agencyWhatsapp={settings.whatsapp}
                  />
                ))}
              </div>
            )}
          </section>

          {/* B2B Partner Portal Promotion Banner */}
          <section className="bg-gradient-to-r from-slate-900 via-[#001F3F] to-[#003366] text-white py-12 px-4 sm:px-6 lg:px-8 my-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Módulo B2B para Imobiliárias & Corretores</span>
                </div>
                <h3 className="font-brand-display text-2xl sm:text-3xl font-black text-white">
                  É uma Imobiliária ou Mediador em Angola?
                </h3>
                <p className="mt-2 text-sm text-slate-200 leading-relaxed">
                  Divulgue os seus imóveis na rede colaborativa da A.PANZO. Tenha autonomia total para gerir o seu portfólio, aceder a compradores qualificados e fechar mais negócios.
                </p>
              </div>

              <button
                onClick={() => setActiveView('partners')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl cursor-pointer shrink-0"
              >
                <span>Aderir à Rede de Parceiros</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Angola Representativity & Success Stories */}
          <section className="py-14 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0052A5] block mb-1">
                Famílias & Investidores em Angola
              </span>
              <h2 className="font-brand-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                Histórias Reais de Sucesso com a A.PANZO
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Conheça quem confiou na nossa assessoria para realizar a compra, venda ou arrendamento do seu património em Luanda e províncias.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Testimonial 1 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed mb-6">
                    "Comprar a nossa vivenda em Talatona foi um processo sem sobressaltos. A equipa da A.PANZO cuidou de toda a verificação da titularidade e certidão predial com transparência exemplar."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    alt="Dra. Teresa Van-Dúnem"
                    loading="lazy"
                    decoding="async"
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#0052A5]"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Dra. Teresa Van-Dúnem</h4>
                    <p className="text-[11px] text-slate-500">Proprietária em Talatona, Luanda</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed mb-6">
                    "Precisávamos de um espaço comercial espaçoso para a expansão da nossa empresa no Morro Bento. A A.PANZO encontrou a localização perfeita e mediou o contrato com rigor admirável."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                    alt="Eng. Manuel dos Santos"
                    loading="lazy"
                    decoding="async"
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#0052A5]"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Eng. Manuel dos Santos</h4>
                    <p className="text-[11px] text-slate-500">Diretor Comercial, Luanda</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed mb-6">
                    "O nosso apartamento foi arrendado a um inquilino idóneo em menos de 15 dias. A gestão contínua e o rigor com que cuidam do imóvel dão-nos total paz de espírito."
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80"
                    alt="Dra. Beatriz Panzo"
                    loading="lazy"
                    decoding="async"
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#0052A5]"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Dra. Beatriz Panzo</h4>
                    <p className="text-[11px] text-slate-500">Investidora Imobiliária, Luanda</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Direct CTA Banner */}
          <section className="py-12 bg-white border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-r from-[#003366] to-[#0052A5] rounded-3xl p-8 sm:p-12 text-white shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Atendimento Especializado em Angola
                  </span>
                  <h3 className="font-brand-display text-2xl sm:text-3xl lg:text-4xl font-black leading-tight">
                    Tem um Imóvel para Vender ou Arrendar?
                  </h3>
                  <p className="text-slate-200 text-xs sm:text-sm max-w-xl leading-relaxed">
                    Confie a promoção do seu património à A.PANZO. Cuidamos do seu imóvel como se fosse nosso, com avaliação precisa e segurança jurídica garantida.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="flex items-center gap-2 text-xs text-blue-200">
                      <CheckCircle2 className="w-4 h-4 text-blue-300 shrink-0" />
                      <span>Avaliação Rigorosa</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-200">
                      <CheckCircle2 className="w-4 h-4 text-blue-300 shrink-0" />
                      <span>Divulgação Estratégica</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-blue-200">
                      <CheckCircle2 className="w-4 h-4 text-blue-300 shrink-0" />
                      <span>Apoio Jurídico Total</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
                  <a
                    href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Olá A.PANZO Imobiliária! Gostaria de cadastrar o meu imóvel para venda/arrendamento.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-lg"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Fale Connosco</span>
                  </a>

                  <a
                    href={`tel:${settings.phone}`}
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 active:scale-95 text-[#003366] font-bold text-xs py-3.5 px-6 rounded-xl transition-all shadow-md"
                    title={`Ligar para ${settings.phone}`}
                  >
                    <Phone className="w-4 h-4 text-[#0052A5]" />
                    <span>Ligar Agora</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Pillars of Excellence (Diferenciais A.PANZO Imobiliária) */}
          <section className="py-14 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#0052A5] block mb-1">
                Diferenciais da Nossa Marca
              </span>
              <h2 className="font-brand-display text-2xl sm:text-3xl font-extrabold text-slate-900">
                Por Que Escolher a A.PANZO Imobiliária?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#0052A5] text-white flex items-center justify-center font-bold mb-4 shadow-xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">
                    Segurança Jurídica Absoluta
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Verificação rigorosa de titularidade, conservatória, direitos de superfície e documentação antes de qualquer formalização contratual em Angola.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#003366] text-white flex items-center justify-center font-bold mb-4 shadow-xs">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">
                    Consultoria de Alta Confiança
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Equipa com conhecimento aprofundado do mercado angolano e apoio contínuo para proprietários, compradores e inquilinos.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#0052A5] text-white flex items-center justify-center font-bold mb-4 shadow-xs">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5">
                    Acompanhamento Personalizado
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Visitas presenciais acompanhadas, negociação orientada para o benefício de ambas as partes e apoio contínuo pós-transação.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* 4. Footer */}
      <Footer
        settings={settings}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenLegal={(type) => setLegalModalType(type)}
        onOpenAdmin={() => setActiveView('admin')}
        onOpenPartners={() => setActiveView('partners')}
        onSelectDealType={handleSelectDealType}
      />

      {/* 5. Floating Real-Time Assistance Pill */}
      {!isChatOpen && activeView === 'home' && (
        <aside aria-label="Apoio ao cliente em tempo real" className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsChatOpen(true)}
            className="group flex items-center gap-2.5 bg-[#003366] hover:bg-[#0052A5] active:scale-95 text-white font-semibold text-xs py-2.5 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20 backdrop-blur-md cursor-pointer"
            title="Assistência em tempo real com a equipa A.PANZO"
          >
            <div className="relative flex items-center justify-center">
              <Headphones className="w-4 h-4 text-emerald-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full ring-1 ring-[#003366] animate-pulse" />
            </div>
            <span className="font-medium tracking-wide">Assistência Online</span>
          </button>
        </aside>
      )}

      {/* 6. Modals */}
      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        agencyPhone={settings.phone}
        agencyWhatsapp={settings.whatsapp}
        onOpenLiveChatWithProperty={(prop) => {
          setAttachedChatProperty(prop);
          setIsChatOpen(true);
        }}
      />

      {/* About Us Modal */}
      <AboutUsModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        settings={settings}
      />

      {/* Real-Time Live Chat Drawer/Widget */}
      <RealTimeChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        attachedProperty={attachedChatProperty}
        onClearAttachedProperty={() => setAttachedChatProperty(null)}
        agencyPhone={settings.phone}
        agencyWhatsapp={settings.whatsapp}
      />

      {/* Legal & Terms Modal */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* 7. Customer Dashboard */}
      <UserDashboardModal
        catalogProperties={properties}
        categories={categories}
        locations={locations}
        whatsappNumber={settings.whatsapp}
        onSelectProperty={(prop) => setSelectedProperty(prop)}
        onApplyAlertFilter={(alertCriteria) => {
          setFilters((prev) => ({
            ...prev,
            ...alertCriteria,
          }));
          const listingsEl = document.getElementById('catalogo-imoveis');
          if (listingsEl) {
            listingsEl.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* 8. Create Alert Modal */}
      <CreateAlertModal
        categories={categories}
        locations={locations}
        catalogProperties={properties}
      />

      {/* 9. Global Auth Modal */}
      <GlobalAuthModal />
    </div>
  );
}

function GlobalAuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, authModalPrompt, authSuccessCallback } = useFavoritesAndAlerts();
  return (
    <AuthModal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      promptText={authModalPrompt}
      onSuccess={() => {
        if (authSuccessCallback) authSuccessCallback();
      }}
    />
  );
}

function MainApp() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationConfig[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load Categories, Locations, Settings
  const loadBaseData = async () => {
    try {
      const [cats, locs, siteConf] = await Promise.all([
        dbService.getCategories(),
        dbService.getLocations(),
        dbService.getSiteSettings(),
      ]);
      setCategories(cats);
      setLocations(locs);
      setSettings(siteConf);
    } catch (err) {
      console.warn('Erro ao carregar dados base:', err);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  // Subscribe to real-time properties
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = dbService.subscribeProperties(
      (items) => {
        setProperties(items);
        setIsLoading(false);
      },
      (err) => {
        console.warn('Erro ao carregar imóveis:', err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <FavoritesAndAlertsProvider catalogProperties={properties}>
      <MainContent
        properties={properties}
        categories={categories}
        locations={locations}
        settings={settings}
        isLoading={isLoading}
        loadBaseData={loadBaseData}
      />
    </FavoritesAndAlertsProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
