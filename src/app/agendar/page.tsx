import { prisma } from '../../lib/prisma';
import { BookingForm } from '../../components/BookingForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/auth';
import { Navbar } from '@/components/Navbar';

async function getData() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;

  const rooms = await prisma.room.findMany({
    orderBy: { name: 'asc' },
    include: { bookings: true },
  });

  return { rooms, userRole };
}

export default async function AgendarPage() {
  const { rooms, userRole } = await getData();

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12 overflow-x-hidden">
      {/* NAVBAR RESPONSIVA COM MENU HAMBÚRGUER */}
      <Navbar userRole={userRole} />

      <main className="max-w-3xl mx-auto pt-6 sm:pt-8 px-4 sm:px-6">
        {/* Botão Voltar */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00A859] mb-4 sm:mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para as salas
        </Link>

        {/* Título da Página */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Agendar Sala
          </h1>
          <p className="text-[10px] sm:text-xs font-bold text-[#00A859] tracking-wider uppercase mt-0.5">
            SELECIONE A SALA E O HORÁRIO
          </p>
        </div>

        {/* Formulário Interativo com Padding Adaptativo */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 md:p-8 shadow-sm">
          <BookingForm rooms={rooms} />
        </div>
      </main>
    </div>
  );
}