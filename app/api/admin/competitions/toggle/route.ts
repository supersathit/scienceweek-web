import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { password, id, registerOpen, submissionOpen } = data;

    if (!password || (password !== process.env.ADMIN_PASS && password !== process.env.TEACHER_PASS)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const updateData: any = {};
    if (registerOpen !== undefined) updateData.registerOpen = registerOpen;
    if (submissionOpen !== undefined) updateData.submissionOpen = submissionOpen;

    await prisma.competition.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, message: 'Updated' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
