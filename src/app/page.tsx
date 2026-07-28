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
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header Superior Limpo */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
          <Calendar className="w-6 h-6" />
          <span>ReservaSalas</span>
        </div>
        
        <nav className="flex items-center gap-6 text-sm text-slate-600">
          <Link href="/" className="font-bold text-slate-900">
            Salas
          </Link>
          <Link href="/meus-agendamentos" className="hover:text-slate-900 font-medium">
            Meus Agendamentos
          </Link>

          {/* 👈 Se o usuário for ADMIN, mostra o atalho para o Painel */}
          {userRole === 'ADMIN' && (
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-1 text-amber-600 font-bold hover:text-amber-700"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Painel Admin</span>
            </Link>
          )}

          {/* 👈 Botão de Sair da conta */}
          <LogoutButton />
        </nav>
      </header>

      {/* Banner Azul Full Width */}
      <section className="bg-blue-600 text-white py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Agende sua sala de reunião em segundos
          </h1>
          <p className="text-sm text-blue-100 font-normal">
            Escolha uma sala, selecione o horário e confirme. Sem conflitos, sem retrabalho.
          </p>
        </div>
      </section>

      {/* Conteúdo Principal (Lista de Salas) */}
      <main className="max-w-6xl mx-auto pt-8 px-8">
        <div className="mb-6">
          <h2 className="text-base font-bold text-slate-900">
            Nossas salas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Selecione uma sala para ver a disponibilidade.
          </p>
        </div>

        {/* Grid de Salas */}
        {rooms.length === 0 ? (
          <div className="bg-white p-12 text-center border border-dashed border-slate-300 rounded-2xl text-slate-400">
            <p className="text-sm font-medium">Nenhuma sala cadastrada no momento.</p>
            {userRole === 'ADMIN' && (
              <p className="text-xs mt-1">
                Acesse o <Link href="/admin" className="text-blue-600 font-bold underline">Painel Admin</Link> para cadastrar novas salas.
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