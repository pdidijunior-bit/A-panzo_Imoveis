import React from 'react';
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Shield,
  ArrowUp,
  Globe,
  Instagram,
  Facebook,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { SiteSettings } from '../types';

interface FooterProps {
  settings: SiteSettings;
  onOpenAbout: () => void;
  onOpenLegal: (type: 'terms' | 'privacy') => void;
  onOpenAdmin: () => void;
  onSelectDealType: (dealType: 'venda' | 'arrendamento') => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenAbout,
  onOpenLegal,
  onOpenAdmin,
  onSelectDealType,
}) => {
  const cleanWhatsapp = (settings.whatsapp || '+244 925 883 080').replace(/[^0-9]/g, '');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const phones = [
    settings.phone || '+244 925 883 080',
    settings.phone2 || '+244 928 771 808',
    settings.phone3 || '+244 952 644 332',
  ];

  const emails = [
    settings.email || 'comercial@anpanzo.com',
    settings.email2 || 'ap.imobiliaria1985@gmail.com',
  ];

  return (
    <footer className="bg-[#00172E] text-white border-t border-[#0052A5]/30 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission Column */}
          <div className="space-y-4">
            <BrandLogo customLogoUrl={settings.logoUrl} size="md" theme="dark" />
            <p className="text-xs text-slate-300 leading-relaxed pr-2">
              A.PANZO - Comércio & Prestação de Serviços, LDA (Imobiliária). Cuidamos do seu imóvel como se fosse nosso. Rigor jurídico, transparência e confiança em Angola.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
                {settings.address || 'Angola – Serviço com Qualidade e Confiança'}
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://anpanzo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white/10 hover:bg-[#0052A5] transition-all text-white"
                title="Website Oficial anpanzo.com"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/a.panzocomercial"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 transition-all text-white"
                title="Instagram @A.panzo comercial"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/a.panzocomercial"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white/10 hover:bg-blue-600 transition-all text-white"
                title="Facebook A.panzo comercial"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Real Estate Links */}
          <div className="space-y-3">
            <h4 className="font-brand-display text-sm font-bold uppercase tracking-wider text-white">
              Navegação Rápida
            </h4>
            <ul className="text-xs text-slate-300 space-y-2">
              <li>
                <button
                  onClick={() => onSelectDealType('venda')}
                  className="hover:text-blue-300 transition-colors"
                >
                  Imóveis para Venda (Comprar)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectDealType('arrendamento')}
                  className="hover:text-blue-300 transition-colors"
                >
                  Imóveis para Arrendamento
                </button>
              </li>
              <li>
                <button onClick={onOpenAbout} className="hover:text-blue-300 transition-colors">
                  Sobre a A.PANZO Imobiliária
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-blue-300 transition-colors"
                >
                  Termos e Condições Gerais
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-blue-300 transition-colors"
                >
                  Política de Privacidade
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Contacts */}
          <div className="space-y-3">
            <h4 className="font-brand-display text-sm font-bold uppercase tracking-wider text-white">
              Contactos Oficiais
            </h4>
            <ul className="text-xs text-slate-300 space-y-3">
              {/* WhatsApp Direct */}
              <li>
                <a
                  href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Olá A.PANZO Imobiliária! Gostaria de falar com um consultor.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>WhatsApp: {settings.whatsapp || '+244 925 883 080'}</span>
                </a>
              </li>

              {/* Phone numbers list */}
              {phones.map((ph, idx) => (
                <li key={idx}>
                  <a
                    href={`tel:${ph.replace(/[^0-9+]/g, '')}`}
                    className="flex items-center gap-2 text-slate-300 hover:text-blue-300 font-mono"
                  >
                    <Phone className="w-4 h-4 text-[#0052A5] shrink-0" />
                    <span>{ph}</span>
                  </a>
                </li>
              ))}

              {/* Emails */}
              {emails.map((em, idx) => (
                <li key={idx}>
                  <a
                    href={`mailto:${em}`}
                    className="flex items-center gap-2 text-slate-300 hover:text-blue-300 truncate"
                  >
                    <Mail className="w-4 h-4 text-[#0052A5] shrink-0" />
                    <span>{em}</span>
                  </a>
                </li>
              ))}

              <li className="flex items-start gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-[#0052A5] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
            </ul>
          </div>

          {/* Institutional Trust & Working Hours */}
          <div className="space-y-3">
            <h4 className="font-brand-display text-sm font-bold uppercase tracking-wider text-white">
              Horário & Atendimento
            </h4>
            <div className="flex items-start gap-2 text-xs text-slate-300">
              <Clock className="w-4 h-4 text-[#0052A5] shrink-0 mt-0.5" />
              <span>{settings.workingHours}</span>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 mt-4 space-y-1">
              <p className="font-bold text-blue-300">A.PANZO Imobiliária</p>
              <p className="text-[11px] text-slate-300">
                Apartamentos, Vivendas, Lojas, Armazéns, Escritórios e Terrenos. Cuidamos do seu imóvel como se fosse nosso.
              </p>
            </div>

            {/* Quick Action Button with Clean Label */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Olá A.PANZO Imobiliária! Gostaria de agendar uma consulta.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Fale Connosco</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Copyright & Admin Portal Trigger */}
        <div className="pt-8 mt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} A.PANZO - Comércio & Prestação de Serviços, LDA (Imobiliária). Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="hover:text-blue-300 transition-colors flex items-center gap-1 font-semibold"
            >
              <Shield className="w-3.5 h-3.5 text-[#0052A5]" />
              Área Administrativa
            </button>

            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1"
              title="Voltar ao topo da página"
            >
              <ArrowUp className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Topo</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
