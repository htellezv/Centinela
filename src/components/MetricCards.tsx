import React from 'react';
import { Cliente } from '../types';
import { Users, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';

interface MetricCardsProps {
  clientes: Cliente[];
}

// Helper to parse currency or numeric strings like "$1,500,000", "$ 1.200.000" or just numbers
function parseValor(valorStr: number | string): number {
  if (typeof valorStr === 'number') return valorStr;
  if (!valorStr) return 0;
  
  // Remove currency symbols, spaces, periods (if used as thousands separator) or commas
  // First, let's clean up formatting
  const cleanStr = valorStr
    .replace(/[$\s]/g, '')             // Remove $ and spaces
    .replace(/\./g, '')                // Remove dots (thousands separators in Spanish format)
    .replace(/,/g, '');                // Remove commas

  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? 0 : parsed;
}

export default function MetricCards({ clientes }: MetricCardsProps) {
  const totalClientes = clientes.length;
  
  const activos = clientes.filter(c => c.estado === 'Activo').length;
  const pendientes = clientes.filter(c => c.estado === 'Pendiente').length;
  const vencidos = clientes.filter(c => c.estado === 'Vencido').length;

  // Calculate total monthly value
  const totalValor = clientes.reduce((acc, c) => acc + parseValor(c.valor), 0);

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Metric 1: Total */}
      <div 
        id="metric-total-clientes"
        className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/95 shadow-[0_15px_35px_rgba(46,91,255,0.05)] flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-[0_20px_45px_rgba(46,91,255,0.12)]"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Total Clientes</span>
          <h4 className="text-2xl font-extrabold text-slate-800 font-display">{totalClientes}</h4>
          <span className="text-[11px] font-semibold text-slate-400">Registrados en la hoja</span>
        </div>
        <div className="p-3 bg-[#2E5BFF]/10 text-[#2E5BFF] border border-blue-500/15 rounded-2xl shrink-0 shadow-sm">
          <Users size={22} className="stroke-[1.75]" />
        </div>
      </div>

      {/* Metric 2: Activos */}
      <div 
        id="metric-clientes-activos"
        className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/95 shadow-[0_15px_35px_rgba(46,91,255,0.05)] flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-[0_20px_45px_rgba(46,91,255,0.12)]"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Contratos Activos</span>
          <h4 className="text-2xl font-extrabold text-[#2E5BFF] font-display">{activos}</h4>
          <span className="text-[11px] font-semibold text-slate-400">
            {pendientes > 0 ? `${pendientes} pendiente(s)` : 'Operativos'}
          </span>
        </div>
        <div className="p-3 bg-[#2E5BFF]/10 text-[#2E5BFF] border border-blue-500/15 rounded-2xl shrink-0 shadow-sm">
          <CheckCircle size={22} className="stroke-[1.75]" />
        </div>
      </div>

      {/* Metric 3: Facturación Mensual */}
      <div 
        id="metric-facturacion"
        className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/95 shadow-[0_15px_35px_rgba(255,92,227,0.05)] flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-pink-400/50 hover:shadow-[0_20px_45px_rgba(255,92,227,0.12)]"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Facturación Mensual</span>
          <h4 className="text-xl font-extrabold text-slate-800 font-display truncate max-w-[150px]">
            {formatCurrency(totalValor)}
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">Suma total de servicios</span>
        </div>
        <div className="p-3 bg-pink-500/10 text-pink-500 border border-pink-500/15 rounded-2xl shrink-0 shadow-sm">
          <TrendingUp size={22} className="stroke-[1.75]" />
        </div>
      </div>

      {/* Metric 4: Vencidos / Alertas */}
      <div 
        id="metric-vencidos"
        className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/95 shadow-[0_15px_35px_rgba(239,68,68,0.05)] flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-rose-400/50 hover:shadow-[0_20px_45px_rgba(239,68,68,0.12)]"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Contratos Vencidos</span>
          <h4 className={`text-2xl font-extrabold font-display ${vencidos > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>
            {vencidos}
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">Requieren renovación</span>
        </div>
        <div className={`p-3 rounded-2xl border shrink-0 shadow-sm ${vencidos > 0 ? 'bg-rose-500/10 text-rose-600 border-rose-500/15' : 'bg-slate-500/10 text-slate-500 border-slate-500/15'}`}>
          <AlertTriangle size={22} className="stroke-[1.75]" />
        </div>
      </div>
    </div>
  );
}
