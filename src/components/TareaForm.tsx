import React, { useState, useEffect } from 'react';
import { Tarea } from '../types';
import { X } from 'lucide-react';

interface TareaFormProps {
  tareaInicial?: Tarea | null;
  onClose: () => void;
  onSave: (tarea: Tarea) => Promise<void>;
  siguienteId: string;
}

const PRIORIDADES_TAREA = ['Alta', 'Media', 'Baja'];
const ESTADOS_TAREA = ['Pendiente', 'En Proceso', 'Completada'];

export default function TareaForm({
  tareaInicial,
  onClose,
  onSave,
  siguienteId,
}: TareaFormProps) {
  const [formData, setFormData] = useState<Omit<Tarea, 'id'>>({
    titulo: '',
    descripcion: '',
    prioridad: 'Media',
    fecha: '',
    estado: 'Pendiente',
    fechaFinalizacion: '',
    horaFinalizacion: '',
  });

  const [id, setId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tareaInicial) {
      setId(tareaInicial.id);
      setFormData({
        titulo: tareaInicial.titulo || '',
        descripcion: tareaInicial.descripcion || '',
        prioridad: tareaInicial.prioridad || 'Media',
        fecha: tareaInicial.fecha || '',
        estado: tareaInicial.estado || 'Pendiente',
        fechaFinalizacion: tareaInicial.fechaFinalizacion || '',
        horaFinalizacion: tareaInicial.horaFinalizacion || '',
      });
    } else {
      setId(siguienteId);
      const todayStr = new Date().toISOString().split('T')[0];
      setFormData({
        titulo: '',
        descripcion: '',
        prioridad: 'Media',
        fecha: todayStr,
        estado: 'Pendiente',
        fechaFinalizacion: '',
        horaFinalizacion: '',
      });
    }
  }, [tareaInicial, siguienteId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // Automate Fecha Finalización & Hora Finalización when marked as Completada
      if (name === 'estado') {
        if (value === 'Completada') {
          const now = new Date();
          const localDate = now.toISOString().split('T')[0];
          const localTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
          updated.fechaFinalizacion = localDate;
          updated.horaFinalizacion = localTime;
        } else {
          updated.fechaFinalizacion = '';
          updated.horaFinalizacion = '';
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.fecha) {
      setError('Por favor complete todos los campos obligatorios (Título y Fecha).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const tareaParaGuardar: Tarea = {
        id,
        ...formData,
      };
      await onSave(tareaParaGuardar);
    } catch (err: any) {
      setError(err?.message || 'Error al guardar la tarea. Intente nuevamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        id="tarea-form-modal"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 font-display">
              {tareaInicial ? 'Editar Registro de Tarea' : 'Crear Nueva Tarea'}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">ID Tarea: {id}</p>
          </div>
          <button
            id="close-tarea-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div id="tarea-form-error" className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Título */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                id="input-tarea-titulo"
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Título de la tarea"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                required
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Descripción
              </label>
              <textarea
                id="input-tarea-descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Detalles sobre lo que se debe hacer..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm resize-none"
              />
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Prioridad <span className="text-red-500">*</span>
              </label>
              <select
                id="input-tarea-prioridad"
                name="prioridad"
                value={formData.prioridad}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
                required
              >
                {PRIORIDADES_TAREA.map((prio) => (
                  <option key={prio} value={prio}>
                    {prio}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fecha de Vencimiento / Asignación <span className="text-red-500">*</span>
              </label>
              <input
                id="input-tarea-fecha"
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                required
              />
            </div>

            {/* Estado */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                id="input-tarea-estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
                required
              >
                {ESTADOS_TAREA.map((est) => (
                  <option key={est} value={est}>
                    {est}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha Finalización */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Fecha Finalización
              </label>
              <input
                id="input-tarea-fecha-finalizacion"
                type="date"
                name="fechaFinalizacion"
                value={formData.fechaFinalizacion}
                onChange={handleChange}
                disabled={formData.estado !== 'Completada'}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50 text-slate-500 disabled:opacity-75"
              />
            </div>

            {/* Hora Finalización */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Hora Finalización
              </label>
              <input
                id="input-tarea-hora-finalizacion"
                type="text"
                name="horaFinalizacion"
                value={formData.horaFinalizacion}
                onChange={handleChange}
                disabled={formData.estado !== 'Completada'}
                placeholder="HH:MM"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-slate-50 text-slate-500 disabled:opacity-75 font-mono"
              />
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              id="cancel-tarea-form-btn"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              id="save-tarea-form-btn"
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
              ) : tareaInicial ? (
                'Actualizar Tarea'
              ) : (
                'Crear Tarea'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
