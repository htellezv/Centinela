import React, { useState, useEffect } from 'react';
import { Prospecto } from '../types';
import { X } from 'lucide-react';

interface ProspectoFormProps {
  prospectoInicial?: Prospecto | null;
  onClose: () => void;
  onSave: (prospecto: Prospecto) => Promise<void>;
  siguienteId: string;
}

const ESTADOS_DISPONIBLES = [
  { value: 'Nuevo', label: '🔵 Nuevo' },
  { value: 'Contactado', label: '🟡 Contactado' },
  { value: 'En negociación', label: '🟠 En negociación' },
  { value: 'Propuesta enviada', label: '🟣 Propuesta enviada' },
  { value: 'Ganado', label: '🟢 Ganado' },
  { value: 'Perdido', label: '🔴 Perdido' },
];

export default function ProspectoForm({
  prospectoInicial,
  onClose,
  onSave,
  siguienteId,
}: ProspectoFormProps) {
  const [formData, setFormData] = useState<Omit<Prospecto, 'id'>>({
    empresa: '',
    contacto: '',
    telefono: '',
    correo: '',
    servicioInteres: '',
    valorEstimado: '',
    estado: 'Nuevo',
    ultimoContacto: '',
    proximoSeguimiento: '',
    observaciones: '',
  });

  const [id, setId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (prospectoInicial) {
      setId(prospectoInicial.id);
      setFormData({
        empresa: prospectoInicial.empresa || '',
        contacto: prospectoInicial.contacto || '',
        telefono: prospectoInicial.telefono || '',
        correo: prospectoInicial.correo || '',
        servicioInteres: prospectoInicial.servicioInteres || '',
        valorEstimado: prospectoInicial.valorEstimado || '',
        estado: prospectoInicial.estado || 'Nuevo',
        ultimoContacto: prospectoInicial.ultimoContacto || '',
        proximoSeguimiento: prospectoInicial.proximoSeguimiento || '',
        observaciones: prospectoInicial.observaciones || '',
      });
    } else {
      setId(siguienteId);
    }
  }, [prospectoInicial, siguienteId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.empresa || !formData.contacto) {
      setError('Por favor complete los campos obligatorios (Empresa y Contacto).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const prospectoParaGuardar: Prospecto = {
        id,
        ...formData,
      };
      await onSave(prospectoParaGuardar);
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el prospecto. Intente nuevamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        id="prospecto-form-modal"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 font-display">
              {prospectoInicial ? 'Editar Prospecto' : 'Agregar Nuevo Prospecto'}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {id}</p>
          </div>
          <button
            id="close-prospecto-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div id="prospecto-form-error" className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Empresa */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Empresa <span className="text-red-500">*</span>
              </label>
              <input
                id="input-prospecto-empresa"
                type="text"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                placeholder="Nombre de la Empresa"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                required
              />
            </div>

            {/* Contacto */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Contacto <span className="text-red-500">*</span>
              </label>
              <input
                id="input-prospecto-contacto"
                type="text"
                name="contacto"
                value={formData.contacto}
                onChange={handleChange}
                placeholder="Nombre del Contacto"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                required
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Teléfono
              </label>
              <input
                id="input-prospecto-telefono"
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+56 9 1234 5678"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
            </div>

            {/* Correo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Correo Electrónico
              </label>
              <input
                id="input-prospecto-correo"
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="prospecto@correo.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
            </div>

            {/* Servicio de Interés */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Servicio de interés
              </label>
              <input
                id="input-prospecto-servicio"
                type="text"
                name="servicioInteres"
                value={formData.servicioInteres}
                onChange={handleChange}
                placeholder="Ej. Guardias, CCTV, Alarmas"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
            </div>

            {/* Valor Estimado */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Valor estimado
              </label>
              <input
                id="input-prospecto-valor"
                type="text"
                name="valorEstimado"
                value={formData.valorEstimado}
                onChange={handleChange}
                placeholder="Ej. $1,200,000"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
            </div>

            {/* Último contacto */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Último contacto
              </label>
              <input
                id="input-prospecto-ultimo-contacto"
                type="date"
                name="ultimoContacto"
                value={formData.ultimoContacto}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-700"
              />
            </div>

            {/* Próximo seguimiento */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Próximo seguimiento
              </label>
              <input
                id="input-prospecto-proximo-seguimiento"
                type="date"
                name="proximoSeguimiento"
                value={formData.proximoSeguimiento}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-700"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Estado
              </label>
              <select
                id="input-prospecto-estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-700 bg-white"
              >
                {ESTADOS_DISPONIBLES.map((est) => (
                  <option key={est.value} value={est.value}>
                    {est.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Observaciones
            </label>
            <textarea
              id="input-prospecto-observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Notas, detalles de la reunión, bitácora de llamadas..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3 bg-white">
            <button
              id="cancel-prospecto-btn"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              id="save-prospecto-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/10 transition-all flex items-center justify-center min-w-[120px] disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Guardando...</span>
                </div>
              ) : (
                'Guardar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
