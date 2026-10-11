import { sql } from './neon';
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
  PartnerProfile,
  DealType,
  PropertyCondition,
  PropertyStatus,
} from '../types';
import { DEFAULT_CATEGORIES, ANGOLA_LOCATIONS, DEFAULT_SITE_SETTINGS } from './defaultData';
import { batchUploadPropertyPhotos, UploadProgressInfo } from './mediaUtils';

// Event emitter helper for instant UI reactivity across components
type Listener<T> = (data: T) => void;
const propertyListeners = new Set<Listener<Property[]>>();
let cachedProperties: Property[] = [];

function notifyPropertyListeners(props: Property[]) {
  cachedProperties = props;
  propertyListeners.forEach((fn) => {
    try {
      fn(props);
    } catch (e) {
      console.warn('Property listener error:', e);
    }
  });
}

function parseJsonField<T>(val: any, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val as T;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function mapRowToProperty(row: any): Property {
  return {
    id: String(row.id),
    code: String(row.code || ''),
    title: String(row.title || ''),
    dealType: (row.deal_type || 'venda') as DealType,
    category: String(row.category || ''),
    categoryName: String(row.category_name || ''),
    price: Number(row.price || 0),
    currency: (row.currency || 'AOA') as 'AOA' | 'USD' | 'EUR',
    isNegotiable: Boolean(row.is_negotiable),
    province: String(row.province || ''),
    municipality: String(row.municipality || ''),
    neighborhood: String(row.neighborhood || ''),
    addressReference: row.address_reference ? String(row.address_reference) : undefined,
    area: Number(row.area || 0),
    bedrooms: Number(row.bedrooms || 0),
    bathrooms: Number(row.bathrooms || 0),
    parkingSpaces: Number(row.parking_spaces || 0),
    condition: (row.condition || 'usado') as PropertyCondition,
    status: (row.status || 'disponivel') as PropertyStatus,
    isFeatured: Boolean(row.is_featured),
    features: parseJsonField<string[]>(row.features, []),
    description: String(row.description || ''),
    images: parseJsonField<string[]>(row.images, []),
    videoUrl: row.video_url ? String(row.video_url) : null,
    hasVideo: Boolean(row.has_video),
    viewsCount: Number(row.views_count || 0),
    publishedBy: row.published_by ? String(row.published_by) : undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

function mapRowToPartner(row: any): PartnerProfile {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    companyName: String(row.company_name || ''),
    nif: String(row.nif || ''),
    technicalResponsible: String(row.technical_responsible || ''),
    email: String(row.email || ''),
    phone: String(row.phone || ''),
    address: String(row.address || ''),
    province: row.province ? String(row.province) : undefined,
    municipality: row.municipality ? String(row.municipality) : undefined,
    validationDocuments: String(row.validation_documents || ''),
    status: (row.status || 'pending') as 'active' | 'pending' | 'suspended',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

function mapRowToSiteSettings(row: any): SiteSettings {
  if (!row) return DEFAULT_SITE_SETTINGS;
  return {
    id: String(row.id || 'default'),
    heroTitle: String(row.hero_title || DEFAULT_SITE_SETTINGS.heroTitle),
    heroSubtitle: String(row.hero_subtitle || DEFAULT_SITE_SETTINGS.heroSubtitle),
    heroBannerImage: row.hero_banner_image ? String(row.hero_banner_image) : undefined,
    marqueeNotice: String(row.marquee_notice || DEFAULT_SITE_SETTINGS.marqueeNotice),
    showMarquee: row.show_marquee !== undefined ? Boolean(row.show_marquee) : DEFAULT_SITE_SETTINGS.showMarquee,
    aboutStory: String(row.about_story || DEFAULT_SITE_SETTINGS.aboutStory),
    aboutMission: String(row.about_mission || DEFAULT_SITE_SETTINGS.aboutMission),
    aboutVision: String(row.about_vision || DEFAULT_SITE_SETTINGS.aboutVision),
    aboutValues: parseJsonField<string[]>(row.about_values, DEFAULT_SITE_SETTINGS.aboutValues),
    servicesList: parseJsonField<any[]>(row.services_list, DEFAULT_SITE_SETTINGS.servicesList),
    phone: String(row.phone || DEFAULT_SITE_SETTINGS.phone),
    phone2: row.phone2 ? String(row.phone2) : undefined,
    phone3: row.phone3 ? String(row.phone3) : undefined,
    whatsapp: String(row.whatsapp || DEFAULT_SITE_SETTINGS.whatsapp),
    email: String(row.email || DEFAULT_SITE_SETTINGS.email),
    email2: row.email2 ? String(row.email2) : undefined,
    website: row.website ? String(row.website) : undefined,
    instagram: row.instagram ? String(row.instagram) : undefined,
    facebook: row.facebook ? String(row.facebook) : undefined,
    address: String(row.address || DEFAULT_SITE_SETTINGS.address),
    workingHours: String(row.working_hours || DEFAULT_SITE_SETTINGS.workingHours),
    logoUrl: row.logo_url ? String(row.logo_url) : '/panzo-logo.jpeg',
    profilePhotoUrl: row.profile_photo_url ? String(row.profile_photo_url) : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

export const dbService = {
  /**
   * Verifica se o usuário é administrador (via Neon Postgres)
   */
  async checkIsAdmin(email: string, userId?: string): Promise<boolean> {
    try {
      if (!email) return false;
      if (email.toLowerCase() === 'anoterlove132@gmail.com') return true;
      const rows = await sql`SELECT role FROM admins WHERE LOWER(email) = LOWER(${email}) LIMIT 1`;
      return rows.length > 0 && rows[0].role === 'admin';
    } catch {
      return email.toLowerCase() === 'anoterlove132@gmail.com';
    }
  },

  /**
   * Categorias de Imóveis
   */
  async getCategories(): Promise<Category[]> {
    try {
      const rows = await sql`
        SELECT id, name, slug, type, icon, order_index, is_active
        FROM categories
        WHERE is_active = TRUE
        ORDER BY order_index ASC
      `;
      if (!rows || rows.length === 0) {
        return DEFAULT_CATEGORIES;
      }
      return rows.map((r) => ({
        id: String(r.id),
        name: String(r.name),
        slug: String(r.slug),
        type: r.type as any,
        icon: r.icon ? String(r.icon) : undefined,
        order: Number(r.order_index || 0),
        isActive: Boolean(r.is_active),
      }));
    } catch (err) {
      console.warn('Erro ao carregar categorias do Neon:', err);
      return DEFAULT_CATEGORIES;
    }
  },

  /**
   * Localizações (Províncias e Municípios)
   */
  async getLocations(): Promise<LocationConfig[]> {
    try {
      const rows = await sql`
        SELECT id, province, municipalities, order_index
        FROM locations
        ORDER BY order_index ASC
      `;
      if (!rows || rows.length === 0) {
        return ANGOLA_LOCATIONS;
      }
      return rows.map((r) => ({
        id: String(r.id),
        province: String(r.province),
        municipalities: parseJsonField<string[]>(r.municipalities, []),
        order: Number(r.order_index || 0),
      }));
    } catch (err) {
      console.warn('Erro ao carregar localizações do Neon:', err);
      return ANGOLA_LOCATIONS;
    }
  },

  /**
   * Configurações Gerais do Site
   */
  async getSiteSettings(): Promise<SiteSettings> {
    try {
      const rows = await sql`
        SELECT * FROM site_settings WHERE id = 'default' LIMIT 1
      `;
      if (rows && rows.length > 0) {
        return mapRowToSiteSettings(rows[0]);
      }
      return DEFAULT_SITE_SETTINGS;
    } catch (err) {
      console.warn('Erro ao carregar configurações do Neon:', err);
      return DEFAULT_SITE_SETTINGS;
    }
  },

  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
    try {
      const current = await this.getSiteSettings();
      const merged: SiteSettings = { ...current, ...settings, updatedAt: new Date().toISOString() };

      await sql`
        INSERT INTO site_settings (
          id, hero_title, hero_subtitle, hero_banner_image, marquee_notice, show_marquee,
          about_story, about_mission, about_vision, about_values, services_list,
          phone, phone2, phone3, whatsapp, email, email2, website, instagram, facebook,
          address, working_hours, logo_url, profile_photo_url, updated_at
        ) VALUES (
          'default',
          ${merged.heroTitle},
          ${merged.heroSubtitle},
          ${merged.heroBannerImage || null},
          ${merged.marqueeNotice},
          ${merged.showMarquee},
          ${merged.aboutStory},
          ${merged.aboutMission},
          ${merged.aboutVision},
          ${JSON.stringify(merged.aboutValues)},
          ${JSON.stringify(merged.servicesList)},
          ${merged.phone},
          ${merged.phone2 || null},
          ${merged.phone3 || null},
          ${merged.whatsapp},
          ${merged.email},
          ${merged.email2 || null},
          ${merged.website || null},
          ${merged.instagram || null},
          ${merged.facebook || null},
          ${merged.address},
          ${merged.workingHours},
          ${merged.logoUrl || '/panzo-logo.jpeg'},
          ${merged.profilePhotoUrl || null},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          hero_title = EXCLUDED.hero_title,
          hero_subtitle = EXCLUDED.hero_subtitle,
          hero_banner_image = EXCLUDED.hero_banner_image,
          marquee_notice = EXCLUDED.marquee_notice,
          show_marquee = EXCLUDED.show_marquee,
          about_story = EXCLUDED.about_story,
          about_mission = EXCLUDED.about_mission,
          about_vision = EXCLUDED.about_vision,
          about_values = EXCLUDED.about_values,
          services_list = EXCLUDED.services_list,
          phone = EXCLUDED.phone,
          phone2 = EXCLUDED.phone2,
          phone3 = EXCLUDED.phone3,
          whatsapp = EXCLUDED.whatsapp,
          email = EXCLUDED.email,
          email2 = EXCLUDED.email2,
          website = EXCLUDED.website,
          instagram = EXCLUDED.instagram,
          facebook = EXCLUDED.facebook,
          address = EXCLUDED.address,
          working_hours = EXCLUDED.working_hours,
          logo_url = EXCLUDED.logo_url,
          profile_photo_url = EXCLUDED.profile_photo_url,
          updated_at = NOW()
      `;
    } catch (err) {
      console.error('Erro ao atualizar configurações no Neon:', err);
      throw err;
    }
  },

  /**
   * Catálogo de Imóveis (Consulta e Atualização em Tempo Real)
   */
  async getProperties(): Promise<Property[]> {
    try {
      const rows = await sql`
        SELECT * FROM properties ORDER BY created_at DESC
      `;
      const mapped = rows.map(mapRowToProperty);
      notifyPropertyListeners(mapped);
      return mapped;
    } catch (err) {
      console.error('Erro ao buscar imóveis no Neon:', err);
      return cachedProperties;
    }
  },

  subscribeProperties(
    onUpdate: (properties: Property[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    propertyListeners.add(onUpdate);

    // Initial fetch
    this.getProperties()
      .then((items) => onUpdate(items))
      .catch((err) => {
        if (onError) onError(err);
      });

    // Periodic background sync (every 12 seconds)
    const interval = setInterval(() => {
      this.getProperties()
        .then((items) => onUpdate(items))
        .catch(() => {});
    }, 12000);

    return () => {
      propertyListeners.delete(onUpdate);
      clearInterval(interval);
    };
  },

  async getPropertyById(id: string): Promise<Property | null> {
    try {
      const rows = await sql`SELECT * FROM properties WHERE id = ${id} LIMIT 1`;
      if (rows && rows.length > 0) {
        return mapRowToProperty(rows[0]);
      }
      return null;
    } catch (err) {
      console.error(`Erro ao buscar imóvel ${id} no Neon:`, err);
      return null;
    }
  },

  async addProperty(propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const id = `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const code = propertyData.code || `AP-${Math.floor(1000 + Math.random() * 9000)}`;

      await sql`
        INSERT INTO properties (
          id, code, title, deal_type, category, category_name, price, currency,
          is_negotiable, province, municipality, neighborhood, address_reference,
          area, bedrooms, bathrooms, parking_spaces, condition, status, is_featured,
          features, description, images, video_url, has_video, views_count, published_by,
          created_at, updated_at
        ) VALUES (
          ${id},
          ${code},
          ${propertyData.title},
          ${propertyData.dealType},
          ${propertyData.category},
          ${propertyData.categoryName},
          ${Number(propertyData.price || 0)},
          ${propertyData.currency || 'AOA'},
          ${Boolean(propertyData.isNegotiable)},
          ${propertyData.province},
          ${propertyData.municipality},
          ${propertyData.neighborhood},
          ${propertyData.addressReference || null},
          ${Number(propertyData.area || 0)},
          ${Number(propertyData.bedrooms || 0)},
          ${Number(propertyData.bathrooms || 0)},
          ${Number(propertyData.parkingSpaces || 0)},
          ${propertyData.condition || 'usado'},
          ${propertyData.status || 'disponivel'},
          ${Boolean(propertyData.isFeatured)},
          ${JSON.stringify(propertyData.features || [])},
          ${propertyData.description || ''},
          ${JSON.stringify(propertyData.images || [])},
          ${propertyData.videoUrl || null},
          ${Boolean(propertyData.hasVideo)},
          ${Number(propertyData.viewsCount || 0)},
          ${propertyData.publishedBy || 'A.PANZO Imobiliária'},
          NOW(),
          NOW()
        )
      `;

      await this.getProperties();
      return id;
    } catch (err) {
      console.error('Erro ao adicionar imóvel no Neon:', err);
      throw err;
    }
  },

  async updateProperty(id: string, propertyData: Partial<Property>): Promise<void> {
    try {
      const existing = await this.getPropertyById(id);
      if (!existing) throw new Error(`Imóvel ${id} não encontrado.`);

      const merged: Property = {
        ...existing,
        ...propertyData,
        updatedAt: new Date().toISOString(),
      };

      await sql`
        UPDATE properties SET
          title = ${merged.title},
          code = ${merged.code},
          deal_type = ${merged.dealType},
          category = ${merged.category},
          category_name = ${merged.categoryName},
          price = ${Number(merged.price || 0)},
          currency = ${merged.currency},
          is_negotiable = ${Boolean(merged.isNegotiable)},
          province = ${merged.province},
          municipality = ${merged.municipality},
          neighborhood = ${merged.neighborhood},
          address_reference = ${merged.addressReference || null},
          area = ${Number(merged.area || 0)},
          bedrooms = ${Number(merged.bedrooms || 0)},
          bathrooms = ${Number(merged.bathrooms || 0)},
          parking_spaces = ${Number(merged.parkingSpaces || 0)},
          condition = ${merged.condition},
          status = ${merged.status},
          is_featured = ${Boolean(merged.isFeatured)},
          features = ${JSON.stringify(merged.features || [])},
          description = ${merged.description},
          images = ${JSON.stringify(merged.images || [])},
          video_url = ${merged.videoUrl || null},
          has_video = ${Boolean(merged.hasVideo)},
          updated_at = NOW()
        WHERE id = ${id}
      `;

      await this.getProperties();
    } catch (err) {
      console.error(`Erro ao atualizar imóvel ${id} no Neon:`, err);
      throw err;
    }
  },

  async deleteProperty(id: string): Promise<void> {
    try {
      await sql`DELETE FROM properties WHERE id = ${id}`;
      await this.getProperties();
    } catch (err) {
      console.error(`Erro ao eliminar imóvel ${id} no Neon:`, err);
      throw err;
    }
  },

  async incrementPropertyViews(id: string): Promise<void> {
    try {
      await sql`UPDATE properties SET views_count = views_count + 1 WHERE id = ${id}`;
    } catch (err) {
      console.warn(`Erro ao incrementar visualizações no imóvel ${id}:`, err);
    }
  },

  /**
   * Portal do Parceiro / Corretores
   */
  async getPartnerProfile(userId: string): Promise<PartnerProfile | null> {
    try {
      const rows = await sql`
        SELECT * FROM partners WHERE user_id = ${userId} LIMIT 1
      `;
      if (rows && rows.length > 0) {
        return mapRowToPartner(rows[0]);
      }
      return null;
    } catch (err) {
      console.warn('Erro ao obter perfil de parceiro do Neon:', err);
      return null;
    }
  },

  async savePartnerProfile(profile: PartnerProfile): Promise<void> {
    try {
      await sql`
        INSERT INTO partners (
          id, user_id, company_name, nif, technical_responsible, email,
          phone, address, province, municipality, validation_documents, status,
          created_at, updated_at
        ) VALUES (
          ${profile.id},
          ${profile.userId},
          ${profile.companyName},
          ${profile.nif},
          ${profile.technicalResponsible},
          ${profile.email},
          ${profile.phone},
          ${profile.address},
          ${profile.province || null},
          ${profile.municipality || null},
          ${profile.validationDocuments || null},
          ${profile.status || 'pending'},
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          company_name = EXCLUDED.company_name,
          nif = EXCLUDED.nif,
          technical_responsible = EXCLUDED.technical_responsible,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          address = EXCLUDED.address,
          province = EXCLUDED.province,
          municipality = EXCLUDED.municipality,
          validation_documents = EXCLUDED.validation_documents,
          status = EXCLUDED.status,
          updated_at = NOW()
      `;
    } catch (err) {
      console.error('Erro ao salvar parceiro no Neon:', err);
      throw err;
    }
  },

  async getPartnerProfiles(): Promise<PartnerProfile[]> {
    try {
      const rows = await sql`SELECT * FROM partners ORDER BY created_at DESC`;
      return rows.map(mapRowToPartner);
    } catch (err) {
      console.error('Erro ao listar parceiros do Neon:', err);
      return [];
    }
  },

  async updatePartnerStatus(id: string, status: 'active' | 'pending' | 'suspended'): Promise<void> {
    try {
      await sql`UPDATE partners SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
    } catch (err) {
      console.error(`Erro ao atualizar status do parceiro ${id}:`, err);
      throw err;
    }
  },

  /**
   * Favoritos dos Clientes
   */
  async getUserFavorites(userId: string): Promise<Favorite[]> {
    try {
      const rows = await sql`
        SELECT id, user_id, property_id, created_at
        FROM favorites
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
      return rows.map((r) => ({
        id: String(r.id),
        userId: String(r.user_id),
        propertyId: String(r.property_id),
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.warn('Erro ao carregar favoritos do Neon:', err);
      return [];
    }
  },

  async addFavorite(userId: string, propertyId: string): Promise<void> {
    try {
      const id = `${userId}_${propertyId}`;
      await sql`
        INSERT INTO favorites (id, user_id, property_id, created_at)
        VALUES (${id}, ${userId}, ${propertyId}, NOW())
        ON CONFLICT (id) DO NOTHING
      `;
    } catch (err) {
      console.error('Erro ao adicionar favorito no Neon:', err);
      throw err;
    }
  },

  async removeFavorite(userId: string, propertyId: string): Promise<void> {
    try {
      await sql`
        DELETE FROM favorites WHERE user_id = ${userId} AND property_id = ${propertyId}
      `;
    } catch (err) {
      console.error('Erro ao remover favorito no Neon:', err);
      throw err;
    }
  },

  async syncLocalFavoritesToUser(userId: string, propertyIds: string[]): Promise<void> {
    for (const propId of propertyIds) {
      try {
        await this.addFavorite(userId, propId);
      } catch {}
    }
  },

  subscribeFavorites(userId: string, onUpdate: (favs: { id: string; propertyId: string }[]) => void): () => void {
    const fetchFavs = async () => {
      const list = await this.getUserFavorites(userId);
      onUpdate(list.map((f) => ({ id: f.id, propertyId: f.propertyId })));
    };
    fetchFavs();
    const timer = setInterval(fetchFavs, 8000);
    return () => clearInterval(timer);
  },

  /**
   * Alertas de Imóveis (Radar Imobiliário)
   */
  async getUserAlerts(userId: string): Promise<PropertyAlert[]> {
    try {
      const rows = await sql`
        SELECT * FROM property_alerts WHERE user_id = ${userId} ORDER BY created_at DESC
      `;
      return rows.map((r) => ({
        id: String(r.id),
        userId: String(r.user_id),
        name: String(r.name),
        dealType: (r.deal_type || 'todos') as any,
        category: String(r.category || ''),
        province: String(r.province || ''),
        municipality: String(r.municipality || ''),
        bedrooms: String(r.bedrooms || 'todos'),
        minPrice: r.min_price !== null && r.min_price !== undefined ? Number(r.min_price) : '',
        maxPrice: r.max_price !== null && r.max_price !== undefined ? Number(r.max_price) : '',
        keyword: String(r.keyword || ''),
        notifyChannel: (r.notify_channel || 'whatsapp') as any,
        active: Boolean(r.active),
        lastNotifiedAt: r.last_notified_at ? new Date(r.last_notified_at).toISOString() : undefined,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (err) {
      console.warn('Erro ao carregar alertas do Neon:', err);
      return [];
    }
  },

  async savePropertyAlert(alert: PropertyAlert): Promise<void> {
    try {
      await sql`
        INSERT INTO property_alerts (
          id, user_id, name, deal_type, category, province, municipality,
          bedrooms, min_price, max_price, keyword, notify_channel, active, created_at
        ) VALUES (
          ${alert.id},
          ${alert.userId},
          ${alert.name},
          ${alert.dealType},
          ${alert.category},
          ${alert.province},
          ${alert.municipality},
          ${alert.bedrooms},
          ${alert.minPrice !== '' ? Number(alert.minPrice) : null},
          ${alert.maxPrice !== '' ? Number(alert.maxPrice) : null},
          ${alert.keyword || ''},
          ${alert.notifyChannel || 'whatsapp'},
          ${Boolean(alert.active)},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          deal_type = EXCLUDED.deal_type,
          category = EXCLUDED.category,
          province = EXCLUDED.province,
          municipality = EXCLUDED.municipality,
          bedrooms = EXCLUDED.bedrooms,
          min_price = EXCLUDED.min_price,
          max_price = EXCLUDED.max_price,
          keyword = EXCLUDED.keyword,
          notify_channel = EXCLUDED.notify_channel,
          active = EXCLUDED.active
      `;
    } catch (err) {
      console.error('Erro ao salvar alerta no Neon:', err);
      throw err;
    }
  },

  async deletePropertyAlert(alertId: string): Promise<void> {
    try {
      await sql`DELETE FROM property_alerts WHERE id = ${alertId}`;
    } catch (err) {
      console.error(`Erro ao apagar alerta ${alertId}:`, err);
      throw err;
    }
  },

  async togglePropertyAlertActive(alertId: string, currentActive: boolean): Promise<void> {
    try {
      await sql`UPDATE property_alerts SET active = ${!currentActive} WHERE id = ${alertId}`;
    } catch (err) {
      console.error(`Erro ao alternar status do alerta ${alertId}:`, err);
      throw err;
    }
  },

  subscribePropertyAlerts(userId: string, onUpdate: (alerts: PropertyAlert[]) => void): () => void {
    const fetchAlerts = async () => {
      const list = await this.getUserAlerts(userId);
      onUpdate(list);
    };
    fetchAlerts();
    const timer = setInterval(fetchAlerts, 8000);
    return () => clearInterval(timer);
  },

  matchesAlert(property: Property, alert: PropertyAlert): boolean {
    if (!alert.active) return false;
    if (alert.dealType !== 'todos' && property.dealType !== alert.dealType) return false;
    if (alert.category && property.category !== alert.category) return false;
    if (alert.province && property.province.toLowerCase() !== alert.province.toLowerCase()) return false;
    if (alert.municipality && property.municipality.toLowerCase() !== alert.municipality.toLowerCase()) return false;
    if (alert.bedrooms && alert.bedrooms !== 'todos') {
      const bCount = Number(alert.bedrooms.replace('+', ''));
      if (alert.bedrooms.includes('+')) {
        if (property.bedrooms < bCount) return false;
      } else {
        if (property.bedrooms !== bCount) return false;
      }
    }
    if (alert.minPrice !== '' && property.price < Number(alert.minPrice)) return false;
    if (alert.maxPrice !== '' && property.price > Number(alert.maxPrice)) return false;
    if (alert.keyword) {
      const kw = alert.keyword.toLowerCase();
      const inTitle = property.title.toLowerCase().includes(kw);
      const inDesc = property.description.toLowerCase().includes(kw);
      const inNeigh = property.neighborhood.toLowerCase().includes(kw);
      if (!inTitle && !inDesc && !inNeigh) return false;
    }
    return true;
  },

  /**
   * Notificações de Alertas de Imóveis
   */
  async createAlertNotification(notif: AlertNotification): Promise<void> {
    try {
      await sql`
        INSERT INTO alert_notifications (
          id, user_id, alert_id, alert_name, property_id, property_title,
          property_code, property_price, property_image, deal_type, location,
          read, created_at
        ) VALUES (
          ${notif.id},
          ${notif.userId},
          ${notif.alertId},
          ${notif.alertName},
          ${notif.propertyId},
          ${notif.propertyTitle},
          ${notif.propertyCode || null},
          ${Number(notif.propertyPrice || 0)},
          ${notif.propertyImage || null},
          ${notif.dealType},
          ${notif.location || null},
          ${Boolean(notif.read)},
          NOW()
        )
        ON CONFLICT (id) DO NOTHING
      `;
    } catch (err) {
      console.warn('Erro ao salvar notificação no Neon:', err);
    }
  },

  async markNotificationRead(notificationId: string): Promise<void> {
    try {
      await sql`UPDATE alert_notifications SET read = TRUE WHERE id = ${notificationId}`;
    } catch (err) {
      console.warn(`Erro ao marcar notificação ${notificationId} como lida:`, err);
    }
  },

  async markAllNotificationsRead(userId: string, unreadIds: string[]): Promise<void> {
    try {
      if (unreadIds.length > 0) {
        await sql`
          UPDATE alert_notifications SET read = TRUE
          WHERE user_id = ${userId} AND id = ANY(${unreadIds})
        `;
      }
    } catch (err) {
      console.warn('Erro ao marcar todas notificações como lidas:', err);
    }
  },

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await sql`DELETE FROM alert_notifications WHERE id = ${notificationId}`;
    } catch (err) {
      console.warn(`Erro ao eliminar notificação ${notificationId}:`, err);
    }
  },

  subscribeAlertNotifications(userId: string, onUpdate: (notifs: AlertNotification[]) => void): () => void {
    const fetchNotifs = async () => {
      try {
        const rows = await sql`
          SELECT * FROM alert_notifications WHERE user_id = ${userId} ORDER BY created_at DESC
        `;
        const mapped: AlertNotification[] = rows.map((r) => ({
          id: String(r.id),
          userId: String(r.user_id),
          alertId: String(r.alert_id),
          alertName: String(r.alert_name),
          propertyId: String(r.property_id),
          propertyTitle: String(r.property_title),
          propertyCode: r.property_code ? String(r.property_code) : undefined,
          propertyPrice: Number(r.property_price || 0),
          propertyImage: r.property_image ? String(r.property_image) : undefined,
          dealType: (r.deal_type || 'venda') as any,
          location: String(r.location || ''),
          read: Boolean(r.read),
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        }));
        onUpdate(mapped);
      } catch (err) {
        console.warn('Erro ao buscar notificações do Neon:', err);
      }
    };
    fetchNotifs();
    const timer = setInterval(fetchNotifs, 8000);
    return () => clearInterval(timer);
  },

  /**
   * Chat e Conversas de Atendimento
   */
  async saveConversation(conv: Conversation): Promise<void> {
    try {
      await sql`
        INSERT INTO conversations (
          id, visitor_id, client_name, client_phone, last_message,
          last_message_at, unread_by_admin, unread_by_user, property_interest_id,
          property_title, created_at
        ) VALUES (
          ${conv.id},
          ${conv.visitorId},
          ${conv.clientName},
          ${conv.clientPhone || null},
          ${conv.lastMessage},
          NOW(),
          ${conv.unreadByAdmin || 0},
          ${conv.unreadByUser || 0},
          ${conv.propertyInterestId || null},
          ${conv.propertyTitle || null},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          last_message = EXCLUDED.last_message,
          last_message_at = NOW(),
          unread_by_admin = EXCLUDED.unread_by_admin,
          unread_by_user = EXCLUDED.unread_by_user
      `;
    } catch (err) {
      console.warn('Erro ao salvar conversa no Neon:', err);
    }
  },

  async saveMessage(msg: Message): Promise<void> {
    try {
      const id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await sql`
        INSERT INTO messages (id, conversation_id, sender, sender_name, text, timestamp, read)
        VALUES (${id}, ${msg.conversationId}, ${msg.sender}, ${msg.senderName}, ${msg.text}, NOW(), ${Boolean(msg.read)})
      `;
    } catch (err) {
      console.warn('Erro ao salvar mensagem no Neon:', err);
    }
  },

  subscribeConversations(
    onUpdate: (conversations: Conversation[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const fetchConvs = async () => {
      try {
        const rows = await sql`SELECT * FROM conversations ORDER BY last_message_at DESC`;
        const mapped: Conversation[] = rows.map((r) => ({
          id: String(r.id),
          visitorId: String(r.visitor_id),
          clientName: String(r.client_name),
          clientPhone: r.client_phone ? String(r.client_phone) : undefined,
          lastMessage: String(r.last_message || ''),
          lastMessageAt: r.last_message_at ? new Date(r.last_message_at).toISOString() : new Date().toISOString(),
          unreadByAdmin: Number(r.unread_by_admin || 0),
          unreadByUser: Number(r.unread_by_user || 0),
          propertyInterestId: r.property_interest_id ? String(r.property_interest_id) : undefined,
          propertyTitle: r.property_title ? String(r.property_title) : undefined,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        }));
        onUpdate(mapped);
      } catch (err: any) {
        if (onError) onError(err);
      }
    };

    fetchConvs();
    const timer = setInterval(fetchConvs, 8000);
    return () => clearInterval(timer);
  },

  subscribeMessages(
    conversationId: string,
    onUpdate: (messages: Message[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    const fetchMsgs = async () => {
      try {
        const rows = await sql`
          SELECT * FROM messages WHERE conversation_id = ${conversationId} ORDER BY timestamp ASC
        `;
        const mapped: Message[] = rows.map((r) => ({
          id: String(r.id),
          conversationId: String(r.conversation_id),
          sender: (r.sender || 'user') as 'user' | 'admin',
          senderName: String(r.sender_name || ''),
          text: String(r.text || ''),
          timestamp: r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString(),
          read: Boolean(r.read),
        }));
        onUpdate(mapped);
      } catch (err: any) {
        if (onError) onError(err);
      }
    };

    fetchMsgs();
    const timer = setInterval(fetchMsgs, 4000);
    return () => clearInterval(timer);
  },

  async markConversationRead(conversationId: string, isAdminRole: boolean): Promise<void> {
    try {
      if (isAdminRole) {
        await sql`UPDATE conversations SET unread_by_admin = 0 WHERE id = ${conversationId}`;
      } else {
        await sql`UPDATE conversations SET unread_by_user = 0 WHERE id = ${conversationId}`;
      }
    } catch (err) {
      console.warn('Erro ao marcar conversa como lida:', err);
    }
  },

  async sendAdminReply(
    conversationId: string,
    adminNameOrText: string,
    possibleReplyText?: string
  ): Promise<void> {
    try {
      const senderName = possibleReplyText ? adminNameOrText : 'Equipa A.PANZO';
      const replyText = possibleReplyText ? possibleReplyText : adminNameOrText;

      const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await sql`
        INSERT INTO messages (id, conversation_id, sender, sender_name, text, timestamp, read)
        VALUES (${msgId}, ${conversationId}, 'admin', ${senderName}, ${replyText}, NOW(), TRUE)
      `;
      await sql`
        UPDATE conversations SET
          last_message = ${replyText},
          last_message_at = NOW(),
          unread_by_user = unread_by_user + 1
        WHERE id = ${conversationId}
      `;
    } catch (err) {
      console.error('Erro ao enviar resposta do admin:', err);
      throw err;
    }
  },

  async sendClientMessage(
    conversationId: string,
    visitorId: string,
    clientName: string,
    clientPhone: string,
    text: string,
    propertyPayload?: { id: string; title: string }
  ): Promise<void> {
    try {
      await this.saveConversation({
        id: conversationId,
        visitorId,
        clientName,
        clientPhone,
        lastMessage: text,
        lastMessageAt: new Date().toISOString(),
        unreadByAdmin: 1,
        unreadByUser: 0,
        propertyInterestId: propertyPayload?.id,
        propertyTitle: propertyPayload?.title,
        createdAt: new Date().toISOString(),
      });

      await this.saveMessage({
        id: `msg-${Date.now()}`,
        conversationId,
        sender: 'user',
        senderName: clientName,
        text,
        timestamp: new Date().toISOString(),
        read: false,
      });
    } catch (err) {
      console.error('Erro ao enviar mensagem do cliente:', err);
    }
  },

  async saveProperty(property: Property): Promise<string> {
    if (property.id) {
      await this.updateProperty(property.id, property);
      return property.id;
    }
    return this.addProperty(property);
  },

  async uploadBatchPropertyImages(
    files: File[] | FileList,
    onProgress?: (info: UploadProgressInfo) => void
  ): Promise<string[]> {
    const fileArray = Array.isArray(files) ? files : Array.from(files);
    return batchUploadPropertyPhotos(fileArray, onProgress);
  },

  async saveCategory(category: Category): Promise<void> {
    try {
      await sql`
        INSERT INTO categories (id, name, slug, type, icon, order_index, is_active)
        VALUES (
          ${category.id},
          ${category.name},
          ${category.slug},
          ${category.type},
          ${category.icon || null},
          ${category.order || 0},
          ${Boolean(category.isActive)}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          type = EXCLUDED.type,
          icon = EXCLUDED.icon,
          order_index = EXCLUDED.order_index,
          is_active = EXCLUDED.is_active
      `;
    } catch (err) {
      console.error('Erro ao salvar categoria no Neon:', err);
      throw err;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      await sql`DELETE FROM categories WHERE id = ${id}`;
    } catch (err) {
      console.error('Erro ao eliminar categoria no Neon:', err);
      throw err;
    }
  },

  async saveLocation(location: LocationConfig): Promise<void> {
    try {
      await sql`
        INSERT INTO locations (id, province, municipalities, order_index)
        VALUES (
          ${location.id},
          ${location.province},
          ${JSON.stringify(location.municipalities || [])},
          ${location.order || 0}
        )
        ON CONFLICT (id) DO UPDATE SET
          province = EXCLUDED.province,
          municipalities = EXCLUDED.municipalities,
          order_index = EXCLUDED.order_index
      `;
    } catch (err) {
      console.error('Erro ao salvar localização no Neon:', err);
      throw err;
    }
  },

  async deleteLocation(id: string): Promise<void> {
    try {
      await sql`DELETE FROM locations WHERE id = ${id}`;
    } catch (err) {
      console.error('Erro ao eliminar localização no Neon:', err);
      throw err;
    }
  },

  async recordUserLogin(
    uid: string,
    email: string,
    displayName: string,
    photoUrl: string
  ): Promise<void> {
    try {
      await sql`
        INSERT INTO users (uid, email, display_name, photo_url, last_login_at, created_at)
        VALUES (${uid}, ${email}, ${displayName}, ${photoUrl || null}, NOW(), NOW())
        ON CONFLICT (uid) DO UPDATE SET
          email = EXCLUDED.email,
          display_name = EXCLUDED.display_name,
          photo_url = COALESCE(EXCLUDED.photo_url, users.photo_url),
          last_login_at = NOW()
      `;
    } catch (err) {
      console.warn('Erro ao registrar usuário no Neon:', err);
    }
  },
};
