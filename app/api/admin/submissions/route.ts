import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const compId = searchParams.get('compId');
  const password = searchParams.get('password');

  if (!password || (password !== process.env.ADMIN_PASS && password !== process.env.TEACHER_PASS)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const filter = compId ? { competitionId: compId } : {};
    const submissions = await prisma.submission.findMany({
      where: filter,
      orderBy: { submittedAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: submissions });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { password, submissionId, status, workTitle, workDescription } = data;

    if (!password || (password !== process.env.ADMIN_PASS && password !== process.env.TEACHER_PASS)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const sub = await prisma.submission.update({
      where: { submissionId },
      data: {
        status: status || undefined,
        workTitle: workTitle || undefined,
        workDescription: workDescription || undefined,
      }
    });

    return NextResponse.json({ success: true, message: 'อัปเดตข้อมูลผลงานสำเร็จ', data: sub });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const password = searchParams.get('password');

    if (!password || (password !== process.env.ADMIN_PASS && password !== process.env.TEACHER_PASS)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!id) return NextResponse.json({ success: false, message: 'Missing ID' }, { status: 400 });

    await prisma.submission.delete({ where: { submissionId: id } });

    return NextResponse.json({ success: true, message: 'ลบผลงานสำเร็จ' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
