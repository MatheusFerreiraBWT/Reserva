'use client';

import Link from 'next/link';
import { Users, Trash2, Calendar } from 'lucide-react';
import { deleteRoom } from '../app/actions/room-actions';

interface RoomProps {
  room: {
    id: string;
    name: string;
    description: string;
    capacity: number;
  };
  isAdmin?: boolean; // Adicionado aqui
}

export function RoomCard({ room, isAdmin = false }: RoomProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Tem certeza que deseja apagar a sala "${room.name}"?`)) {
      await deleteRoom(room.id);
    }
  };

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-between">
      
      {/* Botão de Apagar (Renderizado APENAS se isAdmin for true) */}
      {isAdmin && (
        <button
          onClick={handleDelete}
          title="Excluir Sala"
          className="absolute top-2 right-2 z-10 p-1.5 bg-black/40 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Header com Azul Padrão */}
      <div className="h-24 bg-gradient-to-br from-blue-600 to-indigo-700 p-4 text-white flex flex-col justify-between rounded-t-2xl">
        <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">SALA</span>
        <h3 className="text-xl font-bold leading-tight">{room.name}</h3>
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col justify-between flex-1 min-h-[140px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-800 text-sm">Sala {room.name}</h4>
            <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
              <Users className="w-3 h-3" />
              {room.capacity}
            </span>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2">
            {room.description}
          </p>
        </div>

        {/* Link para a Página Dedicada de Agendamento */}
        <Link
          href={`/agendar?roomId=${room.id}`}
          className="w-full mt-3 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Calendar className="w-3.5 h-3.5" />
          Reservar Sala
        </Link>
      </div>
    </div>
  );
}