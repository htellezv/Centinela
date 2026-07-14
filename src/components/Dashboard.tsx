import React, { useState, useMemo } from 'react';
import { 
  Cliente, 
  Prospecto, 
  Venta, 
  Gasto, 
  Renovacion, 
  Tarea 
} from '../types';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  TrendingUp, 
  Layers, 
  CheckSquare, 
  Receipt, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Check, 
  PieChart, 
  TrendingDown,
  Percent,
  FileSpreadsheet
} from 'lucide-react';

interface DashboardProps {
  clientes: Cliente[];
  prospectos: Prospecto[];
  ventas: Venta[];
  gastos: Gasto[];
  renovaciones: Renovacion[];
  tareas: Tarea[];
}

// Robust date parser to handle YYYY-MM-DD, DD/MM/YYYY, or standard Date objects safely
function parseDate(dateStr: string | undefined | null): Date | null {
  if (!dateStr) return null;
  
  const trimmed = String(dateStr).trim();
  if (!trimmed) return null;

  // Attempt direct standard Date parsing first (handles ISO strings and standard format)
  const directDate = new Date(trimmed);
  if (!isNaN(directDate.getTime())) {
    return directDate;
  }

  // Attempt standard splits for alternate locales/formats
  const parts = trimmed.split(/[-/.]/);
  if (parts.length === 3) {
    // Check if YYYY-MM-DD
    if (parts[0].length === 4) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    } else if (parts[2].length === 4) {
      // Check if DD-MM-YYYY or MM-DD-YYYY. Assume standard European DD-MM-YYYY
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
}

// Utility to parse currency values safely
function parseValor(valorStr: number | string | undefined | null): number {
  if (typeof valorStr === 'number') return valorStr;
  if (!valorStr) return 0;
  
  const cleanStr = String(valorStr)
    .replace(/[$\s]/g, '')             // Remove currency symbols and spaces
    .replace(/\./g, '')                // Remove thousands separator dot
    .replace(/,/g, '');                // Remove comma

  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? 0 : parsed;
}

// Universal currency formatter (Chilean Peso / general style matching Centinela)
function formatCurrency(val: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(val);
}

export default function Dashboard({
  clientes = [],
  prospectos = [],
  ventas = [],
  gastos = [],
  renovaciones = [],
  tareas = []
}: DashboardProps) {
  
  // Date Filters State
  const [datePreset, setDatePreset] = useState<string>('all');
  const [startDateStr, setStartDateStr] = useState<string>('');
  const [endDateStr, setEndDateStr] = useState<string>('');

  // Handle Preset Changes
  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    const today = new Date();
    
    if (preset === 'all') {
      setStartDateStr('');
      setEndDateStr('');
    } else if (preset === 'this-month') {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      
      const firstDay = `${year}-${month}-01`;
      
      // Last day of current month
      const lastDayObj = new Date(year, today.getMonth() + 1, 0);
      const lastDay = `${year}-${month}-${String(lastDayObj.getDate()).padStart(2, '0')}`;
      
      setStartDateStr(firstDay);
      setEndDateStr(lastDay);
    } else if (preset === 'last-30') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      const formatLocal = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };
      
      setStartDateStr(formatLocal(thirtyDaysAgo));
      setEndDateStr(formatLocal(today));
    } else if (preset === 'this-year') {
      const year = today.getFullYear();
      setStartDateStr(`${year}-01-01`);
      setEndDateStr(`${year}-12-31`);
    }
  };

  // Convert inputs to comparable times
  const activeFilters = useMemo(() => {
    const start = startDateStr ? new Date(startDateStr) : null;
    if (start) start.setHours(0, 0, 0, 0);
    
    const end = endDateStr ? new Date(endDateStr) : null;
    if (end) end.setHours(23, 59, 59, 999);

    return { start, end };
  }, [startDateStr, endDateStr]);

  // General Filter Function
  const filterByDate = <T extends { [key: string]: any }>(
    list: T[],
    dateFieldName: keyof T
  ): T[] => {
    const { start, end } = activeFilters;
    if (!start && !end) return list;

    return list.filter(item => {
      const fieldVal = item[dateFieldName];
      if (!fieldVal) return false;

      const itemDate = parseDate(String(fieldVal));
      if (!itemDate) return false;

      if (start && itemDate < start) return false;
      if (end && itemDate > end) return false;

      return true;
    });
  };

  // Filtered Datasets
  const filteredClientes = useMemo(() => filterByDate(clientes, 'fechaInicio'), [clientes, activeFilters]);
  const filteredProspectos = useMemo(() => filterByDate(prospectos, 'ultimoContacto'), [prospectos, activeFilters]);
  const filteredVentas = useMemo(() => filterByDate(ventas, 'fecha'), [ventas, activeFilters]);
  const filteredRenovaciones = useMemo(() => filterByDate(renovaciones, 'fechaRenovacion'), [renovaciones, activeFilters]);
  const filteredTareas = useMemo(() => filterByDate(tareas, 'fecha'), [tareas, activeFilters]);
  const filteredGastos = useMemo(() => filterByDate(gastos, 'fecha'), [gastos, activeFilters]);

  // -------------------------------------------------------------
  // INDICATOR CALCULATIONS (VENTAS, CLIENTES, PROSPECTOS, RENOVACIONES, TAREAS)
  // -------------------------------------------------------------

  // 1. VENTAS (Sales Indicators)
  const totalVentasValor = useMemo(() => {
    return filteredVentas.reduce((acc, v) => acc + parseValor(v.valor), 0);
  }, [filteredVentas]);

  const recaudadoVentas = useMemo(() => {
    return filteredVentas
      .filter(v => v.estadoPago === 'Pagado')
      .reduce((acc, v) => acc + parseValor(v.valor), 0);
  }, [filteredVentas]);

  const pendienteVentas = useMemo(() => {
    return filteredVentas
      .filter(v => v.estadoPago === 'Pendiente')
      .reduce((acc, v) => acc + parseValor(v.valor), 0);
  }, [filteredVentas]);

  // 2. CLIENTES (Clients Indicators)
  const totalClientesActivos = useMemo(() => {
    return filteredClientes.filter(c => c.estado === 'Activo').length;
  }, [filteredClientes]);

  const totalFacturacionMensualActiva = useMemo(() => {
    return filteredClientes
      .filter(c => c.estado === 'Activo')
      .reduce((acc, c) => acc + parseValor(c.valor), 0);
  }, [filteredClientes]);

  const clientesDistribucion = useMemo(() => {
    const act = filteredClientes.filter(c => c.estado === 'Activo').length;
    const pen = filteredClientes.filter(c => c.estado === 'Pendiente').length;
    const ven = filteredClientes.filter(c => c.estado === 'Vencido').length;
    return { activos: act, pendientes: pen, vencidos: ven };
  }, [filteredClientes]);

  // 3. PROSPECTOS (Prospects Indicators)
  const prospectosActivosPipeline = useMemo(() => {
    // Leads currently active (not Ganado or Perdido/Descartado)
    const activeStates = ['Nuevo', 'Contactado', 'En negociación', 'Propuesta enviada'];
    return filteredProspectos.filter(p => activeStates.includes(p.estado));
  }, [filteredProspectos]);

  const pipelineEstimadoValue = useMemo(() => {
    return prospectosActivosPipeline.reduce((acc, p) => acc + parseValor(p.valorEstimado), 0);
  }, [prospectosActivosPipeline]);

  const prospectosDistribucion = useMemo(() => {
    const distribution: { [key: string]: number } = {};
    filteredProspectos.forEach(p => {
      const state = p.estado || 'Sin estado';
      distribution[state] = (distribution[state] || 0) + 1;
    });
    return distribution;
  }, [filteredProspectos]);

  // 4. RENOVACIONES (Renewals Indicators)
  const renovacionesProyectadasValor = useMemo(() => {
    return filteredRenovaciones.reduce((acc, r) => acc + parseValor(r.valor), 0);
  }, [filteredRenovaciones]);

  const renovacionesEstado = useMemo(() => {
    const com = filteredRenovaciones.filter(r => r.estado === 'Completada').length;
    const pen = filteredRenovaciones.filter(r => r.estado === 'Pendiente').length;
    return { completadas: com, pendientes: pen };
  }, [filteredRenovaciones]);

  // 5. TAREAS (Tasks Indicators)
  const tareasCompletadasCount = useMemo(() => {
    return filteredTareas.filter(t => t.estado === 'Completada').length;
  }, [filteredTareas]);

  const tareasPendientesCount = useMemo(() => {
    return filteredTareas.filter(t => t.estado !== 'Completada').length;
  }, [filteredTareas]);

  const porcentajeTareasCompletadas = useMemo(() => {
    const total = filteredTareas.length;
    if (total === 0) return 0;
    return Math.round((tareasCompletadasCount / total) * 100);
  }, [filteredTareas, tareasCompletadasCount]);

  const tareasPrioridadAltaPendiente = useMemo(() => {
    return filteredTareas.filter(t => t.prioridad === 'Alta' && t.estado !== 'Completada').length;
  }, [filteredTareas]);


  // 6. ADITIONAL META METRICS (e.g. Net Margin for deeper analytical quality)
  const totalGastosValor = useMemo(() => {
    return filteredGastos.reduce((acc, g) => acc + parseValor(g.valor), 0);
  }, [filteredGastos]);

  const margenNeto = useMemo(() => {
    return totalVentasValor - totalGastosValor;
  }, [totalVentasValor, totalGastosValor]);


  // Calculate Service Popularity (Ventas por servicio)
  const ventasPorServicio = useMemo(() => {
    const map: { [key: string]: { count: number; value: number } } = {};
    filteredVentas.forEach(v => {
      const srv = v.servicio || 'Otro';
      if (!map[srv]) {
        map[srv] = { count: 0, value: 0 };
      }
      map[srv].count += 1;
      map[srv].value += parseValor(v.valor);
    });

    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // top 5
  }, [filteredVentas]);

  // Generate simple monthly sales trend for the current dataset
  const ventasMensualesTrend = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const trend = months.map((month, idx) => ({
      month,
      index: idx,
      ventas: 0,
      gastos: 0
    }));

    filteredVentas.forEach(v => {
      const d = parseDate(v.fecha);
      if (d) {
        const mIdx = d.getMonth();
        trend[mIdx].ventas += parseValor(v.valor);
      }
    });

    filteredGastos.forEach(g => {
      const d = parseDate(g.fecha);
      if (d) {
        const mIdx = d.getMonth();
        trend[mIdx].gastos += parseValor(g.valor);
      }
    });

    // Filter months that have either sales or expenses to avoid flat empty months
    const activeMonths = trend.filter(t => t.ventas > 0 || t.gastos > 0);
    return activeMonths.length > 0 ? activeMonths : trend.slice(0, 6);
  }, [filteredVentas, filteredGastos]);

  // Highest sales month helper for rendering
  const maxVentaMes = useMemo(() => {
    if (ventasMensualesTrend.length === 0) return null;
    return [...ventasMensualesTrend].sort((a, b) => b.ventas - a.ventas)[0];
  }, [ventasMensualesTrend]);
  return (
    <div id="general-dashboard" className="relative space-y-6 animate-in fade-in duration-500 -m-6 p-6 min-h-screen">
      
      {/* Ambient Liquid Glass Background Glow Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Blob 1: Centinela Primary Electric Blue */}
        <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] rounded-full bg-gradient-to-tr from-[#2E5BFF] to-[#00F5D4] opacity-15 blur-[120px] animate-pulse duration-[8s]" />
        {/* Blob 2: Secondary Sky Blue */}
        <div className="absolute top-[35%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-[#1D9BF0] to-[#00F5D4] opacity-15 blur-[100px] animate-pulse duration-[10s]" />
        {/* Blob 3: Tertiary Magenta/Pink */}
        <div className="absolute bottom-[-5%] left-[15%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-[#FF5CE3] to-[#2E5BFF] opacity-10 blur-[130px]" />
      </div>

      <div className="relative z-10 space-y-6">
        
        {/* HEADER BAR AND FILTERS CONTROL PANEL */}
        <div 
          id="dashboard-filter-header"
          className="bg-gradient-to-r from-[#2E5BFF] via-[#1D9BF0] to-[#00F5D4] text-white shadow-[0_15px_40px_rgba(46,91,255,0.15)] p-5 rounded-3xl flex flex-col lg:flex-row gap-4 items-center justify-between transition-all duration-300 border-0"
        >
          <div className="flex items-center space-x-3.5 self-start lg:self-auto">
            <div className="p-3 bg-white/15 text-white rounded-2xl border border-white/20 shadow-sm">
              <LayoutDashboard size={24} className="stroke-[1.5]" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white font-display tracking-tight">Dashboard de Gestión</h2>
              <p className="text-xs text-white/80 font-mono mt-0.5">Visión integrada y analítica del negocio</p>
            </div>
          </div>

          {/* Date Filter & Preset Controls */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3.5">
            {/* Preset Buttons */}
            <div className="flex bg-white/10 p-1 rounded-xl w-full sm:w-auto overflow-x-auto border border-white/10 backdrop-blur-sm">
              <button
                onClick={() => handlePresetChange('all')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  datePreset === 'all'
                    ? 'bg-white text-[#1D9BF0] shadow-[0_4px_12px_rgba(255,255,255,0.15)] border-0'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Todo
              </button>
              <button
                onClick={() => handlePresetChange('this-month')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  datePreset === 'this-month'
                    ? 'bg-white text-[#1D9BF0] shadow-[0_4px_12px_rgba(255,255,255,0.15)] border-0'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Este Mes
              </button>
              <button
                onClick={() => handlePresetChange('last-30')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  datePreset === 'last-30'
                    ? 'bg-white text-[#1D9BF0] shadow-[0_4px_12px_rgba(255,255,255,0.15)] border-0'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Últimos 30 Días
              </button>
              <button
                onClick={() => handlePresetChange('this-year')}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  datePreset === 'this-year'
                    ? 'bg-white text-[#1D9BF0] shadow-[0_4px_12px_rgba(255,255,255,0.15)] border-0'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Este Año
              </button>
            </div>

            {/* Date Picker Inputs */}
            <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-between">
               <div className="relative">
                 <input
                   type="date"
                   value={startDateStr}
                   onChange={(e) => {
                     setStartDateStr(e.target.value);
                     setDatePreset('custom');
                   }}
                   className="w-full sm:w-[135px] pl-2 pr-2 py-1.5 bg-white/15 border border-white/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-white/10 focus:border-white text-xs text-white font-bold cursor-pointer shadow-sm transition-all [color-scheme:dark]"
                   placeholder="Desde"
                   title="Fecha de Inicio"
                 />
               </div>
               <span className="text-white/60 text-xs font-bold font-mono">a</span>
               <div className="relative">
                 <input
                   type="date"
                   value={endDateStr}
                   onChange={(e) => {
                     setEndDateStr(e.target.value);
                     setDatePreset('custom');
                   }}
                   className="w-full sm:w-[135px] pl-2 pr-2 py-1.5 bg-white/15 border border-white/20 rounded-xl focus:outline-none focus:ring-4 focus:ring-white/10 focus:border-white text-xs text-white font-bold cursor-pointer shadow-sm transition-all [color-scheme:dark]"
                   placeholder="Hasta"
                   title="Fecha de Vencimiento"
                 />
               </div>
            </div>
          </div>
        </div>

        {/* CORE KPI BENTO GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* KPI 1: VENTAS (Primary Electric Blue Theme) */}
          <div className="bg-white/85 backdrop-blur-xl p-5 rounded-3xl border border-white/95 shadow-[0_15px_35px_rgba(46,91,255,0.05)] flex flex-col justify-between h-[155px] relative overflow-hidden group hover:scale-[1.02] hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-[0_22px_45px_rgba(46,91,255,0.12)] transition-all duration-300 before:absolute before:top-0 before:left-1/4 before:right-1/4 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#2E5BFF] before:to-transparent">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#2E5BFF] uppercase tracking-widest block">Ventas</span>
                <h4 className="text-xl font-extrabold text-slate-900 font-display truncate">
                  {formatCurrency(totalVentasValor)}
                </h4>
              </div>
              <div className="p-2.5 bg-[#2E5BFF]/10 text-[#2E5BFF] border border-[#2E5BFF]/15 rounded-2xl group-hover:bg-[#2E5BFF]/20 transition-all shadow-sm shadow-[#2E5BFF]/5">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-600">{filteredVentas.length} Transacciones</span>
              <span className="text-[#2E5BFF] font-mono font-bold flex items-center">
                <Check size={12} className="mr-0.5" />
                {Math.round((recaudadoVentas / (totalVentasValor || 1)) * 100)}% pagado
              </span>
            </div>
          </div>

          {/* KPI 2: CLIENTES (Neutral Slate/Blue Theme) */}
          <div className="bg-white/85 backdrop-blur-xl p-5 rounded-3xl border border-white/95 shadow-[0_15px_35px_rgba(71,85,105,0.05)] flex flex-col justify-between h-[155px] relative overflow-hidden group hover:scale-[1.02] hover:-translate-y-1 hover:border-slate-400/50 hover:shadow-[0_22px_45px_rgba(71,85,105,0.12)] transition-all duration-300 before:absolute before:top-0 before:left-1/4 before:right-1/4 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-slate-400 before:to-transparent">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Clientes</span>
                <h4 className="text-2xl font-extrabold text-slate-900 font-display">
                  {filteredClientes.length}
                </h4>
              </div>
              <div className="p-2.5 bg-slate-500/10 text-slate-600 border border-slate-500/15 rounded-2xl group-hover:bg-slate-500/20 transition-all shadow-sm shadow-slate-500/5">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-600">{totalClientesActivos} Activos</span>
              <span className="font-mono text-slate-500 font-bold">MRR: {formatCurrency(totalFacturacionMensualActiva)}</span>
            </div>
          </div>

          {/* KPI 3: PROSPECTOS (Secondary Sky Blue Theme) */}
          <div className="bg-white/85 backdrop-blur-xl p-5 rounded-3xl border border-white/95 shadow-[0_15px_35px_rgba(14,165,233,0.05)] flex flex-col justify-between h-[155px] relative overflow-hidden group hover:scale-[1.02] hover:-translate-y-1 hover:border-sky-400/50 hover:shadow-[0_22px_45px_rgba(14,165,233,0.12)] transition-all duration-300 before:absolute before:top-0 before:left-1/4 before:right-1/4 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-sky-400 before:to-transparent">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-sky-500 uppercase tracking-widest block">Prospectos</span>
                <h4 className="text-2xl font-extrabold text-slate-900 font-display">
                  {filteredProspectos.length}
                </h4>
              </div>
              <div className="p-2.5 bg-sky-500/10 text-sky-600 border border-sky-500/15 rounded-2xl group-hover:bg-sky-500/20 transition-all shadow-sm shadow-sky-500/5">
                <Layers size={18} />
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-sky-600">{prospectosActivosPipeline.length} En Pipeline</span>
              <span className="font-mono text-slate-500 font-bold">Potencial: {formatCurrency(pipelineEstimadoValue)}</span>
            </div>
          </div>

          {/* KPI 4: RENOVACIONES (Tertiary Pink Theme) */}
          <div className="bg-white/85 backdrop-blur-xl p-5 rounded-3xl border border-white/95 shadow-[0_15px_35px_rgba(255,92,227,0.05)] flex flex-col justify-between h-[155px] relative overflow-hidden group hover:scale-[1.02] hover:-translate-y-1 hover:border-pink-400/50 hover:shadow-[0_22px_45px_rgba(255,92,227,0.12)] transition-all duration-300 before:absolute before:top-0 before:left-1/4 before:right-1/4 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-pink-400 before:to-transparent">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-pink-500 uppercase tracking-widest block">Renovaciones</span>
                <h4 className="text-xl font-extrabold text-slate-900 font-display truncate">
                  {formatCurrency(renovacionesProyectadasValor)}
                </h4>
              </div>
              <div className="p-2.5 bg-pink-500/10 text-pink-500 border border-pink-500/15 rounded-2xl group-hover:bg-pink-500/20 transition-all shadow-sm shadow-pink-500/5">
                <Calendar size={18} />
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-600">{filteredRenovaciones.length} Registros</span>
              <span className="text-pink-500 font-mono font-bold">{renovacionesEstado.pendientes} Pendientes</span>
            </div>
          </div>

          {/* KPI 5: TAREAS (Indigo/Violet Theme) */}
          <div className="bg-white/85 backdrop-blur-xl p-5 rounded-3xl border border-white/95 shadow-[0_15px_35px_rgba(99,102,241,0.05)] flex flex-col justify-between h-[155px] relative overflow-hidden group hover:scale-[1.02] hover:-translate-y-1 hover:border-indigo-400/50 hover:shadow-[0_22px_45px_rgba(99,102,241,0.12)] transition-all duration-300 before:absolute before:top-0 before:left-1/4 before:right-1/4 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-indigo-400 before:to-transparent">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest block">Tareas</span>
                <h4 className="text-2xl font-extrabold text-slate-900 font-display">
                  {porcentajeTareasCompletadas}%
                </h4>
              </div>
              <div className="p-2.5 bg-indigo-500/10 text-indigo-600 border border-indigo-500/15 rounded-2xl group-hover:bg-indigo-500/20 transition-all shadow-sm shadow-indigo-500/5">
                <CheckSquare size={18} />
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-indigo-600">{tareasCompletadasCount} de {filteredTareas.length}</span>
              {tareasPrioridadAltaPendiente > 0 ? (
                <span className="text-rose-500 font-bold flex items-center font-mono animate-pulse">
                  ⚠ {tareasPrioridadAltaPendiente} Alta
                </span>
              ) : (
                <span className="text-emerald-600 font-bold">Al día</span>
              )}
            </div>
          </div>

        </div>

        {/* DETAILED DATA CHARTS & PIPELINE VISUALIZATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: TREND & REVENUE VS EXPENSES */}
          <div className="lg:col-span-8 bg-white/85 backdrop-blur-xl p-6 rounded-3xl border border-white/95 overflow-hidden shadow-[0_15px_35px_rgba(148,163,184,0.05)] hover:scale-[1.01] hover:shadow-[0_22px_45px_rgba(148,163,184,0.12)] transition-all duration-300 flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-[#2E5BFF] via-[#1D9BF0] to-[#00F5D4] text-white px-6 py-4 -mx-6 -mt-6 mb-5 border-b border-white/10 gap-3">
                <div>
                  <h3 className="text-base font-extrabold text-white font-display">Histórico de Flujo Mensual</h3>
                  <p className="text-xs text-white/85">Comparativa mensual de ingresos facturados vs gastos operacionales</p>
                </div>
                <div className="flex items-center space-x-4 text-xs font-semibold self-start sm:self-auto bg-white/15 px-3 py-1.5 rounded-xl border border-white/10">
                  <span className="flex items-center text-white">
                    <span className="w-2.5 h-2.5 bg-[#2E5BFF] rounded-full mr-1.5 shadow-[0_0_8px_rgba(46,91,255,0.4)] border border-white/25" />
                    Ventas
                  </span>
                  <span className="flex items-center text-white">
                    <span className="w-2.5 h-2.5 bg-rose-400 rounded-full mr-1.5 shadow-[0_0_8px_rgba(251,113,133,0.4)] border border-white/25" />
                    Gastos
                  </span>
                </div>
              </div>

              {/* Custom SVG Line & Area Chart for Trends */}
              {ventasMensualesTrend.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
                  No hay transacciones registradas en este rango de fechas.
                </div>
              ) : (
                <div className="relative mt-4">
                  <div className="h-52 w-full flex items-end justify-between px-4 pb-2 relative">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
                      <div className="w-full border-t border-slate-200/50" />
                      <div className="w-full border-t border-slate-200/50" />
                      <div className="w-full border-t border-slate-200/50" />
                      <div className="w-full border-t border-slate-200/50" />
                    </div>

                    {/* Render Columns dynamically */}
                    {ventasMensualesTrend.map((t, i) => {
                      // Normalize values for SVG height mapping
                      const maxPossible = Math.max(
                         ...ventasMensualesTrend.map(x => Math.max(x.ventas, x.gastos)),
                         100000 // avoid divide-by-zero or micro-values
                      );

                      const ventasPct = (t.ventas / maxPossible) * 100;
                      const gastosPct = (t.gastos / maxPossible) * 100;

                      return (
                        <div key={t.month} className="flex-1 flex flex-col items-center group relative z-10 mx-1">
                          <div className="w-full flex justify-center items-end space-x-1.5 h-44">
                            {/* Ventas Bar with Liquid Glass gradient */}
                            <div 
                              style={{ height: `${Math.max(ventasPct, 4)}%` }}
                              className="w-4 sm:w-6 bg-gradient-to-t from-[#2E5BFF]/85 to-[#60A5FA] shadow-[0_0_12px_rgba(46,91,255,0.15)] rounded-t-lg transition-all group-hover:scale-[1.03] group-hover:shadow-[0_0_16px_rgba(46,91,255,0.25)] relative"
                              title={`Ventas ${t.month}: ${formatCurrency(t.ventas)}`}
                            >
                              {/* Hover tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-mono py-1 px-2.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none border border-white/10">
                                Ventas: {formatCurrency(t.ventas)}
                              </div>
                            </div>

                            {/* Gastos Bar with Liquid Glass gradient */}
                            <div 
                              style={{ height: `${Math.max(gastosPct, 4)}%` }}
                              className="w-4 sm:w-6 bg-gradient-to-t from-rose-400/85 to-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.15)] rounded-t-lg transition-all group-hover:scale-[1.03] group-hover:shadow-[0_0_16px_rgba(244,63,94,0.25)] relative"
                              title={`Gastos ${t.month}: ${formatCurrency(t.gastos)}`}
                            >
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-mono py-1 px-2.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none border border-white/10">
                                Gastos: {formatCurrency(t.gastos)}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-slate-500 mt-2 font-mono">{t.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick analysis summary at the bottom */}
            <div className="bg-[#2E5BFF]/5 backdrop-blur-sm p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 mt-4 border border-blue-500/10">
              <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                {margenNeto >= 0 ? (
                  <span className="p-1.5 bg-[#2E5BFF]/10 text-[#2E5BFF] border border-blue-500/20 rounded-lg shadow-sm">
                    <ArrowUpRight size={14} className="stroke-[2.5]" />
                  </span>
                ) : (
                  <span className="p-1.5 bg-rose-500/10 text-rose-700 border border-rose-500/20 rounded-lg shadow-sm">
                    <ArrowDownRight size={14} className="stroke-[2.5]" />
                  </span>
                )}
                <span>
                  Margen neto operacional actual:{' '}
                  <strong className={margenNeto >= 0 ? 'text-[#2E5BFF] font-extrabold' : 'text-rose-700 font-extrabold'}>
                    {formatCurrency(margenNeto)}
                  </strong>
                </span>
              </div>
              {maxVentaMes && (
                <span className="font-mono text-[11px] text-slate-500 font-semibold">
                  Mes de mayor facturación: <strong className="text-slate-700 font-bold">{maxVentaMes.month}</strong> ({formatCurrency(maxVentaMes.ventas)})
                </span>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: DISTRIBUTION OF SERVICES (Ventas por Servicio) */}
          <div className="lg:col-span-4 bg-white/85 backdrop-blur-xl p-6 rounded-3xl border border-white/95 overflow-hidden shadow-[0_15px_35px_rgba(148,163,184,0.05)] hover:scale-[1.01] hover:shadow-[0_22px_45px_rgba(148,163,184,0.12)] transition-all duration-300 flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex items-center justify-between bg-gradient-to-r from-[#2E5BFF] via-[#1D9BF0] to-[#00F5D4] text-white px-6 py-4 -mx-6 -mt-6 mb-5 border-b border-white/10">
                <div>
                  <h3 className="text-base font-extrabold text-white font-display">Servicios más Vendidos</h3>
                  <p className="text-xs text-white/85">Distribución de ingresos por tipo de servicio</p>
                </div>
                <Percent size={16} className="text-white/80" />
              </div>

              {ventasPorServicio.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
                  Sin transacciones registradas.
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  {ventasPorServicio.map((item, index) => {
                    const totalSumOfAll = ventasPorServicio.reduce((a, b) => a + b.value, 0);
                    const percentage = totalSumOfAll > 0 ? Math.round((item.value / totalSumOfAll) * 100) : 0;
                    
                    // Color cyclic assignment with gorgeous glowing gradients
                    const barColors = [
                      'bg-gradient-to-r from-[#2E5BFF] to-[#60A5FA] shadow-[0_0_8px_rgba(46,91,255,0.2)]',
                      'bg-gradient-to-r from-[#FF5CE3] to-[#FF9BEA] shadow-[0_0_8px_rgba(255,92,227,0.2)]',
                      'bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] shadow-[0_0_8px_rgba(14,165,233,0.2)]',
                      'bg-gradient-to-r from-[#6366F1] to-[#818CF8] shadow-[0_0_8px_rgba(99,102,241,0.2)]',
                      'bg-gradient-to-r from-[#475569] to-[#64748B] shadow-[0_0_8px_rgba(71,85,105,0.2)]'
                    ];
                    const textColors = [
                      'text-[#2E5BFF]',
                      'text-pink-500',
                      'text-sky-500',
                      'text-indigo-500',
                      'text-[#2E5BFF]'
                    ];

                    return (
                      <div key={item.name} className="space-y-1 group">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-700 truncate max-w-[150px]" title={item.name}>
                            {index + 1}. {item.name}
                          </span>
                          <div className="space-x-1 font-mono">
                            <span className="text-slate-400">({item.count})</span>
                            <span className={`${textColors[index % barColors.length]} font-bold`}>{formatCurrency(item.value)}</span>
                          </div>
                        </div>
                        
                        {/* Progress representation with glassy container */}
                        <div className="h-2 w-full bg-slate-200/40 border border-slate-200/10 rounded-full overflow-hidden backdrop-blur-sm">
                          <div 
                            style={{ width: `${percentage}%` }}
                            className={`h-full rounded-full ${barColors[index % barColors.length]} transition-all duration-500 group-hover:scale-[1.01]`}
                          />
                        </div>
                        <div className="flex justify-end text-[10px] font-mono text-slate-400">
                          {percentage}% del total
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100/60 text-center text-xs text-slate-400 font-semibold">
              Analizando <strong className="text-slate-600 font-bold">{filteredVentas.length}</strong> ventas del período filtrado.
            </div>
          </div>

        </div>

        {/* ADDITIONAL DETAILED GRIDS: PROSPECT FUNNEL, CONTRACT ALERTS, PENDING TAREAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 1. EMBUDO DE PROSPECTOS / LEADS PIPELINE */}
          <div className="lg:col-span-4 bg-white/85 backdrop-blur-xl p-6 rounded-3xl border border-white/95 overflow-hidden shadow-[0_15px_35px_rgba(148,163,184,0.05)] hover:scale-[1.01] hover:shadow-[0_22px_45px_rgba(148,163,184,0.12)] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between bg-gradient-to-r from-[#2E5BFF] via-[#1D9BF0] to-[#00F5D4] text-white px-6 py-4 -mx-6 -mt-6 mb-5 border-b border-white/10">
                <div>
                  <h3 className="text-base font-extrabold text-white font-display">Embudo de Prospectos</h3>
                  <p className="text-xs text-white/85">Estados de leads en conversión</p>
                </div>
                <PieChart size={16} className="text-white/80" />
              </div>

              <div className="space-y-3 py-1">
                {['Nuevo', 'Contactado', 'En negociación', 'Propuesta enviada', 'Ganado'].map((estadoName, idx) => {
                  const count = filteredProspectos.filter(p => p.estado === estadoName).length;
                  const totalProsp = filteredProspectos.length;
                  const pct = totalProsp > 0 ? Math.round((count / totalProsp) * 100) : 0;
                  
                  // Gorgeous glowing glassy cards for stages
                  const funnelColors = [
                    'bg-slate-50/70 border-slate-200/50 text-slate-700 hover:border-slate-300',
                    'bg-indigo-50/70 border-indigo-200/40 text-indigo-700 shadow-sm shadow-indigo-500/5 hover:border-indigo-300',
                    'bg-amber-50/70 border-amber-200/40 text-amber-700 shadow-sm shadow-amber-500/5 hover:border-amber-300',
                    'bg-violet-50/70 border-violet-200/40 text-violet-700 shadow-sm shadow-violet-500/5 hover:border-violet-300',
                    'bg-blue-50/70 border-blue-200/40 text-[#2E5BFF] shadow-sm shadow-[#2E5BFF]/5 hover:border-blue-300'
                  ];

                  return (
                    <div 
                      key={estadoName}
                      className={`flex items-center justify-between p-2.5 rounded-xl border backdrop-blur-sm transition-all duration-200 hover:translate-x-1 hover:shadow-sm ${funnelColors[idx % funnelColors.length]} text-xs font-semibold`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-lg bg-white/90 shadow-sm flex items-center justify-center font-bold text-[10px] text-slate-700 border border-slate-200/30">
                          {idx + 1}
                        </span>
                        <span>{estadoName}</span>
                      </div>
                      <div className="flex items-center space-x-2.5 font-mono">
                        <span>{count} leads</span>
                        <span className="opacity-70">|</span>
                        <span>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono font-semibold">
              <span>Conversión total:</span>
              <span className="text-[#2E5BFF] font-bold">
                {Math.round(
                  ((filteredProspectos.filter(p => p.estado === 'Ganado').length) / (filteredProspectos.length || 1)) * 100
                )}% cerrados exitosos
              </span>
            </div>
          </div>

          {/* 2. PROXIMAS RENOVACIONES ALERTS */}
          <div className="lg:col-span-4 bg-white/85 backdrop-blur-xl p-6 rounded-3xl border border-white/95 overflow-hidden shadow-[0_15px_35px_rgba(148,163,184,0.05)] hover:scale-[1.01] hover:shadow-[0_22px_45px_rgba(148,163,184,0.12)] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between bg-gradient-to-r from-[#2E5BFF] via-[#1D9BF0] to-[#00F5D4] text-white px-6 py-4 -mx-6 -mt-6 mb-5 border-b border-white/10">
                <div>
                  <h3 className="text-base font-extrabold text-white font-display">Próximas Renovaciones</h3>
                  <p className="text-xs text-white/85">Contratos pendientes de renovación</p>
                </div>
                <Clock size={16} className="text-white/80" />
              </div>

              {filteredRenovaciones.filter(r => r.estado === 'Pendiente').length === 0 ? (
                <div className="py-14 text-center text-xs text-slate-400">
                  <Check className="mx-auto text-[#2E5BFF] mb-2" size={24} />
                  No hay renovaciones pendientes en el período seleccionado.
                </div>
              ) : (
                <div className="space-y-3 max-h-[255px] overflow-y-auto pr-1">
                  {filteredRenovaciones
                    .filter(r => r.estado === 'Pendiente')
                    .sort((a, b) => {
                      const da = a.fechaRenovacion ? new Date(a.fechaRenovacion).getTime() : 0;
                      const db = b.fechaRenovacion ? new Date(b.fechaRenovacion).getTime() : 0;
                      return da - db;
                    })
                    .slice(0, 4)
                    .map(ren => (
                      <div 
                        key={ren.id}
                        className="p-3 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:bg-white/85 hover:scale-[1.02] hover:shadow-md hover:border-blue-200/40 transition-all duration-200 flex flex-col justify-between space-y-1.5"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-slate-800 truncate max-w-[170px]" title={ren.cliente}>
                            {ren.cliente}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-rose-600 bg-rose-500/10 border border-rose-500/15 px-2 py-0.5 rounded-full">
                            {ren.fechaRenovacion || 'S/F'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-slate-500 font-semibold">
                          <span className="truncate max-w-[150px]">{ren.servicio}</span>
                           <span className="font-bold text-slate-700 font-mono">{formatCurrency(parseValor(ren.valor))}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400 font-mono font-semibold">
              {filteredRenovaciones.filter(r => r.estado === 'Pendiente').length} renovación(es) pendientes en total
            </div>
          </div>

          {/* 3. TAREAS URGENTES PENDIENTES */}
          <div className="lg:col-span-4 bg-white/85 backdrop-blur-xl p-6 rounded-3xl border border-white/95 overflow-hidden shadow-[0_15px_35px_rgba(148,163,184,0.05)] hover:scale-[1.01] hover:shadow-[0_22px_45px_rgba(148,163,184,0.12)] transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between bg-gradient-to-r from-[#2E5BFF] via-[#1D9BF0] to-[#00F5D4] text-white px-6 py-4 -mx-6 -mt-6 mb-5 border-b border-white/10">
                <div>
                  <h3 className="text-base font-extrabold text-white font-display">Tareas Críticas</h3>
                  <p className="text-xs text-white/85">Próximas tareas de prioridad Alta o Media</p>
                </div>
                <AlertTriangle size={16} className="text-white/80" />
              </div>

              {filteredTareas.filter(t => t.estado !== 'Completada').length === 0 ? (
                <div className="py-14 text-center text-xs text-slate-400">
                  <Check className="mx-auto text-[#2E5BFF] mb-2" size={24} />
                  ¡Todas las tareas están completadas! Buen trabajo.
                </div>
              ) : (
                <div className="space-y-3 max-h-[255px] overflow-y-auto pr-1">
                  {filteredTareas
                    .filter(t => t.estado !== 'Completada')
                    .sort((a, b) => {
                      const prioridades: { [key: string]: number } = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
                      const pA = prioridades[a.prioridad] || 0;
                      const pB = prioridades[b.prioridad] || 0;
                      if (pB !== pA) return pB - pA;
                      
                      const da = a.fecha ? new Date(a.fecha).getTime() : 0;
                      const db = b.fecha ? new Date(b.fecha).getTime() : 0;
                      return da - db;
                    })
                    .slice(0, 4)
                    .map(t => (
                      <div 
                        key={t.id}
                        className="p-3 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:bg-white/85 hover:scale-[1.02] hover:shadow-md hover:border-blue-200/40 transition-all duration-200 flex flex-col justify-between space-y-1.5"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-xs text-slate-800 truncate max-w-[160px]" title={t.titulo}>
                            {t.titulo}
                          </span>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            t.prioridad === 'Alta' 
                              ? 'bg-rose-500/10 text-rose-700 border-rose-500/15'
                              : 'bg-amber-500/10 text-amber-700 border-amber-500/15'
                          }`}>
                            {t.prioridad}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                          <span className="truncate max-w-[170px] font-sans font-medium" title={t.descripcion || 'Sin descripción'}>
                            {t.descripcion || 'Sin descripción'}
                          </span>
                          <span className="text-slate-400 font-semibold">{t.fecha || 'S/F'}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400 font-mono font-semibold">
              {filteredTareas.filter(t => t.estado !== 'Completada').length} tareas pendientes en total
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
