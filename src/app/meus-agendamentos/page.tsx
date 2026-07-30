import { prisma } from '../../lib/prisma';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { auth } from '@/auth';
import { LogoutButton } from '@/components/LogoutButton';
import { BookingCard } from '@/components/BookingCard';

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
    <div className="min-h-screen bg-slate-100 font-sans pb-12">
      {/* Header Corporativo em Degradê Translúcido com Blur */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-[#00A859]/90 via-[#384C83]/90 to-[#6B12B4]/90 backdrop-blur-md border-b border-white/20 px-6 md:px-8 py-3.5 flex items-center justify-between text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-sm md:text-base tracking-tight">
            <span className="text-white drop-shadow-sm">SERRA VERDE EXPRESS</span>
            <span className="text-white/40 font-light">|</span>
            <span className="text-white drop-shadow-sm">BWT OPERADORA</span>
          </div>
        </div>
        
        <nav className="flex items-center gap-4 md:gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-white/80 transition-colors text-white/90 drop-shadow-sm">
            Salas
          </Link>
          <Link href="/meus-agendamentos" className="text-white font-bold border-b-2 border-white pb-0.5 drop-shadow-sm">
            Meus Agendamentos
          </Link>

          {userRole === 'ADMIN' && (
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-1.5 bg-[#D4AF37] text-slate-950 px-3 py-1 rounded-full text-xs font-bold hover:bg-yellow-400 transition-colors shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Painel Admin</span>
            </Link>
          )}

          <div className="border-l border-white/20 pl-4 flex items-center">
            <LogoutButton />
          </div>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto pt-8 px-4">
        {/* Botão Voltar */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00A859] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Início
        </Link>

        {/* Título da Página e Botão de Nova Reserva */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Meus Agendamentos
            </h1>
            <p className="text-xs font-bold text-[#00A859] tracking-wider uppercase mt-1">
              GERENCIE AS SUAS REUNIÕES RESERVADAS
            </p>
          </div>

          <Link
            href="/agendar"
            className="bg-[#00A859] hover:bg-[#008f4c] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            + Nova Reserva
          </Link>
        </div>

        {/* Lista de Reservas */}
        {bookings.length === 0 ? (
          <div className="bg-white p-12 text-center border border-dashed border-slate-300 rounded-2xl text-slate-500 shadow-sm">
            <p className="text-sm font-medium mb-3">Você ainda não possui nenhuma sala reservada.</p>
            <Link
              href="/agendar"
              className="inline-block text-xs font-bold text-[#00A859] hover:underline"
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