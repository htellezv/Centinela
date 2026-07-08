import React, { useState, useEffect } from 'react';
import { Renovacion } from '../types';
import { X } from 'lucide-react';

interface RenovacionFormProps {
  renovacionInicial?: Renovacion | null;
  onClose: () => void;
  onSave: (renovacion: Renovacion) => Promise<void>;
  siguienteId: string;
}

const ESTADOS_RENOVACION = [
  'Pendiente',
  'Renovado',
  'Vencido',
  'Cancelado',
];

export default function RenovacionForm({
  renovacionInicial,
  onClose,
  onSave,
  siguienteId,
}: RenovacionFormProps) {
  const [formData, setFormData] = useState<Omit<Renovacion, 'id'>>({
    cliente: '',
    servicio: '',
    fechaRenovacion: '',
    valor: '',
    estado: 'Pendiente',
  });

  const [id, setId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (renovacionInicial) {
      setId(renovacionInicial.id);
      setFormData({
        cliente: renovacionInicial.cliente || '',
        servicio: renovacionInicial.servicio || '',
        fechaRenovacion: renovacionInicial.fechaRenovacion || '',
        valor: renovacionInicial.valor || '',
        estado: renovacionInicial.estado || 'Pendiente',
      });
    } else {
      setId(siguienteId);
      // Auto-populate date with today's date
      const todayStr = new Date().toISOString().split('T')[0];
      setFormData({
        cliente: '',
        servicio: '',
        fechaRenovacion: todayStr,
        valor: '',
        estado: 'Pendiente',
      });
    }
  }, [renovacionInicial, siguienteId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cliente || !formData.servicio || !formData.fechaRenovacion || !formData.valor) {
      setError('Por favor complete todos los campos obligatorios.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const renovacionParaGuardar: Renovacion = {
        id,
        ...formData,
      };
      await onSave(renovacionParaGuardar);
    } catch (err: any) {
      setError(err?.message || 'Error al guardar la renovación. Intente nuevamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        id="renovacion-form-modal"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 font-display">
              {renovacionInicial ? 'Editar Registro de Renovación' : 'Crear Nueva Renovación'}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">ID Renovación: {id}</p>
          </div>
          <button
            id="close-renovacion-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div id="renovacion-form-error" className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cliente */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Cliente <span className="text-red-500">*</span>
              </label>
              <input
                id="input-renovacion-cliente"
                type="text"
                name="cliente"
                value={formData.cliente}
                onChange={handleChange}
                placeholder="Nombre o Razón Social del Cliente"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                required
              />
            </div>

            {/* Servicio */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Servicio <span className="text-red-500">*</span>
              </label>
              <input
                id="input-renovacion-servicio"
                type="text"
                name="servicio"
                value={formData.servicio}
                onChange={handleChange}
                placeholder="Ej. Hosting Anual, Licencia SaaS, Mantenimiento"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                required
              />
            </div>

            {/* Fecha Renovación */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fecha Renovación <span className="text-red-500">*</span>
              </label>
              <input
                id="input-renovacion-fecha"
                type="date"
                name="fechaRenovacion"
                value={formData.fechaRenovacion}
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
                id="input-renovacion-valor"
                type="text"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                placeholder="Monto de la Renovación"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-mono"
                required
              />
            </div>

            {/* Estado */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                id="input-renovacion-estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
                required
              >
                {ESTADOS_RENOVACION.map((est) => (
                  <option key={est} value={est}>
                    {est}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              id="cancel-renovacion-form-btn"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              id="save-renovacion-form-btn"
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
              ) : renovacionInicial ? (
                'Actualizar Registro'
              ) : (
                'Crear Renovación'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
