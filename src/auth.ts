import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: "https://login.microsoftonline.com/common/v2.0",
      authorization: {
        params: {
          scope: "openid profile email User.Read",
          prompt: "select_account",
        },
      },
      wellKnown: "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login?error=AccessDenied",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (token.email) {
        const emailLower = token.email.toLowerCase();

        let dbUser = await prisma.user.findUnique({
          where: { email: emailLower },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: emailLower,
              name: (user?.name || token.name) || "Usuário",
              role: "USER",
            },
          });
        }

        // Salva/atualiza o token na tabela Account do banco de forma segura
        if (account && account.access_token) {
          try {
            await prisma.account.upsert({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
              update: {
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
              },
              create: {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
              },
            });
          } catch (dbError) {
            console.error("Erro ao salvar account no banco:", dbError);
          }
        }

        token.role = dbUser.role;
        token.userId = dbUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});