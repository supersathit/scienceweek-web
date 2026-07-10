import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const compId = searchParams.get('compId');
  const password = searchParams.get('password');

  // Basic security check
  if (!password || (password !== process.env.ADMIN_PASS && password !== process.env.TEACHER_PASS)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const filter = compId ? { competitionId: compId } : {};
    const registrations = await prisma.registration.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: registrations });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { password, registrationCode, status, teamName, leaderFullName, leaderClass, contactPhone } = data;

    if (!password || (password !== process.env.ADMIN_PASS && password !== process.env.TEACHER_PASS)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const reg = await prisma.registration.update({
      where: { registrationCode },
      data: {
        status: status || undefined,
        teamName: teamName || undefined,
        leaderFullName: leaderFullName || undefined,
        leaderClass: leaderClass || undefined,
        contactPhone: contactPhone || undefined,
      }
    });

    return NextResponse.json({ success: true, message: 'อัปเดตข้อมูลการสมัครสำเร็จ', data: reg });
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

    // Check submissions before deleting
    const submissions = await prisma.submission.count({ where: { registrationCode: id } });
    if (submissions > 0) {
      return NextResponse.json({ success: false, message: 'ไม่สามารถลบได้เนื่องจากมีผลงานผูกอยู่กับการสมัครนี้' });
    }

    await prisma.registration.delete({ where: { registrationCode: id } });

    return NextResponse.json({ success: true, message: 'ลบข้อมูลการสมัครสำเร็จ' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
