'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowLeft, Trash2, User } from 'lucide-react';
import { deleteBooking } from '../app/actions/booking-actions';

interface Booking {
  id: string;
  roomId: string;
  startTime: Date | string;
  endTime: Date | string;
  attendees?: string | null;
  room: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface Room {
  id: string;
  name: string;
  capacity: number;
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 08:00 às 18:00

export function AdminCalendar({ bookings, rooms }: { bookings: Booking[]; rooms: Room[] }) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');

  // Filtra as reservas pela sala selecionada
  const filteredBookings = selectedRoomId === 'all'
    ? bookings
    : bookings.filter((b) => b.roomId === selectedRoomId);

  // Salas a serem exibidas na visão diária
  const displayRooms = selectedRoomId === 'all'
    ? rooms
    : rooms.filter((r) => r.id === selectedRoomId);

  // Auxiliares de Navegação do Mês
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    if (selectedDay) setSelectedDay(today);
  };

  // Gerador da Grade do Mês
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Dias do mês anterior
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }

  // Dias do mês atual
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      date: new Date(year, month, d),
      isCurrentMonth: true,
    });
  }

  // Dias do próximo mês para fechar a grade (42 células)
  const remaining = 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    calendarDays.push({
      date: new Date(year, month + 1, d),
      isCurrentMonth: false,
    });
  }

  const monthNames = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-slate-800">
      {/* BARRA SUPERIOR: Filtro de Sala + Botão Mês/Voltar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {selectedDay && (
            <button
              onClick={() => setSelectedDay(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao Mês
            </button>
          )}

          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>FILTRAR:</span>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">🏢 Mostrar Todas as Salas</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Sala {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO DE DATA (Mês ou Dia Específico) */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="flex border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={selectedDay ? () => setSelectedDay(new Date(selectedDay.setDate(selectedDay.getDate() - 1))) : handlePrevMonth}
              className="p-2 bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={selectedDay ? () => setSelectedDay(new Date(selectedDay.setDate(selectedDay.getDate() + 1))) : handleNextMonth}
              className="p-2 bg-slate-800 text-white hover:bg-slate-700 border-l border-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition-colors"
          >
            Hoje
          </button>
        </div>

        <h2 className="text-xl font-bold text-slate-800 capitalize">
          {selectedDay
            ? selectedDay.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
            : `${monthNames[month]} de ${year}`}
        </h2>
      </div>

      {/* --- VISÃO 1: CALENDÁRIO MENSAL --- */}
      {!selectedDay ? (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          {/* Dias da semana */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center font-bold text-xs text-slate-500 py-2.5">
            <div>dom.</div>
            <div>seg.</div>
            <div>ter.</div>
            <div>qua.</div>
            <div>qui.</div>
            <div>sex.</div>
            <div>sáb.</div>
          </div>

          {/* Células dos dias */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 text-xs">
            {calendarDays.map((item, index) => {
              const dayBookings = filteredBookings.filter((b) => {
                const bDate = new Date(b.startTime);
                return (
                  bDate.getDate() === item.date.getDate() &&
                  bDate.getMonth() === item.date.getMonth() &&
                  bDate.getFullYear() === item.date.getFullYear()
                );
              });

              const isToday =
                item.date.getDate() === new Date().getDate() &&
                item.date.getMonth() === new Date().getMonth() &&
                item.date.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDay(item.date)}
                  className={`min-h-[90px] p-2 cursor-pointer transition-colors hover:bg-blue-50/50 flex flex-col justify-between ${
                    !item.isCurrentMonth ? 'bg-slate-50/50 text-slate-300' : 'text-slate-700'
                  } ${isToday ? 'bg-amber-50/60 font-bold' : ''}`}
                >
                  <div className="text-right font-medium text-xs">{item.date.getDate()}</div>

                  {/* Indicadores de Reservas no dia */}
                  <div className="space-y-1">
                    {dayBookings.slice(0, 2).map((b) => (
                      <div
                        key={b.id}
                        className="bg-blue-100 text-blue-800 text-[10px] font-bold p-1 rounded truncate flex flex-col"
                      >
                        <span>Sala {b.room.name}</span>
                        <span className="text-[9px] text-blue-600 font-medium truncate">
                          👤 {b.user?.name || 'Não identificado'}
                        </span>
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className="text-[10px] font-bold text-slate-400 text-center">
                        +{dayBookings.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* --- VISÃO 2: AGENDA DIÁRIA EM COLUNAS POR SALA --- */
        <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse relative">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <th className="p-3 w-16 border-r border-slate-200 text-center font-bold text-slate-400 bg-slate-50">
                  Horário
                </th>
                {displayRooms.map((room) => (
                  <th key={room.id} className="p-3 text-center font-bold text-slate-800 border-r border-slate-200 bg-slate-50">
                    Sala {room.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {HOURS.map((hour) => {
                const hourStr = hour.toString().padStart(2, '0');

                return (
                  <tr key={hour} className="h-16">
                    <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-400 bg-slate-50/30">
                      {hourStr}:00
                    </td>

                    {displayRooms.map((room) => {
                      // 1. Procura se existe uma reserva que COMEÇA exatamente nesta hora nesta sala
                      const startingBooking = filteredBookings.find((b) => {
                        const bStart = new Date(b.startTime);
                        const isSameDay =
                          bStart.getDate() === selectedDay?.getDate() &&
                          bStart.getMonth() === selectedDay?.getMonth() &&
                          bStart.getFullYear() === selectedDay?.getFullYear();

                        return isSameDay && b.roomId === room.id && bStart.getHours() === hour;
                      });

                      // 2. Verifica se esta hora está no MEIO de uma reserva já iniciada anteriormente
                      const isInsideOngoingBooking = filteredBookings.some((b) => {
                        const bStart = new Date(b.startTime);
                        const bEnd = new Date(b.endTime);
                        const isSameDay =
                          bStart.getDate() === selectedDay?.getDate() &&
                          bStart.getMonth() === selectedDay?.getMonth() &&
                          bStart.getFullYear() === selectedDay?.getFullYear();

                        if (!isSameDay || b.roomId !== room.id) return false;

                        const slotMinutes = hour * 60;
                        const startMinutes = bStart.getHours() * 60 + bStart.getMinutes();
                        const endMinutes = bEnd.getHours() * 60 + bEnd.getMinutes();

                        return slotMinutes > startMinutes && slotMinutes < endMinutes;
                      });

                      if (isInsideOngoingBooking) {
                        return null; // Oculta as células intermediárias para o card principal esticar por cima
                      }

                      // Calcula o rowSpan com base na duração em horas
                      let rowSpan = 1;
                      if (startingBooking) {
                        const bStart = new Date(startingBooking.startTime);
                        const bEnd = new Date(startingBooking.endTime);
                        const durationHours = Math.ceil((bEnd.getTime() - bStart.getTime()) / (1000 * 60 * 60));
                        rowSpan = Math.max(1, durationHours);
                      }

                      return (
                        <td
                          key={room.id}
                          rowSpan={rowSpan}
                          className="p-1 border-r border-slate-200 relative align-top bg-white"
                        >
                          {startingBooking && (
                            <div className="bg-blue-600 text-white p-3 rounded-xl text-[11px] shadow-sm flex items-start justify-between gap-2 h-full absolute inset-1 z-10 overflow-hidden">
                              <div className="overflow-hidden space-y-1">
                                <div className="flex items-center gap-1 font-bold text-white truncate">
                                  <User className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                                  <span className="truncate">
                                    {startingBooking.user?.name || 'Sem nome registrado'}
                                  </span>
                                </div>

                                {startingBooking.user?.email && (
                                  <p className="text-[10px] text-blue-200 truncate">
                                    {startingBooking.user.email}
                                  </p>
                                )}

                                <div className="text-[10px] text-blue-100 font-medium pt-1">
                                  {new Date(startingBooking.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} 
                                  {' - '}
                                  {new Date(startingBooking.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </div>

                                {startingBooking.attendees && (
                                  <p className="text-[10px] text-blue-100 truncate">
                                    Convidados: {startingBooking.attendees}
                                  </p>
                                )}
                              </div>

                              <form
                                action={async () => {
                                  await deleteBooking(startingBooking.id);
                                }}
                                className="shrink-0"
                              >
                                <button
                                  type="submit"
                                  title="Cancelar Reserva"
                                  className="text-white/80 hover:text-white p-1 hover:bg-blue-700 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </form>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}