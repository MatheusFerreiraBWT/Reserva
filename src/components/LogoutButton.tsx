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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white hover:text-red-200 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
        title="Encerrar sessão"
      >
        <LogOut className="w-3.5 h-3.5 text-white" />
        <span>Sair</span>
      </button>
    </form>
  );
}