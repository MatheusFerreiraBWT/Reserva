'use server';

import { prisma } from '../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

/**
 * Helper para validar se o usuário atual é Administrador
 */
async function checkAdminPermission() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;

  if (!session?.user || userRole !== 'ADMIN') {
    throw new Error('Acesso negado. Apenas administradores podem realizar esta ação.');
  }

  return session.user;
}

// 🏢 1. Criar Sala (Restrito a ADMIN)
export async function createRoom(formData: FormData) {
  try {
    await checkAdminPermission();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const capacity = parseInt(formData.get('capacity') as string, 10);

    if (!name || isNaN(capacity)) {
      return { error: 'Preencha o nome e a capacidade corretamente.' };
    }

    await prisma.room.create({
      data: {
        name,
        description,
        capacity,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Erro ao criar a sala.' };
  }
}

// ✏️ 2. Editar Sala (Restrito a ADMIN)
export async function updateRoom(roomId: string, formData: FormData) {
  try {
    await checkAdminPermission();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const capacity = parseInt(formData.get('capacity') as string, 10);

    if (!name || isNaN(capacity)) {
      return { error: 'Preencha os campos corretamente.' };
    }

    await prisma.room.update({
      where: { id: roomId },
      data: {
        name,
        description,
        capacity,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Erro ao atualizar a sala.' };
  }
}

// 🗑️ 3. Deletar Sala (Restrito a ADMIN)
export async function deleteRoom(roomId: string) {
  try {
    await checkAdminPermission();

    await prisma.room.delete({
      where: { id: roomId },
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Erro ao excluir a sala.' };
  }
}

// 📅 4. Criar Agendamento / Reserva (Qualquer Usuário Logado)
export async function createBooking(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: 'Sua sessão expirou. Faça login novamente.' };
    }

    const roomId = formData.get('roomId') as string;
    const startTimeStr = formData.get('startTime') as string;
    const endTimeStr = formData.get('endTime') as string;
    const attendees = formData.get('attendees') as string;

    if (!roomId || !startTimeStr || !endTimeStr) {
      return { error: 'Selecione a sala e os horários corretamente.' };
    }

    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);

    if (startTime >= endTime) {
      return { error: 'O horário final deve ser maior que o horário inicial.' };
    }

    // Salva vinculando o ID do usuário logado vindo do Auth.js
    await prisma.booking.create({
      data: {
        roomId,
        userId: session.user.id,
        startTime,
        endTime,
        attendees,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/meus-agendamentos');
    return { success: true };
  } catch (error: any) {
    return { error: 'Erro ao criar o agendamento.' };
  }
}