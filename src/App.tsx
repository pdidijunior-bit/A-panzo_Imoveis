import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { dbService } from './lib/dbService';
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
} from 'lucide-react';

function MainApp() {
  const { isAdmin } = useAuth();

  // Data States
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationConfig[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Active View and Modals
  const [activeView, setActiveView] = useState<'home' | 'admin'>('home');
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
  });

  const [sortOption, setSortOption] = useState<'recent' | 'price_asc' | 'price_desc'>('recent');

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

  // Filter properties in memory
  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      // Deal type
      if (filters.dealType !== 'todos' && item.dealType !== filters.dealType) {
        return false;
      }
      // Category
      if (filters.category && item.category !== filters.category) {
        return false;
      }
      // Province
      if (filters.province && item.province.toLowerCase() !== filters.province.toLowerCase()) {
        return false;
      }
      // Municipality
      if (
        filters.municipality &&
        item.municipality.toLowerCase() !== filters.municipality.toLowerCase()
      ) {
        return false;
      }
      // Bedrooms
      if (filters.bedrooms !== 'todos') {
        if (filters.bedrooms === '5+') {
          if ((item.bedrooms || 0) < 5) return false;
        } else {
          if (item.bedrooms !== Number(filters.bedrooms)) return false;
        }
      }
      // Min Price
      if (filters.minPrice !== '' && item.price < Number(filters.minPrice)) {
        return false;
      }
      // Max Price
      if (filters.maxPrice !== '' && item.price > Number(filters.maxPrice)) {
        return false;
      }
      // Keyword (title, code, description, neighborhood)
      if (filters.keyword.trim()) {
        const query = filters.keyword.toLowerCase().trim();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesCode = item.code?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesNeighbor = item.neighborhood?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCode && !matchesDesc && !matchesNeighbor) {
          return false;
        }
      }
      return true;
    });
  }, [properties, filters]);

  // Sort properties
  const sortedProperties = useMemo(() => {
    const list = [...filteredProperties];
    if (sortOption === 'price_asc') {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortOption === 'price_desc') {
      return list.sort((a, b) => b.price - a.price);
    }
    // Default 'recent'
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    });
  };

  const handleSelectDealType = (dealType: 'venda' | 'arrendamento') => {
    handleFilterChange({ dealType });
    const listingsEl = document.getElementById('catalogo-imoveis');
    if (listingsEl) {
      listingsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (catSlug: string) => {
    handleFilterChange({ category: catSlug });
    const listingsEl = document.getElementById('catalogo-imoveis');
    if (listingsEl) {
      listingsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cleanWhatsapp = (settings.whatsapp || '+244924875869').replace(/[^0-9]/g, '');

  return (
    <FavoritesAndAlertsProvider catalogProperties={properties}>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-brand-body selection:bg-amber-400 selection:text-slate-950">
        {/* 1. Notice / Eye-Catching Marquee Banner */}
        <MarqueeBanner
          notice={settings.marqueeNotice}
          phone={settings.phone}
          whatsapp={settings.whatsapp}
          visible={settings.showMarquee}
        />

        {/* 2. Top Modern Navbar with Sliding Drawer for Mobile/Tablet */}
        <Navbar
          logoUrl={settings.logoUrl}
          phone={settings.phone}
          whatsapp={settings.whatsapp}
          catalogProperties={properties}
          onOpenAbout={() => setIsAboutOpen(true)}
          onOpenChat={() => setIsChatOpen(true)}
          onOpenAdmin={() => setActiveView('admin')}
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
      ) : (
        <main className="flex-1">
          {/* Hero & Smart Search Section */}
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
          />

          {/* Quick Category Navigation Pills */}
          <section className="bg-white border-b border-slate-200/80 py-4 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => handleFilterChange({ category: '' })}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
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
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
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
                  <option value="price_asc">Preço: Menor para Maior</option>
                  <option value="price_desc">Preço: Maior para Menor</option>
                </select>
              </div>
            </div>

            {/* Properties Grid or Empty State */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse"
                  >
                    <div className="aspect-4/3 bg-slate-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-5 bg-slate-200 rounded w-3/4" />
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                      <div className="h-8 bg-slate-200 rounded mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {sortedProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onSelect={(p) => setSelectedProperty(p)}
                    agencyPhone={settings.phone}
                    agencyWhatsapp={settings.whatsapp}
                  />
                ))}
              </div>
            ) : (
              /* Informative Empty State */
              <div className="bg-white rounded-3xl border border-slate-200/80 p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8" />
                </div>
                <h3 className="font-brand-display text-xl font-bold text-slate-900">
                  {properties.length === 0
                    ? 'Catálogo em Atualização'
                    : 'Nenhum imóvel corresponde aos filtros selecionados'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                  {properties.length === 0
                    ? 'A nossa equipa administrativa está a publicar novas oportunidades em Luanda e Malanje. Pode contactar-nos diretamente para solicitar o imóvel que procura.'
                    : 'Tente ajustar ou limpar os filtros de pesquisa para visualizar outras opções disponíveis no catálogo da Aliança Imobiliária.'}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  {properties.length > 0 ? (
                    <button
                      onClick={handleResetFilters}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl text-xs font-bold transition-all"
                    >
                      Limpar Filtros de Pesquisa
                    </button>
                  ) : isAdmin ? (
                    <button
                      onClick={() => setActiveView('admin')}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Publicar Imóvel no Painel ADM
                    </button>
                  ) : null}

                  <a
                    href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Olá A.PANZO Imobiliária! Gostaria de encomendar a procura de um imóvel específico.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Fale Connosco</span>
                  </a>
                </div>
              </div>
            )}
          </section>

          {/* Institutional Trust & Call To Action Banner */}
          <section className="bg-gradient-to-r from-[#00172E] via-[#002244] to-[#003366] text-white py-14 sm:py-16 border-y border-[#0052A5]/30 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-widest block">
                    Proprietários e Investidores
                  </span>
                  <h2 className="font-brand-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white">
                    Deseja Vender ou Arrendar o Seu Imóvel com Segurança?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
                    A A.PANZO Imobiliária cuida do seu imóvel como se fosse nosso. Gerimos todo o processo de divulgação, qualificação de interessados, vistorias e conformidade jurídica em Luanda, Malanje e demais províncias de Angola.
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
                    className="inline-flex items-center justify-center gap-2 bg-[#0052A5] hover:bg-[#003366] active:scale-95 text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-all shadow-md"
                    title={`Ligar para ${settings.phone}`}
                  >
                    <Phone className="w-4 h-4 text-white" />
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
        onSelectDealType={handleSelectDealType}
      />

      {/* 5. Floating Real-Time Assistance Pill (Discreet, prestigious, and softly shadowed) */}
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

      {/* 7. Customer Dashboard (Área do Cliente: Favoritos, Alertas, Notificações) */}
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

      {/* 9. Global Auth Modal (Registro e Login com E-mail/Senha e Google) */}
      <GlobalAuthModal />
    </div>
  </FavoritesAndAlertsProvider>
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

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
