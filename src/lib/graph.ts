import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';

interface CreateGraphEventProps {
  organizerEmail: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: string[];
}

function getGraphClient(organizerEmail: string) {
  const clientId = process.env.AZURE_AD_CLIENT_ID;
  const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;

  const domain = organizerEmail.split('@')[1]?.toLowerCase();

  // Mapeia o domínio para a variável correspondente do .env
  let tenantId: string | undefined;

  if (domain === 'bwtoperadora.com.br') {
    tenantId = process.env.AZURE_TENANT_ID_BWT;
  } else if (domain === 'serraverdeexpress.com.br') {
    tenantId = process.env.AZURE_TENANT_ID_SERRA_VERDE;
  } else {
    // Fallback caso seja outro domínio
    tenantId = process.env.AZURE_AD_TENANT_ID;
  }

  // Validação: garante que o tenantId existe e não é a string 'common'
  if (!tenantId || tenantId.includes('comm') || !clientId || !clientSecret) {
    console.warn(
      `⚠️ Microsoft Graph API: Tenant ID não configurado ou inválido para o domínio @${domain}. O e-mail SMTP continuará sendo enviado.`
    );
    return null;
  }

  try {
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

    return Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token = await credential.getToken('https://graph.microsoft.com/.default');
          return token.token;
        },
      },
    });
  } catch (err) {
    console.error('❌ Erro ao inicializar credenciais da Azure:', err);
    return null;
  }
}

export async function createCalendarEventViaGraph({
  organizerEmail,
  roomName,
  date,
  startTime,
  endTime,
  attendees,
}: CreateGraphEventProps) {
  const graphClient = getGraphClient(organizerEmail);
  if (!graphClient) return null;

  try {
    const startIso = `${date}T${startTime}:00`;
    const endIso = `${date}T${endTime}:00`;

    const event = {
      subject: `Reserva: ${roomName}`,
      body: {
        contentType: 'HTML',
        content: `Reunião agendada na <b>${roomName}</b> pelo Sistema de Reserva de Salas.`,
      },
      start: {
        dateTime: startIso,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: endIso,
        timeZone: 'America/Sao_Paulo',
      },
      location: {
        displayName: roomName,
      },
      attendees: attendees.map((email) => ({
        emailAddress: {
          address: email,
        },
        type: 'required',
      })),
    };

    const createdEvent = await graphClient
      .api(`/users/${organizerEmail}/events`)
      .post(event);

    console.log('✅ Evento agendado no Calendário via Graph API:', createdEvent.id);
    return createdEvent.id as string;
  } catch (error: any) {
    console.error('❌ ERRO DETALHADO DA GRAPH API:', JSON.stringify(error, null, 2));
    return null;
  }
}

export async function cancelCalendarEventViaGraph(organizerEmail: string, outlookEventId: string) {
  if (!outlookEventId) return;

  const graphClient = getGraphClient(organizerEmail);
  if (!graphClient) return;

  try {
    await graphClient
      .api(`/users/${organizerEmail}/events/${outlookEventId}`)
      .delete();
    console.log('✅ Evento removido do Calendário via Graph API');
  } catch (error: any) {
    console.error('❌ ERRO AO CANCELAR EVENTO VIA GRAPH API:', JSON.stringify(error, null, 2));
  }
}