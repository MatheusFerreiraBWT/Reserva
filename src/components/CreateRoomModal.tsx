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
        className="flex items-center gap-2 bg-[#00A859] hover:bg-[#008f4c] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Nova Sala</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-4">Adicionar Nova Sala</h3>

            <form
              action={async (formData) => {
                await createRoom(formData);
                setIsOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Nome da Sala
                </label>
                <input
                  name="name"
                  required
                  placeholder="Ex: Inovação"
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A859] focus:ring-1 focus:ring-[#00A859] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Descrição
                </label>
                <textarea
                  name="description"
                  required
                  rows={2}
                  placeholder="Descrição da sala..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A859] focus:ring-1 focus:ring-[#00A859] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Capacidade de Pessoas
                </label>
                <input
                  name="capacity"
                  type="number"
                  required
                  min={1}
                  defaultValue={4}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00A859] focus:ring-1 focus:ring-[#00A859] transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-bold bg-[#00A859] hover:bg-[#008f4c] text-white rounded-xl shadow-sm transition-all cursor-pointer"
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