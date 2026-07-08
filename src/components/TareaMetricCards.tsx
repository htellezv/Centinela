import React from 'react';
import { Tarea } from '../types';
import { CheckSquare, CheckCircle, Clock, Flame } from 'lucide-react';

interface TareaMetricCardsProps {
  tareas: Tarea[];
}

export default function TareaMetricCards({ tareas }: TareaMetricCardsProps) {
  const totalCount = tareas.length;
  const completedCount = tareas.filter((t) => t.estado === 'Completada').length;
  const pendingCount = tareas.filter((t) => t.estado === 'Pendiente' || t.estado === 'En Proceso').length;
  const highPriorityCount = tareas.filter((t) => t.prioridad === 'Alta' && t.estado !== 'Completada').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-in fade-in duration-300">
      {/* Metric 1: Total Tareas */}
      <div 
        id="metric-total-tareas"
        className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(46,91,255,0.03)] flex items-center justify-between transition-all duration-300 hover:bg-white/65 hover:border-blue-300/60 hover:shadow-[0_12px_40px_rgba(46,91,255,0.06)]"
      >
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block truncate">Total Tareas</span>
          <h4 className="text-2xl font-extrabold text-slate-800 font-display">{totalCount}</h4>
          <span className="text-[11px] font-semibold text-slate-400">En la hoja de Google Sheets</span>
        </div>
        <div className="p-3 bg-[#2E5BFF]/10 text-[#2E5BFF] border border-blue-500/15 rounded-2xl shrink-0 shadow-sm">
          <CheckSquare size={22} className="stroke-[1.75]" />
        </div>
      </div>

      {/* Metric 2: Completadas */}
      <div 
        id="metric-tareas-completadas"
        className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(46,91,255,0.03)] flex items-center justify-between transition-all duration-300 hover:bg-white/65 hover:border-blue-300/60 hover:shadow-[0_12px_40px_rgba(46,91,255,0.06)]"
      >
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block truncate">Completadas</span>
          <h4 className="text-2xl font-extrabold text-[#2E5BFF] font-display truncate">
            {completedCount}
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">Con fecha y hora guardada</span>
        </div>
        <div className="p-3 bg-[#2E5BFF]/10 text-[#2E5BFF] border border-blue-500/15 rounded-2xl shrink-0 shadow-sm">
          <CheckCircle size={22} className="stroke-[1.75]" />
        </div>
      </div>

      {/* Metric 3: Pendientes / En Proceso */}
      <div 
        id="metric-tareas-pendientes"
        className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(14,165,233,0.03)] flex items-center justify-between transition-all duration-300 hover:bg-white/65 hover:border-sky-300/60 hover:shadow-[0_12px_40px_rgba(14,165,233,0.06)]"
      >
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block truncate">Por Completar</span>
          <h4 className="text-2xl font-extrabold text-sky-500 font-display truncate">
            {pendingCount}
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">Pendientes o en proceso</span>
        </div>
        <div className="p-3 bg-sky-500/10 text-sky-600 border border-sky-500/15 rounded-2xl shrink-0 shadow-sm">
          <Clock size={22} className="stroke-[1.75]" />
        </div>
      </div>

      {/* Metric 4: Alta Prioridad Activas */}
      <div 
        id="metric-tareas-prioridad-alta"
        className="bg-white/45 backdrop-blur-md p-5 rounded-3xl border border-white/60 shadow-[0_8px_32px_rgba(239,68,68,0.03)] flex items-center justify-between transition-all duration-300 hover:bg-white/65 hover:border-red-300/60 hover:shadow-[0_12px_40px_rgba(239,68,68,0.06)]"
      >
        <div className="space-y-1 min-w-0">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block truncate">Alta Prioridad</span>
          <h4 className="text-xl font-extrabold text-rose-600 font-display truncate">
            {highPriorityCount}
          </h4>
          <span className="text-[11px] font-semibold text-slate-400">Tareas críticas activas</span>
        </div>
        <div className="p-3 bg-rose-500/10 text-rose-500 border border-rose-500/15 rounded-2xl shrink-0 shadow-sm">
          <Flame size={22} className="stroke-[1.75]" />
        </div>
      </div>
    </div>
  );
}
