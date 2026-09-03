# 🏢 Sistema de Reserva de Salas

Sistema web moderno desenvolvido para gerenciamento, agendamento e controle de salas de reunião corporativas, integrado com notificações por e-mail e atalhos para agendamento no Microsoft Outlook.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (React 19 / App Router)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **ORM & Banco de Dados:** [Prisma ORM](https://www.prisma.io/) com PostgreSQL / MySQL
- **Disparo de E-mails:** [Nodemailer](https://nodemailer.com/) (Integração SMTP Microsoft Exchange / Office 365)
- **Estilização:** Tailwind CSS / componentes UI

---

## 📋 Pré-requisitos do Servidor

Antes de iniciar a instalação no servidor de produção/interno, certifique-se de ter os seguintes softwares instalados:

- **Node.js**: Versão `18.x` ou superior (recomendado `20.x LTS`)
- **NPM**: Gerenciador de pacotes (acompanha o Node.js)
- **Banco de Dados**: Instância de PostgreSQL ou MySQL acessível pelo servidor
- **Gerenciador de Processos (Opcional, mas recomendado):** [PM2](https://pm2.keymetrics.io/)

---

## ⚙️ Variáveis de Ambiente (`.env`)

Crie um arquivo `.env` na raiz do projeto dentro do servidor e configure as variáveis de acordo com o ambiente corporativo:

```env
# ==========================================
# ⚡ SUPABASE & BANCO DE DADOS (Prisma)
# ==========================================
NEXT_PUBLIC_SUPABASE_URL="[https://sua-url.supabase.co](https://sua-url.supabase.co)"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sua-chave-publica-supabase"

DATABASE_URL="postgresql://usuario:senha@host:5432/dbname?pgbouncer=true"
DIRECT_URL="postgresql://usuario:senha@host:5432/dbname"

# ==========================================
# 🔐 AUTENTICAÇÃO (NextAuth v5)
# ==========================================
NEXTAUTH_URL="http://localhost:3000"
# Gere uma chave aleatória usando: npx auth secret
AUTH_SECRET="seu_auth_secret_aqui"

# ==========================================
# 🟦 MICROSOFT AZURE ENTRA ID
# ==========================================
AZURE_AD_CLIENT_ID="seu_azure_client_id"
AZURE_AD_CLIENT_SECRET="seu_azure_client_secret"
AZURE_AD_TENANT_ID="common"

# Tenants Específicos das Organizações
AZURE_TENANT_ID_BWT="tenant_id_bwt"
AZURE_TENANT_ID_SERRA_VERDE="tenant_id_serra_verde"

# ==========================================
# 📧 SERVIÇO DE E-MAIL (SMTP)
# ==========================================
SMTP_HOST="smtp.seu-servidor.com"
SMTP_PORT=587
SMTP_USER="seu-email@dominio.com"
SMTP_PASS="sua_senha_smtp"


🚀 Passo a Passo de Instalação e DeploySiga os comandos abaixo dentro da pasta raiz do projeto no servidor:1. Instalar as dependênciasBashnpm install
2. Executar as migrações do Banco de Dados (Prisma)Este comando criará ou atualizará a estrutura de tabelas no banco de dados configurado no .env:Bashnpx prisma migrate deploy
(Opcional) Caso seja a primeira vez e precise gerar os tipos do cliente Prisma:Bashnpx prisma generate
3. Compilar a aplicação (Build de Produção)Bashnpm run build
4. Iniciar a aplicaçãoOpção A: Iniciar diretamente via Node/NPMBashnpm run start
Opção B: Iniciar via PM2 (Recomendado para manter $24/7$ em segundo plano)Bashnpm install -g pm2
pm2 start npm --name "reserva-salas" -- start
pm2 save
📁 Estrutura do ProjetoPlaintextreserva-salas/
├── prisma/             # Schema do banco de dados e arquivos de migração
├── public/             # Arquivos estáticos (imagens, ícones)
├── src/
│   ├── app/            # Rotas e Server Actions do Next.js (App Router)
│   ├── components/     # Componentes React reutilizáveis
│   └── lib/            # Utilitários (Nodemailer, Prisma Client, etc.)
├── .env.example        # Exemplo de variáveis de ambiente
├── next.config.ts      # Configurações do Next.js
└── package.json        # Dependências e scripts do projeto
✉️ Módulo de E-mailsO sistema utiliza o Nodemailer para enviar convites formais de reuniões.Cancelamentos e Confirmações: Enviados no formato HTML corporativo com tratamento contra bloqueios de antispam/throttling.Integração de Agenda: Inclui botões interativos para agendamento direto com $1$ clique no Microsoft Outlook Web / Office 365.🔒 Segurança e ManutençãoNão suba o arquivo .env para repositórios versionados (Git).Certifique-se de que a porta da aplicação (padrão :3000) esteja aberta no firewall interno para a rede corporativa ou configurada atrás de um Proxy Reverso (ex: Nginx / IIS).
