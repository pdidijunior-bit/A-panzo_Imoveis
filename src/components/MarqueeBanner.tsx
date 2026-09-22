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
      className="relative z-30 bg-[#0052A5] text-white text-xs font-semibold py-2 px-3 shadow-inner overflow-hidden border-b border-[#003366]"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Left Notice with pulse badge */}
        <div className="flex items-center gap-2 overflow-hidden w-full sm:w-auto">
          <span className="inline-flex items-center gap-1.5 bg-[#003366] text-blue-100 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0 shadow-xs border border-blue-300/30">
            <Megaphone className="w-3 h-3 text-blue-200 animate-pulse" />
            Destaque
          </span>
          <p className="truncate text-white font-medium text-xs">
            {notice}
          </p>
        </div>

        {/* Quick External Contact Buttons - Clean labels with proper padding */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <a
            href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Olá A.PANZO Imobiliária! Gostaria de informações sobre os vossos imóveis.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full transition-all shadow-xs"
            title="Fale Connosco no WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-white" />
            <span>Fale Connosco</span>
          </a>

          <a
            href={`tel:${cleanPhone || phone}`}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-[#0052A5] text-[11px] font-bold px-3.5 py-1.5 rounded-full transition-all shadow-xs"
            title={`Ligar para ${phone}`}
          >
            <Phone className="w-3 h-3 text-[#0052A5]" />
            <span>Ligar Agora</span>
          </a>
        </div>
      </div>
    </aside>
  );
};
