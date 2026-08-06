import { prisma } from '../lib/prisma';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { RoomCard } from '../components/RoomCard';
import { auth } from '@/auth';
import { Navbar } from '../components/Navbar';

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
    <div className="min-h-screen bg-slate-100 font-sans pb-12 overflow-x-hidden">
      {/* NAVBAR RESPONSIVA */}
      <Navbar userRole={userRole} />

      {/* BANNER */}
      <section className="w-full bg-slate-950 overflow-hidden shadow-md">
        <img 
          src="/banner-grupo1.png" 
          alt="Serra Verde Express e BWT Operadora" 
          className="w-full h-auto max-h-[160px] md:max-h-[280px] object-cover block"
        />
      </section>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto pt-6 sm:pt-8 px-4 sm:px-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 pb-4 gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
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
          <div className="bg-white p-8 sm:p-12 text-center border border-dashed border-slate-300 rounded-2xl text-slate-500 shadow-sm">
            <p className="text-sm font-medium">Nenhuma sala cadastrada no momento.</p>
            {userRole === 'ADMIN' && (
              <p className="text-xs mt-2">
                Acesse o <Link href="/admin" className="text-[#00A859] font-bold underline hover:text-[#D4AF37]">Painel Admin</Link> para cadastrar novos espaços.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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