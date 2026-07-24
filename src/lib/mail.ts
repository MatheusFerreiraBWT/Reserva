import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendBookingEmailProps {
  toEmail: string;
  userName: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees?: string | null;
}

export async function sendBookingConfirmationEmail({
  toEmail,
  userName,
  roomName,
  date,
  startTime,
  endTime,
  attendees,
}: SendBookingEmailProps) {
  try {
    // Se estiver usando o modo de testes gratuito do Resend, o "from" costuma ser "onboarding@resend.dev"
    // Depois que você validar seu domínio, pode colocar "nao-responde@seusite.com"
    const data = await resend.emails.send({
      from: 'ReservaSalas <onboarding@resend.dev>',
      to: [toEmail],
      subject: `Confirmação de Agendamento - Sala ${roomName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #2563eb; margin-top: 0;">Reserva Confirmada! 🏢</h2>
          <p>Olá, <strong>${userName}</strong>,</p>
          <p>Sua reserva de sala de reunião foi realizada com sucesso.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Sala:</strong> Sala ${roomName}</p>
            <p style="margin: 5px 0;"><strong>Data:</strong> ${date.split('-').reverse().join('/')}</p>
            <p style="margin: 5px 0;"><strong>Horário:</strong> ${startTime} às ${endTime}</p>
            ${attendees ? `<p style="margin: 5px 0;"><strong>Participantes:</strong> ${attendees}</p>` : ''}
          </div>

          <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
            Este é um e-mail automático do sistema ReservaSalas. Por favor, não responda.
          </p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return { error: 'Falha ao enviar e-mail de confirmação.' };
  }
}