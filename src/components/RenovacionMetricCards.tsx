import React from 'react';
import { Renovacion } from '../types';
import { Calendar, DollarSign, Clock, CheckCircle } from 'lucide-react';

interface RenovacionMetricCardsProps {
  renovaciones: Renovacion[];
}

function parseValor(valorStr: number | string): number {
  if (typeof valorStr === 'number') return valorStr;
  if (!valorStr) return 0;
  
  const cleanStr = valorStr
    .toString()
    .replace(/[$\s]/g, '')             // Remove $ and spaces
    .replace(/\./g, '')                // Remove dots
    .replace(/,/g, '');                // Remove commas

  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? 0 : parsed;
}

function getDaysRemaining(fechaVencimientoStr: string): number {
  if (!fechaVencimientoStr) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(fechaVencimientoStr);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export default function RenovacionMetricCards({ renovaciones }: RenovacionMetricCardsProps) {
  const totalCount = renovaciones.length;
  
  // Calculate total projected value
  const totalValue = renovaciones.reduce((acc, r) => acc + parseValor(r.valor), 0);
  
  // Calculate active/pending renewals
  const pendingCount = renovaciones.filter(r => r.estado === 'Pendiente').length;
  
  // Renewals due in next 30 days
  const soonCount = renovaciones.filter(r => {
    if (r.estado !== 'Pendiente') return false;
    const days = getDaysRemaining(r.fechaRenovacion);
    return days >= 0 && days <= 30;
  }).length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-in fade-in duration-300">
      {/* Metric 1: Total Renovaciones */}
      <div 
        id="metric-total-renovaciones"
        className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(46,91,255,0.03)] flex items-center justify-between transition-all duration-300 hover:bg-white/65 hover:border-blue-300/60 hover:shadow-[0_12px_40px_rgba(46,91,255,0.06)]"
      >
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block truncate">Total Renovaciones</span>
          <h4 className="text-2xl font-extrabold text-slate-800 font-display">{totalCount}</h4>
          <span className="text-[11px] font-semibold text-slate-400">Registradas en Sheets</span>
        </div>
        <div className="p-3 bg-[#2E5BFF]/10 text-[#2E5BFF] border border-blue-500/15 rounded-2xl shrink-0 shadow-sm">
          <Calendar size={22} className="stroke-[1.75]" />
        </div>
      </div>

      {/* Metric 2: Valor Total */}
      <div 
        id="metric-valor-renovaciones"
        className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(255,92,227,0.03)] flex items-center justify-between transition-all duration-300 hover:bg-white/65 hover:border-pink-300/60 hover:shadow-[0_12px_40px_rgba(255,92,227,0.06)]"
      >
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block truncate">Valor Total</span>
          <h4 className="text-xl font-extrabold text-[#FF5CE3] font-display truncate">
            {formatCurrency(totalValue)}
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">Cartera de renovaciones</span>
        </div>
        <div className="p-3 bg-pink-500/10 text-[#FF5CE3] border border-pink-500/15 rounded-2xl shrink-0 shadow-sm">
          <DollarSign size={22} className="stroke-[1.75]" />
        </div>
      </div>

      {/* Metric 3: Pendientes */}
      <div 
        id="metric-renovaciones-pendientes"
        className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(14,165,233,0.03)] flex items-center justify-between transition-all duration-300 hover:bg-white/65 hover:border-sky-300/60 hover:shadow-[0_12px_40px_rgba(14,165,233,0.06)]"
      >
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block truncate">Pendientes</span>
          <h4 className="text-xl font-extrabold text-sky-500 font-display truncate">
            {pendingCount}
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">Por procesar</span>
        </div>
        <div className="p-3 bg-sky-500/10 text-sky-600 border border-sky-500/15 rounded-2xl shrink-0 shadow-sm">
          <Clock size={22} className="stroke-[1.75]" />
        </div>
      </div>

      {/* Metric 4: Próximos 30 días */}
      <div 
        id="metric-renovaciones-proximas"
        className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(239,68,68,0.03)] flex items-center justify-between transition-all duration-300 hover:bg-white/65 hover:border-red-300/60 hover:shadow-[0_12px_40px_rgba(239,68,68,0.06)]"
      >
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block truncate">Vencen pronto (30d)</span>
          <h4 className="text-xl font-extrabold text-rose-600 font-display truncate">
            {soonCount}
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">Requieren recordatorio</span>
        </div>
        <div className="p-3 bg-rose-500/10 text-rose-500 border border-rose-500/15 rounded-2xl shrink-0 shadow-sm">
          <CheckCircle size={22} className="stroke-[1.75]" />
        </div>
      </div>
    </div>
  );
}
