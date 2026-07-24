import { signIn } from "@/auth";
import { Calendar } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full text-center">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-bold text-slate-900 mb-1">
          ReservaSalas
        </h1>
        <p className="text-xs text-slate-500 mb-6">
          Acesse com sua conta corporativa Microsoft.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("microsoft-entra-id", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs p-3.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            Entrar com a Microsoft
          </button>
        </form>
      </div>
    </div>
  );
}