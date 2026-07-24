import { prisma } from '../../lib/prisma';
import { BookingForm } from '../../components/BookingForm';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-lg">
          <Calendar className="w-6 h-6" />
          <span>ReservaSalas</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto pt-8 px-4">
        {/* Botão Voltar */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        {/* Título da Página */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Agendar Sala
          </h1>
          <p className="text-xs font-bold text-blue-600 tracking-wider uppercase mt-1">
            SELECIONE A SALA E O HORÁRIO
          </p>
        </div>

        {/* Formulário Interativo */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <BookingForm rooms={rooms} />
        </div>
      </main>
    </div>
  );
}