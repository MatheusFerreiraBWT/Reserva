import { prisma } from '../../lib/prisma';
import Link from 'next/link';
import { ArrowLeft, DoorOpen } from 'lucide-react';
import { deleteRoom } from '../actions/room-actions';
import { CreateRoomModal } from '../../components/CreateRoomModal';
import { EditRoomModal } from '../../components/EditRoomModal';
import { AdminCalendar } from '../../components/AdminCalendar';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';

async function getAdminData() {
  const rawBookings = await prisma.booking.findMany({
    select: {
      id: true,
      roomId: true,
      userId: true,
      startTime: true,
      endTime: true,
      attendees: true,
      room: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { startTime: 'asc' },
  });

  const rooms = await prisma.room.findMany({
    include: { _count: { select: { bookings: true } } },
    orderBy: { name: 'asc' },
  });

  const bookings = rawBookings.map((b) => ({
    ...b,
    user: b.user
      ? {
          id: b.user.id,
          name: b.user.name || 'Usuário Sem Nome',
          email: b.user.email,
        }
      : null,
  }));

  return { bookings, rooms };
}

export default async function AdminPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  const { bookings, rooms } = await getAdminData();

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12 overflow-x-hidden">
      {/* NAVBAR RESPONSIVA PADRONIZADA COM MENU HAMBÚRGUER */}
      <Navbar userRole={userRole} />

      <main className="max-w-6xl mx-auto pt-6 sm:pt-8 px-4 sm:px-6 space-y-6 sm:space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00A859] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Início
        </Link>

        {/* Topo do Painel Adaptado para Mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Gestão do Sistema
            </h1>
            <p className="text-[10px] sm:text-xs font-bold text-[#00A859] tracking-wider uppercase mt-0.5">
              AGENDA & ESTRUTURA DE SALAS
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <CreateRoomModal />
          </div>
        </div>

        {/* SEÇÃO 1: GERENCIAMENTO DE SALAS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs sm:text-sm">
              <DoorOpen className="w-4 h-4 text-[#00A859]" />
              <span>Salas Cadastradas</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">{rooms.length} sala(s)</span>
          </div>

          {rooms.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Nenhuma sala cadastrada. Clique em "Nova Sala" acima.
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs text-slate-600 min-w-[600px]">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-3 sm:p-4">Nome</th>
                    <th className="p-3 sm:p-4">Descrição / Local</th>
                    <th className="p-3 sm:p-4">Capacidade</th>
                    <th className="p-3 sm:p-4">Reservas Ativas</th>
                    <th className="p-3 sm:p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-slate-900 whitespace-nowrap">
                        {room.name.toLowerCase().startsWith('sala') ? room.name : `Sala ${room.name}`}
                      </td>
                      <td className="p-3 sm:p-4 text-slate-500">
                        {room.description || 'Sem descrição'}
                      </td>
                      <td className="p-3 sm:p-4 font-bold text-slate-700 whitespace-nowrap">
                        {room.capacity} pessoas
                      </td>
                      <td className="p-3 sm:p-4 font-medium text-slate-600 whitespace-nowrap">
                        {room._count.bookings} reserva(s)
                      </td>
                      <td className="p-3 sm:p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <EditRoomModal room={room} />
                          <form
                            action={async () => {
                              'use server';
                              await deleteRoom(room.id);
                            }}
                          >
                            <button
                              type="submit"
                              title="Excluir Sala"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <span className="text-xs font-bold text-red-500 px-1">Excluir</span>
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SEÇÃO 2: CALENDÁRIO / AGENDA INTERATIVA */}
        <div className="overflow-x-auto">
          <AdminCalendar bookings={bookings} rooms={rooms} />
        </div>

      </main>
    </div>
  );
}