import React from 'react';
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Phone,
  MessageCircle,
  Video,
  Eye,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import { Property } from '../types';
import { useFavoritesAndAlerts } from '../context/FavoritesAndAlertsContext';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  agencyPhone: string;
  agencyWhatsapp: string;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  agencyPhone,
  agencyWhatsapp,
}) => {
  const { isFavorite, toggleFavorite } = useFavoritesAndAlerts();
  const favorited = isFavorite(property.id);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(property);
  };

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
    `Olá Aliança Imobiliária! Tenho interesse no imóvel "${property.title}" (Cód: ${property.code || property.id.slice(0, 6).toUpperCase()}) anunciado por ${formatKz(property.price)}${property.dealType === 'arrendamento' ? '/mês' : ''}. Gostaria de agendar uma visita ou obter mais informações.`
  );

  const coverImage =
    property.images && property.images.length > 0
      ? property.images[0]
      : 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80';

  return (
    <article className="group bg-white rounded-2xl border border-slate-200/90 hover:border-amber-400/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Media & Badges Container */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onSelect(property)}>
        <img
          src={coverImage}
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient Overlay on Bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges (Deal Type & Video indicator) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-sm ${
              property.dealType === 'venda'
                ? 'bg-amber-500 text-slate-950'
                : property.dealType === 'arrendamento'
                ? 'bg-blue-900 text-white'
                : 'bg-emerald-700 text-white'
            }`}
          >
            {property.dealType === 'venda'
              ? 'Venda'
              : property.dealType === 'arrendamento'
              ? 'Arrendamento'
              : 'Trespasse'}
          </span>

          <div className="flex items-center gap-1.5">
            {property.hasVideo && (
              <span className="bg-slate-950/80 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                <Video className="w-3 h-3 text-amber-400" />
                Vídeo
              </span>
            )}
            {property.status !== 'disponivel' && (
              <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                {property.status}
              </span>
            )}

            {/* Favorite Heart Button */}
            <button
              id={`favorite-card-btn-${property.id}`}
              type="button"
              onClick={handleHeartClick}
              className={`p-1.5 rounded-full backdrop-blur-md transition-all shadow-md active:scale-90 ${
                favorited
                  ? 'bg-rose-500 text-white shadow-rose-500/40 ring-2 ring-white'
                  : 'bg-slate-950/60 text-white hover:bg-slate-950/90 hover:text-rose-400'
              }`}
              title={favorited ? 'Remover dos favoritos' : 'Guardar nos favoritos'}
              aria-label={favorited ? 'Remover dos favoritos' : 'Guardar nos favoritos'}
            >
              <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom Property Code & Photos Counter */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
          <span className="bg-slate-950/80 backdrop-blur-xs px-2.5 py-0.5 rounded text-[11px] font-mono text-amber-300">
            {property.code || property.id.slice(0, 6).toUpperCase()}
          </span>

          {property.images && property.images.length > 1 && (
            <span className="bg-slate-950/70 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] text-slate-200">
              {property.images.length} fotos
            </span>
          )}
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Location */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-amber-700 uppercase tracking-wide text-[11px]">
              {property.categoryName || property.category}
            </span>
            <span className="flex items-center gap-1 text-slate-500 truncate max-w-[170px]">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {property.municipality}, {property.province}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(property)}
            className="font-bold text-slate-900 text-base line-clamp-1 hover:text-amber-600 transition-colors cursor-pointer"
            title={property.title}
          >
            {property.title}
          </h3>

          {/* Neighborhood if available */}
          {property.neighborhood && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              Bairro: {property.neighborhood}
            </p>
          )}

          {/* Specifications Pills */}
          <div className="flex items-center gap-3.5 mt-3.5 py-2.5 px-3 bg-slate-50 rounded-xl text-xs text-slate-600 font-medium">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1" title={`${property.bedrooms} Quartos`}>
                <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                <span>{property.bedrooms >= 5 ? 'T4+' : `T${property.bedrooms}`}</span>
              </span>
            )}

            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1" title={`${property.bathrooms} Casas de Banho`}>
                <Bath className="w-3.5 h-3.5 text-slate-400" />
                <span>{property.bathrooms} wc</span>
              </span>
            )}

            {property.area > 0 && (
              <span className="flex items-center gap-1 ml-auto font-mono text-slate-700" title="Área Total">
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{property.area} m²</span>
              </span>
            )}
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
                Preço
              </span>
              <span className="text-lg font-extrabold text-slate-950 tracking-tight">
                {formatKz(property.price)}
              </span>
              {property.dealType === 'arrendamento' && (
                <span className="text-xs text-slate-500 font-normal"> /mês</span>
              )}
            </div>

            {property.isNegotiable && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Negociável
              </span>
            )}
          </div>

          {/* Direct CTA Buttons with Excellent Spacing */}
          <div className="grid grid-cols-2 gap-2">
            {/* WhatsApp External Direct */}
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-xs"
              title="Conversar sobre este imóvel no WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            {/* View Details Modal */}
            <button
              onClick={() => onSelect(property)}
              className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver Imóvel</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
