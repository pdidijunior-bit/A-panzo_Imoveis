import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { dbService } from '../lib/dbService';
import { Property, PropertyAlert, AlertNotification, FilterState } from '../types';

interface FavoritesAndAlertsContextType {
  // Favorites
  favoriteIds: string[];
  isFavorite: (propertyId: string) => boolean;
  toggleFavorite: (property: Property) => Promise<void>;
  favoriteCount: number;

  // Alerts
  alerts: PropertyAlert[];
  createAlert: (alertData: Omit<PropertyAlert, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deleteAlert: (alertId: string) => Promise<void>;
  toggleAlertActive: (alertId: string) => Promise<void>;
  activeAlertsCount: number;

  // Notifications
  notifications: AlertNotification[];
  unreadCount: number;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;

  // User Dashboard State
  isUserDashboardOpen: boolean;
  setIsUserDashboardOpen: (open: boolean) => void;
  openUserDashboard: (tab?: 'favorites' | 'alerts' | 'notifications' | 'profile') => void;
  dashboardTab: 'favorites' | 'alerts' | 'notifications' | 'profile';
  setDashboardTab: (tab: 'favorites' | 'alerts' | 'notifications' | 'profile') => void;

  // Create Alert Modal State
  isCreateAlertModalOpen: boolean;
  setIsCreateAlertModalOpen: (open: boolean) => void;
  openCreateAlertModal: (prefill?: Partial<FilterState>) => void;
  prefilledAlertFilters: Partial<FilterState> | null;

  // Selected property for viewing
  inspectProperty: (property: Property) => void;
  selectedPropertyForInspection: Property | null;
  clearInspectedProperty: () => void;
}

const FavoritesAndAlertsContext = createContext<FavoritesAndAlertsContextType | undefined>(undefined);

const LOCAL_STORAGE_FAVORITES_KEY = 'alianca_favorites_v1';
const LOCAL_STORAGE_ALERTS_KEY = 'alianca_alerts_v1';
const LOCAL_STORAGE_NOTIFS_KEY = 'alianca_notifications_v1';

export const FavoritesAndAlertsProvider: React.FC<{
  children: React.ReactNode;
  catalogProperties: Property[];
}> = ({ children, catalogProperties }) => {
  const { currentUser } = useAuth();

  // Local states for offline/guest mode or initial render
  const [localFavoriteIds, setLocalFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [localAlerts, setLocalAlerts] = useState<PropertyAlert[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ALERTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [localNotifications, setLocalNotifications] = useState<AlertNotification[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_NOTIFS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Firestore-synced states (active when logged in)
  const [firestoreFavorites, setFirestoreFavorites] = useState<{ id: string; propertyId: string }[]>([]);
  const [firestoreAlerts, setFirestoreAlerts] = useState<PropertyAlert[]>([]);
  const [firestoreNotifications, setFirestoreNotifications] = useState<AlertNotification[]>([]);

  // UI state
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState<boolean>(false);
  const [dashboardTab, setDashboardTab] = useState<'favorites' | 'alerts' | 'notifications' | 'profile'>('favorites');
  const [isCreateAlertModalOpen, setIsCreateAlertModalOpen] = useState<boolean>(false);
  const [prefilledAlertFilters, setPrefilledAlertFilters] = useState<Partial<FilterState> | null>(null);
  const [selectedPropertyForInspection, setSelectedPropertyForInspection] = useState<Property | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_FAVORITES_KEY, JSON.stringify(localFavoriteIds));
    } catch (err) {
      console.warn('Erro ao guardar favoritos locais:', err);
    }
  }, [localFavoriteIds]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ALERTS_KEY, JSON.stringify(localAlerts));
    } catch (err) {
      console.warn('Erro ao guardar alertas locais:', err);
    }
  }, [localAlerts]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_NOTIFS_KEY, JSON.stringify(localNotifications));
    } catch (err) {
      console.warn('Erro ao guardar notificações locais:', err);
    }
  }, [localNotifications]);

  // Subscribe to Firestore when authenticated
  useEffect(() => {
    if (!currentUser) {
      setFirestoreFavorites([]);
      setFirestoreAlerts([]);
      setFirestoreNotifications([]);
      return;
    }

    // Auto-sync guest favorites to Firestore on sign-in
    if (localFavoriteIds.length > 0) {
      dbService.syncLocalFavoritesToUser(currentUser.uid, localFavoriteIds).catch(() => {});
    }

    // Listen to favorites
    const unsubFavs = dbService.subscribeFavorites(currentUser.uid, (favs) => {
      setFirestoreFavorites(favs);
    });

    // Listen to alerts
    const unsubAlerts = dbService.subscribePropertyAlerts(currentUser.uid, (alrts) => {
      setFirestoreAlerts(alrts);
    });

    // Listen to notifications
    const unsubNotifs = dbService.subscribeAlertNotifications(currentUser.uid, (notifs) => {
      setFirestoreNotifications(notifs);
    });

    return () => {
      unsubFavs();
      unsubAlerts();
      unsubNotifs();
    };
  }, [currentUser]);

  // Active combined values
  const activeFavoriteIds = useMemo(() => {
    if (currentUser) {
      const fsIds = firestoreFavorites.map((f) => f.propertyId);
      // Merge unique
      return Array.from(new Set([...fsIds, ...localFavoriteIds]));
    }
    return localFavoriteIds;
  }, [currentUser, firestoreFavorites, localFavoriteIds]);

  const activeAlerts = useMemo(() => {
    if (currentUser) {
      return firestoreAlerts;
    }
    return localAlerts;
  }, [currentUser, firestoreAlerts, localAlerts]);

  const activeNotifications = useMemo(() => {
    if (currentUser) {
      return firestoreNotifications;
    }
    return localNotifications;
  }, [currentUser, firestoreNotifications, localNotifications]);

  // Check properties against active alerts in real-time
  useEffect(() => {
    if (!catalogProperties.length || !activeAlerts.length) return;

    const activeAlertList = activeAlerts.filter((a) => a.active);
    if (!activeAlertList.length) return;

    // Check each active alert against properties
    activeAlertList.forEach((alert) => {
      catalogProperties.forEach((property) => {
        if (dbService.matchesAlert(property, alert)) {
          // Check if notification already exists for this alert + property
          const notifKey = `notif_${alert.id}_${property.id}`;
          const alreadyNotified = activeNotifications.some(
            (n) => n.alertId === alert.id && n.propertyId === property.id
          );

          if (!alreadyNotified) {
            const newNotif: AlertNotification = {
              id: notifKey,
              userId: currentUser ? currentUser.uid : 'guest',
              alertId: alert.id,
              alertName: alert.name,
              propertyId: property.id,
              propertyTitle: property.title,
              propertyCode: property.code,
              propertyPrice: property.price,
              propertyImage: property.images && property.images[0] ? property.images[0] : '',
              dealType: property.dealType,
              location: `${property.municipality}, ${property.province}`,
              read: false,
              createdAt: new Date().toISOString(),
            };

            if (currentUser) {
              dbService.createAlertNotification(newNotif).catch(() => {});
            } else {
              setLocalNotifications((prev) => {
                if (prev.some((n) => n.id === newNotif.id)) return prev;
                return [newNotif, ...prev];
              });
            }
          }
        }
      });
    });
  }, [catalogProperties, activeAlerts, activeNotifications, currentUser]);

  const isFavorite = (propertyId: string) => {
    return activeFavoriteIds.includes(propertyId);
  };

  const toggleFavorite = async (property: Property) => {
    const isCurrentlyFav = activeFavoriteIds.includes(property.id);

    if (currentUser) {
      if (isCurrentlyFav) {
        await dbService.removeFavorite(currentUser.uid, property.id);
        setLocalFavoriteIds((prev) => prev.filter((id) => id !== property.id));
      } else {
        await dbService.addFavorite(currentUser.uid, property.id);
        setLocalFavoriteIds((prev) => [...prev, property.id]);
      }
    } else {
      if (isCurrentlyFav) {
        setLocalFavoriteIds((prev) => prev.filter((id) => id !== property.id));
      } else {
        setLocalFavoriteIds((prev) => [...prev, property.id]);
      }
    }
  };

  const createAlert = async (alertData: Omit<PropertyAlert, 'id' | 'userId' | 'createdAt'>) => {
    const newAlert: PropertyAlert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: currentUser ? currentUser.uid : 'guest',
      createdAt: new Date().toISOString(),
    };

    if (currentUser) {
      await dbService.savePropertyAlert(newAlert);
    } else {
      setLocalAlerts((prev) => [newAlert, ...prev]);
    }

    // Immediately trigger matching check for this new alert
    catalogProperties.forEach((property) => {
      if (dbService.matchesAlert(property, newAlert)) {
        const notif: AlertNotification = {
          id: `notif_${newAlert.id}_${property.id}`,
          userId: currentUser ? currentUser.uid : 'guest',
          alertId: newAlert.id,
          alertName: newAlert.name,
          propertyId: property.id,
          propertyTitle: property.title,
          propertyCode: property.code,
          propertyPrice: property.price,
          propertyImage: property.images?.[0] || '',
          dealType: property.dealType,
          location: `${property.municipality}, ${property.province}`,
          read: false,
          createdAt: new Date().toISOString(),
        };

        if (currentUser) {
          dbService.createAlertNotification(notif).catch(() => {});
        } else {
          setLocalNotifications((prev) => [notif, ...prev]);
        }
      }
    });
  };

  const deleteAlert = async (alertId: string) => {
    if (currentUser) {
      await dbService.deletePropertyAlert(alertId);
    } else {
      setLocalAlerts((prev) => prev.filter((a) => a.id !== alertId));
    }
  };

  const toggleAlertActive = async (alertId: string) => {
    const currentAlert = activeAlerts.find((a) => a.id === alertId);
    if (!currentAlert) return;

    if (currentUser) {
      await dbService.togglePropertyAlertActive(alertId, currentAlert.active);
    } else {
      setLocalAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, active: !a.active } : a))
      );
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    if (currentUser) {
      await dbService.markNotificationRead(notificationId);
    } else {
      setLocalNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    }
  };

  const markAllNotificationsRead = async () => {
    const unreadIds = activeNotifications.filter((n) => !n.read).map((n) => n.id);
    if (!unreadIds.length) return;

    if (currentUser) {
      await dbService.markAllNotificationsRead(currentUser.uid, unreadIds);
    } else {
      setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (currentUser) {
      await dbService.deleteNotification(notificationId);
    } else {
      setLocalNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    }
  };

  const openUserDashboard = (tab?: 'favorites' | 'alerts' | 'notifications' | 'profile') => {
    if (tab) setDashboardTab(tab);
    setIsUserDashboardOpen(true);
  };

  const openCreateAlertModal = (prefill?: Partial<FilterState>) => {
    if (prefill) {
      setPrefilledAlertFilters(prefill);
    } else {
      setPrefilledAlertFilters(null);
    }
    setIsCreateAlertModalOpen(true);
  };

  const inspectProperty = (property: Property) => {
    setSelectedPropertyForInspection(property);
  };

  const clearInspectedProperty = () => {
    setSelectedPropertyForInspection(null);
  };

  const unreadCount = useMemo(() => {
    return activeNotifications.filter((n) => !n.read).length;
  }, [activeNotifications]);

  const activeAlertsCount = useMemo(() => {
    return activeAlerts.filter((a) => a.active).length;
  }, [activeAlerts]);

  return (
    <FavoritesAndAlertsContext.Provider
      value={{
        favoriteIds: activeFavoriteIds,
        isFavorite,
        toggleFavorite,
        favoriteCount: activeFavoriteIds.length,
        alerts: activeAlerts,
        createAlert,
        deleteAlert,
        toggleAlertActive,
        activeAlertsCount,
        notifications: activeNotifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        isUserDashboardOpen,
        setIsUserDashboardOpen,
        openUserDashboard,
        dashboardTab,
        setDashboardTab,
        isCreateAlertModalOpen,
        setIsCreateAlertModalOpen,
        openCreateAlertModal,
        prefilledAlertFilters,
        inspectProperty,
        selectedPropertyForInspection,
        clearInspectedProperty,
      }}
    >
      {children}
    </FavoritesAndAlertsContext.Provider>
  );
};

export const useFavoritesAndAlerts = () => {
  const context = useContext(FavoritesAndAlertsContext);
  if (!context) {
    throw new Error('useFavoritesAndAlerts must be used within a FavoritesAndAlertsProvider');
  }
  return context;
};
