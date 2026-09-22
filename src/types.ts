export type DealType = 'venda' | 'arrendamento' | 'trespasse';

export type PropertyCondition = 'novo' | 'usado' | 'em_construcao' | 'remodelado';

export type PropertyStatus = 'disponivel' | 'reservado' | 'vendido' | 'arrendado';

export interface Property {
  id: string;
  title: string;
  code: string;
  dealType: DealType;
  category: string;
  categoryName: string;
  price: number;
  currency: 'AOA' | 'USD';
  isNegotiable: boolean;
  province: string;
  municipality: string;
  neighborhood: string;
  addressReference?: string;
  area: number; // in m2
  bedrooms: number; // 0 for commercial/land, 1-5+ for residential
  bathrooms: number;
  parkingSpaces: number;
  features: string[];
  description: string;
  condition: PropertyCondition;
  status: PropertyStatus;
  isFeatured: boolean;
  images: string[];
  videoUrl?: string | null;
  hasVideo?: boolean;
  viewsCount?: number;
  createdAt: string;
  updatedAt: string;
  publishedBy?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'residential' | 'commercial' | 'land' | 'service';
  icon?: string;
  order: number;
  isActive: boolean;
}

export interface LocationConfig {
  id: string;
  province: string;
  municipalities: string[];
  order: number;
}

export interface SiteSettings {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBannerImage?: string;
  marqueeNotice: string;
  showMarquee: boolean;
  aboutStory: string;
  aboutMission: string;
  aboutVision: string;
  aboutValues: string[];
  servicesList: { title: string; description: string; icon: string }[];
  phone: string;
  phone2?: string;
  phone3?: string;
  whatsapp: string;
  email: string;
  email2?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  address: string;
  workingHours: string;
  logoUrl?: string;
  profilePhotoUrl?: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  visitorId: string;
  clientName: string;
  clientPhone?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadByAdmin: number;
  unreadByUser: number;
  propertyInterestId?: string;
  propertyTitle?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'admin';
  senderName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Favorite {
  id: string; // `${userId}_${propertyId}`
  userId: string;
  propertyId: string;
  createdAt: string;
}

export interface PropertyAlert {
  id: string;
  userId: string;
  name: string;
  dealType: 'todos' | DealType;
  category: string;
  categoryName?: string;
  province: string;
  municipality: string;
  bedrooms: string; // 'todos', '1', '2', '3', '4', '5+'
  minPrice: number | '';
  maxPrice: number | '';
  keyword: string;
  notifyChannel: 'app' | 'whatsapp' | 'email';
  active: boolean;
  createdAt: string;
  lastNotifiedAt?: string;
}

export interface AlertNotification {
  id: string;
  userId: string;
  alertId: string;
  alertName: string;
  propertyId: string;
  propertyTitle: string;
  propertyCode?: string;
  propertyPrice: number;
  propertyImage?: string;
  dealType: DealType;
  location: string;
  read: boolean;
  createdAt: string;
}

export interface FilterState {
  keyword: string;
  dealType: 'todos' | DealType;
  category: string;
  province: string;
  municipality: string;
  minPrice: number | '';
  maxPrice: number | '';
  bedrooms: string; // 'todos', '1', '2', '3', '4', '5+'
  bathrooms: string;
  sortBy: 'recent' | 'price_asc' | 'price_desc' | 'area_desc';
}
