import type { Metadata } from "next";
import "./globals.css";

// Configuração do Título e do Favicon da aplicação
export const metadata: Metadata = {
  title: "ReservaSalas - Sistema de Agendamento",
  description: "Gerencie e agende suas salas de reunião de forma simples.",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%232563eb"/><text x="50%" y="55%" font-size="45" font-weight="bold" fill="white" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif">RS</text></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}