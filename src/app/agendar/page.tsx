import { prisma } from '../../lib/prisma';
import { BookingForm } from '../../components/BookingForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

async function getData() {
  const rooms = await prisma.room.findMany({
    orderBy: { name: 'asc' },
    include: { bookings: true },
  });
  return rooms;
}

export default async function AgendarPage() {
  const rooms = await getData();

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
      </header>

      <main className="max-w-3xl mx-auto pt-8 px-4">
        {/* Botão Voltar */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00A859] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para as salas
        </Link>

        {/* Título da Página */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Agendar Sala
          </h1>
          <p className="text-xs font-bold text-[#00A859] tracking-wider uppercase mt-1">
            SELECIONE A SALA E O HORÁRIO
          </p>
        </div>

        {/* Formulário Interativo */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
          <BookingForm rooms={rooms} />
        </div>
      </main>
    </div>
  );
}