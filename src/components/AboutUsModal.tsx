import React from 'react';
import {
  X,
  Target,
  Eye,
  Award,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  Building2,
  Handshake,
  Globe,
  Instagram,
  Facebook,
} from 'lucide-react';
import { SiteSettings } from '../types';
import { BrandLogo } from './BrandLogo';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  if (!isOpen) return null;

  const cleanWhatsapp = (settings.whatsapp || '+244 925 883 080').replace(/[^0-9]/g, '');

  const phones = [
    settings.phone || '+244 925 883 080',
    settings.phone2 || '+244 928 771 808',
    settings.phone3 || '+244 952 644 332',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <BrandLogo customLogoUrl={settings.logoUrl} size="sm" />
            <span className="text-xs font-bold text-[#0052A5] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Institucional
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-200 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 flex-1">
          {/* Hero Section of About Us */}
          <div className="flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br from-[#001F3F] via-[#003366] to-[#0052A5] text-white p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
            {/* Background blue accent */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

            {/* Official Company Logo Emblem */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 flex items-center justify-center shrink-0 shadow-lg">
              <BrandLogo customLogoUrl={settings.logoUrl} size="lg" theme="dark" showSubtitle={false} />
            </div>

            <div className="flex-1 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-200">
                Sobre a A.PANZO Imobiliária
              </span>
              <h2 className="font-brand-display text-2xl sm:text-3xl font-bold mt-1 text-white">
                Cuidamos do seu imóvel como se fosse nosso.
              </h2>
              <p className="mt-2 text-sm text-slate-200 leading-relaxed">
                {settings.aboutStory}
              </p>
            </div>
          </div>

          {/* Mission, Vision, Values Triad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mission */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#0052A5] text-white flex items-center justify-center font-bold mb-3 shadow-xs">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Nossa Missão</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {settings.aboutMission}
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center font-bold mb-3 shadow-xs">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Nossa Visão</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {settings.aboutVision}
                </p>
              </div>
            </div>

            {/* Values */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#0052A5] text-white flex items-center justify-center font-bold mb-3 shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Nossos Valores</h3>
                <ul className="text-xs text-slate-600 space-y-1.5 mt-2">
                  {settings.aboutValues?.map((val, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-[#0052A5] shrink-0 mt-0.5" />
                      <span>{val}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Core Services from Pamphlet */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Nossos Serviços Especializados
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#0052A5] transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-50 text-[#0052A5]">
                    <Handshake className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm">Venda & Compra de Imóveis</h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Apartamentos, Vivendas, Lojas, Armazéns, Escritórios e Terrenos com rigor documental e apoio jurídico integral.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-[#0052A5] transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-50 text-[#0052A5]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm">Gestão de Arrendamento</h5>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Administração completa do seu património, selecção de inquilinos e acompanhamento minucioso do contrato.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Details & Working Hours */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Canais Oficiais de Atendimento
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-xs text-emerald-600">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">WhatsApp Directo</span>
                  <a
                    href={`https://wa.me/${cleanWhatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-slate-900 hover:text-emerald-600 font-mono"
                  >
                    {settings.whatsapp || '+244 925 883 080'}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-xs text-[#0052A5]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Contactos Telefónicos</span>
                  <div className="flex flex-col font-mono text-slate-900 font-bold">
                    {phones.map((p, i) => (
                      <a key={i} href={`tel:${p.replace(/[^0-9+]/g, '')}`} className="hover:text-[#0052A5]">
                        {p}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-xs text-blue-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Correio Electrónico</span>
                  <a href={`mailto:${settings.email || 'comercial@anpanzo.com'}`} className="font-bold text-slate-900 hover:text-blue-600 block">
                    {settings.email || 'comercial@anpanzo.com'}
                  </a>
                  <a href={`mailto:${settings.email2 || 'ap.imobiliaria1985@gmail.com'}`} className="font-bold text-slate-700 hover:text-blue-600 text-[11px] block">
                    {settings.email2 || 'ap.imobiliaria1985@gmail.com'}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-xs text-slate-600">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Website Oficial</span>
                  <a href="https://anpanzo.com" target="_blank" rel="noopener noreferrer" className="font-bold text-[#0052A5] hover:underline">
                    anpanzo.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-xs text-slate-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Área de Atuação</span>
                  <span className="font-bold text-slate-900">{settings.address || 'Angola – Serviço com Qualidade e Confiança'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-xs text-slate-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Horário de Atendimento</span>
                  <span className="font-bold text-slate-900">{settings.workingHours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom CTA with Clean Button */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-10">
          <p className="text-xs text-slate-300 text-center sm:text-left">
            Quer vender, comprar ou arrendar um imóvel em Angola com total segurança?
          </p>

          <div className="flex items-center gap-2.5">
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Olá A.PANZO Imobiliária! Gostaria de agendar uma consulta com um consultor.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Fale Connosco</span>
            </a>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
