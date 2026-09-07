import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Phone,
  MessageCircle,
  Headphones,
  Info,
  Shield,
  Home,
  Tag,
  Building,
  Briefcase,
  ChevronRight,
  ExternalLink,
  Heart,
  Bell,
  User as UserIcon,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../context/AuthContext';
import { useFavoritesAndAlerts } from '../context/FavoritesAndAlertsContext';
import { NotificationDropdown } from './NotificationDropdown';
import { Property } from '../types';

interface NavbarProps {
  logoUrl?: string;
  phone: string;
  whatsapp: string;
  catalogProperties?: Property[];
  onOpenAbout: () => void;
  onOpenChat: () => void;
  onOpenAdmin: () => void;
  onSelectCategory?: (slug: string) => void;
  onSelectDealType?: (dealType: 'venda' | 'arrendamento') => void;
  activeView: 'home' | 'admin';
  onNavigateHome: () => void;
  onSelectProperty?: (property: Property) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  logoUrl,
  phone,
  whatsapp,
  catalogProperties = [],
  onOpenAbout,
  onOpenChat,
  onOpenAdmin,
  onSelectCategory,
  onSelectDealType,
  activeView,
  onNavigateHome,
  onSelectProperty,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { currentUser, isAdmin } = useAuth();
  const { favoriteCount, unreadCount, openUserDashboard } = useFavoritesAndAlerts();

  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <button
              onClick={() => {
                onNavigateHome();
                closeMenu();
              }}
              className="focus:outline-hidden focus:ring-2 focus:ring-amber-500 rounded-lg p-1 text-left"
              title="Aliança Imobiliária Página Inicial"
            >
              <BrandLogo customLogoUrl={logoUrl} size="md" />
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-700">
              <button
                onClick={() => {
                  onNavigateHome();
                }}
                className={`transition-colors hover:text-amber-600 flex items-center gap-1.5 ${
                  activeView === 'home' ? 'text-amber-600' : ''
                }`}
              >
                <Home className="w-4 h-4 text-amber-500" />
                Início
              </button>

              <button
                onClick={() => {
                  onNavigateHome();
                  if (onSelectDealType) onSelectDealType('venda');
                }}
                className="transition-colors hover:text-amber-600 flex items-center gap-1"
              >
                Comprar
              </button>

              <button
                onClick={() => {
                  onNavigateHome();
                  if (onSelectDealType) onSelectDealType('arrendamento');
                }}
                className="transition-colors hover:text-amber-600 flex items-center gap-1"
              >
                Arrendar
              </button>

              <button
                onClick={() => {
                  onNavigateHome();
                  if (onSelectCategory) onSelectCategory('cat-terrenos');
                }}
                className="transition-colors hover:text-amber-600"
              >
                Terrenos
              </button>

              <button
                onClick={() => {
                  onNavigateHome();
                  if (onSelectCategory) onSelectCategory('cat-espacos-comerciais');
                }}
                className="transition-colors hover:text-amber-600"
              >
                Comercial
              </button>

              <button
                onClick={onOpenAbout}
                className="transition-colors hover:text-amber-600 flex items-center gap-1.5"
              >
                <Info className="w-4 h-4 text-slate-400" />
                Sobre Nós
              </button>
            </nav>

            {/* Direct Contact Buttons (Desktop) */}
            <div className="hidden sm:flex items-center gap-3">
              {/* WhatsApp Direct */}
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Olá Aliança Imobiliária! Gostaria de consultar informações sobre os imóveis disponíveis.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
                title="Conversar diretamente via WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              {/* Normal Phone Call */}
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-amber-300 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-sm"
                title="Ligue diretamente para a nossa equipa"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span className="font-mono">{phone}</span>
              </a>

              {/* Real-Time Chat Assistant Trigger */}
              <button
                onClick={onOpenChat}
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-2.5 rounded-xl transition-all shadow-sm"
                title="Apoio em tempo real"
              >
                <Headphones className="w-4 h-4" />
                <span className="hidden xl:inline">Assistência</span>
              </button>

