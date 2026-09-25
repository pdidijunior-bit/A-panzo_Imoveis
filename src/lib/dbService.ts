import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Property,
  Category,
  LocationConfig,
  SiteSettings,
  Conversation,
  Message,
  Favorite,
  PropertyAlert,
  AlertNotification,
  DealType,
} from '../types';
import { DEFAULT_CATEGORIES, ANGOLA_LOCATIONS, DEFAULT_SITE_SETTINGS } from './defaultData';
import { normalizeCurrency } from './formatters';

/**
 * Recursively strips any keys whose value is undefined, which Firestore setDoc/updateDoc strictly rejects.
 */
export function cleanFirestoreData<T extends Record<string, any>>(data: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        clean[key] = cleanFirestoreData(value);
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
}

function normalizeSiteSettings(data: any): SiteSettings {
  const merged: SiteSettings = { ...DEFAULT_SITE_SETTINGS, ...data };
  let migrated = false;
  // If settings still contain old legacy contact info or default titles
  if (!merged.phone || merged.phone.includes('935973494') || merged.phone.includes('924875869') || merged.phone.includes('924 875 869')) {
    merged.phone = '+244 925 883 080';
    migrated = true;
  }
  if (!merged.whatsapp || merged.whatsapp.includes('935973494') || merged.whatsapp.includes('924875869') || merged.whatsapp.includes('924 875 869')) {
    merged.whatsapp = '+244 925 883 080';
    migrated = true;
  }
  if (!merged.phone2) {
    merged.phone2 = '+244 928 771 808';
    migrated = true;
  }
  if (!merged.phone3) {
    merged.phone3 = '+244 952 644 332';
    migrated = true;
  }
  if (!merged.email || merged.email.includes('aliancaimobiliaria.ao')) {
    merged.email = 'comercial@anpanzo.com';
    migrated = true;
  }
  if (!merged.email2) {
    merged.email2 = 'ap.imobiliaria1985@gmail.com';
    migrated = true;
  }
  if (!merged.website) {
    merged.website = 'anpanzo.com';
    migrated = true;
  }
  if (!merged.instagram) {
    merged.instagram = '@A.panzo comercial';
    migrated = true;
  }
  if (!merged.facebook) {
    merged.facebook = 'A.panzo comercial';
    migrated = true;
  }
  if (!merged.address || merged.address.includes('Luanda & Malanje, Angola')) {
    merged.address = 'Angola – Serviço com Qualidade e Confiança';
    migrated = true;
  }
  if (!merged.heroTitle || merged.heroTitle.includes('Aliança Imobiliária')) {
    merged.heroTitle = 'Quer Vender, Comprar ou Arrendar? Nós Temos a Solução Ideal para Si!';
    migrated = true;
  }
  if (!merged.heroSubtitle || merged.heroSubtitle.includes('Aliança Imobiliária')) {
    merged.heroSubtitle = 'A.PANZO - Comércio & Prestação de Serviços, LDA. Cuidamos do seu imóvel como se fosse nosso com qualidade e confiança.';
    migrated = true;
  }
  if (!merged.marqueeNotice || merged.marqueeNotice.includes('Aliança') || merged.marqueeNotice.includes('924 875 869') || merged.marqueeNotice.includes('935973494')) {
    merged.marqueeNotice = 'A.PANZO Imobiliária • Apartamentos, Vivendas, Lojas, Armazéns, Escritórios e Terrenos • WhatsApp: +244 925 883 080';
    migrated = true;
  }
  if (migrated) {
    setDoc(
      doc(db, 'site_settings', 'general'),
      cleanFirestoreData({
        ...merged,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    ).catch(() => {});
  }
  return merged;
}

export const dbService = {
  // --- PROPERTIES ---
  subscribeProperties(
    callback: (properties: Property[]) => void,
    onError?: (err: any) => void
  ) {
    const path = 'properties';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => {
          const data = d.data();
          const currency = normalizeCurrency(data.currency);
          const rawDeal = data.dealType;
          const dealType: DealType =
            rawDeal === 'venda' || rawDeal === 'arrendamento' || rawDeal === 'trespasse'
              ? rawDeal
              : 'venda';

          const sanitized: Property = {
            id: d.id,
            title: data.title || 'Imóvel sem título',
            code: data.code || `ALI-${String(d.id).slice(-4).toUpperCase()}`,
            dealType,
            category: data.category || 'apartamento',
            categoryName: data.categoryName || 'Apartamento',
            price: typeof data.price === 'number' && !isNaN(data.price) ? data.price : 0,
            currency: currency as any,
            isNegotiable: Boolean(data.isNegotiable),
            province: data.province || 'Luanda',
            municipality: data.municipality || 'Luanda',
            neighborhood: data.neighborhood || '',
            addressReference: data.addressReference || '',
            area: typeof data.area === 'number' ? data.area : 0,
            bedrooms: typeof data.bedrooms === 'number' ? data.bedrooms : 0,
            bathrooms: typeof data.bathrooms === 'number' ? data.bathrooms : 0,
            parkingSpaces: typeof data.parkingSpaces === 'number' ? data.parkingSpaces : 0,
            features: Array.isArray(data.features) ? data.features : [],
            description: data.description || '',
            condition: data.condition || 'usado',
            status: data.status || 'disponivel',
            isFeatured: Boolean(data.isFeatured || data.featured),
            images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [],
            videoUrl: data.videoUrl || null,
            viewsCount: typeof data.viewsCount === 'number' ? data.viewsCount : 0,
            createdAt: data.createdAt ? String(data.createdAt) : new Date().toISOString(),
            updatedAt: data.updatedAt ? String(data.updatedAt) : new Date().toISOString(),
            publishedBy: data.publishedBy || '',
          };
          return sanitized;
        }) as Property[];
        callback(items);
      },
      (error) => {
        console.warn('Erro ao escutar imóveis do Firestore:', error.message);
        if (onError) onError(error);
      }
    );
  },

  async saveProperty(property: Property): Promise<void> {
    const path = `properties/${property.id}`;
    try {
      const currency = normalizeCurrency(property.currency);
      const sanitized = cleanFirestoreData({
        ...property,
        currency,
        videoUrl: property.videoUrl || null,
        updatedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'properties', property.id), sanitized, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteProperty(propertyId: string): Promise<void> {
    const path = `properties/${propertyId}`;
    try {
      await deleteDoc(doc(db, 'properties', propertyId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    try {
      const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return DEFAULT_CATEGORIES;
      return snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as Category[];
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  subscribeCategories(
    callback: (categories: Category[]) => void,
    onError?: (err: any) => void
  ) {
    const path = 'categories';
    const q = query(collection(db, path), orderBy('order', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(DEFAULT_CATEGORIES);
        } else {
          const items = snapshot.docs.map((d) => ({
            ...d.data(),
            id: d.id,
          })) as Category[];
          callback(items);
        }
      },
      (error) => {
        console.warn('Erro ao escutar categorias do Firestore:', error.message);
        callback(DEFAULT_CATEGORIES);
        if (onError) onError(error);
      }
    );
  },

  async saveCategory(category: Category): Promise<void> {
    const path = `categories/${category.id}`;
    try {
      await setDoc(doc(db, 'categories', category.id), cleanFirestoreData(category), { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteCategory(categoryId: string): Promise<void> {
    const path = `categories/${categoryId}`;
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- LOCATIONS ---
  async getLocations(): Promise<LocationConfig[]> {
    try {
      const q = query(collection(db, 'locations'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return ANGOLA_LOCATIONS;
      return snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as LocationConfig[];
    } catch {
      return ANGOLA_LOCATIONS;
    }
  },

  subscribeLocations(
    callback: (locations: LocationConfig[]) => void,
    onError?: (err: any) => void
  ) {
    const path = 'locations';
    const q = query(collection(db, path), orderBy('order', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(ANGOLA_LOCATIONS);
        } else {
          const items = snapshot.docs.map((d) => ({
            ...d.data(),
            id: d.id,
          })) as LocationConfig[];
          callback(items);
        }
      },
      (error) => {
        console.warn('Erro ao escutar localizações:', error.message);
        callback(ANGOLA_LOCATIONS);
        if (onError) onError(error);
      }
    );
  },

  async saveLocation(location: LocationConfig): Promise<void> {
    const path = `locations/${location.id}`;
    try {
      await setDoc(doc(db, 'locations', location.id), cleanFirestoreData(location), { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteLocation(locationId: string): Promise<void> {
    const path = `locations/${locationId}`;
    try {
      await deleteDoc(doc(db, 'locations', locationId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- SITE SETTINGS ---
  async getSiteSettings(): Promise<SiteSettings> {
    try {
      const snap = await getDoc(doc(db, 'site_settings', 'general'));
      if (snap.exists()) {
        return normalizeSiteSettings(snap.data());
      }
      return DEFAULT_SITE_SETTINGS;
    } catch {
      return DEFAULT_SITE_SETTINGS;
    }
  },

  subscribeSiteSettings(
    callback: (settings: SiteSettings) => void,
    onError?: (err: any) => void
  ) {
    const path = 'site_settings/general';
    return onSnapshot(
      doc(db, 'site_settings', 'general'),
      (snapshot) => {
        if (snapshot.exists()) {
          callback(normalizeSiteSettings(snapshot.data()));
        } else {
          callback(DEFAULT_SITE_SETTINGS);
        }
      },
      (error) => {
        console.warn('Erro ao carregar configurações:', error.message);
        callback(DEFAULT_SITE_SETTINGS);
        if (onError) onError(error);
      }
    );
  },

  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
    const path = 'site_settings/general';
    try {
      const sanitized = cleanFirestoreData({
        ...settings,
        updatedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'site_settings', 'general'), sanitized, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // --- REAL-TIME MESSAGING ---
  subscribeConversations(
    callback: (conversations: Conversation[]) => void,
    onError?: (err: any) => void
  ) {
    const path = 'conversations';
    const q = query(collection(db, path), orderBy('lastMessageAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        })) as Conversation[];
        callback(items);
      },
      (error) => {
        console.warn('Erro ao escutar conversas:', error.message);
        if (onError) onError(error);
      }
    );
  },

  subscribeMessages(
    conversationId: string,
    callback: (messages: Message[]) => void,
    onError?: (err: any) => void
  ) {
    const path = `conversations/${conversationId}/messages`;
    const q = query(collection(db, path), orderBy('timestamp', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        })) as Message[];
        callback(items);
      },
      (error) => {
        console.warn('Erro ao escutar mensagens:', error.message);
        if (onError) onError(error);
      }
    );
  },

  async sendClientMessage(
    conversationId: string,
    visitorId: string,
    clientName: string,
    clientPhone: string,
    text: string,
    propertyInfo?: { id: string; title: string }
  ): Promise<void> {
    const now = new Date().toISOString();
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    // Update conversation record
    const convData: Partial<Conversation> = {
      id: conversationId,
      visitorId,
      clientName: clientName.trim() || 'Visitante',
      clientPhone: clientPhone.trim() || '',
      lastMessage: text,
      lastMessageAt: now,
      unreadByAdmin: 1,
      createdAt: now,
    };
    if (propertyInfo) {
      convData.propertyInterestId = propertyInfo.id;
      convData.propertyTitle = propertyInfo.title;
    }

    try {
      await setDoc(doc(db, 'conversations', conversationId), cleanFirestoreData(convData), { merge: true });

      // Add message
      await setDoc(doc(db, `conversations/${conversationId}/messages`, msgId), {
        id: msgId,
        conversationId,
        sender: 'user',
        senderName: clientName.trim() || 'Visitante',
        text,
        timestamp: now,
        read: false,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `conversations/${conversationId}`);
    }
  },

  async sendAdminReply(
    conversationId: string,
    adminName: string,
    text: string
  ): Promise<void> {
    const now = new Date().toISOString();
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    try {
      await setDoc(doc(db, 'conversations', conversationId), {
        lastMessage: text,
        lastMessageAt: now,
        unreadByAdmin: 0,
        unreadByUser: 1,
      }, { merge: true });

      await setDoc(doc(db, `conversations/${conversationId}/messages`, msgId), {
        id: msgId,
        conversationId,
        sender: 'admin',
        senderName: adminName || 'Aliança Imobiliária',
        text,
        timestamp: now,
        read: false,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `conversations/${conversationId}`);
    }
  },

  async markConversationRead(conversationId: string, byAdmin: boolean): Promise<void> {
    try {
      await setDoc(
        doc(db, 'conversations', conversationId),
        byAdmin ? { unreadByAdmin: 0 } : { unreadByUser: 0 },
        { merge: true }
      );
    } catch (err) {
      console.warn('Erro ao atualizar leitura da conversa:', err);
    }
  },

  // --- FAVORITES ---
  subscribeFavorites(
    userId: string,
    callback: (favorites: Favorite[]) => void,
    onError?: (err: any) => void
  ) {
    if (!userId) {
      callback([]);
      return () => {};
    }

    const path = 'favorites';
    const q = query(collection(db, path), where('userId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        })) as Favorite[];
        callback(items);
      },
      (error) => {
        console.warn('Erro ao escutar favoritos do Firestore:', error.message);
        if (onError) onError(error);
      }
    );
  },

  async addFavorite(userId: string, propertyId: string): Promise<void> {
    const id = `${userId}_${propertyId}`;
    const path = `favorites/${id}`;
    try {
      await setDoc(doc(db, 'favorites', id), {
        id,
        userId,
        propertyId,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  },

  async removeFavorite(userId: string, propertyId: string): Promise<void> {
    const id = `${userId}_${propertyId}`;
    const path = `favorites/${id}`;
    try {
      await deleteDoc(doc(db, 'favorites', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  async syncLocalFavoritesToUser(userId: string, propertyIds: string[]): Promise<void> {
    if (!userId || !propertyIds.length) return;
    try {
      await Promise.all(
        propertyIds.map((propertyId) =>
          setDoc(
            doc(db, 'favorites', `${userId}_${propertyId}`),
            {
              id: `${userId}_${propertyId}`,
              userId,
              propertyId,
              createdAt: new Date().toISOString(),
            },
            { merge: true }
          )
        )
      );
    } catch (err) {
      console.warn('Erro ao sincronizar favoritos locais:', err);
    }
  },

  // --- PROPERTY ALERTS ---
  subscribePropertyAlerts(
    userId: string,
    callback: (alerts: PropertyAlert[]) => void,
    onError?: (err: any) => void
  ) {
    if (!userId) {
      callback([]);
      return () => {};
    }

    const path = 'alerts';
    const q = query(collection(db, path), where('userId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        })) as PropertyAlert[];
        // Sort in memory by createdAt desc
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(items);
      },
      (error) => {
        console.warn('Erro ao escutar alertas de pesquisa:', error.message);
        if (onError) onError(error);
      }
    );
  },

  async savePropertyAlert(alert: PropertyAlert): Promise<void> {
    const path = `alerts/${alert.id}`;
    try {
      await setDoc(doc(db, 'alerts', alert.id), cleanFirestoreData(alert), { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  async deletePropertyAlert(alertId: string): Promise<void> {
    const path = `alerts/${alertId}`;
    try {
      await deleteDoc(doc(db, 'alerts', alertId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  async togglePropertyAlertActive(alertId: string, currentActive: boolean): Promise<void> {
    const path = `alerts/${alertId}`;
    try {
      await setDoc(
        doc(db, 'alerts', alertId),
        { active: !currentActive },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  // --- ALERT NOTIFICATIONS ---
  subscribeAlertNotifications(
    userId: string,
    callback: (notifications: AlertNotification[]) => void,
    onError?: (err: any) => void
  ) {
    if (!userId) {
      callback([]);
      return () => {};
    }

    const path = 'notifications';
    const q = query(collection(db, path), where('userId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        })) as AlertNotification[];
        // Sort in memory by createdAt desc
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(items);
      },
      (error) => {
        console.warn('Erro ao escutar notificações:', error.message);
        if (onError) onError(error);
      }
    );
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    const path = `notifications/${notificationId}`;
    try {
      await setDoc(doc(db, 'notifications', notificationId), { read: true }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  async markAllNotificationsRead(userId: string, notificationIds: string[]): Promise<void> {
    if (!userId || !notificationIds.length) return;
    try {
      await Promise.all(
        notificationIds.map((id) =>
          setDoc(doc(db, 'notifications', id), { read: true }, { merge: true })
        )
      );
    } catch (err) {
      console.warn('Erro ao marcar notificações como lidas:', err);
    }
  },

  async deleteNotification(notificationId: string): Promise<void> {
    const path = `notifications/${notificationId}`;
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  },

  async createAlertNotification(notif: AlertNotification): Promise<void> {
    const path = `notifications/${notif.id}`;
    try {
      await setDoc(doc(db, 'notifications', notif.id), cleanFirestoreData(notif));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  },

  // --- MATCHING HELPER ---
  matchesAlert(property: Property, alert: PropertyAlert): boolean {
    if (!alert || !alert.active || !property) return false;

    // Deal type check
    if (alert.dealType && alert.dealType !== 'todos') {
      if (property.dealType !== alert.dealType) return false;
    }

    // Category check
    if (alert.category) {
      if (property.category !== alert.category) return false;
    }

    // Province check
    if (alert.province && alert.province.trim()) {
      const propProv = (property.province || '').toLowerCase().trim();
      const alertProv = alert.province.toLowerCase().trim();
      if (propProv !== alertProv) return false;
    }

    // Municipality check
    if (alert.municipality && alert.municipality.trim()) {
      const propMuni = (property.municipality || '').toLowerCase().trim();
      const alertMuni = alert.municipality.toLowerCase().trim();
      if (!propMuni.includes(alertMuni)) {
        return false;
      }
    }

    // Bedrooms check
    if (alert.bedrooms && alert.bedrooms !== 'todos') {
      const propBeds = Number(property.bedrooms) || 0;
      if (alert.bedrooms === '5+') {
        if (propBeds < 5) return false;
      } else {
        const targetBeds = parseInt(alert.bedrooms, 10);
        if (propBeds !== targetBeds) return false;
      }
    }

    // Price range check
    const propPrice = typeof property.price === 'number' ? property.price : 0;
    if (typeof alert.minPrice === 'number' && alert.minPrice > 0) {
      if (propPrice < alert.minPrice) return false;
    }
    if (typeof alert.maxPrice === 'number' && alert.maxPrice > 0) {
      if (propPrice > alert.maxPrice) return false;
    }

    // Keyword search
    if (alert.keyword && alert.keyword.trim()) {
      const q = alert.keyword.toLowerCase().trim();
      const match =
        (property.title || '').toLowerCase().includes(q) ||
        (property.code || '').toLowerCase().includes(q) ||
        (property.neighborhood || '').toLowerCase().includes(q) ||
        (property.description || '').toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  },
};

