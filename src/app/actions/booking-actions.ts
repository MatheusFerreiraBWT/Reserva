'use server';

import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { sendBookingEmailWithCalendar, sendCancellationEmail } from '@/lib/nodemailer';

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
    const attendeesInput = (formData.get('attendees') as string) || '';

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
        attendees: attendeesInput.trim() || null,
      },
    });

    // 2. Trata e arruma e-mails
    const creatorEmail = String(session.user.email).trim().toLowerCase();
    const creatorName = session.user.name || 'Colaborador';

    const extraEmails = attendeesInput
      ? attendeesInput
          .split(',')
          .map((e) => e.trim().toLowerCase())
          .filter((e) => e.length > 0 && e.includes('@'))
      : [];

    // Garante que o criador esteja sempre na lista e remove duplicados
    const recipients = Array.from(new Set([creatorEmail, ...extraEmails])).filter(
      (email): email is string => Boolean(email && email.includes('@'))
    );

    console.log('📌 Destinatários do agendamento:', recipients);

    // Dispara os emails
    if (recipients.length > 0) {
      try {
        await sendBookingEmailWithCalendar({
          to: recipients,
          roomName: room?.name || 'Reunião',
          date: dateStr,
          startTime: startTimeStr,
          endTime: endTimeStr,
          organizerName: creatorName,
          organizerEmail: creatorEmail,
          bookingId: booking.id,
        });
        console.log('✅ Convite de e-mail/calendário enviado com sucesso!');
      } catch (err) {
        console.error('❌ Erro real de envio:', err);
      }
    } else {
      console.warn('⚠️ Nenhum e-mail válido foi encontrado para disparo.');
    }

    revalidatePath('/meus-agendamentos');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao criar agendamento:', error);
    return { error: 'Ocorreu um erro ao realizar o agendamento.' };
  }
}

export async function deleteBooking(bookingId: string) {
  try {
    const session: any = await auth();

    if (!session?.user?.id || !session?.user?.email) {
      return { error: 'Você precisa estar logado para cancelar reservas.' };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { room: true },
    });

    if (!booking) {
      return { error: 'Agendamento não encontrado.' };
    }

    // 1. Deleta no banco primeiro
    await prisma.booking.delete({
      where: { id: bookingId },
    });

    // 2. Trata e higieniza e-mails dos destinatários do cancelamento
    const creatorEmail = String(session.user.email).trim().toLowerCase();
    const extraEmails = booking.attendees
      ? booking.attendees
          .split(',')
          .map((e) => e.trim().toLowerCase())
          .filter((e) => e.length > 0 && e.includes('@'))
      : [];

    const recipients = Array.from(new Set([creatorEmail, ...extraEmails])).filter(
      (email): email is string => Boolean(email && email.includes('@'))
    );

    const formattedDate = new Date(booking.startTime).toLocaleDateString('pt-BR');
    const startFormatted = new Date(booking.startTime).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    });
    const endFormatted = new Date(booking.endTime).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    });

    // Aviso de cancelamento
    if (recipients.length > 0) {
      try {
        await sendCancellationEmail({
          to: recipients,
          roomName: booking.room?.name || 'Reunião',
          date: formattedDate,
          startTime: startFormatted,
          endTime: endFormatted,
        });
        console.log('✅ E-mail de cancelamento enviado com sucesso!');
      } catch (err) {
        console.error('Erro ao enviar e-mail de cancelamento via SMTP:', err);
      }
    }

    revalidatePath('/meus-agendamentos');
    return { success: true };
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    return { error: 'Não foi possível cancelar o agendamento.' };
  }
}