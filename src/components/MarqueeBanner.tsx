import React from 'react';
import { Megaphone, Phone, MessageCircle } from 'lucide-react';

interface MarqueeBannerProps {
  notice: string;
  phone: string;
  whatsapp: string;
  visible?: boolean;
}

export const MarqueeBanner: React.FC<MarqueeBannerProps> = ({
  notice,
  phone,
  whatsapp,
  visible = true,
}) => {
  if (!visible || !notice) return null;

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const cleanWhatsapp = whatsapp.replace(/[^0-9]/g, '');

  return (
    <aside
      aria-label="Avisos e contactos rápidos"
      className="relative z-30 bg-[#003366] text-white text-xs font-medium py-2 px-4 border-b border-[#002244]"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Left Notice */}
        <div className="flex items-center gap-2.5 overflow-hidden w-full sm:w-auto">
          <span className="inline-flex items-center gap-1 bg-[#0052A5] text-blue-100 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0">
            <Megaphone className="w-3 h-3 text-amber-300" />
            Destaque
          </span>
          <p className="truncate text-slate-100 text-xs font-normal">
            {notice}
          </p>
        </div>

        {/* Quiet Contact Markers */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-200 shrink-0">
          <a
            href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Olá A.PANZO Imobiliária! Gostaria de informações sobre os vossos imóveis.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
            title="WhatsApp A.PANZO"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp: {whatsapp}</span>
          </a>

          <span className="text-slate-500 hidden sm:inline" aria-hidden="true">·</span>

          <a
            href={`tel:${cleanPhone || phone}`}
            className="hidden sm:inline-flex items-center gap-1.5 hover:text-blue-300 transition-colors"
            title={`Ligar para ${phone}`}
          >
            <Phone className="w-3 h-3 text-blue-300" />
            <span>{phone}</span>
          </a>
        </div>
      </div>
    </aside>
  );
};
