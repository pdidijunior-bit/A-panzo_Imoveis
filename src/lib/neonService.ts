import { getNeonSql, isNeonConfigured } from './neonClient';
import {
  Property,
  Category,
  LocationConfig,
  SiteSettings,
  Conversation,
  Message,
  Favorite,
  PropertyAlert,
  PartnerProfile,
  DealType,
} from '../types';
import { DEFAULT_CATEGORIES, ANGOLA_LOCATIONS, DEFAULT_SITE_SETTINGS } from './defaultData';
import { normalizeCurrency } from './formatters';

/**
 * Cria todas as tabelas necessárias no Neon Postgres caso ainda não existam.
 */
export async function initNeonTables(): Promise<void> {
  const sql = getNeonSql();
  if (!sql) return;

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        slug VARCHAR(120) NOT NULL UNIQUE,
        type VARCHAR(32) NOT NULL DEFAULT 'residential',
        icon VARCHAR(64),
        order_index INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS locations (
        id VARCHAR(64) PRIMARY KEY,
        province VARCHAR(100) NOT NULL UNIQUE,
        municipalities JSONB NOT NULL DEFAULT '[]'::jsonb,
        order_index INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS partners (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        company_name VARCHAR(180) NOT NULL,
        nif VARCHAR(60) NOT NULL,
        technical_responsible VARCHAR(140) NOT NULL,
        email VARCHAR(160) NOT NULL,
        phone VARCHAR(60) NOT NULL,
        address TEXT NOT NULL,
        province VARCHAR(100),
        municipality VARCHAR(100),
        validation_documents TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS properties (
        id VARCHAR(128) PRIMARY KEY,
        code VARCHAR(40) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        deal_type VARCHAR(32) NOT NULL DEFAULT 'venda',
        category VARCHAR(64) NOT NULL,
        category_name VARCHAR(120) NOT NULL,
        price NUMERIC(15, 2) NOT NULL DEFAULT 0,
        currency VARCHAR(10) NOT NULL DEFAULT 'AOA',
        is_negotiable BOOLEAN NOT NULL DEFAULT false,
        province VARCHAR(100) NOT NULL,
        municipality VARCHAR(100) NOT NULL,
        neighborhood VARCHAR(120) NOT NULL,
        address_reference VARCHAR(255),
        area NUMERIC(10, 2) NOT NULL DEFAULT 0,
        bedrooms INT NOT NULL DEFAULT 0,
        bathrooms INT NOT NULL DEFAULT 0,
        parking_spaces INT NOT NULL DEFAULT 0,
        property_condition VARCHAR(32) NOT NULL DEFAULT 'usado',
        status VARCHAR(32) NOT NULL DEFAULT 'disponivel',
        is_featured BOOLEAN NOT NULL DEFAULT false,
        features JSONB NOT NULL DEFAULT '[]'::jsonb,
        description TEXT NOT NULL DEFAULT '',
        images JSONB NOT NULL DEFAULT '[]'::jsonb,
        video_url TEXT,
        views_count INT NOT NULL DEFAULT 0,
        published_by VARCHAR(128),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        id VARCHAR(64) PRIMARY KEY DEFAULT 'general',
        hero_title VARCHAR(255) NOT NULL,
        hero_subtitle TEXT NOT NULL,
        hero_banner_image TEXT,
        marquee_notice TEXT,
        show_marquee BOOLEAN NOT NULL DEFAULT true,
        about_story TEXT,
        about_mission TEXT,
        about_vision TEXT,
        about_values JSONB DEFAULT '[]'::jsonb,
        services_list JSONB DEFAULT '[]'::jsonb,
        phone VARCHAR(50) NOT NULL,
        phone2 VARCHAR(50),
        phone3 VARCHAR(50),
        whatsapp VARCHAR(50) NOT NULL,
        email VARCHAR(150) NOT NULL,
        email2 VARCHAR(150),
        website VARCHAR(150),
        instagram VARCHAR(150),
        facebook VARCHAR(150),
        address TEXT NOT NULL,
        working_hours VARCHAR(150) NOT NULL,
        logo_url TEXT,
        profile_photo_url TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS favorites (
        id VARCHAR(150) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        property_id VARCHAR(128) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT unique_user_fav UNIQUE (user_id, property_id)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS property_alerts (
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(128) NOT NULL,
        name VARCHAR(150) NOT NULL,
        deal_type VARCHAR(32) NOT NULL DEFAULT 'todos',
        category VARCHAR(64) NOT NULL DEFAULT '',
        category_name VARCHAR(120),
        province VARCHAR(100) NOT NULL DEFAULT '',
        municipality VARCHAR(100) NOT NULL DEFAULT '',
        bedrooms VARCHAR(20) NOT NULL DEFAULT 'todos',
        min_price NUMERIC(15, 2),
        max_price NUMERIC(15, 2),
        keyword VARCHAR(120) DEFAULT '',
        notify_channel VARCHAR(20) NOT NULL DEFAULT 'whatsapp',
        active BOOLEAN NOT NULL DEFAULT true,
        last_notified_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id VARCHAR(128) PRIMARY KEY,
        visitor_id VARCHAR(128) NOT NULL,
        client_name VARCHAR(150) NOT NULL,
        client_phone VARCHAR(60),
        last_message TEXT,
        last_message_at TIMESTAMPTZ DEFAULT NOW(),
        unread_by_admin INT NOT NULL DEFAULT 0,
        unread_by_user INT NOT NULL DEFAULT 0,
        property_interest_id VARCHAR(128),
        property_title VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(128) PRIMARY KEY,
        conversation_id VARCHAR(128) NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
        sender VARCHAR(20) NOT NULL,
        sender_name VARCHAR(150) NOT NULL,
        text TEXT NOT NULL,
        read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Seed inicial seguro
    await seedInitialDataIfEmpty();
  } catch (err) {
    console.warn('Aviso ao inicializar tabelas Neon:', err);
  }
}

async function seedInitialDataIfEmpty(): Promise<void> {
  const sql = getNeonSql();
  if (!sql) return;

  try {
    const categoriesCount = await sql`SELECT count(*)::int as c FROM categories;`;
    if (categoriesCount[0]?.c === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await sql`
          INSERT INTO categories (id, name, slug, type, icon, order_index, is_active)
          VALUES (${cat.id}, ${cat.name}, ${cat.slug}, ${cat.type}, ${cat.icon || null}, ${cat.order}, ${cat.isActive})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    const locationsCount = await sql`SELECT count(*)::int as c FROM locations;`;
    if (locationsCount[0]?.c === 0) {
      for (const loc of ANGOLA_LOCATIONS) {
        await sql`
          INSERT INTO locations (id, province, municipalities, order_index)
          VALUES (${loc.id}, ${loc.province}, ${JSON.stringify(loc.municipalities)}::jsonb, ${loc.order})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    const settingsCount = await sql`SELECT count(*)::int as c FROM site_settings WHERE id = 'general';`;
    if (settingsCount[0]?.c === 0) {
      const s = DEFAULT_SITE_SETTINGS;
      await sql`
        INSERT INTO site_settings (
          id, hero_title, hero_subtitle, marquee_notice, show_marquee,
          phone, whatsapp, email, address, working_hours, logo_url
        ) VALUES (
          'general', ${s.heroTitle}, ${s.heroSubtitle}, ${s.marqueeNotice}, ${s.showMarquee},
          ${s.phone}, ${s.whatsapp}, ${s.email}, ${s.address}, ${s.workingHours}, ${s.logoUrl || '/panzo-logo.jpeg'}
        ) ON CONFLICT (id) DO NOTHING;
      `;
    }
  } catch (e) {
    console.warn('Erro ao inserir seed no Neon:', e);
  }
}

function mapRowToProperty(row: any): Property {
  const currency = normalizeCurrency(row.currency);
  const rawDeal = row.deal_type;
  const dealType: DealType =
    rawDeal === 'venda' || rawDeal === 'arrendamento' || rawDeal === 'trespasse'
      ? rawDeal
      : 'venda';

  return {
    id: String(row.id),
    title: row.title || 'Imóvel sem título',
    code: row.code || `APZ-${String(row.id).slice(-4).toUpperCase()}`,
    dealType,
    category: row.category || 'apartamento',
    categoryName: row.category_name || 'Apartamento',
    price: Number(row.price) || 0,
    currency: currency as any,
    isNegotiable: Boolean(row.is_negotiable),
    province: row.province || 'Luanda',
    municipality: row.municipality || 'Luanda',
    neighborhood: row.neighborhood || '',
    addressReference: row.address_reference || '',
    area: Number(row.area) || 0,
    bedrooms: Number(row.bedrooms) || 0,
    bathrooms: Number(row.bathrooms) || 0,
    parkingSpaces: Number(row.parking_spaces) || 0,
    features: Array.isArray(row.features) ? row.features : [],
    description: row.description || '',
    condition: row.property_condition || 'usado',
    status: row.status || 'disponivel',
    isFeatured: Boolean(row.is_featured),
    images: Array.isArray(row.images) ? row.images : [],
    videoUrl: row.video_url || null,
    viewsCount: Number(row.views_count) || 0,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
    publishedBy: row.published_by || '',
  };
}

export const neonService = {
  // --- PROPERTIES ---
  async getProperties(): Promise<Property[]> {
    const sql = getNeonSql();
    if (!sql) return [];
    try {
      const rows = await sql`
        SELECT * FROM properties 
        ORDER BY created_at DESC;
      `;
      return rows.map(mapRowToProperty);
    } catch (err) {
      console.error('Neon: Erro ao buscar imóveis:', err);
      return [];
    }
  },

  subscribeProperties(
    callback: (properties: Property[]) => void,
    onError?: (err: any) => void
  ): () => void {
    let isCancelled = false;

    const fetchAndPush = async () => {
      if (isCancelled) return;
      try {
        const items = await this.getProperties();
        if (!isCancelled) callback(items);
      } catch (err) {
        if (!isCancelled && onError) onError(err);
      }
    };

    fetchAndPush();
    // Polling adaptativo suave (a cada 6s) para o plano gratuito sem consumir cotas
    const intervalId = setInterval(fetchAndPush, 6000);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  },

  async saveProperty(p: Property): Promise<void> {
    const sql = getNeonSql();
    if (!sql) throw new Error('Neon não configurado');

    await sql`
      INSERT INTO properties (
        id, code, title, deal_type, category, category_name, price, currency,
        is_negotiable, province, municipality, neighborhood, address_reference,
        area, bedrooms, bathrooms, parking_spaces, property_condition, status,
        is_featured, features, description, images, video_url, views_count,
        published_by, updated_at
      ) VALUES (
        ${p.id}, ${p.code}, ${p.title}, ${p.dealType}, ${p.category}, ${p.categoryName},
        ${p.price}, ${p.currency}, ${p.isNegotiable}, ${p.province}, ${p.municipality},
        ${p.neighborhood}, ${p.addressReference || null}, ${p.area}, ${p.bedrooms},
        ${p.bathrooms}, ${p.parkingSpaces}, ${p.condition}, ${p.status}, ${p.isFeatured},
        ${JSON.stringify(p.features || [])}::jsonb, ${p.description},
        ${JSON.stringify(p.images || [])}::jsonb, ${p.videoUrl || null},
        ${p.viewsCount || 0}, ${p.publishedBy || null}, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        code = EXCLUDED.code,
        title = EXCLUDED.title,
        deal_type = EXCLUDED.deal_type,
        category = EXCLUDED.category,
        category_name = EXCLUDED.category_name,
        price = EXCLUDED.price,
        currency = EXCLUDED.currency,
        is_negotiable = EXCLUDED.is_negotiable,
        province = EXCLUDED.province,
        municipality = EXCLUDED.municipality,
        neighborhood = EXCLUDED.neighborhood,
        address_reference = EXCLUDED.address_reference,
        area = EXCLUDED.area,
        bedrooms = EXCLUDED.bedrooms,
        bathrooms = EXCLUDED.bathrooms,
        parking_spaces = EXCLUDED.parking_spaces,
        property_condition = EXCLUDED.property_condition,
        status = EXCLUDED.status,
        is_featured = EXCLUDED.is_featured,
        features = EXCLUDED.features,
        description = EXCLUDED.description,
        images = EXCLUDED.images,
        video_url = EXCLUDED.video_url,
        published_by = EXCLUDED.published_by,
        updated_at = NOW();
    `;
  },

  async deleteProperty(id: string): Promise<void> {
    const sql = getNeonSql();
    if (!sql) return;
    await sql`DELETE FROM properties WHERE id = ${id};`;
  },

  async updatePropertyStatus(id: string, status: Property['status']): Promise<void> {
    const sql = getNeonSql();
    if (!sql) return;
    await sql`
      UPDATE properties 
      SET status = ${status}, updated_at = NOW() 
      WHERE id = ${id};
    `;
  },

  async incrementViews(id: string): Promise<void> {
    const sql = getNeonSql();
    if (!sql) return;
    try {
      await sql`
        UPDATE properties 
        SET views_count = views_count + 1 
        WHERE id = ${id};
      `;
    } catch {}
  },

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    const sql = getNeonSql();
    if (!sql) return DEFAULT_CATEGORIES;
    try {
      const rows = await sql`SELECT * FROM categories ORDER BY order_index ASC;`;
      if (rows.length === 0) return DEFAULT_CATEGORIES;
      return rows.map((r: any) => ({
        id: String(r.id),
        name: r.name,
        slug: r.slug,
        type: r.type,
        icon: r.icon || undefined,
        order: Number(r.order_index) || 0,
        isActive: Boolean(r.is_active),
      }));
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  async saveCategory(c: Category): Promise<void> {
    const sql = getNeonSql();
    if (!sql) return;
    await sql`
      INSERT INTO categories (id, name, slug, type, icon, order_index, is_active)
      VALUES (${c.id}, ${c.name}, ${c.slug}, ${c.type}, ${c.icon || null}, ${c.order}, ${c.isActive})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        type = EXCLUDED.type,
        icon = EXCLUDED.icon,
        order_index = EXCLUDED.order_index,
        is_active = EXCLUDED.is_active;
    `;
  },

  async deleteCategory(id: string): Promise<void> {
    const sql = getNeonSql();
    if (!sql) return;
    await sql`DELETE FROM categories WHERE id = ${id};`;
  },

  // --- LOCATIONS ---
  async getLocations(): Promise<LocationConfig[]> {
    const sql = getNeonSql();
    if (!sql) return ANGOLA_LOCATIONS;
    try {
      const rows = await sql`SELECT * FROM locations ORDER BY order_index ASC;`;
      if (rows.length === 0) return ANGOLA_LOCATIONS;
      return rows.map((r: any) => ({
        id: String(r.id),
        province: r.province,
        municipalities: Array.isArray(r.municipalities) ? r.municipalities : [],
        order: Number(r.order_index) || 0,
      }));
    } catch {
      return ANGOLA_LOCATIONS;
    }
  },

  async saveLocation(l: LocationConfig): Promise<void> {
    const sql = getNeonSql();
    if (!sql) return;
    await sql`
      INSERT INTO locations (id, province, municipalities, order_index)
      VALUES (${l.id}, ${l.province}, ${JSON.stringify(l.municipalities)}::jsonb, ${l.order})
      ON CONFLICT (id) DO UPDATE SET
        province = EXCLUDED.province,
        municipalities = EXCLUDED.municipalities,
        order_index = EXCLUDED.order_index;
    `;
  },

  async deleteLocation(id: string): Promise<void> {
    const sql = getNeonSql();
    if (!sql) return;
    await sql`DELETE FROM locations WHERE id = ${id};`;
  },

  // --- SITE SETTINGS ---
  async getSiteSettings(): Promise<SiteSettings> {
    const sql = getNeonSql();
    if (!sql) return DEFAULT_SITE_SETTINGS;
    try {
      const rows = await sql`SELECT * FROM site_settings WHERE id = 'general' LIMIT 1;`;
      if (rows.length === 0) return DEFAULT_SITE_SETTINGS;
      const r = rows[0];
      return {
        id: r.id,
        heroTitle: r.hero_title || DEFAULT_SITE_SETTINGS.heroTitle,
        heroSubtitle: r.hero_subtitle || DEFAULT_SITE_SETTINGS.heroSubtitle,
        heroBannerImage: r.hero_banner_image || undefined,
        marqueeNotice: r.marquee_notice || DEFAULT_SITE_SETTINGS.marqueeNotice,
        showMarquee: Boolean(r.show_marquee),
        aboutStory: r.about_story || DEFAULT_SITE_SETTINGS.aboutStory,
        aboutMission: r.about_mission || DEFAULT_SITE_SETTINGS.aboutMission,
        aboutVision: r.about_vision || DEFAULT_SITE_SETTINGS.aboutVision,
        aboutValues: Array.isArray(r.about_values) ? r.about_values : DEFAULT_SITE_SETTINGS.aboutValues,
        servicesList: Array.isArray(r.services_list) ? r.services_list : DEFAULT_SITE_SETTINGS.servicesList,
        phone: r.phone || DEFAULT_SITE_SETTINGS.phone,
        phone2: r.phone2 || undefined,
        phone3: r.phone3 || undefined,
        whatsapp: r.whatsapp || DEFAULT_SITE_SETTINGS.whatsapp,
        email: r.email || DEFAULT_SITE_SETTINGS.email,
        email2: r.email2 || undefined,
        website: r.website || undefined,
        instagram: r.instagram || undefined,
        facebook: r.facebook || undefined,
        address: r.address || DEFAULT_SITE_SETTINGS.address,
        workingHours: r.working_hours || DEFAULT_SITE_SETTINGS.workingHours,
        logoUrl: r.logo_url || '/panzo-logo.jpeg',
        profilePhotoUrl: r.profile_photo_url || undefined,
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      };
    } catch {
      return DEFAULT_SITE_SETTINGS;
    }
  },

  async saveSiteSettings(s: SiteSettings): Promise<void> {
    const sql = getNeonSql();
    if (!sql) return;
    await sql`
      INSERT INTO site_settings (
        id, hero_title, hero_subtitle, hero_banner_image, marquee_notice,
        show_marquee, about_story, about_mission, about_vision, about_values,
        services_list, phone, phone2, phone3, whatsapp, email, email2, website,
        instagram, facebook, address, working_hours, logo_url, profile_photo_url, updated_at
      ) VALUES (
        'general', ${s.heroTitle}, ${s.heroSubtitle}, ${s.heroBannerImage || null},
        ${s.marqueeNotice}, ${s.showMarquee}, ${s.aboutStory || null},
        ${s.aboutMission || null}, ${s.aboutVision || null},
        ${JSON.stringify(s.aboutValues || [])}::jsonb,
        ${JSON.stringify(s.servicesList || [])}::jsonb,
        ${s.phone}, ${s.phone2 || null}, ${s.phone3 || null}, ${s.whatsapp},
        ${s.email}, ${s.email2 || null}, ${s.website || null},
        ${s.instagram || null}, ${s.facebook || null}, ${s.address},
        ${s.workingHours}, ${s.logoUrl || null}, ${s.profilePhotoUrl || null}, NOW()
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
        updated_at = NOW();
    `;
  },

  // --- PARTNERS ---
  async getPartners(): Promise<PartnerProfile[]> {
    const sql = getNeonSql();
    if (!sql) return [];
    try {
      const rows = await sql`SELECT * FROM partners ORDER BY created_at DESC;`;
      return rows.map((r: any) => ({
        id: String(r.id),
        userId: r.user_id,
        companyName: r.company_name,
        nif: r.nif,
        technicalResponsible: r.technical_responsible,
        email: r.email,
        phone: r.phone,
        address: r.address,
        province: r.province || undefined,
        municipality: r.municipality || undefined,
        validationDocuments: r.validation_documents || '',
        status: r.status as any,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },

  async savePartner(partner: PartnerProfile): Promise<void> {
    const sql = getNeonSql();
    if (!sql) return;
    await sql`
      INSERT INTO partners (
        id, user_id, company_name, nif, technical_responsible,
        email, phone, address, province, municipality, validation_documents, status, updated_at
      ) VALUES (
        ${partner.id}, ${partner.userId}, ${partner.companyName}, ${partner.nif},
        ${partner.technicalResponsible}, ${partner.email}, ${partner.phone},
        ${partner.address}, ${partner.province || null}, ${partner.municipality || null},
        ${partner.validationDocuments || null}, ${partner.status}, NOW()
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
        updated_at = NOW();
    `;
  },

  async updatePartnerStatus(id: string, status: PartnerProfile['status']): Promise<void> {
    const sql = getNeonSql();
    if (!sql) return;
    await sql`UPDATE partners SET status = ${status}, updated_at = NOW() WHERE id = ${id};`;
  },

  // --- FAVORITES ---
  subscribeFavorites(userId: string, callback: (favorites: Favorite[]) => void): () => void {
    let isCancelled = false;
    const fetchFavs = async () => {
      if (isCancelled || !userId) return;
      const sql = getNeonSql();
      if (!sql) return;
      try {
        const rows = await sql`
          SELECT * FROM favorites WHERE user_id = ${userId} ORDER BY created_at DESC;
        `;
        if (!isCancelled) {
          callback(
            rows.map((r: any) => ({
              id: String(r.id),
              userId: r.user_id,
              propertyId: r.property_id,
              createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
            }))
          );
        }
      } catch {}
    };

    fetchFavs();
    const intervalId = setInterval(fetchFavs, 8000);
    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  },

  async toggleFavorite(userId: string, propertyId: string): Promise<boolean> {
    const sql = getNeonSql();
    if (!sql) return false;
    const id = `${userId}_${propertyId}`;
    try {
      const existing = await sql`SELECT id FROM favorites WHERE user_id = ${userId} AND property_id = ${propertyId};`;
      if (existing.length > 0) {
        await sql`DELETE FROM favorites WHERE id = ${id};`;
        return false;
      } else {
        await sql`
          INSERT INTO favorites (id, user_id, property_id) 
          VALUES (${id}, ${userId}, ${propertyId})
          ON CONFLICT (id) DO NOTHING;
        `;
        return true;
      }
    } catch {
      return false;
    }
  },

  // --- PROPERTY ALERTS ---
  subscribeAlerts(userId: string, callback: (alerts: PropertyAlert[]) => void): () => void {
    let isCancelled = false;
    const fetchAlerts = async () => {
      if (isCancelled || !userId) return;
      const sql = getNeonSql();
      if (!sql) return;
      try {
        const rows = await sql`
          SELECT * FROM property_alerts WHERE user_id = ${userId} ORDER BY created_at DESC;
        `;
        if (!isCancelled) {
          callback(
            rows.map((r: any) => ({
              id: String(r.id),
              userId: r.user_id,
              name: r.name,
              dealType: r.deal_type,
              category: r.category,
              categoryName: r.category_name,
              province: r.province,
              municipality: r.municipality,
              bedrooms: r.bedrooms,
              minPrice: r.min_price ? Number(r.min_price) : '',
              maxPrice: r.max_price ? Number(r.max_price) : '',
              keyword: r.keyword || '',
              notifyChannel: r.notify_channel,
              active: Boolean(r.active),
              createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
              lastNotifiedAt: r.last_notified_at ? new Date(r.last_notified_at).toISOString() : undefined,
            }))
          );
        }
      } catch {}
    };

    fetchAlerts();
    const intervalId = setInterval(fetchAlerts, 8000);
    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  },

  async saveAlert(a: PropertyAlert): Promise<void> {
    const sql = getNeonSql();
    if (!sql) return;
    await sql`
      INSERT INTO property_alerts (
        id, user_id, name, deal_type, category, category_name, province,
        municipality, bedrooms, min_price, max_price, keyword, notify_channel, active
      ) VALUES (
        ${a.id}, ${a.userId}, ${a.name}, ${a.dealType}, ${a.category}, ${a.categoryName || null},
        ${a.province}, ${a.municipality}, ${a.bedrooms}, ${a.minPrice ? Number(a.minPrice) : null},
        ${a.maxPrice ? Number(a.maxPrice) : null}, ${a.keyword || ''}, ${a.notifyChannel}, ${a.active}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        deal_type = EXCLUDED.deal_type,
        category = EXCLUDED.category,
        category_name = EXCLUDED.category_name,
        province = EXCLUDED.province,
        municipality = EXCLUDED.municipality,
        bedrooms = EXCLUDED.bedrooms,
        min_price = EXCLUDED.min_price,
        max_price = EXCLUDED.max_price,
        keyword = EXCLUDED.keyword,
        notify_channel = EXCLUDED.notify_channel,
        active = EXCLUDED.active;
    `;
  },

  async deleteAlert(id: string): Promise<void> {
    const sql = getNeonSql();
    if (!sql) return;
    await sql`DELETE FROM property_alerts WHERE id = ${id};`;
  },

  // --- REAL-TIME CHAT ---
  subscribeConversations(callback: (conversations: Conversation[]) => void): () => void {
    let isCancelled = false;
    const fetchConvs = async () => {
      if (isCancelled) return;
      const sql = getNeonSql();
      if (!sql) return;
      try {
        const rows = await sql`
          SELECT * FROM chat_conversations ORDER BY last_message_at DESC;
        `;
        if (!isCancelled) {
          callback(
            rows.map((r: any) => ({
              id: String(r.id),
              visitorId: r.visitor_id,
              clientName: r.client_name,
              clientPhone: r.client_phone || undefined,
              lastMessage: r.last_message || '',
              lastMessageAt: r.last_message_at ? new Date(r.last_message_at).toISOString() : new Date().toISOString(),
              unreadByAdmin: Number(r.unread_by_admin) || 0,
              unreadByUser: Number(r.unread_by_user) || 0,
              propertyInterestId: r.property_interest_id || undefined,
              propertyTitle: r.property_title || undefined,
              createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
            }))
          );
        }
      } catch {}
    };

    fetchConvs();
    const intervalId = setInterval(fetchConvs, 4000);
    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  },

  subscribeMessages(conversationId: string, callback: (messages: Message[]) => void): () => void {
    let isCancelled = false;
    const fetchMsgs = async () => {
      if (isCancelled || !conversationId) return;
      const sql = getNeonSql();
      if (!sql) return;
      try {
        const rows = await sql`
          SELECT * FROM chat_messages 
          WHERE conversation_id = ${conversationId} 
          ORDER BY created_at ASC;
        `;
        if (!isCancelled) {
          callback(
            rows.map((r: any) => ({
              id: String(r.id),
              conversationId: r.conversation_id,
              sender: r.sender as any,
              senderName: r.sender_name,
              text: r.text,
              timestamp: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
              read: Boolean(r.read),
            }))
          );
        }
      } catch {}
    };

    fetchMsgs();
    const intervalId = setInterval(fetchMsgs, 3000);
    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  },

  async sendMessage(conversationId: string, message: Message): Promise<void> {
    const sql = getNeonSql();
    if (!sql) return;
    await sql`
      INSERT INTO chat_messages (id, conversation_id, sender, sender_name, text, read)
      VALUES (${message.id}, ${conversationId}, ${message.sender}, ${message.senderName}, ${message.text}, ${message.read});
    `;

    await sql`
      UPDATE chat_conversations 
      SET last_message = ${message.text}, last_message_at = NOW() 
      WHERE id = ${conversationId};
    `;
  },

  async markConversationRead(conversationId: string, role: 'user' | 'admin'): Promise<void> {
    const sql = getNeonSql();
    if (!sql) return;
    if (role === 'admin') {
      await sql`UPDATE chat_conversations SET unread_by_admin = 0 WHERE id = ${conversationId};`;
    } else {
      await sql`UPDATE chat_conversations SET unread_by_user = 0 WHERE id = ${conversationId};`;
    }
  },
};
