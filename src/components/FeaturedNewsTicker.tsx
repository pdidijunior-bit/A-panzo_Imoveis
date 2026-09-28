import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  ArrowRight,
  Flame,
  BedDouble,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tag,
} from 'lucide-react';
import { Property } from '../types';
import { formatKzPrice } from '../lib/formatters';

interface FeaturedNewsTickerProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
}

export const FeaturedNewsTicker: React.FC<FeaturedNewsTickerProps> = ({
  properties,
  onSelectProperty,
}) => {
  // Prioritize featured properties, or take first active listings
  const featuredList = useMemo(() => {
    const list = (properties || []).filter((p) => Boolean(p && p.isFeatured));
    return list.length > 0 ? list : (properties || []).slice(0, 10);
  }, [properties]);

  const [shuffledList, setShuffledList] = useState<Property[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION = 6000; // 6 seconds per featured property
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize shuffled list
  useEffect(() => {
    if (!featuredList.length) return;
    const randomized = [...featuredList].sort(() => Math.random() - 0.5);
    setShuffledList(randomized);
    setCurrentIndex(0);
  }, [featuredList]);

  // Handle slide timer and progress bar
  useEffect(() => {
    if (shuffledList.length <= 1 || isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const stepMs = 50;
    const increment = (stepMs / SLIDE_DURATION) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((oldIdx) => (oldIdx + 1) % shuffledList.length);
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [shuffledList, isPaused]);

  // Reset progress when index manually changes
  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + shuffledList.length) % shuffledList.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % shuffledList.length);
  };

  if (!shuffledList.length) return null;

  const currentProperty = shuffledList[currentIndex] || shuffledList[0];
  if (!currentProperty) return null;

  const photoUrl =
    currentProperty.images && currentProperty.images.length > 0
      ? currentProperty.images[0]
      : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80';

  return (
    <div
      className="w-full max-w-5xl mx-auto mb-6 px-3 sm:px-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 
        Container Principal do Ticker de Destaques (Noticiário)
        Height ~130px no desktop, padding generoso, sombra suave e elegante
      */}
      <div
        onClick={() => onSelectProperty(currentProperty)}
        className="destaque-ticker-container group cursor-pointer"
        role="button"
        tabIndex={0}
        aria-label={`Ver imóvel em destaque: ${currentProperty.title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectProperty(currentProperty);
          }
        }}
      >
        {/* Barra de Progresso do Slide no topo */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-[#0052A5] transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 
          1. Bloco Visual: Imagem Grande e Exposta com Tag DESTAQUE
        */}
        <div className="relative shrink-0 flex items-center">
          <img
            key={photoUrl}
            src={photoUrl}
            alt={currentProperty.title}
            loading="eager"
            decoding="async"
            className="destaque-img"
          />

          {/* Pílula DESTAQUE sobreposta na foto no mobile, ou alinhada */}
          <div className="absolute -top-2 -left-2 sm:hidden">
            <span className="destaque-tag-badge shadow-md">
              <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
              DESTAQUE
            </span>
          </div>

          {/* Quantidade de fotos disponíveis no imóvel */}
          {currentProperty.images && currentProperty.images.length > 1 && (
            <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
              +{currentProperty.images.length} fotos
            </span>
          )}
        </div>

        {/* 
          2. Bloco de Informações & Hierarquia Tipográfica
        */}
        <div className="destaque-info">
          {/* Linha Superior: Tag DESTAQUE, Tipo de Negócio e Referência */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden sm:inline-flex destaque-tag-badge">
              <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
              DESTAQUE
            </span>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${
                currentProperty.dealType === 'venda'
                  ? 'bg-blue-100 text-[#0052A5]'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {currentProperty.dealType === 'venda' ? 'Venda' : 'Arrendamento'}
            </span>

            {currentProperty.categoryName && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                {currentProperty.categoryName}
              </span>
            )}

            {currentProperty.code && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                <Tag className="w-3 h-3" />
                Ref: {currentProperty.code}
              </span>
            )}

            {/* Contador de Imóveis no Ticker */}
            <span className="ml-auto text-[11px] text-slate-600 font-semibold hidden lg:inline-block">
              {currentIndex + 1} de {shuffledList.length}
            </span>
          </div>

          {/* Nome / Título do Imóvel em Destaque */}
          <h3 className="destaque-titulo truncate group-hover:text-[#0052A5] transition-colors" title={currentProperty.title}>
            {currentProperty.title}
          </h3>

          {/* Preço e Detalhes de Localização bem organizados */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="destaque-preco">
              {formatKzPrice(currentProperty.price, currentProperty.currency)}
            </div>

            {currentProperty.isNegotiable && (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Negociável
              </span>
            )}

            {/* Localização */}
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate max-w-[220px] sm:max-w-xs">
                {currentProperty.neighborhood ? `${currentProperty.neighborhood}, ` : ''}
                {currentProperty.municipality || currentProperty.province || 'Angola'}
              </span>
            </div>

            {/* Tipologia ou Área do Imóvel se disponíveis */}
            {currentProperty.bedrooms > 0 && (
              <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 font-medium">
                <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                <span>T{currentProperty.bedrooms}</span>
              </div>
            )}

            {currentProperty.area > 0 && (
              <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentProperty.area} m²</span>
              </div>
            )}
          </div>
        </div>

        {/* 
          3. Bloco Direito: Botão "Ver" e Controladores de Navegação
        */}
        <div className="flex items-center gap-2 shrink-0 self-center">
          {/* Botões Prev / Next para navegação ágil */}
          {shuffledList.length > 1 && (
            <div className="hidden sm:flex items-center gap-1 mr-1">
              <button
                type="button"
                onClick={handlePrev}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Imóvel Anterior"
                aria-label="Imóvel Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Próximo Imóvel"
                aria-label="Próximo Imóvel"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Botão Principal "Ver" */}
          <button
            type="button"
            className="destaque-btn-ver"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProperty(currentProperty);
            }}
          >
            <span>Ver Imóvel</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
