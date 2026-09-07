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
    <aside aria-label="Avisos e contactos rápidos" className="relative z-30 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 text-xs font-semibold py-2 px-3 shadow-inner overflow-hidden border-b border-amber-600/20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left Notice with pulse badge */}
        <div className="flex items-center gap-2 overflow-hidden w-full sm:w-auto">
          <span className="inline-flex items-center gap-1 bg-slate-950 text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 shadow-sm">
            <Megaphone className="w-3 h-3 text-amber-400 animate-pulse" />
            Destaque
          </span>
          <p className="truncate text-slate-950 font-medium">
            {notice}
          </p>
        </div>

        {/* Quick External Contact Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <a
            href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Olá Aliança Imobiliária! Gostaria de informações sobre os vossos imóveis.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-slate-950 hover:bg-slate-900 text-white hover:text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full transition-all shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>WhatsApp</span>
            <span className="hidden md:inline font-mono text-[10px] text-amber-300">{whatsapp}</span>
          </a>

          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-950 text-[11px] font-bold px-3 py-1 rounded-full transition-all shadow-sm"
          >
            <Phone className="w-3 h-3 text-amber-600" />
            <span className="hidden sm:inline">Ligar:</span>
            <span className="font-mono text-[10px]">{phone}</span>
          </a>
        </div>
      </div>
    </aside>
  );
};
