import { signOut } from "@/auth";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        title="Encerrar sessão"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Sair</span>
      </button>
    </form>
  );
}