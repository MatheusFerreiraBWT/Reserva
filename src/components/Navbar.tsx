'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Menu, X } from 'lucide-react';
import { LogoutButton } from '@/components/LogoutButton';

interface NavbarProps {
  userRole?: string;
}

export function Navbar({ userRole }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-[#00A859]/90 via-[#384C83]/90 to-[#6B12B4]/90 backdrop-blur-md border-b border-white/20 px-3 sm:px-6 md:px-8 py-3 flex items-center justify-between text-white shadow-md w-full">
      {/* Logos / Título */}
      <div className="flex items-center gap-1.5 font-bold text-[11px] min-[380px]:text-xs sm:text-sm md:text-base tracking-tight truncate pr-2">
        <span className="text-white drop-shadow-sm whitespace-nowrap">SERRA VERDE EXPRESS</span>
        <span className="text-white/40 font-light">|</span>
        <span className="text-white drop-shadow-sm whitespace-nowrap">BWT OPERADORA</span>
      </div>

      {/* Menu Desktop */}
      <nav className="hidden sm:flex items-center gap-4 md:gap-6 text-sm font-medium">
        <Link
          href="/"
          className={`pb-0.5 drop-shadow-sm transition-colors ${
            pathname === '/'
              ? 'text-white font-bold border-b-2 border-white'
              : 'text-white/80 hover:text-white'
          }`}
        >
          Salas
        </Link>
        <Link
          href="/meus-agendamentos"
          className={`pb-0.5 drop-shadow-sm transition-colors ${
            pathname === '/meus-agendamentos'
              ? 'text-white font-bold border-b-2 border-white'
              : 'text-white/80 hover:text-white'
          }`}
        >
          Meus Agendamentos
        </Link>

        {userRole === 'ADMIN' && (
          <Link
            href="/admin"
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors shadow-sm ${
              pathname === '/admin'
                ? 'bg-yellow-400 text-slate-950 ring-2 ring-white/50'
                : 'bg-[#D4AF37] text-slate-950 hover:bg-yellow-400'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Painel Admin</span>
          </Link>
        )}

        <div className="border-l border-white/20 pl-4 flex items-center">
          <LogoutButton />
        </div>
      </nav>

      {/* Botão Hambúrguer */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="sm:hidden p-1.5 text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0 z-30"
        aria-label="Abrir Menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Dropdown Suspenso Mobile */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-slate-900/95 backdrop-blur-lg border-b border-white/10 p-4 flex flex-col gap-3 sm:hidden shadow-xl z-30">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className={`py-1 transition-colors ${
              pathname === '/'
                ? 'text-white font-bold border-b border-white'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Salas
          </Link>
          <Link
            href="/meus-agendamentos"
            onClick={() => setIsOpen(false)}
            className={`py-1 transition-colors ${
              pathname === '/meus-agendamentos'
                ? 'text-white font-bold border-b border-white'
                : 'text-white/80 hover:text-white'
            }`}
          >
            Meus Agendamentos
          </Link>

          {userRole === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold w-fit my-1 ${
                pathname === '/admin'
                  ? 'bg-yellow-400 text-slate-950 ring-2 ring-white/50'
                  : 'bg-[#D4AF37] text-slate-950'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Painel Admin</span>
            </Link>
          )}

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <LogoutButton />
          </div>
        </div>
      )}
    </header>
  );
}