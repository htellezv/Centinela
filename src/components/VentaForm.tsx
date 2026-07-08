import React, { useState, useEffect } from 'react';
import { Venta } from '../types';
import { X } from 'lucide-react';

interface VentaFormProps {
  ventaInicial?: Venta | null;
  onClose: () => void;
  onSave: (venta: Venta) => Promise<void>;
  siguienteId: string;
}

const ESTADOS_PAGO = [
  { value: 'Pagado', label: '🟢 Pagado' },
  { value: 'Pendiente', label: '🟡 Pendiente' },
  { value: 'Reembolsado', label: '🔵 Reembolsado' },
  { value: 'Cancelado', label: '🔴 Cancelado' },
];

export default function VentaForm({
  ventaInicial,
  onClose,
  onSave,
  siguienteId,
}: VentaFormProps) {
  const [formData, setFormData] = useState<Omit<Venta, 'id'>>({
    cliente: '',
    servicio: '',
    valor: '',
    fecha: '',
    estadoPago: 'Pendiente',
    fechaInicio: '',
    fechaRenovacion: '',
    observaciones: '',
  });

  const [id, setId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ventaInicial) {
      setId(ventaInicial.id);
      setFormData({
        cliente: ventaInicial.cliente || '',
        servicio: ventaInicial.servicio || '',
        valor: ventaInicial.valor || '',
        fecha: ventaInicial.fecha || '',
        estadoPago: ventaInicial.estadoPago || 'Pendiente',
        fechaInicio: ventaInicial.fechaInicio || '',
        fechaRenovacion: ventaInicial.fechaRenovacion || '',
        observaciones: ventaInicial.observaciones || '',
      });
    } else {
      setId(siguienteId);
      // Auto-populate date with today's date
      const todayStr = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        fecha: todayStr,
        fechaInicio: todayStr,
      }));
    }
  }, [ventaInicial, siguienteId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cliente || !formData.servicio || !formData.valor) {
      setError('Por favor complete los campos obligatorios (Cliente, Servicio y Valor).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const ventaParaGuardar: Venta = {
        id,
        ...formData,
      };
      await onSave(ventaParaGuardar);
    } catch (err: any) {
      setError(err?.message || 'Error al guardar la venta. Intente nuevamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        id="venta-form-modal"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 font-display">
              {ventaInicial ? 'Editar Registro de Venta' : 'Registrar Nueva Venta'}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">ID Venta: {id}</p>
          </div>
          <button
            id="close-venta-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div id="venta-form-error" className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cliente */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Cliente / Empresa <span className="text-red-500">*</span>
              </label>
              <input
                id="input-venta-cliente"
                type="text"
                name="cliente"
                value={formData.cliente}
                onChange={handleChange}
                placeholder="Nombre del Cliente o Empresa"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                required
              />
            </div>

            {/* Servicio */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Servicio Vendido <span className="text-red-500">*</span>
              </label>
              <input
                id="input-venta-servicio"
                type="text"
                name="servicio"
                value={formData.servicio}
                onChange={handleChange}
                placeholder="Ej. Seguridad Privada, Monitoreo"
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
                id="input-venta-valor"
                type="text"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                placeholder="Monto de la Venta"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-mono"
                required
              />
            </div>

            {/* Estado de Pago */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Estado de pago <span className="text-red-500">*</span>
              </label>
              <select
                id="input-venta-estadopago"
                name="estadoPago"
                value={formData.estadoPago}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
                required
              >
                {ESTADOS_PAGO.map((est) => (
                  <option key={est.value} value={est.value}>
                    {est.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha de venta */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fecha de Venta <span className="text-red-500">*</span>
              </label>
              <input
                id="input-venta-fecha"
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                required
              />
            </div>

            {/* Fecha Inicio */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fecha Inicio del Servicio <span className="text-red-500">*</span>
              </label>
              <input
                id="input-venta-fechainicio"
                type="date"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                required
              />
            </div>

            {/* Fecha Renovación */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fecha Renovación / Vencimiento
              </label>
              <input
                id="input-venta-fecharenovacion"
                type="date"
                name="fechaRenovacion"
                value={formData.fechaRenovacion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Observaciones
            </label>
            <textarea
              id="input-venta-observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={3}
              placeholder="Detalles adicionales sobre la venta..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              id="cancel-venta-form-btn"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              id="save-venta-form-btn"
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
              ) : ventaInicial ? (
                'Actualizar Venta'
              ) : (
                'Registrar Venta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
