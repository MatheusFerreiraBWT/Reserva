import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const userRole = (req.auth?.user as any)?.role;

  // 1. Se NÃO estiver logado e NÃO for a página de login -> Manda para o Login obrigatoriamente
  if (!isLoggedIn && !isLoginPage) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  // 2. Se já estiver logado e tentar acessar o /login -> Manda para a home
  if (isLoggedIn && isLoginPage) {
    return Response.redirect(new URL("/", req.nextUrl));
  }

  // 3. Se tentar acessar rotas de Admin sem ser ADMIN no banco -> Manda para a home
  if (isAdminRoute && userRole !== "ADMIN") {
    return Response.redirect(new URL("/", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};