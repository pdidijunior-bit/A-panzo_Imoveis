import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptText?: string;
  initialMode?: 'login' | 'signup';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  promptText,
  initialMode = 'signup',
  onSuccess,
}) => {
  const { signUpWithEmail, signInWithEmail, signInWithGoogle, authError, clearAuthError } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    clearAuthError();
    setLocalError(null);
    setSuccessNotice(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setLocalError('Por favor informe o seu nome completo.');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setLocalError('A senha deve ter pelo menos 6 caracteres.');
          setIsLoading(false);
          return;
        }
        await signUpWithEmail(name, email, password);
        setSuccessNotice('Conta criada com sucesso!');
      } else {
        await signInWithEmail(email, password);
        setSuccessNotice('Sessão iniciada com sucesso!');
      }

      setTimeout(() => {
        setIsLoading(false);
        if (onSuccess) onSuccess();
        handleClose();
      }, 600);
    } catch (err: any) {
      setIsLoading(false);
      setLocalError(err.message || 'Ocorreu um erro. Verifique os dados introduzidos.');
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearAuthError();
    setIsLoading(true);
    try {
      await signInWithGoogle();
      setSuccessNotice('Sessão iniciada com sucesso!');
      setTimeout(() => {
        setIsLoading(false);
        if (onSuccess) onSuccess();
        handleClose();
      }, 600);
    } catch (err: any) {
      setIsLoading(false);
      if (err.code !== 'auth/popup-closed-by-user') {
        setLocalError(err.message || 'Falha ao autenticar com a Conta Google.');
      }
    }
  };

  const activeError = localError || authError;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors z-10"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-[#003366] to-[#0052A5] px-6 pt-7 pb-6 text-white text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>

          <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-200 block mb-1">
            A.PANZO Imobiliária
          </span>

          <h2 className="text-xl font-extrabold font-brand-display">
            {mode === 'signup' ? 'Crie a Sua Conta Gratuita' : 'Iniciar Sessão'}
          </h2>

          <p className="text-xs text-blue-100/90 mt-1 max-w-xs mx-auto leading-relaxed">
            {promptText
              ? promptText
              : mode === 'signup'
              ? 'Guarde os seus imóveis favoritos, converse no chat em tempo real e receba alertas de novas oportunidades.'
              : 'Aceda à sua área de cliente, consulte os imóveis que favoritou e converse connosco.'}
          </p>

          {/* Toggle Switch */}
          <div className="mt-4 inline-flex p-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/15">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setLocalError(null);
                clearAuthError();
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#003366] shadow-sm'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLocalError(null);
                clearAuthError();
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#003366] shadow-sm'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              Já Tenho Conta
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7">
          {/* Success message */}
          {successNotice && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{successNotice}</span>
            </div>
          )}

          {/* Error Message */}
          {activeError && !successNotice && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{activeError}</span>
            </div>
          )}

          {/* Google Fast Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continuar com Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative px-3 bg-white text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              ou com e-mail e senha
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Manuel António"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5] focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5] focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Senha de Acesso {mode === 'signup' && <span className="text-slate-400 font-normal">(mínimo 6 dígitos)</span>}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0052A5] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-[#0052A5] hover:bg-[#003366] active:scale-98 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A processar...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Criar Minha Conta Grátis' : 'Entrar na Conta'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Guarantee */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Autenticação segura via Firebase</span>
          </div>
        </div>
      </div>
    </div>
  );
};
