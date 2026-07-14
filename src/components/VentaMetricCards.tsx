import React from 'react';
import { Venta } from '../types';
import { DollarSign, ClipboardCheck, Clock, CheckCircle } from 'lucide-react';

interface VentaMetricCardsProps {
  ventas: Venta[];
}

function parseValor(valorStr: number | string): number {
  if (typeof valorStr === 'number') return valorStr;
  if (!valorStr) return 0;
  
  const cleanStr = valorStr
    .replace(/[$\s]/g, '')             // Remove $ and spaces
    .replace(/\./g, '')                // Remove dots
    .replace(/,/g, '');                // Remove commas

  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? 0 : parsed;
}

export default function VentaMetricCards({ ventas }: VentaMetricCardsProps) {
  const totalVentas = ventas.length;
  
  // Calculations
  const totalFacturado = ventas.reduce((acc, v) => acc + parseValor(v.valor), 0);
  
  const totalRecaudado = ventas
    .filter(v => v.estadoPago === 'Pagado')
    .reduce((acc, v) => acc + parseValor(v.valor), 0);
    
  const totalPendiente = ventas
    .filter(v => v.estadoPago === 'Pendiente')
    .reduce((acc, v) => acc + parseValor(v.valor), 0);

  // Format currency in CLP or general $
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-in fade-in duration-300">
      {/* Metric 1: Total Ventas */}
      <div 
        id="metric-total-ventas"
        className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/95 shadow-[0_15px_35px_rgba(46,91,255,0.05)] flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-[0_20px_45px_rgba(46,91,255,0.12)]"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Total Transacciones</span>
          <h4 className="text-2xl font-extrabold text-slate-800 font-display">{totalVentas}</h4>
          <span className="text-[11px] font-semibold text-slate-400">Ventas registradas</span>
        </div>
        <div className="p-3 bg-[#2E5BFF]/10 text-[#2E5BFF] border border-blue-500/15 rounded-2xl shrink-0 shadow-sm">
          <ClipboardCheck size={22} className="stroke-[1.75]" />
        </div>
      </div>

      {/* Metric 2: Total Facturado */}
      <div 
        id="metric-total-facturado"
        className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/95 shadow-[0_15px_35px_rgba(71,85,105,0.05)] flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-slate-400/50 hover:shadow-[0_20px_45px_rgba(71,85,105,0.12)]"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Total Facturado</span>
          <h4 className="text-xl font-extrabold text-slate-800 font-display truncate max-w-[150px]">
            {formatCurrency(totalFacturado)}
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">Valor de todos los servicios</span>
        </div>
        <div className="p-3 bg-slate-500/10 text-slate-600 border border-slate-500/15 rounded-2xl shrink-0 shadow-sm">
          <DollarSign size={22} className="stroke-[1.75]" />
        </div>
      </div>

      {/* Metric 3: Total Recaudado */}
      <div 
        id="metric-total-recaudado"
        className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/95 shadow-[0_15px_35px_rgba(46,91,255,0.05)] flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-[0_20px_45px_rgba(46,91,255,0.12)]"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Monto Recaudado</span>
          <h4 className="text-xl font-extrabold text-[#2E5BFF] font-display truncate max-w-[150px]">
            {formatCurrency(totalRecaudado)}
          </h4>
          <span className="text-[11px] font-semibold text-slate-400 font-sans">Pagos completados 🔵</span>
        </div>
        <div className="p-3 bg-[#2E5BFF]/10 text-[#2E5BFF] border border-blue-500/15 rounded-2xl shrink-0 shadow-sm">
          <CheckCircle size={22} className="stroke-[1.75]" />
        </div>
      </div>

      {/* Metric 4: Pendiente de Cobro */}
      <div 
        id="metric-total-pendiente"
        className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/95 shadow-[0_15px_35px_rgba(14,165,233,0.05)] flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-sky-400/50 hover:shadow-[0_20px_45px_rgba(14,165,233,0.12)]"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Pendiente de Cobro</span>
          <h4 className="text-xl font-extrabold text-sky-500 font-display truncate max-w-[150px]">
            {formatCurrency(totalPendiente)}
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">Pagos en espera 🟡</span>
        </div>
        <div className="p-3 bg-sky-500/10 text-sky-600 border border-sky-500/15 rounded-2xl shrink-0 shadow-sm">
          <Clock size={22} className="stroke-[1.75]" />
        </div>
      </div>
    </div>
  );
}
