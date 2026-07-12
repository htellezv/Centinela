import React, { useState } from 'react';
import { Calendar, Video, Clock, X, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail: string;
  clientName: string;
  accessToken: string | null;
  onSuccess: (msg: string) => void;
}

export default function ScheduleMeetingModal({
  isOpen,
  onClose,
  initialEmail,
  clientName,
  accessToken,
  onSuccess
}: ScheduleMeetingModalProps) {
  const [summary, setSummary] = useState(`Reunión de seguimiento - ${clientName}`);
  const [description, setDescription] = useState(`Reunión para alinear condiciones del servicio y próximos pasos.`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [isVirtual, setIsVirtual] = useState(true);
  const [attendeesInput, setAttendeesInput] = useState(initialEmail || '');
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success result state
  const [meetingResult, setMeetingResult] = useState<{
    htmlLink: string;
    hangoutLink?: string;
  } | null>(null);
  const [copiedMeet, setCopiedMeet] = useState(false);

  if (!isOpen) return null;

  const handleCopyMeet = () => {
    if (meetingResult?.hangoutLink) {
      navigator.clipboard.writeText(meetingResult.hangoutLink);
      setCopiedMeet(true);
      setTimeout(() => setCopiedMeet(false), 2000);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      setError('No hay sesión activa de Google OAuth. Por favor, vuelve a iniciar sesión.');
      return;
    }

    setIsScheduling(true);
    setError(null);

    try {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota';
      
      // Parse attendees
      const attendees = attendeesInput
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0)
        .map(email => ({ email }));

      // Format ISO dates (Calendar API expects format: YYYY-MM-DDTHH:MM:SS)
      const startDateTime = `${date}T${startTime}:00`;
      const endDateTime = `${date}T${endTime}:00`;

      const eventBody: any = {
        summary,
        description,
        start: {
          dateTime: startDateTime,
          timeZone: userTimeZone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: userTimeZone,
        },
        attendees,
      };

      if (isVirtual) {
        eventBody.conferenceData = {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        };
      }

      const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
      if (isVirtual) {
        url.searchParams.set('conferenceDataVersion', '1');
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventBody),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Error del servidor de Calendar: ${response.statusText}`);
      }

      const data = await response.json();
      setMeetingResult({
        htmlLink: data.htmlLink,
        hangoutLink: data.hangoutLink,
      });

      onSuccess(`Reunión "${summary}" programada con éxito en Google Calendar.`);
    } catch (err: any) {
      console.error('Error scheduling meeting:', err);
      setError(err?.message || 'Error al programar la reunión. Por favor, intente de nuevo.');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        id="schedule-meeting-dialog"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Calendar size={20} />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800 font-display">
                Programar Reunión
              </h4>
              <p className="text-xs text-slate-500 font-sans mt-0.5">
                Google Calendar & Google Meet
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

        {/* If Meeting was created, show Success view */}
        {meetingResult ? (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Check size={28} />
              </div>
              <h4 className="text-lg font-bold text-slate-800 font-display">
                ¡Reunión Programada con Éxito!
              </h4>
              <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
                El evento se ha agregado a tu calendario y se han enviado las invitaciones a los asistentes.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título del evento</span>
                <span className="text-sm font-semibold text-slate-700 block">{summary}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fecha</span>
                  <span className="text-xs font-mono font-medium text-slate-600 block">{date}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Horario</span>
                  <span className="text-xs font-mono font-medium text-slate-600 block">{startTime} - {endTime}</span>
                </div>
              </div>

              {meetingResult.hangoutLink && (
                <div className="pt-3 border-t border-slate-200/60 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                    <Video size={12} /> Link de Google Meet
                  </span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={meetingResult.hangoutLink}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-600 focus:outline-none"
                    />
                    <button
                      onClick={handleCopyMeet}
                      className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-lg transition-colors flex items-center justify-center"
                      title="Copiar link"
                    >
                      {copiedMeet ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all"
              >
                Cerrar
              </button>
              <a
                href={meetingResult.htmlLink}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/10"
              >
                <ExternalLink size={14} />
                Ver en Calendar
              </a>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSchedule} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-100 flex items-start space-x-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* Título de la reunión */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Título de la Reunión
                </label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Ej. Coordinación del servicio"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Descripción / Agenda
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Temas a tratar en la reunión..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                />
              </div>

              {/* Asistentes */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Invitados (Emails separados por coma)
                </label>
                <input
                  type="text"
                  value={attendeesInput}
                  onChange={(e) => setAttendeesInput(e.target.value)}
                  placeholder="invitado1@ejemplo.com, invitado2@ejemplo.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                />
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-slate-700 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-slate-700 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-slate-700 bg-white"
                    required
                  />
                </div>
              </div>

              {/* Tipo de reunión / Google Meet */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                    <Video size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block">Videollamada de Google Meet</span>
                    <span className="text-[10px] text-slate-400 block">Genera un enlace virtual automáticamente</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVirtual}
                    onChange={(e) => setIsVirtual(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3 bg-white">
              <button
                type="button"
                onClick={onClose}
                disabled={isScheduling}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isScheduling}
                className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/10 transition-all flex items-center justify-center min-w-[150px] disabled:opacity-50"
              >
                {isScheduling ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Programando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <Clock size={15} />
                    <span>Agendar Reunión</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
