import { prisma } from '../../lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/auth';
import { BookingCard } from '@/components/BookingCard';
import { Navbar } from '@/components/Navbar';

async function getMyBookingsData() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;

  if (!session?.user?.id) {
    return { bookings: [], userRole };
  }

  const bookings = await prisma.booking.findMany({
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

  return { bookings, userRole };
}

export default async function MeusAgendamentosPage() {
  const { bookings, userRole } = await getMyBookingsData();

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12 overflow-x-hidden">
      {/* NAVBAR RESPONSIVA COM MENU HAMBÚRGUER */}
      <Navbar userRole={userRole} />

      <main className="max-w-4xl mx-auto pt-6 sm:pt-8 px-4 sm:px-6">
        {/* Botão Voltar */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00A859] mb-4 sm:mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Início
        </Link>

        {/* Título da Página e Botão de Nova Reserva Adaptados para Mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Meus Agendamentos
            </h1>
            <p className="text-[10px] sm:text-xs font-bold text-[#00A859] tracking-wider uppercase mt-0.5">
              GERENCIE AS SUAS REUNIÕES RESERVADAS
            </p>
          </div>

          <Link
            href="/agendar"
            className="bg-[#00A859] hover:bg-[#008f4c] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all text-center w-full sm:w-auto shrink-0"
          >
            + Nova Reserva
          </Link>
        </div>

        {/* Lista de Reservas */}
        {bookings.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 text-center border border-dashed border-slate-300 rounded-2xl text-slate-500 shadow-sm">
            <p className="text-sm font-medium mb-3">Você ainda não possui nenhuma sala reservada.</p>
            <Link
              href="/agendar"
              className="inline-block text-xs font-bold text-[#00A859] hover:underline"
            >
              Fazer o primeiro agendamento →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}