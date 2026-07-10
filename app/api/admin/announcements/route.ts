import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { password, title, content, published, date } = data;

    if (!password || password !== process.env.ADMIN_PASS) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const ann = await prisma.announcement.create({
      data: {
        title,
        content: content || "",
        published: published || true,
        date: date ? new Date(date) : new Date(),
      }
    });

    return NextResponse.json({ success: true, message: 'เพิ่มข่าวประกาศสำเร็จ', data: ann });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { password, id, title, content, published, date } = data;

    if (!password || password !== process.env.ADMIN_PASS) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const ann = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content: content || "",
        published: published !== undefined ? published : true,
        date: date ? new Date(date) : undefined,
      }
    });

    return NextResponse.json({ success: true, message: 'อัปเดตข่าวประกาศสำเร็จ', data: ann });
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

    await prisma.announcement.delete({ where: { id: parseInt(id) } });

    return NextResponse.json({ success: true, message: 'ลบข่าวประกาศสำเร็จ' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
