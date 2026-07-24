interface CreateOutlookEventProps {
  accessToken: string;
  roomName: string;
  dateStr: string;
  startTimeStr: string;
  endTimeStr: string;
  attendeesEmails: string[];
}

export async function createOutlookCalendarEvent({
  accessToken,
  roomName,
  dateStr,
  startTimeStr,
  endTimeStr,
  attendeesEmails,
}: CreateOutlookEventProps) {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subject: `Reunião: Sala ${roomName}`,
        body: {
          contentType: 'HTML',
          content: `<p>Reunião agendada através do sistema <strong>ReservaSalas</strong>.</p>`,
        },
        start: {
          dateTime: `${dateStr}T${startTimeStr}:00`,
          timeZone: 'E. South America Standard Time', // Fuso horário do Brasil
        },
        end: {
          dateTime: `${dateStr}T${endTimeStr}:00`,
          timeZone: 'E. South America Standard Time',
        },
        location: {
          displayName: `Sala ${roomName}`,
        },
        attendees: attendeesEmails.map((email) => ({
          emailAddress: {
            address: email,
          },
          type: 'required',
        })),
        isOnlineMeeting: true, // Já gera automaticamente o link do Microsoft Teams!
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro na API do Microsoft Graph:', errorData);
      return { success: false, error: 'Erro ao criar evento no Outlook.' };
    }

    const data = await response.json();
    return { success: true, eventId: data.id };
  } catch (error) {
    console.error('Falha ao conectar com o Outlook:', error);
    return { success: false, error: 'Falha ao integrar com o calendário.' };
  }
}
interface SendOutlookEmailProps {
  accessToken: string;
  toEmail: string;
  subject: string;
  htmlContent: string;
}

export async function sendOutlookEmail({
  accessToken,
  toEmail,
  subject,
  htmlContent,
}: SendOutlookEmailProps) {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject: subject,
          body: {
            contentType: 'HTML',
            content: htmlContent,
          },
          toRecipients: [
            {
              emailAddress: {
                address: toEmail,
              },
            },
          ],
        },
        saveToSentItems: 'true',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro ao enviar e-mail via Microsoft Graph:', errorData);
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('Falha ao conectar com o serviço de e-mail da Microsoft:', error);
    return { success: false };
  }
}