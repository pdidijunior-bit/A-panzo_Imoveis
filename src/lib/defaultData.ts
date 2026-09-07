import { Category, LocationConfig, SiteSettings } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-casas-t1', name: 'Casas T1', slug: 'casas-t1', type: 'residential', icon: 'Home', order: 1, isActive: true },
  { id: 'cat-casas-t2', name: 'Casas T2', slug: 'casas-t2', type: 'residential', icon: 'Home', order: 2, isActive: true },
  { id: 'cat-casas-t3', name: 'Casas T3', slug: 'casas-t3', type: 'residential', icon: 'Home', order: 3, isActive: true },
  { id: 'cat-casas-t4', name: 'Casas T4', slug: 'casas-t4', type: 'residential', icon: 'Home', order: 4, isActive: true },
  { id: 'cat-casas-t4-plus', name: 'Casas T4+ e Superiores', slug: 'casas-t4-plus', type: 'residential', icon: 'Home', order: 5, isActive: true },
  { id: 'cat-apartamentos', name: 'Apartamentos', slug: 'apartamentos', type: 'residential', icon: 'Building2', order: 6, isActive: true },
  { id: 'cat-vivendas', name: 'Vivendas', slug: 'vivendas', type: 'residential', icon: 'Castle', order: 7, isActive: true },
  { id: 'cat-terrenos', name: 'Terrenos', slug: 'terrenos', type: 'land', icon: 'Trees', order: 8, isActive: true },
  { id: 'cat-espacos-comerciais', name: 'Espaços Comerciais', slug: 'espacos-comerciais', type: 'commercial', icon: 'Store', order: 9, isActive: true },
  { id: 'cat-escritorios', name: 'Escritórios', slug: 'escritorios', type: 'commercial', icon: 'Briefcase', order: 10, isActive: true },
  { id: 'cat-empreendimentos', name: 'Empreendimentos', slug: 'empreendimentos', type: 'residential', icon: 'Building', order: 11, isActive: true },
  { id: 'cat-servicos-imobiliarios', name: 'Serviços Imobiliários', slug: 'servicos-imobiliarios', type: 'service', icon: 'FileText', order: 12, isActive: true },
];

export const ANGOLA_LOCATIONS: LocationConfig[] = [
  {
    id: 'loc-luanda',
    province: 'Luanda',
    order: 1,
    municipalities: [
      'Luanda (Ingombota)',
      'Talatona',
      'Belas',
      'Maianga',
      'Kilamba Kiaxi',
      'Viana',
      'Cacuaco',
      'Cazenga',
      'Icolo e Bengo',
      'Quiçama',
    ],
  },
  {
    id: 'loc-malanje',
    province: 'Malanje',
    order: 2,
    municipalities: [
      'Malanje (Sede)',
      'Calandula',
      'Cangandala',
      'Cacuso',
      'Kiwaba Nzoji',
      'Massango',
      'Marimba',
      'Mucari',
      'Quela',
    ],
  },
  {
    id: 'loc-benguela',
    province: 'Benguela',
    order: 3,
    municipalities: ['Benguela', 'Lobito', 'Catumbela', 'Baía Farta', 'Ganda'],
  },
  {
    id: 'loc-huila',
    province: 'Huíla',
    order: 4,
    municipalities: ['Lubango', 'Humpata', 'Chibia', 'Matala'],
  },
  {
    id: 'loc-huambo',
    province: 'Huambo',
    order: 5,
    municipalities: ['Huambo', 'Caála', 'Bailundo'],
  },
  {
    id: 'loc-cabinda',
    province: 'Cabinda',
    order: 6,
    municipalities: ['Cabinda', 'Cacongo', 'Buco-Zau'],
  },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'general',
  heroTitle: 'Aliança Imobiliária: O Seu Parceiro de Confiança em Angola',
  heroSubtitle: 'Conectamos pessoas e empresas aos melhores imóveis em Luanda, Malanje e em todo o território nacional.',
  marqueeNotice: 'Novas oportunidades imobiliárias em Luanda e Malanje • Fale connosco pelo WhatsApp: +244 935973494',
  showMarquee: true,
  aboutStory: 'A Aliança Imobiliária nasceu com o compromisso de transformar a experiência imobiliária em Angola, oferecendo transparência, rigor e segurança jurídica em cada transação. Actuamos com excelência no mercado residencial, comercial e corporativo em Luanda, Malanje e demais províncias.',
  aboutMission: 'Proporcionar soluções imobiliárias completas com integridade, segurança jurídica e excelência no atendimento, valorizando o património dos nossos clientes.',
  aboutVision: 'Ser a imobiliária de referência em Angola, reconhecida pela solidez, modernidade e confiança nas negociações de compra, venda e arrendamento.',
  aboutValues: [
    'Transparência e Ética inegociáveis',
    'Rigor Jurídico e Documental',
    'Compromisso com a satisfação do cliente',
    'Conhecimento aprofundado do mercado angolano',
    'Inovação e agilidade no atendimento',
  ],
  servicesList: [
    {
      title: 'Mediação na Compra e Venda',
      description: 'Acompanhamento integral na seleção, visita, negociação e formalização documental de imóveis residenciais e comerciais.',
      icon: 'Handshake',
    },
    {
      title: 'Gestão de Arrendamento',
      description: 'Administração rigorosa de imóveis para arrendamento, seleção criteriosa de inquilinos e acompanhamento contratual.',
      icon: 'KeyRound',
    },
    {
      title: 'Avaliação Imobiliária',
      description: 'Determinação precisa do valor de mercado do seu imóvel com base em parâmetros reais e atualizados do mercado angolano.',
      icon: 'Calculator',
    },
    {
      title: 'Consultoria Documental e Jurídica',
      description: 'Verificação minuciosa de titularidade, certidões prediais e regularização de imóveis perante as autoridades angolanas.',
      icon: 'ShieldCheck',
    },
  ],
  phone: '+244 935973494',
  whatsapp: '+244 935973494',
  email: 'contacto@aliancaimobiliaria.ao',
  address: 'Luanda & Malanje, Angola',
  workingHours: 'Segunda a Sábado: 08:00 - 18:00',
  updatedAt: new Date().toISOString(),
};

export const COMMON_FEATURES_LIST = [
  'Água da Rede Pública',
  'Tanque de Água / Cisterna',
  'Gerador Elétrico / PT Próprio',
  'Segurança 24h / Guarita',
  'Ar Condicionado',
  'Piscina Privada',
  'Quintal Espaçoso',
  'Garagem Coberta',
  'Cozinha Equipada',
  'Mobilado',
  'Documentação Regularizada / IPU',
  'Condomínio Fechado',
  'Varanda com Vista',
  'Área de Lazer / Churrasqueira',
];
