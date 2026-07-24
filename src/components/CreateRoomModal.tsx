'use client';

import { useState } from 'react';
import { createRoom } from '../app/actions/room-actions';
import { Plus, X } from 'lucide-react';

export function CreateRoomModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Nova Sala
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-4">Adicionar Nova Sala</h3>

            <form
              action={async (formData) => {
                await createRoom(formData);
                setIsOpen(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nome da Sala</label>
                <input
                  name="name"
                  required
                  placeholder="Ex: Inovação"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Descrição</label>
                <textarea
                  name="description"
                  required
                  rows={2}
                  placeholder="Descrição da sala..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Capacidade de Pessoas</label>
                <input
                  name="capacity"
                  type="number"
                  required
                  min={1}
                  defaultValue={4}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Cadastrar Sala
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}