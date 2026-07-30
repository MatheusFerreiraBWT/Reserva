'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Users, Trash2, Calendar, AlertTriangle, Loader2 } from 'lucide-react';
import { deleteRoom } from '../app/actions/room-actions';

interface RoomProps {
  room: {
    id: string;
    name: string;
    description: string;
    capacity: number;
  };
  isAdmin?: boolean;
}

export function RoomCard({ room, isAdmin = false }: RoomProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteRoom(room.id);
      setShowConfirmModal(false);
    });
  };

  return (
    <>
      <div className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#00A859]/50 flex flex-col justify-between overflow-hidden">
        
        {/* Botão de Apagar (Aparece APENAS no HOVER para ADMIN) */}
        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmModal(true);
            }}
            title="Excluir Sala"
            className="absolute top-3 right-3 z-10 p-2 bg-slate-100 hover:bg-red-600 hover:text-white text-slate-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Topo do Card Limpo e Claro */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-col justify-between">
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1 block">
            Espaço de Reunião
          </span>
          <h3 className="text-lg font-bold text-slate-900 leading-tight">
            {room.name.toLowerCase().startsWith('sala') ? room.name : `Sala ${room.name}`}
          </h3>
        </div>

        {/* Conteúdo do Card */}
        <div className="p-4 flex flex-col justify-between flex-1 min-h-[120px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full font-medium border border-slate-200/60">
                <Users className="w-3.5 h-3.5 text-[#00A859]" />
                {room.capacity} pessoas
              </span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {room.description || 'Ambiente preparado para reuniões presenciais e chamadas de vídeo.'}
            </p>
          </div>

          {/* Botão de Agendamento Limpo em Verde */}
          <Link
            href={`/agendar?roomId=${room.id}`}
            className="w-full mt-4 bg-[#00A859] hover:bg-[#008f4c] text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            Reservar Sala
          </Link>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO ESTILIZADO */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center flex flex-col items-center">
            
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Excluir Sala
            </h3>
            
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Tem certeza que deseja apagar a <strong className="text-slate-700">"{room.name}"</strong>? Esta ação é irreversível.
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Apagando...
                  </>
                ) : (
                  'Sim, apagar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}