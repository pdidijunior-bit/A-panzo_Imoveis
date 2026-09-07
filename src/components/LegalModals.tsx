import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface LegalModalProps {
  type: 'terms' | 'privacy' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <h3 className="font-brand-display text-lg font-bold text-slate-900">
              {type === 'terms' ? 'Termos de Uso e Condições' : 'Política de Privacidade e Proteção de Dados'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 text-xs text-slate-600 space-y-4 max-h-[60vh] overflow-y-auto pr-2 leading-relaxed">
          {type === 'terms' ? (
            <>
              <p>
                <strong>1. Objeto e Âmbito:</strong> A Aliança Imobiliária disponibiliza este portal eletrónico com o objetivo de apresentar propriedades, oportunidades de investimento, serviços de mediação imobiliária e consultoria jurídica em Angola, com especial foco em Luanda e Malanje.
              </p>
              <p>
                <strong>2. Veracidade das Informações:</strong> As informações de preços, disponibilidades, áreas e tipologias (T1, T2, T3, T4+) publicadas são sujeitas a confirmação presencial e documental no momento da mediação.
              </p>
              <p>
                <strong>3. Segurança nas Transações:</strong> Toda transação formal de compra, venda ou arrendamento é acompanhada por consultores credenciados e obedece rigorosamente à legislação angolana.
              </p>
              <p>
                <strong>4. Contacto Oficial:</strong> Para esclarecimento de termos ou agendamento de consultas jurídicas, contacte diretamente o WhatsApp +244 924 875 869.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>1. Compromisso de Privacidade:</strong> A Aliança Imobiliária respeita a privacidade de todos os utilizadores e potenciais clientes. As informações de contacto fornecidas via formulário, chat em tempo real ou ligação destinam-se exclusivamente ao atendimento comercial e à prestação de serviços imobiliários.
              </p>
              <p>
                <strong>2. Dados Não Partilhados:</strong> Os seus dados pessoais e de contacto não serão comercializados, cedidos ou divulgados a terceiros sem prévio consentimento.
              </p>
              <p>
                <strong>3. Direitos do Titular:</strong> O utilizador pode solicitar a qualquer momento a atualização ou remoção dos seus dados de atendimento através do email ou WhatsApp oficial.
              </p>
            </>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Compreendi
          </button>
        </div>
      </div>
    </div>
  );
};
