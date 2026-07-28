'use client';

import { useState, useTransition } from 'react';
import { MapPin, Calendar, Clock, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { deleteBooking } from '@/app/actions/booking-actions';

interface BookingCardProps {
  booking: {
    id: string;
    startTime: Date;
    endTime: Date;
    room: {
      name: string;
      description?: string | null;
    };
  };
}

export function BookingCard({ booking }: BookingCardProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);

  const dateFormatted = startDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const startTimeFormatted = startDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });

  const endTimeFormatted = endDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });

  const handleCancelBooking = () => {
    startTransition(async () => {
      await deleteBooking(booking.id);
      setShowConfirmModal(false);
    });
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative group hover:border-slate-300 transition-all">
        <div>
          {/* Header do Card */}
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              <MapPin className="w-3.5 h-3.5" />
              Sala {booking.room.name}
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-4 line-clamp-1">
            {booking.room.description || 'Sem descrição'}
          </p>

          {/* Data e Horário */}
          <div className="flex items-center justify-between py-3 border-t border-slate-100 text-xs text-slate-700">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {dateFormatted}
            </span>
            <span className="flex items-center gap-1.5 font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {startTimeFormatted} - {endTimeFormatted}
            </span>
          </div>
        </div>

        {/* Botão Visível "Cancelar Reserva" */}
        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 py-2.5 px-3 rounded-xl transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Cancelar Reserva
          </button>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center flex flex-col items-center">
            
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Cancelar Agendamento
            </h3>
            
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Tem certeza que deseja cancelar a reserva para a <strong className="text-slate-700">"Sala {booking.room.name}"</strong> no dia <strong className="text-slate-700">{dateFormatted}</strong> às <strong className="text-slate-700">{startTimeFormatted}</strong>?
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
              >
                Voltar
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={handleCancelBooking}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  'Sim, cancelar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}