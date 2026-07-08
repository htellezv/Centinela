import React, { useState } from 'react';
import { Renovacion } from '../types';
import { X, Copy, Mail, MessageCircle, Check } from 'lucide-react';

interface ReminderModalProps {
  renovacion: Renovacion;
  onClose: () => void;
}

export default function ReminderModal({ renovacion, onClose }: ReminderModalProps) {
  const [copied, setCopied] = useState(false);
  
  // Format currency
  const valorFormatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(Number(renovacion.valor) || 0);

  // Default reminder template
  const defaultText = `Estimado(a) representante de ${renovacion.cliente},\n\nLe saludamos cordialmente. Queremos recordarle que la renovación de su servicio "${renovacion.servicio}" se encuentra programada para el próximo ${renovacion.fechaRenovacion}.\n\nEl valor correspondiente es de ${valorFormatted}.\n\nAgradecemos su preferencia y quedamos a su disposición para cualquier duda o consulta sobre el proceso.\n\nAtentamente,\nSoporte al Cliente`;

  const [messageText, setMessageText] = useState(defaultText);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const encodedText = encodeURIComponent(messageText);
    const url = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Recordatorio de Renovación: ${renovacion.servicio}`);
    const body = encodeURIComponent(messageText);
    const url = `mailto:?subject=${subject}&body=${body}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        id="reminder-modal"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-display">
              Enviar Recordatorio de Renovación
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Cliente: {renovacion.cliente}</p>
          </div>
          <button
            id="close-reminder-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          <p className="text-sm text-slate-500">
            Personaliza el mensaje antes de enviarlo. Puedes copiar el texto o enviarlo directamente a través de WhatsApp o Correo electrónico.
          </p>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Contenido del Mensaje
            </label>
            <textarea
              id="reminder-message-textarea"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Copy button */}
            <button
              id="copy-reminder-btn"
              onClick={handleCopy}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-all"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-emerald-600" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copiar Mensaje</span>
                </>
              )}
            </button>

            {/* WhatsApp button */}
            <button
              id="send-whatsapp-reminder-btn"
              onClick={handleSendWhatsApp}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-medium text-sm transition-all border border-emerald-100"
            >
              <MessageCircle size={16} className="text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            {/* Email button */}
            <button
              id="send-email-reminder-btn"
              onClick={handleSendEmail}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-medium text-sm transition-all border border-indigo-100"
            >
              <Mail size={16} className="text-indigo-600" />
              <span>Enviar por Email</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            id="close-reminder-modal-footer-btn"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-xl transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
