import React, { useState, useMemo } from 'react';
import {
  Building2,
  Plus,
  Heart,
  FileText,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  Lock,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavoritesAndAlerts } from '../context/FavoritesAndAlertsContext';
import { Property, Category, LocationConfig, DealType, PropertyCondition } from '../types';
import { dbService } from '../lib/dbService';
import { formatKzPrice } from '../lib/formatters';
import { COMMON_FEATURES_LIST } from '../lib/defaultData';
import { sanitizeText, sanitizeNumber } from '../lib/sanitizer';

interface PartnerPortalProps {
  onBackToHome: () => void;
  catalogProperties: Property[];
  categories: Category[];
  locations: LocationConfig[];
  onSelectProperty: (property: Property) => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
}

export const PartnerPortal: React.FC<PartnerPortalProps> = ({
  onBackToHome,
  catalogProperties,
  categories,
  locations,
  onSelectProperty,
  onOpenAuth,
}) => {
  const { currentUser, isPartner, partnerProfile, registerPartner } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavoritesAndAlerts();

  const [activeTab, setActiveTab] = useState<'listings' | 'favorites' | 'profile'>(
    isPartner ? 'listings' : 'profile'
  );

  // Registration Form State
  const [companyName, setCompanyName] = useState('');
  const [nif, setNif] = useState('');
  const [technicalResponsible, setTechnicalResponsible] = useState('');
  const [partnerEmail, setPartnerEmail] = useState(currentUser?.email || '');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerAddress, setPartnerAddress] = useState('');
  const [partnerProvince, setPartnerProvince] = useState('Luanda');
  const [partnerMunicipality, setPartnerMunicipality] = useState('');
  const [validationDocs, setValidationDocs] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);

  // Property Editor Modal State (Partner)
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [propTitle, setPropTitle] = useState('');
  const [propCode, setPropCode] = useState('');
  const [propDealType, setPropDealType] = useState<DealType>('venda');
  const [propCategory, setPropCategory] = useState(categories[0]?.slug || 'apartamento');
  const [propPrice, setPropPrice] = useState<number | ''>('');
  const [propProvince, setPropProvince] = useState(locations[0]?.province || 'Luanda');
  const [propMunicipality, setPropMunicipality] = useState('');
  const [propNeighborhood, setPropNeighborhood] = useState('');
  const [propBedrooms, setPropBedrooms] = useState<number>(3);
  const [propBathrooms, setPropBathrooms] = useState<number>(2);
  const [propArea, setPropArea] = useState<number | ''>(120);
  const [propDescription, setPropDescription] = useState('');
  const [propFeatures, setPropFeatures] = useState<string[]>([]);
  const [propImagesText, setPropImagesText] = useState('');
  const [propSaveError, setPropSaveError] = useState<string | null>(null);
  const [isSavingProp, setIsSavingProp] = useState(false);

  // Partner's own properties
  const myProperties = useMemo(() => {
    if (!currentUser) return [];
    return (catalogProperties || []).filter(
      (p) =>
        p.publishedBy === currentUser.uid ||
        (partnerProfile && p.publishedBy === partnerProfile.id)
    );
  }, [catalogProperties, currentUser, partnerProfile]);

  // Favorited properties from general catalog
  const myFavoritedProperties = useMemo(() => {
    return (catalogProperties || []).filter((p) => favoriteIds.includes(p.id));
  }, [catalogProperties, favoriteIds]);

  // Municipalities for selected province in property form
  const selectedLocation = locations.find((l) => l.province === propProvince);
  const availableMunicipalities = selectedLocation ? selectedLocation.municipalities : [];

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!currentUser) {
      onOpenAuth('signup');
      return;
    }

    if (!companyName.trim() || !nif.trim() || !technicalResponsible.trim() || !partnerPhone.trim()) {
      setRegError('Por favor preencha todos os campos obrigatórios (*).');
      return;
    }

    setIsSubmittingReg(true);
    try {
      await registerPartner({
        companyName,
        nif,
        technicalResponsible,
        email: partnerEmail || currentUser.email || '',
        phone: partnerPhone,
        address: partnerAddress,
        province: partnerProvince,
        municipality: partnerMunicipality,
        validationDocuments: validationDocs || 'Alvará Comercial / Licença em tramitação',
      });
      setRegSuccess('Adesão de parceiro concluída com sucesso! Agora pode gerir os seus imóveis.');
      setActiveTab('listings');
    } catch (err: any) {
      setRegError(err.message || 'Falha ao registar parceiro.');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  const openNewPropertyModal = () => {
    setEditingPropertyId(null);
    setPropTitle('');
    setPropCode(`PAR-${Math.floor(1000 + Math.random() * 9000)}`);
    setPropDealType('venda');
    setPropCategory(categories[0]?.slug || 'apartamento');
    setPropPrice('');
    setPropProvince(locations[0]?.province || 'Luanda');
    setPropMunicipality('');
    setPropNeighborhood('');
    setPropBedrooms(3);
    setPropBathrooms(2);
    setPropArea(120);
    setPropDescription('');
    setPropFeatures(['Água da Rede Pública', 'Gerador Elétrico / PT Próprio', 'Segurança 24h / Guarita']);
    setPropImagesText('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80');
    setPropSaveError(null);
    setIsPropertyModalOpen(true);
  };

  const openEditPropertyModal = (p: Property) => {
    // Security verification: Partners can ONLY edit their own properties
    if (p.publishedBy !== currentUser?.uid && (!partnerProfile || p.publishedBy !== partnerProfile.id)) {
      alert('Acesso negado: Você só pode editar os seus próprios imóveis.');
      return;
    }

    setEditingPropertyId(p.id);
    setPropTitle(p.title);
    setPropCode(p.code);
    setPropDealType(p.dealType);
    setPropCategory(p.category);
    setPropPrice(p.price);
    setPropProvince(p.province);
    setPropMunicipality(p.municipality || '');
    setPropNeighborhood(p.neighborhood || '');
    setPropBedrooms(p.bedrooms || 0);
    setPropBathrooms(p.bathrooms || 0);
    setPropArea(p.area || 0);
    setPropDescription(p.description || '');
    setPropFeatures(p.features || []);
    setPropImagesText((p.images || []).join('\n'));
    setPropSaveError(null);
    setIsPropertyModalOpen(true);
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setPropSaveError(null);

    const cleanTitle = sanitizeText(propTitle);
    if (!cleanTitle) {
      setPropSaveError('Por favor informe o título do imóvel.');
      return;
    }
    if (!propPrice || Number(propPrice) <= 0) {
      setPropSaveError('Por favor informe um preço válido.');
      return;
    }

    const imagesArray = propImagesText
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 5);

    if (imagesArray.length === 0) {
      imagesArray.push('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80');
    }

    const matchedCat = categories.find((c) => c.slug === propCategory);

    setIsSavingProp(true);
    try {
      const propData: Property = {
        id: editingPropertyId || `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: cleanTitle,
        code: propCode.trim() || `PAR-${Date.now().toString().slice(-4)}`,
        dealType: propDealType,
        category: propCategory,
        categoryName: matchedCat ? matchedCat.name : propCategory,
        price: Number(propPrice),
        currency: 'AOA',
        isNegotiable: true,
        province: propProvince,
        municipality: propMunicipality || 'Luanda',
        neighborhood: sanitizeText(propNeighborhood) || 'Talatona',
        area: sanitizeNumber(propArea, 100),
        bedrooms: sanitizeNumber(propBedrooms, 0),
        bathrooms: sanitizeNumber(propBathrooms, 0),
        parkingSpaces: 2,
        features: propFeatures,
        description: sanitizeText(propDescription),
        condition: 'usado',
        status: 'disponivel',
        // RESTRICTION: Partners CANNOT highlight (isFeatured) properties!
        isFeatured: false,
        images: imagesArray,
        createdAt: editingPropertyId ? (catalogProperties.find((p) => p.id === editingPropertyId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedBy: currentUser.uid,
      };

      await dbService.saveProperty(propData);
      setIsPropertyModalOpen(false);
    } catch (err: any) {
      setPropSaveError(err.message || 'Erro ao gravar o imóvel.');
    } finally {
      setIsSavingProp(false);
    }
  };

  const handleDeleteProperty = async (propId: string) => {
    const target = catalogProperties.find((p) => p.id === propId);
    if (!target) return;
    if (target.publishedBy !== currentUser?.uid && (!partnerProfile || target.publishedBy !== partnerProfile.id)) {
      alert('Acesso negado: Você só pode excluir os seus próprios imóveis.');
      return;
    }

    if (window.confirm(`Tem a certeza que deseja eliminar o imóvel "${target.title}"?`)) {
      try {
        await dbService.deleteProperty(propId);
      } catch (err) {
        alert('Erro ao eliminar imóvel.');
      }
    }
  };

  const toggleFeature = (feat: string) => {
    if (propFeatures.includes(feat)) {
      setPropFeatures(propFeatures.filter((f) => f !== feat));
    } else {
      setPropFeatures([...propFeatures, feat]);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner / Breadcrumb */}
      <div className="w-full bg-[#001F3F] text-white border-b border-[#003366] py-8 sm:py-10">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2 border border-blue-400/30">
                <Building2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Portal B2B & Parcerias Imobiliárias</span>
              </div>
              <h1 className="font-brand-display text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {isPartner ? partnerProfile?.companyName : 'Rede de Imobiliárias Parceiras A.PANZO'}
              </h1>
              <p className="mt-1 text-sm text-slate-300 max-w-2xl">
                {isPartner
                  ? `Responsável Técnico: ${partnerProfile?.technicalResponsible} | NIF: ${partnerProfile?.nif}`
                  : 'Cadastre a sua imobiliária, publique os seus imóveis na nossa rede e amplie as suas vendas em Angola com segurança jurídica.'}
              </p>
            </div>

            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer self-start md:self-auto"
            >
              <span>Voltar ao Portal Principal</span>
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pb-1 w-full">
            {isPartner && (
              <button
                onClick={() => setActiveTab('listings')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer flex-1 sm:flex-initial text-center ${
                  activeTab === 'listings'
                    ? 'bg-[#0052A5] text-white shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Os Meus Imóveis ({myProperties.length})</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer flex-1 sm:flex-initial text-center ${
                activeTab === 'favorites'
                  ? 'bg-[#0052A5] text-white shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-300 fill-rose-300/30 shrink-0" />
              <span>Favoritos Guardados ({myFavoritedProperties.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer flex-1 sm:flex-initial text-center ${
                activeTab === 'profile'
                  ? 'bg-[#0052A5] text-white shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{isPartner ? 'Dados da Empresa' : 'Aderir à Parceria (Cadastro)'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* ======================================================== */}
        {/* TAB 1: LISTINGS (MY PROPERTIES)                         */}
        {/* ======================================================== */}
        {activeTab === 'listings' && (
          <div className="space-y-6 w-full">
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="min-w-0 flex-1">
                <h2 className="font-brand-display text-lg font-bold text-slate-900">
                  Gestão dos Meus Imóveis
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publique e atualize o seu portfólio. Os seus imóveis são visualizados por milhares de clientes em Angola.
                </p>
              </div>

              <button
                onClick={openNewPropertyModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-[#0052A5] hover:bg-[#003366] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Publicar Novo Imóvel</span>
              </button>
            </div>

            {/* Strict Notice regarding restrictions */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Regras e Restrições de Parceiro:</span> Você tem permissão para gerir exclusivamente os imóveis cadastrados pela sua imobiliária. A marcação de destaques na página inicial e configurações globais é reservada estritamente à administração da A.PANZO.
              </div>
            </div>

            {myProperties.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-brand-display text-base font-bold text-slate-800">
                  Nenhum imóvel cadastrado ainda
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Clique no botão abaixo para adicionar a sua primeira propriedade na rede da A.PANZO.
                </p>
                <button
                  onClick={openNewPropertyModal}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#0052A5] text-white text-xs font-bold rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Imóvel</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProperties.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video bg-slate-100 overflow-hidden">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80'}
                          alt={p.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-[10px] font-bold uppercase">
                            {p.dealType}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white/90 text-slate-800 text-[10px] font-mono font-bold">
                            {p.code}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-slate-500">
                            {p.municipality || p.province}
                          </span>
                          <span className="text-xs font-extrabold text-[#0052A5]">
                            {formatKzPrice(p.price, p.currency)}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                          {p.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {p.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-slate-100 mt-3 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onSelectProperty(p)}
                        className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                        title="Visualizar"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditPropertyModal(p)}
                          className="p-2 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 text-xs font-semibold flex items-center gap-1"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(p.id)}
                          className="p-2 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-50 text-xs font-semibold"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: FAVORITES MANAGEMENT                              */}
        {/* ======================================================== */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-brand-display text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <span>Imóveis Favoritados (Gostos)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gerencie a sua seleção personalizada de imóveis guardados para consulta rápida ou apresentação a clientes.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200 self-start sm:self-auto">
                {myFavoritedProperties.length} imóveis guardados
              </span>
            </div>

            {myFavoritedProperties.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-brand-display text-base font-bold text-slate-800">
                  Nenhum imóvel favoritado
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Enquanto navega pelo catálogo, clique no ícone de coração nos imóveis que gostaria de guardar aqui.
                </p>
                <button
                  onClick={onBackToHome}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#0052A5] text-white text-xs font-bold rounded-xl"
                >
                  <span>Explorar Catálogo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myFavoritedProperties.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video bg-slate-100 overflow-hidden">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80'}
                          alt={p.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => toggleFavorite(p)}
                          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 text-rose-600 hover:bg-rose-50 shadow-xs transition-colors"
                          title="Remover dos favoritos"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-slate-500">
                            {p.municipality || p.province}
                          </span>
                          <span className="text-xs font-extrabold text-[#0052A5]">
                            {formatKzPrice(p.price, p.currency)}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                          {p.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {p.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-slate-100 mt-3 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onSelectProperty(p)}
                        className="px-3 py-1.5 bg-[#0052A5] hover:bg-[#003366] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Detalhes</span>
                      </button>

                      <a
                        href={`https://wa.me/244925883080?text=${encodeURIComponent(
                          `Olá A.PANZO! Tenho interesse no imóvel ${p.title} (Código: ${p.code})`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1"
                        title="Conversar no WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: REGISTRATION & PARTNER COMPANY PROFILE           */}
        {/* ======================================================== */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-[#003366] text-white">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Credenciação Oficial B2B</span>
              </div>
              <h2 className="font-brand-display text-xl sm:text-2xl font-black">
                {isPartner ? 'Perfil da Imobiliária Parceira' : 'Ficha de Cadastro de Parceiro Imobiliário'}
              </h2>
              <p className="text-xs text-slate-200 mt-1">
                Junte-se à maior rede colaborativa imobiliária de Angola com apoio documental e expansão mercadológica.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-8 space-y-6">
              {regError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{regSuccess}</span>
                </div>
              )}

              {!currentUser && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between gap-3">
                  <span>Para se cadastrar como parceiro, inicie sessão na sua conta ou crie uma nova.</span>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('signup')}
                    className="px-3 py-1.5 bg-[#0052A5] text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer"
                  >
                    Criar Conta
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Nome da Empresa / Imobiliária *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Prime Real Estate Luanda, LDA"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    NIF (Número de Identificação Fiscal) *
                  </label>
                  <input
                    type="text"
                    required
                    value={nif}
                    onChange={(e) => setNif(e.target.value)}
                    placeholder="Ex: 5418902341"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Responsável Técnico *
                  </label>
                  <input
                    type="text"
                    required
                    value={technicalResponsible}
                    onChange={(e) => setTechnicalResponsible(e.target.value)}
                    placeholder="Nome do consultor / mediador habilitado"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Telefone / WhatsApp de Contacto *
                  </label>
                  <input
                    type="tel"
                    required
                    value={partnerPhone}
                    onChange={(e) => setPartnerPhone(e.target.value)}
                    placeholder="Ex: +244 923 000 000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  E-mail Corporativo *
                </label>
                <input
                  type="email"
                  required
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="contacto@suaimobiliaria.ao"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Província Sede
                  </label>
                  <select
                    value={partnerProvince}
                    onChange={(e) => setPartnerProvince(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5]"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.province}>
                        {loc.province}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Município / Bairro
                  </label>
                  <input
                    type="text"
                    value={partnerMunicipality}
                    onChange={(e) => setPartnerMunicipality(e.target.value)}
                    placeholder="Ex: Talatona, Belas ou Ingombota"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Endereço Físico Completo
                </label>
                <input
                  type="text"
                  value={partnerAddress}
                  onChange={(e) => setPartnerAddress(e.target.value)}
                  placeholder="Rua, Edifício, Piso ou referência da agência"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Documentos de Validação (Alvará Comercial / Licença AMI / Registo Comercial)
                </label>
                <textarea
                  rows={2}
                  value={validationDocs}
                  onChange={(e) => setValidationDocs(e.target.value)}
                  placeholder="Insira o número do alvará, licença do ministério do comércio ou link dos documentos de habilitação jurídica."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingReg || !currentUser}
                  className="w-full py-3 bg-[#0052A5] hover:bg-[#003366] disabled:bg-slate-300 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isSubmittingReg
                      ? 'A processar credenciação...'
                      : isPartner
                      ? 'Atualizar Dados de Parceiro'
                      : 'Submeter Ficha de Parceiro'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT PARTNER PROPERTY                       */}
      {/* ======================================================== */}
      {isPropertyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0052A5]" />
                <h3 className="font-brand-display text-base font-bold text-slate-900">
                  {editingPropertyId ? 'Editar Imóvel do Parceiro' : 'Cadastrar Imóvel na Rede'}
                </h3>
              </div>
              <button
                onClick={() => setIsPropertyModalOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProperty} className="overflow-y-auto p-6 space-y-4 flex-1">
              {propSaveError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {propSaveError}
                </div>
              )}

              {/* Strict notice: Partner cannot highlight */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Nota de Permissão:</strong> A inclusão no Marquee/Ticker de Destaques é gerida exclusivamente pela A.PANZO.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Título do Imóvel *
                </label>
                <input
                  type="text"
                  required
                  value={propTitle}
                  onChange={(e) => setPropTitle(e.target.value)}
                  placeholder="Ex: Vivenda T4 Moderna com Piscina no Condomínio Belas"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Finalidade
                  </label>
                  <select
                    value={propDealType}
                    onChange={(e) => setPropDealType(e.target.value as DealType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="venda">Venda (Comprar)</option>
                    <option value="arrendamento">Arrendamento</option>
                    <option value="trespasse">Trespasse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={propCategory}
                    onChange={(e) => setPropCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Preço (Kz) *
                  </label>
                  <input
                    type="number"
                    required
                    value={propPrice}
                    onChange={(e) => setPropPrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ex: 85000000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Província
                  </label>
                  <select
                    value={propProvince}
                    onChange={(e) => {
                      setPropProvince(e.target.value);
                      setPropMunicipality('');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.province}>
                        {loc.province}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Município
                  </label>
                  <select
                    value={propMunicipality}
                    onChange={(e) => setPropMunicipality(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="">Selecione o Município</option>
                    {availableMunicipalities.map((mun) => (
                      <option key={mun} value={mun}>
                        {mun}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Bairro / Condomínio
                  </label>
                  <input
                    type="text"
                    value={propNeighborhood}
                    onChange={(e) => setPropNeighborhood(e.target.value)}
                    placeholder="Ex: Talatona, Morro Bento"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Quartos (Tipologia)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={propBedrooms}
                    onChange={(e) => setPropBedrooms(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Casas de Banho
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={propBathrooms}
                    onChange={(e) => setPropBathrooms(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Área Útil (m²)
                  </label>
                  <input
                    type="number"
                    value={propArea}
                    onChange={(e) => setPropArea(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Características & Comodidades
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMON_FEATURES_LIST.slice(0, 9).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFeature(f)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-left transition-all border ${
                        propFeatures.includes(f)
                          ? 'bg-[#0052A5] text-white border-[#0052A5]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Descrição Completa
                </label>
                <textarea
                  rows={3}
                  value={propDescription}
                  onChange={(e) => setPropDescription(e.target.value)}
                  placeholder="Descreva detalhes estruturais, documentais e acabamentos..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  URLs das Fotos (uma por linha)
                </label>
                <textarea
                  rows={2}
                  value={propImagesText}
                  onChange={(e) => setPropImagesText(e.target.value)}
                  placeholder="https://...&#10;https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPropertyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProp}
                  className="px-5 py-2 bg-[#0052A5] hover:bg-[#003366] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {isSavingProp ? 'A gravar...' : editingPropertyId ? 'Salvar Alterações' : 'Publicar Imóvel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
