import { prisma } from '../../lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
import { auth } from '@/auth';
import { LogoutButton } from '@/components/LogoutButton';
import { BookingCard } from '@/components/BookingCard';

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
          <LogoutButton />
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
            {bookings.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}