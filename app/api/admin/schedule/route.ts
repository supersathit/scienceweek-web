import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { password, time, event, details, location, date } = data;

    if (!password || password !== process.env.ADMIN_PASS) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const sch = await prisma.schedule.create({
      data: {
        time,
        event,
        details: details || null,
        location: location || "",
        date: date ? new Date(date) : new Date(),
      }
    });

    return NextResponse.json({ success: true, message: 'เพิ่มกำหนดการสำเร็จ', data: sch });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { password, id, time, event, details, location, date } = data;

    if (!password || password !== process.env.ADMIN_PASS) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const sch = await prisma.schedule.update({
      where: { id: parseInt(id) },
      data: {
        time,
        event,
        details: details || null,
        location: location || "",
        date: date ? new Date(date) : undefined,
      }
    });

    return NextResponse.json({ success: true, message: 'อัปเดตกำหนดการสำเร็จ', data: sch });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const password = searchParams.get('password');

    if (!password || password !== process.env.ADMIN_PASS) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!id) return NextResponse.json({ success: false, message: 'Missing ID' }, { status: 400 });

    await prisma.schedule.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ success: true, message: 'ลบกำหนดการสำเร็จ' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
