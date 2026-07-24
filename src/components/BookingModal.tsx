'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createBooking } from '../app/actions/booking-actions';
import { Calendar, X, Clock, CheckCircle2 } from 'lucide-react';

interface Booking {
  id: string;
  startTime: Date;
  endTime: Date;
}

interface BookingModalProps {
  roomId: string;
  roomName: string;
  bookings: Booking[];
}

const TIME_SLOTS = [
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '12:00', end: '13:00' },
  { start: '13:00', end: '14:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:00', end: '17:00' },
  { start: '17:00', end: '18:00' },
];

export function BookingModal({ roomId, roomName, bookings }: BookingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setMounted(true);
    setSelectedDate(todayStr);
  }, [todayStr]);

  // Checa se o horário já passou no dia de hoje
  const isSlotInPast = (slotStart: string) => {
    if (selectedDate !== todayStr) return false;

    const now = new Date();
    const [hours, minutes] = slotStart.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);

    return slotTime < now;
  };

  // Checa se o horário já está reservado no banco
  const isSlotBooked = (slotStart: string, slotEnd: string) => {
    if (!selectedDate) return false;

    const slotStartTime = new Date(`${selectedDate}T${slotStart}:00`);
    const slotEndTime = new Date(`${selectedDate}T${slotEnd}:00`);

    return bookings.some((b) => {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);

      // Colisão de horários
      return slotStartTime < bEnd && slotEndTime > bStart;
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setErrorMsg('');
    setSelectedSlot(null);
    setIsSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMsg('Por favor, selecione um horário.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('roomId', roomId);
    formData.append('date', selectedDate);
    formData.append('startTime', selectedSlot.start);
    formData.append('endTime', selectedSlot.end);

    const res = await createBooking(formData);

    setIsLoading(false);
    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setIsSuccess(true);
    }
  };

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-1">
              Reserva Confirmada!
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mb-6">
              Sua reserva para a <strong className="text-slate-700">{roomName}</strong> foi realizada com sucesso.
            </p>

            <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1.5 mb-6">
              <div className="flex justify-between">
                <span>Data:</span>
                <strong className="text-slate-800">{selectedDate.split('-').reverse().join('/')}</strong>
              </div>
              <div className="flex justify-between">
                <span>Horário:</span>
                <strong className="text-slate-800">{selectedSlot?.start} - {selectedSlot?.end}</strong>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs py-2.5 rounded-lg transition-all shadow-sm"
            >
              Concluir
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Agendar Sala: {roomName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Escolha o dia e selecione um bloco de 1 hora.
            </p>

            {errorMsg && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-200 mb-3">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Data da Reserva
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={todayStr}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                  required
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">
                  Horários Disponíveis (1 Hora)
                </label>

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {TIME_SLOTS.map((slot) => {
                    const inPast = isSlotInPast(slot.start);
                    const booked = isSlotBooked(slot.start, slot.end);
                    const disabled = inPast || booked;

                    const isSelected =
                      selectedSlot?.start === slot.start && selectedSlot?.end === slot.end;

                    return (
                      <button
                        key={slot.start}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSelectedSlot(slot)}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs font-medium transition-all ${
                          disabled
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-blue-500 hover:text-blue-600'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {slot.start} - {slot.end}
                        </span>
                        {booked && (
                          <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                            Ocupado
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !selectedSlot}
                  className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isLoading ? 'Reservando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full mt-3 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        <Calendar className="w-3.5 h-3.5" />
        Reservar Sala
      </button>

      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}