              {/* Favorites Button (Desktop) */}
              <button
                id="navbar-favorites-btn"
                onClick={() => openUserDashboard('favorites')}
                className="relative p-2.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-slate-700 transition-all flex items-center gap-1.5"
                title="Meus Favoritos"
              >
                <Heart
                  className={`w-4 h-4 ${
                    favoriteCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-500'
                  }`}
                />
                {favoriteCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold leading-none">
                    {favoriteCount}
                  </span>
                )}
              </button>

              {/* Real-Time Notifications Dropdown (Desktop) */}
              <div className="relative">
                <button
                  id="navbar-notifications-btn"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`relative p-2.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                    notificationsOpen
                      ? 'bg-amber-100 border-amber-400 text-slate-950 shadow-xs'
                      : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-slate-700'
                  }`}
                  title="Notificações e Alertas em Tempo Real"
                >
                  <Bell className="w-4 h-4 text-amber-500" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
                      {unreadCount}
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
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold transition-all border border-slate-200"
                title="Área do Cliente: Favoritos, Alertas e Perfil"
              >
                <UserIcon className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden xl:inline">
                  {currentUser ? currentUser.displayName?.split(' ')[0] || 'Conta' : 'Painel'}
                </span>
              </button>

              {/* Admin Portal Button */}
              <button
                onClick={onOpenAdmin}
                className={`p-2.5 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5 ${
                  isAdmin
                    ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-400/50'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                title={isAdmin ? 'Painel Administrativo Ativo' : 'Acesso Administrativo'}
              >
                <Shield className={`w-4 h-4 ${isAdmin ? 'text-amber-600' : 'text-slate-400'}`} />
                {isAdmin ? <span className="hidden md:inline font-bold">ADM</span> : null}
              </button>
            </div>

            {/* Mobile Actions Header */}
            <div className="flex sm:hidden items-center gap-1.5">
              {/* Mobile Heart button */}
              <button
                onClick={() => openUserDashboard('favorites')}
                className="relative p-2 text-slate-700 bg-slate-100 rounded-lg"
                title="Favoritos"
              >
                <Heart
                  className={`w-4 h-4 ${
                    favoriteCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-600'
                  }`}
                />
                {favoriteCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-extrabold">
                    {favoriteCount}
                  </span>
                )}
              </button>

              {/* Mobile Bell button */}
              <button
                onClick={() => openUserDashboard('notifications')}
                className="relative p-2 text-slate-700 bg-slate-100 rounded-lg"
                title="Notificações"
              >
                <Bell className="w-4 h-4 text-amber-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-extrabold">
                    {unreadCount}
                  </span>
                )}
              </button>

              <a
                href={`https://wa.me/${cleanWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-emerald-600 text-white rounded-lg"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-xl text-slate-800 bg-slate-100 hover:bg-slate-200 focus:outline-hidden"
                aria-label="Abrir menu de navegação"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Sliding Menu (Drawer) for Mobile & Tablet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Drawer Content */}
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

              {/* Drawer Quick Action Banner */}
              <div className="p-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">Atendimento Rápido</span>
                  <span className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full font-bold">Angola</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <a
                    href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Olá Aliança Imobiliária! Gostaria de informações sobre os vossos imóveis.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-slate-950 text-white text-xs font-bold py-2.5 px-3 rounded-lg shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center justify-center gap-1.5 bg-white text-slate-950 text-xs font-bold py-2.5 px-3 rounded-lg shadow-sm"
                  >
                    <Phone className="w-4 h-4 text-amber-600" />
                    Ligar
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
                  className="flex items-center justify-between w-full p-3 rounded-xl bg-rose-50/60 text-rose-900 hover:bg-rose-100/70 transition-colors"
                >
                  <span className="flex items-center gap-3 font-semibold">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    Meus Favoritos ({favoriteCount})
                  </span>
                  <ChevronRight className="w-4 h-4 text-rose-300" />
                </button>

                <button
                  onClick={() => {
                    closeMenu();
                    openUserDashboard('alerts');
                  }}
                  className="flex items-center justify-between w-full p-3 rounded-xl bg-amber-50/60 text-amber-900 hover:bg-amber-100/70 transition-colors"
                >
                  <span className="flex items-center gap-3 font-semibold">
                    <Bell className="w-4 h-4 text-amber-600" />
                    Alertas & Notificações
                  </span>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {unreadCount} novas
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-amber-300" />
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
                  className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Home className="w-4 h-4 text-amber-500" />
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
                  className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-amber-500" />
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
                  className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Building className="w-4 h-4 text-amber-500" />
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
                  className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-amber-500" />
                    Terrenos & Espaços Comerciais
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>

                <button
                  onClick={() => {
                    closeMenu();
                    onOpenAbout();
                  }}
                  className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Info className="w-4 h-4 text-amber-500" />
                    Sobre Nós
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>

                <button
                  onClick={() => {
                    closeMenu();
                    onOpenChat();
                  }}
                  className="flex items-center justify-between w-full p-3 rounded-xl bg-amber-50/60 text-amber-900 hover:bg-amber-100/70 transition-colors my-2"
                >
                  <span className="flex items-center gap-3 font-bold">
                    <Headphones className="w-4 h-4 text-amber-600" />
                    Assistência em Tempo Real
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">Online</span>
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
                  <Shield className="w-4 h-4 text-amber-600" />
                  Painel de Administração (ADM)
                </button>

                <div className="text-center">
                  <p className="text-[11px] text-slate-500">
                    Aliança Imobiliária • Luanda & Malanje
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
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
