'use client';

import { useState } from 'react';
import { updateRoom } from '../app/actions/room-actions';
import { Pencil, X, Loader2 } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
}

export function EditRoomModal({ room }: { room: Room }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const res = await updateRoom(room.id, formData);

    setIsLoading(false);
    if (res?.error) {
      setError(res.error);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Editar Sala"
      >
        <Pencil className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative text-left animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho Alinhado à Esquerda */}
            <div className="text-left mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Editar Sala</h3>
              <p className="text-xs text-slate-500">Altere os detalhes da sala abaixo.</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">
                  Nome da Sala
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={room.name}
                  required
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">
                  Capacidade (Pessoas)
                </label>
                <input
                  type="number"
                  name="capacity"
                  defaultValue={room.capacity}
                  required
                  min={1}
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 text-left">
                  Descrição / Localização
                </label>
                <input
                  type="text"
                  name="description"
                  defaultValue={room.description || ''}
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-800"
                />
              </div>

              {/* Botões Mantidos na Direita */}
              <div className="flex justify-end items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}