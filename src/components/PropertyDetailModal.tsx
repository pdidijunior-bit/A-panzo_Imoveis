import React, { useState } from 'react';
import {
  X,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Car,
  CheckCircle2,
  Phone,
  MessageCircle,
  Headphones,
  Video,
  Share2,
  Calendar,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Heart,
  Bell,
} from 'lucide-react';
import { Property } from '../types';
import { useFavoritesAndAlerts } from '../context/FavoritesAndAlertsContext';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  agencyPhone: string;
  agencyWhatsapp: string;
  onOpenLiveChatWithProperty: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  agencyPhone,
  agencyWhatsapp,
  onOpenLiveChatWithProperty,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'video'>('photos');
  const [copied, setCopied] = useState(false);

  const { isFavorite, toggleFavorite, openCreateAlertModal } = useFavoritesAndAlerts();

  if (!property) return null;

  const favorited = isFavorite(property.id);

  const formatKz = (val: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: property.currency || 'AOA',
      maximumFractionDigits: 0,
    })
      .format(val)
      .replace('AOA', 'Kz');
  };

  const cleanWhatsapp = agencyWhatsapp.replace(/[^0-9]/g, '');

  const whatsappMessage = encodeURIComponent(
    `Olá Aliança Imobiliária! Tenho interesse no imóvel "${property.title}" (Cód: ${property.code || property.id.slice(0, 6).toUpperCase()}) em ${property.municipality}, ${property.province}. Preço: ${formatKz(property.price)}${property.dealType === 'arrendamento' ? '/mês' : ''}. Desejo mais informações e agendamento de visita.`
  );

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              {property.code || property.id.slice(0, 6).toUpperCase()}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {property.dealType === 'venda'
                ? 'Imóvel para Venda'
                : property.dealType === 'arrendamento'
                ? 'Imóvel para Arrendamento'
                : 'Trespasse'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Favorite Toggle Button */}
            <button
              id="detail-modal-fav-btn"
              onClick={() => toggleFavorite(property)}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                favorited
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
              title={favorited ? 'Remover dos favoritos' : 'Guardar nos favoritos'}
            >
              <Heart
                className={`w-4 h-4 ${
                  favorited ? 'fill-rose-500 text-rose-500' : 'text-slate-500'
                }`}
              />
              <span className="hidden sm:inline">
                {favorited ? 'Guardado' : 'Favorito'}
              </span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors text-xs font-medium flex items-center gap-1"
              title="Partilhar link deste imóvel"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Partilhar'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-200 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1">
          {/* Media Player / Carousel */}
          <div className="space-y-2">
            {/* Tabs for Photos / Video */}
            {property.hasVideo && (
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setActiveMediaTab('photos')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeMediaTab === 'photos'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Fotografias ({images.length})
                </button>
                <button
                  onClick={() => setActiveMediaTab('video')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeMediaTab === 'video'
                      ? 'bg-amber-500 text-slate-950 font-extrabold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  Vídeo do Imóvel
                </button>
              </div>
            )}

            {activeMediaTab === 'photos' ? (
              <div className="space-y-2">
                {/* Main Large Photo */}
                <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
                  <img
                    src={images[activeImageIndex]}
                    alt={property.title}
                    className="w-full h-full object-contain sm:object-cover"
                  />

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-950 transition-colors"
                        aria-label="Foto anterior"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-950 transition-colors"
                        aria-label="Próxima foto"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails strip */}
                {images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                          activeImageIndex === idx
                            ? 'border-amber-500 scale-95 shadow-sm'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Video player */
              <div className="aspect-16/9 rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                {property.videoUrl ? (
                  <video
                    src={property.videoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <p className="text-slate-400 text-sm">Vídeo indisponível.</p>
                )}
              </div>
            )}
          </div>

          {/* Title, Category & Price Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-amber-600">
                <span>{property.categoryName || property.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  {property.neighborhood ? `${property.neighborhood}, ` : ''}
                  {property.municipality}, {property.province}
                </span>
              </div>

              <h2 className="font-brand-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {property.title}
              </h2>

              {property.addressReference && (
                <p className="text-xs text-slate-500 mt-1">
                  Ponto de Referência: {property.addressReference}
                </p>
              )}
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-xs uppercase font-bold text-slate-400 block">Valor Pedido</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono">
                {formatKz(property.price)}
              </span>
              {property.dealType === 'arrendamento' && (
                <span className="text-xs text-slate-500 font-normal"> /mês</span>
              )}
              {property.isNegotiable && (
                <div className="mt-1">
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block">
                    Preço Negociável
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Core Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <BedDouble className="w-3.5 h-3.5 text-amber-500" />
                Tipologia
              </span>
              <p className="text-base font-bold text-slate-800 mt-1">
                {property.bedrooms > 0
                  ? property.bedrooms >= 5
                    ? 'T4+ (5 ou mais)'
                    : `T${property.bedrooms}`
                  : 'N/A'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-amber-500" />
                Casas de Banho
              </span>
              <p className="text-base font-bold text-slate-800 mt-1">
                {property.bathrooms > 0 ? `${property.bathrooms} WC` : 'N/A'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-amber-500" />
                Área Total
              </span>
              <p className="text-base font-bold text-slate-800 mt-1 font-mono">
                {property.area > 0 ? `${property.area} m²` : 'Sob consulta'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-amber-500" />
                Estacionamento
              </span>
              <p className="text-base font-bold text-slate-800 mt-1">
                {property.parkingSpaces > 0 ? `${property.parkingSpaces} vagas` : 'Sob consulta'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2">
              Descrição do Imóvel
            </h4>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              {property.description || 'Sem descrição adicional fornecida pela imobiliária.'}
            </div>
          </div>

          {/* Features / Amenities */}
          {property.features && property.features.length > 0 && (
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3">
                Características & Comodidades
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {property.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legal Security Guarantee Badge */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-amber-950 uppercase">Garantia Aliança Imobiliária</h5>
              <p className="text-xs text-amber-800/90 mt-0.5">
                Todos os imóveis mediados pela nossa agência contam com verificação jurídica prévia, apoio na formalização de contratos e acompanhamento presencial em todas as fases.
              </p>
            </div>
          </div>

          {/* Create Alert for Similar Properties */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 uppercase">
                  Gostou deste perfil de imóvel?
                </h5>
                <p className="text-xs text-slate-600 mt-0.5">
                  Ative um alerta para receber notificações automáticas no portal de novos imóveis em {property.municipality || property.province} semelhantes a este.
                </p>
              </div>
            </div>

            <button
              id="detail-create-similar-alert-btn"
              onClick={() => {
                onClose();
                openCreateAlertModal({
                  dealType: property.dealType,
                  category: property.category,
                  province: property.province,
                  municipality: property.municipality,
                  bedrooms:
                    property.bedrooms > 0
                      ? property.bedrooms >= 5
                        ? '5+'
                        : String(property.bedrooms)
                      : 'todos',
                  maxPrice: Math.round(property.price * 1.15),
                });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs shrink-0 shadow-sm transition-all"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              Criar Alerta deste Perfil
            </button>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20">
          <div className="hidden sm:block">
            <p className="text-xs text-slate-400">Interessado neste imóvel?</p>
            <p className="text-sm font-bold text-amber-300">Entre em contacto com os nossos consultores</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* WhatsApp Button */}
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Directo</span>
            </a>

            {/* Normal Phone Call */}
            <a
              href={`tel:${agencyPhone}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 active:scale-95 text-slate-950 font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md"
            >
              <Phone className="w-4 h-4 text-amber-600" />
              <span>Ligar: {agencyPhone}</span>
            </a>

            {/* Real-Time Site Chat Button */}
            <button
              onClick={() => {
                onClose();
                onOpenLiveChatWithProperty(property);
              }}
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold text-xs py-3 px-3.5 rounded-xl transition-all shadow-md"
              title="Falar no chat em tempo real"
            >
              <Headphones className="w-4 h-4" />
              <span className="hidden md:inline">Chat no Site</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
