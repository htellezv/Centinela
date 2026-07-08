import React from 'react';
import { Gasto } from '../types';
import { DollarSign, Receipt, Tag, Percent } from 'lucide-react';

interface GastoMetricCardsProps {
  gastos: Gasto[];
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

export default function GastoMetricCards({ gastos }: GastoMetricCardsProps) {
  const totalGastosCount = gastos.length;
  
  // Calculate total spent
  const totalSpent = gastos.reduce((acc, g) => acc + parseValor(g.valor), 0);
  
  // Calculate average spent
  const averageSpent = totalGastosCount > 0 ? totalSpent / totalGastosCount : 0;
  
  // Calculate category with highest spend
  const categoryTotals: { [key: string]: number } = {};
  gastos.forEach((g) => {
    const cat = g.categoria || 'Sin Categoría';
    const val = parseValor(g.valor);
    categoryTotals[cat] = (categoryTotals[cat] || 0) + val;
  });
  
  let topCategory = '—';
  let topCategoryAmount = 0;
  
  Object.entries(categoryTotals).forEach(([cat, amount]) => {
    if (amount > topCategoryAmount) {
      topCategory = cat;
      topCategoryAmount = amount;
    }
  });

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
      {/* Metric 1: Total Gastos Count */}
      <div 
        id="metric-total-gastos-count"
        className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(46,91,255,0.03)] flex items-center justify-between transition-all duration-300 hover:bg-white/65 hover:border-blue-300/60 hover:shadow-[0_12px_40px_rgba(46,91,255,0.06)]"
      >
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block truncate">Total Transacciones</span>
          <h4 className="text-2xl font-extrabold text-slate-800 font-display">{totalGastosCount}</h4>
          <span className="text-[11px] font-semibold text-slate-400">Gastos registrados</span>
        </div>
        <div className="p-3 bg-[#2E5BFF]/10 text-[#2E5BFF] border border-blue-500/15 rounded-2xl shrink-0 shadow-sm">
          <Receipt size={22} className="stroke-[1.75]" />
        </div>
      </div>

      {/* Metric 2: Total Spent */}
      <div 
        id="metric-total-gasto-valor"
        className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(239,68,68,0.03)] flex items-center justify-between transition-all duration-300 hover:bg-white/65 hover:border-red-300/60 hover:shadow-[0_12px_40px_rgba(239,68,68,0.06)]"
      >
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block truncate">Total Egresos</span>
          <h4 className="text-xl font-extrabold text-rose-600 font-display truncate">
            {formatCurrency(totalSpent)}
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">Monto total de egresos</span>
        </div>
        <div className="p-3 bg-rose-500/10 text-rose-500 border border-rose-500/15 rounded-2xl shrink-0 shadow-sm">
          <DollarSign size={22} className="stroke-[1.75]" />
        </div>
      </div>

      {/* Metric 3: Gasto Promedio */}
      <div 
        id="metric-gasto-promedio"
        className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(71,85,105,0.03)] flex items-center justify-between transition-all duration-300 hover:bg-white/65 hover:border-slate-300/60 hover:shadow-[0_12px_40px_rgba(71,85,105,0.06)]"
      >
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block truncate">Gasto Promedio</span>
          <h4 className="text-xl font-extrabold text-slate-800 font-display truncate">
            {formatCurrency(averageSpent)}
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">Por transacción registrada</span>
        </div>
        <div className="p-3 bg-slate-500/10 text-slate-600 border border-slate-500/15 rounded-2xl shrink-0 shadow-sm">
          <Percent size={22} className="stroke-[1.75]" />
        </div>
      </div>

      {/* Metric 4: Categoría Principal */}
      <div 
        id="metric-categoria-principal"
        className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(14,165,233,0.03)] flex items-center justify-between transition-all duration-300 hover:bg-white/65 hover:border-sky-300/60 hover:shadow-[0_12px_40px_rgba(14,165,233,0.06)]"
      >
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block truncate">Categoría Mayor</span>
          <h4 className="text-sm font-extrabold text-slate-800 truncate" title={topCategory}>
            {topCategory}
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">
            {topCategoryAmount > 0 ? formatCurrency(topCategoryAmount) : 'Sin gastos'}
          </span>
        </div>
        <div className="p-3 bg-sky-500/10 text-sky-600 border border-sky-500/15 rounded-2xl shrink-0 shadow-sm">
          <Tag size={22} className="stroke-[1.75]" />
        </div>
      </div>
    </div>
  );
}
