import React, { useState } from 'react';
import { Mail, Send, X, AlertCircle } from 'lucide-react';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTo: string;
  clientName: string;
  accessToken: string | null;
  onSuccess: (msg: string) => void;
}

export default function SendEmailModal({
  isOpen,
  onClose,
  initialTo,
  clientName,
  accessToken,
  onSuccess
}: SendEmailModalProps) {
  const [to, setTo] = useState(initialTo || '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(`Contacto - ${clientName}`);
  const [body, setBody] = useState(`Hola ${clientName},\n\nEspero que te encuentres muy bien.\n\nSaludos cordiales.`);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      setError('No hay sesión activa de Google OAuth. Por favor, vuelve a iniciar sesión.');
      return;
    }
    if (!to.trim()) {
      setError('El correo del destinatario es obligatorio.');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      // Build RFC 822 formatted email
      const emailLines = [];
      emailLines.push(`To: ${to.trim()}`);
      if (cc.trim()) emailLines.push(`Cc: ${cc.trim()}`);
      if (bcc.trim()) emailLines.push(`Bcc: ${bcc.trim()}`);
      emailLines.push(`Subject: ${subject}`);
      emailLines.push('Content-Type: text/plain; charset=utf-8');
      emailLines.push('MIME-Version: 1.0');
      emailLines.push('');
      emailLines.push(body);

      const emailContent = emailLines.join('\r\n');
      
      // Base64URL safe encoding
      const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch('https://gmail.googleapis.com/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: encodedEmail
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Error del servidor de Gmail: ${response.statusText}`);
      }

      onSuccess(`Correo enviado exitosamente a ${to}`);
      onClose();
    } catch (err: any) {
      console.error('Error sending email:', err);
      setError(err?.message || 'Error al enviar el correo. Por favor, intente de nuevo.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        id="send-email-dialog"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Mail size={20} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800 font-display">
                Enviar Correo Electrónico
              </h4>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Para: {clientName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-100 flex items-start space-x-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            {/* Destinatario */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Destinatario (Para)
              </label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                required
              />
            </div>

            {/* CC y CCO */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Con Copia (Cc)
                </label>
                <input
                  type="text"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="copia@ejemplo.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Copia Oculta (Cco / Bcc)
                </label>
                <input
                  type="text"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="oculta@ejemplo.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* Asunto */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Asunto
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Escribe el asunto del correo"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                required
              />
            </div>

            {/* Contenido */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Contenido del Correo
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                placeholder="Escribe tu mensaje aquí..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3 bg-white">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/10 transition-all flex items-center justify-center min-w-[120px] disabled:opacity-50"
            >
              {isSending ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Enviando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5">
                  <Send size={15} />
                  <span>Enviar Correo</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
