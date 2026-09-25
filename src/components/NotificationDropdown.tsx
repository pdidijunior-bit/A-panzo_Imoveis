import React, { useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, ChevronRight, Sparkles, MapPin } from 'lucide-react';
import { useFavoritesAndAlerts } from '../context/FavoritesAndAlertsContext';
import { Property } from '../types';
import { formatNumber } from '../lib/formatters';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  catalogProperties: Property[];
  onSelectProperty: (property: Property) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  catalogProperties,
  onSelectProperty,
}) => {
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    openUserDashboard,
  } = useFavoritesAndAlerts();

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOpenNotif = (notif: any) => {
    markNotificationRead(notif.id);
    const prop = catalogProperties.find((p) => p.id === notif.propertyId);
    if (prop) {
      onSelectProperty(prop);
      onClose();
    }
  };

  const formatPrice = (price: number) => {
    return formatNumber(price);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-AO');
    } catch {
      return '';
    }
  };

  return (
    <div
      ref={dropdownRef}
      id="notification-dropdown-popover"
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-fadeIn"
    >
      {/* Header */}
      <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-amber-500/30">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Notificações em Tempo Real
          </span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
              {unreadCount}
            </span>
          )}
        </div>

        {notifications.length > 0 && (
          <button
            onClick={() => markAllNotificationsRead()}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Marcar lidas
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.length === 0 ? (
          <div className="p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nenhum novo imóvel por agora
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Crie alertas para receber notificações quando surgirem oportunidades no mercado.
            </p>
          </div>
        ) : (
          notifications.slice(0, 5).map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleOpenNotif(notif)}
              className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                notif.read
                  ? 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  : 'bg-amber-50/70 dark:bg-amber-950/20 hover:bg-amber-100/50 dark:hover:bg-amber-950/40'
              }`}
            >
              <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-950 overflow-hidden flex-shrink-0 relative">
                {notif.propertyImage ? (
                  <img
                    src={notif.propertyImage}
                    alt={notif.propertyTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                )}
                {!notif.read && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-amber-600 dark:text-amber-400 truncate">
                    Alerta: {notif.alertName}
                  </span>
                  <span>{formatDate(notif.createdAt)}</span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {notif.propertyTitle}
                </h5>
                <div className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
                  {formatPrice(notif.propertyPrice)} AOA
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <button
          onClick={() => {
            openUserDashboard('alerts');
            onClose();
          }}
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Gerir Meus Alertas
        </button>

        <button
          onClick={() => {
            openUserDashboard('notifications');
            onClose();
          }}
          className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        >
          Ver todas ({notifications.length})
        </button>
      </div>
    </div>
  );
};
