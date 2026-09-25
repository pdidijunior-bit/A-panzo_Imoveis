import React from 'react';
import {
  X,
  Heart,
  Bell,
  BellRing,
  Trash2,
  ExternalLink,
  MessageCircle,
  Plus,
  CheckCheck,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Sparkles,
  MapPin,
  BedDouble,
  Maximize2,
  ChevronRight,
  Eye,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavoritesAndAlerts } from '../context/FavoritesAndAlertsContext';
import { Property, Category, LocationConfig } from '../types';
import { formatCurrency, formatNumber } from '../lib/formatters';

interface UserDashboardModalProps {
  catalogProperties: Property[];
  categories: Category[];
  locations: LocationConfig[];
  whatsappNumber?: string;
  onSelectProperty: (property: Property) => void;
  onApplyAlertFilter?: (criteria: any) => void;
}

export const UserDashboardModal: React.FC<UserDashboardModalProps> = ({
  catalogProperties,
  categories,
  locations,
  whatsappNumber = '+244 924 875 869',
  onSelectProperty,
  onApplyAlertFilter,
}) => {
  const { currentUser, signInWithGoogle, signOut } = useAuth();
  const {
    isUserDashboardOpen,
    setIsUserDashboardOpen,
    dashboardTab,
    setDashboardTab,
    favoriteIds,
    toggleFavorite,
    alerts,
    deleteAlert,
    toggleAlertActive,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    openCreateAlertModal,
    openAuthModal,
  } = useFavoritesAndAlerts();

  if (!isUserDashboardOpen) return null;

  // Resolve favorited property objects
  const favoritedProperties = catalogProperties.filter((p) =>
    favoriteIds.includes(p.id)
  );

  const cleanWhatsappNumber = (whatsappNumber || '+244 925 883 080').replace(/[^0-9]/g, '');

  const formatPrice = (price: number) => {
    return formatNumber(price);
  };

  const handleOpenProperty = (property: Property) => {
    onSelectProperty(property);
    setIsUserDashboardOpen(false);
  };

  const handleNotificationClick = (notif: any) => {
    markNotificationRead(notif.id);
    const prop = catalogProperties.find((p) => p.id === notif.propertyId);
    if (prop) {
      handleOpenProperty(prop);
    }
  };

  return (
    <div
      id="user-dashboard-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsUserDashboardOpen(false);
      }}
    >
      <div
        id="user-dashboard-modal-content"
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 flex flex-col max-h-[90vh]"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-5 sm:p-6 border-b border-amber-500/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Utilizador'}
                  className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover shadow-md"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-md">
                  <UserIcon className="w-6 h-6" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {currentUser?.displayName || 'Área do Cliente'}
                  </h2>
                  {currentUser ? (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                      Sincronizado
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                      Dispositivo Local
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  {currentUser?.email || 'Gerencie os seus favoritos, alertas de novos imóveis e notificações em tempo real'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentUser ? (
                <button
                  id="dashboard-signout-btn"
                  onClick={() => signOut()}
                  title="Terminar Sessão"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              ) : (
                <button
                  id="dashboard-signin-btn"
                  onClick={() => openAuthModal('Crie a sua conta gratuita ou inicie sessão para sincronizar os seus imóveis favoritos.')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Criar Conta / Entrar</span>
                </button>
              )}

              <button
                id="close-user-dashboard-btn"
                onClick={() => setIsUserDashboardOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 scrollbar-none">
            <button
              id="dashboard-tab-favorites"
              onClick={() => setDashboardTab('favorites')}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                dashboardTab === 'favorites'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  dashboardTab === 'favorites' ? 'fill-rose-600 text-rose-600' : 'text-slate-300'
                }`}
              />
              Favoritos ({favoriteIds.length})
            </button>

            <button
              id="dashboard-tab-alerts"
              onClick={() => setDashboardTab('alerts')}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                dashboardTab === 'alerts'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              <Bell className="w-4 h-4" />
              Alertas de Pesquisa ({alerts.length})
            </button>

            <button
              id="dashboard-tab-notifications"
              onClick={() => setDashboardTab('notifications')}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap relative ${
                dashboardTab === 'notifications'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              <BellRing className="w-4 h-4" />
              Notificações
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              id="dashboard-tab-profile"
              onClick={() => setDashboardTab('profile')}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap ${
                dashboardTab === 'profile'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              Minha Conta
            </button>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* TAB 1: FAVORITES */}
          {dashboardTab === 'favorites' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                    Os Seus Imóveis Guardados
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Aceda rapidamente aos imóveis que chamaram a sua atenção para comparar ou negociar
                  </p>
                </div>
              </div>

              {favoritedProperties.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
                    <Heart className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Ainda não guardou nenhum imóvel
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                    Ao navegar pelo catálogo, clique no ícone do coração em qualquer anúncio para adicioná-lo aos seus favoritos e acompanhar a sua disponibilidade.
                  </p>
                  <button
                    onClick={() => setIsUserDashboardOpen(false)}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all mt-2"
                  >
                    Explorar Catálogo de Imóveis
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoritedProperties.map((prop) => (
                    <div
                      key={prop.id}
                      className="group flex flex-col sm:flex-row bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 overflow-hidden hover:shadow-lg transition-all"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-full sm:w-44 h-40 sm:h-auto flex-shrink-0 bg-slate-100 dark:bg-slate-950 overflow-hidden">
                        <img
                          src={
                            prop.images && prop.images[0]
                              ? prop.images[0]
                              : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80'
                          }
                          alt={prop.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-slate-900/80 text-amber-400 backdrop-blur-xs">
                          {prop.dealType}
                        </span>
                      </div>

                      {/* Info & Actions */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                              #{prop.code}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {prop.municipality}, {prop.province}
                            </span>
                          </div>

                          <h4
                            onClick={() => handleOpenProperty(prop)}
                            className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-amber-500 cursor-pointer transition-colors"
                          >
                            {prop.title}
                          </h4>

                          <div className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                            {formatCurrency(prop.price, prop.currency)}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-2">
                            {prop.bedrooms > 0 && (
                              <span className="flex items-center gap-1">
                                <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                                T{prop.bedrooms}
                              </span>
                            )}
                            {prop.area > 0 && (
                              <span className="flex items-center gap-1">
                                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                                {prop.area} m²
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-700/60 gap-2">
                          <button
                            onClick={() => handleOpenProperty(prop)}
                            className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-amber-500 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver Imóvel
                          </button>

                          <div className="flex items-center gap-1.5">
                            <a
                              href={`https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
                                `Olá A.PANZO Imobiliária! Tenho grande interesse no meu imóvel favorito #${prop.code || String(prop.id || '').slice(0, 6).toUpperCase()}: "${prop.title || 'Imóvel'}" (${formatCurrency(prop.price, prop.currency)}). Gostaria de agendar uma visita!`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                              title="Falar no WhatsApp sobre este imóvel"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>

                            <button
                              onClick={() => toggleFavorite(prop)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Remover dos favoritos"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROPERTY ALERTS */}
          {dashboardTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-500" />
                    Alertas Personalizados de Pesquisa
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Seja notificado automaticamente quando novas listagens corresponderem ao que procura
                  </p>
                </div>

                <button
                  id="dashboard-create-alert-btn"
                  onClick={() => openCreateAlertModal()}
                  className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Novo Alerta
                </button>
              </div>

              {alerts.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto">
                    <Bell className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Não tem nenhum alerta configurado
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                    Crie alertas por tipologia (T1 a T4+), localização (Luanda, Talatona, Malanje) ou teto de orçamento para receber novidades em primeira mão!
                  </p>
                  <button
                    onClick={() => openCreateAlertModal()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    Configurar o Meu Primeiro Alerta
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => {
                    const matchesCount = (catalogProperties || []).filter((p) => {
                      if (!p) return false;
                      return (
                        (!alert.dealType || alert.dealType === 'todos' || p.dealType === alert.dealType) &&
                        (!alert.category || p.category === alert.category) &&
                        (!alert.province || (p.province || '').toLowerCase() === (alert.province || '').toLowerCase()) &&
                        (!alert.municipality || (p.municipality || '').toLowerCase().includes((alert.municipality || '').toLowerCase())) &&
                        (!alert.bedrooms || alert.bedrooms === 'todos' || (alert.bedrooms === '5+' ? (p.bedrooms || 0) >= 5 : p.bedrooms === parseInt(alert.bedrooms, 10))) &&
                        (!alert.minPrice || (p.price || 0) >= Number(alert.minPrice)) &&
                        (!alert.maxPrice || (p.price || 0) <= Number(alert.maxPrice))
                      );
                    }).length;

                    return (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-xl border transition-all ${
                          alert.active
                            ? 'bg-white dark:bg-slate-800 border-amber-500/40 dark:border-amber-500/30 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {alert.name}
                              </h4>
                              {alert.active ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                  Ativo
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                                  Pausado
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                                {matchesCount} {matchesCount === 1 ? 'imóvel no catálogo' : 'imóveis no catálogo'}
                              </span>
                            </div>

                            {/* Filters Pills */}
                            <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-600 dark:text-slate-400">
                              {alert.dealType && alert.dealType !== 'todos' && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 font-semibold text-[11px]">
                                  {alert.dealType === 'venda' ? 'Compra' : alert.dealType === 'arrendamento' ? 'Arrendamento' : 'Trespasse'}
                                </span>
                              )}
                              {alert.category && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 font-semibold text-[11px]">
                                  {categories.find((c) => c.slug === alert.category)?.name || alert.category}
                                </span>
                              )}
                              {(alert.municipality || alert.province) && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 font-semibold text-[11px]">
                                  {alert.municipality ? `${alert.municipality}, ` : ''}{alert.province}
                                </span>
                              )}
                              {alert.bedrooms && alert.bedrooms !== 'todos' && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 font-semibold text-[11px]">
                                  T{alert.bedrooms}
                                </span>
                              )}
                              {alert.maxPrice && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 font-semibold text-[11px]">
                                  Até {formatPrice(Number(alert.maxPrice))} Kz
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Control buttons */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              onClick={() => toggleAlertActive(alert.id)}
                              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              title={alert.active ? 'Pausar alerta' : 'Ativar alerta'}
                            >
                              {alert.active ? (
                                <ToggleRight className="w-6 h-6 text-amber-500" />
                              ) : (
                                <ToggleLeft className="w-6 h-6 text-slate-400" />
                              )}
                            </button>

                            {onApplyAlertFilter && (
                              <button
                                onClick={() => {
                                  onApplyAlertFilter({
                                    dealType: alert.dealType || 'todos',
                                    category: alert.category || '',
                                    province: alert.province || '',
                                    municipality: alert.municipality || '',
                                    bedrooms: alert.bedrooms || 'todos',
                                    minPrice: alert.minPrice || '',
                                    maxPrice: alert.maxPrice || '',
                                    keyword: alert.keyword || '',
                                  });
                                  setIsUserDashboardOpen(false);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-xs font-bold transition-colors"
                              >
                                Ver Imóveis ({matchesCount})
                              </button>
                            )}

                            <button
                              onClick={() => deleteAlert(alert.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Eliminar Alerta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REAL-TIME NOTIFICATIONS */}
          {dashboardTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-amber-500" />
                    Notificações de Imóveis
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Histórico de novidades encontradas para os seus critérios de alerta
                  </p>
                </div>

                {notifications.length > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead()}
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Bell className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Nenhuma notificação recente
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                    Assim que novos imóveis forem publicados e corresponderem aos seus alertas, você receberá avisos em tempo real aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 rounded-xl border flex items-center gap-3.5 cursor-pointer transition-all hover:shadow-md ${
                        notif.read
                          ? 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-800'
                          : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-600/40 ring-1 ring-amber-400/20'
                      }`}
                    >
                      {/* Property Thumbnail */}
                      <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-950 overflow-hidden flex-shrink-0 relative">
                        {notif.propertyImage ? (
                          <img
                            src={notif.propertyImage}
                            alt={notif.propertyTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <MapPin className="w-5 h-5" />
                          </div>
                        )}
                        {!notif.read && (
                          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                        )}
                      </div>

                      {/* Notification info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="font-bold text-amber-600 dark:text-amber-400 truncate">
                            Alerta: {notif.alertName}
                          </span>
                          <span>•</span>
                          <span>{new Date(notif.createdAt).toLocaleDateString('pt-AO')}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {notif.propertyTitle}
                        </h4>
                        <div className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                          {formatPrice(notif.propertyPrice)} AOA
                          <span className="ml-2 font-normal text-slate-500 text-[11px]">
                            {notif.location}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Remover notificação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE & PREFERENCES */}
          {dashboardTab === 'profile' && (
            <div className="space-y-6 max-w-xl mx-auto py-2">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 text-center space-y-3">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Utilizador'}
                    className="w-20 h-20 rounded-full border-4 border-amber-400 object-cover mx-auto shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400/50 flex items-center justify-center text-amber-500 mx-auto shadow-md">
                    <UserIcon className="w-10 h-10" />
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {currentUser?.displayName || 'Visitante Aliança Imobiliária'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {currentUser?.email || 'Nenhuma conta Google associada neste momento'}
                  </p>
                </div>

                {!currentUser ? (
                  <div className="pt-2">
                    <button
                      onClick={() => signInWithGoogle()}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all inline-flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Iniciar Sessão com Conta Google
                    </button>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Sincronize os seus favoritos e alertas em qualquer computador ou telemóvel em segurança.
                    </p>
                  </div>
                ) : (
                  <div className="pt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      Conta conectada e sincronizada via Firebase
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Agency Assistance Hotline */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Assistência Direta Aliança Imobiliária
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Precisa de apoio para encontrar um imóvel ou agendar visita?
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={`https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
                      'Olá Aliança Imobiliária! Estou na minha Área de Cliente no portal e gostaria de falar diretamente com um consultor.'
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Oficial ({whatsappNumber})
                  </a>

                  <a
                    href="tel:+244924875869"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Ligar para Escritório
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
