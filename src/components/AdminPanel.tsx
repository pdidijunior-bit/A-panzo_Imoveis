import React, { useState, useEffect } from 'react';
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
} from '../types';
import { COMMON_FEATURES_LIST } from '../lib/defaultData';

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
    'properties' | 'categories' | 'locations' | 'visuals' | 'messages' | 'institutional'
  >('properties');

  // Property Form Modal State
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);

  // Property Form fields
  const [propTitle, setPropTitle] = useState('');
  const [propCode, setPropCode] = useState('');
  const [propDealType, setPropDealType] = useState<DealType>('venda');
  const [propCategory, setPropCategory] = useState('');
  const [propPrice, setPropPrice] = useState<number | ''>('');
  const [propCurrency, setPropCurrency] = useState<'AOA' | 'USD'>('AOA');
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
  const [phoneInput, setPhoneInput] = useState(siteSettings.phone || '+244 924 875 869');
  const [whatsappInput, setWhatsappInput] = useState(siteSettings.whatsapp || '+244 924 875 869');
  const [emailInput, setEmailInput] = useState(siteSettings.email || 'contacto@aliancaimobiliaria.ao');
  const [addressInput, setAddressInput] = useState(siteSettings.address || 'Luanda & Malanje, Angola');
  const [hoursInput, setHoursInput] = useState(siteSettings.workingHours || 'Segunda a Sábado: 08:00 - 18:00');
  const [isSavingInstitutional, setIsSavingInstitutional] = useState(false);

  // Real-Time Messages State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

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
    setPropCode(`ALI-${Math.floor(100 + Math.random() * 900)}`);
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
    setPropCurrency(prop.currency || 'AOA');
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
    setFormError(null);
    setFormSuccess(null);
    setPropertyModalOpen(true);
  };

  // Multiple Photo Upload from Device Gallery with Client Compression
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingMedia(true);
    setMediaUploadProgress(`A processar ${files.length} fotografia(s) da galeria...`);

    const newCompressedImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setMediaUploadProgress(`A otimizar fotografia ${i + 1} de ${files.length}...`);
        const compressedDataUrl = await compressImageFile(file, 1280, 1280, 0.75);
        newCompressedImages.push(compressedDataUrl);
      }

      setPropImages((prev) => [...prev, ...newCompressedImages]);
      setMediaUploadProgress(null);
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
        condition: propCondition || 'Usado / Bom estado',
        status: propStatus || 'Disponível',
        isFeatured: Boolean(propIsFeatured),
        images: Array.isArray(propImages) ? propImages : [],
        videoUrl: propVideoUrl.trim() || null,
        hasVideo: Boolean(propVideoUrl.trim()),
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
        whatsapp: whatsappInput.trim(),
        email: emailInput.trim(),
        address: addressInput.trim(),
        workingHours: hoursInput.trim(),
      });
      alert('Informações institucionais e contactos atualizados!');
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
        'Consultor Aliança Imobiliária',
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
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-md shadow-amber-500/20">
            <Shield className="w-7 h-7" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block mb-1">
            Aliança Imobiliária
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
            <span>Aliança Imobiliária • Angola</span>
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
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-xs">
            ALI
          </div>
          <div>
            <h1 className="font-brand-display text-base font-bold text-white leading-none">
              Painel ADM • Aliança Imobiliária
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
          <button
            onClick={signOut}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors text-xs font-medium flex items-center gap-1.5"
            title="Terminar Sessão"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition-all"
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
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
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
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'messages'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Central de Mensagens ({conversations.length})</span>
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
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'institutional'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Sobre Nós & Contactos</span>
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
                  Publique, edite e gira o catálogo de propriedades da Aliança Imobiliária.
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
                    <div className="relative aspect-16/10 bg-slate-100">
                      <img
                        src={
                          prop.images?.[0] ||
                          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={prop.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
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
                          {new Intl.NumberFormat('pt-AO', {
                            style: 'currency',
                            currency: prop.currency || 'AOA',
                            maximumFractionDigits: 0,
                          })
                            .format(prop.price)
                            .replace('AOA', 'Kz')}
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col md:flex-row h-[600px]">
            {/* Conversations list sidebar */}
            <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
              <div className="p-4 border-b border-slate-200 bg-white">
                <h3 className="font-bold text-sm text-slate-900">Mensagens dos Clientes</h3>
                <p className="text-[11px] text-slate-500">Conversas em tempo real via Firestore</p>
              </div>

              <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Nenhuma mensagem recebida ainda.
                  </div>
                ) : (
                  conversations.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedConversation(c)}
                      className={`p-3.5 cursor-pointer transition-colors ${
                        selectedConversation?.id === c.id
                          ? 'bg-amber-50 border-l-4 border-amber-500'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {c.clientName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.lastMessageAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">{c.lastMessage}</p>
                      {c.propertyTitle && (
                        <span className="text-[10px] text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded mt-1 inline-block truncate max-w-full">
                          Imóvel: {c.propertyTitle}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Conversation detail and reply window */}
            <div className="flex-1 flex flex-col justify-between bg-white">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{selectedConversation.clientName}</h4>
                      {selectedConversation.clientPhone && (
                        <a
                          href={`tel:${selectedConversation.clientPhone}`}
                          className="text-xs text-amber-700 font-mono flex items-center gap-1 hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          {selectedConversation.clientPhone}
                        </a>
                      )}
                    </div>
                    {selectedConversation.propertyTitle && (
                      <span className="text-xs bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200">
                        Interesse: {selectedConversation.propertyTitle}
                      </span>
                    )}
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
                    {conversationMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${
                          m.sender === 'admin' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                            m.sender === 'admin'
                              ? 'bg-slate-950 text-white rounded-tr-none'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                          }`}
                        >
                          <p>{m.text}</p>
                          <span className="text-[9px] text-slate-400 block text-right mt-1">
                            {new Date(m.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input Form */}
                  <form onSubmit={handleSendAdminReply} className="p-3 border-t border-slate-200 flex items-center gap-2">
                    <input
                      type="text"
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      placeholder="Responder ao cliente em tempo real..."
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={!adminReplyText.trim() || isSendingReply}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                  Selecione uma conversa ao lado para responder.
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    WhatsApp Oficial
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
                    Telefone Normal
                  </label>
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Email de Contacto
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

              <button
                type="submit"
                disabled={isSavingInstitutional}
                className="py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
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
      </main>

      {/* Property Publish & Edit Modal */}
      {propertyModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
              <h3 className="font-brand-display text-lg font-bold text-slate-900">
                {editingPropertyId ? 'Editar Imóvel' : 'Publicar Novo Imóvel'}
              </h3>
              <button
                onClick={() => setPropertyModalOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProperty} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
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

              {/* Photos Upload from Device Gallery (No Firebase Storage required) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold uppercase text-slate-700 block">
                      Fotografias da Galeria ({propImages.length} selecionadas)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Upload direto da galeria com compressão automática sem custos de Storage.
                    </p>
                  </div>

                  <label className="cursor-pointer bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs">
                    <ImageIcon className="w-4 h-4" />
                    <span>Adicionar Fotos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {mediaUploadProgress && (
                  <div className="p-2.5 bg-amber-100/70 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span>{mediaUploadProgress}</span>
                  </div>
                )}

                {/* Thumbnail grid */}
                {propImages.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {propImages.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border">
                        <img src={img} alt="Foto" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 p-1 bg-slate-950/70 text-white rounded-full hover:bg-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video from Device Gallery or Link */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-bold uppercase text-slate-700 block">Vídeo Curto do Imóvel</label>
                    <p className="text-[11px] text-slate-500">
                      Upload direto da galeria ou link de vídeo.
                    </p>
                  </div>

                  <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs">
                    <Video className="w-4 h-4" />
                    <span>Upload Vídeo</span>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                  </label>
                </div>

                {propVideoUrl && (
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="truncate max-w-xs font-mono text-slate-700 text-xs">
                      Vídeo anexado com sucesso
                    </span>
                    <button
                      type="button"
                      onClick={() => setPropVideoUrl('')}
                      className="text-rose-600 font-semibold"
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
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={() => setPropertyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProperty || isProcessingMedia}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-md flex items-center gap-2"
                >
                  {isSavingProperty ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>{editingPropertyId ? 'Salvar Alterações' : 'Publicar Anúncio'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
