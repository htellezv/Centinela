import React from 'react';
import { Prospecto } from '../types';
import { Layers, Flame, CheckSquare, Coins } from 'lucide-react';

interface ProspectoMetricCardsProps {
  prospectos: Prospecto[];
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

export default function ProspectoMetricCards({ prospectos }: ProspectoMetricCardsProps) {
  const totalProspectos = prospectos.length;
  
  const activos = prospectos.filter(p => ['Nuevo', 'Contactado', 'En negociación', 'Propuesta enviada'].includes(p.estado)).length;
  const ganados = prospectos.filter(p => p.estado === 'Ganado').length;
  
  // Calculate total estimated value
  const totalValorEstimado = prospectos.reduce((acc, p) => acc + parseValor(p.valorEstimado), 0);

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-in fade-in duration-300">
      {/* Metric 1: Total */}
      <div 
        id="metric-total-prospectos"
        className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(46,91,255,0.03)] flex items-center justify-between transition-all duration-300 hover:bg-white/65 hover:border-blue-300/60 hover:shadow-[0_12px_40px_rgba(46,91,255,0.06)]"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Total Prospectos</span>
          <h4 className="text-2xl font-extrabold text-slate-800 font-display">{totalProspectos}</h4>
          <span className="text-[11px] font-semibold text-slate-400">Registrados en Sheets</span>
        </div>
        <div className="p-3 bg-[#2E5BFF]/10 text-[#2E5BFF] border border-blue-500/15 rounded-2xl shrink-0 shadow-sm">
          <Layers size={22} className="stroke-[1.75]" />
        </div>
      </div>

      {/* Metric 2: En Proceso */}
      <div 
        id="metric-prospectos-activos"
        className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(14,165,233,0.03)] flex items-center justify-between transition-all duration-300 hover:bg-white/65 hover:border-sky-300/60 hover:shadow-[0_12px_40px_rgba(14,165,233,0.06)]"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">En Negociación</span>
          <h4 className="text-2xl font-extrabold text-sky-500 font-display">{activos}</h4>
          <span className="text-[11px] font-semibold text-slate-400">
            Leads activos
          </span>
        </div>
        <div className="p-3 bg-sky-500/10 text-sky-600 border border-sky-500/15 rounded-2xl shrink-0 shadow-sm">
          <Flame size={22} className="stroke-[1.75]" />
        </div>
      </div>

      {/* Metric 3: Pipeline Estimado */}
      <div 
        id="metric-pipeline"
        className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(255,92,227,0.03)] flex items-center justify-between transition-all duration-300 hover:bg-white/65 hover:border-pink-300/60 hover:shadow-[0_12px_40px_rgba(255,92,227,0.06)]"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Pipeline Estimado</span>
          <h4 className="text-xl font-extrabold text-slate-800 font-display truncate max-w-[150px]">
            {formatCurrency(totalValorEstimado)}
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">Valor potencial total</span>
        </div>
        <div className="p-3 bg-pink-500/10 text-pink-500 border border-pink-500/15 rounded-2xl shrink-0 shadow-sm">
          <Coins size={22} className="stroke-[1.75]" />
        </div>
      </div>

      {/* Metric 4: Ganados */}
      <div 
        id="metric-prospectos-ganados"
        className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(46,91,255,0.03)] flex items-center justify-between transition-all duration-300 hover:bg-white/65 hover:border-blue-300/60 hover:shadow-[0_12px_40px_rgba(46,91,255,0.06)]"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Casos Ganados</span>
          <h4 className="text-2xl font-extrabold text-[#2E5BFF] font-display">
            {ganados}
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">Cierres exitosos</span>
        </div>
        <div className="p-3 bg-[#2E5BFF]/10 text-[#2E5BFF] border border-blue-500/15 rounded-2xl shrink-0 shadow-sm">
          <CheckSquare size={22} className="stroke-[1.75]" />
        </div>
      </div>
    </div>
  );
}
