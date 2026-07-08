import React, { useState, useEffect } from 'react';
import { Gasto } from '../types';
import { X } from 'lucide-react';

interface GastoFormProps {
  gastoInicial?: Gasto | null;
  onClose: () => void;
  onSave: (gasto: Gasto) => Promise<void>;
  siguienteId: string;
}

const CATEGORIAS_GASTO = [
  'Arriendo / Alquiler',
  'Marketing / Publicidad',
  'Materiales de Oficina',
  'Servicios Básicos (Luz, Agua, Internet)',
  'Sueldos / Honorarios',
  'Transporte / Viajes',
  'Otros Gastos',
];

export default function GastoForm({
  gastoInicial,
  onClose,
  onSave,
  siguienteId,
}: GastoFormProps) {
  const [formData, setFormData] = useState<Omit<Gasto, 'id'>>({
    fecha: '',
    categoria: 'Sueldos / Honorarios',
    descripcion: '',
    valor: '',
  });

  const [id, setId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (gastoInicial) {
      setId(gastoInicial.id);
      setFormData({
        fecha: gastoInicial.fecha || '',
        categoria: gastoInicial.categoria || 'Sueldos / Honorarios',
        descripcion: gastoInicial.descripcion || '',
        valor: gastoInicial.valor || '',
      });
    } else {
      setId(siguienteId);
      // Auto-populate date with today's date
      const todayStr = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        fecha: todayStr,
      }));
    }
  }, [gastoInicial, siguienteId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fecha || !formData.categoria || !formData.valor) {
      setError('Por favor complete los campos obligatorios (Fecha, Categoría y Valor).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const gastoParaGuardar: Gasto = {
        id,
        ...formData,
      };
      await onSave(gastoParaGuardar);
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el gasto. Intente nuevamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        id="gasto-form-modal"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 font-display">
              {gastoInicial ? 'Editar Registro de Gasto' : 'Registrar Nuevo Gasto'}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">ID Gasto: {id}</p>
          </div>
          <button
            id="close-gasto-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div id="gasto-form-error" className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fecha del Gasto <span className="text-red-500">*</span>
              </label>
              <input
                id="input-gasto-fecha"
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                required
              />
            </div>

            {/* Valor */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Valor ($) <span className="text-red-500">*</span>
              </label>
              <input
                id="input-gasto-valor"
                type="text"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                placeholder="Monto del Gasto"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-mono"
                required
              />
            </div>

            {/* Categoría */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                id="input-gasto-categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
                required
              >
                {CATEGORIAS_GASTO.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Descripción / Detalle
            </label>
            <textarea
              id="input-gasto-descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={4}
              placeholder="Detalles adicionales sobre el gasto (Ej. Pago de arriendo de oficinas centrales)..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              id="cancel-gasto-form-btn"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              id="save-gasto-form-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm shadow-emerald-600/10 transition-all flex items-center justify-center min-w-[140px] disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Guardando...</span>
                </div>
              ) : gastoInicial ? (
                'Actualizar Gasto'
              ) : (
                'Registrar Gasto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
