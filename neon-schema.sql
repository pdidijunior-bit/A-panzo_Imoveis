-- ========================================================
-- SCHEMA NEON POSTGRES OFICIAL: A.PANZO IMOBILIÁRIA (Angola)
-- Pode copiar e colar diretamente no SQL Editor do Neon e clicar em "Corre"
-- ========================================================

-- Limpa a tabela de teste padrão do tutorial do Neon (se existir)
DROP TABLE IF EXISTS playing_with_neon;

-- Habilitar extensões úteis no Postgres
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. CATEGORIAS DE IMÓVEIS
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  type VARCHAR(32) NOT NULL DEFAULT 'residential',
  icon VARCHAR(64),
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. LOCALIZAÇÕES (PROVÍNCIAS E MUNICÍPIOS DE ANGOLA)
CREATE TABLE IF NOT EXISTS locations (
  id VARCHAR(64) PRIMARY KEY,
  province VARCHAR(100) NOT NULL UNIQUE,
  municipalities JSONB NOT NULL DEFAULT '[]'::jsonb,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PERFIL DE PARCEIROS E CORRETORES CREDENCIADOS
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
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partners_status ON partners (status);
CREATE INDEX IF NOT EXISTS idx_partners_email ON partners (email);

-- 4. CATÁLOGO PRINCIPAL DE IMÓVEIS
CREATE TABLE IF NOT EXISTS properties (
  id VARCHAR(128) PRIMARY KEY,
  code VARCHAR(40) NOT NULL,
  title VARCHAR(255) NOT NULL,
  deal_type VARCHAR(32) NOT NULL DEFAULT 'venda',
  category VARCHAR(64) NOT NULL,
  category_name VARCHAR(120) NOT NULL,
  price NUMERIC(15, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'AOA',
  is_negotiable BOOLEAN NOT NULL DEFAULT FALSE,
  province VARCHAR(100) NOT NULL,
  municipality VARCHAR(100) NOT NULL,
  neighborhood VARCHAR(120) NOT NULL,
  address_reference VARCHAR(255),
  area NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  bedrooms INT NOT NULL DEFAULT 0,
  bathrooms INT NOT NULL DEFAULT 0,
  parking_spaces INT NOT NULL DEFAULT 0,
  condition VARCHAR(32) NOT NULL DEFAULT 'usado',
  status VARCHAR(32) NOT NULL DEFAULT 'disponivel',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  features JSONB DEFAULT '[]'::jsonb,
  description TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  video_url VARCHAR(500),
  has_video BOOLEAN NOT NULL DEFAULT FALSE,
  views_count INT NOT NULL DEFAULT 0,
  published_by VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_deal_type ON properties (deal_type);
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties (category);
CREATE INDEX IF NOT EXISTS idx_properties_province ON properties (province);
CREATE INDEX IF NOT EXISTS idx_properties_municipality ON properties (municipality);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties (price);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties (is_featured);

-- 5. CONFIGURAÇÕES OFICIAIS DA IMOBILIÁRIA A.PANZO
CREATE TABLE IF NOT EXISTS site_settings (
  id VARCHAR(64) PRIMARY KEY DEFAULT 'default',
  hero_title VARCHAR(255) NOT NULL,
  hero_subtitle TEXT NOT NULL,
  hero_banner_image VARCHAR(500),
  marquee_notice TEXT,
  show_marquee BOOLEAN NOT NULL DEFAULT TRUE,
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
  logo_url VARCHAR(500),
  profile_photo_url VARCHAR(500),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. FAVORITOS DOS CLIENTES
CREATE TABLE IF NOT EXISTS favorites (
  id VARCHAR(150) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  property_id VARCHAR(128) NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_property UNIQUE (user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites (user_id);

-- 7. ALERTAS DE IMÓVEIS (RADAR)
CREATE TABLE IF NOT EXISTS property_alerts (
  id VARCHAR(128) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  name VARCHAR(150) NOT NULL,
  deal_type VARCHAR(32) NOT NULL DEFAULT 'todos',
  category VARCHAR(64) NOT NULL DEFAULT '',
  province VARCHAR(100) NOT NULL DEFAULT '',
  municipality VARCHAR(100) NOT NULL DEFAULT '',
  bedrooms VARCHAR(20) NOT NULL DEFAULT 'todos',
  min_price NUMERIC(15, 2),
  max_price NUMERIC(15, 2),
  keyword VARCHAR(120),
  notify_channel VARCHAR(32) NOT NULL DEFAULT 'whatsapp',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user ON property_alerts (user_id);

-- 8. NOTIFICAÇÕES DE ALERTAS
CREATE TABLE IF NOT EXISTS alert_notifications (
  id VARCHAR(160) PRIMARY KEY,
  user_id VARCHAR(128) NOT NULL,
  alert_id VARCHAR(128) NOT NULL,
  alert_name VARCHAR(150) NOT NULL,
  property_id VARCHAR(128) NOT NULL,
  property_title VARCHAR(255) NOT NULL,
  property_code VARCHAR(40),
  property_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
  property_image TEXT,
  deal_type VARCHAR(32) NOT NULL DEFAULT 'venda',
  location VARCHAR(200),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_notif_user ON alert_notifications (user_id);

-- 9. CHAT DE ATENDIMENTO
CREATE TABLE IF NOT EXISTS conversations (
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(128) PRIMARY KEY,
  conversation_id VARCHAR(128) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender VARCHAR(32) NOT NULL,
  sender_name VARCHAR(150) NOT NULL,
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id);

-- 10. USUÁRIOS E ADMINISTRADORES
CREATE TABLE IF NOT EXISTS users (
  uid VARCHAR(128) PRIMARY KEY,
  display_name VARCHAR(150),
  email VARCHAR(160),
  photo_url TEXT,
  role VARCHAR(32) DEFAULT 'client',
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(128) PRIMARY KEY,
  email VARCHAR(160) NOT NULL UNIQUE,
  role VARCHAR(32) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INSERÇÃO DE DADOS INICIAIS DA A.PANZO
INSERT INTO admins (id, email, role)
VALUES ('admin_primary', 'anoterlove132@gmail.com', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO site_settings (
  id, hero_title, hero_subtitle, phone, whatsapp, email, address, working_hours, logo_url
) VALUES (
  'default',
  'Encontre o Seu Imóvel de Sonho em Angola',
  'Apartamentos, vivendas e terrenos em Luanda e em todo o país com a segurança e idoneidade da A.PANZO.',
  '+244 925 883 080',
  '+244 925 883 080',
  'comercial@anpanzo.com',
  'Luanda, Angola',
  'Segunda a Sábado das 08h00 às 18h00',
  '/panzo-logo.jpeg'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Confirmação rápida
SELECT 'Base de dados A.PANZO configurada com sucesso no Neon!' AS status;
