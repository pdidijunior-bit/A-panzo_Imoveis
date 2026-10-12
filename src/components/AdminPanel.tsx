import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Video,
  CheckCircle,
  X,
  Building,
  MapPin,
  MessageSquare,
  Settings,
  Info,
  LogOut,
  AlertCircle,
  Eye,
  Sliders,
  Send,
  UploadCloud,
  FileText,
  DollarSign,
  Tag,
  Loader2,
  RefreshCw,
  Phone,
  Sparkles,
  KeyRound,
  EyeOff,
  ArrowLeft,
  Clock,
  Briefcase,
  Download,
  Search,
  FileSpreadsheet,
  Check,
  ExternalLink,
  ArrowUpDown,
  MessageCircle,
  Building2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../lib/dbService';
import { compressImageFile, processVideoFile } from '../lib/mediaUtils';
import {
  Property,
  Category,
  LocationConfig,
  SiteSettings,
  Conversation,
  Message,
  DealType,
  PropertyStatus,
  PropertyCondition,
  PartnerProfile,
} from '../types';
import { COMMON_FEATURES_LIST } from '../lib/defaultData';
import { formatCurrency, normalizeCurrency } from '../lib/formatters';

interface AdminPanelProps {
  onClose: () => void;
  properties: Property[];
  categories: Category[];
  locations: LocationConfig[];
  siteSettings: SiteSettings;
  onRefreshData?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onClose,
  properties,
  categories,
  locations,
  siteSettings,
  onRefreshData,
}) => {
  const {
    currentUser,
    isAdmin,
    isMasterAdmin,
    signInWithGoogle,
    signOut,
    authError,
    clearAuthError,
    loginWithMasterKey,
    updateMasterKey,
  } = useAuth();

  const [masterKeyInput, setMasterKeyInput] = useState('');
  const [showMasterKey, setShowMasterKey] = useState(false);
  const [newMasterKeyInput, setNewMasterKeyInput] = useState('');
  const [newMasterKeyConfirm, setNewMasterKeyConfirm] = useState('');
  const [masterKeyUpdateMsg, setMasterKeyUpdateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [activeTab, setActiveTab] = useState<
    'properties' | 'categories' | 'locations' | 'visuals' | 'messages' | 'institutional' | 'partners'
  >('properties');

  // Gestão de Parceiros B12 (Folha Excel Dinâmica)
  const [partnersList, setPartnersList] = useState<PartnerProfile[]>([]);
  const [isPartnersLoading, setIsPartnersLoading] = useState(false);
  const [partnerSearchTerm, setPartnerSearchTerm] = useState('');
  const [partnerStatusFilter, setPartnerStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [partnerProvinceFilter, setPartnerProvinceFilter] = useState('all');
  const [partnerSortColumn, setPartnerSortColumn] = useState<'companyName' | 'nif' | 'province' | 'createdAt' | 'status'>('createdAt');
  const [partnerSortDir, setPartnerSortDir] = useState<'asc' | 'desc'>('desc');
  const [partnerActionNotice, setPartnerActionNotice] = useState<string | null>(null);

  // Property Form Modal State
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [propPartnerCompanyName, setPropPartnerCompanyName] = useState('');

  // Property Form fields
  const [propTitle, setPropTitle] = useState('');
  const [propCode, setPropCode] = useState('');
  const [propDealType, setPropDealType] = useState<DealType>('venda');
  const [propCategory, setPropCategory] = useState('');
  const [propPrice, setPropPrice] = useState<number | ''>('');
  const [propCurrency, setPropCurrency] = useState<'AOA' | 'USD' | 'EUR'>('AOA');
  const [propIsNegotiable, setPropIsNegotiable] = useState(false);
  const [propProvince, setPropProvince] = useState('Luanda');
  const [propMunicipality, setPropMunicipality] = useState('');
  const [propNeighborhood, setPropNeighborhood] = useState('');
  const [propAddressRef, setPropAddressRef] = useState('');
  const [propArea, setPropArea] = useState<number | ''>('');
  const [propBedrooms, setPropBedrooms] = useState<number>(3);
  const [propBathrooms, setPropBathrooms] = useState<number>(2);
  const [propParking, setPropParking] = useState<number>(1);
  const [propFeatures, setPropFeatures] = useState<string[]>([]);
  const [customFeatureInput, setCustomFeatureInput] = useState('');
  const [propDescription, setPropDescription] = useState('');
  const [propCondition, setPropCondition] = useState<PropertyCondition>('usado');
  const [propStatus, setPropStatus] = useState<PropertyStatus>('disponivel');
  const [propIsFeatured, setPropIsFeatured] = useState(false);
  const [propImages, setPropImages] = useState<string[]>([]);
  const [propVideoUrl, setPropVideoUrl] = useState('');
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [mediaUploadProgress, setMediaUploadProgress] = useState<string | null>(null);
  const [mediaUploadPercent, setMediaUploadPercent] = useState<number>(0);
  const adminFileInputRef = useRef<HTMLInputElement>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSavingProperty, setIsSavingProperty] = useState(false);

  // Category Management Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatType, setNewCatType] = useState<'residential' | 'commercial' | 'land' | 'service'>('residential');

  // Location Management Form State
  const [newProvinceName, setNewProvinceName] = useState('');
  const [newMunicipalityList, setNewMunicipalityList] = useState('');

  // Visuals / Home Settings State
  const [heroTitleInput, setHeroTitleInput] = useState(siteSettings.heroTitle || '');
  const [heroSubtitleInput, setHeroSubtitleInput] = useState(siteSettings.heroSubtitle || '');
  const [marqueeInput, setMarqueeInput] = useState(siteSettings.marqueeNotice || '');
  const [showMarqueeInput, setShowMarqueeInput] = useState(siteSettings.showMarquee ?? true);
  const [heroBannerImageInput, setHeroBannerImageInput] = useState(siteSettings.heroBannerImage || '');
  const [customLogoInput, setCustomLogoInput] = useState(siteSettings.logoUrl || '');
  const [profilePhotoInput, setProfilePhotoInput] = useState(siteSettings.profilePhotoUrl || '');
  const [isSavingVisuals, setIsSavingVisuals] = useState(false);

  // Institutional Settings State
  const [storyInput, setStoryInput] = useState(siteSettings.aboutStory || '');
  const [missionInput, setMissionInput] = useState(siteSettings.aboutMission || '');
  const [visionInput, setVisionInput] = useState(siteSettings.aboutVision || '');
  const [phoneInput, setPhoneInput] = useState(siteSettings.phone || '+244 925 883 080');
  const [phone2Input, setPhone2Input] = useState(siteSettings.phone2 || '+244 928 771 808');
  const [phone3Input, setPhone3Input] = useState(
    siteSettings.phone3 && !siteSettings.phone3.includes('952') ? siteSettings.phone3 : ''
  );
  const [whatsappInput, setWhatsappInput] = useState(siteSettings.whatsapp || '+244 925 883 080');
  const [emailInput, setEmailInput] = useState(siteSettings.email || 'comercial@anpanzo.com');
  const [email2Input, setEmail2Input] = useState(siteSettings.email2 || 'ap.imobiliaria1985@gmail.com');
  const [websiteInput, setWebsiteInput] = useState(siteSettings.website || 'anpanzo.com');
  const [instagramInput, setInstagramInput] = useState(siteSettings.instagram || '@A.panzo comercial');
  const [facebookInput, setFacebookInput] = useState(siteSettings.facebook || 'A.panzo comercial');
  const [addressInput, setAddressInput] = useState(siteSettings.address || 'Angola – Serviço com Qualidade e Confiança');
  const [hoursInput, setHoursInput] = useState(siteSettings.workingHours || 'Segunda a Sábado: 08:00 - 18:00');
  const [isSavingInstitutional, setIsSavingInstitutional] = useState(false);

  // Real-Time Messages State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const adminMessagesEndRef = useRef<HTMLDivElement>(null);

  const unreadConvsCount = useMemo(() => {
    return conversations.filter((c) => (c.unreadByAdmin || 0) > 0).length;
  }, [conversations]);

  useEffect(() => {
    if (activeTab === 'messages' && selectedConversation) {
      setTimeout(() => {
        adminMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [conversationMessages, activeTab, selectedConversation]);

  // Listen to conversations
  useEffect(() => {
    if (!isAdmin) return;
    const unsub = dbService.subscribeConversations(
      (convs) => setConversations(convs),
      (err) => console.warn('Erro ao carregar conversas:', err)
    );
    return () => unsub();
  }, [isAdmin]);

  // Listen to messages of selected conversation
  useEffect(() => {
    if (!selectedConversation) return;
    const unsub = dbService.subscribeMessages(
      selectedConversation.id,
      (msgs) => {
        setConversationMessages(msgs);
        dbService.markConversationRead(selectedConversation.id, true);
      },
      (err) => console.warn('Erro ao carregar mensagens:', err)
    );
    return () => unsub();
  }, [selectedConversation]);

  // Carregamento e Gestão de Parceiros B12 (Área de Administração)
  const loadPartnersList = async () => {
    setIsPartnersLoading(true);
    try {
      const data = await dbService.getPartnerProfiles();
      setPartnersList(data || []);
    } catch (err) {
      console.warn('Erro ao carregar parceiros no painel adm:', err);
    } finally {
      setIsPartnersLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadPartnersList();
    }
  }, [isAdmin, activeTab]);

  const handleUpdatePartnerStatus = async (id: string, newStatus: 'active' | 'pending' | 'suspended') => {
    try {
      await dbService.updatePartnerStatus(id, newStatus);
      setPartnersList((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p))
      );
      setPartnerActionNotice(`Estado atualizado para "${newStatus === 'active' ? 'Activo' : newStatus === 'pending' ? 'Pendente' : 'Suspenso'}".`);
      setTimeout(() => setPartnerActionNotice(null), 3500);
    } catch (err: any) {
      alert('Falha ao atualizar estado: ' + err.message);
    }
  };

  // Contagem de imóveis por parceiro
  const getPartnerPropertyCount = (partner: PartnerProfile) => {
    return properties.filter(
      (p) =>
        p.publishedBy === partner.userId ||
        p.publishedBy === partner.id ||
        p.partnerId === partner.id ||
        (p.partnerCompanyName && p.partnerCompanyName.toLowerCase() === partner.companyName.toLowerCase())
    ).length;
  };

  // Filtragem e ordenação dinâmica estilo Excel
  const filteredSortedPartners = useMemo(() => {
    let list = [...partnersList];

    if (partnerSearchTerm.trim()) {
      const q = partnerSearchTerm.toLowerCase();
      list = list.filter((p) =>
        (p.companyName || '').toLowerCase().includes(q) ||
        (p.nif || '').toLowerCase().includes(q) ||
        (p.technicalResponsible || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q) ||
        (p.phone || '').toLowerCase().includes(q) ||
        (p.municipality || '').toLowerCase().includes(q)
      );
    }

    if (partnerStatusFilter !== 'all') {
      list = list.filter((p) => p.status === partnerStatusFilter);
    }

    if (partnerProvinceFilter !== 'all') {
      list = list.filter((p) => (p.province || '').toLowerCase() === partnerProvinceFilter.toLowerCase());
    }

    list.sort((a, b) => {
      let valA: any = a[partnerSortColumn] || '';
      let valB: any = b[partnerSortColumn] || '';

      if (partnerSortColumn === 'createdAt') {
        valA = new Date(a.createdAt || 0).getTime();
        valB = new Date(b.createdAt || 0).getTime();
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return partnerSortDir === 'asc' ? -1 : 1;
      if (valA > valB) return partnerSortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [partnersList, partnerSearchTerm, partnerStatusFilter, partnerProvinceFilter, partnerSortColumn, partnerSortDir]);

  const handleExportPartnersToCsv = () => {
    if (filteredSortedPartners.length === 0) {
      alert('Não existem registos de parceiros para exportar com os filtros atuais.');
      return;
    }

    const headers = [
      'Empresa / Parceiro',
      'NIF',
      'Responsável Técnico',
      'E-mail',
      'Telefone',
      'Província',
      'Município',
      'Endereço',
      'Documentos / Alvará',
      'Estado',
      'Imóveis Publicados',
      'Data de Registo',
    ];

    const rows = filteredSortedPartners.map((p) => [
      `"${(p.companyName || '').replace(/"/g, '""')}"`,
      `"${(p.nif || '').replace(/"/g, '""')}"`,
      `"${(p.technicalResponsible || '').replace(/"/g, '""')}"`,
      `"${(p.email || '').replace(/"/g, '""')}"`,
      `"${(p.phone || '').replace(/"/g, '""')}"`,
      `"${(p.province || '').replace(/"/g, '""')}"`,
      `"${(p.municipality || '').replace(/"/g, '""')}"`,
      `"${(p.address || '').replace(/"/g, '""')}"`,
      `"${(p.validationDocuments || '').replace(/"/g, '""')}"`,
      `"${p.status === 'active' ? 'Activo' : p.status === 'pending' ? 'Pendente' : 'Suspenso'}"`,
      `"${getPartnerPropertyCount(p)}"`,
      `"${new Date(p.createdAt).toLocaleDateString('pt-AO')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `APANZO_Parceiros_B12_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Auto-set first category and municipality if empty
  useEffect(() => {
    if (!propCategory && categories.length > 0) {
      setPropCategory(categories[0].slug);
    }
  }, [categories, propCategory]);

  const currentLocConfig = locations.find((l) => l.province === propProvince);
  const availableMunicipalities = currentLocConfig ? currentLocConfig.municipalities : [];

  useEffect(() => {
    if (availableMunicipalities.length > 0 && !propMunicipality) {
      setPropMunicipality(availableMunicipalities[0]);
    }
  }, [availableMunicipalities, propMunicipality]);

  // Reset Property Form
  const resetPropertyForm = () => {
    setEditingPropertyId(null);
    setPropTitle('');
    setPropCode(`APZ-${Math.floor(100 + Math.random() * 900)}`);
    setPropDealType('venda');
    setPropCategory(categories[0]?.slug || 'casas-t3');
    setPropPrice('');
    setPropCurrency('AOA');
    setPropIsNegotiable(false);
    setPropProvince('Luanda');
    setPropMunicipality(locations[0]?.municipalities[0] || 'Talatona');
    setPropNeighborhood('');
    setPropAddressRef('');
    setPropArea('');
    setPropBedrooms(3);
    setPropBathrooms(2);
    setPropParking(1);
    setPropFeatures([]);
    setPropDescription('');
    setPropCondition('usado');
    setPropStatus('disponivel');
    setPropIsFeatured(false);
    setPropImages([]);
    setPropVideoUrl('');
    setPropPartnerCompanyName('');
    setFormError(null);
    setFormSuccess(null);
  };

  const handleOpenNewProperty = () => {
    resetPropertyForm();
    setPropertyModalOpen(true);
  };

  const handleEditProperty = (prop: Property) => {
    setEditingPropertyId(prop.id);
    setPropTitle(prop.title);
    setPropCode(prop.code);
    setPropDealType(prop.dealType);
    setPropCategory(prop.category);
    setPropPrice(prop.price);
    setPropCurrency(normalizeCurrency(prop.currency));
    setPropIsNegotiable(prop.isNegotiable || false);
    setPropProvince(prop.province);
    setPropMunicipality(prop.municipality);
    setPropNeighborhood(prop.neighborhood || '');
    setPropAddressRef(prop.addressReference || '');
    setPropArea(prop.area || '');
    setPropBedrooms(prop.bedrooms ?? 3);
    setPropBathrooms(prop.bathrooms ?? 2);
    setPropParking(prop.parkingSpaces ?? 1);
    setPropFeatures(prop.features || []);
    setPropDescription(prop.description || '');
    setPropCondition(prop.condition || 'usado');
    setPropStatus(prop.status || 'disponivel');
    setPropIsFeatured(prop.isFeatured || false);
    setPropImages(prop.images || []);
    setPropVideoUrl(prop.videoUrl || '');
    setPropPartnerCompanyName(prop.partnerCompanyName || '');
    setFormError(null);
    setFormSuccess(null);
    setPropertyModalOpen(true);
  };

  // Multiple Photo Upload from Device Gallery with Client Compression & Batching (15+ Photos)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingMedia(true);
    setMediaUploadProgress(`A preparar ${files.length} fotografia(s)...`);
    setMediaUploadPercent(0);
    setFormError(null);

    try {
      const newUploadedImages = await dbService.uploadBatchPropertyImages(
        files,
        (progress) => {
          setMediaUploadProgress(progress.message);
          setMediaUploadPercent(progress.percent);
        }
      );

      setPropImages((prev) => [...prev, ...newUploadedImages]);
    } catch (err: any) {
      console.error('Erro no upload de fotos:', err);
      setFormError(err.message || 'Falha ao processar imagens da galeria.');
    } finally {
      setIsProcessingMedia(false);
      setMediaUploadProgress(null);
      e.target.value = '';
    }
  };

  // Video Upload from Device Gallery
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 25 * 1024 * 1024) {
      alert('Aviso: Para melhor desempenho, utilize vídeos de até 25MB.');
    }

    setIsProcessingMedia(true);
    setMediaUploadProgress('A carregar vídeo da galeria...');

    try {
      const videoResult = await processVideoFile(file);
      setPropVideoUrl(videoResult.objectUrl);
      setMediaUploadProgress(null);
    } catch (err: any) {
      console.error('Erro no vídeo:', err);
      setFormError(err.message || 'Falha ao processar o vídeo.');
    } finally {
      setIsProcessingMedia(false);
      setMediaUploadProgress(null);
      e.target.value = '';
    }
  };

  // Remove photo from listing
  const handleRemovePhoto = (index: number) => {
    setPropImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Toggle Features
  const handleToggleFeature = (feature: string) => {
    if (propFeatures.includes(feature)) {
      setPropFeatures((prev) => prev.filter((f) => f !== feature));
    } else {
      setPropFeatures((prev) => [...prev, feature]);
    }
  };

  const handleAddCustomFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFeatureInput.trim()) return;
    if (!propFeatures.includes(customFeatureInput.trim())) {
      setPropFeatures((prev) => [...prev, customFeatureInput.trim()]);
    }
    setCustomFeatureInput('');
  };

  // Save Property Submit Handler
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!propTitle.trim()) {
      setFormError('Por favor insira o título do imóvel.');
      return;
    }
    if (!propPrice || Number(propPrice) <= 0) {
      setFormError('Por favor insira um preço válido.');
      return;
    }

    setIsSavingProperty(true);

    try {
      const selectedCatObj = categories.find((c) => c.slug === propCategory);
      const catName = selectedCatObj ? selectedCatObj.name : propCategory;

      const propId = editingPropertyId || `prop-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

      const propertyToSave: Property = {
        id: propId,
        title: propTitle.trim(),
        code: propCode.trim() || `ALI-${propId.slice(-4).toUpperCase()}`,
        dealType: propDealType,
        category: propCategory,
        categoryName: catName || '',
        price: Number(propPrice) || 0,
        currency: propCurrency,
        isNegotiable: Boolean(propIsNegotiable),
        province: propProvince || 'Luanda',
        municipality: propMunicipality || 'Luanda (Ingombota)',
        neighborhood: propNeighborhood.trim() || '',
        addressReference: propAddressRef.trim() || '',
        area: propArea ? Number(propArea) : 0,
        bedrooms: Number(propBedrooms) || 0,
        bathrooms: Number(propBathrooms) || 0,
        parkingSpaces: Number(propParking) || 0,
        features: Array.isArray(propFeatures) ? propFeatures : [],
        description: propDescription.trim() || '',
        condition: propCondition || 'usado',
        status: propStatus || 'disponivel',
        isFeatured: Boolean(propIsFeatured),
        images: Array.isArray(propImages) ? propImages : [],
        videoUrl: propVideoUrl.trim() || null,
        hasVideo: Boolean(propVideoUrl.trim()),
        partnerCompanyName: propPartnerCompanyName.trim() || undefined,
        viewsCount: editingPropertyId
          ? properties.find((p) => p.id === editingPropertyId)?.viewsCount || 0
          : 0,
        createdAt: editingPropertyId
          ? properties.find((p) => p.id === editingPropertyId)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedBy: currentUser?.email || 'admin',
      };

      await dbService.saveProperty(propertyToSave);
      setFormSuccess('Imóvel gravado e publicado com sucesso!');

      setTimeout(() => {
        setPropertyModalOpen(false);
        if (onRefreshData) onRefreshData();
      }, 1000);
    } catch (err: any) {
      console.error('Falha ao gravar imóvel:', err);
      let message = 'Erro ao publicar o anúncio no Firestore.';
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error) message = parsed.error;
      } catch {
        if (err.message) message = err.message;
      }
      setFormError(message);
    } finally {
      setIsSavingProperty(false);
    }
  };

  // Delete Property Handler
  const handleDeleteProperty = async (propertyId: string) => {
    if (!window.confirm('Tem a certeza que deseja eliminar este anúncio permanentemente?')) return;
    try {
      await dbService.deleteProperty(propertyId);
    } catch (err) {
      alert('Erro ao eliminar o imóvel.');
    }
  };

  // Fast Status Toggle (Disponível <-> Reservado <-> Vendido)
  const handleQuickStatusChange = async (property: Property, newStatus: PropertyStatus) => {
    try {
      await dbService.saveProperty({
        ...property,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      alert('Erro ao atualizar status.');
    }
  };

  // Save Visuals / Home Settings
  const handleSaveVisuals = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingVisuals(true);
    try {
      await dbService.updateSiteSettings({
        heroTitle: heroTitleInput.trim(),
        heroSubtitle: heroSubtitleInput.trim(),
        marqueeNotice: marqueeInput.trim(),
        showMarquee: showMarqueeInput,
        heroBannerImage: heroBannerImageInput.trim(),
        logoUrl: customLogoInput.trim(),
        profilePhotoUrl: profilePhotoInput.trim(),
      });
      alert('Elementos visuais e letreiro da página inicial atualizados com sucesso!');
    } catch (err) {
      alert('Erro ao atualizar elementos visuais.');
    } finally {
      setIsSavingVisuals(false);
    }
  };

  // Direct Banner Upload from Device Gallery
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1920, 1080, 0.8);
      setHeroBannerImageInput(compressed);
    } catch (err: any) {
      alert(err.message || 'Erro ao processar imagem de banner.');
    }
  };

  // Direct Logo Upload from Device Gallery
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 500, 500, 0.85);
      setCustomLogoInput(compressed);
    } catch (err: any) {
      alert(err.message || 'Erro ao processar imagem de logótipo.');
    }
  };

  // Direct Profile Photo Upload from Device Gallery
  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 600, 600, 0.8);
      setProfilePhotoInput(compressed);
    } catch (err: any) {
      alert(err.message || 'Erro ao processar foto de perfil.');
    }
  };

  // Save Institutional Settings
  const handleSaveInstitutional = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingInstitutional(true);
    try {
      await dbService.updateSiteSettings({
        aboutStory: storyInput.trim(),
        aboutMission: missionInput.trim(),
        aboutVision: visionInput.trim(),
        phone: phoneInput.trim(),
        phone2: phone2Input.trim(),
        phone3: phone3Input.includes('952') ? '' : phone3Input.trim(),
        whatsapp: whatsappInput.trim(),
        email: emailInput.trim(),
        email2: email2Input.trim(),
        website: websiteInput.trim(),
        instagram: instagramInput.trim(),
        facebook: facebookInput.trim(),
        address: addressInput.trim(),
        workingHours: hoursInput.trim(),
      });
      alert('Informações institucionais e contactos da A.PANZO atualizados com sucesso!');
    } catch (err) {
      alert('Erro ao atualizar informações.');
    } finally {
      setIsSavingInstitutional(false);
    }
  };

  // Add Category Handler
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const slug = newCatSlug.trim() || newCatName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newCat: Category = {
      id: `cat-${slug}`,
      name: newCatName.trim(),
      slug,
      type: newCatType,
      order: categories.length + 1,
      isActive: true,
    };
    try {
      await dbService.saveCategory(newCat);
      setNewCatName('');
      setNewCatSlug('');
    } catch (err) {
      alert('Erro ao adicionar categoria.');
    }
  };

  // Add Location Handler
  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvinceName.trim()) return;
    const munArray = newMunicipalityList
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const newLoc: LocationConfig = {
      id: `loc-${newProvinceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      province: newProvinceName.trim(),
      municipalities: munArray.length > 0 ? munArray : [newProvinceName.trim()],
      order: locations.length + 1,
    };

    try {
      await dbService.saveLocation(newLoc);
      setNewProvinceName('');
      setNewMunicipalityList('');
    } catch (err) {
      alert('Erro ao adicionar localização.');
    }
  };

  // Send Admin Reply to Visitor Message
  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !adminReplyText.trim() || isSendingReply) return;

    setIsSendingReply(true);
    try {
      await dbService.sendAdminReply(
        selectedConversation.id,
        'Consultor A.PANZO Imobiliária',
        adminReplyText.trim()
      );
      setAdminReplyText('');
    } catch (err) {
      alert('Falha ao enviar resposta.');
    } finally {
      setIsSendingReply(false);
    }
  };

  // If Not Authenticated as Admin, Display Secure Access Gate
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 border border-slate-200 text-center animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-[#0052A5] text-white flex items-center justify-center mx-auto mb-4 shadow-md">
            <Shield className="w-7 h-7" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-[#0052A5] block mb-1">
            A.PANZO Imobiliária
          </span>
          <h3 className="font-brand-display text-2xl font-extrabold text-slate-900">
            Portal Administrativo
          </h3>
          <p className="text-xs text-slate-500 mt-2 mb-5 leading-relaxed">
            Aceda diretamente com a <strong>Chave / Senha Mestre</strong> ou autentique-se com a sua conta Google administrativa.
          </p>

          {authError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Opção 1: Entrada Direta por Chave / Senha Mestre */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loginWithMasterKey(masterKeyInput);
            }}
            className="text-left mb-4 p-4 rounded-2xl bg-slate-50 border border-slate-200"
          >
            <label
              htmlFor="admin-master-key-input"
              className="block text-xs font-bold text-slate-800 uppercase mb-2 flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>Chave de Acesso (Senha Mestre)</span>
            </label>

            <div className="relative mb-3">
              <input
                id="admin-master-key-input"
                type={showMasterKey ? 'text' : 'password'}
                value={masterKeyInput}
                onChange={(e) => setMasterKeyInput(e.target.value)}
                placeholder="Digite a senha mestre..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowMasterKey(!showMasterKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showMasterKey ? 'Ocultar senha' : 'Ver senha'}
              >
                {showMasterKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              id="admin-master-key-submit"
              type="submit"
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Entrar com Senha Mestre</span>
            </button>
          </form>

          {/* Divisor */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
              <span className="bg-white px-2.5 text-slate-400 font-bold">Ou autenticação Google</span>
            </div>
          </div>

          {currentUser ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900 text-left">
                Conta Google atual: <strong>{currentUser.email}</strong>
                <p className="mt-0.5 text-[11px] text-amber-700">
                  (Se este e-mail não tiver perfil registrado, aceda com a Senha Mestre acima).
                </p>
              </div>

              <button
                onClick={signOut}
                className="w-full py-2.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all"
              >
                Desconectar Google
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Entrar com Google ADM</span>
            </button>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>A.PANZO Imobiliária • Angola</span>
            <button onClick={onClose} className="hover:text-slate-800 font-semibold cursor-pointer">
              Voltar ao Catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-100 flex flex-col">
      {/* Admin Top Header */}
      <header className="bg-slate-950 text-white px-4 sm:px-8 py-3.5 border-b border-amber-500/30 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0052A5] to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-xs tracking-wider">
            APZ
          </div>
          <div>
            <h1 className="font-brand-display text-base font-bold text-white leading-none">
              Painel ADM • A.PANZO Imobiliária
            </h1>
            <p className="text-[10px] text-amber-400/90 font-mono mt-0.5 flex items-center gap-1.5">
              <span>Acesso:</span>
              <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded">
                {currentUser?.email ? currentUser.email : isMasterAdmin ? 'Chave Mestre (Directo)' : 'Administrador'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Chat Shortcut in Top Header */}
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                : 'bg-slate-850 hover:bg-slate-800 text-white border border-slate-700'
            }`}
            title="Abrir Chat Online dos Clientes"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Chat Online</span>
            {unreadConvsCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                {unreadConvsCount}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">({conversations.length})</span>
            )}
          </button>

          <button
            onClick={signOut}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            title="Terminar Sessão"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs"
          >
            Ver Site Público
          </button>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-8 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-4 py-2 min-w-max">
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'properties'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Imóveis & Anúncios ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Chat Online & Mensagens</span>
            {unreadConvsCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
                {unreadConvsCount} novas
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">({conversations.length})</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Categorias ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('locations')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'locations'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Localizações ({locations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('visuals')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'visuals'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Letreiro & Elementos da Home</span>
          </button>

          <button
            onClick={() => setActiveTab('institutional')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'institutional'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Sobre Nós & Contactos</span>
          </button>

          <button
            onClick={() => setActiveTab('partners')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'partners'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Gestão de Parceiros B12 ({partnersList.length})</span>
          </button>
        </div>
      </nav>

      {/* Main Tab Views */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {/* TAB 1: PROPERTIES MANAGEMENT */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            {/* Header & Quick Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="font-brand-display text-xl font-bold text-slate-900">
                  Gestão de Anúncios e Imóveis
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publique, edite e gira o catálogo de propriedades da A.PANZO Imobiliária.
                </p>
              </div>

              <button
                onClick={handleOpenNewProperty}
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold text-xs uppercase tracking-wider py-3 px-5 rounded-xl transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Publicar Novo Imóvel</span>
              </button>
            </div>

            {/* Properties List */}
            {properties.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <Building className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">
                  Nenhum imóvel publicado ainda
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                  O catálogo está pronto para preenchimento real. Clique no botão abaixo para adicionar a primeira casa, vivenda, terreno ou apartamento.
                </p>
                <button
                  onClick={handleOpenNewProperty}
                  className="inline-flex items-center gap-2 bg-slate-950 text-amber-400 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-slate-900 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Publicar Primeiro Imóvel
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="relative aspect-16/10 bg-slate-950 overflow-hidden flex items-center justify-center">
                      <img
                        src={
                          prop.images?.[0] ||
                          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80'
                        }
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110 pointer-events-none"
                      />
                      <img
                        src={
                          prop.images?.[0] ||
                          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={prop.title}
                        className="relative z-1 max-w-full max-h-full w-auto h-auto object-contain mx-auto"
                      />
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
                        <span className="bg-slate-950/80 backdrop-blur-xs text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                          {prop.code}
                        </span>
                        <span className="bg-amber-500 text-slate-950 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                          {prop.dealType}
                        </span>
                      </div>

                      <div className="absolute top-2 right-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            prop.status === 'disponivel'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {prop.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-amber-700 uppercase">
                          {prop.categoryName || prop.category}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-1 mt-0.5">
                          {prop.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {prop.municipality}, {prop.province}
                        </p>
                        <p className="text-sm font-extrabold text-slate-950 font-mono mt-2">
                          {formatCurrency(prop.price, prop.currency)}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {/* Status Toggle Quick Button */}
                        <select
                          value={prop.status}
                          onChange={(e) =>
                            handleQuickStatusChange(prop, e.target.value as PropertyStatus)
                          }
                          className="text-[11px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 cursor-pointer"
                        >
                          <option value="disponivel">Disponível</option>
                          <option value="reservado">Reservado</option>
                          <option value="vendido">Vendido</option>
                          <option value="arrendado">Arrendado</option>
                        </select>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditProperty(prop)}
                            className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Editar Imóvel"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProperty(prop.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar Imóvel"
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

        {/* TAB 2: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="font-brand-display text-xl font-bold text-slate-900">
                Gestão de Categorias Imobiliárias
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure categorias incluindo Casas T1, T2, T3, T4, Vivendas, Terrenos, Espaços Comerciais, Escritórios e Serviços.
              </p>

              {/* Add category form */}
              <form onSubmit={handleAddCategory} className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Nome da categoria (ex: Casas T5)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Slug (opcional)"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
                <select
                  value={newCatType}
                  onChange={(e) => setNewCatType(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  <option value="residential">Residencial</option>
                  <option value="commercial">Comercial</option>
                  <option value="land">Terreno</option>
                  <option value="service">Serviço</option>
                </select>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </form>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="p-3.5">Nome</th>
                    <th className="p-3.5">Slug</th>
                    <th className="p-3.5">Tipo</th>
                    <th className="p-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/60">
                      <td className="p-3.5 font-bold text-slate-900">{cat.name}</td>
                      <td className="p-3.5 font-mono text-slate-500">{cat.slug}</td>
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                          {cat.type}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => dbService.deleteCategory(cat.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LOCATIONS MANAGEMENT */}
        {activeTab === 'locations' && (
          <div className="space-y-6 max-w-4xl">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h2 className="font-brand-display text-xl font-bold text-slate-900">
                Localizações em Angola (Províncias e Municípios)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure as províncias e municípios atendidos (Luanda, Malanje e demais províncias).
              </p>

              <form onSubmit={handleAddLocation} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Nome da Província (ex: Uíge)"
                  value={newProvinceName}
                  onChange={(e) => setNewProvinceName(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
                <input
                  type="text"
                  placeholder="Municípios separados por vírgula"
                  value={newMunicipalityList}
                  onChange={(e) => setNewMunicipalityList(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Província
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {locations.map((loc) => (
                <div key={loc.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      {loc.province}
                    </span>
                    <button
                      onClick={() => dbService.deleteLocation(loc.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Eliminar província"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {loc.municipalities.map((m, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-50 text-slate-600 text-[11px] px-2 py-0.5 rounded-md border border-slate-200"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: VISUAL ELEMENTS & HOME MARQUEE */}
        {activeTab === 'visuals' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs max-w-3xl space-y-6">
            <div>
              <h2 className="font-brand-display text-xl font-bold text-slate-900">
                Elementos Visuais da Home & Letreiro
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Edite os banners, imagem de fundo, letreiro chamativo e identidade visual da página inicial em tempo real.
              </p>
            </div>

            <form onSubmit={handleSaveVisuals} className="space-y-5">
              {/* Marquee Notice */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                    Anúncio / Letreiro Chamativo da Home
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={showMarqueeInput}
                      onChange={(e) => setShowMarqueeInput(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Exibir no topo</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={marqueeInput}
                  onChange={(e) => setMarqueeInput(e.target.value)}
                  placeholder="Ex: Novas oportunidades em Luanda e Malanje • Contacte WhatsApp: +244 924 875 869"
                  className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Hero Title and Subtitle */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Título Principal da Home
                </label>
                <input
                  type="text"
                  value={heroTitleInput}
                  onChange={(e) => setHeroTitleInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Subtítulo / Descrição Institucional
                </label>
                <textarea
                  rows={2}
                  value={heroSubtitleInput}
                  onChange={(e) => setHeroSubtitleInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              {/* Background Banner Image */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Imagem de Fundo da Home (Hero Banner)
                </label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-amber-400" />
                    <span>Upload da Galeria</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Ou cole a URL da imagem de fundo"
                    value={heroBannerImageInput}
                    onChange={(e) => setHeroBannerImageInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
                {heroBannerImageInput && (
                  <div className="mt-2 w-48 h-24 rounded-xl overflow-hidden border">
                    <img src={heroBannerImageInput} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Logo & Profile Photo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Logótipo Fornecido
                  </label>
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 w-fit mb-2">
                    <UploadCloud className="w-4 h-4" />
                    <span>Substituir da Galeria</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {customLogoInput && (
                    <img src={customLogoInput} alt="Logo Preview" className="w-16 h-16 object-contain border rounded-lg p-1" />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Foto de Perfil Fornecida (Direção / Consultor)
                  </label>
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 w-fit mb-2">
                    <UploadCloud className="w-4 h-4" />
                    <span>Substituir da Galeria</span>
                    <input type="file" accept="image/*" onChange={handleProfilePhotoUpload} className="hidden" />
                  </label>
                  {profilePhotoInput && (
                    <img src={profilePhotoInput} alt="Profile Preview" className="w-16 h-16 object-cover border rounded-xl" />
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingVisuals}
                className="py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                {isSavingVisuals ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>Guardar Alterações Visuais</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: REAL-TIME MESSAGING INBOX */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col md:flex-row h-[650px]">
            {/* Conversations list sidebar - hidden on mobile when viewing a conversation */}
            <div
              className={`w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50 ${
                selectedConversation ? 'hidden md:flex' : 'flex'
              }`}
            >
              <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span>Chat Online com Clientes</span>
                    {unreadConvsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                        {unreadConvsCount}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-500">Respostas directas em tempo real via Firestore</p>
                </div>
                <button
                  onClick={() => {
                    const unsub = dbService.subscribeConversations(
                      (convs) => setConversations(convs),
                      (err) => console.warn(err)
                    );
                    setTimeout(unsub, 1000);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Atualizar lista"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-600">Nenhuma mensagem recebida ainda.</p>
                    <p className="text-[11px]">Quando os utilizadores enviarem dúvidas pelo chat do site, as conversas surgirão aqui instantaneamente.</p>
                  </div>
                ) : (
                  conversations.map((c) => {
                    const isUnread = (c.unreadByAdmin || 0) > 0;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedConversation(c)}
                        className={`p-3.5 cursor-pointer transition-colors relative ${
                          selectedConversation?.id === c.id
                            ? 'bg-amber-50/80 border-l-4 border-amber-500 shadow-xs'
                            : isUnread
                            ? 'bg-blue-50/60 hover:bg-blue-50 font-semibold border-l-4 border-blue-600'
                            : 'hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 truncate">
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                            )}
                            <span className={`text-xs truncate ${isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                              {c.clientName || 'Cliente Visitante'}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono ml-1">
                            {new Date(c.lastMessageAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className={`text-xs line-clamp-1 ${isUnread ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                          {c.lastMessage}
                        </p>
                        {c.propertyTitle && (
                          <span className="text-[10px] text-amber-800 bg-amber-100/70 border border-amber-200/60 px-1.5 py-0.5 rounded-md mt-1 inline-block truncate max-w-full font-medium">
                            Imóvel: {c.propertyTitle}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Conversation detail and reply window - shown on mobile if conversation is selected */}
            <div
              className={`flex-1 flex flex-col justify-between bg-white ${
                selectedConversation ? 'flex' : 'hidden md:flex'
              }`}
            >
              {selectedConversation ? (
                <>
                  {/* Chat Top Info Header */}
                  <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="md:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1 text-xs font-bold cursor-pointer"
                        title="Voltar às conversas"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Conversas</span>
                      </button>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                          <span>{selectedConversation.clientName}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Online
                          </span>
                        </h4>
                        {selectedConversation.clientPhone && (
                          <a
                            href={`tel:${selectedConversation.clientPhone}`}
                            className="text-xs text-amber-700 font-mono flex items-center gap-1 hover:underline mt-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            {selectedConversation.clientPhone}
                          </a>
                        )}
                      </div>
                    </div>
                    {selectedConversation.propertyTitle && (
                      <span className="text-xs bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200 hidden sm:inline-block max-w-[200px] truncate">
                        Interesse: {selectedConversation.propertyTitle}
                      </span>
                    )}
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
                    {conversationMessages.map((m) => {
                      const isAdminMsg = m.sender === 'admin';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${
                            isAdminMsg ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                              isAdminMsg
                                ? 'bg-gradient-to-r from-[#003366] to-[#0052A5] text-white rounded-tr-none'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{m.text}</p>
                            <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-75">
                              <Clock className="w-2.5 h-2.5" />
                              <span>
                                {new Date(m.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={adminMessagesEndRef} />
                  </div>

                  {/* Quick Replies Strip */}
                  <div className="px-3 py-1.5 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                    <span className="text-slate-500 font-bold shrink-0 text-[10px] uppercase tracking-wider">
                      Respostas rápidas:
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdminReplyText('Olá! Sim, o imóvel continua disponível para visita.')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-200 rounded-full border border-slate-200 text-slate-700 whitespace-nowrap text-[11px] transition-colors cursor-pointer"
                    >
                      Imóvel disponível
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminReplyText('Podemos agendar uma visita ao local. Qual o melhor dia e horário para si?')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-200 rounded-full border border-slate-200 text-slate-700 whitespace-nowrap text-[11px] transition-colors cursor-pointer"
                    >
                      Agendar visita
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminReplyText('Por favor, pode fornecer o seu contacto WhatsApp para enviarmos mais fotografias e detalhes?')}
                      className="px-2.5 py-1 bg-white hover:bg-slate-200 rounded-full border border-slate-200 text-slate-700 whitespace-nowrap text-[11px] transition-colors cursor-pointer"
                    >
                      Pedir WhatsApp
                    </button>
                  </div>

                  {/* Reply Input Form */}
                  <form onSubmit={handleSendAdminReply} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white">
                    <input
                      type="text"
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      placeholder="Escreva a sua resposta directa ao cliente..."
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={!adminReplyText.trim() || isSendingReply}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSendingReply ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">Enviar</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-slate-700 text-sm mb-1">Central de Atendimento ao Cliente</h4>
                  <p className="text-xs max-w-xs text-slate-500">
                    Selecione uma das conversas na coluna esquerda para visualizar as mensagens e responder ao cliente em tempo real.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: INSTITUTIONAL & CONTACTS */}
        {activeTab === 'institutional' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs max-w-3xl space-y-5">
            <div>
              <h2 className="font-brand-display text-xl font-bold text-slate-900">
                Informações Institucionais & Contactos
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Edite a história da imobiliária, missão, visão e canais de contacto.
              </p>
            </div>

            <form onSubmit={handleSaveInstitutional} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  História / Sobre Nós
                </label>
                <textarea
                  rows={3}
                  value={storyInput}
                  onChange={(e) => setStoryInput(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Missão
                  </label>
                  <textarea
                    rows={2}
                    value={missionInput}
                    onChange={(e) => setMissionInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Visão
                  </label>
                  <textarea
                    rows={2}
                    value={visionInput}
                    onChange={(e) => setVisionInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    WhatsApp Principal
                  </label>
                  <input
                    type="text"
                    value={whatsappInput}
                    onChange={(e) => setWhatsappInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Telefone 1
                  </label>
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Telefone 2
                  </label>
                  <input
                    type="text"
                    value={phone2Input}
                    onChange={(e) => setPhone2Input(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Telefone 3
                  </label>
                  <input
                    type="text"
                    value={phone3Input}
                    onChange={(e) => setPhone3Input(e.target.value)}
                    placeholder="Opcional (Ex: +244 928 000 000)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Email Principal
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Email Secundário
                  </label>
                  <input
                    type="email"
                    value={email2Input}
                    onChange={(e) => setEmail2Input(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Website Oficial
                  </label>
                  <input
                    type="text"
                    value={websiteInput}
                    onChange={(e) => setWebsiteInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={instagramInput}
                    onChange={(e) => setInstagramInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Facebook
                  </label>
                  <input
                    type="text"
                    value={facebookInput}
                    onChange={(e) => setFacebookInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Endereço Físico / Províncias
                  </label>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Horário de Atendimento
                  </label>
                  <input
                    type="text"
                    value={hoursInput}
                    onChange={(e) => setHoursInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingInstitutional}
                className="py-3 px-6 bg-[#0052A5] hover:bg-[#003366] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isSavingInstitutional ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>Guardar Informações</span>
              </button>
            </form>

            {/* Gestão da Chave Mestre de Segurança */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-brand-display text-sm font-bold text-slate-900">
                    Chave / Senha Mestre de Acesso
                  </h4>
                  <p className="text-xs text-slate-500">
                    Configure a senha directa utilizada para entrar no painel administrativo sem requerer conta Google.
                  </p>
                </div>
              </div>

              {masterKeyUpdateMsg && (
                <div
                  className={`p-3 rounded-xl text-xs mb-3 flex items-center gap-2 ${
                    masterKeyUpdateMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {masterKeyUpdateMsg.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{masterKeyUpdateMsg.text}</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newMasterKeyInput.trim()) {
                    setMasterKeyUpdateMsg({
                      type: 'error',
                      text: 'Por favor digite a nova senha mestre.',
                    });
                    return;
                  }
                  if (newMasterKeyInput.length < 6) {
                    setMasterKeyUpdateMsg({
                      type: 'error',
                      text: 'A nova senha deve ter no mínimo 6 caracteres.',
                    });
                    return;
                  }
                  if (newMasterKeyInput !== newMasterKeyConfirm) {
                    setMasterKeyUpdateMsg({
                      type: 'error',
                      text: 'As senhas digitadas não coincidem.',
                    });
                    return;
                  }
                  const success = updateMasterKey(newMasterKeyInput);
                  if (success) {
                    setMasterKeyUpdateMsg({
                      type: 'success',
                      text: 'Nova senha mestre guardada com sucesso!',
                    });
                    setNewMasterKeyInput('');
                    setNewMasterKeyConfirm('');
                  } else {
                    setMasterKeyUpdateMsg({
                      type: 'error',
                      text: 'Falha ao guardar nova senha.',
                    });
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-slate-50 p-4 rounded-2xl border border-slate-200"
              >
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Nova Senha Mestre
                  </label>
                  <input
                    type="password"
                    value={newMasterKeyInput}
                    onChange={(e) => setNewMasterKeyInput(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={newMasterKeyConfirm}
                    onChange={(e) => setNewMasterKeyConfirm(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Actualizar Senha</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 7: GESTÃO DE PARCEIROS B12 (TABELA EXCEL DINÂMICA) */}
        {activeTab === 'partners' && (
          <div className="space-y-6">
            {/* Header & Excel Toolbar */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-brand-display text-xl font-bold text-slate-900">
                        Gestão Dinâmica de Parceiros (Área B12)
                      </h2>
                      <span className="text-[11px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">
                        Folha Excel Dinâmica
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Armazenamento e gestão em tempo real de todas as empresas e corretores cadastrados no portal B12 com sincronização direta na Neon Tech.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={loadPartnersList}
                    disabled={isPartnersLoading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    title="Recarregar dados da base de dados"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isPartnersLoading ? 'animate-spin' : ''}`} />
                    <span>Recarregar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportPartnersToCsv}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    title="Exportar folha para ficheiro compatível com Microsoft Excel e Google Sheets"
                  >
                    <Download className="w-4 h-4 text-emerald-200" />
                    <span>Exportar Excel (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Action notice */}
              {partnerActionNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{partnerActionNotice}</span>
                </div>
              )}

              {/* KPI Ribbon Summary (Estilo Folha de Indicadores Excel) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Parceiros</span>
                  <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">{partnersList.length}</span>
                </div>
                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Activos</span>
                  <span className="text-xl font-black text-emerald-900 font-mono mt-0.5 block">
                    {partnersList.filter((p) => p.status === 'active').length}
                  </span>
                </div>
                <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Pendentes</span>
                  <span className="text-xl font-black text-amber-900 font-mono mt-0.5 block">
                    {partnersList.filter((p) => p.status === 'pending').length}
                  </span>
                </div>
                <div className="p-3.5 bg-rose-50/70 rounded-xl border border-rose-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Suspensos</span>
                  <span className="text-xl font-black text-rose-900 font-mono mt-0.5 block">
                    {partnersList.filter((p) => p.status === 'suspended').length}
                  </span>
                </div>
                <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">Imóveis Vinculados</span>
                  <span className="text-xl font-black text-blue-900 font-mono mt-0.5 block">
                    {properties.filter((prop) => Boolean(prop.partnerCompanyName || prop.partnerId)).length}
                  </span>
                </div>
              </div>

              {/* Dynamic Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-slate-100">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={partnerSearchTerm}
                    onChange={(e) => setPartnerSearchTerm(e.target.value)}
                    placeholder="Pesquisar por empresa, NIF, responsável, email ou telefone..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  {partnerSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setPartnerSearchTerm('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={partnerStatusFilter}
                    onChange={(e) => setPartnerStatusFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Todos os Estados</option>
                    <option value="active">Activos</option>
                    <option value="pending">Pendentes</option>
                    <option value="suspended">Suspensos</option>
                  </select>

                  <select
                    value={partnerProvinceFilter}
                    onChange={(e) => setPartnerProvinceFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">Todas as Províncias</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.province}>
                        {loc.province}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Interactive Dynamic Spreadsheet Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  {/* Table Header (Estilo Excel Ribbon) */}
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px] tracking-wider select-none">
                      <th className="py-3 px-3 w-10 text-center border-r border-slate-200">#</th>
                      <th
                        className="py-3 px-4 border-r border-slate-200 cursor-pointer hover:bg-slate-200/80 transition-colors"
                        onClick={() => {
                          setPartnerSortColumn('companyName');
                          setPartnerSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Empresa / Parceiro</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th
                        className="py-3 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-200/80 transition-colors"
                        onClick={() => {
                          setPartnerSortColumn('nif');
                          setPartnerSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>NIF</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4 border-r border-slate-200">Responsável Técnico</th>
                      <th className="py-3 px-4 border-r border-slate-200">Contactos</th>
                      <th
                        className="py-3 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-200/80 transition-colors"
                        onClick={() => {
                          setPartnerSortColumn('province');
                          setPartnerSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Província / Mun.</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-4 border-r border-slate-200">Documentos / Alvará</th>
                      <th className="py-3 px-3 text-center border-r border-slate-200">Imóveis</th>
                      <th
                        className="py-3 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-200/80 transition-colors"
                        onClick={() => {
                          setPartnerSortColumn('status');
                          setPartnerSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Estado</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th
                        className="py-3 px-3 border-r border-slate-200 cursor-pointer hover:bg-slate-200/80 transition-colors"
                        onClick={() => {
                          setPartnerSortColumn('createdAt');
                          setPartnerSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Cadastro</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </div>
                      </th>
                      <th className="py-3 px-3 text-center">Ações</th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-slate-200 font-sans">
                    {filteredSortedPartners.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-12 text-center text-slate-400">
                          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-sm font-bold text-slate-700">Nenhum parceiro encontrado</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {partnersList.length === 0
                              ? 'Ainda não existem parceiros cadastrados via Área B12.'
                              : 'Nenhum parceiro corresponde aos filtros de pesquisa aplicados.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredSortedPartners.map((partner, index) => {
                        const propCount = getPartnerPropertyCount(partner);
                        const cleanPhone = (partner.phone || '').replace(/[^0-9]/g, '');

                        return (
                          <tr
                            key={partner.id}
                            className="hover:bg-emerald-50/50 transition-colors group odd:bg-white even:bg-slate-50/60"
                          >
                            {/* Row Index */}
                            <td className="py-3 px-3 text-center font-mono text-slate-400 border-r border-slate-200 text-[11px]">
                              {index + 1}
                            </td>

                            {/* Empresa / Parceiro */}
                            <td className="py-3 px-4 border-r border-slate-200">
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-emerald-700 shrink-0" />
                                <span className="font-extrabold text-slate-900 group-hover:text-emerald-900">
                                  {partner.companyName}
                                </span>
                              </div>
                            </td>

                            {/* NIF */}
                            <td className="py-3 px-3 border-r border-slate-200 font-mono text-[11px] font-bold text-slate-700">
                              {partner.nif || 'N/A'}
                            </td>

                            {/* Responsável Técnico */}
                            <td className="py-3 px-4 border-r border-slate-200 text-slate-800">
                              {partner.technicalResponsible || '—'}
                            </td>

                            {/* Contactos */}
                            <td className="py-3 px-4 border-r border-slate-200 space-y-1">
                              <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                                <Phone className="w-3 h-3 text-[#0052A5] shrink-0" />
                                <span>{partner.phone}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate max-w-[180px]">
                                <span>{partner.email}</span>
                              </div>
                            </td>

                            {/* Província / Município */}
                            <td className="py-3 px-3 border-r border-slate-200 text-slate-700">
                              <span className="font-bold">{partner.province || 'Luanda'}</span>
                              {partner.municipality && (
                                <span className="text-slate-500 block text-[10px]">{partner.municipality}</span>
                              )}
                            </td>

                            {/* Documentos / Alvará */}
                            <td className="py-3 px-4 border-r border-slate-200 text-[11px] text-slate-600 max-w-[200px] truncate" title={partner.validationDocuments}>
                              {partner.validationDocuments || '—'}
                            </td>

                            {/* Imóveis Publicados */}
                            <td className="py-3 px-3 text-center border-r border-slate-200">
                              <span
                                className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full font-mono text-xs font-extrabold ${
                                  propCount > 0
                                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {propCount}
                              </span>
                            </td>

                            {/* Estado (Dropdown interactivo inline estilo Excel) */}
                            <td className="py-3 px-3 border-r border-slate-200">
                              <select
                                value={partner.status}
                                onChange={(e) => handleUpdatePartnerStatus(partner.id, e.target.value as any)}
                                className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-hidden ${
                                  partner.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : partner.status === 'pending'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : 'bg-rose-50 text-rose-800 border-rose-300'
                                }`}
                              >
                                <option value="active">Activo</option>
                                <option value="pending">Pendente</option>
                                <option value="suspended">Suspenso</option>
                              </select>
                            </td>

                            {/* Data de Registo */}
                            <td className="py-3 px-3 border-r border-slate-200 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                              {partner.createdAt ? new Date(partner.createdAt).toLocaleDateString('pt-AO') : '—'}
                            </td>

                            {/* Ações Rápidas */}
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Olá ${partner.companyName}, da A.PANZO Imobiliária sobre o vosso registo de parceiro B12.`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                                    title="Contactar no WhatsApp"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </a>
                                )}

                                <a
                                  href={`tel:${partner.phone}`}
                                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0052A5] transition-colors"
                                  title="Ligar para o parceiro"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>

                  {/* Summary Footer Row */}
                  <tfoot>
                    <tr className="bg-slate-100 border-t-2 border-slate-300 text-slate-700 font-bold text-[11px]">
                      <td colSpan={2} className="py-3 px-4 border-r border-slate-200">
                        Total de Registos: {filteredSortedPartners.length} parceiros
                      </td>
                      <td colSpan={5} className="py-3 px-4 border-r border-slate-200 text-slate-500">
                        Sincronização Neon Postgres ativa • Todos os cadastros da Área B12 são consolidados automaticamente nesta folha.
                      </td>
                      <td className="py-3 px-3 text-center border-r border-slate-200 font-mono text-emerald-900">
                        {filteredSortedPartners.reduce((acc, p) => acc + getPartnerPropertyCount(p), 0)} imóveis
                      </td>
                      <td colSpan={3} className="py-3 px-3 text-right text-slate-500">
                        Exportação disponível em formato .CSV
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Property Publish & Edit Modal */}
      {propertyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto sm:my-6 border border-slate-200 flex flex-col h-[95vh] sm:h-auto sm:max-h-[90vh]">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0 z-10">
              <h3 className="font-brand-display text-base sm:text-lg font-bold text-slate-900">
                {editingPropertyId ? 'Editar Imóvel' : 'Publicar Novo Imóvel'}
              </h3>
              <button
                type="button"
                onClick={() => setPropertyModalOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-200 cursor-pointer touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProperty} className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs -webkit-overflow-scrolling-touch">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Title & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <label className="block font-bold uppercase text-slate-500 mb-1">Título do Imóvel *</label>
                  <input
                    type="text"
                    required
                    value={propTitle}
                    onChange={(e) => setPropTitle(e.target.value)}
                    placeholder="Ex: Vivenda V4 Moderna com Piscina no Talatona"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Código / Ref</label>
                  <input
                    type="text"
                    value={propCode}
                    onChange={(e) => setPropCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Deal Type, Category, Condition, Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Tipo de Negócio *</label>
                  <select
                    value={propDealType}
                    onChange={(e) => setPropDealType(e.target.value as DealType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="venda">Venda</option>
                    <option value="arrendamento">Arrendamento</option>
                    <option value="trespasse">Trespasse</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Categoria *</label>
                  <select
                    value={propCategory}
                    onChange={(e) => setPropCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Estado</label>
                  <select
                    value={propCondition}
                    onChange={(e) => setPropCondition(e.target.value as PropertyCondition)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="novo">Novo / Estrear</option>
                    <option value="usado">Usado / Bom estado</option>
                    <option value="remodelado">Remodelado</option>
                    <option value="em_construcao">Em Construção</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Status</label>
                  <select
                    value={propStatus}
                    onChange={(e) => setPropStatus(e.target.value as PropertyStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="disponivel">Disponível</option>
                    <option value="reservado">Reservado</option>
                    <option value="vendido">Vendido</option>
                    <option value="arrendado">Arrendado</option>
                  </select>
                </div>
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase text-slate-500 mb-1">Preço *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      value={propPrice}
                      onChange={(e) => setPropPrice(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Ex: 85000000"
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                    />
                    <select
                      value={propCurrency}
                      onChange={(e) => setPropCurrency(e.target.value as any)}
                      className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800"
                    >
                      <option value="AOA">AOA (Kz)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={propIsNegotiable}
                      onChange={(e) => setPropIsNegotiable(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Preço Negociável</span>
                  </label>
                </div>
              </div>

              {/* Location: Province & Municipality & Neighborhood */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Província *</label>
                  <select
                    value={propProvince}
                    onChange={(e) => {
                      setPropProvince(e.target.value);
                      const loc = locations.find((l) => l.province === e.target.value);
                      if (loc && loc.municipalities.length > 0) {
                        setPropMunicipality(loc.municipalities[0]);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.province}>
                        {loc.province}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Município *</label>
                  <select
                    value={propMunicipality}
                    onChange={(e) => setPropMunicipality(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    {availableMunicipalities.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Bairro / Condomínio</label>
                  <input
                    type="text"
                    value={propNeighborhood}
                    onChange={(e) => setPropNeighborhood(e.target.value)}
                    placeholder="Ex: Talatona, Alvalade, Kilamba..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              {/* Area, Bedrooms, Bathrooms, Parking */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Área (m²)</label>
                  <input
                    type="number"
                    value={propArea}
                    onChange={(e) => setPropArea(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ex: 350"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Quartos (T1..T4+)</label>
                  <select
                    value={propBedrooms}
                    onChange={(e) => setPropBedrooms(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value={0}>0 (Comercial / Terreno)</option>
                    <option value={1}>1 (T1)</option>
                    <option value={2}>2 (T2)</option>
                    <option value={3}>3 (T3)</option>
                    <option value={4}>4 (T4)</option>
                    <option value={5}>5 ou mais (T4+ / T5)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Casas de Banho</label>
                  <input
                    type="number"
                    value={propBathrooms}
                    onChange={(e) => setPropBathrooms(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-500 mb-1">Vagas de Garagem</label>
                  <input
                    type="number"
                    value={propParking}
                    onChange={(e) => setPropParking(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              {/* Photos Upload from Device Gallery (Supports 15+ photos) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-bold uppercase text-slate-700 block text-xs">
                      Fotografias do Imóvel ({propImages.length} selecionadas)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Upload otimizado direto da galeria com suporte a 15+ fotos em alta definição.
                    </p>
                  </div>

                  <input
                    ref={adminFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      adminFileInputRef.current?.click();
                    }}
                    disabled={isProcessingMedia}
                    className="w-full sm:w-auto cursor-pointer bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs touch-manipulation min-h-[42px]"
                  >
                    {isProcessingMedia ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                    <span>{isProcessingMedia ? 'A Processar...' : 'Adicionar Fotos da Galeria'}</span>
                  </button>
                </div>

                {/* Progress bar */}
                {isProcessingMedia && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-amber-950 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                        {mediaUploadProgress || 'A processar imagens...'}
                      </span>
                      <span>{mediaUploadPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-amber-200/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all duration-200"
                        style={{ width: `${mediaUploadPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Thumbnail grid */}
                {propImages.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1 max-h-48 overflow-y-auto p-1">
                    {propImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100 shadow-2xs">
                        <img
                          src={img}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[9px] uppercase tracking-wider">
                            Capa
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto(idx);
                          }}
                          className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer shadow-xs"
                          title="Remover foto"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                    Nenhuma fotografia carregada ainda. Toque no botão acima para selecionar fotos da galeria.
                  </div>
                )}
              </div>

              {/* Partner Company Association (Área B12) */}
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/90 space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <label className="text-xs font-bold uppercase text-amber-900">
                    Vincular a Empresa Parceira (Área B12)
                  </label>
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 font-extrabold px-1.5 py-0.5 rounded-md ml-auto">
                    Opcional
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Se este imóvel pertencer a um parceiro cadastrado, selecione abaixo para exibir a identificação pública da empresa no anúncio.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={propPartnerCompanyName}
                    onChange={(e) => setPropPartnerCompanyName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Nenhum (Imóvel Próprio A.PANZO)</option>
                    {partnersList.map((p) => (
                      <option key={p.id} value={p.companyName}>
                        {p.companyName} ({p.province || 'Angola'} - NIF: {p.nif})
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={propPartnerCompanyName}
                    onChange={(e) => setPropPartnerCompanyName(e.target.value)}
                    placeholder="Ou digite o nome da empresa parceira..."
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Video from Device Gallery or Link */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-bold uppercase text-slate-700 block text-xs">
                      Vídeo do Imóvel (Neon Tech Otimizado)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Cole o link do YouTube / Vimeo ou envie um clipe curto da sua galeria.
                    </p>
                  </div>

                  <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-xs text-xs">
                    <Video className="w-4 h-4 text-amber-400" />
                    <span>Upload da Galeria</span>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                  </label>
                </div>

                {/* Progress bar during video processing */}
                {isProcessingMedia && mediaUploadProgress && mediaUploadProgress.toLowerCase().includes('vídeo') && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#0052A5]" />
                        {mediaUploadProgress}
                      </span>
                      <span>{mediaUploadPercent}%</span>
                    </div>
                    <div className="w-full bg-blue-200/60 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#0052A5] h-full transition-all duration-300 rounded-full"
                        style={{ width: `${mediaUploadPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Video Link input for fast streaming without DB bloat */}
                <div>
                  <input
                    type="url"
                    value={propVideoUrl}
                    onChange={(e) => setPropVideoUrl(e.target.value)}
                    placeholder="Ex: https://www.youtube.com/watch?v=... ou link direto MP4"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Dica Neon Free: Links do YouTube/Shorts/Vimeo não ocupam limite da base de dados e reproduzem instantaneamente para todos os visitantes.
                  </p>
                </div>

                {propVideoUrl && (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="truncate max-w-xs font-mono text-emerald-900 text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      Vídeo configurado ({propVideoUrl.slice(0, 35)}...)
                    </span>
                    <button
                      type="button"
                      onClick={() => setPropVideoUrl('')}
                      className="text-rose-600 font-bold text-xs hover:underline cursor-pointer"
                    >
                      Remover Vídeo
                    </button>
                  </div>
                )}
              </div>

              {/* Features / Checklist */}
              <div>
                <label className="block font-bold uppercase text-slate-500 mb-2">
                  Características & Comodidades
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMON_FEATURES_LIST.map((feat) => (
                    <button
                      type="button"
                      key={feat}
                      onClick={() => handleToggleFeature(feat)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        propFeatures.includes(feat)
                          ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle
                        className={`w-3.5 h-3.5 ${
                          propFeatures.includes(feat) ? 'text-amber-600' : 'text-slate-300'
                        }`}
                      />
                      <span className="truncate">{feat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold uppercase text-slate-500 mb-1">Descrição Completa</label>
                <textarea
                  rows={4}
                  value={propDescription}
                  onChange={(e) => setPropDescription(e.target.value)}
                  placeholder="Descreva detalhadamente o imóvel, acabamentos, localização e vantagens..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              {/* Featured toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={propIsFeatured}
                    onChange={(e) => setPropIsFeatured(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Destacar este anúncio na primeira página</span>
                </label>
              </div>

              {/* Submit & Cancel */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between sm:justify-end gap-3 sticky bottom-0 bg-white pb-1 z-10">
                <button
                  type="button"
                  onClick={() => setPropertyModalOpen(false)}
                  className="flex-1 sm:flex-initial px-4 py-3 sm:py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm text-center min-h-[44px] touch-manipulation cursor-pointer hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProperty || isProcessingMedia}
                  className="flex-1 sm:flex-initial px-6 py-3 sm:py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer touch-manipulation min-h-[44px] disabled:opacity-50"
                >
                  {isSavingProperty ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>A gravar...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{editingPropertyId ? 'Salvar Alterações' : 'Publicar Anúncio'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
