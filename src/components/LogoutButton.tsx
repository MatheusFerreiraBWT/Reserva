'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-white/90 hover:text-red-300 transition-colors cursor-pointer"
      title="Sair da conta"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>Sair</span>
    </button>
  );
}