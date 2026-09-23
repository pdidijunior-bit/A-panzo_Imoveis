import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Headphones,
  User,
  Check,
  CheckCheck,
  Building,
  Phone,
  Minimize2,
  ExternalLink,
} from 'lucide-react';
import { dbService } from '../lib/dbService';
import { Message, Property } from '../types';
import { useAuth } from '../context/AuthContext';

interface RealTimeChatProps {
  isOpen: boolean;
  onClose: () => void;
  attachedProperty?: Property | null;
  onClearAttachedProperty?: () => void;
  agencyPhone: string;
  agencyWhatsapp: string;
}

export const RealTimeChat: React.FC<RealTimeChatProps> = ({
  isOpen,
  onClose,
  attachedProperty,
  onClearAttachedProperty,
  agencyPhone,
  agencyWhatsapp,
}) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [visitorId, setVisitorId] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or restore visitor ID & visitor info
  useEffect(() => {
    if (currentUser) {
      setVisitorId(currentUser.uid);
      setClientName(currentUser.displayName || currentUser.email || 'Cliente');
      setIsRegistered(true);
      return;
    }

    let vid = localStorage.getItem('apanzo_visitor_id') || localStorage.getItem('alianca_visitor_id');
    if (!vid) {
      vid = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('apanzo_visitor_id', vid);
    }
    setVisitorId(vid);

    const savedName = localStorage.getItem('apanzo_visitor_name') || localStorage.getItem('alianca_visitor_name');
    const savedPhone = localStorage.getItem('apanzo_visitor_phone') || localStorage.getItem('alianca_visitor_phone');
    if (savedName) {
      setClientName(savedName);
      if (savedPhone) setClientPhone(savedPhone);
      setIsRegistered(true);
    }
  }, [currentUser]);

  // Listen to messages in real time via Firestore onSnapshot
  useEffect(() => {
    if (!visitorId || !isRegistered) return;

    const unsubscribe = dbService.subscribeMessages(
      visitorId,
      (incomingMessages) => {
        setMessages(incomingMessages);
        // Mark as read by user
        dbService.markConversationRead(visitorId, false);
      },
      (err) => {
        console.warn('Erro ao escutar mensagens:', err);
      }
    );

    return () => unsubscribe();
  }, [visitorId, isRegistered]);

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    localStorage.setItem('alianca_visitor_name', clientName.trim());
    localStorage.setItem('alianca_visitor_phone', clientPhone.trim());
    setIsRegistered(true);

    // Send initial greeting or prompt
    const propertyPayload = attachedProperty
      ? { id: attachedProperty.id, title: attachedProperty.title }
      : undefined;

    const welcomeText = attachedProperty
      ? `Olá! Tenho interesse no imóvel "${attachedProperty.title}" (Cód: ${attachedProperty.code || attachedProperty.id.slice(0, 6).toUpperCase()}).`
      : 'Olá! Gostaria de falar com um consultor da A.PANZO Imobiliária.';

    dbService.sendClientMessage(
      visitorId,
      visitorId,
      clientName.trim(),
      clientPhone.trim(),
      welcomeText,
      propertyPayload
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const textToSend = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    try {
      const propertyPayload = attachedProperty
        ? { id: attachedProperty.id, title: attachedProperty.title }
        : undefined;

      await dbService.sendClientMessage(
        visitorId,
        visitorId,
        clientName,
        clientPhone,
        textToSend,
        propertyPayload
      );

      if (onClearAttachedProperty) onClearAttachedProperty();
    } catch (err) {
      console.error('Falha ao enviar mensagem:', err);
    } finally {
      setSending(false);
    }
  };

  const cleanWhatsapp = agencyWhatsapp.replace(/[^0-9]/g, '');

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm sm:max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px] max-h-[85vh] animate-in slide-in-from-bottom-5 duration-200">
      {/* Chat Header */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-between border-b border-amber-500/30">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <Headphones className="w-5 h-5" />
            </div>
            {/* Green pulsing dot */}
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 ring-1 ring-emerald-400" />
          </div>

          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5 leading-tight">
              A.PANZO Imobiliária
            </h3>
            <p className="text-[11px] text-amber-400/90 font-medium">
              Apoio ao Cliente em Tempo Real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Minimizar chat"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Fechar chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Registration Screen if first time */}
      {!isRegistered ? (
        <div className="p-6 flex-1 flex flex-col justify-center bg-slate-50 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6" />
          </div>
          <h4 className="font-brand-display text-lg font-bold text-slate-900">
            Fale Connosco Agora
          </h4>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Indique o seu nome para iniciar o atendimento personalizado com os nossos consultores.
          </p>

          <form onSubmit={handleStartChat} className="space-y-3 text-left">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                O seu Nome *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: João Baptista"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Contacto Telefónico / WhatsApp (Opcional)
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ex: 923 000 000"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0052A5] hover:bg-[#003366] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm mt-2"
            >
              Iniciar Conversa
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-200">
            <a
              href={`https://wa.me/${cleanWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold hover:underline"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Falar directamente no WhatsApp
            </a>
          </div>
        </div>
      ) : (
        /* Active Messages View */
        <div className="flex-1 flex flex-col justify-between bg-slate-50/50 overflow-hidden">
          {/* Attached Property Card Badge */}
          {attachedProperty && (
            <div className="p-2.5 bg-blue-50 border-b border-blue-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <Building className="w-4 h-4 text-[#0052A5] shrink-0" />
                <span className="truncate font-semibold text-[#003366]">
                  Imóvel: {attachedProperty.title}
                </span>
              </div>
              {onClearAttachedProperty && (
                <button
                  onClick={onClearAttachedProperty}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Automatic Greeting Banner */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs text-xs text-slate-700 space-y-1">
              <p className="font-bold text-[#0052A5] flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5" /> A.PANZO Imobiliária
              </p>
              <p>
                Bem-vindo ao canal de atendimento em tempo real. Cuidamos do seu imóvel como se fosse nosso. Como podemos ajudá-lo hoje?
              </p>
            </div>

            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 px-1 mb-0.5">
                    {msg.senderName}
                  </span>
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-[#0052A5] text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                        isUser ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isUser && (
                        msg.read ? (
                          <CheckCheck className="w-3 h-3 text-blue-200" />
                        ) : (
                          <Check className="w-3 h-3 text-white/70" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Fallback to WhatsApp & Phone */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-medium">Angola</span>
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Olá A.PANZO Imobiliária! Gostaria de dar continuidade à conversa no WhatsApp.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              Abrir WhatsApp
            </a>
          </div>

          {/* Chat Input Field */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escreva a sua mensagem..."
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || sending}
              className="p-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl transition-all shadow-xs"
              title="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
