import { prisma } from '../../lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Trash2, MapPin } from 'lucide-react';
import { deleteBooking } from '../actions/booking-actions';
import { auth } from '@/auth';
import { LogoutButton } from '@/components/LogoutButton'; // 👈 Importando o botão de sair

async function getMyBookings() {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  return await prisma.booking.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      room: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  });
}

export default async function MeusAgendamentosPage() {
  const bookings = await getMyBookings();

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header com Logout */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
          <Calendar className="w-6 h-6" />
          <span>ReservaSalas</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-slate-600">
          <Link href="/" className="hover:text-slate-900">Salas</Link>
          <Link href="/meus-agendamentos" className="font-semibold text-slate-900">Meus Agendamentos</Link>
          <LogoutButton /> {/* 👈 Botão de Sair posicionado aqui */}
        </nav>
      </header>

      <main className="max-w-4xl mx-auto pt-8 px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Início
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Meus Agendamentos
            </h1>
            <p className="text-xs font-bold text-blue-600 tracking-wider uppercase mt-1">
              GERENCIE AS SUAS REUNIÕES RESERVADAS
            </p>
          </div>

          <Link
            href="/agendar"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            + Nova Reserva
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white p-12 text-center border border-dashed border-slate-300 rounded-2xl text-slate-400">
            <p className="text-sm font-medium mb-3">Você ainda não possui nenhuma sala reservada.</p>
            <Link
              href="/agendar"
              className="inline-block text-xs font-semibold text-blue-600 hover:underline"
            >
              Fazer o primeiro agendamento →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map((b) => {
              const startDate = new Date(b.startTime);
              const endDate = new Date(b.endTime);

              const dateFormatted = startDate.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });

              const startTimeFormatted = startDate.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              });

              const endTimeFormatted = endDate.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={b.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative group hover:border-blue-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                        <MapPin className="w-3.5 h-3.5" />
                        Sala {b.room.name}
                      </span>

                      <form
                        action={async () => {
                          'use server';
                          await deleteBooking(b.id);
                        }}
                      >
                        <button
                          type="submit"
                          title="Cancelar Agendamento"
                          className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>

                    <p className="text-xs text-slate-500 mb-4 line-clamp-1">
                      {b.room.description || 'Sem descrição'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {dateFormatted}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {startTimeFormatted} - {endTimeFormatted}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}