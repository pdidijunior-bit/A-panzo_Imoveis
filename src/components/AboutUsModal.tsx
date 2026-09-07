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
  Building,
  Handshake,
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

  const cleanWhatsapp = settings.whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <BrandLogo customLogoUrl={settings.logoUrl} size="sm" />
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
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
          <div className="flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
            {/* Background gold accent */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Official Company Logo Emblem (Replaced stock photo) */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-white/10 backdrop-blur-md border border-amber-400/30 p-4 flex items-center justify-center shrink-0 shadow-lg ring-2 ring-amber-400/40">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="Aliança Imobiliária"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    viewBox="0 0 160 140"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-md"
                  >
                    <path
                      d="M 12 130 C 50 120, 110 120, 148 130 C 110 123, 50 123, 12 130 Z"
                      fill="#2DD4BF"
                    />
                    <polygon
                      points="28,124 50,124 50,96 28,104"
                      fill="#2DD4BF"
                    />
                    <path
                      d="M 55 124 L 84 124 L 84 48 L 55 32 Z"
                      fill="#EA7C1C"
                    />
                    <path
                      d="M 69.5 78 L 61.5 86.5 L 64 86.5 L 64 99.5 L 75 99.5 L 75 86.5 L 77.5 86.5 Z"
                      fill="#FFFFFF"
                    />
                    <circle cx="69.5" cy="92.5" r="2" fill="#EA7C1C" />
                    <polygon points="68.2,93.5 70.8,93.5 71.4,98.5 67.6,98.5" fill="#EA7C1C" />
                    <polygon
                      points="89,124 116,124 116,62 89,48"
                      fill="#2DD4BF"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Sobre a Aliança Imobiliária
              </span>
              <h2 className="font-brand-display text-2xl sm:text-3xl font-bold mt-1 text-white">
                Compromisso, Rigor e Excelência no Mercado Angolano
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                {settings.aboutStory}
              </p>
            </div>
          </div>

          {/* Mission, Vision, Values Triad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mission */}
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold mb-3 shadow-xs">
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
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold mb-3 shadow-xs">
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
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold mb-3 shadow-xs">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Nossos Valores</h3>
                <ul className="text-xs text-slate-600 space-y-1.5 mt-2">
                  {settings.aboutValues?.map((val, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{val}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Services Offered */}
          <div>
            <h3 className="font-brand-display text-xl font-bold text-slate-900 mb-4">
              Os Nossos Serviços Imobiliários
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {settings.servicesList?.map((srv, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 transition-colors bg-white flex items-start gap-3"
                >
                  <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                    <Handshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{srv.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {srv.description}
                    </p>
                  </div>
                </div>
              ))}
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
                    {settings.whatsapp}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-xs text-amber-600">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Chamada Normal</span>
                  <a href={`tel:${settings.phone}`} className="font-bold text-slate-900 hover:text-amber-600 font-mono">
                    {settings.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-xs text-blue-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Correio Electrónico</span>
                  <a href={`mailto:${settings.email}`} className="font-bold text-slate-900 hover:text-blue-600">
                    {settings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-xs text-slate-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Área de Atuação</span>
                  <span className="font-bold text-slate-900">{settings.address}</span>
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

        {/* Modal Bottom CTA */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-10">
          <p className="text-xs text-slate-300 text-center sm:text-left">
            Procura vender, arrendar ou adquirir um imóvel com total segurança jurídica em Angola?
          </p>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Olá Aliança Imobiliária! Gostaria de agendar uma consulta com um consultor.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contactar via WhatsApp</span>
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
