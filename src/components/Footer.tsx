import React from 'react';
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Shield,
  ArrowUp,
  ExternalLink,
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
  const cleanWhatsapp = settings.whatsapp.replace(/[^0-9]/g, '');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-white border-t border-amber-500/20 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission Column */}
          <div className="space-y-4">
            <BrandLogo customLogoUrl={settings.logoUrl} size="md" theme="dark" />
            <p className="text-xs text-slate-400 leading-relaxed pr-4">
              A Aliança Imobiliária é a sua parceira de referência no mercado angolano. Oferecemos soluções integradas de compra, venda, arrendamento e consultoria jurídica com total transparência e rigor.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Luanda & Malanje • Angola
              </span>
            </div>
          </div>

          {/* Quick Real Estate Links */}
          <div className="space-y-3">
            <h4 className="font-brand-display text-sm font-bold uppercase tracking-wider text-white">
              Navegação Rápida
            </h4>
            <ul className="text-xs text-slate-400 space-y-2">
              <li>
                <button
                  onClick={() => onSelectDealType('venda')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Imóveis para Venda (Comprar)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectDealType('arrendamento')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Imóveis para Arrendamento
                </button>
              </li>
              <li>
                <button onClick={onOpenAbout} className="hover:text-amber-400 transition-colors">
                  Sobre a Aliança Imobiliária
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Termos e Condições Gerais
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-amber-400 transition-colors"
                >
                  Política de Privacidade
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Contacts */}
          <div className="space-y-3">
            <h4 className="font-brand-display text-sm font-bold uppercase tracking-wider text-white">
              Contactos Directos
            </h4>
            <ul className="text-xs text-slate-300 space-y-3">
              <li>
                <a
                  href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Olá Aliança Imobiliária! Gostaria de falar com um consultor.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-emerald-400 hover:underline font-bold"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>WhatsApp: {settings.whatsapp}</span>
                </a>
              </li>

              <li>
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center gap-2.5 text-slate-300 hover:text-amber-300 font-mono"
                >
                  <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Telefone: {settings.phone}</span>
                </a>
              </li>

              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-2.5 text-slate-300 hover:text-amber-300 truncate"
                >
                  <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{settings.email}</span>
                </a>
              </li>

              <li className="flex items-start gap-2.5 text-slate-400">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
            </ul>
          </div>

          {/* Institutional Trust & Working Hours */}
          <div className="space-y-3">
            <h4 className="font-brand-display text-sm font-bold uppercase tracking-wider text-white">
              Horário & Atendimento
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{settings.workingHours}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 mt-4 space-y-1">
              <p className="font-bold text-amber-400">Atendimento Personalizado</p>
              <p className="text-[11px] text-slate-400">
                Agende visitas a imóveis ou consulte avaliações imobiliárias em todo o país com os nossos consultores.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Admin and Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Aliança Imobiliária. Todos os direitos reservados.</p>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="text-slate-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Acesso ADM</span>
            </button>

            <button
              onClick={scrollToTop}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg transition-colors flex items-center gap-1 text-xs"
              title="Voltar ao Topo"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Topo</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
