import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Phone,
  MessageCircle,
  Home,
  Tag,
  Building,
  Info,
  Shield,
  Heart,
  Bell,
  Headphones,
  User as UserIcon,
  ChevronRight,
  Briefcase,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { NotificationDropdown } from './NotificationDropdown';
import { Property } from '../types';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useFavoritesAndAlerts } from '../context/FavoritesAndAlertsContext';

interface NavbarProps {
  onOpenAdmin: () => void;
  isAdmin: boolean;
  onNavigateHome: () => void;
  activeView: 'home' | 'admin';
  phone: string;
  whatsapp: string;
  logoUrl?: string;
  onOpenAbout: () => void;
  onOpenChat: () => void;
  onSelectCategory?: (categoryId: string) => void;
  onSelectDealType?: (dealType: 'venda' | 'arrendamento') => void;
  favoriteCount?: number;
  onOpenUserDashboard?: (initialTab?: 'favorites' | 'alerts' | 'profile') => void;
  catalogProperties?: Property[];
  onSelectProperty?: (property: Property) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAdmin,
  isAdmin,
  onNavigateHome,
  activeView,
  phone,
  whatsapp,
  logoUrl,
  onOpenAbout,
  onOpenChat,
  onSelectCategory,
  onSelectDealType,
  favoriteCount = 0,
  onOpenUserDashboard,
  catalogProperties = [],
  onSelectProperty,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { currentUser } = useAuth();
  const favContext = useFavoritesAndAlerts();

  const effectiveFavoriteCount = favoriteCount > 0 ? favoriteCount : favContext.favoriteCount;
  const effectiveUnreadCount = favContext.unreadCount;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cleanWhatsapp = (whatsapp || '+244 925 883 080').replace(/[^0-9]/g, '');

  const closeMenu = () => setIsMenuOpen(false);

