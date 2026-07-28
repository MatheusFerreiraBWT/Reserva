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
      <div className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md flex flex-col justify-between overflow-hidden">
        
        {/* Botão de Apagar (Aparece APENAS no HOVER para ADMIN) */}
        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmModal(true);
            }}
            title="Excluir Sala"
            className="absolute top-3 right-3 z-10 p-2 bg-black/40 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Header com Azul Padrão */}
        <div className="h-24 bg-gradient-to-br from-blue-600 to-indigo-700 p-4 text-white flex flex-col justify-between">
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

          {/* Link para Agendamento */}
          <Link
            href={`/agendar?roomId=${room.id}`}
            className="w-full mt-3 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
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
              Tem certeza que deseja apagar a <strong className="text-slate-700">"Sala {room.name}"</strong>? Esta ação é irreversível.
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
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