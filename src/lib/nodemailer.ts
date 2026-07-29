import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || process.env.ALERT_EMAIL_SMTP_HOST;
const port = Number(process.env.SMTP_PORT || process.env.ALERT_EMAIL_SMTP_PORT) || 587;
const user = process.env.SMTP_USER || process.env.ALERT_EMAIL_SMTP_USER;
const pass = process.env.SMTP_PASS || process.env.ALERT_EMAIL_SMTP_PASS;

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: {
    user,
    pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

interface SendBookingEmailProps {
  to: string[];
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  organizerName: string;
  organizerEmail: string;
  bookingId: string;
}

export async function sendBookingEmailWithCalendar({
  to,
  roomName,
  date,
  startTime,
  endTime,
  organizerName,
  organizerEmail,
}: SendBookingEmailProps) {
  // 1. Limpeza e ajuste dos e-mails sem duplicatas
  const validRecipients = Array.from(
    new Set(
      to
        .filter((email) => typeof email === 'string' && email.trim().length > 0 && email.includes('@'))
        .map((email) => email.trim().toLowerCase())
    )
  );

  if (validRecipients.length === 0) {
    console.warn('⚠️ Disparo cancelado: Nenhum destinatário válido.');
    return;
  }

  // 2. Separação de Destinatário Principal (TO) e Cópia (CC)
  const primaryRecipient = validRecipients.includes(organizerEmail.toLowerCase())
    ? organizerEmail.toLowerCase()
    : validRecipients[0];

  const ccRecipients = validRecipients.filter((email) => email !== primaryRecipient);

  const senderEmail = user || 'no-reply@serraverdeexpress.com.br';
  const formattedDate = date.includes('-') ? date.split('-').reverse().join('/') : date;

  await transporter.sendMail({
    from: `"Reserva de Salas" <${senderEmail}>`,
    replyTo: `"${organizerName}" <${organizerEmail}>`,
    to: primaryRecipient, // Destinatário principal
    cc: ccRecipients.length > 0 ? ccRecipients.join(', ') : undefined, // Participantes em cópia
    envelope: {
      from: senderEmail,
      to: validRecipients, // Mantém todos no envelope SMTP para a Microsoft autorizar a entrega
    },
    subject: `Reserva Confirmada: ${roomName} (${startTime} - ${endTime})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-top: 0;">Reserva de Sala Confirmada! 🏢</h2>
        <p style="color: #334155;">Olá,</p>
        <p style="color: #334155;">A reserva da sala foi realizada com sucesso e já está agendada no seu calendário do Outlook/Teams.</p>
        
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <p style="margin: 4px 0; color: #0f172a;"><strong>Organizador:</strong> ${organizerName} (${organizerEmail})</p>
          <p style="margin: 4px 0; color: #0f172a;"><strong>Sala:</strong> ${roomName}</p>
          <p style="margin: 4px 0; color: #0f172a;"><strong>Data:</strong> ${formattedDate}</p>
          <p style="margin: 4px 0; color: #0f172a;"><strong>Horário:</strong> ${startTime} às ${endTime}</p>
        </div>
        
        <p style="color: #64748b; font-size: 13px; margin-top: 24px;">
          Este é um e-mail automático enviado pelo Sistema de Reserva de Salas.
        </p>
      </div>
    `,
  });
}

export async function sendCancellationEmail({
  to,
  roomName,
  date,
  startTime,
  endTime,
}: {
  to: string[];
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  const validRecipients = Array.from(
    new Set(
      to
        .filter((email) => typeof email === 'string' && email.trim().length > 0 && email.includes('@'))
        .map((email) => email.trim().toLowerCase())
    )
  );

  if (validRecipients.length === 0) {
    console.warn('⚠️ Disparo de cancelamento cancelado: Nenhum destinatário válido.');
    return;
  }

  const primaryRecipient = validRecipients[0];
  const ccRecipients = validRecipients.slice(1);
  const senderEmail = user || 'no-reply@serraverdeexpress.com.br';

  await transporter.sendMail({
    from: `"Reserva de Salas" <${senderEmail}>`,
    to: primaryRecipient,
    cc: ccRecipients.length > 0 ? ccRecipients.join(', ') : undefined,
    envelope: {
      from: senderEmail,
      to: validRecipients,
    },
    subject: `Cancelamento de Reserva: Sala ${roomName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #dc2626; margin-top: 0;">Reserva Cancelada ❌</h2>
        <p style="color: #334155;">Olá,</p>
        <p style="color: #334155;">O agendamento para a <strong>Sala ${roomName}</strong> foi cancelado.</p>
        
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p style="margin: 4px 0; color: #0f172a;"><strong>Data:</strong> ${date}</p>
          <p style="margin: 4px 0; color: #0f172a;"><strong>Horário:</strong> ${startTime} às ${endTime}</p>
        </div>
      </div>
    `,
  });
}