  const openUserDashboard = (tab?: 'favorites' | 'alerts' | 'profile') => {
    if (onOpenUserDashboard) {
      onOpenUserDashboard(tab);
    } else {
      favContext.openUserDashboard(tab || 'favorites');
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-200 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200'
            : 'bg-white border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo / Brand with generous breathing room */}
            <div className="shrink-0 mr-6 lg:mr-8 xl:mr-10">
              <button
                onClick={onNavigateHome}
                className="text-left focus:outline-hidden group cursor-pointer block"
                aria-label="A.PANZO Imobiliária - Início"
              >
                <BrandLogo customLogoUrl={logoUrl} size="md" />
              </button>
            </div>

            {/* Desktop Navigation Links with generous spacing */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 2xl:gap-9 text-sm font-medium text-slate-600">
              <button
                onClick={() => onNavigateHome()}
                className={`transition-colors hover:text-[#0052A5] cursor-pointer py-1 ${
                  activeView === 'home' ? 'text-[#0052A5] font-bold' : ''
                }`}
              >
                Início
              </button>

              <button
                onClick={() => {
                  onNavigateHome();
                  if (onSelectDealType) onSelectDealType('venda');
                }}
                className="transition-colors hover:text-[#0052A5] cursor-pointer py-1"
              >
                Comprar
              </button>

              <button
                onClick={() => {
                  onNavigateHome();
                  if (onSelectDealType) onSelectDealType('arrendamento');
                }}
                className="transition-colors hover:text-[#0052A5] cursor-pointer py-1"
              >
                Arrendar
              </button>

              <button
                onClick={() => {
                  onNavigateHome();
                  if (onSelectCategory) onSelectCategory('cat-terrenos');
                }}
                className="transition-colors hover:text-[#0052A5] cursor-pointer py-1"
              >
                Terrenos
              </button>

              <button
                onClick={() => {
                  onNavigateHome();
                  if (onSelectCategory) onSelectCategory('cat-espacos-comerciais');
                }}
                className="transition-colors hover:text-[#0052A5] cursor-pointer py-1"
              >
                Comercial
              </button>

              <button
                onClick={onOpenAbout}
                className="transition-colors hover:text-[#0052A5] cursor-pointer py-1"
              >
                Sobre Nós
              </button>
            </nav>

            {/* Direct Contact Buttons (Desktop) - Unified hierarchy: Primary (WhatsApp) + Secondary (Call) + Support */}
            <div className="hidden sm:flex items-center gap-2.5 xl:gap-3 ml-auto">
              {/* WhatsApp Direct (Primary Action - Green) */}
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Olá A.PANZO Imobiliária! Gostaria de consultar informações sobre os imóveis disponíveis.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-semibold text-xs tracking-wide px-4 py-2.5 rounded-xl transition-all shadow-xs"
                title="Fale Connosco no WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span className="whitespace-nowrap">Fale Connosco</span>
              </a>

              {/* Phone Call (Secondary Action - Clean Outline/Subtle) */}
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 active:scale-98 text-slate-700 hover:text-slate-950 font-semibold text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 transition-all shadow-xs"
                title={`Ligar para ${phone}`}
              >
                <Phone className="w-3.5 h-3.5 text-[#0052A5]" />
                <span className="whitespace-nowrap">Ligar Agora</span>
              </a>

              {/* Real-Time Chat Assistant Trigger (Quiet Helper) */}
              <button
                onClick={onOpenChat}
                className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-blue-50 text-[#0052A5] font-semibold text-xs px-3 py-2.5 rounded-xl transition-all border border-slate-200 hover:border-blue-300 cursor-pointer"
                title="Apoio e Atendimento ao Cliente"
              >
                <Headphones className="w-4 h-4 text-[#0052A5]" />
                <span className="hidden xl:inline">Apoio</span>
              </button>

              {/* Subtle Divider */}
              <div className="h-6 w-px bg-slate-200 mx-1" aria-hidden="true" />

              {/* Favorites Button (Desktop) */}
              <button
                id="navbar-favorites-btn"
                onClick={() => openUserDashboard('favorites')}
                className="relative p-2.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Meus Favoritos"
              >
                <Heart
                  className={`w-4 h-4 ${
                    effectiveFavoriteCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-500'
                  }`}
                />
                {effectiveFavoriteCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold leading-none">
                    {effectiveFavoriteCount}
                  </span>
                )}
              </button>

              {/* Real-Time Notifications Dropdown (Desktop) */}
              <div className="relative">
                <button
                  id="navbar-notifications-btn"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`relative p-2.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                    notificationsOpen
                      ? 'bg-blue-50 border-blue-400 text-slate-950 shadow-xs'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-700'
                  }`}
                  title="Notificações e Oportunidades"
                >
                  <Bell className="w-4 h-4 text-[#0052A5]" />
                  {effectiveUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
                      {effectiveUnreadCount}
                    </span>
                  )}
                </button>

                <NotificationDropdown
                  isOpen={notificationsOpen}
                  onClose={() => setNotificationsOpen(false)}
                  catalogProperties={catalogProperties}
                  onSelectProperty={(prop) => {
                    if (onSelectProperty) onSelectProperty(prop);
                  }}
                />
              </div>

              {/* User Dashboard / Cliente Area */}
              <button
                id="navbar-user-dashboard-btn"
                onClick={() => openUserDashboard('profile')}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all border border-slate-200 cursor-pointer"
                title="Área do Cliente"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#0052A5]" />
                <span className="hidden 2xl:inline">
                  {currentUser ? currentUser.displayName?.split(' ')[0] || 'Conta' : 'Área do Cliente'}
                </span>
              </button>

              {/* Admin Portal Button */}
              <button
                onClick={onOpenAdmin}
                className={`p-2.5 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                  isAdmin
                    ? 'bg-blue-50 text-[#0052A5] border-blue-300 ring-1 ring-blue-400/50'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                title={isAdmin ? 'Painel Administrativo Ativo' : 'Acesso Administrativo'}
              >
                <Shield className={`w-4 h-4 ${isAdmin ? 'text-[#0052A5]' : 'text-slate-400'}`} />
                {isAdmin ? <span className="hidden md:inline font-bold text-[#0052A5]">ADM</span> : null}
              </button>
            </div>

            {/* Mobile Actions Header */}
            <div className="flex sm:hidden items-center gap-1.5">
              {/* Mobile Heart button */}
              <button
                onClick={() => openUserDashboard('favorites')}
                className="relative p-2 text-slate-700 bg-slate-100 rounded-lg cursor-pointer"
                title="Favoritos"
              >
                <Heart
                  className={`w-4 h-4 ${
                    effectiveFavoriteCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-600'
                  }`}
                />
                {effectiveFavoriteCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                    {effectiveFavoriteCount}
                  </span>
                )}
              </button>

              {/* Mobile Chat Trigger */}
              <button
                onClick={onOpenChat}
                className="p-2 text-[#0052A5] bg-blue-50 rounded-lg"
                title="Apoio"
              >
                <Headphones className="w-4 h-4" />
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-hidden"
                aria-label="Abrir menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <BrandLogo customLogoUrl={logoUrl} size="sm" />
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                  aria-label="Fechar menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Quick Action Banner with clean, direct buttons and good spacing */}
              <div className="p-4 bg-gradient-to-r from-[#0052A5] to-[#003366] text-white flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">Atendimento Rápido</span>
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">Angola</span>
                </div>
                {/* Clean Button Grid: Essential labels with balanced 10px 20px padding */}
                <div className="grid grid-cols-2 gap-2.5 mt-1">
                  <a
                    href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Olá A.PANZO Imobiliária! Gostaria de informações sobre os vossos imóveis.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Fale Connosco</span>
                  </a>
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center justify-center gap-2 bg-white text-[#0052A5] hover:bg-slate-100 text-xs font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all"
                  >
                    <Phone className="w-4 h-4 text-[#0052A5]" />
                    <span>Ligar Agora</span>
                  </a>
                </div>
              </div>

              {/* Nav Items */}
              <div className="p-4 flex-1 flex flex-col gap-1 text-sm font-semibold text-slate-800">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
                  Área do Cliente
                </p>

                <button
                  onClick={() => {
                    closeMenu();
                    openUserDashboard('favorites');
                  }}
                  className="flex items-center justify-between w-full p-3 rounded-xl bg-rose-50/60 text-rose-900 hover:bg-rose-100/70 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3 font-semibold">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    Meus Favoritos ({effectiveFavoriteCount})
                  </span>
                  <ChevronRight className="w-4 h-4 text-rose-300" />
                </button>

                <button
                  onClick={() => {
                    closeMenu();
                    openUserDashboard('alerts');
                  }}
                  className="flex items-center justify-between w-full p-3 rounded-xl bg-blue-50/60 text-blue-900 hover:bg-blue-100/70 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3 font-semibold">
                    <Bell className="w-4 h-4 text-[#0052A5]" />
                    Alertas & Notificações
                  </span>
                  {effectiveUnreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {effectiveUnreadCount} novas
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-blue-300" />
                  )}
                </button>

                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-3 pb-1">
                  Navegação Principal
                </p>

                <button
                  onClick={() => {
                    onNavigateHome();
                    closeMenu();
                  }}
                  className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-blue-50 hover:text-[#0052A5] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Home className="w-4 h-4 text-[#0052A5]" />
                    Início / Catálogo
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>

                <button
                  onClick={() => {
                    onNavigateHome();
                    if (onSelectDealType) onSelectDealType('venda');
                    closeMenu();
                  }}
                  className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-blue-50 hover:text-[#0052A5] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-[#0052A5]" />
                    Imóveis para Venda
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>

                <button
                  onClick={() => {
                    onNavigateHome();
                    if (onSelectDealType) onSelectDealType('arrendamento');
                    closeMenu();
                  }}
                  className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-blue-50 hover:text-[#0052A5] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Building className="w-4 h-4 text-[#0052A5]" />
                    Imóveis para Arrendamento
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>

                <button
                  onClick={() => {
                    onNavigateHome();
                    if (onSelectCategory) onSelectCategory('cat-terrenos');
                    closeMenu();
                  }}
                  className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-blue-50 hover:text-[#0052A5] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-[#0052A5]" />
                    Terrenos & Espaços Comerciais
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>

                <button
                  onClick={() => {
                    closeMenu();
                    onOpenAbout();
                  }}
                  className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-blue-50 hover:text-[#0052A5] transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Info className="w-4 h-4 text-[#0052A5]" />
                    Sobre Nós
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>

                <button
                  onClick={() => {
                    closeMenu();
                    onOpenChat();
                  }}
                  className="flex items-center justify-between w-full p-3 rounded-xl bg-blue-50 text-[#0052A5] hover:bg-blue-100 transition-colors my-2"
                >
                  <span className="flex items-center gap-3 font-bold">
                    <Headphones className="w-4 h-4 text-[#0052A5]" />
                    Apoio ao Cliente em Tempo Real
                  </span>
                  <span className="text-[10px] bg-blue-200 text-[#003366] font-bold px-2 py-0.5 rounded-full">Online</span>
                </button>
              </div>

              {/* Drawer Footer & Admin Access */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col gap-3">
                <button
                  onClick={() => {
                    closeMenu();
                    onOpenAdmin();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-white text-xs font-bold transition-all shadow-xs"
                >
                  <Shield className="w-4 h-4 text-[#0052A5]" />
                  Painel Administrativo (ADM)
                </button>

                <div className="text-center">
                  <p className="text-[11px] font-semibold text-slate-700">
                    A.PANZO - Comércio & Prestação de Serviços, LDA
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                    WhatsApp: {whatsapp}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
