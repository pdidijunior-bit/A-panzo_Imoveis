import React, { useState, useEffect } from 'react';
import { X, Bell, Check, Sparkles, Filter, AlertCircle, ArrowRight } from 'lucide-react';
import { Category, LocationConfig, Property } from '../types';
import { useFavoritesAndAlerts } from '../context/FavoritesAndAlertsContext';
import { dbService } from '../lib/dbService';
import { formatNumber } from '../lib/formatters';

interface CreateAlertModalProps {
  categories: Category[];
  locations: LocationConfig[];
  catalogProperties: Property[];
}

export const CreateAlertModal: React.FC<CreateAlertModalProps> = ({
  categories,
  locations,
  catalogProperties,
}) => {
  const {
    isCreateAlertModalOpen,
    setIsCreateAlertModalOpen,
    prefilledAlertFilters,
    createAlert,
  } = useFavoritesAndAlerts();

  const [name, setName] = useState('');
  const [dealType, setDealType] = useState<'todos' | 'venda' | 'arrendamento' | 'trespasse'>('todos');
  const [category, setCategory] = useState('');
  const [province, setProvince] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [bedrooms, setBedrooms] = useState('todos');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [keyword, setKeyword] = useState('');
  const [notifyChannel, setNotifyChannel] = useState<'app' | 'whatsapp' | 'email'>('app');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Pre-fill from current active filters when opened
  useEffect(() => {
    if (isCreateAlertModalOpen) {
      setSavedSuccess(false);
      if (prefilledAlertFilters) {
        setDealType(prefilledAlertFilters.dealType || 'todos');
        setCategory(prefilledAlertFilters.category || '');
        setProvince(prefilledAlertFilters.province || '');
        setMunicipality(prefilledAlertFilters.municipality || '');
        setBedrooms(prefilledAlertFilters.bedrooms || 'todos');
        setMinPrice(prefilledAlertFilters.minPrice || '');
        setMaxPrice(prefilledAlertFilters.maxPrice || '');
        setKeyword(prefilledAlertFilters.keyword || '');
      }
    }
  }, [isCreateAlertModalOpen, prefilledAlertFilters]);

  // Auto-generate a descriptive alert name if empty
  useEffect(() => {
    if (!name || name.startsWith('Alerta:')) {
      const parts: string[] = [];
      if (dealType && dealType !== 'todos') {
        parts.push(dealType === 'venda' ? 'Compra' : dealType === 'arrendamento' ? 'Arrendamento' : 'Trespasse');
      }
      if (category) {
        const catObj = categories.find((c) => c.slug === category);
        if (catObj) parts.push(catObj.name);
      } else {
        parts.push('Imóveis');
      }
      if (bedrooms && bedrooms !== 'todos') {
        parts.push(`T${bedrooms}`);
      }
      if (municipality) {
        parts.push(`em ${municipality}`);
      } else if (province) {
        parts.push(`em ${province}`);
      }
      if (maxPrice) {
        parts.push(`até ${formatNumber(Number(maxPrice))} Kz`);
      }
      setName(parts.length > 0 ? parts.join(' • ') : 'Alerta Personalizado');
    }
  }, [dealType, category, province, municipality, bedrooms, maxPrice, categories]);

  if (!isCreateAlertModalOpen) return null;

  // Calculate live matching count in current catalog
  const matchingPropertiesCount = (catalogProperties || []).filter((p) => {
    return dbService.matchesAlert(p, {
      id: 'temp',
      userId: 'temp',
      name,
      dealType,
      category,
      province,
      municipality,
      bedrooms,
      minPrice,
      maxPrice,
      keyword,
      notifyChannel,
      active: true,
      createdAt: '',
    });
  }).length;

  const currentMunicipalities =
    (locations || []).find((l) => (l.province || '').toLowerCase() === (province || '').toLowerCase())
      ?.municipalities || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const selectedCategoryObj = categories.find((c) => c.slug === category);
      await createAlert({
        name: name.trim(),
        dealType,
        category,
        categoryName: selectedCategoryObj ? selectedCategoryObj.name : undefined,
        province,
        municipality,
        bedrooms,
        minPrice: minPrice ? Number(minPrice) : '',
        maxPrice: maxPrice ? Number(maxPrice) : '',
        keyword: keyword.trim(),
        notifyChannel,
        active: true,
      });

      setSavedSuccess(true);
      setTimeout(() => {
        setIsCreateAlertModalOpen(false);
        setSavedSuccess(false);
      }, 1400);
    } catch (err) {
      console.error('Erro ao guardar alerta:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="create-alert-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCreateAlertModalOpen(false);
      }}
    >
      <div
        id="create-alert-modal-content"
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 transition-all"
      >
        {/* Header with gold accent */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-5 sm:p-6 border-b border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                <Bell className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Configurar Alerta de Imóveis
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    Tempo Real
                  </span>
                </h3>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  Receba notificações instantâneas quando novos imóveis surgirem
                </p>
              </div>
            </div>

            <button
              id="close-create-alert-modal-btn"
              onClick={() => setIsCreateAlertModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live matches indicator pill */}
          <div className="mt-4 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>Correspondências atuais no catálogo:</span>
            </div>
            <span className="font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs">
              {matchingPropertiesCount}{' '}
              {matchingPropertiesCount === 1 ? 'imóvel' : 'imóveis'}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {savedSuccess ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-950/30 animate-bounce">
                <Check className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Alerta Criado com Sucesso!
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                O seu alerta foi ativado. O sistema irá notificá-lo em tempo real no portal sempre que um imóvel com estes critérios for publicado.
              </p>
            </div>
          ) : (
            <>
              {/* Alert Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Nome do Alerta
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Apartamento T3 no Kilamba até 50M Kz"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Deal Type & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Transação
                  </label>
                  <select
                    value={dealType}
                    onChange={(e) => setDealType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="todos">Todos (Venda e Arrendamento)</option>
                    <option value="venda">Comprar (Venda)</option>
                    <option value="arrendamento">Arrendar</option>
                    <option value="trespasse">Trespasse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location: Province & Municipality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Província
                  </label>
                  <select
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      setMunicipality('');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="">Todas as províncias</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.province}>
                        {loc.province}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Município / Zona
                  </label>
                  <select
                    value={municipality}
                    disabled={!province}
                    onChange={(e) => setMunicipality(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:opacity-50"
                  >
                    <option value="">Todos os municípios</option>
                    {currentMunicipalities.map((mun) => (
                      <option key={mun} value={mun}>
                        {mun}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bedrooms & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipologia (Quartos)
                  </label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="todos">Qualquer tipologia</option>
                    <option value="1">T1 (1 Quarto)</option>
                    <option value="2">T2 (2 Quartos)</option>
                    <option value="3">T3 (3 Quartos)</option>
                    <option value="4">T4 (4 Quartos)</option>
                    <option value="5+">T5 ou superior</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preço Mínimo (Kz)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    placeholder="Sem mínimo"
                    value={minPrice}
                    onChange={(e) =>
                      setMinPrice(e.target.value ? Number(e.target.value) : '')
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preço Máximo (Kz)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    placeholder="Sem teto"
                    value={maxPrice}
                    onChange={(e) =>
                      setMaxPrice(e.target.value ? Number(e.target.value) : '')
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Keywords */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Palavra-chave específica (Opcional)
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Ex: Piscina, Condomínio fechado, Gerador, Suíte..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Notification Channel Preference */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Como prefere ser notificado?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNotifyChannel('app')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                      notifyChannel === 'app'
                        ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    No Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifyChannel('whatsapp')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                      notifyChannel === 'whatsapp'
                        ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifyChannel('email')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors ${
                      notifyChannel === 'email'
                        ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>E-mail</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateAlertModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !name.trim()}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Bell className="w-4 h-4" />
                  {isSaving ? 'A ativar...' : 'Ativar Alerta Agora'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
