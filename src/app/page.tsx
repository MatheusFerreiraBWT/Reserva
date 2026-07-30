import { prisma } from '../lib/prisma';
import Link from 'next/link';
import { Calendar, ShieldAlert } from 'lucide-react';
import { RoomCard } from '../components/RoomCard';
import { auth } from '@/auth';
import { LogoutButton } from '@/components/LogoutButton';

async function getHomePageData() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;

  const rooms = await prisma.room.findMany({
    include: {
      bookings: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return { rooms, userRole };
}

export default async function HomePage() {
  const { rooms, userRole } = await getHomePageData();

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12">
      {/* NAVBAR ACIMA DO BANNER COM DEGRADÊ TRANSLÚCIDO E BLUR */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-[#00A859]/90 via-[#384C83]/90 to-[#6B12B4]/90 backdrop-blur-md border-b border-white/20 px-6 md:px-8 py-3.5 flex items-center justify-between text-white shadow-md">
        <div className="flex items-center gap-2 font-bold text-sm md:text-base tracking-tight">
          <span className="text-white drop-shadow-sm">SERRA VERDE EXPRESS</span>
          <span className="text-white/40 font-light">|</span>
          <span className="text-white drop-shadow-sm">BWT OPERADORA</span>
        </div>
        
        <nav className="flex items-center gap-4 md:gap-6 text-sm font-medium">
          <Link href="/" className="text-white font-bold border-b-2 border-white pb-0.5 drop-shadow-sm">
            Salas
          </Link>
          <Link href="/meus-agendamentos" className="hover:text-white/80 transition-colors text-white/90 drop-shadow-sm">
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

      {/* BANNER LOGO ABAIXO DA NAVBAR */}
      <section className="w-full bg-slate-950 overflow-hidden shadow-md">
        <img 
          src="/banner-grupo1.png" 
          alt="Serra Verde Express e BWT Operadora" 
          className="w-full h-auto max-h-[220px] md:max-h-[280px] object-cover block"
        />
      </section>

      {/* Conteúdo Principal (Lista de Salas) */}
      <main className="max-w-6xl mx-auto pt-8 px-8">
        <div className="mb-6 flex justify-between items-end border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00A859]" />
              Salas de Reunião Disponíveis
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecione uma sala abaixo para verificar os horários e confirmar a reserva.
            </p>
          </div>
        </div>

        {/* Grid de Salas */}
        {rooms.length === 0 ? (
          <div className="bg-white p-12 text-center border border-dashed border-slate-300 rounded-2xl text-slate-500 shadow-sm">
            <p className="text-sm font-medium">Nenhuma sala cadastrada no momento.</p>
            {userRole === 'ADMIN' && (
              <p className="text-xs mt-2">
                Acesse o <Link href="/admin" className="text-[#00A859] font-bold underline hover:text-[#D4AF37]">Painel Admin</Link> para cadastrar novos espaços.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <RoomCard 
                key={room.id} 
                room={room} 
                isAdmin={userRole === 'ADMIN'} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}