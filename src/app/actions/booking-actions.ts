'use server';

import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { 
  createOutlookCalendarEvent, 
  sendOutlookEmail, 
  deleteOutlookCalendarEvent 
} from '@/lib/outlook';

export async function createBooking(formData: FormData) {
  try {
    const session: any = await auth();

    if (!session?.user?.id || !session?.user?.email) {
      return { error: 'Você precisa estar logado com um e-mail válido para agendar uma sala.' };
    }

    const roomId = formData.get('roomId') as string;
    const dateStr = formData.get('date') as string;
    const startTimeStr = formData.get('startTime') as string;
    const endTimeStr = formData.get('endTime') as string;
    const attendees = formData.get('attendees') as string;

    if (!roomId || !dateStr || !startTimeStr || !endTimeStr) {
      return { error: 'Preencha todos os campos obrigatórios, incluindo o horário de término.' };
    }

    const startTime = new Date(`${dateStr}T${startTimeStr}:00-03:00`);
    const endTime = new Date(`${dateStr}T${endTimeStr}:00-03:00`);
    const now = new Date();

    if (startTime >= endTime) {
      return { error: 'O horário final deve ser maior que o horário inicial.' };
    }

    if (startTime < now) {
      return { error: 'Não é possível agendar para um horário que já passou.' };
    }

    const existingBooking = await prisma.booking.findFirst({
      where: {
        roomId,
        OR: [
          { startTime: { lte: startTime }, endTime: { gt: startTime } },
          { startTime: { lt: endTime }, endTime: { gte: endTime } },
          { startTime: { gte: startTime }, endTime: { lte: endTime } },
        ],
      },
    });

    if (existingBooking) {
      return { error: 'A sala já possui um agendamento conflitante nesse intervalo de horários.' };
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    // 1. Cria a reserva no banco de dados
    const booking = await prisma.booking.create({
      data: {
        roomId,
        userId: session.user.id,
        startTime,
        endTime,
        attendees: attendees || null,
      },
    });

    // 2. Integração com Outlook
    const userAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'microsoft-entra-id',
      },
    });

    const accessToken = userAccount?.access_token;

    if (accessToken) {
      const formattedDate = dateStr.split('-').reverse().join('/');
      const emailList = attendees 
        ? attendees.split(',').map((e) => e.trim()).filter((e) => e.includes('@'))
        : [];

      // Cria evento no calendário e obtém a resposta de forma tratada
      const result: any = await createOutlookCalendarEvent({
        accessToken,
        roomName: room?.name || 'Reunião',
        dateStr,
        startTimeStr,
        endTimeStr,
        attendeesEmails: emailList,
      }).catch((err) => {
        console.error("Erro ao criar evento no Outlook:", err);
        return null;
      });

      // Pega a string do ID (caso venha string ou como objeto { eventId: ... })
      const eventId = typeof result === 'string' ? result : result?.eventId;

      // Se o evento foi criado no Outlook, vinculamos o ID ao agendamento
      if (eventId) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { outlookEventId: eventId },
        });
      }

      // Envia e-mail de confirmação
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #2563eb; margin-top: 0;">Reserva Confirmada! 🏢</h2>
          <p>Olá,</p>
          <p>Sua reserva para a <strong>Sala ${room?.name}</strong> foi realizada com sucesso.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>ID da Reserva:</strong> ${booking.id}</p>
            <p style="margin: 5px 0;"><strong>Data:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>Horário:</strong> ${startTimeStr} às ${endTimeStr}</p>
            ${attendees ? `<p style="margin: 5px 0;"><strong>Participantes:</strong> ${attendees}</p>` : ''}
          </div>
        </div>
      `;

      sendOutlookEmail({
        accessToken,
        toEmail: session.user.email,
        subject: `Confirmação de Agendamento - Sala ${room?.name}`,
        htmlContent: emailHtml,
      }).catch((err) => console.error("Erro ao enviar e-mail:", err));
    }

    revalidatePath('/meus-agendamentos');
    revalidatePath('/agendar');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao criar agendamento:', error);
    return { error: 'Ocorreu um erro ao realizar o agendamento.' };
  }
}

export async function deleteBooking(bookingId: string) {
  try {
    const session: any = await auth();

    if (!session?.user?.id) {
      return { error: 'Você precisa estar logado para cancelar reservas.' };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { room: true },
    });

    if (!booking) {
      return { error: 'Agendamento não encontrado.' };
    }

    // Busca o token do usuário para notificar e deletar no Outlook
    const userAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'microsoft-entra-id',
      },
    });

    const accessToken = userAccount?.access_token;

    if (accessToken) {
      // 1. Deleta o evento do Calendário do Outlook se houver ID salvo
      if (booking.outlookEventId) {
        await deleteOutlookCalendarEvent({
          accessToken,
          eventId: booking.outlookEventId,
        }).catch((err) => console.error("Erro ao apagar evento no Outlook:", err));
      }

      // 2. Envia e-mail avisando sobre o cancelamento
      const cancelHtml = `
        <div style="font-family: Arial, sans-serif; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #dc2626; margin-top: 0;">Reserva Cancelada ❌</h2>
          <p>Olá,</p>
          <p>O agendamento para a <strong>Sala ${booking.room?.name}</strong> foi cancelado com sucesso.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Data:</strong> ${new Date(booking.startTime).toLocaleDateString('pt-BR')}</p>
            <p style="margin: 5px 0;"><strong>Horário:</strong> ${new Date(booking.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })} às ${new Date(booking.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })}</p>
          </div>
        </div>
      `;

      sendOutlookEmail({
        accessToken,
        toEmail: session.user.email,
        subject: `Cancelamento de Agendamento - Sala ${booking.room?.name}`,
        htmlContent: cancelHtml,
      }).catch((err) => console.error("Erro ao enviar e-mail de cancelamento:", err));
    }

    // 3. Apaga do banco de dados do sistema
    await prisma.booking.delete({
      where: { id: bookingId },
    });

    revalidatePath('/meus-agendamentos');
    revalidatePath('/agendar');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    return { error: 'Não foi possível cancelar o agendamento.' };
  }
}