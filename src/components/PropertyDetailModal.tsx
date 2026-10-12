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
  Building2,
  ExternalLink,
} from 'lucide-react';
import { Property } from '../types';
import { useFavoritesAndAlerts } from '../context/FavoritesAndAlertsContext';
import { formatCurrency } from '../lib/formatters';
import { parseVideoSource } from '../lib/videoUtils';

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
  const [isFullscreenPhoto, setIsFullscreenPhoto] = useState(false);
  const [copied, setCopied] = useState(false);

  const { isFavorite, toggleFavorite, openCreateAlertModal } = useFavoritesAndAlerts();

  if (!property) return null;

  const favorited = isFavorite(property.id);

  const formatKz = (val: number) => {
    return formatCurrency(val, property?.currency);
  };

  const cleanWhatsapp = (agencyWhatsapp || '+244 925 883 080').replace(/[^0-9]/g, '');
  const propCode = property.code || String(property.id || '').slice(0, 6).toUpperCase();

  const whatsappMessage = encodeURIComponent(
    `Olá A.PANZO Imobiliária! Tenho interesse no imóvel "${property.title || 'Imóvel'}" (Cód: ${propCode}) em ${property.municipality || 'Luanda'}, ${property.province || 'Luanda'}. Preço: ${formatKz(property.price)}${property.dealType === 'arrendamento' ? '/mês' : ''}. Desejo mais informações e agendamento de visita.`
  );

  const images = property.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&fm=webp&w=1200&q=82'];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const parsedVideo = parseVideoSource(property.videoUrl);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      {/* Floating mobile close button (high priority touch, iOS safe area safe) */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-[max(0.85rem,env(safe-area-inset-top,14px))] right-[max(0.85rem,env(safe-area-inset-right,14px))] sm:hidden z-[99999] min-w-[48px] min-h-[48px] p-3 rounded-full bg-slate-950/95 hover:bg-black active:scale-90 text-white border-2 border-white/40 shadow-2xl flex items-center justify-center cursor-pointer touch-manipulation"
        aria-label="Fechar Janela"
        title="Fechar"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto border border-slate-200 flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white/95 sm:bg-slate-50/90 backdrop-blur-md sticky top-0 z-30 pt-[max(0.75rem,env(safe-area-inset-top,12px))]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              {propCode}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate max-w-[130px] sm:max-w-none">
              {property.dealType === 'venda'
                ? 'Imóvel para Venda'
                : property.dealType === 'arrendamento'
                ? 'Imóvel para Arrendamento'
                : 'Trespasse'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Favorite Toggle Button */}
            <button
              id="detail-modal-fav-btn"
              onClick={() => toggleFavorite(property)}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all min-h-[40px] touch-manipulation ${
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
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors text-xs font-medium flex items-center gap-1 min-h-[40px] touch-manipulation"
              title="Partilhar link deste imóvel"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Partilhar'}</span>
            </button>

            {/* Header Close Button (Visible and high-priority on both mobile and desktop) */}
            <button
              onClick={onClose}
              className="flex min-w-[40px] min-h-[40px] items-center justify-center text-slate-700 hover:text-slate-950 rounded-full hover:bg-slate-200/70 bg-slate-100 transition-all border border-slate-200 active:scale-95 touch-manipulation cursor-pointer"
              aria-label="Fechar"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-7 space-y-6 flex-1">
          {/* Media Player / Carousel */}
          <div className="space-y-2">
            {/* Tabs for Photos / Video */}
            {property.hasVideo && (
              <div className="flex items-center gap-2 mb-2 sticky top-0 z-30 bg-white/95 backdrop-blur-xs py-1">
                <button
                  onClick={() => setActiveMediaTab('photos')}
                  className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation ${
                    activeMediaTab === 'photos'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Fotografias ({images.length})
                </button>
                <button
                  onClick={() => setActiveMediaTab('video')}
                  className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation ${
                    activeMediaTab === 'video'
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Video className="w-4 h-4 text-amber-900" />
                  Vídeo do Imóvel
                </button>
              </div>
            )}

            {activeMediaTab === 'photos' ? (
              <div className="space-y-3">
                {/* Main Large Photo - 100% Uncropped Responsive Presentation */}
                <div
                  className="relative w-full min-h-[260px] sm:min-h-[320px] h-[45vh] max-h-[560px] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center select-none group border border-slate-800 shadow-inner cursor-zoom-in"
                  onClick={() => setIsFullscreenPhoto(true)}
                  title="Clique para visualizar em tela cheia"
                >
                  {/* Ambient Backdrop */}
                  <img
                    src={images[activeImageIndex]}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110 pointer-events-none"
                  />

                  {/* Pristine Full Image */}
                  <img
                    src={images[activeImageIndex]}
                    alt={property.title}
                    className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain mx-auto transition-transform duration-300 drop-shadow-md group-hover:scale-[1.02]"
                  />

                  {/* Fullscreen Expand Action Badge */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFullscreenPhoto(true);
                    }}
                    className="absolute top-3 right-3 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-950/75 hover:bg-slate-900 active:scale-95 text-white backdrop-blur-md border border-white/20 shadow-lg transition-all"
                    title="Ver em tela cheia"
                  >
                    <Maximize2 className="w-4 h-4 text-amber-400" />
                  </button>

                  {/* Counter Badge */}
                  <div className="absolute bottom-3 right-3 z-20 px-2.5 py-1 rounded-lg bg-slate-950/80 text-white text-xs font-mono backdrop-blur-md border border-white/10">
                    {activeImageIndex + 1} / {images.length}
                  </div>

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                        }}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-slate-950/80 text-white hover:bg-amber-500 hover:text-slate-950 active:scale-95 transition-all shadow-xl border border-white/20"
                        aria-label="Foto anterior"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-slate-950/80 text-white hover:bg-amber-500 hover:text-slate-950 active:scale-95 transition-all shadow-xl border border-white/20"
                        aria-label="Próxima foto"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails strip */}
                {images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all bg-slate-900 ${
                          activeImageIndex === idx
                            ? 'border-amber-500 scale-95 shadow-md ring-2 ring-amber-500/30'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Enhanced Universal Video player (YouTube, Vimeo, MP4) */
              <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-inner border border-slate-800">
                {parsedVideo.type === 'youtube' && parsedVideo.embedUrl ? (
                  <iframe
                    src={parsedVideo.embedUrl}
                    title={`Vídeo: ${property.title}`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : parsedVideo.type === 'vimeo' && parsedVideo.embedUrl ? (
                  <iframe
                    src={parsedVideo.embedUrl}
                    title={`Vídeo: ${property.title}`}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : parsedVideo.type === 'direct' && parsedVideo.directUrl ? (
                  <video
                    src={parsedVideo.directUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    <Video className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-medium">Vídeo indisponível ou link inválido.</p>
                  </div>
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

              {/* Partner Company Identification (Requisito B12) */}
              {property.partnerCompanyName && (
                <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-2xs">
                  <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Imóvel Angariado por Parceiro: <strong className="text-amber-950 font-black">{property.partnerCompanyName}</strong></span>
                  <span className="text-[10px] bg-amber-200/90 text-amber-900 px-1.5 py-0.5 rounded-md font-extrabold uppercase">Verificado B12</span>
                </div>
              )}

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
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#0052A5] shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-[#003366] uppercase">Garantia A.PANZO Imobiliária</h5>
              <p className="text-xs text-slate-700 mt-0.5">
                Cuidamos do seu imóvel como se fosse nosso. Todos os imóveis mediados contam com verificação jurídica prévia, apoio na formalização contratual e acompanhamento presencial em todas as fases.
              </p>
            </div>
          </div>

          {/* Create Alert for Similar Properties */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0052A5] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
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
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0052A5] hover:bg-[#003366] text-white font-bold text-xs shrink-0 shadow-sm transition-all"
            >
              <Bell className="w-3.5 h-3.5 text-blue-200" />
              <span>Criar Alerta</span>
            </button>
          </div>
        </div>

        {/* Sticky Action Footer with Safe Area Support for iPhone and Android touchscreens */}
        <div className="p-4 sm:p-5 pb-[max(1rem,env(safe-area-inset-bottom,16px))] bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-30 shadow-2xl">
          <div className="hidden sm:block">
            <p className="text-xs text-slate-400">Interessado neste imóvel? Telefone: <span className="font-mono text-white">{agencyPhone}</span></p>
            <p className="text-sm font-bold text-blue-300">Entre em contacto com os nossos consultores</p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* WhatsApp Button - Clean Essential Label */}
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-5 rounded-xl transition-all shadow-md touch-manipulation min-h-[46px]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Fale Connosco</span>
            </a>

            {/* Normal Phone Call - Clean Essential Label */}
            <a
              href={`tel:${agencyPhone}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#0052A5] hover:bg-[#003366] active:scale-95 text-white font-bold text-xs py-3.5 px-5 rounded-xl transition-all shadow-md touch-manipulation min-h-[46px]"
              title={`Ligar para ${agencyPhone}`}
            >
              <Phone className="w-4 h-4 text-white" />
              <span>Ligar Agora</span>
            </a>

            {/* Real-Time Site Chat Button */}
            <button
              onClick={() => {
                onClose();
                onOpenLiveChatWithProperty(property);
              }}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition-all border border-white/20 shadow-sm touch-manipulation min-h-[46px]"
              title="Apoio e Atendimento no Site"
            >
              <Headphones className="w-4 h-4 text-blue-300" />
              <span className="hidden md:inline">Apoio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen High-Resolution Lightbox Modal */}
      {isFullscreenPhoto && (
        <div
          className="fixed inset-0 z-[100000] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 select-none"
          onClick={() => setIsFullscreenPhoto(false)}
        >
          {/* Lightbox Safe-Area Notch-Resistant Close Button */}
          <button
            onClick={() => setIsFullscreenPhoto(false)}
            className="fixed top-[max(1rem,env(safe-area-inset-top,16px))] right-[max(1rem,env(safe-area-inset-right,16px))] z-[100001] min-w-[50px] min-h-[50px] p-3 rounded-full bg-white/20 hover:bg-white/30 active:scale-90 text-white backdrop-blur-md border border-white/30 shadow-2xl flex items-center justify-center touch-manipulation cursor-pointer"
            title="Fechar tela cheia"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div
            className="relative w-full h-full max-w-6xl max-h-[88vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[activeImageIndex]}
              alt={property.title}
              className="max-w-full max-h-full w-auto h-auto object-contain mx-auto shadow-2xl rounded-lg"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-[100001] min-w-[50px] min-h-[50px] flex items-center justify-center rounded-full bg-black/75 hover:bg-amber-500 hover:text-slate-950 text-white transition-all border border-white/20 shadow-2xl touch-manipulation"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-[100001] min-w-[50px] min-h-[50px] flex items-center justify-center rounded-full bg-black/75 hover:bg-amber-500 hover:text-slate-950 text-white transition-all border border-white/20 shadow-2xl touch-manipulation"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/85 text-white text-xs font-mono backdrop-blur-md border border-white/20 shadow-lg">
              {activeImageIndex + 1} de {images.length} • {property.title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
