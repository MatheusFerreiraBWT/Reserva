'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createBooking } from '../app/actions/booking-actions';
import { Clock, CheckCircle2, AlertCircle, Users } from 'lucide-react';

interface Booking {
  id: string;
  startTime: Date;
  endTime: Date;
}

interface Room {
  id: string;
  name: string;
  capacity: number;
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

function BookingFormContent({ rooms }: { rooms: Room[] }) {
  const searchParams = useSearchParams();
  const roomIdFromUrl = searchParams.get('roomId');

  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedRoomId, setSelectedRoomId] = useState(
    roomIdFromUrl && rooms.some((r) => r.id === roomIdFromUrl)
      ? roomIdFromUrl
      : rooms[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState(todayStr);
  
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);

  const [attendees, setAttendees] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  // Checa se o horário já passou hoje
  const isSlotInPast = (slotStart: string) => {
    if (selectedDate !== todayStr) return false;
    const now = new Date();
    const [hours, minutes] = slotStart.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    return slotTime < now;
  };

  // Checa se já está reservado no banco
  const isSlotBooked = (slotStart: string, slotEnd: string) => {
    if (!selectedRoom || !selectedDate) return false;

    const slotStartTime = new Date(`${selectedDate}T${slotStart}:00`);
    const slotEndTime = new Date(`${selectedDate}T${slotEnd}:00`);

    return selectedRoom.bookings.some((b) => {
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      return slotStartTime < bEnd && slotEndTime > bStart;
    });
  };

  // 👈 Lógica definitiva para selecionar Início e Fim em dois cliques
  const handleSlotClick = (slotStart: string, slotEnd: string) => {
    setErrorMsg('');

    // Se não há startTime OU se já temos os dois definidos (recomeça a seleção)
    if (!startTime || (startTime && endTime)) {
      setStartTime(slotStart);
      setEndTime(null);
    } 
    // Se já temos o startTime e estamos escolhendo o endTime
    else if (startTime && !endTime) {
      if (slotStart < startTime) {
        // Se clicar em um horário anterior, ele se torna o novo startTime
        setStartTime(slotStart);
        setEndTime(null);
        return;
      }

      if (slotStart === startTime) {
        // Se clicar no mesmo horário duas vezes, define um bloco único de 1 hora
        setEndTime(slotEnd);
        return;
      }

      // Se clicar em um horário posterior, valida o intervalo completo
      const startIndex = TIME_SLOTS.findIndex((s) => s.start === startTime);
      const endIndex = TIME_SLOTS.findIndex((s) => s.end === slotEnd);

      let hasConflict = false;
      for (let i = startIndex; i <= endIndex; i++) {
        const currentSlot = TIME_SLOTS[i];
        if (isSlotBooked(currentSlot.start, currentSlot.end) || isSlotInPast(currentSlot.start)) {
          hasConflict = true;
          break;
        }
      }

      if (hasConflict) {
        setErrorMsg('O intervalo selecionado contém horários ocupados ou já passados.');
        setStartTime(slotStart);
        setEndTime(null);
        return;
      }

      setEndTime(slotEnd);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) {
      setErrorMsg('Selecione uma sala.');
      return;
    }
    if (!startTime || !endTime) {
      setErrorMsg('Selecione o horário de início e término.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('roomId', selectedRoomId);
    formData.append('date', selectedDate);
    formData.append('startTime', startTime);
    formData.append('endTime', endTime);
    formData.append('attendees', attendees);

    const res = await createBooking(formData);

    setIsLoading(false);
    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="py-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-1">
          Reserva Confirmada!
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Sua reunião para a <strong className="text-slate-800">{selectedRoom?.name}</strong> está garantida.
        </p>

        <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2 mb-6">
          <div className="flex justify-between">
            <span>Sala:</span>
            <strong className="text-slate-800">{selectedRoom?.name}</strong>
          </div>
          <div className="flex justify-between">
            <span>Data:</span>
            <strong className="text-slate-800">{selectedDate.split('-').reverse().join('/')}</strong>
          </div>
          <div className="flex justify-between">
            <span>Horário:</span>
            <strong className="text-slate-800">{startTime} - {endTime}</strong>
          </div>
          {attendees && (
            <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
              <span>Convidados:</span>
              <strong className="text-slate-800 truncate max-w-[180px]" title={attendees}>{attendees}</strong>
            </div>
          )}
        </div>

        <a
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-all shadow-sm"
        >
          Voltar para Início
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Select da Sala */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          SALA
        </label>
        <select
          value={selectedRoomId}
          onChange={(e) => {
            setSelectedRoomId(e.target.value);
            setStartTime(null);
            setEndTime(null);
          }}
          className="w-full text-sm p-3.5 border-2 border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white transition-all"
        >
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              Sala {room.name} — ({room.capacity} pessoas)
            </option>
          ))}
        </select>
      </div>

      {/* Campo de Data */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          DATA
        </label>
        <input
          type="date"
          value={selectedDate}
          min={todayStr}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setStartTime(null);
            setEndTime(null);
          }}
          className="w-full text-sm p-3.5 border-2 border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white transition-all"
        />
      </div>

      {/* Campo de Convidados */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          CONVIDAR PARTICIPANTES (OPCIONAL)
        </label>
        <input
          type="text"
          value={attendees}
          onChange={(e) => setAttendees(e.target.value)}
          placeholder="ex: joao@empresa.com, maria@empresa.com"
          className="w-full text-sm p-3.5 border-2 border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white transition-all"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          Separe múltiplos e-mails por vírgula.
        </p>
      </div>

      {/* Grid de Horários */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
            HORÁRIOS DISPONÍVEIS
          </label>
          {startTime && (
            <button
              type="button"
              onClick={() => { setStartTime(null); setEndTime(null); }}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Limpar seleção
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 mb-3">
          {startTime && !endTime 
            ? '1º Passo OK! Agora clique no horário de término (ou clique no mesmo para 1h).' 
            : startTime && endTime
            ? `Período selecionado: das ${startTime} às ${endTime}`
            : 'Passo 1: Clique no horário inicial da reunião.'}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TIME_SLOTS.map((slot) => {
            const inPast = isSlotInPast(slot.start);
            const booked = isSlotBooked(slot.start, slot.end);
            const disabled = inPast || booked;

            let isInRange = false;
            if (startTime && endTime) {
              isInRange = slot.start >= startTime && slot.end <= endTime;
            } else if (startTime === slot.start) {
              isInRange = true;
            }

            return (
              <button
                key={slot.start}
                type="button"
                disabled={disabled}
                onClick={() => handleSlotClick(slot.start, slot.end)}
                className={`flex items-center justify-between p-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                  disabled
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                    : isInRange
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-500 hover:text-blue-600'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {slot.start} - {slot.end}
                </span>
                {booked && (
                  <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                    Ocupado
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Botão de Envio */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading || !startTime || !endTime}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md disabled:opacity-50"
        >
          {isLoading 
            ? 'Confirmando...' 
            : startTime && endTime 
            ? startTime === endTime 
              ? `Reservar das ${startTime} às ${endTime}` 
              : `Reservar período das ${startTime} às ${endTime}`
            : 'Selecione o horário'}
        </button>
      </div>
    </form>
  );
}

export function BookingForm({ rooms }: { rooms: Room[] }) {
  return (
    <Suspense fallback={<div className="p-4 text-center text-xs text-slate-400">Carregando formulário...</div>}>
      <BookingFormContent rooms={rooms} />
    </Suspense>
  );
}